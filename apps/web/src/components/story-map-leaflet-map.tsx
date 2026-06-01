"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker, Point } from "leaflet";

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

type RenderMarker = {
  id: string;
  latitude: number;
  longitude: number;
  totalCount: number;
  articleCount: number;
  documentaryCount: number;
  tooltip: string;
  memberSlugs: string[];
  isCluster: boolean;
};

const STORY_MAP_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const STORY_MAP_TILE_CREDIT = "Map | OpenStreetMap x CARTO";
const STORY_MAP_BROAD_LOCATIONS = new Set(["balkan", "srbija", "zapadni-balkan", "palestina"]);

function getDefaultView(lang: Lang) {
  if (lang === "sr") {
    return { center: [44.2, 20.8] as [number, number], zoom: 4.5 };
  }

  if (lang === "ar") {
    return { center: [35.4, 23.5] as [number, number], zoom: 3.5 };
  }

  return { center: [39.2, 18.4] as [number, number], zoom: 3 };
}

function getLocationZoom(group: StoryMapLocationGroup) {
  if (STORY_MAP_BROAD_LOCATIONS.has(group.slug)) {
    return group.slug === "palestina" ? 7 : 5.4;
  }

  if ((group.region || "").toLowerCase().includes("sandzak")) {
    return 9;
  }

  return 8.5;
}

function getMarkerKind(articleCount: number, documentaryCount: number) {
  if (articleCount && documentaryCount) return "mixed";
  if (documentaryCount) return "documentary";
  return "article";
}

function getClusterRadius(zoom: number) {
  if (zoom >= 8) return 26;
  if (zoom >= 6) return 34;
  if (zoom >= 4) return 42;
  return 52;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function buildRenderMarkers(
  leaflet: typeof import("leaflet"),
  map: LeafletMap,
  groups: StoryMapLocationGroup[]
) {
  const zoom = map.getZoom();
  const radius = getClusterRadius(zoom);

  const working = groups.map((group) => ({
    group,
    point: map.project([group.latitude, group.longitude], zoom),
  }));

  const clusters: Array<{
    points: Point[];
    members: StoryMapLocationGroup[];
    center: Point;
  }> = [];

  for (const item of working) {
    const target = clusters.find((cluster) => cluster.center.distanceTo(item.point) <= radius);

    if (!target) {
      clusters.push({
        points: [item.point],
        members: [item.group],
        center: leaflet.point(item.point.x, item.point.y),
      });
      continue;
    }

    target.points.push(item.point);
    target.members.push(item.group);
    target.center = leaflet.point(
      average(target.points.map((point) => point.x)),
      average(target.points.map((point) => point.y))
    );
  }

  return clusters.map((cluster, index) => {
    const memberSlugs = cluster.members.map((member) => member.slug);
    const totalCount = cluster.members.reduce((sum, member) => sum + member.totalCount, 0);
    const articleCount = cluster.members.reduce((sum, member) => sum + member.articleCount, 0);
    const documentaryCount = cluster.members.reduce((sum, member) => sum + member.documentaryCount, 0);
    const latitude = average(cluster.members.map((member) => member.latitude));
    const longitude = average(cluster.members.map((member) => member.longitude));

    return {
      id: cluster.members.length === 1 ? cluster.members[0].slug : `cluster-${index}-${memberSlugs.join("-")}`,
      latitude,
      longitude,
      totalCount,
      articleCount,
      documentaryCount,
      tooltip:
        cluster.members.length === 1
          ? cluster.members[0].name
          : cluster.members
              .slice(0, 3)
              .map((member) => member.name)
              .join(" | "),
      memberSlugs,
      isCluster: cluster.members.length > 1,
    } satisfies RenderMarker;
  });
}

function createMarkerIcon(
  leaflet: typeof import("leaflet"),
  marker: RenderMarker,
  isActive: boolean
) {
  const markerKind = marker.isCluster
    ? "cluster"
    : getMarkerKind(marker.articleCount, marker.documentaryCount);

  const classes = [
    "story-map-pin",
    `story-map-pin--${markerKind}`,
    isActive ? "story-map-pin--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const html = marker.isCluster
    ? `
        <span class="${classes}">
          <span class="story-map-pin__pulse"></span>
          <span class="story-map-pin__glow"></span>
          <span class="story-map-pin__core"></span>
          <span class="story-map-pin__count">${marker.totalCount}</span>
        </span>
      `
    : `
        <span class="${classes}">
          <span class="story-map-pin__pulse"></span>
          <span class="story-map-pin__glow"></span>
          <span class="story-map-pin__tail"></span>
          <span class="story-map-pin__core"></span>
          <span class="story-map-pin__count">${marker.totalCount}</span>
        </span>
      `;

  return leaflet.divIcon({
    className: "story-map-pin-wrap",
    html,
    iconSize: marker.isCluster ? [62, 62] : [58, 74],
    iconAnchor: marker.isCluster ? [31, 31] : [29, 68],
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
  const [viewRevision, setViewRevision] = useState(0);
  const defaultView = useMemo(() => getDefaultView(lang), [lang]);
  const activeGroup = groups.find((group) => group.slug === activeLocation) || null;

  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

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
        maxZoom: 11,
        zoomSnap: 0.25,
        worldCopyJump: true,
        preferCanvas: true,
        dragging: true,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        inertia: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });

      leaflet
        .tileLayer(STORY_MAP_TILE_URL, {
          subdomains: "abcd",
          maxZoom: 20,
          detectRetina: true,
          crossOrigin: true,
          keepBuffer: 3,
          updateWhenZooming: false,
        })
        .addTo(map);

      map.setView(defaultView.center, defaultView.zoom);
      map.on("zoomend moveend resize", () => {
        setViewRevision((value) => value + 1);
      });

      leafletRef.current = leaflet;
      mapRef.current = map;
      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      setIsReady(true);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
          setViewRevision((value) => value + 1);
        });
        resizeObserver.observe(containerRef.current);
      }

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
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      setIsReady(false);
    };
  }, [defaultView.center, defaultView.zoom]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const markerLayer = markerLayerRef.current;
    const map = mapRef.current;
    if (!leaflet || !markerLayer || !map || !isReady) {
      return;
    }

    const renderMarkers = buildRenderMarkers(leaflet, map, groups);

    markerLayer.clearLayers();
    markersRef.current.clear();

    for (const markerData of renderMarkers) {
      const marker = leaflet.marker([markerData.latitude, markerData.longitude], {
        icon: createMarkerIcon(
          leaflet,
          markerData,
          !markerData.isCluster && markerData.memberSlugs[0] === activeLocation
        ),
        keyboard: false,
        bubblingMouseEvents: false,
      });

      marker.bindTooltip(markerData.tooltip, {
        className: "story-map-tooltip",
        direction: "top",
        offset: [0, -18],
        opacity: 1,
        permanent: false,
      });

      marker.on("click", () => {
        if (markerData.isCluster) {
          const members = groups.filter((group) => markerData.memberSlugs.includes(group.slug));
          const bounds = leaflet.latLngBounds(
            members.map((group) => [group.latitude, group.longitude] as [number, number])
          );

          if (bounds.isValid()) {
            map.flyToBounds(bounds.pad(1.1), {
              animate: true,
              duration: 0.75,
              maxZoom: Math.min(map.getZoom() + 2, 9),
            });
            return;
          }
        }

        onActivateLocation(markerData.memberSlugs[0]);
      });

      marker.addTo(markerLayer);
      markersRef.current.set(markerData.id, marker);
    }

  }, [activeLocation, groups, isReady, onActivateLocation, viewRevision]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map) {
      return;
    }

    if (activeGroup) {
      map.flyTo([activeGroup.latitude, activeGroup.longitude], getLocationZoom(activeGroup), {
        animate: true,
        duration: 0.75,
      });
      return;
    }

    if (groups.length) {
      const bounds = leaflet.latLngBounds(
        groups.map((group) => [group.latitude, group.longitude] as [number, number])
      );

      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(isFiltered ? 0.65 : 1.1), {
          animate: true,
          duration: 0.8,
          maxZoom: groups.length === 1 ? getLocationZoom(groups[0]) : 5.6,
        });
        return;
      }
    }

    map.flyTo(defaultView.center, defaultView.zoom, {
      animate: true,
      duration: 0.75,
    });
  }, [activeGroup, defaultView, filterStateKey, groups, isFiltered, resetRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
      setViewRevision((value) => value + 1);
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

      <div className="story-map__attribution">{STORY_MAP_TILE_CREDIT}</div>
    </div>
  );
}
