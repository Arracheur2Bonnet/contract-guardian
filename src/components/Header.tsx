import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="md" />
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/analyze">
            <Button variant="default" size="sm">
              Analyser un contrat
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
