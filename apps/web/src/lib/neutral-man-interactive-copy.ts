import type { Lang } from "@/lib/i18n";
import type { NeutralManChoiceKind, NeutralManEndingId } from "@/lib/neutral-man-interactive";

type ChoiceCopy = { label: string; detail: string };
type SituationCopy = { title: string; body: string; choices: [ChoiceCopy, ChoiceCopy, ChoiceCopy, ChoiceCopy] };

export type NeutralManLocaleCopy = {
  sectionLabel: string;
  gameTitle: string;
  gameSubtitle: string;
  seoDescription: string;
  typeLabel: string;
  durationLabel: string;
  durationValue: string;
  openLabel: string;
  backLabel: string;
  coverAlt: string;
  introEyebrow: string;
  introTitle: string;
  introCopy: string;
  startLabel: string;
  metricPeace: string;
  metricReputation: string;
  metricSolidarity: string;
  metricBoundary: string;
  situationLabel: string;
  communityLabel: string;
  mirrorLabel: string;
  decisionLabel: string;
  restartLabel: string;
  shareLabel: string;
  sharedLabel: string;
  contextLabel: string;
  resultEyebrow: string;
  resultMetricsTitle: string;
  resultChoicesTitle: string;
  choiceKinds: Record<NeutralManChoiceKind, string>;
  mirrors: Record<NeutralManChoiceKind, string>;
  situations: [SituationCopy, SituationCopy, SituationCopy, SituationCopy, SituationCopy, SituationCopy];
  endings: Record<NeutralManEndingId, { title: string; body: string }>;
  contextEyebrow: string;
  contextTitle: string;
  contextIntro: string;
  contextCards: Array<{ title: string; body: string }>;
  disclaimer: string;
  shareText: string;
  searchKeywords: string[];
};

const sr: NeutralManLocaleCopy = {
  sectionLabel: "Interaktivno",
  gameTitle: "Neutralni čovek",
  gameSubtitle: "Nije birao stranu. Samo je pustio da jača pobedi.",
  seoDescription: "Interaktivna društvena simulacija o neutralnosti, solidarnosti, javnoj podršci i granicama koje zajednica povlači.",
  typeLabel: "Interaktivna društvena simulacija",
  durationLabel: "Trajanje",
  durationValue: "6-8 minuta",
  openLabel: "Otvori",
  backLabel: "Sve interaktivne priče",
  coverAlt: "Cover igre Neutralni čovek: osoba između dve grupe ljudi",
  introEyebrow: "Tiha društvena erozija",
  introTitle: "Ne moraš da vičeš da bi nešto promenio.",
  introCopy: "Šest puta ćeš birati između mira, ugleda, solidarnosti i granice. Zajednica pamti i ono što si uradio i ono što si pristojno izbegao.",
  startLabel: "Počni",
  metricPeace: "Mir",
  metricReputation: "Ugled",
  metricSolidarity: "Solidarnost",
  metricBoundary: "Granica",
  situationLabel: "Situacija",
  communityLabel: "Odjeci zajednice",
  mirrorLabel: "Zajednica ti vraća rečenicu",
  decisionLabel: "Odluka",
  restartLabel: "Igraj ponovo",
  shareLabel: "Podeli rezultat",
  sharedLabel: "Rezultat je kopiran.",
  contextLabel: "Razumi šta se desilo",
  resultEyebrow: "Ishod",
  resultMetricsTitle: "Šta je ostalo",
  resultChoicesTitle: "Tvoj javni trag",
  choiceKinds: { boundary: "Javna granica", private: "Privatna podrška", neutral: "Neutralnost", impulsive: "Impulsivni sukob" },
  mirrors: {
    boundary: "Reci jasno šta se dogodilo. Tu smo.",
    private: "Poslaćemo ti poruku. Javno ne možemo da se mešamo.",
    neutral: "Ne znamo sve detalje. Obe strane imaju svoju priču.",
    impulsive: "Sad svi viču. Niko više ne čuje šta ti se dogodilo.",
  },
  situations: [
    { title: "Uvreda u javnom prostoru", body: "Na sastanku neko vređa novu koleginicu zbog porekla. Sala ćuti i gleda u tebe.", choices: [
      { label: "Prekini uvredu", detail: "Imenuj šta se desilo i vrati razgovor na pravila koja važe za sve." },
      { label: "Javi joj se posle", detail: "Ponudi podršku van prostorije, bez javnog rizika." },
      { label: "Pozovi na mir", detail: "Reci da su svi preosetljivi i da sastanak treba nastaviti." },
      { label: "Ponizi onoga ko vređa", detail: "Uzvrati lično i pretvori granicu u obračun." },
    ] },
    { title: "Napad na branitelja reke", body: "Aktivistu koji je objavio dokumenta proglašavaju izdajnikom. Dokazi su dostupni, ali kampanja raste.", choices: [
      { label: "Javno stani uz činjenice", detail: "Podeli proverena dokumenta i zaštiti pravo da se pitanje postavi." },
      { label: "Pošalji privatnu podršku", detail: "Daj mu do znanja da nije sam, ali bez javnog traga." },
      { label: "Sačekaj sve detalje", detail: "Odloži reakciju dok kampanja određuje priču." },
      { label: "Kreni na njihove porodice", detail: "Uzvrati istom vrstom pritiska." },
    ] },
    { title: "Institucionalna nepravda", body: "Služba odbija zahtev samohrane majke bez pisanog obrazloženja. Znaš proceduru i prisutan si.", choices: [
      { label: "Traži odluku napismeno", detail: "Mirno insistiraj na proceduri i ostani uz nju za šalterom." },
      { label: "Pomozi joj sa dokumentima", detail: "Sredi papire kasnije, daleko od javnog pitanja odgovornosti." },
      { label: "Pusti institucije da rade", detail: "Pretpostavi da postoji razlog koji još ne znaš." },
      { label: "Napravi scenu svima", detail: "Napadni svakog zaposlenog, uključujući one koji ne odlučuju." },
    ] },
    { title: "Relativizacija odgovornosti", body: "U javnoj raspravi zločin se pretvara u apstraktno 'teško vreme' bez žrtava i odgovornih.", choices: [
      { label: "Vrati činjenice i imena", detail: "Postavi proverene izvore i jasno odvoji objašnjenje od opravdanja." },
      { label: "Privatno izrazi neslaganje", detail: "Reci najbližima da ti smeta, bez uticaja na javni zapis." },
      { label: "Kaži da svi imaju svoju istinu", detail: "Izjednači tvrdnje da bi razgovor ostao prijatan." },
      { label: "Proglasi sve saučesnicima", detail: "Zameni preciznu odgovornost totalnom optužbom." },
    ] },
    { title: "Tabloidni linč", body: "Naslov otkriva identitet svedokinje i pretvara njenu priču u zabavu. Objavu vidi sve više ljudi.", choices: [
      { label: "Zatraži uklanjanje i ispravku", detail: "Zaštiti identitet, sačuvaj dokaz i objasni štetu bez širenja linka." },
      { label: "Piši joj privatno", detail: "Ponudi utehu, ali ostavi javni napad bez odgovora." },
      { label: "Ne hrani algoritam", detail: "Ne uradi ništa i nazovi povlačenje neutralnom medijskom pismenošću." },
      { label: "Pokreni gomilu protiv novinara", detail: "Uzvrati linčem i izgubi temu u sukobu." },
    ] },
    { title: "Podrška sada treba tebi", body: "Tvoje ime je izvučeno iz konteksta. Institucija ćuti, a ljudi koje poznaješ čekaju da neko prvi progovori.", choices: [
      { label: "Javno iznesi proverljive činjenice", detail: "Traži podršku jasno, bez poziva na osvetu." },
      { label: "Piši nekolicini privatno", detail: "Nadaj se da će podrška iz poruka sama postati javna." },
      { label: "Sačekaj da se tenzije smire", detail: "Primeni na sebe isti oprez koji si tražio od drugih." },
      { label: "Optuži sve za izdaju", detail: "Pretvori zahtev za podrškom u test potpune lojalnosti." },
    ] },
  ],
  endings: {
    "entered-everything": { title: "Ulazio si u sve", body: "Bio si u pravu prečesto da bi te iko slušao. Granice su se izgubile u stalnom obračunu." },
    "boundary-drawn": { title: "Povučena granica", body: "Nisi birao buku. Birao si granicu. Zajednica nije ostala bez sukoba, ali nije ostala ni sama." },
    "private-only": { title: "Privatno uz ljude, javno neutralan", body: "Bio si dobar čovek u privatnim porukama. U javnosti se to nije videlo." },
    "always-neutral": { title: "Stalno neutralan", body: "Sačuvao si mir. Samo više nije bilo nikoga ko bi ga delio s tobom." },
    "uneasy-balance": { title: "Nedovršena granica", body: "Nisi ćutao uvek, ali ni onda kada je bilo presudno nisi uvek bio jasan. Zajednica je ostala između podrške i čekanja." },
  },
  contextEyebrow: "Posle tišine",
  contextTitle: "Neutralnost nije jedna stvar",
  contextIntro: "Simulacija razlikuje uzdržanost od povlačenja, privatnu empatiju od javnog efekta i principijelnu granicu od stalne svađe.",
  contextCards: [
    { title: "Mir za koga?", body: "Lični mir može da raste baš kada rizik prelazi na nekog drugog." },
    { title: "Privatno nije bezvredno", body: "Privatna podrška pomaže čoveku, ali sama retko menja javnu dozvolu za nasilje ili nepravdu." },
    { title: "Granica nije buka", body: "Jasna granica može biti mirna, dokumentovana i strateška. Nije isto što i ulazak u svaki sukob." },
  ],
  disclaimer: "Ovo je urednička simulacija posledica, ne test političke podobnosti niti poziv na rizično ponašanje.",
  shareText: "Moj ishod u simulaciji Neutralni čovek:",
  searchKeywords: ["neutralni čovek", "neutralnost", "solidarnost", "ćutanje", "javna podrška", "granica"],
};

const en: NeutralManLocaleCopy = {
  sectionLabel: "Interactive",
  gameTitle: "The Neutral Man",
  gameSubtitle: "He did not choose a side. He simply let the stronger side win.",
  seoDescription: "An interactive social simulation about neutrality, solidarity, public support and the boundaries a community draws.",
  typeLabel: "Interactive social simulation",
  durationLabel: "Duration",
  durationValue: "6-8 minutes",
  openLabel: "Open",
  backLabel: "All interactive stories",
  coverAlt: "The Neutral Man game cover: a person standing between two groups",
  introEyebrow: "Quiet social erosion",
  introTitle: "You do not have to shout to change an outcome.",
  introCopy: "Six times you will choose between peace, reputation, solidarity and a boundary. A community remembers what you did and what you politely avoided.",
  startLabel: "Begin",
  metricPeace: "Peace",
  metricReputation: "Reputation",
  metricSolidarity: "Solidarity",
  metricBoundary: "Boundary",
  situationLabel: "Situation",
  communityLabel: "Community echoes",
  mirrorLabel: "The community returns your sentence",
  decisionLabel: "Decision",
  restartLabel: "Play again",
  shareLabel: "Share result",
  sharedLabel: "Result copied.",
  contextLabel: "Understand what happened",
  resultEyebrow: "Outcome",
  resultMetricsTitle: "What remained",
  resultChoicesTitle: "Your public trace",
  choiceKinds: { boundary: "Public boundary", private: "Private support", neutral: "Neutrality", impulsive: "Impulsive conflict" },
  mirrors: {
    boundary: "Say clearly what happened. We are here.",
    private: "We will message you. We cannot get involved publicly.",
    neutral: "We do not know every detail. Both sides have their story.",
    impulsive: "Everyone is shouting now. No one can hear what happened to you.",
  },
  situations: [
    { title: "An insult in public", body: "At a meeting, someone insults a new colleague because of her origin. The room is silent and looks at you.", choices: [
      { label: "Stop the insult", detail: "Name what happened and return the meeting to rules that apply to everyone." },
      { label: "Check on her later", detail: "Offer support outside the room without taking a public risk." },
      { label: "Call for calm", detail: "Say everyone is too sensitive and the meeting should continue." },
      { label: "Humiliate the speaker", detail: "Make it personal and turn a boundary into a spectacle." },
    ] },
    { title: "An activist under attack", body: "An activist who published river documents is branded a traitor. The evidence is available, but the campaign is growing.", choices: [
      { label: "Stand publicly with the facts", detail: "Share verified documents and defend the right to ask the question." },
      { label: "Send private support", detail: "Tell him he is not alone, leaving no public trace." },
      { label: "Wait for every detail", detail: "Delay while the campaign defines the story." },
      { label: "Target their families", detail: "Answer pressure with the same kind of pressure." },
    ] },
    { title: "Institutional injustice", body: "An office rejects a single mother's request without a written reason. You know the procedure and are present.", choices: [
      { label: "Demand a written decision", detail: "Calmly insist on procedure and remain beside her at the counter." },
      { label: "Help with the paperwork", detail: "Fix the documents later, away from the public question of accountability." },
      { label: "Let institutions work", detail: "Assume there is a reason you do not know yet." },
      { label: "Attack everyone at the desk", detail: "Blame every employee, including those who do not decide." },
    ] },
    { title: "Responsibility is relativized", body: "In a public debate, a crime becomes an abstract 'difficult time' with no victims and no responsible actors.", choices: [
      { label: "Restore facts and names", detail: "Use verified sources and separate explanation from justification." },
      { label: "Disagree in private", detail: "Tell close friends it troubles you without changing the public record." },
      { label: "Everyone has their truth", detail: "Equalize claims so the conversation stays pleasant." },
      { label: "Call everyone complicit", detail: "Replace precise responsibility with total accusation." },
    ] },
    { title: "A tabloid pile-on", body: "A headline reveals a witness's identity and turns her story into entertainment. More people see it by the minute.", choices: [
      { label: "Demand removal and correction", detail: "Protect her identity, preserve evidence and explain the harm without spreading the link." },
      { label: "Message her privately", detail: "Offer comfort while leaving the public attack unanswered." },
      { label: "Do not feed the algorithm", detail: "Do nothing and call withdrawal neutral media literacy." },
      { label: "Set a crowd on the reporter", detail: "Answer a pile-on with another and lose the subject in conflict." },
    ] },
    { title: "Now you need support", body: "Your name is pulled out of context. The institution is silent and people you know wait for someone else to speak first.", choices: [
      { label: "Publish verifiable facts", detail: "Ask for support clearly without calling for revenge." },
      { label: "Message a few people", detail: "Hope private support will become public by itself." },
      { label: "Wait for tensions to settle", detail: "Apply to yourself the same caution you required of others." },
      { label: "Accuse everyone of betrayal", detail: "Turn a request for support into a test of total loyalty." },
    ] },
  ],
  endings: {
    "entered-everything": { title: "You entered every fight", body: "You were right too often for anyone to hear you. Boundaries disappeared into permanent confrontation." },
    "boundary-drawn": { title: "A boundary was drawn", body: "You did not choose noise. You chose a boundary. The community was not free of conflict, but it was not left alone." },
    "private-only": { title: "Private support, public neutrality", body: "You were a good person in private messages. In public, no one could see it." },
    "always-neutral": { title: "Always neutral", body: "You preserved the peace. There was simply no one left to share it with you." },
    "uneasy-balance": { title: "An unfinished boundary", body: "You did not always stay silent, but you were not always clear when clarity mattered. The community remained between support and waiting." },
  },
  contextEyebrow: "After the silence",
  contextTitle: "Neutrality is not one thing",
  contextIntro: "The simulation distinguishes restraint from withdrawal, private empathy from public effect, and a principled boundary from permanent conflict.",
  contextCards: [
    { title: "Peace for whom?", body: "Personal peace can rise precisely when risk is transferred to someone else." },
    { title: "Private is not worthless", body: "Private support helps a person, but alone it rarely changes public permission for violence or injustice." },
    { title: "A boundary is not noise", body: "A clear boundary can be calm, documented and strategic. It is not the same as entering every fight." },
  ],
  disclaimer: "This is an editorial simulation of consequences, not a political purity test or a call to unsafe action.",
  shareText: "My outcome in The Neutral Man simulation:",
  searchKeywords: ["neutral man", "neutrality", "solidarity", "silence", "public support", "boundary"],
};

const tr: NeutralManLocaleCopy = {
  ...en,
  sectionLabel: "Etkileşimli",
  gameTitle: "Tarafsız Adam",
  gameSubtitle: "Taraf tutmadı. Sadece güçlünün kazanmasına izin verdi.",
  seoDescription: "Tarafsızlık, dayanışma, kamusal destek ve toplumun çizdiği sınırlar üzerine etkileşimli toplumsal simülasyon.",
  typeLabel: "Etkileşimli toplumsal simülasyon",
  durationLabel: "Süre", durationValue: "6-8 dakika", openLabel: "Aç", backLabel: "Tüm etkileşimli hikâyeler",
  coverAlt: "Tarafsız Adam oyun kapağı: iki grubun arasında duran bir kişi",
  introEyebrow: "Sessiz toplumsal aşınma", introTitle: "Bir sonucu değiştirmek için bağırmak zorunda değilsin.",
  introCopy: "Altı kez huzur, itibar, dayanışma ve sınır arasında seçim yapacaksın. Toplum, yaptığını da kibarca kaçındığını da hatırlar.", startLabel: "Başla",
  metricPeace: "Huzur", metricReputation: "İtibar", metricSolidarity: "Dayanışma", metricBoundary: "Sınır",
  situationLabel: "Durum", communityLabel: "Toplumun yankıları", mirrorLabel: "Toplum sana cümleni geri veriyor", decisionLabel: "Karar",
  restartLabel: "Yeniden oyna", shareLabel: "Sonucu paylaş", sharedLabel: "Sonuç kopyalandı.", contextLabel: "Ne olduğunu anla",
  resultEyebrow: "Sonuç", resultMetricsTitle: "Geriye kalan", resultChoicesTitle: "Kamusal izin",
  choiceKinds: { boundary: "Kamusal sınır", private: "Özel destek", neutral: "Tarafsızlık", impulsive: "Dürtüsel çatışma" },
  mirrors: { boundary: "Ne olduğunu açıkça söyle. Buradayız.", private: "Sana yazarız. Kamuya açık biçimde karışamayız.", neutral: "Tüm ayrıntıları bilmiyoruz. İki tarafın da hikâyesi var.", impulsive: "Şimdi herkes bağırıyor. Sana ne olduğunu kimse duymuyor." },
  situations: [
    { title: "Kamusal alanda hakaret", body: "Bir toplantıda yeni bir meslektaş kökeni yüzünden aşağılanıyor. Oda susup sana bakıyor.", choices: [{ label: "Hakareti durdur", detail: "Olanı adlandır ve herkes için geçerli kurallara dön." }, { label: "Sonra yanında ol", detail: "Kamusal risk almadan dışarıda destek ver." }, { label: "Sakinlik çağrısı yap", detail: "Herkesin fazla hassas olduğunu söyle ve toplantıya devam et." }, { label: "Hakaret edeni aşağıla", detail: "Meseleyi kişiselleştir ve sınırı hesaplaşmaya çevir." }] },
    { title: "Aktiviste saldırı", body: "Nehir belgelerini yayımlayan aktiviste hain deniyor. Kanıtlar açık, kampanya büyüyor.", choices: [{ label: "Gerçeklerin yanında dur", detail: "Doğrulanmış belgeleri paylaş ve soru sorma hakkını savun." }, { label: "Özel destek gönder", detail: "Yalnız olmadığını söyle ama kamusal iz bırakma." }, { label: "Tüm ayrıntıları bekle", detail: "Kampanya hikâyeyi kurarken tepkiyi ertele." }, { label: "Ailelerini hedef al", detail: "Baskıya aynı tür baskıyla karşılık ver." }] },
    { title: "Kurumsal adaletsizlik", body: "Bir kurum tek ebeveynli annenin başvurusunu yazılı gerekçe olmadan reddediyor. Prosedürü biliyor ve oradasın.", choices: [{ label: "Yazılı karar iste", detail: "Sakin biçimde prosedürde ısrar et ve gişede yanında kal." }, { label: "Belgelerine yardım et", detail: "Sorumluluk sorusunu açmadan evrakı sonra düzelt." }, { label: "Kurumlar çalışsın", detail: "Henüz bilmediğin bir neden olduğunu varsay." }, { label: "Gişedeki herkese saldır", detail: "Karar vermeyenler dâhil tüm çalışanları suçla." }] },
    { title: "Sorumluluğun görecelileştirilmesi", body: "Kamusal tartışmada bir suç, kurbanı ve sorumlusu olmayan 'zor bir dönem'e dönüşüyor.", choices: [{ label: "Gerçekleri ve isimleri geri getir", detail: "Doğrulanmış kaynak kullan; açıklamayı mazeretten ayır." }, { label: "Özelde itiraz et", detail: "Kamusal kaydı değiştirmeden yakınlarına rahatsızlığını söyle." }, { label: "Herkesin gerçeği var", detail: "Sohbet rahat kalsın diye iddiaları eşitle." }, { label: "Herkesi suç ortağı ilan et", detail: "Kesin sorumluluğun yerine topyekûn suçlama koy." }] },
    { title: "Tabloid linci", body: "Bir başlık tanığın kimliğini açığa çıkarıp hikâyesini eğlenceye çeviriyor. Görüntülenme artıyor.", choices: [{ label: "Kaldırma ve düzeltme iste", detail: "Kimliği koru, kanıtı sakla ve bağlantıyı yaymadan zararı anlat." }, { label: "Özelden yaz", detail: "Kamusal saldırıyı yanıtsız bırakıp teselli sun." }, { label: "Algoritmayı besleme", detail: "Hiçbir şey yapma ve geri çekilmeyi tarafsız medya okuryazarlığı say." }, { label: "Muhabire karşı kalabalık topla", detail: "Lince linçle karşılık ver ve konuyu çatışmada kaybet." }] },
    { title: "Şimdi destek sana lazım", body: "Adın bağlamından koparıldı. Kurum susuyor; tanıdıkların bir başkasının önce konuşmasını bekliyor.", choices: [{ label: "Doğrulanabilir gerçekleri yayımla", detail: "İntikam çağrısı yapmadan açıkça destek iste." }, { label: "Birkaç kişiye özelden yaz", detail: "Özel desteğin kendiliğinden kamusal olmasını um." }, { label: "Gerilimin düşmesini bekle", detail: "Başkalarından istediğin ihtiyatı kendine uygula." }, { label: "Herkesi ihanetle suçla", detail: "Destek talebini tam sadakat testine çevir." }] },
  ],
  endings: { "entered-everything": { title: "Her kavgaya girdin", body: "Kimsenin dinleyemeyeceği kadar sık haklıydın. Sınırlar sürekli çatışmada kayboldu." }, "boundary-drawn": { title: "Sınır çizildi", body: "Gürültüyü değil, sınırı seçtin. Toplum çatışmasız kalmadı ama yalnız da kalmadı." }, "private-only": { title: "Özelde destek, kamuda tarafsızlık", body: "Özel mesajlarda iyi bir insandın. Kamuda bunu kimse göremedi." }, "always-neutral": { title: "Daima tarafsız", body: "Huzuru korudun. Yalnız artık onu paylaşacak kimse kalmamıştı." }, "uneasy-balance": { title: "Tamamlanmamış sınır", body: "Her zaman susmadın; fakat netliğin gerektiği her anda net değildin. Toplum destek ile bekleyiş arasında kaldı." } },
  contextEyebrow: "Sessizlikten sonra", contextTitle: "Tarafsızlık tek bir şey değildir", contextIntro: "Simülasyon ölçülülüğü geri çekilmeden, özel empatiyi kamusal etkiden ve ilkeli sınırı sürekli çatışmadan ayırır.",
  contextCards: [{ title: "Kimin huzuru?", body: "Kişisel huzur, risk başka birine devredildiğinde artabilir." }, { title: "Özel olan değersiz değildir", body: "Özel destek kişiye yardım eder; ama tek başına şiddet ya da adaletsizliğe verilen kamusal izni nadiren değiştirir." }, { title: "Sınır gürültü değildir", body: "Açık bir sınır sakin, belgeli ve stratejik olabilir. Her kavgaya girmekle aynı şey değildir." }],
  disclaimer: "Bu, sonuçlar üzerine editoryal bir simülasyondur; siyasi saflık testi ya da riskli davranış çağrısı değildir.", shareText: "Tarafsız Adam simülasyonundaki sonucum:", searchKeywords: ["tarafsız adam", "tarafsızlık", "dayanışma", "sessizlik", "kamusal destek", "sınır"],
};

const fr: NeutralManLocaleCopy = {
  ...en,
  sectionLabel: "Interactif", gameTitle: "L'homme neutre", gameSubtitle: "Il n'a choisi aucun camp. Il a simplement laissé gagner le plus fort.",
  seoDescription: "Une simulation sociale interactive sur la neutralité, la solidarité, le soutien public et les limites qu'une communauté trace.", typeLabel: "Simulation sociale interactive",
  durationLabel: "Durée", durationValue: "6 à 8 minutes", openLabel: "Ouvrir", backLabel: "Tous les récits interactifs", coverAlt: "Couverture du jeu L'homme neutre : une personne entre deux groupes",
  introEyebrow: "Érosion sociale silencieuse", introTitle: "Il n'est pas nécessaire de crier pour changer une issue.", introCopy: "À six reprises, vous choisirez entre paix, réputation, solidarité et limite. Une communauté se souvient de vos actes et de ce que vous avez poliment évité.", startLabel: "Commencer",
  metricPeace: "Paix", metricReputation: "Réputation", metricSolidarity: "Solidarité", metricBoundary: "Limite", situationLabel: "Situation", communityLabel: "Échos de la communauté", mirrorLabel: "La communauté vous renvoie votre phrase", decisionLabel: "Décision",
  restartLabel: "Rejouer", shareLabel: "Partager le résultat", sharedLabel: "Résultat copié.", contextLabel: "Comprendre ce qui s'est passé", resultEyebrow: "Issue", resultMetricsTitle: "Ce qui reste", resultChoicesTitle: "Votre trace publique",
  choiceKinds: { boundary: "Limite publique", private: "Soutien privé", neutral: "Neutralité", impulsive: "Conflit impulsif" }, mirrors: { boundary: "Dis clairement ce qui s'est passé. Nous sommes là.", private: "Nous t'écrirons. Publiquement, nous ne pouvons pas intervenir.", neutral: "Nous ne connaissons pas tous les détails. Chaque camp a sa version.", impulsive: "Tout le monde crie maintenant. Personne n'entend ce qui t'est arrivé." },
  situations: [
    { title: "Une insulte en public", body: "En réunion, une nouvelle collègue est insultée à cause de son origine. La salle se tait et vous regarde.", choices: [{ label: "Interrompre l'insulte", detail: "Nommer ce qui s'est passé et revenir aux règles communes." }, { label: "La soutenir ensuite", detail: "Proposer un soutien hors de la salle, sans risque public." }, { label: "Appeler au calme", detail: "Dire que chacun est trop sensible et poursuivre la réunion." }, { label: "Humilier l'auteur", detail: "Personnaliser l'affrontement et transformer la limite en spectacle." }] },
    { title: "Une personne militante attaquée", body: "La personne qui a publié les documents sur la rivière est traitée de traître. Les preuves existent, la campagne enfle.", choices: [{ label: "Soutenir publiquement les faits", detail: "Partager les documents vérifiés et défendre le droit de poser la question." }, { label: "Envoyer un soutien privé", detail: "Dire qu'elle n'est pas seule sans laisser de trace publique." }, { label: "Attendre tous les détails", detail: "Reporter la réaction pendant que la campagne impose son récit." }, { label: "Viser leurs familles", detail: "Répondre à la pression par la même pression." }] },
    { title: "Injustice institutionnelle", body: "Un service refuse la demande d'une mère seule sans motif écrit. Vous connaissez la procédure et êtes présent.", choices: [{ label: "Exiger une décision écrite", detail: "Insister calmement sur la procédure et rester à ses côtés." }, { label: "Aider avec les documents", detail: "Réparer le dossier plus tard, loin de la question publique de responsabilité." }, { label: "Laisser l'institution travailler", detail: "Supposer qu'il existe une raison encore inconnue." }, { label: "Attaquer tout le guichet", detail: "Accuser chaque employé, même ceux qui ne décident pas." }] },
    { title: "Responsabilité relativisée", body: "Dans un débat public, un crime devient une 'époque difficile' abstraite, sans victimes ni responsables.", choices: [{ label: "Rétablir les faits et les noms", detail: "Citer des sources vérifiées et séparer explication et justification." }, { label: "Contester en privé", detail: "Dire à vos proches votre malaise sans modifier la trace publique." }, { label: "Chacun a sa vérité", detail: "Mettre les récits à égalité pour garder une conversation agréable." }, { label: "Déclarer tout le monde complice", detail: "Remplacer la responsabilité précise par une accusation totale." }] },
    { title: "Lynchage médiatique", body: "Un titre révèle l'identité d'un témoin et transforme son histoire en divertissement. L'audience augmente.", choices: [{ label: "Demander retrait et correction", detail: "Protéger l'identité, conserver la preuve et expliquer le tort sans diffuser le lien." }, { label: "Écrire en privé", detail: "Réconforter sans répondre à l'attaque publique." }, { label: "Ne pas nourrir l'algorithme", detail: "Ne rien faire et appeler le retrait une neutralité médiatique." }, { label: "Lancer la foule contre le journaliste", detail: "Répondre au lynchage par un autre et perdre le sujet." }] },
    { title: "Vous avez maintenant besoin de soutien", body: "Votre nom est sorti de son contexte. L'institution se tait et vos proches attendent qu'une autre personne parle d'abord.", choices: [{ label: "Publier des faits vérifiables", detail: "Demander clairement du soutien sans appeler à la vengeance." }, { label: "Écrire à quelques proches", detail: "Espérer que le soutien privé devienne public tout seul." }, { label: "Attendre l'apaisement", detail: "Appliquer à votre cas la prudence exigée des autres." }, { label: "Accuser tout le monde de trahison", detail: "Transformer la demande de soutien en test de loyauté totale." }] },
  ],
  endings: { "entered-everything": { title: "Vous êtes entré dans chaque conflit", body: "Vous aviez raison trop souvent pour être entendu. Les limites se sont dissoutes dans l'affrontement permanent." }, "boundary-drawn": { title: "Une limite a été tracée", body: "Vous n'avez pas choisi le bruit, mais la limite. La communauté n'a pas évité tout conflit, mais elle n'est pas restée seule." }, "private-only": { title: "Soutien privé, neutralité publique", body: "Vous étiez une bonne personne dans les messages privés. En public, cela ne se voyait pas." }, "always-neutral": { title: "Toujours neutre", body: "Vous avez préservé la paix. Il ne restait simplement plus personne avec qui la partager." }, "uneasy-balance": { title: "Une limite inachevée", body: "Vous ne vous êtes pas toujours tu, mais vous n'avez pas toujours été clair quand il le fallait. La communauté est restée entre soutien et attente." } },
  contextEyebrow: "Après le silence", contextTitle: "La neutralité n'est pas une seule chose", contextIntro: "La simulation distingue la retenue du retrait, l'empathie privée de l'effet public et la limite de principe du conflit permanent.",
  contextCards: [{ title: "La paix pour qui ?", body: "La paix personnelle peut augmenter précisément quand le risque passe à quelqu'un d'autre." }, { title: "Le privé n'est pas inutile", body: "Le soutien privé aide une personne, mais change rarement à lui seul l'autorisation publique de la violence ou de l'injustice." }, { title: "Une limite n'est pas du bruit", body: "Une limite claire peut être calme, documentée et stratégique. Ce n'est pas entrer dans chaque conflit." }],
  disclaimer: "Il s'agit d'une simulation éditoriale des conséquences, pas d'un test de pureté politique ni d'un appel à se mettre en danger.", shareText: "Mon issue dans la simulation L'homme neutre :", searchKeywords: ["homme neutre", "neutralité", "solidarité", "silence", "soutien public", "limite"],
};

const de: NeutralManLocaleCopy = {
  ...en,
  sectionLabel: "Interaktiv", gameTitle: "Der neutrale Mensch", gameSubtitle: "Er hat keine Seite gewählt. Er hat nur zugelassen, dass die Stärkeren gewinnen.", seoDescription: "Eine interaktive soziale Simulation über Neutralität, Solidarität, öffentliche Unterstützung und Grenzen.", typeLabel: "Interaktive soziale Simulation",
  durationLabel: "Dauer", durationValue: "6-8 Minuten", openLabel: "Öffnen", backLabel: "Alle interaktiven Geschichten", coverAlt: "Cover des Spiels Der neutrale Mensch: eine Person zwischen zwei Gruppen",
  introEyebrow: "Stille soziale Erosion", introTitle: "Man muss nicht schreien, um einen Ausgang zu verändern.", introCopy: "Sechsmal wählst du zwischen Frieden, Ansehen, Solidarität und Grenze. Eine Gemeinschaft erinnert sich an dein Handeln und an das, was du höflich vermieden hast.", startLabel: "Beginnen",
  metricPeace: "Frieden", metricReputation: "Ansehen", metricSolidarity: "Solidarität", metricBoundary: "Grenze", situationLabel: "Situation", communityLabel: "Echos der Gemeinschaft", mirrorLabel: "Die Gemeinschaft gibt dir deinen Satz zurück", decisionLabel: "Entscheidung",
  restartLabel: "Noch einmal", shareLabel: "Ergebnis teilen", sharedLabel: "Ergebnis kopiert.", contextLabel: "Verstehen, was geschah", resultEyebrow: "Ausgang", resultMetricsTitle: "Was blieb", resultChoicesTitle: "Deine öffentliche Spur",
  choiceKinds: { boundary: "Öffentliche Grenze", private: "Private Unterstützung", neutral: "Neutralität", impulsive: "Impulsiver Konflikt" }, mirrors: { boundary: "Sag klar, was geschehen ist. Wir sind da.", private: "Wir schreiben dir. Öffentlich können wir uns nicht einmischen.", neutral: "Wir kennen nicht alle Details. Beide Seiten haben ihre Geschichte.", impulsive: "Jetzt schreien alle. Niemand hört mehr, was dir passiert ist." },
  situations: [
    { title: "Eine Beleidigung im öffentlichen Raum", body: "In einer Sitzung wird eine neue Kollegin wegen ihrer Herkunft beleidigt. Der Raum schweigt und sieht dich an.", choices: [{ label: "Die Beleidigung stoppen", detail: "Benennen, was geschah, und zu gemeinsamen Regeln zurückkehren." }, { label: "Später nach ihr sehen", detail: "Außerhalb des Raums helfen, ohne öffentliches Risiko." }, { label: "Zur Ruhe aufrufen", detail: "Alle für zu empfindlich erklären und die Sitzung fortsetzen." }, { label: "Den Sprecher demütigen", detail: "Die Sache persönlich machen und die Grenze zum Spektakel machen." }] },
    { title: "Angriff auf einen Aktivisten", body: "Ein Aktivist, der Flussdokumente veröffentlichte, wird Verräter genannt. Die Belege sind da, die Kampagne wächst.", choices: [{ label: "Öffentlich zu den Fakten stehen", detail: "Geprüfte Dokumente teilen und das Recht auf die Frage verteidigen." }, { label: "Privat unterstützen", detail: "Sagen, dass er nicht allein ist, ohne öffentliche Spur." }, { label: "Alle Details abwarten", detail: "Reagieren, nachdem die Kampagne die Geschichte bestimmt hat." }, { label: "Ihre Familien angreifen", detail: "Druck mit derselben Art von Druck beantworten." }] },
    { title: "Institutionelles Unrecht", body: "Eine Behörde lehnt den Antrag einer alleinerziehenden Mutter ohne schriftliche Begründung ab. Du kennst das Verfahren.", choices: [{ label: "Schriftlichen Bescheid verlangen", detail: "Ruhig auf dem Verfahren bestehen und am Schalter bei ihr bleiben." }, { label: "Bei den Unterlagen helfen", detail: "Später helfen, ohne die öffentliche Verantwortungsfrage zu stellen." }, { label: "Die Institution arbeiten lassen", detail: "Annehmen, dass es einen unbekannten Grund gibt." }, { label: "Alle am Schalter angreifen", detail: "Auch Mitarbeitende beschuldigen, die nicht entscheiden." }] },
    { title: "Verantwortung wird relativiert", body: "In einer Debatte wird ein Verbrechen zur abstrakten 'schweren Zeit' ohne Opfer und Verantwortliche.", choices: [{ label: "Fakten und Namen zurückbringen", detail: "Geprüfte Quellen nutzen und Erklärung von Rechtfertigung trennen." }, { label: "Privat widersprechen", detail: "Im engen Kreis widersprechen, ohne die öffentliche Spur zu ändern." }, { label: "Jeder hat seine Wahrheit", detail: "Behauptungen gleichsetzen, damit das Gespräch angenehm bleibt." }, { label: "Alle zu Mittätern erklären", detail: "Präzise Verantwortung durch Totalanklage ersetzen." }] },
    { title: "Mediale Hetzjagd", body: "Eine Schlagzeile enthüllt die Identität einer Zeugin und macht ihre Geschichte zur Unterhaltung. Die Reichweite wächst.", choices: [{ label: "Löschung und Korrektur verlangen", detail: "Identität schützen, Beleg sichern und Schaden erklären, ohne den Link zu verbreiten." }, { label: "Privat schreiben", detail: "Trost anbieten und den öffentlichen Angriff unbeantwortet lassen." }, { label: "Den Algorithmus nicht füttern", detail: "Nichts tun und Rückzug neutrale Medienkompetenz nennen." }, { label: "Eine Menge gegen den Reporter schicken", detail: "Hetze mit Hetze beantworten und das Thema verlieren." }] },
    { title: "Jetzt brauchst du Unterstützung", body: "Dein Name wurde aus dem Kontext gerissen. Die Institution schweigt; Bekannte warten darauf, dass jemand anderes zuerst spricht.", choices: [{ label: "Überprüfbare Fakten veröffentlichen", detail: "Klar um Unterstützung bitten, ohne Rache zu fordern." }, { label: "Einigen privat schreiben", detail: "Hoffen, dass private Unterstützung von selbst öffentlich wird." }, { label: "Auf Beruhigung warten", detail: "Auf dich dieselbe Vorsicht anwenden, die du von anderen verlangt hast." }, { label: "Allen Verrat vorwerfen", detail: "Die Bitte um Hilfe in einen totalen Loyalitätstest verwandeln." }] },
  ],
  endings: { "entered-everything": { title: "Du warst in jedem Konflikt", body: "Du hattest zu oft recht, als dass noch jemand zuhörte. Grenzen verschwanden im dauernden Streit." }, "boundary-drawn": { title: "Eine Grenze wurde gezogen", body: "Du hast nicht den Lärm gewählt, sondern die Grenze. Die Gemeinschaft blieb nicht konfliktfrei, aber auch nicht allein." }, "private-only": { title: "Privat dabei, öffentlich neutral", body: "In privaten Nachrichten warst du ein guter Mensch. Öffentlich konnte das niemand sehen." }, "always-neutral": { title: "Immer neutral", body: "Du hast den Frieden bewahrt. Es war nur niemand mehr da, der ihn mit dir teilen konnte." }, "uneasy-balance": { title: "Eine unvollendete Grenze", body: "Du hast nicht immer geschwiegen, warst aber nicht immer klar, wenn Klarheit nötig war. Die Gemeinschaft blieb zwischen Unterstützung und Warten." } },
  contextEyebrow: "Nach der Stille", contextTitle: "Neutralität ist nicht nur eine Sache", contextIntro: "Die Simulation unterscheidet Zurückhaltung von Rückzug, private Empathie von öffentlicher Wirkung und eine prinzipielle Grenze von ständigem Streit.",
  contextCards: [{ title: "Frieden für wen?", body: "Persönlicher Frieden kann genau dann wachsen, wenn das Risiko auf andere übergeht." }, { title: "Privat ist nicht wertlos", body: "Private Unterstützung hilft einer Person, verändert allein aber selten die öffentliche Erlaubnis für Gewalt oder Unrecht." }, { title: "Eine Grenze ist kein Lärm", body: "Eine klare Grenze kann ruhig, dokumentiert und strategisch sein. Sie ist nicht dasselbe wie jeder Konflikt." }],
  disclaimer: "Dies ist eine redaktionelle Simulation von Folgen, kein politischer Reinheitstest und kein Aufruf zu riskantem Verhalten.", shareText: "Mein Ergebnis in Der neutrale Mensch:", searchKeywords: ["neutraler Mensch", "Neutralität", "Solidarität", "Schweigen", "öffentliche Unterstützung", "Grenze"],
};

const es: NeutralManLocaleCopy = {
  ...en,
  sectionLabel: "Interactivo", gameTitle: "El hombre neutral", gameSubtitle: "No eligió bando. Simplemente dejó que ganara el más fuerte.", seoDescription: "Simulación social interactiva sobre neutralidad, solidaridad, apoyo público y los límites que traza una comunidad.", typeLabel: "Simulación social interactiva",
  durationLabel: "Duración", durationValue: "6-8 minutos", openLabel: "Abrir", backLabel: "Todas las historias interactivas", coverAlt: "Portada de El hombre neutral: una persona entre dos grupos",
  introEyebrow: "Erosión social silenciosa", introTitle: "No hace falta gritar para cambiar un desenlace.", introCopy: "Seis veces elegirás entre paz, reputación, solidaridad y límite. Una comunidad recuerda lo que hiciste y lo que evitaste con educación.", startLabel: "Empezar",
  metricPeace: "Paz", metricReputation: "Reputación", metricSolidarity: "Solidaridad", metricBoundary: "Límite", situationLabel: "Situación", communityLabel: "Ecos de la comunidad", mirrorLabel: "La comunidad te devuelve tu frase", decisionLabel: "Decisión",
  restartLabel: "Jugar de nuevo", shareLabel: "Compartir resultado", sharedLabel: "Resultado copiado.", contextLabel: "Entender qué ocurrió", resultEyebrow: "Resultado", resultMetricsTitle: "Lo que quedó", resultChoicesTitle: "Tu huella pública",
  choiceKinds: { boundary: "Límite público", private: "Apoyo privado", neutral: "Neutralidad", impulsive: "Conflicto impulsivo" }, mirrors: { boundary: "Di claramente qué pasó. Estamos aquí.", private: "Te escribiremos. En público no podemos involucrarnos.", neutral: "No conocemos todos los detalles. Ambos lados tienen su versión.", impulsive: "Ahora todos gritan. Nadie oye lo que te pasó." },
  situations: [
    { title: "Un insulto en público", body: "En una reunión insultan a una compañera nueva por su origen. La sala calla y te mira.", choices: [{ label: "Detener el insulto", detail: "Nombrar lo ocurrido y volver a las reglas comunes." }, { label: "Apoyarla después", detail: "Ofrecer apoyo fuera de la sala sin riesgo público." }, { label: "Pedir calma", detail: "Decir que todos están demasiado sensibles y continuar." }, { label: "Humillar a quien habló", detail: "Volverlo personal y convertir el límite en espectáculo." }] },
    { title: "Ataque a un activista", body: "Al activista que publicó documentos del río lo llaman traidor. Las pruebas existen, la campaña crece.", choices: [{ label: "Defender públicamente los hechos", detail: "Compartir documentos verificados y defender el derecho a preguntar." }, { label: "Enviar apoyo privado", detail: "Decirle que no está solo sin dejar huella pública." }, { label: "Esperar todos los detalles", detail: "Retrasar la reacción mientras la campaña define el relato." }, { label: "Atacar a sus familias", detail: "Responder a la presión con la misma presión." }] },
    { title: "Injusticia institucional", body: "Una oficina rechaza la solicitud de una madre sola sin razón escrita. Conoces el procedimiento y estás allí.", choices: [{ label: "Exigir una decisión escrita", detail: "Insistir con calma en el procedimiento y permanecer a su lado." }, { label: "Ayudar con los documentos", detail: "Arreglarlos después sin plantear responsabilidad pública." }, { label: "Dejar trabajar a la institución", detail: "Suponer que existe una razón que aún no conoces." }, { label: "Atacar a todo el mostrador", detail: "Culpar incluso a quienes no toman la decisión." }] },
    { title: "Responsabilidad relativizada", body: "En un debate, un crimen se convierte en una abstracta 'época difícil' sin víctimas ni responsables.", choices: [{ label: "Devolver hechos y nombres", detail: "Usar fuentes verificadas y separar explicación de justificación." }, { label: "Discrepar en privado", detail: "Hablar con personas cercanas sin cambiar el registro público." }, { label: "Todos tienen su verdad", detail: "Igualar afirmaciones para mantener una conversación agradable." }, { label: "Declarar cómplices a todos", detail: "Sustituir responsabilidad precisa por acusación total." }] },
    { title: "Linchamiento mediático", body: "Un titular revela la identidad de una testigo y convierte su historia en entretenimiento. La audiencia aumenta.", choices: [{ label: "Pedir retirada y corrección", detail: "Proteger la identidad, guardar pruebas y explicar el daño sin difundir el enlace." }, { label: "Escribirle en privado", detail: "Ofrecer consuelo dejando sin respuesta el ataque público." }, { label: "No alimentar al algoritmo", detail: "No hacer nada y llamar neutralidad mediática a retirarse." }, { label: "Lanzar una multitud contra el periodista", detail: "Responder al linchamiento con otro y perder el tema." }] },
    { title: "Ahora tú necesitas apoyo", body: "Tu nombre ha sido sacado de contexto. La institución calla y tus conocidos esperan que otra persona hable primero.", choices: [{ label: "Publicar hechos verificables", detail: "Pedir apoyo con claridad sin llamar a la venganza." }, { label: "Escribir a unas pocas personas", detail: "Esperar que el apoyo privado se vuelva público por sí solo." }, { label: "Esperar a que baje la tensión", detail: "Aplicarte la misma cautela que exigiste a otros." }, { label: "Acusar a todos de traición", detail: "Convertir la petición de apoyo en una prueba de lealtad total." }] },
  ],
  endings: { "entered-everything": { title: "Entraste en todos los conflictos", body: "Tuviste razón demasiadas veces para que alguien escuchara. Los límites se perdieron en la confrontación constante." }, "boundary-drawn": { title: "Se trazó un límite", body: "No elegiste el ruido. Elegiste el límite. La comunidad no quedó sin conflicto, pero tampoco quedó sola." }, "private-only": { title: "Apoyo privado, neutralidad pública", body: "Fuiste buena persona en los mensajes privados. En público nadie pudo verlo." }, "always-neutral": { title: "Siempre neutral", body: "Conservaste la paz. Simplemente ya no quedaba nadie con quien compartirla." }, "uneasy-balance": { title: "Un límite inacabado", body: "No siempre callaste, pero tampoco fuiste claro cuando hacía falta. La comunidad quedó entre el apoyo y la espera." } },
  contextEyebrow: "Después del silencio", contextTitle: "La neutralidad no es una sola cosa", contextIntro: "La simulación distingue la contención de la retirada, la empatía privada del efecto público y un límite de principios del conflicto permanente.",
  contextCards: [{ title: "¿Paz para quién?", body: "La paz personal puede crecer justo cuando el riesgo pasa a otra persona." }, { title: "Lo privado no carece de valor", body: "El apoyo privado ayuda a una persona, pero rara vez cambia por sí solo el permiso público para la violencia o la injusticia." }, { title: "Un límite no es ruido", body: "Un límite claro puede ser sereno, documentado y estratégico. No equivale a entrar en cada conflicto." }],
  disclaimer: "Esta es una simulación editorial de consecuencias, no una prueba de pureza política ni una invitación a conductas de riesgo.", shareText: "Mi resultado en El hombre neutral:", searchKeywords: ["hombre neutral", "neutralidad", "solidaridad", "silencio", "apoyo público", "límite"],
};

const el: NeutralManLocaleCopy = {
  ...en,
  sectionLabel: "Διαδραστικά", gameTitle: "Ο ουδέτερος άνθρωπος", gameSubtitle: "Δεν διάλεξε πλευρά. Απλώς άφησε τον ισχυρότερο να νικήσει.", seoDescription: "Διαδραστική κοινωνική προσομοίωση για την ουδετερότητα, την αλληλεγγύη, τη δημόσια στήριξη και τα όρια της κοινότητας.", typeLabel: "Διαδραστική κοινωνική προσομοίωση",
  durationLabel: "Διάρκεια", durationValue: "6-8 λεπτά", openLabel: "Άνοιγμα", backLabel: "Όλες οι διαδραστικές ιστορίες", coverAlt: "Εξώφυλλο του παιχνιδιού Ο ουδέτερος άνθρωπος: ένα άτομο ανάμεσα σε δύο ομάδες",
  introEyebrow: "Σιωπηλή κοινωνική διάβρωση", introTitle: "Δεν χρειάζεται να φωνάξεις για να αλλάξεις μια έκβαση.", introCopy: "Έξι φορές θα επιλέξεις ανάμεσα στην ειρήνη, την υπόληψη, την αλληλεγγύη και το όριο. Η κοινότητα θυμάται όσα έκανες και όσα απέφυγες ευγενικά.", startLabel: "Έναρξη",
  metricPeace: "Ειρήνη", metricReputation: "Υπόληψη", metricSolidarity: "Αλληλεγγύη", metricBoundary: "Όριο", situationLabel: "Κατάσταση", communityLabel: "Απόηχοι κοινότητας", mirrorLabel: "Η κοινότητα σου επιστρέφει τη φράση σου", decisionLabel: "Απόφαση",
  restartLabel: "Παίξε ξανά", shareLabel: "Κοινοποίηση αποτελέσματος", sharedLabel: "Το αποτέλεσμα αντιγράφηκε.", contextLabel: "Κατανόησε τι συνέβη", resultEyebrow: "Έκβαση", resultMetricsTitle: "Τι απέμεινε", resultChoicesTitle: "Το δημόσιο ίχνος σου",
  choiceKinds: { boundary: "Δημόσιο όριο", private: "Ιδιωτική στήριξη", neutral: "Ουδετερότητα", impulsive: "Παρορμητική σύγκρουση" }, mirrors: { boundary: "Πες καθαρά τι συνέβη. Είμαστε εδώ.", private: "Θα σου γράψουμε. Δημόσια δεν μπορούμε να εμπλακούμε.", neutral: "Δεν ξέρουμε όλες τις λεπτομέρειες. Και οι δύο πλευρές έχουν τη δική τους ιστορία.", impulsive: "Τώρα όλοι φωνάζουν. Κανείς δεν ακούει τι σου συνέβη." },
  situations: [
    { title: "Προσβολή σε δημόσιο χώρο", body: "Σε μια συνάντηση προσβάλλουν μια νέα συνάδελφο για την καταγωγή της. Η αίθουσα σωπαίνει και σε κοιτάζει.", choices: [{ label: "Σταμάτησε την προσβολή", detail: "Ονόμασε τι συνέβη και επέστρεψε στους κοινούς κανόνες." }, { label: "Στήριξέ την αργότερα", detail: "Πρόσφερε στήριξη εκτός αίθουσας χωρίς δημόσιο ρίσκο." }, { label: "Ζήτησε ηρεμία", detail: "Πες ότι όλοι είναι υπερβολικά ευαίσθητοι και συνέχισε τη συνάντηση." }, { label: "Ταπείνωσε τον ομιλητή", detail: "Κάνε το προσωπικό και μετέτρεψε το όριο σε θέαμα." }] },
    { title: "Επίθεση σε ακτιβιστή", body: "Ο ακτιβιστής που δημοσίευσε έγγραφα για το ποτάμι αποκαλείται προδότης. Τα στοιχεία υπάρχουν, η εκστρατεία μεγαλώνει.", choices: [{ label: "Στάσου δημόσια με τα γεγονότα", detail: "Μοιράσου επαληθευμένα έγγραφα και υπερασπίσου το δικαίωμα στην ερώτηση." }, { label: "Στείλε ιδιωτική στήριξη", detail: "Πες του ότι δεν είναι μόνος χωρίς δημόσιο ίχνος." }, { label: "Περίμενε όλες τις λεπτομέρειες", detail: "Καθυστέρησε ενώ η εκστρατεία ορίζει την ιστορία." }, { label: "Στόχευσε τις οικογένειές τους", detail: "Απάντησε στην πίεση με την ίδια πίεση." }] },
    { title: "Θεσμική αδικία", body: "Μια υπηρεσία απορρίπτει αίτημα μονογονέα χωρίς γραπτή αιτιολογία. Γνωρίζεις τη διαδικασία και είσαι εκεί.", choices: [{ label: "Ζήτησε γραπτή απόφαση", detail: "Επέμεινε ήρεμα στη διαδικασία και μείνε δίπλα της." }, { label: "Βοήθησε με τα έγγραφα", detail: "Διόρθωσέ τα αργότερα, μακριά από το δημόσιο ζήτημα ευθύνης." }, { label: "Άφησε τον θεσμό να εργαστεί", detail: "Υπόθεσε ότι υπάρχει λόγος που ακόμη αγνοείς." }, { label: "Επιτέσου σε όλους στο γκισέ", detail: "Κατηγόρησε ακόμη κι όσους δεν αποφασίζουν." }] },
    { title: "Σχετικοποίηση ευθύνης", body: "Σε δημόσια συζήτηση ένα έγκλημα γίνεται μια αφηρημένη 'δύσκολη εποχή' χωρίς θύματα και υπεύθυνους.", choices: [{ label: "Επανέφερε γεγονότα και ονόματα", detail: "Χρησιμοποίησε επαληθευμένες πηγές και χώρισε εξήγηση από δικαιολόγηση." }, { label: "Διαφώνησε ιδιωτικά", detail: "Μίλησε σε κοντινούς ανθρώπους χωρίς να αλλάξεις το δημόσιο αρχείο." }, { label: "Ο καθένας έχει την αλήθεια του", detail: "Εξίσωσε ισχυρισμούς για να μείνει ευχάριστη η συζήτηση." }, { label: "Πες όλους συνένοχους", detail: "Αντικατάστησε την ακριβή ευθύνη με συνολική κατηγορία." }] },
    { title: "Μιντιακός διασυρμός", body: "Ένας τίτλος αποκαλύπτει την ταυτότητα μάρτυρα και κάνει την ιστορία της θέαμα. Η προβολή αυξάνεται.", choices: [{ label: "Ζήτησε αφαίρεση και διόρθωση", detail: "Προστάτεψε την ταυτότητα, κράτησε στοιχεία και εξήγησε τη βλάβη χωρίς διάδοση του συνδέσμου." }, { label: "Γράψε της ιδιωτικά", detail: "Πρόσφερε παρηγοριά αφήνοντας αναπάντητη τη δημόσια επίθεση." }, { label: "Μην τροφοδοτείς τον αλγόριθμο", detail: "Μην κάνεις τίποτα και ονόμασε την απόσυρση ουδέτερη παιδεία στα μέσα." }, { label: "Στρέψε πλήθος κατά του δημοσιογράφου", detail: "Απάντησε στον διασυρμό με διασυρμό και χάσε το θέμα." }] },
    { title: "Τώρα χρειάζεσαι εσύ στήριξη", body: "Το όνομά σου βγήκε από τα συμφραζόμενα. Ο θεσμός σωπαίνει και οι γνωστοί περιμένουν να μιλήσει πρώτος κάποιος άλλος.", choices: [{ label: "Δημοσίευσε επαληθεύσιμα γεγονότα", detail: "Ζήτησε καθαρά στήριξη χωρίς εκδίκηση." }, { label: "Γράψε ιδιωτικά σε λίγους", detail: "Ελπίζεις ότι η ιδιωτική στήριξη θα γίνει μόνη της δημόσια." }, { label: "Περίμενε να πέσει η ένταση", detail: "Εφάρμοσε στον εαυτό σου την ίδια προσοχή που ζήτησες από άλλους." }, { label: "Κατηγόρησε όλους για προδοσία", detail: "Κάνε το αίτημα στήριξης τεστ απόλυτης πίστης." }] },
  ],
  endings: { "entered-everything": { title: "Μπήκες σε κάθε σύγκρουση", body: "Είχες δίκιο πολύ συχνά για να σε ακούσει κανείς. Τα όρια χάθηκαν στη μόνιμη αντιπαράθεση." }, "boundary-drawn": { title: "Το όριο χαράχτηκε", body: "Δεν διάλεξες τον θόρυβο. Διάλεξες το όριο. Η κοινότητα δεν έμεινε χωρίς σύγκρουση, αλλά δεν έμεινε και μόνη." }, "private-only": { title: "Ιδιωτική στήριξη, δημόσια ουδετερότητα", body: "Ήσουν καλός άνθρωπος στα ιδιωτικά μηνύματα. Δημόσια δεν φαινόταν." }, "always-neutral": { title: "Πάντα ουδέτερος", body: "Διατήρησες την ειρήνη. Απλώς δεν είχε μείνει κανείς για να τη μοιραστεί μαζί σου." }, "uneasy-balance": { title: "Ανολοκλήρωτο όριο", body: "Δεν σώπασες πάντα, αλλά δεν ήσουν πάντα σαφής όταν χρειαζόταν. Η κοινότητα έμεινε ανάμεσα στη στήριξη και την αναμονή." } },
  contextEyebrow: "Μετά τη σιωπή", contextTitle: "Η ουδετερότητα δεν είναι ένα πράγμα", contextIntro: "Η προσομοίωση ξεχωρίζει την αυτοσυγκράτηση από την απόσυρση, την ιδιωτική ενσυναίσθηση από το δημόσιο αποτέλεσμα και το όριο αρχών από τη μόνιμη σύγκρουση.",
  contextCards: [{ title: "Ειρήνη για ποιον;", body: "Η προσωπική ειρήνη μπορεί να αυξάνεται όταν το ρίσκο περνά σε κάποιον άλλο." }, { title: "Το ιδιωτικό δεν είναι άχρηστο", body: "Η ιδιωτική στήριξη βοηθά ένα άτομο, αλλά μόνη της σπάνια αλλάζει τη δημόσια άδεια για βία ή αδικία." }, { title: "Το όριο δεν είναι θόρυβος", body: "Ένα σαφές όριο μπορεί να είναι ήρεμο, τεκμηριωμένο και στρατηγικό. Δεν είναι κάθε σύγκρουση." }],
  disclaimer: "Πρόκειται για συντακτική προσομοίωση συνεπειών, όχι για τεστ πολιτικής καθαρότητας ή πρόσκληση σε επικίνδυνη δράση.", shareText: "Το αποτέλεσμά μου στον Ουδέτερο άνθρωπο:", searchKeywords: ["ουδέτερος άνθρωπος", "ουδετερότητα", "αλληλεγγύη", "σιωπή", "δημόσια στήριξη", "όριο"],
};

const ar: NeutralManLocaleCopy = {
  ...en,
  sectionLabel: "تفاعلي", gameTitle: "الرجل المحايد", gameSubtitle: "لم يختر طرفاً. ترك الأقوى ينتصر فحسب.", seoDescription: "محاكاة اجتماعية تفاعلية عن الحياد والتضامن والدعم العلني والحدود التي يرسمها المجتمع.", typeLabel: "محاكاة اجتماعية تفاعلية",
  durationLabel: "المدة", durationValue: "6-8 دقائق", openLabel: "افتح", backLabel: "كل القصص التفاعلية", coverAlt: "غلاف لعبة الرجل المحايد: شخص يقف بين مجموعتين",
  introEyebrow: "تآكل اجتماعي صامت", introTitle: "لا تحتاج إلى الصراخ كي تغيّر النتيجة.", introCopy: "ستختار ست مرات بين السلام والسمعة والتضامن والحد. يتذكر المجتمع ما فعلته وما تجنبته بأدب.", startLabel: "ابدأ",
  metricPeace: "السلام", metricReputation: "السمعة", metricSolidarity: "التضامن", metricBoundary: "الحد", situationLabel: "الموقف", communityLabel: "أصداء المجتمع", mirrorLabel: "يعيد المجتمع إليك عبارتك", decisionLabel: "القرار",
  restartLabel: "العب مجدداً", shareLabel: "شارك النتيجة", sharedLabel: "نُسخت النتيجة.", contextLabel: "افهم ما حدث", resultEyebrow: "النتيجة", resultMetricsTitle: "ما الذي بقي", resultChoicesTitle: "أثرك العلني",
  choiceKinds: { boundary: "حد علني", private: "دعم خاص", neutral: "حياد", impulsive: "صدام اندفاعي" }, mirrors: { boundary: "قل بوضوح ما حدث. نحن هنا.", private: "سنراسلك. لا نستطيع التدخل علناً.", neutral: "لا نعرف كل التفاصيل. لكل طرف روايته.", impulsive: "الجميع يصرخ الآن. لا أحد يسمع ما حدث لك." },
  situations: [
    { title: "إهانة في مكان عام", body: "في اجتماع، يهين شخص زميلة جديدة بسبب أصلها. تصمت القاعة وتنظر إليك.", choices: [{ label: "أوقف الإهانة", detail: "سمِّ ما حدث وأعد النقاش إلى القواعد التي تسري على الجميع." }, { label: "ساندها لاحقاً", detail: "قدّم الدعم خارج القاعة من دون مخاطرة علنية." }, { label: "ادعُ إلى الهدوء", detail: "قل إن الجميع شديد الحساسية وإن الاجتماع يجب أن يستمر." }, { label: "أهن المتحدث", detail: "حوّل الأمر إلى هجوم شخصي واستعراض." }] },
    { title: "هجوم على ناشط", body: "يوصف الناشط الذي نشر وثائق النهر بالخائن. الأدلة متاحة، لكن الحملة تتسع.", choices: [{ label: "قف علناً مع الحقائق", detail: "شارك الوثائق المتحقق منها ودافع عن حق طرح السؤال." }, { label: "أرسل دعماً خاصاً", detail: "أخبره أنه ليس وحده من دون أثر علني." }, { label: "انتظر كل التفاصيل", detail: "أخّر ردك بينما تفرض الحملة روايتها." }, { label: "استهدف عائلاتهم", detail: "أجب الضغط بالنوع نفسه من الضغط." }] },
    { title: "ظلم مؤسسي", body: "ترفض دائرة طلب أم تعيل أسرتها من دون تعليل مكتوب. تعرف الإجراء وأنت حاضر.", choices: [{ label: "اطلب قراراً مكتوباً", detail: "أصر بهدوء على الإجراء وابق إلى جانبها عند الشباك." }, { label: "ساعدها في الأوراق", detail: "رتب الملف لاحقاً بعيداً عن سؤال المساءلة العلني." }, { label: "دع المؤسسة تعمل", detail: "افترض وجود سبب لا تعرفه بعد." }, { label: "هاجم الجميع عند الشباك", detail: "اتهم كل الموظفين، بمن فيهم من لا يقرر." }] },
    { title: "تمييع المسؤولية", body: "في نقاش علني، تتحول الجريمة إلى 'زمن صعب' مجرد بلا ضحايا ولا مسؤولين.", choices: [{ label: "أعد الحقائق والأسماء", detail: "استخدم مصادر موثقة وافصل التفسير عن التبرير." }, { label: "اعترض في الخاص", detail: "عبّر للمقربين عن رفضك من دون تغيير السجل العلني." }, { label: "لكل شخص حقيقته", detail: "ساوِ بين الادعاءات كي يبقى النقاش مريحاً." }, { label: "اتهم الجميع بالتواطؤ", detail: "استبدل المسؤولية الدقيقة باتهام شامل." }] },
    { title: "حملة تشهير إعلامية", body: "يكشف عنوان هوية شاهدة ويحوّل قصتها إلى ترفيه. يزداد عدد من يشاهدونه.", choices: [{ label: "اطلب الحذف والتصحيح", detail: "احمِ الهوية واحتفظ بالدليل واشرح الضرر من دون نشر الرابط." }, { label: "راسلها في الخاص", detail: "قدّم مواساة واترك الهجوم العلني بلا رد." }, { label: "لا تغذِّ الخوارزمية", detail: "لا تفعل شيئاً وسمِّ الانسحاب حياداً إعلامياً." }, { label: "حرّك حشداً ضد الصحفي", detail: "أجب التشهير بتشهير آخر وأضع الموضوع." }] },
    { title: "أنت الآن بحاجة إلى الدعم", body: "أُخرج اسمك من سياقه. المؤسسة صامتة ومن تعرفهم ينتظرون شخصاً آخر ليتكلم أولاً.", choices: [{ label: "انشر حقائق قابلة للتحقق", detail: "اطلب الدعم بوضوح من دون دعوة إلى الانتقام." }, { label: "راسل قلة في الخاص", detail: "تأمل أن يتحول الدعم الخاص إلى علني وحده." }, { label: "انتظر هدوء التوتر", detail: "طبّق على نفسك الحذر نفسه الذي طلبته من الآخرين." }, { label: "اتهم الجميع بالخيانة", detail: "حوّل طلب الدعم إلى اختبار ولاء مطلق." }] },
  ],
  endings: { "entered-everything": { title: "دخلت كل صراع", body: "كنت محقاً مرات كثيرة لدرجة أن أحداً لم يعد يسمعك. ضاعت الحدود في المواجهة الدائمة." }, "boundary-drawn": { title: "رُسم الحد", body: "لم تختر الضجيج، بل اخترت الحد. لم يخلُ المجتمع من الصراع، لكنه لم يُترك وحيداً." }, "private-only": { title: "دعم خاص وحياد علني", body: "كنت إنساناً جيداً في الرسائل الخاصة. في العلن لم ير أحد ذلك." }, "always-neutral": { title: "محايد دائماً", body: "حافظت على السلام. لكن لم يبق أحد يشاركه معك." }, "uneasy-balance": { title: "حد غير مكتمل", body: "لم تصمت دائماً، لكنك لم تكن واضحاً كلما كانت الوضوح ضرورياً. بقي المجتمع بين الدعم والانتظار." } },
  contextEyebrow: "بعد الصمت", contextTitle: "الحياد ليس شيئاً واحداً", contextIntro: "تفرق المحاكاة بين ضبط النفس والانسحاب، وبين التعاطف الخاص والأثر العلني، وبين الحد المبدئي والصراع الدائم.",
  contextCards: [{ title: "السلام لمن؟", body: "قد يزداد السلام الشخصي عندما ينتقل الخطر إلى شخص آخر." }, { title: "الخاص ليس بلا قيمة", body: "يساعد الدعم الخاص الفرد، لكنه نادراً ما يغيّر وحده الإذن العلني بالعنف أو الظلم." }, { title: "الحد ليس ضجيجاً", body: "يمكن أن يكون الحد الواضح هادئاً وموثقاً واستراتيجياً. وهو ليس الدخول في كل صراع." }],
  disclaimer: "هذه محاكاة تحريرية للعواقب، وليست اختبار نقاء سياسي أو دعوة إلى سلوك خطر.", shareText: "نتيجتي في محاكاة الرجل المحايد:", searchKeywords: ["الرجل المحايد", "الحياد", "التضامن", "الصمت", "الدعم العلني", "الحد"],
};

const COPY: Record<Lang, NeutralManLocaleCopy> = { sr, en, tr, fr, de, es, el, ar };

Object.entries(COPY).forEach(([lang, copy]) => {
  if (copy.situations.length !== 6 || copy.situations.some((situation) => situation.choices.length !== 4)) {
    throw new Error(`Incomplete Neutral Man copy for ${lang}.`);
  }
});

export function getNeutralManCopy(lang: Lang) {
  return COPY[lang];
}

export function getNeutralManSearchKeywords(lang: Lang) {
  const copy = COPY[lang];
  return [copy.gameTitle, copy.gameSubtitle, copy.typeLabel, copy.seoDescription, ...copy.searchKeywords];
}
