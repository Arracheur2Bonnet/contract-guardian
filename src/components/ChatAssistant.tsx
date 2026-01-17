import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2, 
  Scale, 
  Lightbulb, 
  HelpCircle,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { askQuestion, getNegotiationAdvice, getLegalExpertise } from "@/services/featherlessApi";
import { RedFlag } from "@/types/analysis";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatAssistantProps {
  contractText: string;
  redFlags?: RedFlag[];
}

type TabType = "questions" | "negocier" | "expertise";

const suggestedQuestions = [
  "Quelles clauses puis-je négocier ?",
  "Quels sont mes droits ?",
  "Ce contrat est-il légal ?"
];

const ChatAssistant = ({ contractText, redFlags = [] }: ChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("questions");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await askQuestion(message, contractText);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        role: "assistant", 
        content: "Désolé, une erreur s'est produite. Veuillez réessayer." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    
    if (tab === "negocier" && !isLoading) {
      setIsLoading(true);
      setMessages([]);
      try {
        const response = await getNegotiationAdvice(contractText, redFlags);
        const assistantMessage: Message = { role: "assistant", content: response };
        setMessages([assistantMessage]);
      } catch (error) {
        const errorMessage: Message = { 
          role: "assistant", 
          content: "Désolé, une erreur s'est produite lors de l'analyse de négociation." 
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else if (tab === "expertise" && !isLoading) {
      setIsLoading(true);
      setMessages([]);
      try {
        const response = await getLegalExpertise(contractText, redFlags);
        const assistantMessage: Message = { role: "assistant", content: response };
        setMessages([assistantMessage]);
      } catch (error) {
        const errorMessage: Message = { 
          role: "assistant", 
          content: "Désolé, une erreur s'est produite lors de l'expertise juridique." 
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else if (tab === "questions") {
      setMessages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] shadow-2xl z-50 flex flex-col overflow-hidden"
      style={{ height: isMinimized ? "auto" : "600px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          <h3 className="font-semibold">Assistant Juridique</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => handleTabChange("questions")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "questions"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              Questions
            </button>
            <button
              onClick={() => handleTabChange("negocier")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "negocier"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              Négocier
            </button>
            <button
              onClick={() => handleTabChange("expertise")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "expertise"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Scale className="h-4 w-4" />
              Expertise
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && activeTab === "questions" && !isLoading && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Questions suggérées :
                </p>
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleSendMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}

            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          {activeTab === "questions" && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ChatAssistant;
