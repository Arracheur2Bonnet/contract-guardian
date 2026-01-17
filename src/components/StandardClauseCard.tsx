import { CheckCircle } from "lucide-react";

interface StandardClause {
  titre: string;
  description: string;
}

interface StandardClauseCardProps {
  clause: StandardClause;
}

const StandardClauseCard = ({ clause }: StandardClauseCardProps) => {
  return (
    <div className="card-minimal border border-success/20 bg-success/5 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="text-success mt-0.5" size={18} />
        <div>
          <h4 className="font-medium text-sm mb-1">{clause.titre}</h4>
          <p className="text-sm text-muted-foreground">{clause.description}</p>
        </div>
      </div>
    </div>
  );
};

export default StandardClauseCard;
