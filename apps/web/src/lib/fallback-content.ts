import { normalizeSectionSlug } from "@/lib/sections";

type RelationCollection<T> = {
  data: T[];
};

type RelationSingle<T> = {
  data: T;
};

type FallbackMedia = {
  url?: string;
  formats?: {
    large?: { url?: string };
    medium?: { url?: string };
    small?: { url?: string };
    thumbnail?: { url?: string };
  };
};

type FallbackSocial = {
  platform: string;
  url: string;
};

export type FallbackAuthor = {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  bio_en?: string;
  bio_tr?: string;
  bio_fr?: string;
  bio_de?: string;
  email?: string;
  socials?: FallbackSocial[];
  photo?: FallbackMedia;
};

export type FallbackTopic = {
  id: number;
  name: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  slug: string;
};

export type FallbackLocation = {
  id: number;
  name: string;
  slug: string;
};

type EditorialControl = {
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  priority?: number;
};

export type FallbackArticle = {
  id: number;
  title: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  content: string;
  content_en?: string;
  content_tr?: string;
  content_fr?: string;
  content_de?: string;
  slug: string;
  section: "front" | "analysis" | "interview" | "column";
  publishedAt: string;
  year?: number;
  focus?: string;
  style?: string;
  signalText?: string;
  signalText_en?: string;
  signalText_tr?: string;
  signalText_fr?: string;
  signalText_de?: string;
  editorNote?: string;
  videoEmbedUrl?: string;
  viewCount?: number;
  authors?: RelationCollection<FallbackAuthor>;
  topics?: RelationCollection<FallbackTopic>;
  locations?: RelationCollection<FallbackLocation>;
  cover?: FallbackMedia;
  editorialControl?: EditorialControl;
};

type FallbackHomepageSidebarItem = {
  id?: number;
  title?: string;
  shortDescription?: string;
  link?: string;
  image?: unknown;
};

type FallbackHomepageEditorialCard = {
  label?: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  text?: string;
  text_en?: string;
  text_tr?: string;
  text_fr?: string;
  text_de?: string;
  ctaLabel?: string;
  ctaLabel_en?: string;
  ctaLabel_tr?: string;
  ctaLabel_fr?: string;
  ctaLabel_de?: string;
  ctaHref?: string;
};

export type FallbackHomepageConfig = {
  currentItems?: FallbackHomepageSidebarItem[];
  editorialCards?: FallbackHomepageEditorialCard[];
};

export type FallbackDailyQuestion = {
  id: number;
  label: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
  question: string;
  question_en?: string;
  question_tr?: string;
  question_fr?: string;
  question_de?: string;
  answerA: string;
  answerA_en?: string;
  answerA_tr?: string;
  answerA_fr?: string;
  answerA_de?: string;
  answerB: string;
  answerB_en?: string;
  answerB_tr?: string;
  answerB_fr?: string;
  answerB_de?: string;
  votesA?: number;
  votesB?: number;
  voteRound?: number;
  totalVotes?: number;
  percentA?: number;
  percentB?: number;
  isActive?: boolean;
  ctaLabel?: string;
  ctaLabel_en?: string;
  ctaLabel_tr?: string;
  ctaLabel_fr?: string;
  ctaLabel_de?: string;
  author?: string;
  source?: string;
  linkedArticle?: RelationSingle<FallbackArticle>;
};

export type FallbackEditorialSignal = {
  label: string;
  label_en?: string;
  label_tr?: string;
  label_fr?: string;
  label_de?: string;
  text: string;
  text_en?: string;
  text_tr?: string;
  text_fr?: string;
  text_de?: string;
  author?: string;
  author_en?: string;
  author_tr?: string;
  author_fr?: string;
  author_de?: string;
  type?: "quote" | "statement" | "question" | "manifesto";
  source?: string;
  source_en?: string;
  source_tr?: string;
  source_fr?: string;
  source_de?: string;
  ctaLabel?: string;
  ctaLabel_en?: string;
  ctaLabel_tr?: string;
  ctaLabel_fr?: string;
  ctaLabel_de?: string;
  isActive?: boolean;
  priority?: number;
  backgroundMode?: "yellow" | "dark" | "outline";
  linkedArticle?: RelationSingle<FallbackArticle>;
};

export type FallbackImpactMetrics = {
  articlesCount: number;
  topicsCount: number;
  authorsCount: number;
  recentArticlesCount: number;
};

function collection<T>(items: T[]): RelationCollection<T> {
  return { data: items };
}

function single<T>(item: T): RelationSingle<T> {
  return { data: item };
}

const fallbackTopicsBase: FallbackTopic[] = [
  { id: 1, name: "Drustvo", name_en: "Society", slug: "drustvo" },
  { id: 2, name: "Ekologija", name_en: "Ecology", slug: "ekologija" },
  { id: 3, name: "Politika", name_en: "Politics", slug: "politika" },
  { id: 4, name: "Kultura", name_en: "Culture", slug: "kultura" },
  { id: 5, name: "Psihologija", name_en: "Psychology", slug: "psihologija" },
  { id: 6, name: "Rad i ekonomija", name_en: "Work and Economy", slug: "rad-i-ekonomija" },
  { id: 7, name: "Secanje i istorija", name_en: "Memory and History", slug: "secanje-i-istorija" },
  { id: 8, name: "Margine", name_en: "Margins", slug: "margine" },
  { id: 9, name: "Ljudska prava", name_en: "Human Rights", slug: "ljudska-prava" },
  { id: 10, name: "Palestina", name_en: "Palestine", slug: "palestina" },
  { id: 11, name: "Rogozna", name_en: "Rogozna", slug: "rogozna" },
  { id: 12, name: "Identitet", name_en: "Identity", slug: "identitet" }
];

const fallbackLocationsBase: FallbackLocation[] = [
  { id: 1, name: "Beograd", slug: "beograd" },
  { id: 2, name: "Novi Pazar", slug: "novi-pazar" },
  { id: 3, name: "Nis", slug: "nis" },
  { id: 4, name: "Sarajevo", slug: "sarajevo" },
  { id: 5, name: "Rogozna", slug: "rogozna" }
];

const fallbackAuthorsBase: FallbackAuthor[] = [
  {
    id: 1,
    name: "Teodora Markovic",
    slug: "teodora-markovic",
    bio: "Prati ekologiju, lokalne politike i posledice sporih institucija po svakodnevni zivot.",
    email: "teodora@avangarda.media",
    socials: [
      { platform: "Instagram", url: "https://www.instagram.com/avangarda.us/" },
      { platform: "X", url: "https://x.com/avangarda_rs" }
    ],
    photo: {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80",
      formats: {
        small: {
          url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80"
        }
      }
    }
  },
  {
    id: 2,
    name: "Milos Ilic",
    slug: "milos-ilic",
    bio: "Pise analize o protestima, gradovima i nacinu na koji politika ulazi u privatni zivot.",
    email: "milos@avangarda.media",
    socials: [{ platform: "X", url: "https://x.com/avangarda_rs" }],
    photo: {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
      formats: {
        small: {
          url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80"
        }
      }
    }
  },
  {
    id: 3,
    name: "Sara Vukovic",
    slug: "sara-vukovic",
    bio: "Intervjue vodi tako da iz razgovora ostane i ritam i konflikt, ne samo citat.",
    email: "sara@avangarda.media",
    socials: [{ platform: "Instagram", url: "https://www.instagram.com/avangarda.us/" }],
    photo: {
      url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=640&q=80",
      formats: {
        small: {
          url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80"
        }
      }
    }
  },
  {
    id: 4,
    name: "Luka Pavlovic",
    slug: "luka-pavlovic",
    bio: "Kolumnista koji iz arhive i kulture izvlaci pitanje odgovornosti za danasnji trenutak.",
    email: "luka@avangarda.media",
    socials: [{ platform: "YouTube", url: "https://www.youtube.com/@Avangarda-s3i" }],
    photo: {
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80",
      formats: {
        small: {
          url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80"
        }
      }
    }
  },
  {
    id: 5,
    name: "Anja Jovanovic",
    slug: "anja-jovanovic",
    bio: "Bavi se obrazovanjem, brigom i svakodnevnim pukotinama sistema koje najpre vide deca i zene.",
    email: "anja@avangarda.media",
    socials: [{ platform: "TikTok", url: "https://www.tiktok.com/@avangarda.rs?lang=en" }],
    photo: {
      url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=640&q=80",
      formats: {
        small: {
          url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=320&q=80"
        }
      }
    }
  },
  {
    id: 6,
    name: "Emir Hadzic",
    slug: "emir-hadzic",
    bio: "Prati regionalne price na mestu gde se prelamaju secanje, rad i geopolitika.",
    email: "emir@avangarda.media",
    socials: [{ platform: "X", url: "https://x.com/avangarda_rs" }],
    photo: {
      url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=640&q=80",
      formats: {
        small: {
          url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=320&q=80"
        }
      }
    }
  }
];

function topic(slug: string) {
  return fallbackTopicsBase.find((item) => item.slug === slug)!;
}

function location(slug: string) {
  return fallbackLocationsBase.find((item) => item.slug === slug)!;
}

function author(slug: string) {
  return fallbackAuthorsBase.find((item) => item.slug === slug)!;
}

const fallbackArticlesBase: FallbackArticle[] = [
  {
    id: 101,
    title: "Rudnik i reka: sta ostaje kada se brojke smire",
    subtitle: "Jedna tabla sa investicijama ne moze da sakrije koliko dugo selo zivi sa istim strahom.",
    content: [
      "Kada se sa konferencije sklone grafikoni i procene, na terenu ostaje ista recenica: voda je i dalje mutna, a ljudi i dalje cekaju odgovor.",
      "U razgovorima sa stanovnicima najglasnije nisu bile reci protivljenja, nego umor od toga da svaka nova najava trazi jos jedan krug dokazivanja necega sto se vec vidi golim okom.",
      "Ovaj tekst prati kako se lokalna zajednica brani dokumentovanjem svakodnevice: fotografijama, dnevnicima, merenjima i pitanjem ko ima pravo da planira tudju buducnost."
    ].join("\n\n"),
    slug: "rudnik-i-reka-sta-ostaje-kada-se-brojke-smire",
    section: "front",
    publishedAt: "2026-04-30T08:30:00.000Z",
    year: 2026,
    focus: "Lokalna zajednica",
    style: "reportaza",
    signalText: "Kada institucije kasne, teren postaje jedini arhiv odgovornosti.",
    editorNote: "Citaj sporo: u ovoj prici tempo nose svedocenja, ne saopstenja.",
    viewCount: 1840,
    authors: collection([author("teodora-markovic")]),
    topics: collection([topic("ekologija"), topic("drustvo")]),
    locations: collection([location("rogozna")]),
    cover: {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isFeatured: true,
      priority: 9
    }
  },
  {
    id: 102,
    title: "Posle protesta, pitanje nije ko je dosao nego ko je ostao",
    subtitle: "Pravi test pokreta ne meri se na bini nego u danima kada kamere odu.",
    content: [
      "Posle velikog okupljanja, grad uglavnom vraca staru brzinu. Ali ljudi koji su ostali da razmontiraju binu, pregledaju poruke i dogovore sledeci korak znaju da se politika meri u nastavku.",
      "Ova analiza prati sta se menja kada se energija sa ulice prevede u svakodnevnu organizaciju: manje parole, vise rasporeda; manje spektakla, vise discipline.",
      "Ako protest ne ostavi mrezu medjusobne brige, ostaje samo slika. A slika, sama, nikada nije plan."
    ].join("\n\n"),
    slug: "posle-protesta-pitanje-nije-ko-je-dosao-nego-ko-je-ostao",
    section: "analysis",
    publishedAt: "2026-04-29T13:00:00.000Z",
    year: 2026,
    focus: "Posle ulice",
    style: "analiza",
    signalText: "Pokret traje onoliko koliko traje njegova infrastruktura.",
    editorNote: "Ovaj tekst vezuje ulicu i organizaciju bez romantizacije jednog ili drugog.",
    viewCount: 2230,
    authors: collection([author("milos-ilic")]),
    topics: collection([topic("politika"), topic("drustvo")]),
    locations: collection([location("beograd")]),
    cover: {
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isBreaking: true,
      isTrending: true,
      priority: 10
    }
  },
  {
    id: 103,
    title: "Nismo umorni od borbe, umorni smo od improvizacije",
    subtitle: "Razgovor sa radnicom koja vise ne pristaje da se prekovremeni rad zove lojalnost.",
    content: [
      "U razgovoru koji je trajao duze od planiranog, sagovornica se stalno vracala istoj tacki: sistem od ljudi trazi izdrzljivost, ali im ne daje strukturu.",
      "Izmedju dve smene, izmedju dve autobuske linije i izmedju dve administrativne procedure, nastaje prostor u kojem umor postaje zajednicko iskustvo, a ne privatni neuspeh.",
      "Intervju ne nudi herojsku poentu. Nudi jasan zahtev: da se rad organizuje tako da ljudi imaju zivot izvan njegovog rasporeda."
    ].join("\n\n"),
    slug: "nismo-umorni-od-borbe-umorni-smo-od-improvizacije",
    section: "interview",
    publishedAt: "2026-04-28T09:00:00.000Z",
    year: 2026,
    focus: "Rad i ritam",
    style: "intervju",
    signalText: "Umor nije privatni kvar kada je raspored javni problem.",
    editorNote: "Sagovornica trazi da se cuje proces, ne samo zakljucak.",
    viewCount: 1610,
    authors: collection([author("sara-vukovic")]),
    topics: collection([topic("rad-i-ekonomija"), topic("drustvo")]),
    locations: collection([location("nis")]),
    cover: {
      url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isFeatured: true,
      priority: 8
    }
  },
  {
    id: 104,
    title: "Arhiva nije nostalgija nego alat",
    subtitle: "Kad redakcija pamti sopstvene propuste, citaoci dobijaju vise od novog teksta.",
    content: [
      "Arhiva ne sluzi da potvrdi kontinuitet po svaku cenu. Njena prava vrednost pocinje kada moze da pokaze gde je redakcija pogresila, sta je naucila i zasto danas bira drugaciji kadar.",
      "Zato pitanje secanja u mediju nije pitanje sentimenta nego metode. Ako nema tragova prethodnih odluka, nema ni nacina da se proveri doslednost.",
      "Kolumna brani ideju da je dobar magazin istovremeno i dnevnik uredjivacke odgovornosti."
    ].join("\n\n"),
    slug: "arhiva-nije-nostalgija-nego-alat",
    section: "column",
    publishedAt: "2026-04-27T17:45:00.000Z",
    year: 2026,
    focus: "Urednicka memorija",
    style: "kolumna",
    signalText: "Arhiva je mesto gde stav prestaje da bude slogan.",
    editorNote: "Kolumna o pamcenju ne sentimentalise proslost nego proverava danasnju doslednost.",
    viewCount: 980,
    authors: collection([author("luka-pavlovic")]),
    topics: collection([topic("secanje-i-istorija"), topic("kultura")]),
    locations: collection([location("beograd")]),
    cover: {
      url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isTrending: true,
      priority: 6
    }
  },
  {
    id: 105,
    title: "Cena vazduha se vise ne meri samo na stanici",
    subtitle: "Kad porodice pocnu same da vode evidenciju kaslja, brojke dobijaju novu tezinu.",
    content: [
      "Zvanična merenja su i dalje vazna, ali vise nisu jedino mesto istine. Ljudi beleze promene tela, ritma sna i svakodnevnih migrena mnogo pre nego sto ih prepozna sistem.",
      "Analiza prati kako se iskustvo disanja politizuje tek kada dobije formu tabele, dnevnika i zajednickog jezika.",
      "Pitanje kvaliteta vazduha zato vise nije samo ekolosko nego i klasno: ko moze da ode, a ko mora da ostane."
    ].join("\n\n"),
    slug: "cena-vazduha-se-vise-ne-meri-samo-na-stanici",
    section: "analysis",
    publishedAt: "2026-04-26T11:15:00.000Z",
    year: 2026,
    focus: "Disanje kao politika",
    style: "analiza",
    signalText: "Telo cesto registruje krizu pre institucije.",
    editorNote: "Tekst spaja zdravstveno iskustvo i javnu politiku bez tehnokratskog jezika.",
    viewCount: 1470,
    authors: collection([author("teodora-markovic")]),
    topics: collection([topic("ekologija"), topic("psihologija")]),
    locations: collection([location("beograd")]),
    cover: {
      url: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isTrending: true,
      priority: 7
    }
  },
  {
    id: 106,
    title: "Skola posle zvona: gde odlaze deca kada sistem zavrsi smenu",
    subtitle: "Produzeni boravak nije samo logistika nego mapa nejednakosti koju retko ko zeli da cita.",
    content: [
      "Roditelji najcesce pricaju o rasporedu kao o licnom problemu. Ali kada se isti raspored ponovi u stotinama porodica, jasno je da govorimo o javnoj infrastrukturi.",
      "Tekst belezi kako skole, centri za socijalni rad i neformalna mreza brige zakrpljuju praznine koje sistem prepoznaje tek kad postanu hitan slucaj.",
      "Najmanje vidljiv rad u gradu je cesto rad oko dece. Zato je i najteze objasniti zasto je politicki."
    ].join("\n\n"),
    slug: "skola-posle-zvona-gde-odlaze-deca-kada-sistem-zavrsi-smenu",
    section: "front",
    publishedAt: "2026-04-24T07:50:00.000Z",
    year: 2026,
    focus: "Briga i raspored",
    style: "reportaza",
    signalText: "Nejednakost najpre postaje raspored, pa tek onda statistika.",
    editorNote: "U fokusu je svakodnevna logistika kao politicko pitanje.",
    viewCount: 1120,
    authors: collection([author("anja-jovanovic")]),
    topics: collection([topic("drustvo"), topic("psihologija")]),
    locations: collection([location("nis")]),
    cover: {
      url: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      priority: 5
    }
  },
  {
    id: 107,
    title: "Grad nije neutralan prema telu koje nosi smenu",
    subtitle: "Intervju o tome zasto urbanizam najvise govori kada ne govori ni o kome posebno.",
    content: [
      "Sagovornik opisuje grad kao uredjaj za raspodelu napora: ko se penje, ko ceka, ko nosi kese, ko juri dva prevoza i ko odustaje pre nego sto stigne.",
      "Iz te perspektive, pristupacnost vise nije dopunska tema nego osnovni test da li grad uopste vidi ljude koji ga drze u pokretu.",
      "Razgovor insistira na jednoj stvari: neutralnost prostora je najcesce samo drugo ime za tudju prednost."
    ].join("\n\n"),
    slug: "grad-nije-neutralan-prema-telu-koje-nosi-smenu",
    section: "interview",
    publishedAt: "2026-04-22T15:05:00.000Z",
    year: 2026,
    focus: "Telo i prostor",
    style: "intervju",
    signalText: "Grad se najbolje cita iz tela koja najvise cekaju.",
    editorNote: "Intervju usmerava pogled sa zgrada na ritmove tela koja kroz njih prolaze.",
    viewCount: 1280,
    authors: collection([author("sara-vukovic")]),
    topics: collection([topic("rad-i-ekonomija"), topic("identitet")]),
    locations: collection([location("sarajevo")]),
    cover: {
      url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      priority: 4
    }
  },
  {
    id: 108,
    title: "Kada kultura ostane bez prostora, ostaje joj ritam",
    subtitle: "Mala mesta ne gube scenu odjednom nego svakim novim kompromisom koji se zove privremeno.",
    content: [
      "Kulturni programi retko nestanu dramaticno. Cesce se smanje, presele, odloze i razvodne dok ne postanu jedva primetni.",
      "Kolumna pita zasto se kultura stalno tera da dokazuje korisnost jezikom projekta, a nikad jezikom zajednice koju drzi na okupu.",
      "Ako prostor ostane samo roba za iznajmljivanje, kultura ce preziveti, ali ce izgubiti ritam koji joj daje publika."
    ].join("\n\n"),
    slug: "kada-kultura-ostane-bez-prostora-ostaje-joj-ritam",
    section: "column",
    publishedAt: "2026-04-20T20:10:00.000Z",
    year: 2026,
    focus: "Prostor za kulturu",
    style: "kolumna",
    signalText: "Kada nema prostora, prvo nestaje kontinuitet, a tek onda program.",
    editorNote: "Kolumna prati kako mali kompromisi proizvode veliku tisinu.",
    viewCount: 930,
    authors: collection([author("luka-pavlovic")]),
    topics: collection([topic("kultura"), topic("margine")]),
    locations: collection([location("novi-pazar")]),
    cover: {
      url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      priority: 3
    }
  },
  {
    id: 109,
    title: "Tri lokacije, ista tisina: kako izgleda cekanje institucije",
    subtitle: "Ljudi ne cekaju samo resenje. Cekaju i potvrdu da ih neko uopste vidi.",
    content: [
      "U tri razlicita grada i tri razlicita slucaja pojavljuje se isti obrazac: nadleznost putuje sporije od posledica.",
      "Reporterski dnevnik belezi kako cekanje menja jezik ljudi. Prvo nestaje poverenje, zatim strpljenje, pa na kraju i ocekivanje da ce odgovor stici.",
      "U toj tisini nastaje paralelni sistem pomoci. Problem je sto on uvek pociva na istim preopterecenim ljudima."
    ].join("\n\n"),
    slug: "tri-lokacije-ista-tisina-kako-izgleda-cekanje-institucije",
    section: "front",
    publishedAt: "2026-04-18T10:25:00.000Z",
    year: 2026,
    focus: "Institucionalna tisina",
    style: "reportaza",
    signalText: "Cekanje je politika kada traje isto za sve koji nemaju vezu.",
    editorNote: "Tekst ukrsta tri lokalne price da bi pokazao isti obrazac odlaganja.",
    viewCount: 1050,
    authors: collection([author("anja-jovanovic")]),
    topics: collection([topic("ljudska-prava"), topic("margine")]),
    locations: collection([location("beograd"), location("novi-pazar"), location("sarajevo")]),
    cover: {
      url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      priority: 4
    }
  },
  {
    id: 110,
    title: "Palestina nije daleko kada kamera udje u kucu",
    subtitle: "Geopolitika prestaje da bude apstraktna onog trenutka kada pocne da oblikuje svakodnevni govor.",
    content: [
      "Medijski okvir cesto sukob drzi na sigurnoj udaljenosti, kao da se posledice zavrsavaju na mapi. Ali slike, jezici i strahovi putuju mnogo brze od granice.",
      "Analiza prati kako porodice, u razgovoru o dalekoj tragediji, otvaraju sopstvena iskustva cenzure, gubitka i naucene nemocnosti.",
      "Pitanje nije da li je nesto dovoljno blizu da nas se tice. Pitanje je koliko brzo pristajemo da tudja patnja ostane samo naslov."
    ].join("\n\n"),
    slug: "palestina-nije-daleko-kada-kamera-udje-u-kucu",
    section: "analysis",
    publishedAt: "2026-04-15T12:40:00.000Z",
    year: 2026,
    focus: "Geopolitika i dom",
    style: "analiza",
    signalText: "Daljina je medijski efekat, ne moralna olaksica.",
    editorNote: "Analiza spaja globalnu temu sa jezikom svakodnevnog iskustva.",
    viewCount: 1540,
    authors: collection([author("emir-hadzic")]),
    topics: collection([topic("palestina"), topic("politika")]),
    locations: collection([location("sarajevo")]),
    cover: {
      url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isFeatured: true,
      priority: 7
    }
  },
  {
    id: 111,
    title: "Rogozna vise nije fusnota na mapi",
    subtitle: "Kad planina postane tacka interesa, ljudi moraju ponovo da objasne da tamo vec postoji zivot.",
    content: [
      "Svaki razvojni plan pocinje kao tehnicki dokument, ali se brzo pretvori u pitanje ko sme da govori u ime prostora koji nije samo resurs nego dom.",
      "U razgovoru sa mestanima Rogozne ponavlja se ista recenica: niko nas ne pita kako ovde vec izgleda sezona kada put zatvori sneg, a ne investicija.",
      "Vest belezi kako lokalna geografija odbija da ostane nevidljiva kada je neko drugi upise kao praznu povrsinu."
    ].join("\n\n"),
    slug: "rogozna-vise-nije-fusnota-na-mapi",
    section: "front",
    publishedAt: "2026-04-13T09:35:00.000Z",
    year: 2026,
    focus: "Prostor i naselje",
    style: "reportaza",
    signalText: "Mapa je politicka cim nekome prekrije tragove zivota.",
    editorNote: "Tekst vraca glas prostoru koji se cesto pojavljuje samo u planovima drugih.",
    viewCount: 860,
    authors: collection([author("emir-hadzic")]),
    topics: collection([topic("rogozna"), topic("ekologija")]),
    locations: collection([location("rogozna"), location("novi-pazar")]),
    cover: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      priority: 2
    }
  },
  {
    id: 112,
    title: "Umor kao javna tema, ne privatna slabost",
    subtitle: "Kada svi govore da su iscrpljeni, pitanje vise nije kako da izdrzimo nego sta proizvodimo takvim ritmom.",
    content: [
      "Umor se u javnom govoru najcesce predstavlja kao licna disciplina: spavaj bolje, planiraj bolje, iskljuci se na vreme. Ali iscrpljenost koja se javlja kolektivno ne moze imati samo individualno objasnjenje.",
      "Ova analiza povezuje jezik mentalnog zdravlja sa uslovima rada, stanovanja i stalne dostupnosti. Umor tada postaje signal da se privatni zivot suzio do tacke pucanja.",
      "Ako iscrpljenost ostane samo motivacioni problem, nikada necemo pitati ko profitira od ritma koji je proizvodi."
    ].join("\n\n"),
    slug: "umor-kao-javna-tema-ne-privatna-slabost",
    section: "analysis",
    publishedAt: "2026-04-10T14:55:00.000Z",
    year: 2026,
    focus: "Javni umor",
    style: "analiza",
    signalText: "Kolektivni umor nije mana karaktera nego mapa pritiska.",
    editorNote: "Tekst spaja jezik mentalnog zdravlja sa materijalnim uslovima svakodnevice.",
    viewCount: 1390,
    authors: collection([author("milos-ilic")]),
    topics: collection([topic("psihologija"), topic("politika")]),
    locations: collection([location("beograd")]),
    cover: {
      url: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?auto=format&fit=crop&w=1600&q=80",
      formats: {
        large: {
          url: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?auto=format&fit=crop&w=1400&q=80"
        },
        medium: {
          url: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?auto=format&fit=crop&w=900&q=80"
        },
        small: {
          url: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?auto=format&fit=crop&w=480&q=80"
        }
      }
    },
    editorialControl: {
      isTrending: true,
      priority: 6
    }
  }
];

export const fallbackTopics = [...fallbackTopicsBase];
export const fallbackLocations = [...fallbackLocationsBase];
export const fallbackAuthors = [...fallbackAuthorsBase];
export const fallbackArticles = [...fallbackArticlesBase].sort((left, right) => {
  return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
});

export const fallbackHomepageConfig: FallbackHomepageConfig = {
  currentItems: fallbackArticles.slice(0, 3).map((article) => ({
    id: article.id,
    title: article.title,
    shortDescription: article.focus || article.subtitle || article.section,
    link: `/a/${article.slug}`
  })),
  editorialCards: [
    {
      label: "STA NE OBJAVLJUJEMO",
      label_en: "WHAT WE DO NOT PUBLISH",
      title: "NE OBJAVLJUJEMO SVE.",
      title_en: "WE DO NOT PUBLISH EVERYTHING.",
      text: "Ne jurimo brzinu po svaku cenu. Ako prica nema kontekst, ostaje van sajta. Tisina je nekad bolja od lose informacije.",
      text_en: "We do not chase speed at any cost. If a story has no context, it stays off the site. Silence is sometimes better than bad information.",
      ctaLabel: "Urednicki princip",
      ctaHref: "/editorial-principle"
    },
    {
      label: "KAKO CITATI",
      label_en: "HOW TO READ",
      title: "OVO NIJE SCROLL, OVO JE CITANJE.",
      title_en: "THIS IS NOT SCROLLING. THIS IS READING.",
      text: "Ovaj sajt nije pravljen za brz prolaz. Ako ostanes duze od jednog minuta, vec si usao u pricu.",
      text_en: "This site was not built for a quick pass. If you stay longer than a minute, you have already entered the story.",
      ctaLabel: "O nama",
      ctaHref: "/about"
    },
    {
      label: "ODGOVORNOST",
      label_en: "RESPONSIBILITY",
      title: "NIJE SAMO DO NAS.",
      title_en: "IT IS NOT ONLY ON US.",
      text: "Ako vidis problem i nastavis dalje, postajes deo njega. Ovaj sajt ne trazi samo paznju, nego stav.",
      text_en: "If you see the problem and keep going, you become part of it. This site does not ask only for attention, but for a position.",
      ctaLabel: "Teme",
      ctaHref: "/topics"
    }
  ]
};

export const fallbackEditorialSignal: FallbackEditorialSignal = {
  label: "UREDNICKI SIGNAL",
  label_en: "EDITORIAL SIGNAL",
  text: "Dobar magazinski sajt mora da ima stav cim se otvori. U trenutku kada sve trazi brzinu, urednicka odluka je da ostanemo uz kontekst.",
  text_en: "A strong magazine site needs a point of view the moment it opens. At a time when everything asks for speed, the editorial choice is to stay with context.",
  author: "Avangarda",
  type: "statement",
  ctaLabel: "Procitaj kontekst",
  ctaLabel_en: "Read context",
  isActive: true,
  priority: 1,
  backgroundMode: "yellow",
  linkedArticle: single(fallbackArticles[1])
};

export const fallbackDailyQuestion: FallbackDailyQuestion = {
  id: 1,
  label: "PITANJE DANA",
  label_en: "QUESTION OF THE DAY",
  question: "Da li mislis da je umor politicki problem?",
  question_en: "Do you think exhaustion is a political problem?",
  answerA: "DA",
  answerA_en: "YES",
  answerB: "NE",
  answerB_en: "NO",
  votesA: 41,
  votesB: 19,
  totalVotes: 60,
  percentA: 68,
  percentB: 32,
  voteRound: 1,
  isActive: true,
  ctaLabel: "Procitaj kontekst",
  ctaLabel_en: "Read context",
  author: "Avangarda",
  source: "Redakcija",
  linkedArticle: single(fallbackArticles.find((article) => article.slug === "umor-kao-javna-tema-ne-privatna-slabost") || fallbackArticles[0])
};

export function getFallbackImpactMetrics(): FallbackImpactMetrics {
  const authorsCount = new Set(
    fallbackArticles.flatMap((article) => (article.authors?.data || []).map((entry) => entry.slug))
  ).size;
  const topicsCount = new Set(
    fallbackArticles.flatMap((article) => (article.topics?.data || []).map((entry) => entry.slug))
  ).size;
  const latestPublishedAt = Math.max(
    ...fallbackArticles.map((article) => Date.parse(article.publishedAt)).filter((value) => Number.isFinite(value))
  );
  const recentArticlesCount = fallbackArticles.filter((article) => {
    const publishedAt = Date.parse(article.publishedAt);
    return Number.isFinite(publishedAt) && publishedAt >= latestPublishedAt - 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    articlesCount: fallbackArticles.length,
    topicsCount,
    authorsCount,
    recentArticlesCount
  };
}

export function getFallbackArticleBySlug(slug: string) {
  return fallbackArticles.find((article) => article.slug === slug) || null;
}

export function getFallbackAuthorBySlug(slug: string) {
  return fallbackAuthors.find((entry) => entry.slug === slug) || null;
}

export function getFallbackTopicBySlug(slug: string) {
  return fallbackTopics.find((entry) => entry.slug === slug) || null;
}

export function getFallbackArticlesBySection(section: string) {
  const normalizedSection = normalizeSectionSlug(section);
  return fallbackArticles.filter((article) => normalizeSectionSlug(article.section) === normalizedSection);
}

export function getFallbackArticlesByTopicSlug(slug: string) {
  return fallbackArticles.filter((article) =>
    (article.topics?.data || []).some((topicEntry) => topicEntry.slug === slug)
  );
}

export function getFallbackArticlesByAuthorSlug(slug: string) {
  return fallbackArticles.filter((article) =>
    (article.authors?.data || []).some((authorEntry) => authorEntry.slug === slug)
  );
}

export function getFallbackMostReadArticles(limit = 4) {
  return [...fallbackArticles]
    .sort((left, right) => {
      const viewDelta = (right.viewCount || 0) - (left.viewCount || 0);
      if (viewDelta !== 0) return viewDelta;
      return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
    })
    .slice(0, limit);
}
