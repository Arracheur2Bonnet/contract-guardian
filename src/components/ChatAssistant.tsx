import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2,
  ChevronUp,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { askQuestion } from "@/services/featherlessApi";
import logoImage from "@/assets/logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatAssistantProps {
  contractText: string;
}

const suggestedQuestions = [
  "Quels sont les délais de préavis ?",
  "La clause de résiliation est-elle équilibrée ?",
  "Quelles sont mes obligations principales ?",
  "Y a-t-il des pénalités prévues ?",
  "Quels points dois-je négocier ?"
];

const ChatAssistant = ({ contractText }: ChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await askQuestion(message, contractText);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        role: "assistant", 
        content: "Désolé, une erreur s'est produite. Veuillez réessayer." 
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
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
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse animation ring */}
        <div className="absolute inset-0 rounded-2xl gradient-primary animate-ping opacity-30" />
        <div className="absolute -inset-1 rounded-2xl gradient-primary opacity-20 blur-md" />
        
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-16 w-16 rounded-2xl shadow-2xl gradient-primary border-0 hover:scale-110 transition-all duration-300 group"
          size="icon"
        >
          <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
          
          {/* Badge notification */}
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
            ?
          </span>
        </Button>
        
        {/* Floating label */}
        <div className="absolute -left-28 top-1/2 -translate-y-1/2 bg-card border border-border/50 rounded-xl px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="text-xs font-medium text-foreground whitespace-nowrap">Posez vos questions</p>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-card border-r border-t border-border/50 rotate-45" />
        </div>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[520px] shadow-2xl z-50 flex flex-col overflow-hidden rounded-3xl border-border/50"
      style={{ height: isMinimized ? "auto" : "75vh", maxHeight: "800px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 gradient-primary text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
            <img src={logoImage} alt="Contr'Act" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h3 className="font-semibold">Assistant Contr'Act</h3>
            <p className="text-xs text-white/70">Posez vos questions</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/20 rounded-xl"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/20 rounded-xl"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && !isLoading && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Je suis votre assistant juridique IA. Posez-moi vos questions sur ce contrat.
                  </p>
                </div>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-border/50 hover:bg-accent hover:border-primary/30 transition-all"
                      onClick={() => handleSendMessage(question)}
                    >
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Analyse en cours...</p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "gradient-primary text-white rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-p:leading-relaxed prose-ul:my-3 prose-ul:space-y-2 prose-ol:my-3 prose-li:my-1 prose-headings:my-4 prose-headings:font-semibold prose-hr:my-3 prose-hr:border-border/30 prose-strong:text-primary prose-strong:font-semibold">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Réflexion...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/50 bg-card">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1 rounded-xl border-border/50 bg-muted/50 focus:bg-background"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="rounded-xl gradient-primary border-0 h-10 w-10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default ChatAssistant;