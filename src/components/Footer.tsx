import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground text-center md:text-right max-w-lg">
            Contr'Act est un outil d'analyse automatisée à but informatif. Il ne remplace pas les conseils d'un professionnel du droit. Pour toute décision juridique, consultez un avocat.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
