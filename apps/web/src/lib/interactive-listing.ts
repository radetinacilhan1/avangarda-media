import type { Lang } from "@/lib/i18n";

export type InteractiveSlug = "moc" | "neutralni-covek" | "cekaonica" | "algoritam" | "rogozna";

type ListingCopy = {
  formatLabel: string;
  description: string;
  tags: readonly [string, string, string];
};

export type InteractiveListingCopy = ListingCopy & {
  number: string;
  ctaLabel: string;
};

export type InteractiveCoverConfig = {
  src: string;
  alt: "";
  objectPositionDesktop: string;
  objectPositionMobile: string;
  objectFit: "cover" | "contain";
  overlayStrength: number;
};

const listingCopy: Record<Lang, Record<InteractiveSlug, ListingCopy>> = {
  sr: {
    moc: {
      formatLabel: "Interaktivna politička simulacija",
      description: "Uđi u sistem u kojem izbor postoji, ali okvir odluke nije uvek tvoj.",
      tags: ["Sistem", "Izbor", "Uticaj"],
    },
    "neutralni-covek": {
      formatLabel: "Interaktivna društvena simulacija",
      description: "Pogledaj kako mir za jednog može postati prostor u kojem drugi ostaju sami.",
      tags: ["Ćutanje", "Solidarnost", "Granica"],
    },
    cekaonica: {
      formatLabel: "Institucionalna simulacija",
      description: "Predmet se formalno kreće. Čovek za to vreme ostaje na istom mestu.",
      tags: ["Institucije", "Pravda", "Vreme"],
    },
    algoritam: {
      formatLabel: "Interaktivna urednička simulacija",
      description: "Objavi važnu priču i pokušaj da sačuvaš njen smisao dok platforma meri reakciju.",
      tags: ["Mediji", "Domet", "Poverenje"],
    },
    rogozna: {
      formatLabel: "Interaktivna ekološka simulacija",
      description: "Prati tragove na terenu pre nego što čekanje pretvori sumnju u nepovratnu štetu.",
      tags: ["Teren", "Dokazi", "Posledica"],
    },
  },
  en: {
    moc: {
      formatLabel: "Political simulation",
      description: "Enter a system where choice exists, but the frame of the decision is not always yours.",
      tags: ["System", "Choice", "Influence"],
    },
    "neutralni-covek": {
      formatLabel: "Social simulation",
      description: "See how peace for one person can become the space where others are left alone.",
      tags: ["Silence", "Solidarity", "Boundary"],
    },
    cekaonica: {
      formatLabel: "Institutional simulation",
      description: "The case moves on paper. Meanwhile, the person remains in the same place.",
      tags: ["Institutions", "Justice", "Time"],
    },
    algoritam: {
      formatLabel: "Editorial simulation",
      description: "Publish an important story and try to preserve its meaning while the platform measures reaction.",
      tags: ["Media", "Reach", "Trust"],
    },
    rogozna: {
      formatLabel: "Ecological simulation",
      description: "Follow the traces on the ground before delay turns suspicion into irreversible damage.",
      tags: ["Field", "Evidence", "Consequence"],
    },
  },
  tr: {
    moc: {
      formatLabel: "Siyasi simülasyon",
      description: "Seçimin var olduğu, ancak kararın çerçevesinin her zaman sana ait olmadığı bir sisteme gir.",
      tags: ["Sistem", "Seçim", "Etki"],
    },
    "neutralni-covek": {
      formatLabel: "Toplumsal simülasyon",
      description: "Bir kişi için huzurun, başkalarının yalnız bırakıldığı bir alana nasıl dönüşebildiğini gör.",
      tags: ["Sessizlik", "Dayanışma", "Sınır"],
    },
    cekaonica: {
      formatLabel: "Kurumsal simülasyon",
      description: "Dosya resmiyette ilerliyor. İnsan ise bu sırada aynı yerde kalıyor.",
      tags: ["Kurumlar", "Adalet", "Zaman"],
    },
    algoritam: {
      formatLabel: "Editoryal simülasyon",
      description: "Önemli bir hikâyeyi yayımla ve platform tepkileri ölçerken anlamını korumaya çalış.",
      tags: ["Medya", "Erişim", "Güven"],
    },
    rogozna: {
      formatLabel: "Ekolojik simülasyon",
      description: "Bekleyiş şüpheyi geri döndürülemez bir zarara çevirmeden önce sahadaki izleri takip et.",
      tags: ["Saha", "Kanıtlar", "Sonuç"],
    },
  },
  fr: {
    moc: {
      formatLabel: "Simulation politique",
      description: "Entre dans un système où le choix existe, mais où le cadre de la décision ne t’appartient pas toujours.",
      tags: ["Système", "Choix", "Influence"],
    },
    "neutralni-covek": {
      formatLabel: "Simulation sociale",
      description: "Observe comment la paix de l’un peut devenir l’espace où les autres restent seuls.",
      tags: ["Silence", "Solidarité", "Limite"],
    },
    cekaonica: {
      formatLabel: "Simulation institutionnelle",
      description: "Le dossier avance officiellement. Pendant ce temps, la personne reste au même endroit.",
      tags: ["Institutions", "Justice", "Temps"],
    },
    algoritam: {
      formatLabel: "Simulation éditoriale",
      description: "Publie une histoire importante et tente d’en préserver le sens pendant que la plateforme mesure les réactions.",
      tags: ["Médias", "Portée", "Confiance"],
    },
    rogozna: {
      formatLabel: "Simulation écologique",
      description: "Suis les traces sur le terrain avant que l’attente ne transforme le doute en dommage irréversible.",
      tags: ["Terrain", "Preuves", "Conséquence"],
    },
  },
  de: {
    moc: {
      formatLabel: "Politische Simulation",
      description: "Betritt ein System, in dem es eine Wahl gibt, der Rahmen der Entscheidung aber nicht immer dir gehört.",
      tags: ["System", "Wahl", "Einfluss"],
    },
    "neutralni-covek": {
      formatLabel: "Soziale Simulation",
      description: "Sieh, wie der Frieden des einen zu einem Raum werden kann, in dem andere allein bleiben.",
      tags: ["Schweigen", "Solidarität", "Grenze"],
    },
    cekaonica: {
      formatLabel: "Institutionelle Simulation",
      description: "Der Vorgang bewegt sich auf dem Papier. Der Mensch bleibt währenddessen am selben Ort.",
      tags: ["Institutionen", "Gerechtigkeit", "Zeit"],
    },
    algoritam: {
      formatLabel: "Redaktionelle Simulation",
      description: "Veröffentliche eine wichtige Geschichte und bewahre ihren Sinn, während die Plattform Reaktionen misst.",
      tags: ["Medien", "Reichweite", "Vertrauen"],
    },
    rogozna: {
      formatLabel: "Ökologische Simulation",
      description: "Folge den Spuren vor Ort, bevor das Warten einen Verdacht in unumkehrbaren Schaden verwandelt.",
      tags: ["Gelände", "Beweise", "Folgen"],
    },
  },
  es: {
    moc: {
      formatLabel: "Simulación política",
      description: "Entra en un sistema donde existe la elección, pero el marco de la decisión no siempre te pertenece.",
      tags: ["Sistema", "Elección", "Influencia"],
    },
    "neutralni-covek": {
      formatLabel: "Simulación social",
      description: "Observa cómo la paz de una persona puede convertirse en el espacio donde otras quedan solas.",
      tags: ["Silencio", "Solidaridad", "Límite"],
    },
    cekaonica: {
      formatLabel: "Simulación institucional",
      description: "El expediente avanza formalmente. Mientras tanto, la persona sigue en el mismo lugar.",
      tags: ["Instituciones", "Justicia", "Tiempo"],
    },
    algoritam: {
      formatLabel: "Simulación editorial",
      description: "Publica una historia importante e intenta preservar su sentido mientras la plataforma mide la reacción.",
      tags: ["Medios", "Alcance", "Confianza"],
    },
    rogozna: {
      formatLabel: "Simulación ecológica",
      description: "Sigue las huellas sobre el terreno antes de que la espera convierta la sospecha en un daño irreversible.",
      tags: ["Terreno", "Pruebas", "Consecuencia"],
    },
  },
  el: {
    moc: {
      formatLabel: "Πολιτική προσομοίωση",
      description: "Μπες σε ένα σύστημα όπου η επιλογή υπάρχει, αλλά το πλαίσιο της απόφασης δεν είναι πάντα δικό σου.",
      tags: ["Σύστημα", "Επιλογή", "Επιρροή"],
    },
    "neutralni-covek": {
      formatLabel: "Κοινωνική προσομοίωση",
      description: "Δες πώς η ηρεμία του ενός μπορεί να γίνει ο χώρος όπου οι άλλοι μένουν μόνοι.",
      tags: ["Σιωπή", "Αλληλεγγύη", "Όριο"],
    },
    cekaonica: {
      formatLabel: "Θεσμική προσομοίωση",
      description: "Η υπόθεση προχωρά τυπικά. Ο άνθρωπος, στο μεταξύ, μένει στο ίδιο σημείο.",
      tags: ["Θεσμοί", "Δικαιοσύνη", "Χρόνος"],
    },
    algoritam: {
      formatLabel: "Συντακτική προσομοίωση",
      description: "Δημοσίευσε μια σημαντική ιστορία και προσπάθησε να διατηρήσεις το νόημά της ενώ η πλατφόρμα μετρά τις αντιδράσεις.",
      tags: ["Μέσα", "Εμβέλεια", "Εμπιστοσύνη"],
    },
    rogozna: {
      formatLabel: "Οικολογική προσομοίωση",
      description: "Ακολούθησε τα ίχνη στο πεδίο πριν η αναμονή μετατρέψει την υποψία σε μη αναστρέψιμη ζημιά.",
      tags: ["Πεδίο", "Αποδείξεις", "Συνέπεια"],
    },
  },
  ar: {
    moc: {
      formatLabel: "محاكاة سياسية",
      description: "ادخل نظامًا يوجد فيه الاختيار، لكن إطار القرار ليس دائمًا بيدك.",
      tags: ["النظام", "الاختيار", "التأثير"],
    },
    "neutralni-covek": {
      formatLabel: "محاكاة اجتماعية",
      description: "انظر كيف يمكن لسلام شخص واحد أن يصبح مساحة يُترك فيها الآخرون وحدهم.",
      tags: ["الصمت", "التضامن", "الحدود"],
    },
    cekaonica: {
      formatLabel: "محاكاة مؤسسية",
      description: "يتقدم الملف رسميًا، بينما يبقى الإنسان في المكان نفسه.",
      tags: ["المؤسسات", "العدالة", "الوقت"],
    },
    algoritam: {
      formatLabel: "محاكاة تحريرية",
      description: "انشر قصة مهمة وحاول الحفاظ على معناها بينما تقيس المنصة ردود الفعل.",
      tags: ["الإعلام", "المدى", "الثقة"],
    },
    rogozna: {
      formatLabel: "محاكاة بيئية",
      description: "تتبع الآثار على الأرض قبل أن يحول الانتظار الشك إلى ضرر لا يمكن إصلاحه.",
      tags: ["الميدان", "الأدلة", "العواقب"],
    },
  },
};

const physicalCoverLocale: Record<Lang, "sr" | "en" | "tr" | "de"> = {
  sr: "sr",
  en: "en",
  tr: "tr",
  fr: "en",
  de: "de",
  es: "en",
  el: "en",
  ar: "en",
};

const listingOrder: readonly InteractiveSlug[] = [
  "moc",
  "neutralni-covek",
  "cekaonica",
  "algoritam",
  "rogozna",
];

const listingCta: Record<Lang, string> = {
  sr: "Otvori",
  en: "Open",
  tr: "Aç",
  fr: "Ouvrir",
  de: "Öffnen",
  es: "Abrir",
  el: "Άνοιγμα",
  ar: "افتح",
};

export function getInteractiveListingCopy(lang: Lang, slug: InteractiveSlug): InteractiveListingCopy {
  return {
    ...listingCopy[lang][slug],
    number: String(listingOrder.indexOf(slug) + 1).padStart(2, "0"),
    ctaLabel: listingCta[lang],
  };
}

export function getInteractiveCover(lang: Lang, slug: InteractiveSlug): InteractiveCoverConfig {
  const locale = physicalCoverLocale[lang];
  const isTurkishNeutral = lang === "tr" && slug === "neutralni-covek";

  return {
    src: `/assets/interaktivno/covers/${locale}-${slug}.png`,
    alt: "",
    objectPositionDesktop: "50% 50%",
    objectPositionMobile: "50% 50%",
    objectFit: isTurkishNeutral ? "contain" : "cover",
    overlayStrength: isTurkishNeutral ? 0.02 : 0.08,
  };
}
