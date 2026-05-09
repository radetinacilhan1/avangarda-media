const mojibakeReplacements: Array<[string, string]> = [
  ["Å¡", "š"],
  ["Å ", "Š"],
  ["Å¾", "ž"],
  ["Å½", "Ž"],
  ["Ä", "č"],
  ["ÄŒ", "Č"],
  ["Ä‡", "ć"],
  ["Ä†", "Ć"],
  ["Ä‘", "đ"],
  ["Ä", "Đ"],
  ["Ã…Â¡", "š"],
  ["Ã…Â ", "Š"],
  ["Ã…Â¾", "ž"],
  ["Ã…Â½", "Ž"],
  ["Ã„Â", "č"],
  ["Ã„Å’", "Č"],
  ["Ã„â€¡", "ć"],
  ["Ã„â€ ", "Ć"],
  ["Ã„â€˜", "đ"],
  ["Ã„Â", "Đ"],
  ["Ã¢â‚¬Å“", "“"],
  ["Ã¢â‚¬Â", "”"],
  ["Ã¢â‚¬Å¾", "„"],
  ["Ã¢â‚¬â„¢", "’"],
  ["Ã¢â‚¬â€œ", "–"],
  ["Ã¢â‚¬â€", "—"]
];

const wordReplacements: Array<[string, string]> = [
  ["drustvo", "društvo"],
  ["drustva", "društva"],
  ["drustvena", "društvena"],
  ["drustvene", "društvene"],
  ["drustveni", "društveni"],
  ["drustvenih", "društvenih"],
  ["drustvenim", "društvenim"],
  ["drustvenog", "društvenog"],
  ["drustveno", "društveno"],
  ["prica", "priča"],
  ["price", "priče"],
  ["pricu", "priču"],
  ["prici", "priči"],
  ["pricom", "pričom"],
  ["pricama", "pričama"],
  ["cita", "čita"],
  ["citanje", "čitanje"],
  ["citanja", "čitanja"],
  ["citaocu", "čitaocu"],
  ["citaoca", "čitaoca"],
  ["citati", "čitati"],
  ["citamo", "čitamo"],
  ["citaj", "čitaj"],
  ["citljiva", "čitljiva"],
  ["citljive", "čitljive"],
  ["citljivi", "čitljivi"],
  ["citljivo", "čitljivo"],
  ["cim", "čim"],
  ["cekanje", "čekanje"],
  ["ceka", "čeka"],
  ["cekaju", "čekaju"],
  ["istrazuje", "istražuje"],
  ["istrazivanje", "istraživanje"],
  ["istrazivanja", "istraživanja"],
  ["istrazivacka", "istraživačka"],
  ["istrazivacke", "istraživačke"],
  ["istrazivacki", "istraživački"],
  ["istrazivackog", "istraživačkog"],
  ["istrazivackom", "istraživačkom"],
  ["istrazivacku", "istraživačku"],
  ["urednicka", "urednička"],
  ["urednicke", "uredničke"],
  ["urednicki", "urednički"],
  ["urednickih", "uredničkih"],
  ["urednickim", "uredničkim"],
  ["urednickog", "uredničkog"],
  ["urednickom", "uredničkom"],
  ["urednicku", "uredničku"],
  ["urednistvo", "uredništvo"],
  ["uredjuje", "uređuje"],
  ["uredjivacka", "uređivačka"],
  ["uredjivacke", "uređivačke"],
  ["uredjivacki", "uređivački"],
  ["uredjivackog", "uređivačkog"],
  ["uredjivackom", "uređivačkom"],
  ["secanje", "sećanje"],
  ["secanja", "sećanja"],
  ["tisina", "tišina"],
  ["tisine", "tišine"],
  ["zivot", "život"],
  ["zivota", "života"],
  ["zivotu", "životu"],
  ["zive", "žive"],
  ["zivi", "živi"],
  ["ziveo", "živeo"],
  ["zele", "žele"],
  ["zeli", "želi"],
  ["zelis", "želiš"],
  ["zasto", "zašto"],
  ["zasluzuje", "zaslužuje"],
  ["moze", "može"],
  ["moguce", "moguće"],
  ["trazi", "traži"],
  ["traze", "traže"],
  ["vazi", "važi"],
  ["vazan", "važan"],
  ["vazna", "važna"],
  ["vazne", "važne"],
  ["vazni", "važni"],
  ["vazno", "važno"],
  ["vise", "više"],
  ["vec", "već"],
  ["jos", "još"],
  ["duze", "duže"],
  ["ostanes", "ostaneš"],
  ["usao", "ušao"],
  ["izasao", "izašao"],
  ["dosao", "došao"],
  ["vraca", "vraća"],
  ["cuva", "čuva"],
  ["cuvaju", "čuvaju"],
  ["cuvati", "čuvati"],
  ["cuje", "čuje"],
  ["cujemo", "čujemo"],
  ["sta", "šta"],
  ["sto", "što"],
  ["desava", "dešava"],
  ["pogadja", "pogađa"],
  ["znaci", "znači"],
  ["uopste", "uopšte"],
  ["sledeca", "sledeća"],
  ["sledece", "sledeće"],
  ["sledeceg", "sledećeg"],
  ["sledeci", "sledeći"],
  ["sledecoj", "sledećoj"],
  ["jaci", "jači"],
  ["jaca", "jača"],
  ["jace", "jače"],
  ["veci", "veći"],
  ["veca", "veća"],
  ["vece", "veće"],
  ["bice", "biće"],
  ["nece", "neće"],
  ["ce", "će"],
  ["cu", "ću"],
  ["ces", "ćeš"],
  ["cemo", "ćemo"],
  ["radnicka", "radnička"],
  ["radnicke", "radničke"],
  ["radnicki", "radnički"],
  ["radnickih", "radničkih"],
  ["radnickog", "radničkog"],
  ["zivotna sredina", "životna sredina"],
  ["sloboda medija i drustvo", "sloboda medija i društvo"],
  ["psihologija i drustvo", "psihologija i društvo"],
  ["ekologija i drustvo", "ekologija i društvo"],
  ["Milos", "Miloš"],
  ["Ilic", "Ilić"],
  ["Markovic", "Marković"],
  ["Vukovic", "Vuković"],
  ["Pavlovic", "Pavlović"],
  ["Jovanovic", "Jovanović"],
  ["Hadzic", "Hadžić"],
  ["Nis", "Niš"],
  ["Milojkovica", "Milojkovića"],
  ["izvestaj", "izveštaj"],
  ["izvestaja", "izveštaja"],
  ["izvestaje", "izveštaje"],
  ["udruzenje", "udruženje"],
  ["udruzenja", "udruženja"],
  ["izdavac", "izdavač"],
  ["izdavaca", "izdavača"],
  ["izdavacu", "izdavaču"],
  ["sediste", "sedište"],
  ["maticni", "matični"],
  ["politicki", "politički"],
  ["politickih", "političkih"],
  ["sadrzaj", "sadržaj"],
  ["sadrzaja", "sadržaja"],
  ["sadrzaje", "sadržaje"],
  ["sadrzaji", "sadržaji"],
  ["koriscenja", "korišćenja"],
  ["ukljucujuci", "uključujući"],
  ["prenosenje", "prenošenje"],
  ["prosireni", "prošireni"],
  ["nasumicne", "nasumične"],
  ["zastite", "zaštite"],
  ["zasticeni", "zaštićeni"],
  ["zadrzava", "zadržava"],
  ["drugacije", "drugačije"],
  ["drugaciji", "drugačiji"],
  ["tacka", "tačka"],
  ["tacke", "tačke"],
  ["naznaceno", "naznačeno"],
  ["navodjenje", "navođenje"],
  ["tehnicki", "tehnički"],
  ["izricito", "izričito"],
  ["izrazavaju", "izražavaju"],
  ["zastitom", "zaštitom"],
  ["pise", "piše"],
  ["salje", "šalje"],
  ["posalji", "pošalji"],
  ["procitaj", "pročitaj"],
  ["reportaze", "reportaže"],
  ["paznje", "pažnje"],
  ["ocitavanje", "očitavanje"],
  ["ucitavanje", "učitavanje"],
  ["azurirano", "ažurirano"],
  ["drzava", "država"],
  ["drzave", "države"],
  ["siri", "širi"],
  ["siru", "širu"],
  ["drze", "drže"],
  ["izmedju", "između"],
  ["dodje", "dođe"],
  ["dodas", "dodaš"],
  ["imas", "imaš"],
  ["otvoris", "otvoriš"],
  ["podelis", "podeliš"],
  ["najbrzi", "najbrži"],
  ["najcesce", "najčešće"],
  ["autorska", "autorska"],
  ["autorske", "autorske"],
  ["autorski", "autorski"],
  ["dokumentarno", "dokumentarno"],
  ["dokumentarna", "dokumentarna"],
  ["dokumentarne", "dokumentarne"],
  ["dokumentarni", "dokumentarni"],
  ["funkcionise", "funkcioniše"],
  ["svedocenja", "svedočenja"],
  ["buducnost", "budućnost"],
  ["tudju", "tuđu"],
  ["medjusobne", "međusobne"],
  ["recenica", "rečenica"],
  ["reci", "reči"],
  ["necega", "nečega"]
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWordCase(value: string, from: string, to: string) {
  const variants: Array<[string, string]> = [
    [from, to],
    [from.charAt(0).toUpperCase() + from.slice(1), to.charAt(0).toUpperCase() + to.slice(1)],
    [from.toUpperCase(), to.toUpperCase()]
  ];

  return variants.reduce((accumulator, [variantFrom, variantTo]) => {
    const regex = new RegExp(`\\b${escapeRegExp(variantFrom)}\\b`, "g");
    return accumulator.replace(regex, variantTo);
  }, value);
}

export function normalizeSerbianLatin(value: string) {
  if (/^(https?:\/\/|mailto:|\/)/i.test(value.trim())) {
    return value;
  }

  let normalized = value;

  for (const [from, to] of mojibakeReplacements) {
    normalized = normalized.split(from).join(to);
  }

  for (const [from, to] of wordReplacements) {
    normalized = replaceWordCase(normalized, from, to);
  }

  return normalized;
}

export function normalizeSerbianLatinDeep<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeSerbianLatin(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeSerbianLatinDeep(entry)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeSerbianLatinDeep(entry)])
    ) as T;
  }

  return value;
}
