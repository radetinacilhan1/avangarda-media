import { NextResponse } from "next/server";

import {
  getAirQualityCity,
  getAirQualityCityLabel,
  getAirQualityStatus,
  type AirQualitySnapshot
} from "@/lib/air-quality";
import { resolveLang } from "@/lib/i18n";

type OpenMeteoAirQualityResponse = {
  current?: {
    time?: unknown;
    european_aqi?: unknown;
    pm2_5?: unknown;
    pm10?: unknown;
  };
  hourly?: {
    time?: unknown;
    european_aqi?: unknown;
    pm2_5?: unknown;
    pm10?: unknown;
  };
};

function normalizeAqiValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

function normalizeParticleValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value * 10) / 10
    : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asNumberArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => (typeof item === "number" && Number.isFinite(item) ? item : null))
    : [];
}

function buildSnapshot(
  cityId: AirQualitySnapshot["cityId"],
  cityLabel: string,
  data: Partial<AirQualitySnapshot>
): AirQualitySnapshot {
  const aqi = data.aqi ?? null;

  return {
    cityId,
    cityLabel,
    aqi,
    status: getAirQualityStatus(aqi),
    pm2_5: data.pm2_5 ?? null,
    pm10: data.pm10 ?? null,
    measuredAt: data.measuredAt ?? null,
    fallbackUsed: Boolean(data.fallbackUsed),
    available: Boolean(data.available && aqi !== null)
  };
}

function pickFallbackReading(
  payload: OpenMeteoAirQualityResponse,
  currentTime: string | null
) {
  const times = asStringArray(payload.hourly?.time);
  const aqiValues = asNumberArray(payload.hourly?.european_aqi);
  const pm25Values = asNumberArray(payload.hourly?.pm2_5);
  const pm10Values = asNumberArray(payload.hourly?.pm10);

  for (let index = times.length - 1; index >= 0; index -= 1) {
    const measuredAt = times[index] || null;

    if (currentTime && measuredAt && measuredAt > currentTime) {
      continue;
    }

    const aqi = normalizeAqiValue(aqiValues[index]);
    if (aqi === null) continue;

    return {
      aqi,
      pm2_5: normalizeParticleValue(pm25Values[index]),
      pm10: normalizeParticleValue(pm10Values[index]),
      measuredAt,
      fallbackUsed: true,
      available: true
    };
  }

  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = getAirQualityCity(searchParams.get("city"));
  const lang = resolveLang(searchParams.get("lang") || undefined);
  const cityLabel = getAirQualityCityLabel(city, lang);

  try {
    const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    url.searchParams.set("latitude", String(city.latitude));
    url.searchParams.set("longitude", String(city.longitude));
    url.searchParams.set("current", "european_aqi,pm2_5,pm10");
    url.searchParams.set("hourly", "european_aqi,pm2_5,pm10");
    url.searchParams.set("past_hours", "6");
    url.searchParams.set("forecast_hours", "1");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("domains", "cams_europe");

    const response = await fetch(url, {
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      return NextResponse.json(
        buildSnapshot(city.id, cityLabel, { available: false }),
        {
          headers: {
            "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=300"
          }
        }
      );
    }

    const payload = (await response.json()) as OpenMeteoAirQualityResponse;
    const currentTime = typeof payload.current?.time === "string" ? payload.current.time : null;
    const currentAqi = normalizeAqiValue(payload.current?.european_aqi);

    if (currentAqi !== null) {
      return NextResponse.json(
        buildSnapshot(city.id, cityLabel, {
          aqi: currentAqi,
          pm2_5: normalizeParticleValue(payload.current?.pm2_5),
          pm10: normalizeParticleValue(payload.current?.pm10),
          measuredAt: currentTime,
          fallbackUsed: false,
          available: true
        }),
        {
          headers: {
            "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=900"
          }
        }
      );
    }

    const fallback = pickFallbackReading(payload, currentTime);

    return NextResponse.json(
      fallback
        ? buildSnapshot(city.id, cityLabel, fallback)
        : buildSnapshot(city.id, cityLabel, { available: false }),
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=900"
        }
      }
    );
  } catch {
    return NextResponse.json(
      buildSnapshot(city.id, cityLabel, { available: false }),
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=120, stale-while-revalidate=120"
        }
      }
    );
  }
}
