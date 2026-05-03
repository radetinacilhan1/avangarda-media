import type { Lang } from "@/lib/i18n";

export const SHOWCASE_SECTION_SLUGS = ["sistem", "teren", "tisina", "kontra"] as const;

export type ShowcaseSectionSlug = (typeof SHOWCASE_SECTION_SLUGS)[number];

type ShowcasePageCopy = {
  label: string;
  title: string;
  intro: string;
  blocks: Array<{
    title: string;
    copy: string;
  }>;
};

type ShowcaseSectionConfig = {
  slug: ShowcaseSectionSlug;
  title: string;
  description: string;
  page: ShowcasePageCopy;
};

type ShowcaseSectionDictionary = Record<Lang, Record<ShowcaseSectionSlug, Omit<ShowcaseSectionConfig, "slug">>>;

const showcaseSections: ShowcaseSectionDictionary = {
  sr: {
    sistem: {
      title: "SISTEM",
      description: "Kako stvari funkcionišu ispod površine. Zakoni, moć, novac.",
      page: {
        label: "SISTEM",
        title: "Kako stvari funkcionišu ispod površine.",
        intro: "Ovde ulaze priče koje prate zakone, moć i novac kada rade zajedno, kada pucaju i kada oblikuju živote daleko od naslovne deklaracije.",
        blocks: [
          {
            title: "Zakoni koji određuju ritam",
            copy: "Sistem čitamo kroz pravila koja deluju neutralno, ali proizvode vrlo konkretne posledice za nečiji posao, dom ili sigurnost."
          },
          {
            title: "Moć koja ne voli svetlo",
            copy: "Ova sekcija prati centre odlučivanja, institucionalne rupe i načine na koje se odgovornost pomera dok posledice ostaju dole."
          },
          {
            title: "Novac kao trag",
            copy: "Kada pratiš tok novca, vidiš i tok prioriteta. Zato ovde ulaze budžeti, ugovori, interesi i njihova društvena cena."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Priče sa lica mesta. Ljudi, prostor, stvarni život.",
      page: {
        label: "TEREN",
        title: "Priče sa lica mesta.",
        intro: "Ovde su tekstovi koji ne nastaju iz distance. Teren znači ljude, prostor i stvarni život koji menjaju ton priče čim im se priđe dovoljno blizu.",
        blocks: [
          {
            title: "Ljudi pre statistike",
            copy: "Brojevi daju okvir, ali teren počinje tek kada se čuje glas onih koji sa posledicama žive svakog dana."
          },
          {
            title: "Prostor kao dokaz",
            copy: "Ulica, selo, fabrika, škola ili reka nisu kulisa. Mesto je ovde dokaz, kontekst i svedok svega što se pokušava sakriti."
          },
          {
            title: "Stvarni život bez distance",
            copy: "Teren je sporiji, neposredniji i otporniji na apstrakciju. Zato ova sekcija drži konkretan život u centru teksta."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Teme o kojima se ne govori dovoljno. Lično, društveno, bez filtera.",
      page: {
        label: "TIŠINA",
        title: "Teme o kojima se ne govori dovoljno.",
        intro: "Ovde su teme koje često ostaju ispod radara jer su previše lične, previše društvene ili previše neprijatne da bi stale u brz, bezbedan narativ.",
        blocks: [
          {
            title: "Lično nije sporedno",
            copy: "Tišina počinje tamo gde se privatno iskustvo tretira kao nevažna fusnota, iako govori mnogo o društvu koje ga proizvodi."
          },
          {
            title: "Društveno bez filtera",
            copy: "Ova sekcija otvara ono što se gura u stranu: stid, iscrpljenost, nasilje, tugu, usamljenost i sve što retko dobija ozbiljan javni jezik."
          },
          {
            title: "Prostor za neizgovoreno",
            copy: "TIŠINA nije dekorativna rubrika, već prostor za teme koje traže pažnju bez senzacionalizma i bez sklanjanja pogleda."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "Suprotno od dominantnog narativa. Argumentovano, bez kompromisa.",
      page: {
        label: "KONTRA",
        title: "Suprotno od dominantnog narativa.",
        intro: "Ovde ulaze tekstovi koji ne prihvataju gotove okvire samo zato što su glasni, popularni ili politički korisni. Kontra znači argument, a ne pozu.",
        blocks: [
          {
            title: "Suprotno bez poza",
            copy: "Biti kontra ovde ne znači biti refleksno protiv svega, već otvoriti prostor za ono što većinski ton pokušava da zatvori."
          },
          {
            title: "Argument umesto eha",
            copy: "Ova sekcija insistira na razlozima, dokazima i konsekvencama, umesto na lakom ponavljanju već uspostavljenih stavova."
          },
          {
            title: "Bez kompromisa sa linijom",
            copy: "Kada je dominantni narativ previše udoban, KONTRA ga reže tamo gde je najslabiji i vraća pitanje odgovornosti u centar."
          }
        ]
      }
    }
  },
  en: {
    sistem: {
      title: "SISTEM",
      description: "How things work beneath the surface. Law, power, money.",
      page: {
        label: "SISTEM",
        title: "How things work beneath the surface.",
        intro: "This is where stories track law, power and money when they align, when they crack and when they shape lives far away from official language.",
        blocks: [
          {
            title: "Rules that set the rhythm",
            copy: "We read the system through rules that look neutral on paper but produce very concrete consequences for somebody's work, home or safety."
          },
          {
            title: "Power that avoids light",
            copy: "This section follows decision centers, institutional gaps and the ways responsibility moves upward while consequences stay below."
          },
          {
            title: "Money as a trace",
            copy: "Once you follow the flow of money, you also see the flow of priorities. That is why budgets, contracts, interests and their social cost belong here."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Stories from the ground. People, place, real life.",
      page: {
        label: "TEREN",
        title: "Stories from the ground.",
        intro: "These texts are not built from a distance. TEREN means people, place and real life changing the story the moment you get close enough.",
        blocks: [
          {
            title: "People before statistics",
            copy: "Numbers frame the issue, but the ground begins only when the people living with the consequences get to speak."
          },
          {
            title: "Place as evidence",
            copy: "A street, a village, a factory, a school or a river is not scenery here. Place is evidence, context and witness."
          },
          {
            title: "Real life without distance",
            copy: "TEREN is slower, more direct and harder to abstract away. That is why this section keeps concrete life at the center of the story."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Themes that are not spoken about enough. Personal, social, unfiltered.",
      page: {
        label: "TIŠINA",
        title: "Themes that are not spoken about enough.",
        intro: "These are topics that stay below the radar because they are too personal, too social or too uncomfortable for a fast and safe narrative.",
        blocks: [
          {
            title: "The personal is not secondary",
            copy: "Silence begins where lived experience gets treated like a footnote, even when it tells us something essential about the society around it."
          },
          {
            title: "The social without filters",
            copy: "This section opens what is often pushed aside: shame, exhaustion, violence, grief, loneliness and everything that rarely receives a serious public language."
          },
          {
            title: "Room for the unsaid",
            copy: "TIŠINA is not decorative. It is a space for subjects that need attention without spectacle and without turning the gaze away."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "Against the dominant narrative. Argued, uncompromising.",
      page: {
        label: "KONTRA",
        title: "Against the dominant narrative.",
        intro: "This is where stories refuse ready-made frames just because they are loud, popular or politically useful. KONTRA means argument, not posture.",
        blocks: [
          {
            title: "Opposition without performance",
            copy: "Being kontra here does not mean reacting against everything by reflex. It means opening room for what the majority tone tries to close."
          },
          {
            title: "Argument instead of echo",
            copy: "This section insists on reasons, evidence and consequences instead of easy repetition of already established positions."
          },
          {
            title: "No compromise with the line",
            copy: "When the dominant narrative becomes too comfortable, KONTRA cuts into its weakest point and brings responsibility back to the center."
          }
        ]
      }
    }
  },
  tr: {
    sistem: {
      title: "SISTEM",
      description: "Yuzeyin altinda islerin nasil yurudugu. Yasa, guc, para.",
      page: {
        label: "SISTEM",
        title: "Yuzeyin altinda islerin nasil yurudugu.",
        intro: "Burada yasa, guc ve para birlikte calistiginda, catladiginda ya da hayatlari resmi dilin uzağinda bicimlendirdiginde ortaya cikan hikayeler yer alir.",
        blocks: [
          {
            title: "Ritmi belirleyen kurallar",
            copy: "Kagit ustunde tarafsiz gorunen kurallar, birinin isi, evi ya da guvenligi uzerinde cok somut sonuclar uretiyor. SISTEM bunu takip eder."
          },
          {
            title: "Isiga cikmak istemeyen guc",
            copy: "Bu alan karar merkezlerini, kurumsal bosluklari ve sorumlulugun yukari tasinip sonuclarin asagida birakilma bicimlerini izler."
          },
          {
            title: "Iz olarak para",
            copy: "Paranin akisini takip ettiginde onceliklerin akisina da ulasirsin. Bu yuzden butceler, sozlesmeler, cikarlar ve toplumsal bedeller burada yer bulur."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Sahadan hikayeler. Insanlar, mekan, gercek hayat.",
      page: {
        label: "TEREN",
        title: "Sahadan hikayeler.",
        intro: "Bu metinler uzaktan kurulmaz. TEREN; insani, mekani ve yeterince yaklasinca hikayenin tonunu degistiren gercek hayati merkeze alir.",
        blocks: [
          {
            title: "Istatistikten once insanlar",
            copy: "Sayilar cerceveyi verir ama saha, sonuclarla her gun yasayan insanlar konusmaya basladiginda gercekten acilir."
          },
          {
            title: "Kanit olarak mekan",
            copy: "Sokak, koy, fabrika, okul ya da nehir burada dekor degildir. Mekan; kanit, baglam ve taniktir."
          },
          {
            title: "Mesafesiz gercek hayat",
            copy: "TEREN daha yavas, daha dogrudan ve soyutlamaya daha direnclidir. Bu yuzden gercek hayat bu alanda metnin merkezinde kalir."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Yeterince konusulmayan temalar. Kisisel, toplumsal, filtresiz.",
      page: {
        label: "TIŠINA",
        title: "Yeterince konusulmayan temalar.",
        intro: "Burada hizli ve guvenli anlatilara sigmadigi icin radar altinda kalan; fazla kisisel, fazla toplumsal ya da fazla rahatsiz edici konular yer alir.",
        blocks: [
          {
            title: "Kisisel olan ikincil degildir",
            copy: "Yasanan deneyim dipnot gibi ele alindiginda sessizlik baslar; oysa o deneyim toplumun kendisi hakkinda cok sey soyler."
          },
          {
            title: "Filtresiz toplumsal alan",
            copy: "Bu alan utanci, yorgunlugu, siddeti, yasi, yalnizligi ve kamusal dilde nadiren ciddi yer bulan her seyi acar."
          },
          {
            title: "Soylenmeyene alan",
            copy: "TIŠINA dekoratif bir baslik degildir; gosterisiz ama dikkat talep eden konular icin ayrilmis bir alandir."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "Egemen anlatinin tersine. Gerekceli, tavizsiz.",
      page: {
        label: "KONTRA",
        title: "Egemen anlatinin tersine.",
        intro: "Burada sadece gurultulu, populer ya da siyasi olarak kullanisli oldugu icin kabul edilen kaliplari reddeden metinler yer alir. KONTRA durus degil, argumandir.",
        blocks: [
          {
            title: "Pozsuz karsi cikis",
            copy: "Burada kontra olmak her seye refleksle karsi cikmak degil; cogunluk tonunun kapatmaya calistigi seye yer acmaktir."
          },
          {
            title: "Yankidan once arguman",
            copy: "Bu alan kolay tekrarlar yerine neden, kanit ve sonuc uzerinde israr eder."
          },
          {
            title: "Cizgiyle tavizsiz",
            copy: "Egemen anlatı fazla rahatladiginda KONTRA onun en zayif yerine keser ve sorumluluk sorusunu yeniden ortaya koyar."
          }
        ]
      }
    }
  },
  fr: {
    sistem: {
      title: "SISTEM",
      description: "Comment les choses fonctionnent sous la surface. Lois, pouvoir, argent.",
      page: {
        label: "SISTEM",
        title: "Comment les choses fonctionnent sous la surface.",
        intro: "Ici entrent les recits qui suivent les lois, le pouvoir et l'argent lorsqu'ils agissent ensemble, lorsqu'ils se fissurent et lorsqu'ils organisent des vies loin du langage officiel.",
        blocks: [
          {
            title: "Des regles qui donnent le rythme",
            copy: "Nous lisons le systeme a travers des regles qui paraissent neutres sur le papier mais produisent des consequences tres concretes pour le travail, le foyer ou la securite de quelqu'un."
          },
          {
            title: "Un pouvoir qui evite la lumiere",
            copy: "Cette section suit les centres de decision, les vides institutionnels et les manieres dont la responsabilite monte tandis que les consequences restent en bas."
          },
          {
            title: "L'argent comme trace",
            copy: "Quand on suit le flux de l'argent, on voit aussi le flux des priorites. Budgets, contrats, interets et cout social trouvent donc leur place ici."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Recits du terrain. Personnes, lieu, vie reelle.",
      page: {
        label: "TEREN",
        title: "Recits du terrain.",
        intro: "Ces textes ne naissent pas a distance. TEREN place au centre les personnes, les lieux et la vie reelle qui changent le ton d'une histoire des qu'on s'en approche vraiment.",
        blocks: [
          {
            title: "Les personnes avant les statistiques",
            copy: "Les chiffres donnent un cadre, mais le terrain commence vraiment lorsque parlent celles et ceux qui vivent les consequences."
          },
          {
            title: "Le lieu comme preuve",
            copy: "Une rue, un village, une usine, une ecole ou une riviere ne sont pas un decor. Le lieu est ici une preuve, un contexte et un temoin."
          },
          {
            title: "La vie reelle sans distance",
            copy: "TEREN est plus lent, plus direct et plus resistant a l'abstraction. C'est pourquoi la vie concrete reste au centre du texte."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Des themes dont on ne parle pas assez. Personnel, social, sans filtre.",
      page: {
        label: "TIŠINA",
        title: "Des themes dont on ne parle pas assez.",
        intro: "Ici entrent les sujets qui restent sous le radar parce qu'ils sont trop personnels, trop sociaux ou trop inconfortables pour un recit rapide et rassurant.",
        blocks: [
          {
            title: "Le personnel n'est pas secondaire",
            copy: "Le silence commence lorsqu'une experience vecue est traitee comme une note de bas de page, alors qu'elle dit quelque chose d'essentiel sur la societe qui la produit."
          },
          {
            title: "Le social sans filtre",
            copy: "Cette section ouvre ce qu'on repousse souvent: la honte, l'epuisement, la violence, le deuil, la solitude et tout ce qui recoit rarement un langage public serieux."
          },
          {
            title: "Une place pour l'indicible",
            copy: "TIŠINA n'est pas une rubrique decorative, mais un espace pour des sujets qui demandent de l'attention sans spectacle ni detournement du regard."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "A contre-recourant du recit dominant. Argumente, sans compromis.",
      page: {
        label: "KONTRA",
        title: "A contre-recourant du recit dominant.",
        intro: "Ici entrent des textes qui refusent les cadres tout faits simplement parce qu'ils sont bruyants, populaires ou politiquement utiles. KONTRA signifie argument, pas posture.",
        blocks: [
          {
            title: "Le contre sans mise en scene",
            copy: "Etre kontra ici ne signifie pas s'opposer a tout par reflexe, mais rouvrir ce que le ton majoritaire cherche a fermer."
          },
          {
            title: "L'argument avant l'echo",
            copy: "Cette section insiste sur les raisons, les preuves et les consequences au lieu de repeter facilement des positions deja etablies."
          },
          {
            title: "Sans compromis sur la ligne",
            copy: "Quand le recit dominant devient trop confortable, KONTRA coupe la ou il est le plus faible et remet la responsabilite au centre."
          }
        ]
      }
    }
  },
  de: {
    sistem: {
      title: "SISTEM",
      description: "Wie Dinge unter der Oberflaeche funktionieren. Gesetze, Macht, Geld.",
      page: {
        label: "SISTEM",
        title: "Wie Dinge unter der Oberflaeche funktionieren.",
        intro: "Hier erscheinen Geschichten, die Gesetze, Macht und Geld verfolgen, wenn sie zusammenwirken, wenn sie aufbrechen und wenn sie Leben weit entfernt von offizieller Sprache formen.",
        blocks: [
          {
            title: "Regeln, die den Takt vorgeben",
            copy: "Wir lesen das System durch Regeln, die auf dem Papier neutral wirken, aber sehr konkrete Folgen fuer Arbeit, Zuhause oder Sicherheit von Menschen erzeugen."
          },
          {
            title: "Macht, die das Licht meidet",
            copy: "Diese Sektion verfolgt Entscheidungszentren, institutionelle Luecken und die Wege, auf denen Verantwortung nach oben wandert, waehrend die Folgen unten bleiben."
          },
          {
            title: "Geld als Spur",
            copy: "Wer dem Geld folgt, sieht auch die Prioritaeten. Deshalb gehoeren Budgets, Vertraege, Interessen und ihr sozialer Preis genau hierhin."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Geschichten vom Ort des Geschehens. Menschen, Raum, reales Leben.",
      page: {
        label: "TEREN",
        title: "Geschichten vom Ort des Geschehens.",
        intro: "Diese Texte entstehen nicht aus Distanz. TEREN stellt Menschen, Orte und das reale Leben ins Zentrum, das den Ton einer Geschichte veraendert, sobald man nahe genug herankommt.",
        blocks: [
          {
            title: "Menschen vor Statistik",
            copy: "Zahlen geben einen Rahmen, aber das Terrain beginnt erst, wenn diejenigen sprechen, die mit den Folgen jeden Tag leben."
          },
          {
            title: "Ort als Beweis",
            copy: "Strasse, Dorf, Fabrik, Schule oder Fluss sind hier keine Kulisse. Der Ort ist Beweis, Kontext und Zeuge."
          },
          {
            title: "Reales Leben ohne Distanz",
            copy: "TEREN ist langsamer, direkter und widerstaendiger gegen Abstraktion. Genau deshalb bleibt das konkrete Leben im Zentrum des Textes."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Themen, ueber die zu wenig gesprochen wird. Persoenlich, gesellschaftlich, ungefiltert.",
      page: {
        label: "TIŠINA",
        title: "Themen, ueber die zu wenig gesprochen wird.",
        intro: "Hier stehen Themen, die unter dem Radar bleiben, weil sie zu persoenlich, zu gesellschaftlich oder zu unbequem fuer ein schnelles und sicheres Narrativ sind.",
        blocks: [
          {
            title: "Das Persoenliche ist nicht zweitrangig",
            copy: "Stille beginnt dort, wo gelebte Erfahrung wie eine Fussnote behandelt wird, obwohl sie viel ueber die Gesellschaft erzaehlt, die sie hervorbringt."
          },
          {
            title: "Das Soziale ohne Filter",
            copy: "Diese Sektion oeffnet das, was oft an den Rand geschoben wird: Scham, Erschoepfung, Gewalt, Trauer, Einsamkeit und alles, was selten eine ernste oeffentliche Sprache bekommt."
          },
          {
            title: "Raum fuer das Ungesagte",
            copy: "TIŠINA ist keine dekorative Rubrik, sondern ein Raum fuer Themen, die Aufmerksamkeit ohne Spektakel und ohne Wegsehen brauchen."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "Gegen das dominante Narrativ. Begruendet, kompromisslos.",
      page: {
        label: "KONTRA",
        title: "Gegen das dominante Narrativ.",
        intro: "Hier erscheinen Texte, die fertige Rahmen nicht einfach uebernehmen, nur weil sie laut, populaer oder politisch nuetzlich sind. KONTRA bedeutet Argument, nicht Pose.",
        blocks: [
          {
            title: "Gegenposition ohne Pose",
            copy: "Kontra zu sein heisst hier nicht, reflexhaft gegen alles zu sein, sondern Raum fuer das zu oeffnen, was der Mehrheitston schliessen will."
          },
          {
            title: "Argument statt Echo",
            copy: "Diese Sektion besteht auf Gruenden, Belegen und Folgen statt auf leichter Wiederholung bereits etablierter Positionen."
          },
          {
            title: "Ohne Kompromiss mit der Linie",
            copy: "Wenn das dominante Narrativ zu bequem wird, schneidet KONTRA an seine schwaechste Stelle und bringt Verantwortung zurueck ins Zentrum."
          }
        ]
      }
    }
  }
};

export function getShowcaseSections(lang: Lang) {
  return SHOWCASE_SECTION_SLUGS.map((slug) => ({
    slug,
    href: `/${slug}`,
    ...showcaseSections[lang][slug]
  }));
}

export function getShowcaseSectionPageCopy(slug: ShowcaseSectionSlug, lang: Lang) {
  return showcaseSections[lang][slug].page;
}
