import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isAnalyzePage = location.pathname === "/analyze";

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        
        {!isAnalyzePage && (
          <Link to="/analyze">
            <Button className="gap-2 rounded-full px-5 gradient-primary border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <FileText size={16} />
              <span className="hidden sm:inline">Analyser un contrat</span>
              <span className="sm:hidden">Analyser</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;