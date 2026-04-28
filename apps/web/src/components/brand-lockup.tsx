type BrandLockupProps = {
  href: string;
  eyebrow?: string;
};

export function BrandLockup({ href }: BrandLockupProps) {
  return (
    <a href={href} className="brand-lockup">
      <span className="brand-lockup__title">Avangarda</span>
      <span className="brand-lockup__slogan">Human Rights Raw and Real</span>
    </a>
  );
}
