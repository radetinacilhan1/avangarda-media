export type SignalExternalProviderKey =
  | "world-bank"
  | "eurostat"
  | "undp"
  | "unhcr"
  | "who"
  | "ilo"
  | "freedom-house"
  | "reporters-without-borders"
  | "amnesty-hrw"
  | "local-public-data";

export type SignalExternalProvider = {
  key: SignalExternalProviderKey;
  label: string;
  apiBase?: string;
  notes: string;
  topics: string[];
};

export const signalExternalProviders: SignalExternalProvider[] = [
  {
    key: "world-bank",
    label: "World Bank",
    apiBase: "https://api.worldbank.org/v2",
    notes: "Makro indikatori, siromaštvo, rad, energija i razvojni trendovi.",
    topics: ["radnička prava", "ekologija", "demokratija", "Balkan", "Evropa"]
  },
  {
    key: "eurostat",
    label: "Eurostat",
    apiBase: "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0",
    notes: "Evropski socijalni, radni, energetski i demografski indikatori.",
    topics: ["radnička prava", "migracije", "manjine", "Evropa"]
  },
  {
    key: "undp",
    label: "UNDP",
    apiBase: "https://api.undp.org",
    notes: "Ljudski razvoj, nejednakost, otpornost zajednica i institucionalni kontekst.",
    topics: ["ljudska prava", "demokratija", "psihologija i društvo", "Balkan", "svet"]
  },
  {
    key: "unhcr",
    label: "UNHCR",
    apiBase: "https://api.unhcr.org",
    notes: "Raseljenost, azil, izbeglištvo i regionalni tokovi migracija.",
    topics: ["migracije", "manjine", "ljudska prava", "Evropa", "svet"]
  },
  {
    key: "who",
    label: "WHO",
    apiBase: "https://ghoapi.azureedge.net/api",
    notes: "Javno zdravlje, kvalitet vazduha, mentalno zdravlje i zdravstvena infrastruktura.",
    topics: ["ekologija", "psihologija i društvo", "nasilje", "svet"]
  },
  {
    key: "ilo",
    label: "ILO",
    apiBase: "https://api.ilo.org",
    notes: "Radni uslovi, neformalni rad, sigurnost rada i socijalna zaštita.",
    topics: ["radnička prava", "demokratija", "Balkan", "svet"]
  },
  {
    key: "freedom-house",
    label: "Freedom House",
    notes: "Demokratija, građanske slobode i institucionalna erozija.",
    topics: ["demokratija", "sloboda medija", "ljudska prava", "Evropa", "svet"]
  },
  {
    key: "reporters-without-borders",
    label: "Reporters Without Borders",
    notes: "Sloboda medija, bezbednost novinara i pritisci na javni govor.",
    topics: ["sloboda medija", "ljudska prava", "Balkan", "svet"]
  },
  {
    key: "amnesty-hrw",
    label: "Amnesty / HRW",
    notes: "Dokumentacija o ljudskim pravima, nasilju, diskriminaciji i državnoj odgovornosti.",
    topics: ["ljudska prava", "manjine", "nasilje", "svet"]
  },
  {
    key: "local-public-data",
    label: "Lokalne javne baze",
    notes: "Otvoreni podaci lokalnih institucija, zavoda i javnih registara.",
    topics: ["ekologija", "radnička prava", "Balkan", "demokratija"]
  }
];

