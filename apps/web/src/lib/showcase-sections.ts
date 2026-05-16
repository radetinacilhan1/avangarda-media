import { localizeArticle } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

export const SHOWCASE_SECTION_SLUGS = ["sistem", "teren", "tisina", "kontra"] as const;

export type ShowcaseSectionSlug = (typeof SHOWCASE_SECTION_SLUGS)[number];

export type ShowcasePageCopy = {
  label: string;
  title: string;
  intro: string;
  relatedHeading: string;
  blocks: Array<{
    title: string;
    copy: string;
  }>;
};

export type ShowcaseRelatedArticle = {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
  cover?: unknown;
};

export type ShowcaseSection = {
  slug: ShowcaseSectionSlug;
  href: string;
  title: string;
  description: string;
  ordinal: number;
  displayOrder: number;
  isActive: boolean;
  relatedArticles: ShowcaseRelatedArticle[];
};

type ShowcaseSectionConfig = {
  title: string;
  description: string;
  page: Omit<ShowcasePageCopy, "relatedHeading">;
};

type ShowcaseSectionDictionary = Record<string, Record<ShowcaseSectionSlug, ShowcaseSectionConfig>>;
type ShowcaseSectionSummary = {
  title: string;
  description: string;
};
type ShowcaseSectionSummaryDictionary = Record<Lang, Record<ShowcaseSectionSlug, ShowcaseSectionSummary>>;

type ShowcaseSectionRecord = Record<string, unknown> & {
  id?: number;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  description?: string;
  description_en?: string;
  description_tr?: string;
  description_fr?: string;
  description_de?: string;
  description_es?: string;
  description_el?: string;
  description_ar?: string;
  slug?: string;
  ordinal?: number;
  displayOrder?: number;
  isActive?: boolean;
  relatedArticles?: unknown;
};

type ShowcaseArticleRecord = {
  id?: number;
  title?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  title_es?: string;
  title_el?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  subtitle_es?: string;
  subtitle_el?: string;
  subtitle_ar?: string;
  slug?: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
  cover?: unknown;
};

const localizedSuffix: Record<Exclude<Lang, "sr">, string> = {
  en: "_en",
  tr: "_tr",
  fr: "_fr",
  de: "_de",
  es: "_es",
  el: "_el",
  ar: "_ar"
};

const showcaseSectionSummaries: ShowcaseSectionSummaryDictionary = {
  sr: {
    sistem: {
      title: "SISTEM",
      description: "Kako stvari funkcionišu ispod površine. Zakoni, moć, novac."
    },
    teren: {
      title: "TEREN",
      description: "Priče sa lica mesta. Ljudi, prostor, stvarni život."
    },
    tisina: {
      title: "TIŠINA",
      description: "Teme o kojima se ne govori dovoljno. Lično, društveno, bez filtera."
    },
    kontra: {
      title: "KONTRA",
      description: "Suprotno od dominantnog narativa. Argumentovano, bez kompromisa."
    }
  },
  en: {
    sistem: {
      title: "SYSTEM",
      description: "How things work beneath the surface. Law, power, money."
    },
    teren: {
      title: "FIELD",
      description: "Stories from the ground. People, places, real life."
    },
    tisina: {
      title: "SILENCE",
      description: "Themes that are not spoken about enough. Personal, social, unfiltered."
    },
    kontra: {
      title: "COUNTER",
      description: "Against the dominant narrative. Argued, uncompromising."
    }
  },
  tr: {
    sistem: {
      title: "SİSTEM",
      description: "Yüzeyin altında işlerin nasıl yürüdüğü. Hukuk, güç, para."
    },
    teren: {
      title: "SAHA",
      description: "Sahadan hikâyeler. İnsanlar, mekânlar, gerçek hayat."
    },
    tisina: {
      title: "SESSİZLİK",
      description: "Yeterince konuşulmayan konular. Kişisel, toplumsal, filtresiz."
    },
    kontra: {
      title: "KARŞI",
      description: "Hakim anlatının karşısında. Gerekçeli, tavizsiz."
    }
  },
  fr: {
    sistem: {
      title: "SYSTÈME",
      description: "Ce qui fonctionne sous la surface. Lois, pouvoir, argent."
    },
    teren: {
      title: "TERRAIN",
      description: "Des histoires depuis le terrain. Personnes, lieux, vie réelle."
    },
    tisina: {
      title: "SILENCE",
      description: "Des sujets dont on ne parle pas assez. Personnel, social, sans filtre."
    },
    kontra: {
      title: "CONTRE",
      description: "À rebours du récit dominant. Argumenté, sans compromis."
    }
  },
  de: {
    sistem: {
      title: "SYSTEM",
      description: "Wie Dinge unter der Oberfläche funktionieren. Gesetze, Macht, Geld."
    },
    teren: {
      title: "FELD",
      description: "Geschichten vor Ort. Menschen, Räume, echtes Leben."
    },
    tisina: {
      title: "STILLE",
      description: "Themen, über die zu wenig gesprochen wird. Persönlich, gesellschaftlich, ungefiltert."
    },
    kontra: {
      title: "GEGEN",
      description: "Gegen das dominante Narrativ. Begründet, kompromisslos."
    }
  },
  es: {
    sistem: {
      title: "SISTEMA",
      description: "Cómo funcionan las cosas bajo la superficie. Leyes, poder, dinero."
    },
    teren: {
      title: "TERRENO",
      description: "Historias desde el terreno. Personas, lugares, vida real."
    },
    tisina: {
      title: "SILENCIO",
      description: "Temas de los que no se habla lo suficiente. Personal, social, sin filtro."
    },
    kontra: {
      title: "CONTRA",
      description: "Contra el relato dominante. Argumentado, sin concesiones."
    }
  },
  el: {
    sistem: {
      title: "ΣΥΣΤΗΜΑ",
      description: "Πώς λειτουργούν τα πράγματα κάτω από την επιφάνεια. Νόμοι, εξουσία, χρήμα."
    },
    teren: {
      title: "ΠΕΔΙΟ",
      description: "Ιστορίες από το πεδίο. Άνθρωποι, τόποι, πραγματική ζωή."
    },
    tisina: {
      title: "ΣΙΩΠΗ",
      description: "Θέματα για τα οποία δεν μιλάμε αρκετά. Προσωπικά, κοινωνικά, χωρίς φίλτρο."
    },
    kontra: {
      title: "ΑΝΤΙΘΕΤΑ",
      description: "Απέναντι στο κυρίαρχο αφήγημα. Τεκμηριωμένα, χωρίς συμβιβασμό."
    }
  },
  ar: {
    sistem: {
      title: "النظام",
      description: "كيف تعمل الأشياء تحت السطح. القانون، السلطة، المال."
    },
    teren: {
      title: "الميدان",
      description: "قصص من الميدان. الناس، المكان، الحياة كما هي."
    },
    tisina: {
      title: "الصمت",
      description: "مواضيع لا يُتحدث عنها بما يكفي. شخصية، اجتماعية، بلا فلتر."
    },
    kontra: {
      title: "عكس التيار",
      description: "في مواجهة السردية السائدة. بحجة واضحة، ومن دون مساومة."
    }
  }
};

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
      description: "Yüzeyin altında işlerin nasıl yürüdüğü. Yasa, güç, para.",
      page: {
        label: "SISTEM",
        title: "Yüzeyin altında işlerin nasıl yürüdüğü.",
        intro: "Burada yasa, güç ve para birlikte çalıştığında, çatladığında ya da hayatları resmi dilin uzağında biçimlendirdiğinde ortaya çıkan hikâyeler yer alır.",
        blocks: [
          {
            title: "Ritmi belirleyen kurallar",
            copy: "Kâğıt üstünde tarafsız görünen kurallar, birinin işi, evi ya da güvenliği üzerinde çok somut sonuçlar üretiyor. SISTEM bunu takip eder."
          },
          {
            title: "Işığa çıkmak istemeyen güç",
            copy: "Bu alan karar merkezlerini, kurumsal boşlukları ve sorumluluğun yukarı taşınıp sonuçların aşağıda bırakılma biçimlerini izler."
          },
          {
            title: "İz olarak para",
            copy: "Paranın akışını takip ettiğinde önceliklerin akışına da ulaşırsın. Bu yüzden bütçeler, sözleşmeler, çıkarlar ve toplumsal bedeller burada yer bulur."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Sahadan hikâyeler. İnsanlar, mekân, gerçek hayat.",
      page: {
        label: "TEREN",
        title: "Sahadan hikâyeler.",
        intro: "Bu metinler uzaktan kurulmaz. TEREN; insanı, mekânı ve yeterince yaklaşınca hikâyenin tonunu değiştiren gerçek hayatı merkeze alır.",
        blocks: [
          {
            title: "İstatistikten önce insanlar",
            copy: "Sayılar çerçeveyi verir ama saha, sonuçlarla her gün yaşayan insanlar konuşmaya başladığında gerçekten açılır."
          },
          {
            title: "Kanıt olarak mekân",
            copy: "Sokak, köy, fabrika, okul ya da nehir burada dekor değildir. Mekân; kanıt, bağlam ve tanıktır."
          },
          {
            title: "Mesafesiz gerçek hayat",
            copy: "TEREN daha yavaş, daha doğrudan ve soyutlamaya daha dirençlidir. Bu yüzden gerçek hayat bu alanda metnin merkezinde kalır."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Yeterince konuşulmayan temalar. Kişisel, toplumsal, filtresiz.",
      page: {
        label: "TIŠINA",
        title: "Yeterince konuşulmayan temalar.",
        intro: "Burada hızlı ve güvenli anlatılara sığmadığı için radar altında kalan; fazla kişisel, fazla toplumsal ya da fazla rahatsız edici konular yer alır.",
        blocks: [
          {
            title: "Kişisel olan ikincil değildir",
            copy: "Yaşanan deneyim dipnot gibi ele alındığında sessizlik başlar; oysa o deneyim toplumun kendisi hakkında çok şey söyler."
          },
          {
            title: "Filtresiz toplumsal alan",
            copy: "Bu alan utancı, yorgunluğu, şiddeti, yası, yalnızlığı ve kamusal dilde nadiren ciddi yer bulan her şeyi açar."
          },
          {
            title: "Söylenmeyene alan",
            copy: "TIŠINA dekoratif bir başlık değildir; gösterişsiz ama dikkat talep eden konular için ayrılmış bir alandır."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "Egemen anlatının tersine. Gerekçeli, tavizsiz.",
      page: {
        label: "KONTRA",
        title: "Egemen anlatının tersine.",
        intro: "Burada sadece gürültülü, popüler ya da siyasi olarak kullanışlı olduğu için kabul edilen kalıpları reddeden metinler yer alır. KONTRA duruş değil, argümandır.",
        blocks: [
          {
            title: "Pozsuz karşı çıkış",
            copy: "Burada kontra olmak her şeye refleksle karşı çıkmak değil; çoğunluk tonunun kapatmaya çalıştığı şeye yer açmaktır."
          },
          {
            title: "Yankıdan önce argüman",
            copy: "Bu alan kolay tekrarlar yerine neden, kanıt ve sonuç üzerinde ısrar eder."
          },
          {
            title: "Çizgiyle tavizsiz",
            copy: "Egemen anlatı fazla rahatladığında KONTRA onun en zayıf yerine keser ve sorumluluk sorusunu yeniden ortaya koyar."
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
        intro: "Ici entrent les récits qui suivent les lois, le pouvoir et l'argent lorsqu'ils agissent ensemble, lorsqu'ils se fissurent et lorsqu'ils organisent des vies loin du langage officiel.",
        blocks: [
          {
            title: "Des règles qui donnent le rythme",
            copy: "Nous lisons le système à travers des règles qui paraissent neutres sur le papier mais produisent des conséquences très concrètes pour le travail, le foyer ou la sécurité de quelqu'un."
          },
          {
            title: "Un pouvoir qui évite la lumière",
            copy: "Cette section suit les centres de décision, les vides institutionnels et les manières dont la responsabilité monte tandis que les conséquences restent en bas."
          },
          {
            title: "L'argent comme trace",
            copy: "Quand on suit le flux de l'argent, on voit aussi le flux des priorités. Budgets, contrats, intérêts et coût social trouvent donc leur place ici."
          }
        ]
      }
    },
    teren: {
      title: "TEREN",
      description: "Récits du terrain. Personnes, lieu, vie réelle.",
      page: {
        label: "TEREN",
        title: "Récits du terrain.",
        intro: "Ces textes ne naissent pas à distance. TEREN place au centre les personnes, les lieux et la vie réelle qui changent le ton d'une histoire dès qu'on s'en approche vraiment.",
        blocks: [
          {
            title: "Les personnes avant les statistiques",
            copy: "Les chiffres donnent un cadre, mais le terrain commence vraiment lorsque parlent celles et ceux qui vivent les conséquences."
          },
          {
            title: "Le lieu comme preuve",
            copy: "Une rue, un village, une usine, une école ou une rivière ne sont pas un décor. Le lieu est ici une preuve, un contexte et un témoin."
          },
          {
            title: "La vie réelle sans distance",
            copy: "TEREN est plus lent, plus direct et plus résistant à l'abstraction. C'est pourquoi la vie concrète reste au centre du texte."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Des thèmes dont on ne parle pas assez. Personnel, social, sans filtre.",
      page: {
        label: "TIŠINA",
        title: "Des thèmes dont on ne parle pas assez.",
        intro: "Ici entrent les sujets qui restent sous le radar parce qu'ils sont trop personnels, trop sociaux ou trop inconfortables pour un récit rapide et rassurant.",
        blocks: [
          {
            title: "Le personnel n'est pas secondaire",
            copy: "Le silence commence lorsqu'une expérience vécue est traitée comme une note de bas de page, alors qu'elle dit quelque chose d'essentiel sur la société qui la produit."
          },
          {
            title: "Le social sans filtre",
            copy: "Cette section ouvre ce qu'on repousse souvent: la honte, l'épuisement, la violence, le deuil, la solitude et tout ce qui reçoit rarement un langage public sérieux."
          },
          {
            title: "Une place pour l'indicible",
            copy: "TIŠINA n'est pas une rubrique décorative, mais un espace pour des sujets qui demandent de l'attention sans spectacle ni détournement du regard."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "À contre-courant du récit dominant. Argumenté, sans compromis.",
      page: {
        label: "KONTRA",
        title: "À contre-courant du récit dominant.",
        intro: "Ici entrent des textes qui refusent les cadres tout faits simplement parce qu'ils sont bruyants, populaires ou politiquement utiles. KONTRA signifie argument, pas posture.",
        blocks: [
          {
            title: "Le contre sans mise en scène",
            copy: "Être kontra ici ne signifie pas s'opposer à tout par réflexe, mais rouvrir ce que le ton majoritaire cherche à fermer."
          },
          {
            title: "L'argument avant l'écho",
            copy: "Cette section insiste sur les raisons, les preuves et les conséquences au lieu de répéter facilement des positions déjà établies."
          },
          {
            title: "Sans compromis sur la ligne",
            copy: "Quand le récit dominant devient trop confortable, KONTRA coupe là où il est le plus faible et remet la responsabilité au centre."
          }
        ]
      }
    }
  },
  de: {
    sistem: {
      title: "SISTEM",
      description: "Wie Dinge unter der Oberfläche funktionieren. Gesetze, Macht, Geld.",
      page: {
        label: "SISTEM",
        title: "Wie Dinge unter der Oberfläche funktionieren.",
        intro: "Hier erscheinen Geschichten, die Gesetze, Macht und Geld verfolgen, wenn sie zusammenwirken, wenn sie aufbrechen und wenn sie Leben weit entfernt von offizieller Sprache formen.",
        blocks: [
          {
            title: "Regeln, die den Takt vorgeben",
            copy: "Wir lesen das System durch Regeln, die auf dem Papier neutral wirken, aber sehr konkrete Folgen für Arbeit, Zuhause oder Sicherheit von Menschen erzeugen."
          },
          {
            title: "Macht, die das Licht meidet",
            copy: "Diese Sektion verfolgt Entscheidungszentren, institutionelle Lücken und die Wege, auf denen Verantwortung nach oben wandert, während die Folgen unten bleiben."
          },
          {
            title: "Geld als Spur",
            copy: "Wer dem Geld folgt, sieht auch die Prioritäten. Deshalb gehören Budgets, Verträge, Interessen und ihr sozialer Preis genau hierhin."
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
        intro: "Diese Texte entstehen nicht aus Distanz. TEREN stellt Menschen, Orte und das reale Leben ins Zentrum, das den Ton einer Geschichte verändert, sobald man nahe genug herankommt.",
        blocks: [
          {
            title: "Menschen vor Statistik",
            copy: "Zahlen geben einen Rahmen, aber das Terrain beginnt erst, wenn diejenigen sprechen, die mit den Folgen jeden Tag leben."
          },
          {
            title: "Ort als Beweis",
            copy: "Straße, Dorf, Fabrik, Schule oder Fluss sind hier keine Kulisse. Der Ort ist Beweis, Kontext und Zeuge."
          },
          {
            title: "Reales Leben ohne Distanz",
            copy: "TEREN ist langsamer, direkter und widerstandsfähiger gegen Abstraktion. Genau deshalb bleibt das konkrete Leben im Zentrum des Textes."
          }
        ]
      }
    },
    tisina: {
      title: "TIŠINA",
      description: "Themen, über die zu wenig gesprochen wird. Persönlich, gesellschaftlich, ungefiltert.",
      page: {
        label: "TIŠINA",
        title: "Themen, über die zu wenig gesprochen wird.",
        intro: "Hier stehen Themen, die unter dem Radar bleiben, weil sie zu persönlich, zu gesellschaftlich oder zu unbequem für ein schnelles und sicheres Narrativ sind.",
        blocks: [
          {
            title: "Das Persönliche ist nicht zweitrangig",
            copy: "Stille beginnt dort, wo gelebte Erfahrung wie eine Fußnote behandelt wird, obwohl sie viel über die Gesellschaft erzählt, die sie hervorbringt."
          },
          {
            title: "Das Soziale ohne Filter",
            copy: "Diese Sektion öffnet das, was oft an den Rand geschoben wird: Scham, Erschöpfung, Gewalt, Trauer, Einsamkeit und alles, was selten eine ernste öffentliche Sprache bekommt."
          },
          {
            title: "Raum für das Ungesagte",
            copy: "TIŠINA ist keine dekorative Rubrik, sondern ein Raum für Themen, die Aufmerksamkeit ohne Spektakel und ohne Wegsehen brauchen."
          }
        ]
      }
    },
    kontra: {
      title: "KONTRA",
      description: "Gegen das dominante Narrativ. Begründet, kompromisslos.",
      page: {
        label: "KONTRA",
        title: "Gegen das dominante Narrativ.",
        intro: "Hier erscheinen Texte, die fertige Rahmen nicht einfach übernehmen, nur weil sie laut, populär oder politisch nützlich sind. KONTRA bedeutet Argument, nicht Pose.",
        blocks: [
          {
            title: "Gegenposition ohne Pose",
            copy: "Kontra zu sein heißt hier nicht, reflexhaft gegen alles zu sein, sondern Raum für das zu öffnen, was der Mehrheitston schließen will."
          },
          {
            title: "Argument statt Echo",
            copy: "Diese Sektion besteht auf Gründen, Belegen und Folgen statt auf leichter Wiederholung bereits etablierter Positionen."
          },
          {
            title: "Ohne Kompromiss mit der Linie",
            copy: "Wenn das dominante Narrativ zu bequem wird, schneidet KONTRA an seine schwächste Stelle und bringt Verantwortung zurück ins Zentrum."
          }
        ]
      }
    }
  }
};

const relatedHeadingByLang: Record<Lang, string> = {
  sr: "Povezani tekstovi",
  en: "Related stories",
  tr: "Bağlantılı yazılar",
  fr: "Articles liés",
  de: "Verwandte Texte",
  es: "Textos relacionados",
  el: "Σχετικά κείμενα",
  ar: "نصوص مرتبطة"
};

function pickLocalizedValue(record: Record<string, unknown>, field: string, lang: Lang) {
  const baseValue = record[field];
  if (lang === "sr") return typeof baseValue === "string" ? normalizeSerbianLatin(baseValue) : "";

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  if (typeof translatedValue === "string" && translatedValue.trim()) {
    return translatedValue.trim();
  }

  return typeof baseValue === "string" ? baseValue.trim() : "";
}

function pickLocalizedTranslation(record: Record<string, unknown>, field: string, lang: Lang) {
  if (lang === "sr") {
    const baseValue = record[field];
    return typeof baseValue === "string" ? normalizeSerbianLatin(baseValue) : "";
  }

  const translatedValue = record[`${field}${localizedSuffix[lang]}`];
  return typeof translatedValue === "string" && translatedValue.trim()
    ? translatedValue.trim()
    : "";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toInteger(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export function normalizeShowcaseSectionSlug(value?: string | null): ShowcaseSectionSlug | null {
  if (!value) return null;
  const normalizedValue = normalizeText(value).replace(/[^\w-]/g, "");
  return SHOWCASE_SECTION_SLUGS.find((slug) => slug === normalizedValue) ?? null;
}

function getFallbackSectionConfig(lang: Lang, slug: ShowcaseSectionSlug) {
  return (showcaseSections[lang] ?? showcaseSections.en)[slug];
}

function getShowcaseSectionSummary(lang: Lang, slug: ShowcaseSectionSlug) {
  return showcaseSectionSummaries[lang]?.[slug] ?? showcaseSectionSummaries.en[slug];
}

function getFallbackOrdinal(slug: ShowcaseSectionSlug) {
  return SHOWCASE_SECTION_SLUGS.indexOf(slug) + 1;
}

function localizeRelatedArticles(value: unknown, lang: Lang): ShowcaseRelatedArticle[] {
  return unwrapStrapiCollection<ShowcaseArticleRecord>(value)
    .map((article) => localizeArticle(article, lang) as ShowcaseArticleRecord)
    .flatMap((article) => {
      if (
        typeof article.id !== "number" ||
        typeof article.title !== "string" ||
        !article.title.trim() ||
        typeof article.slug !== "string" ||
        !article.slug.trim()
      ) {
        return [];
      }

      return [{
        id: article.id,
        title: article.title.trim(),
        subtitle: article.subtitle?.trim() || undefined,
        slug: article.slug.trim(),
        section: typeof article.section === "string" ? article.section : undefined,
        publishedAt: typeof article.publishedAt === "string" ? article.publishedAt : undefined,
        authors: article.authors,
        cover: article.cover
      }];
    });
}

function buildFallbackSection(slug: ShowcaseSectionSlug, lang: Lang): ShowcaseSection {
  const fallback = getShowcaseSectionSummary(lang, slug);
  const ordinal = getFallbackOrdinal(slug);

  return {
    slug,
    href: `/${slug}`,
    title: fallback.title,
    description: fallback.description,
    ordinal,
    displayOrder: ordinal,
    isActive: true,
    relatedArticles: []
  };
}

function localizeCmsSection(record: ShowcaseSectionRecord, lang: Lang): ShowcaseSection | null {
  const slug = normalizeShowcaseSectionSlug(typeof record.slug === "string" ? record.slug : "");
  if (!slug) return null;

  const fallback = buildFallbackSection(slug, lang);
  const title = pickLocalizedTranslation(record, "title", lang) || fallback.title;
  const description = pickLocalizedTranslation(record, "description", lang) || fallback.description;
  const ordinal = toInteger(record.ordinal, fallback.ordinal);
  const displayOrder = toInteger(record.displayOrder, ordinal);

  return {
    slug,
    href: `/${slug}`,
    title,
    description,
    ordinal,
    displayOrder,
    isActive: record.isActive !== false,
    relatedArticles: localizeRelatedArticles(record.relatedArticles, lang)
  };
}

function mergeCmsSections(records: ShowcaseSectionRecord[], lang: Lang) {
  const cmsBySlug = new Map<ShowcaseSectionSlug, ShowcaseSection>();

  for (const record of records) {
    const localized = localizeCmsSection(record, lang);
    if (!localized) continue;
    cmsBySlug.set(localized.slug, localized);
  }

  return SHOWCASE_SECTION_SLUGS
    .map((slug) => cmsBySlug.get(slug) ?? buildFallbackSection(slug, lang))
    .filter((section) => section.isActive)
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }

      return left.ordinal - right.ordinal;
    });
}

export function getShowcaseSections(lang: Lang): ShowcaseSection[] {
  return SHOWCASE_SECTION_SLUGS.map((slug) => buildFallbackSection(slug, lang));
}

export function getShowcaseSectionPageCopy(
  slug: ShowcaseSectionSlug,
  lang: Lang,
  section?: Pick<ShowcaseSection, "title" | "description">
): ShowcasePageCopy {
  const summary = getShowcaseSectionSummary(lang, slug);
  const fallback = getFallbackSectionConfig(lang, slug).page;
  const normalizedFallback = lang === "sr"
    ? {
        label: normalizeSerbianLatin(fallback.label),
        title: normalizeSerbianLatin(fallback.title),
        intro: normalizeSerbianLatin(fallback.intro),
        blocks: fallback.blocks.map((block) => ({
          title: normalizeSerbianLatin(block.title),
          copy: normalizeSerbianLatin(block.copy)
        }))
      }
    : fallback;

  return {
    label: section?.title || summary.title,
    title: section?.title || summary.title,
    intro: section?.description || summary.description,
    relatedHeading: relatedHeadingByLang[lang],
    blocks: normalizedFallback.blocks
  };
}

export async function fetchShowcaseSections(lang: Lang): Promise<ShowcaseSection[]> {
  const response = await strapiGet<{ data: unknown[] }>(
    "/api/editorial-directions?sort[0]=displayOrder:asc&sort[1]=ordinal:asc&populate[relatedArticles][populate][0]=authors&populate[relatedArticles][populate][1]=cover"
  );

  const cmsSections = unwrapStrapiCollection<ShowcaseSectionRecord>(response?.data);
  if (!cmsSections.length) {
    return getShowcaseSections(lang);
  }

  return mergeCmsSections(cmsSections, lang);
}

export async function fetchShowcaseSectionBySlug(slug: ShowcaseSectionSlug, lang: Lang): Promise<ShowcaseSection | null> {
  const response = await strapiGet<{ data: unknown[] }>(
    `/api/editorial-directions?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&populate[relatedArticles][populate][0]=authors&populate[relatedArticles][populate][1]=cover`
  );

  const cmsSection = unwrapStrapiCollection<ShowcaseSectionRecord>(response?.data)
    .map((record) => localizeCmsSection(record, lang))
    .find((record): record is ShowcaseSection => !!record);

  return cmsSection ?? null;
}
