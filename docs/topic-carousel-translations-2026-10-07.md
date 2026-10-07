# Topic translations and carousel — 2026-10-07

## Production data audit

Production read: `https://cms.avangarda.media/api/topics?sort=id:asc&pagination[pageSize]=100&pagination[withCount]=false`, 24 existing topics. All seven optional translated-name fields already exist in the Strapi schema. Sixteen topics have all seven translated names empty: 112 missing fields. Serbian `name`, identities, slugs, descriptions, timestamps, and relations remain intact. Eight topics with existing translations remain intact, including their current editorial wording.

`apps/cms/src/topic-name-translations.js` fills only null or blank names after verifying each topic's ID, slug, and Serbian name. A transaction locks matching records before writes. Repeating the bootstrap is a no-op once populated. No extra requests are added to frontend rendering. These are supplements to existing Serbian names, which remain the Serbian-language source.

## Missing names supplemented

| ID / slug | Serbian source | English | Turkish | French | German | Spanish | Greek | Arabic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 / topic | Ljudska Prava | Human Rights | İnsan Hakları | Droits humains | Menschenrechte | Derechos humanos | Ανθρώπινα δικαιώματα | حقوق الإنسان |
| 2 / topic-1 | Ekologija | Ecology | Ekoloji | Écologie | Ökologie | Ecología | Οικολογία | البيئة |
| 3 / topic-2 | Politika | Politics | Politika | Politique | Politik | Política | Πολιτική | السياسة |
| 4 / topic-3 | Rad i Ekonomija | Work and Economy | Emek ve Ekonomi | Travail et économie | Arbeit und Wirtschaft | Trabajo y economía | Εργασία και οικονομία | العمل والاقتصاد |
| 5 / topic-4 | Margine | Margins | Marjinler | Marges | Ränder | Márgenes | Περιθώρια | الهوامش |
| 6 / topic-5 | Identitet | Identity | Kimlik | Identité | Identität | Identidad | Ταυτότητα | الهوية |
| 7 / topic-6 | Sećanje I Istorija | Memory and History | Hafıza ve Tarih | Mémoire et histoire | Erinnerung und Geschichte | Memoria e historia | Μνήμη και ιστορία | الذاكرة والتاريخ |
| 8 / topic-7 | Društvo | Society | Toplum | Société | Gesellschaft | Sociedad | Κοινωνία | المجتمع |
| 9 / topic-8 | Kultura | Culture | Kültür | Culture | Kultur | Cultura | Πολιτισμός | الثقافة |
| 10 / topic-9 | Psihologija | Psychology | Psikoloji | Psychologie | Psychologie | Psicología | Ψυχολογία | علم النفس |
| 11 / topic-10 | Rogozna | Rogozna | Rogozna | Rogozna | Rogozna | Rogozna | Ρογκόζνα | روجوزنا |
| 12 / topic-11 | Palestina | Palestine | Filistin | Palestine | Palästina | Palestina | Παλαιστίνη | فلسطين |
| 18 / manjinska-prava | Manjinska Prava | Minority Rights | Azınlık Hakları | Droits des minorités | Minderheitenrechte | Derechos de las minorías | Δικαιώματα των μειονοτήτων | حقوق الأقليات |
| 19 / tranziciona-pravda | Tranziciona pravda | Transitional Justice | Geçiş Dönemi Adaleti | Justice transitionnelle | Übergangsjustiz | Justicia transicional | Μεταβατική δικαιοσύνη | العدالة الانتقالية |
| 20 / zdravlje | Zdravlje | Health | Sağlık | Santé | Gesundheit | Salud | Υγεία | الصحة |
| 24 / obrazovanje | Obrazovanje | Education | Eğitim | Éducation | Bildung | Educación | Εκπαίδευση | التعليم |

The source of topic 6 contains a trailing space. It remains intact. Nonempty source translations are intentionally retained, including Arabic Geopolitika `v` and Turkish Klimatske promene `Değişikliği`; these are editorial corrections outside the missing-field backfill.

## Confirmed carousel causes and changes

The old carousel copied every topic three times, continuously advanced by 0.013 px/ms on every animation frame, did not pause on hover or keyboard focus, used a fractional viewport amount for arrow movement, disabled snapping, and translated hover cards vertically. As a result, stationary pointer targets moved and the viewport could stop partway through cards.

The new finite strip renders each topic once, sizes an integer number of equal cards to the measured available width, and uses mandatory native snapping for swipes and wheel movement. Arrows move by one complete card and stop at the first/last accessible position. Hover only changes colors/borders/shadow. Automatic movement was removed. Arrow-key focus movement and Home/End navigation match reading direction; RTL uses native negative scroll offsets. Arrow animation honors reduced motion. Names wrap in full with a smaller translated topic link beneath them.

The CMS topic resolver now tests whether the actual translated field has text instead of comparing it with Serbian. Intentionally identical translated proper names therefore remain authoritative CMS values.

## Verification

`node apps/cms/scripts/verify-topic-name-translations.cjs` passed: 16 stable identities, all seven translation languages, protection from wrong ID/slug/name, preservation of nonempty editorial translations and original fields/relations, transaction row locks, and no writes on a second run.

Browser validation and production-read confirmation are recorded in the consolidated release report. The backfill table describes planned bootstrap changes until that report confirms production readback.
