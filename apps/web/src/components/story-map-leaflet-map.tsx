"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";

import type { Lang } from "@/lib/i18n";
import type { StoryMapLocationGroup } from "@/lib/story-map";

type StoryMapLeafletMapCopy = {
  mapLoadingTitle: string;
  mapLoadingCopy: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetViewLabel: string;
};

type StoryMapLeafletMapProps = {
  lang: Lang;
  copy: StoryMapLeafletMapCopy;
  groups: StoryMapLocationGroup[];
  activeLocation: string;
  isFiltered: boolean;
  filterStateKey: string;
  resetRevision: number;
  onActivateLocation: (slug: string) => void;
  onResetView: () => void;
};

const STORY_MAP_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const STORY_MAP_TILE_ATTRIBUTION = "Map \u00b7 OpenStreetMap \u00d7 CARTO";
const STORY_MAP_BROAD_LOCATIONS = new Set(["balkan", "srbija", "zapadni-balkan", "palestina"]);

function getDefaultView(lang: Lang) {
  if (lang === "sr") {
    return { center: [43.7, 20.7] as [number, number], zoom: 5 };
  }

  if (lang === "ar") {
    return { center: [34.2, 26.2] as [number, number], zoom: 4 };
  }

  return { center: [36.4, 16.0] as [number, number], zoom: 3 };
}

function getLocationZoom(group: StoryMapLocationGroup) {
  if (STORY_MAP_BROAD_LOCATIONS.has(group.slug)) {
    return group.slug === "palestina" ? 7 : 5;
  }

  if ((group.region || "").toLowerCase().includes("sandzak")) {
    return 8;
  }

  return 8.5;
}

function getMarkerKind(group: StoryMapLocationGroup) {
  if (group.articleCount && group.documentaryCount) return "mixed";
  if (group.documentaryCount) return "documentary";
  return "article";
}

function createMarkerIcon(
  leaflet: typeof import("leaflet"),
  group: StoryMapLocationGroup,
  isActive: boolean
) {
  const markerKind = getMarkerKind(group);
  const classes = [
    "story-map-pin",
    `story-map-pin--${markerKind}`,
    isActive ? "story-map-pin--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return leaflet.divIcon({
    className: "story-map-pin-wrap",
    html: `
      <span class="${classes}">
        <span class="story-map-pin__pulse"></span>
        <span class="story-map-pin__glow"></span>
        <span class="story-map-pin__core"></span>
        <span class="story-map-pin__count">${group.totalCount}</span>
      </span>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });
}

export function StoryMapLeafletMap({
  lang,
  copy,
  groups,
  activeLocation,
  isFiltered,
  filterStateKey,
  resetRevision,
  onActivateLocation,
  onResetView,
}: StoryMapLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [isReady, setIsReady] = useState(false);
  const defaultView = useMemo(() => getDefaultView(lang), [lang]);
  const activeGroup = groups.find((group) => group.slug === activeLocation) || null;

  useEffect(() => {
    let isMounted = true;

    async function bootstrapMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const leaflet = await import("leaflet");
      if (!isMounted || !containerRef.current) {
        return;
      }

      const map = leaflet.map(containerRef.current, {
        attributionControl: false,
        zoomControl: false,
        minZoom: 2,
        maxZoom: 10,
        zoomSnap: 0.5,
        worldCopyJump: true,
        preferCanvas: true,
      });

      leaflet
        .tileLayer(STORY_MAP_TILE_URL, {
          subdomains: "abcd",
          maxZoom: 20,
        })
        .addTo(map);

      map.setView(defaultView.center, defaultView.zoom);

      leafletRef.current = leaflet;
      mapRef.current = map;
      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      setIsReady(true);
      window.setTimeout(() => {
        map.invalidateSize();
      }, 80);
    }

    bootstrapMap();

    return () => {
      isMounted = false;
      markersRef.current.clear();
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      setIsReady(false);
    };
  }, [defaultView.center, defaultView.zoom]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const markerLayer = markerLayerRef.current;
    if (!leaflet || !markerLayer || !isReady) {
      return;
    }

    markerLayer.clearLayers();
    markersRef.current.clear();

    for (const group of groups) {
      const marker = leaflet.marker([group.latitude, group.longitude], {
        icon: createMarkerIcon(leaflet, group, group.slug === activeLocation),
        keyboard: false,
      });

      marker.bindTooltip(group.name, {
        className: "story-map-tooltip",
        direction: "top",
        offset: [0, -18],
        opacity: 1,
        permanent: false,
      });
      marker.on("click", () => onActivateLocation(group.slug));
      marker.addTo(markerLayer);
      markersRef.current.set(group.slug, marker);
    }

    if (activeLocation) {
      markersRef.current.get(activeLocation)?.openTooltip();
    }
  }, [activeLocation, groups, isReady, onActivateLocation]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map) {
      return;
    }

    if (activeGroup) {
      map.flyTo([activeGroup.latitude, activeGroup.longitude], getLocationZoom(activeGroup), {
        animate: true,
        duration: 0.85,
      });
      return;
    }

    if (groups.length && isFiltered) {
      const bounds = leaflet.latLngBounds(
        groups.map((group) => [group.latitude, group.longitude] as [number, number])
      );

      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(0.5), {
          animate: true,
          duration: 0.85,
          maxZoom: groups.length === 1 ? getLocationZoom(groups[0]) : 6,
        });
        return;
      }
    }

    map.flyTo(defaultView.center, defaultView.zoom, {
      animate: true,
      duration: 0.85,
    });
  }, [activeGroup, defaultView, filterStateKey, groups, isFiltered, resetRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [activeLocation, filterStateKey, isReady, resetRevision]);

  return (
    <div className="story-map__map-frame">
      <div ref={containerRef} className="story-map__leaflet" />

      {!isReady ? (
        <div className="story-map__loading">
          <span className="eyebrow">{copy.mapLoadingTitle}</span>
          <h3>{copy.mapLoadingTitle}</h3>
          <p>{copy.mapLoadingCopy}</p>
        </div>
      ) : null}

      <div className="story-map__zoom-controls">
        <button
          type="button"
          className="story-map__zoom-button"
          aria-label={copy.zoomInLabel}
          onClick={() => mapRef.current?.zoomIn()}
        >
          +
        </button>
        <button
          type="button"
          className="story-map__zoom-button"
          aria-label={copy.zoomOutLabel}
          onClick={() => mapRef.current?.zoomOut()}
        >
          -
        </button>
        <button
          type="button"
          className="story-map__zoom-button story-map__zoom-button--reset"
          aria-label={copy.resetViewLabel}
          onClick={onResetView}
        >
          {copy.resetViewLabel}
        </button>
      </div>

      <div className="story-map__attribution">{STORY_MAP_TILE_ATTRIBUTION}</div>
    </div>
  );
}
