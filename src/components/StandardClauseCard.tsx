import { CheckCircle, Shield } from "lucide-react";

interface StandardClause {
  titre: string;
  description: string;
}

interface StandardClauseCardProps {
  clause: StandardClause;
}

const StandardClauseCard = ({ clause }: StandardClauseCardProps) => {
  return (
    <div className="group border border-success/20 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-success/10">
          <CheckCircle className="text-success" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-2">{clause.titre}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{clause.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-success/10">
        <Shield size={14} className="text-success" />
        <span className="text-xs text-success font-medium">Clause conforme</span>
      </div>
    </div>
  );
};

export default StandardClauseCard;