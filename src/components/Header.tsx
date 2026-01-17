import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="glass border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="transition-transform hover:scale-105">
          <Logo size="md" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/analyze">
            <Button className="gap-2 rounded-full px-6 shadow-md hover:shadow-lg transition-all">
              <FileText size={18} />
              Analyser un contrat
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;