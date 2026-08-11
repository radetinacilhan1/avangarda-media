import type { AssistantConversationMessage } from "@/lib/assistant-contract";
import type { Lang } from "@/lib/i18n";

export type LegalFollowUpIntent = "contact" | "next" | "documents" | "deadline" | "report" | "related" | "clarify";

type ConversationCopy = {
  acknowledgement: string;
  matched: (resource: string) => string;
  unmatched: string;
  contactKnown: (source: string) => string;
  contactUnknown: string;
  next: string;
  documents: string;
  deadline: string;
  report: string;
  related: (resource?: string) => string;
  clarify: string;
  suggestions: Record<Exclude<LegalFollowUpIntent, "clarify">, string>;
};

const conversationCopyByLang: Record<Lang, ConversationCopy> = {
  sr: {
    acknowledgement: "Razumem — nastavljamo isti slučaj.",
    matched: (resource) => `Objavljeni resurs „${resource}“ može biti relevantna polazna tačka, ali to samo po sebi nije konačna pravna procena.`,
    unmatched: "U Avangardinim objavljenim izvorima nemam dovoljno blizak propis da pouzdano odredim tačan postupak.",
    contactKnown: (source) => `Zvanični izvor povezan sa resursom je ${source}, ali to nije nužno institucija kojoj se podnosi prijava. U izvoru proveri važeći postupak, a nadležnost potvrdi kod stručne pravne pomoći ili odgovarajuće javne službe.`,
    contactUnknown: "Ne mogu pouzdano imenovati nadležnu instituciju samo iz dostupnih objavljenih izvora. Kao prvi korak napravi kratak pisani opis događaja i proveri nadležnost kod pravne pomoći ili odgovarajuće javne službe.",
    next: "Sledeći bezbedan korak je da zapišeš hronologiju, sačuvaš pisani trag i proveriš aktuelni postupak u povezanom zvaničnom izvoru. Ako izvor ne pokriva tvoj slučaj, potraži stručnu pravnu pomoć.",
    documents: "Sačuvaj sve što pokazuje odnos i vremenski sled: ugovor ili odluku, obračune, dopise, poruke, dokaze o slanju i odgovore. To nije konačna lista zakonski potrebnih dokumenata, već praktičan trag za proveru slučaja.",
    deadline: "Iz dostupnih objavljenih podataka ne mogu pouzdano navesti rok. Zapiši tačne datume i rok proveri u zvaničnom izvoru ili kod stručne pravne pomoći, jer pogrešan rok može promeniti sledeći korak.",
    report: "Prijava zavisi od vrste događaja i nadležnosti. Sačuvaj pisani trag, proveri postupak u zvaničnom izvoru i nemoj slati osetljive podatke dok ne potvrdiš kome se obraćaš.",
    related: (resource) => resource ? `Najbliži objavljeni resurs je „${resource}“. Kartica ispod vodi ka Avangardinom objašnjenju, PDF-u i zvaničnom izvoru kada su dostupni.` : "Nisam pronašao dovoljno blizak objavljeni resurs da bih ga pouzdano povezao sa slučajem.",
    clarify: "Da bih nastavio bez nagađanja, nedostaje mi jedan presudan podatak: da li imaš pisani dokument ili odgovor institucije koji pokazuje šta se dogodilo i kada?",
    suggestions: {
      contact: "Kome mogu da se obratim?",
      next: "Koji je moj sledeći korak?",
      documents: "Koja dokumenta treba da sačuvam?",
      deadline: "Da li postoji rok?",
      report: "Da li ovo mogu da prijavim?",
      related: "Pokaži mi povezano pravo.",
    },
  },
  en: {
    acknowledgement: "I understand — we are continuing the same case.",
    matched: (resource) => `The published resource “${resource}” may be a relevant starting point, but it is not a final legal assessment.`,
    unmatched: "Avangarda's published sources do not contain a close enough rule for me to determine the exact procedure reliably.",
    contactKnown: (source) => `The official source linked to this resource is ${source}, but it is not necessarily the institution that receives a complaint. Check the current procedure there and confirm jurisdiction with qualified legal assistance or the appropriate public service.`,
    contactUnknown: "I cannot reliably name the competent institution from the available published sources alone. First write a short chronology and verify jurisdiction with legal assistance or the appropriate public service.",
    next: "A safe next step is to write down the chronology, preserve a written record, and check the current procedure in the linked official source. If it does not cover your case, seek qualified legal assistance.",
    documents: "Keep anything showing the relationship and timeline: a contract or decision, calculations, letters, messages, proof of delivery, and replies. This is a practical record, not a definitive list of legally required documents.",
    deadline: "I cannot state a reliable deadline from the published information available. Record the exact dates and verify the deadline in the official source or with qualified legal assistance.",
    report: "Where to report this depends on the event and jurisdiction. Preserve a written record, check the official procedure, and do not send sensitive data until you have verified the recipient.",
    related: (resource) => resource ? `The closest published resource is “${resource}”. The card below links to Avangarda's explanation, the PDF, and the official source when available.` : "I did not find a sufficiently close published resource to connect reliably to this case.",
    clarify: "To continue without guessing, I need one key fact: do you have a written document or institutional reply showing what happened and when?",
    suggestions: {
      contact: "Who can I contact?",
      next: "What is my next step?",
      documents: "Which documents should I keep?",
      deadline: "Is there a deadline?",
      report: "Can I report this?",
      related: "Show me a related right.",
    },
  },
  tr: {
    acknowledgement: "Anlıyorum — aynı vakayı konuşmaya devam ediyoruz.",
    matched: (resource) => `Yayımlanmış “${resource}” kaynağı ilgili bir başlangıç noktası olabilir; ancak tek başına kesin bir hukuki değerlendirme değildir.`,
    unmatched: "Avangarda'nın yayımlanmış kaynaklarında kesin süreci güvenle belirlemeye yetecek kadar yakın bir düzenleme yok.",
    contactKnown: (source) => `Bu kaynakla bağlantılı resmî kaynak ${source}; ancak bu, şikâyeti alan kurum olmak zorunda değildir. Güncel süreci kaynaktan kontrol et ve yetkiyi uzman hukuki yardım veya ilgili kamu hizmetiyle doğrula.`,
    contactUnknown: "Yalnızca mevcut yayımlanmış kaynaklara dayanarak yetkili kurumu güvenle adlandıramam. Önce kısa bir kronoloji hazırla ve yetkiyi hukuki yardım ya da ilgili kamu hizmetiyle doğrula.",
    next: "Güvenli sonraki adım; kronolojiyi yazmak, yazılı kayıtları saklamak ve bağlantılı resmî kaynakta güncel süreci kontrol etmektir. Kaynak vakayı kapsamıyorsa uzman hukuki yardım al.",
    documents: "İlişkiyi ve zaman çizelgesini gösteren her şeyi sakla: sözleşme veya karar, hesaplamalar, yazışmalar, mesajlar, gönderim kanıtları ve yanıtlar. Bu, yasal olarak gerekli belgelerin kesin listesi değildir.",
    deadline: "Mevcut yayımlanmış bilgilerden güvenilir bir süre veremem. Tarihleri kaydet ve süreyi resmî kaynakta veya uzman hukuki yardımla doğrula.",
    report: "Nereye bildirim yapılacağı olayın türüne ve yetkiye bağlıdır. Yazılı kayıtları sakla, resmî süreci kontrol et ve alıcıyı doğrulamadan hassas veri gönderme.",
    related: (resource) => resource ? `En yakın yayımlanmış kaynak “${resource}”. Aşağıdaki kart, varsa Avangarda açıklamasına, PDF'e ve resmî kaynağa gider.` : "Bu vakayla güvenle ilişkilendirebileceğim yeterince yakın bir yayımlanmış kaynak bulamadım.",
    clarify: "Tahmin etmeden devam etmek için tek önemli bilgiye ihtiyacım var: ne olduğunu ve tarihi gösteren yazılı bir belge veya kurum yanıtı var mı?",
    suggestions: { contact: "Kime başvurabilirim?", next: "Sonraki adımım ne?", documents: "Hangi belgeleri saklamalıyım?", deadline: "Bir süre var mı?", report: "Bunu bildirebilir miyim?", related: "İlgili hakkı göster." },
  },
  fr: {
    acknowledgement: "Je comprends — nous poursuivons le même cas.",
    matched: (resource) => `La ressource publiée « ${resource} » peut être un point de départ pertinent, sans constituer une évaluation juridique définitive.`,
    unmatched: "Les sources publiées par Avangarda ne contiennent pas de règle assez proche pour déterminer la procédure exacte de manière fiable.",
    contactKnown: (source) => `La source officielle liée à cette ressource est ${source}, mais ce n'est pas nécessairement l'institution qui reçoit une plainte. Vérifie-y la procédure actuelle et confirme la compétence auprès d'une aide juridique qualifiée ou du service public concerné.`,
    contactUnknown: "Je ne peux pas désigner l'institution compétente de façon fiable à partir des seules sources publiées. Commence par une chronologie écrite et vérifie la compétence auprès d'une aide juridique ou du service public concerné.",
    next: "L'étape suivante la plus sûre est de noter la chronologie, conserver une trace écrite et vérifier la procédure actuelle dans la source officielle liée. Si elle ne couvre pas ton cas, demande une aide juridique qualifiée.",
    documents: "Conserve tout ce qui montre la relation et la chronologie : contrat ou décision, calculs, courriers, messages, preuves d'envoi et réponses. Ce n'est pas une liste définitive des pièces légalement exigées.",
    deadline: "Je ne peux pas indiquer un délai fiable à partir des informations publiées. Note les dates exactes et vérifie le délai dans la source officielle ou auprès d'une aide juridique qualifiée.",
    report: "Le destinataire d'un signalement dépend des faits et de la compétence. Conserve une trace écrite, vérifie la procédure officielle et n'envoie pas de données sensibles avant d'avoir vérifié le destinataire.",
    related: (resource) => resource ? `La ressource publiée la plus proche est « ${resource} ». La carte ci-dessous mène à l'explication d'Avangarda, au PDF et à la source officielle lorsqu'ils existent.` : "Je n'ai pas trouvé de ressource publiée assez proche pour la relier de manière fiable à ce cas.",
    clarify: "Pour continuer sans supposer, il me manque une information essentielle : as-tu un document écrit ou une réponse institutionnelle indiquant ce qui s'est passé et quand ?",
    suggestions: { contact: "À qui puis-je m'adresser ?", next: "Quelle est la prochaine étape ?", documents: "Quels documents conserver ?", deadline: "Y a-t-il un délai ?", report: "Puis-je le signaler ?", related: "Montre-moi un droit lié." },
  },
  de: {
    acknowledgement: "Ich verstehe — wir führen denselben Fall weiter.",
    matched: (resource) => `Die veröffentlichte Ressource „${resource}“ kann ein relevanter Ausgangspunkt sein, ist aber keine abschließende rechtliche Bewertung.`,
    unmatched: "In den veröffentlichten Quellen von Avangarda gibt es keine ausreichend passende Regelung, um das genaue Verfahren verlässlich zu bestimmen.",
    contactKnown: (source) => `Die mit dieser Ressource verknüpfte offizielle Quelle ist ${source}; sie ist aber nicht zwingend die Stelle, die eine Beschwerde entgegennimmt. Prüfe dort das aktuelle Verfahren und kläre die Zuständigkeit bei qualifizierter Rechtsberatung oder dem passenden öffentlichen Dienst.`,
    contactUnknown: "Allein aus den verfügbaren veröffentlichten Quellen kann ich die zuständige Stelle nicht verlässlich benennen. Erstelle zuerst eine kurze schriftliche Chronologie und kläre die Zuständigkeit bei einer Rechtsberatung oder dem passenden öffentlichen Dienst.",
    next: "Der sichere nächste Schritt ist, die Chronologie aufzuschreiben, schriftliche Nachweise zu sichern und das aktuelle Verfahren in der verknüpften offiziellen Quelle zu prüfen. Deckt sie den Fall nicht ab, hole qualifizierte Rechtsberatung ein.",
    documents: "Bewahre alles auf, was Beziehung und zeitlichen Ablauf zeigt: Vertrag oder Entscheidung, Abrechnungen, Schreiben, Nachrichten, Versandnachweise und Antworten. Das ist keine abschließende Liste gesetzlich erforderlicher Unterlagen.",
    deadline: "Aus den verfügbaren veröffentlichten Informationen kann ich keine verlässliche Frist nennen. Notiere die genauen Daten und prüfe die Frist in der offiziellen Quelle oder bei qualifizierter Rechtsberatung.",
    report: "Die Meldestelle hängt vom Ereignis und der Zuständigkeit ab. Sichere schriftliche Nachweise, prüfe das offizielle Verfahren und sende keine sensiblen Daten, bevor der Empfänger bestätigt ist.",
    related: (resource) => resource ? `Die nächstliegende veröffentlichte Ressource ist „${resource}“. Die Karte unten führt zur Avangarda-Erklärung, zum PDF und zur offiziellen Quelle, sofern vorhanden.` : "Ich habe keine ausreichend passende veröffentlichte Ressource gefunden, die sich verlässlich mit diesem Fall verbinden lässt.",
    clarify: "Um ohne Vermutungen fortzufahren, brauche ich eine entscheidende Angabe: Gibt es ein schriftliches Dokument oder eine Antwort der Institution, die zeigt, was wann geschehen ist?",
    suggestions: { contact: "An wen kann ich mich wenden?", next: "Was ist mein nächster Schritt?", documents: "Welche Unterlagen sollte ich sichern?", deadline: "Gibt es eine Frist?", report: "Kann ich das melden?", related: "Zeige mir ein verbundenes Recht." },
  },
  es: {
    acknowledgement: "Entiendo: seguimos hablando del mismo caso.",
    matched: (resource) => `El recurso publicado «${resource}» puede ser un punto de partida pertinente, pero no es una evaluación jurídica definitiva.`,
    unmatched: "Las fuentes publicadas por Avangarda no contienen una norma suficientemente cercana para determinar con fiabilidad el procedimiento exacto.",
    contactKnown: (source) => `La fuente oficial vinculada a este recurso es ${source}, pero no es necesariamente la institución que recibe una denuncia. Comprueba allí el procedimiento vigente y confirma la competencia con asistencia jurídica cualificada o el servicio público correspondiente.`,
    contactUnknown: "No puedo identificar con fiabilidad la institución competente solo con las fuentes publicadas disponibles. Primero prepara una cronología breve y verifica la competencia con asistencia jurídica o el servicio público correspondiente.",
    next: "El siguiente paso seguro es anotar la cronología, conservar un rastro escrito y comprobar el procedimiento vigente en la fuente oficial enlazada. Si no cubre tu caso, busca asistencia jurídica cualificada.",
    documents: "Conserva todo lo que muestre la relación y la cronología: contrato o decisión, cálculos, cartas, mensajes, comprobantes de envío y respuestas. No es una lista definitiva de documentos legalmente exigidos.",
    deadline: "No puedo indicar un plazo fiable con la información publicada disponible. Anota las fechas exactas y verifica el plazo en la fuente oficial o con asistencia jurídica cualificada.",
    report: "Dónde denunciar depende del hecho y de la competencia. Conserva el rastro escrito, comprueba el procedimiento oficial y no envíes datos sensibles hasta verificar al destinatario.",
    related: (resource) => resource ? `El recurso publicado más cercano es «${resource}». La tarjeta inferior enlaza la explicación de Avangarda, el PDF y la fuente oficial cuando estén disponibles.` : "No encontré un recurso publicado suficientemente cercano para vincularlo con fiabilidad a este caso.",
    clarify: "Para continuar sin suponer, necesito un dato clave: ¿tienes un documento escrito o una respuesta institucional que muestre qué ocurrió y cuándo?",
    suggestions: { contact: "¿A quién puedo dirigirme?", next: "¿Cuál es mi siguiente paso?", documents: "¿Qué documentos debo conservar?", deadline: "¿Existe un plazo?", report: "¿Puedo denunciarlo?", related: "Muéstrame un derecho relacionado." },
  },
  el: {
    acknowledgement: "Καταλαβαίνω — συνεχίζουμε την ίδια υπόθεση.",
    matched: (resource) => `Η δημοσιευμένη πηγή «${resource}» μπορεί να είναι σχετική αφετηρία, αλλά δεν αποτελεί οριστική νομική αξιολόγηση.`,
    unmatched: "Οι δημοσιευμένες πηγές της Avangarda δεν περιέχουν αρκετά κοντινό κανόνα ώστε να προσδιορίσω αξιόπιστα την ακριβή διαδικασία.",
    contactKnown: (source) => `Η επίσημη πηγή που συνδέεται με αυτόν τον πόρο είναι ${source}, αλλά δεν είναι απαραίτητα ο φορέας που δέχεται καταγγελίες. Έλεγξε εκεί την ισχύουσα διαδικασία και επιβεβαίωσε την αρμοδιότητα με εξειδικευμένη νομική βοήθεια ή την κατάλληλη δημόσια υπηρεσία.`,
    contactUnknown: "Δεν μπορώ να κατονομάσω αξιόπιστα τον αρμόδιο φορέα μόνο από τις διαθέσιμες δημοσιευμένες πηγές. Κατάγραψε πρώτα ένα σύντομο χρονολόγιο και επιβεβαίωσε την αρμοδιότητα με νομική βοήθεια ή την κατάλληλη δημόσια υπηρεσία.",
    next: "Το ασφαλές επόμενο βήμα είναι να καταγράψεις το χρονολόγιο, να διατηρήσεις γραπτά στοιχεία και να ελέγξεις την τρέχουσα διαδικασία στη συνδεδεμένη επίσημη πηγή. Αν δεν καλύπτει την υπόθεση, ζήτησε εξειδικευμένη νομική βοήθεια.",
    documents: "Κράτησε ό,τι δείχνει τη σχέση και το χρονολόγιο: σύμβαση ή απόφαση, υπολογισμούς, επιστολές, μηνύματα, αποδείξεις αποστολής και απαντήσεις. Δεν είναι οριστικός κατάλογος νομικά απαιτούμενων εγγράφων.",
    deadline: "Δεν μπορώ να δώσω αξιόπιστη προθεσμία από τις διαθέσιμες δημοσιευμένες πληροφορίες. Κατάγραψε τις ακριβείς ημερομηνίες και έλεγξε την προθεσμία στην επίσημη πηγή ή με εξειδικευμένη νομική βοήθεια.",
    report: "Ο φορέας αναφοράς εξαρτάται από το γεγονός και την αρμοδιότητα. Κράτησε γραπτά στοιχεία, έλεγξε την επίσημη διαδικασία και μην στείλεις ευαίσθητα δεδομένα πριν επιβεβαιώσεις τον παραλήπτη.",
    related: (resource) => resource ? `Η πλησιέστερη δημοσιευμένη πηγή είναι «${resource}». Η κάρτα παρακάτω οδηγεί στην εξήγηση της Avangarda, στο PDF και στην επίσημη πηγή όταν υπάρχουν.` : "Δεν βρήκα αρκετά κοντινή δημοσιευμένη πηγή για αξιόπιστη σύνδεση με αυτή την υπόθεση.",
    clarify: "Για να συνεχίσω χωρίς εικασίες, χρειάζομαι ένα κρίσιμο στοιχείο: υπάρχει γραπτό έγγραφο ή απάντηση φορέα που δείχνει τι συνέβη και πότε;",
    suggestions: { contact: "Σε ποιον μπορώ να απευθυνθώ;", next: "Ποιο είναι το επόμενο βήμα;", documents: "Ποια έγγραφα να κρατήσω;", deadline: "Υπάρχει προθεσμία;", report: "Μπορώ να το αναφέρω;", related: "Δείξε σχετικό δικαίωμα." },
  },
  ar: {
    acknowledgement: "أفهم — نحن نتابع الحالة نفسها.",
    matched: (resource) => `قد يكون المورد المنشور «${resource}» نقطة بداية ذات صلة، لكنه لا يشكل تقييماً قانونياً نهائياً.`,
    unmatched: "لا تتضمن مصادر أفانغاردا المنشورة قاعدة قريبة بما يكفي لتحديد الإجراء الدقيق بصورة موثوقة.",
    contactKnown: (source) => `المصدر الرسمي المرتبط بهذا المورد هو ${source}، لكنه ليس بالضرورة الجهة التي تتلقى الشكوى. تحقق فيه من الإجراء الحالي وأكد الاختصاص لدى مساعدة قانونية متخصصة أو الخدمة العامة المناسبة.`,
    contactUnknown: "لا أستطيع تحديد الجهة المختصة بصورة موثوقة اعتماداً على المصادر المنشورة المتاحة فقط. ابدأ بكتابة تسلسل زمني مختصر وتحقق من الاختصاص لدى مساعدة قانونية أو الخدمة العامة المناسبة.",
    next: "الخطوة التالية الآمنة هي تدوين التسلسل الزمني، والاحتفاظ بسجل مكتوب، والتحقق من الإجراء الحالي في المصدر الرسمي المرتبط. إذا لم يشمل حالتك فاطلب مساعدة قانونية متخصصة.",
    documents: "احتفظ بكل ما يوضح العلاقة والتسلسل الزمني: عقد أو قرار، حسابات، مراسلات، رسائل، إثباتات إرسال وردود. هذه قائمة عملية وليست قائمة نهائية بالوثائق المطلوبة قانوناً.",
    deadline: "لا أستطيع ذكر مهلة موثوقة من المعلومات المنشورة المتاحة. دوّن التواريخ الدقيقة وتحقق من المهلة في المصدر الرسمي أو لدى مساعدة قانونية متخصصة.",
    report: "تعتمد جهة الإبلاغ على نوع الواقعة والاختصاص. احتفظ بسجل مكتوب، وتحقق من الإجراء الرسمي، ولا ترسل بيانات حساسة قبل التأكد من الجهة المستلمة.",
    related: (resource) => resource ? `أقرب مورد منشور هو «${resource}». تقود البطاقة أدناه إلى شرح أفانغاردا وملف PDF والمصدر الرسمي عند توفرها.` : "لم أجد مورداً منشوراً قريباً بما يكفي لربطه بهذه الحالة بصورة موثوقة.",
    clarify: "للمتابعة من دون تخمين أحتاج إلى معلومة أساسية واحدة: هل لديك وثيقة مكتوبة أو رد من مؤسسة يوضح ما حدث ومتى؟",
    suggestions: { contact: "إلى من يمكنني التوجه؟", next: "ما خطوتي التالية؟", documents: "ما الوثائق التي ينبغي حفظها؟", deadline: "هل توجد مهلة؟", report: "هل يمكنني الإبلاغ عن ذلك؟", related: "أرني حقاً ذا صلة." },
  },
};

const legalCaseKeywordsByLang: Record<Lang, string[]> = {
  sr: ["plata", "poslodav", "otkaz", "ugovor", "diskrimin", "instituc", "prijav", "rok", "dokument", "zakon", "pravo", "sud", "inspekc", "životn", "informacij"],
  en: ["salary", "wage", "employer", "dismiss", "contract", "discrimin", "institution", "report", "deadline", "document", "law", "right", "court", "environment", "information"],
  tr: ["maaş", "ücret", "işveren", "işten", "sözleşme", "ayrımc", "kurum", "bildir", "süre", "belge", "hukuk", "hak", "mahkeme", "çevre", "bilgi"],
  fr: ["salaire", "employeur", "licenci", "contrat", "discrimin", "institution", "signal", "délai", "document", "droit", "tribunal", "environnement", "information"],
  de: ["lohn", "gehalt", "arbeitgeber", "kündig", "vertrag", "diskrimin", "behörde", "melden", "frist", "unterlagen", "recht", "gericht", "umwelt", "information"],
  es: ["salario", "empleador", "despid", "contrato", "discrimin", "institución", "denunci", "plazo", "document", "derecho", "tribunal", "ambiente", "información"],
  el: ["μισθ", "εργοδότ", "απόλυ", "σύμβασ", "διάκρισ", "φορέ", "αναφορ", "προθεσμ", "έγγραφ", "δικαί", "δικασ", "περιβάλλον", "πληροφορ"],
  ar: ["راتب", "أجر", "صاحب العمل", "فصل", "عقد", "تمييز", "مؤسسة", "إبلاغ", "مهلة", "وثيقة", "قانون", "حق", "محكمة", "بيئة", "معلومات"],
};

const followUpKeywords: Record<Exclude<LegalFollowUpIntent, "clarify">, Record<Lang, string[]>> = {
  contact: {
    sr: ["kome", "kom se", "obrat", "nadlež", "prijavljujem"], en: ["who", "contact", "where do i", "authority"], tr: ["kime", "nereye", "başvur"], fr: ["à qui", "contacter", "m'adresser"], de: ["an wen", "kontakt", "zuständig"], es: ["a quién", "dirigirme", "contactar"], el: ["σε ποιον", "απευθυν", "αρμόδ"], ar: ["إلى من", "أتوجه", "الجهة"],
  },
  next: {
    sr: ["sledeć", "dalje", "prvo", "korak"], en: ["next", "first", "what should i do"], tr: ["sonraki", "ilk", "ne yap"], fr: ["prochaine", "d'abord", "que faire"], de: ["nächste", "zuerst", "was soll"], es: ["siguiente", "primero", "qué hago"], el: ["επόμεν", "πρώτα", "τι να κάν"], ar: ["الخطوة التالية", "أولاً", "ماذا أفعل"],
  },
  documents: {
    sr: ["dokument", "papir", "dokaz", "sačuv"], en: ["document", "evidence", "keep", "save"], tr: ["belge", "kanıt", "sakla"], fr: ["document", "preuve", "conserver"], de: ["unterlagen", "dokument", "beweis", "sichern"], es: ["document", "prueba", "conservar"], el: ["έγγραφ", "απόδειξ", "κρατή"], ar: ["وثائق", "وثيقة", "دليل", "أحتفظ"],
  },
  deadline: {
    sr: ["rok", "koliko vremena", "zastarel"], en: ["deadline", "time limit", "how long"], tr: ["süre", "son tarih", "zamanaş"], fr: ["délai", "combien de temps", "prescription"], de: ["frist", "wie lange", "verjähr"], es: ["plazo", "cuánto tiempo", "prescri"], el: ["προθεσμ", "πόσο χρόνο", "παραγραφ"], ar: ["مهلة", "كم من الوقت", "تقادم"],
  },
  report: {
    sr: ["prijav", "žalb", "tužb"], en: ["report", "complaint", "claim"], tr: ["bildir", "şikayet", "dava"], fr: ["signaler", "plainte", "recours"], de: ["melden", "beschwerde", "klage"], es: ["denunciar", "queja", "demanda"], el: ["αναφέρ", "καταγγελ", "προσφυγ"], ar: ["إبلاغ", "شكوى", "دعوى"],
  },
  related: {
    sr: ["povezan", "koje pravo", "koji zakon", "izvor"], en: ["related", "which right", "which law", "source"], tr: ["ilgili", "hangi hak", "hangi yasa", "kaynak"], fr: ["lié", "quel droit", "quelle loi", "source"], de: ["verbunden", "welches recht", "welches gesetz", "quelle"], es: ["relacionado", "qué derecho", "qué ley", "fuente"], el: ["σχετικ", "ποιο δικαί", "ποιος νόμος", "πηγή"], ar: ["مرتبط", "أي حق", "أي قانون", "مصدر"],
  },
};

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function detectLegalFollowUpIntent(message: string, lang: Lang): LegalFollowUpIntent {
  const normalized = normalize(message);
  for (const intent of ["contact", "deadline", "documents", "report", "related", "next"] as const) {
    if (followUpKeywords[intent][lang].some((keyword) => normalized.includes(normalize(keyword)))) return intent;
  }
  return "clarify";
}

export function hasLegalCaseContext(message: string, history: AssistantConversationMessage[], lang: Lang) {
  const userContext = [...history.filter((entry) => entry.role === "user").map((entry) => entry.text), message].join(" ");
  const normalized = normalize(userContext);
  return legalCaseKeywordsByLang[lang].some((keyword) => normalized.includes(normalize(keyword)));
}

export function buildLegalConversationQuery(message: string, history: AssistantConversationMessage[]) {
  const firstCaseDescription = history.find((entry) => entry.role === "user")?.text;
  if (!firstCaseDescription) return message.slice(0, 1_120);
  return `${firstCaseDescription}${message.length > 100 ? ` ${message}` : ""}`.slice(0, 1_120);
}

export function buildLegalConversationAnswer(input: {
  lang: Lang;
  intent: LegalFollowUpIntent;
  resourceTitle?: string;
  sourceName?: string;
  continuing: boolean;
}) {
  const copy = conversationCopyByLang[input.lang];
  const context = input.resourceTitle ? copy.matched(input.resourceTitle) : copy.unmatched;
  const answer = (() => {
    switch (input.intent) {
      case "contact": return input.sourceName ? copy.contactKnown(input.sourceName) : copy.contactUnknown;
      case "next": return copy.next;
      case "documents": return copy.documents;
      case "deadline": return copy.deadline;
      case "report": return copy.report;
      case "related": return copy.related(input.resourceTitle);
      default: return copy.clarify;
    }
  })();
  return `${input.continuing ? `${copy.acknowledgement} ` : ""}${context}\n\n${answer}`;
}

export function getContextualSuggestions(lang: Lang, intent: LegalFollowUpIntent = "clarify") {
  const suggestions = conversationCopyByLang[lang].suggestions;
  const order: Record<LegalFollowUpIntent, Array<Exclude<LegalFollowUpIntent, "clarify">>> = {
    contact: ["next", "documents", "deadline"],
    next: ["contact", "documents", "deadline"],
    documents: ["deadline", "contact", "report"],
    deadline: ["documents", "contact", "next"],
    report: ["contact", "documents", "deadline"],
    related: ["next", "contact", "documents"],
    clarify: ["next", "contact", "documents"],
  };
  return order[intent].map((key) => suggestions[key]);
}
