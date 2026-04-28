import type { Lang } from "@/lib/i18n";

export type AirQualityCityId = string;

export type AirQualityStatus = "good" | "moderate" | "bad" | "unknown";

export type AirQualityCity = {
  id: AirQualityCityId;
  countryId: string;
  latitude: number;
  longitude: number;
  labels: Record<Lang, string>;
};

export type AirQualityCountryGroup = {
  id: string;
  labels: Record<Lang, string>;
  cities: AirQualityCity[];
};

export type AirQualitySnapshot = {
  cityId: AirQualityCityId;
  cityLabel: string;
  aqi: number | null;
  status: AirQualityStatus;
  pm2_5: number | null;
  pm10: number | null;
  measuredAt: string | null;
  fallbackUsed: boolean;
  available: boolean;
};

function createCity(
  countryId: string,
  id: string,
  latitude: number,
  longitude: number,
  labels: Record<Lang, string>
): AirQualityCity {
  return {
    id,
    countryId,
    latitude,
    longitude,
    labels
  };
}

export const airQualityCountryGroups: AirQualityCountryGroup[] = [
  {
    id: "serbia",
    labels: {
      sr: "Srbija",
      en: "Serbia",
      tr: "Sirbistan",
      fr: "Serbie",
      de: "Serbien"
    },
    cities: [
      createCity("serbia", "belgrade", 44.8176, 20.4633, {
        sr: "Beograd",
        en: "Belgrade",
        tr: "Belgrad",
        fr: "Belgrade",
        de: "Belgrad"
      }),
      createCity("serbia", "novi-sad", 45.2671, 19.8335, {
        sr: "Novi Sad",
        en: "Novi Sad",
        tr: "Novi Sad",
        fr: "Novi Sad",
        de: "Novi Sad"
      }),
      createCity("serbia", "nis", 43.3209, 21.8958, {
        sr: "Nis",
        en: "Nis",
        tr: "Nis",
        fr: "Nis",
        de: "Nis"
      }),
      createCity("serbia", "novi-pazar", 43.13667, 20.51222, {
        sr: "Novi Pazar",
        en: "Novi Pazar",
        tr: "Novi Pazar",
        fr: "Novi Pazar",
        de: "Novi Pazar"
      }),
      createCity("serbia", "kragujevac", 44.0128, 20.9114, {
        sr: "Kragujevac",
        en: "Kragujevac",
        tr: "Kragujevac",
        fr: "Kragujevac",
        de: "Kragujevac"
      })
    ]
  },
  {
    id: "bosnia",
    labels: {
      sr: "Bosna i Hercegovina",
      en: "Bosnia and Herzegovina",
      tr: "Bosna Hersek",
      fr: "Bosnie-Herzegovine",
      de: "Bosnien und Herzegowina"
    },
    cities: [
      createCity("bosnia", "sarajevo", 43.8563, 18.4131, {
        sr: "Sarajevo",
        en: "Sarajevo",
        tr: "Saraybosna",
        fr: "Sarajevo",
        de: "Sarajevo"
      }),
      createCity("bosnia", "banja-luka", 44.7722, 17.191, {
        sr: "Banja Luka",
        en: "Banja Luka",
        tr: "Banja Luka",
        fr: "Banja Luka",
        de: "Banja Luka"
      })
    ]
  },
  {
    id: "croatia",
    labels: {
      sr: "Hrvatska",
      en: "Croatia",
      tr: "Hirvatistan",
      fr: "Croatie",
      de: "Kroatien"
    },
    cities: [
      createCity("croatia", "zagreb", 45.815, 15.9819, {
        sr: "Zagreb",
        en: "Zagreb",
        tr: "Zagreb",
        fr: "Zagreb",
        de: "Zagreb"
      }),
      createCity("croatia", "split", 43.5081, 16.4402, {
        sr: "Split",
        en: "Split",
        tr: "Split",
        fr: "Split",
        de: "Split"
      }),
      createCity("croatia", "rijeka", 45.3271, 14.4422, {
        sr: "Rijeka",
        en: "Rijeka",
        tr: "Rijeka",
        fr: "Rijeka",
        de: "Rijeka"
      })
    ]
  },
  {
    id: "montenegro",
    labels: {
      sr: "Crna Gora",
      en: "Montenegro",
      tr: "Karadag",
      fr: "Montenegro",
      de: "Montenegro"
    },
    cities: [
      createCity("montenegro", "podgorica", 42.4304, 19.2594, {
        sr: "Podgorica",
        en: "Podgorica",
        tr: "Podgorica",
        fr: "Podgorica",
        de: "Podgorica"
      })
    ]
  },
  {
    id: "slovenia",
    labels: {
      sr: "Slovenija",
      en: "Slovenia",
      tr: "Slovenya",
      fr: "Slovenie",
      de: "Slowenien"
    },
    cities: [
      createCity("slovenia", "ljubljana", 46.0569, 14.5058, {
        sr: "Ljubljana",
        en: "Ljubljana",
        tr: "Ljubljana",
        fr: "Ljubljana",
        de: "Ljubljana"
      }),
      createCity("slovenia", "maribor", 46.5547, 15.6459, {
        sr: "Maribor",
        en: "Maribor",
        tr: "Maribor",
        fr: "Maribor",
        de: "Maribor"
      })
    ]
  },
  {
    id: "north-macedonia",
    labels: {
      sr: "Severna Makedonija",
      en: "North Macedonia",
      tr: "Kuzey Makedonya",
      fr: "Macedoine du Nord",
      de: "Nordmazedonien"
    },
    cities: [
      createCity("north-macedonia", "skopje", 41.9981, 21.4254, {
        sr: "Skoplje",
        en: "Skopje",
        tr: "Uskup",
        fr: "Skopje",
        de: "Skopje"
      })
    ]
  },
  {
    id: "greece",
    labels: {
      sr: "Grcka",
      en: "Greece",
      tr: "Yunanistan",
      fr: "Grece",
      de: "Griechenland"
    },
    cities: [
      createCity("greece", "athens", 37.9838, 23.7275, {
        sr: "Atina",
        en: "Athens",
        tr: "Atina",
        fr: "Athenes",
        de: "Athen"
      }),
      createCity("greece", "thessaloniki", 40.6401, 22.9444, {
        sr: "Solun",
        en: "Thessaloniki",
        tr: "Selanik",
        fr: "Thessalonique",
        de: "Thessaloniki"
      })
    ]
  },
  {
    id: "romania",
    labels: {
      sr: "Rumunija",
      en: "Romania",
      tr: "Romanya",
      fr: "Roumanie",
      de: "Rumanien"
    },
    cities: [
      createCity("romania", "bucharest", 44.4268, 26.1025, {
        sr: "Bukurest",
        en: "Bucharest",
        tr: "Bukres",
        fr: "Bucarest",
        de: "Bukarest"
      }),
      createCity("romania", "timisoara", 45.7489, 21.2087, {
        sr: "Temisvar",
        en: "Timisoara",
        tr: "Timisoara",
        fr: "Timisoara",
        de: "Timisoara"
      })
    ]
  },
  {
    id: "bulgaria",
    labels: {
      sr: "Bugarska",
      en: "Bulgaria",
      tr: "Bulgaristan",
      fr: "Bulgarie",
      de: "Bulgarien"
    },
    cities: [
      createCity("bulgaria", "sofia", 42.6977, 23.3219, {
        sr: "Sofija",
        en: "Sofia",
        tr: "Sofya",
        fr: "Sofia",
        de: "Sofia"
      })
    ]
  },
  {
    id: "hungary",
    labels: {
      sr: "Madjarska",
      en: "Hungary",
      tr: "Macaristan",
      fr: "Hongrie",
      de: "Ungarn"
    },
    cities: [
      createCity("hungary", "budapest", 47.4979, 19.0402, {
        sr: "Budimpesta",
        en: "Budapest",
        tr: "Budapeste",
        fr: "Budapest",
        de: "Budapest"
      })
    ]
  },
  {
    id: "austria",
    labels: {
      sr: "Austrija",
      en: "Austria",
      tr: "Avusturya",
      fr: "Autriche",
      de: "Osterreich"
    },
    cities: [
      createCity("austria", "vienna", 48.2082, 16.3738, {
        sr: "Bec",
        en: "Vienna",
        tr: "Viyana",
        fr: "Vienne",
        de: "Wien"
      })
    ]
  },
  {
    id: "turkey",
    labels: {
      sr: "Turska",
      en: "Turkey",
      tr: "Turkiye",
      fr: "Turquie",
      de: "Turkei"
    },
    cities: [
      createCity("turkey", "istanbul", 41.0082, 28.9784, {
        sr: "Istanbul",
        en: "Istanbul",
        tr: "Istanbul",
        fr: "Istanbul",
        de: "Istanbul"
      }),
      createCity("turkey", "ankara", 39.9334, 32.8597, {
        sr: "Ankara",
        en: "Ankara",
        tr: "Ankara",
        fr: "Ankara",
        de: "Ankara"
      })
    ]
  },
  {
    id: "germany",
    labels: {
      sr: "Nemacka",
      en: "Germany",
      tr: "Almanya",
      fr: "Allemagne",
      de: "Deutschland"
    },
    cities: [
      createCity("germany", "berlin", 52.52, 13.405, {
        sr: "Berlin",
        en: "Berlin",
        tr: "Berlin",
        fr: "Berlin",
        de: "Berlin"
      }),
      createCity("germany", "munich", 48.1351, 11.582, {
        sr: "Minhen",
        en: "Munich",
        tr: "Munih",
        fr: "Munich",
        de: "Munchen"
      })
    ]
  },
  {
    id: "france",
    labels: {
      sr: "Francuska",
      en: "France",
      tr: "Fransa",
      fr: "France",
      de: "Frankreich"
    },
    cities: [
      createCity("france", "paris", 48.8566, 2.3522, {
        sr: "Pariz",
        en: "Paris",
        tr: "Paris",
        fr: "Paris",
        de: "Paris"
      })
    ]
  },
  {
    id: "italy",
    labels: {
      sr: "Italija",
      en: "Italy",
      tr: "Italya",
      fr: "Italie",
      de: "Italien"
    },
    cities: [
      createCity("italy", "rome", 41.9028, 12.4964, {
        sr: "Rim",
        en: "Rome",
        tr: "Roma",
        fr: "Rome",
        de: "Rom"
      }),
      createCity("italy", "milan", 45.4642, 9.19, {
        sr: "Milano",
        en: "Milan",
        tr: "Milano",
        fr: "Milan",
        de: "Mailand"
      })
    ]
  },
  {
    id: "united-kingdom",
    labels: {
      sr: "Velika Britanija",
      en: "United Kingdom",
      tr: "Birlesik Krallik",
      fr: "Royaume-Uni",
      de: "Vereinigtes Konigreich"
    },
    cities: [
      createCity("united-kingdom", "london", 51.5072, -0.1276, {
        sr: "London",
        en: "London",
        tr: "Londra",
        fr: "Londres",
        de: "London"
      })
    ]
  }
];

export const airQualityCities: AirQualityCity[] = airQualityCountryGroups.flatMap((country) => country.cities);

export function getAirQualityCity(id?: string | null) {
  return airQualityCities.find((city) => city.id === id) ?? airQualityCities[0];
}

export function getAirQualityCityLabel(city: AirQualityCity, lang: Lang) {
  return city.labels[lang] || city.labels.sr;
}

export function getAirQualityCountryLabel(country: AirQualityCountryGroup, lang: Lang) {
  return country.labels[lang] || country.labels.sr;
}

export function getAirQualityStatus(aqi: number | null): AirQualityStatus {
  if (typeof aqi !== "number" || !Number.isFinite(aqi)) return "unknown";

  // Open-Meteo exposes the European AQI scale. We collapse it into 3 editor-friendly states.
  if (aqi <= 20) return "good";
  if (aqi <= 60) return "moderate";
  return "bad";
}
