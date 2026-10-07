"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker, Point } from "leaflet";

import type { Lang } from "@/lib/i18n";
import type { StoryMapLocationGroup } from "@/lib/story-map";
import { getStoryMapAuthorBackground, getStoryMapEffect, getStoryMapMarkerKind, summarizeMapStories, type StoryMapAuthor } from "@/lib/story-map-markers";

type StoryMapLeafletMapCopy = {
  mapLoadingTitle: string;
  mapLoadingCopy: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetViewLabel: string;
  textsLabel: string;
  documentariesLabel: string;
  galleriesLabel: string;
};

type StoryMapLeafletMapProps = {
  lang: Lang;
  copy: StoryMapLeafletMapCopy;
  groups: StoryMapLocationGroup[];
  activeLocation: string;
  activeCluster: string[];
  isFiltered: boolean;
  filterStateKey: string;
  resetRevision: number;
  onActivateLocation: (slug: string) => void;
  onActivateCluster: (slugs: string[]) => void;
  onResetView: () => void;
};

type RenderMarker = {
  id: string;
  latitude: number;
  longitude: number;
  totalCount: number;
  articleCount: number;
  documentaryCount: number;
  galleryCount: number;
  authors: StoryMapAuthor[];
  tooltip: string;
  memberSlugs: string[];
  isCluster: boolean;
};

const STORY_MAP_TILE_BASE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const STORY_MAP_TILE_KEY = process.env.NEXT_PUBLIC_CARTO_BASEMAP_KEY?.trim() || "";
const STORY_MAP_TILE_URL = STORY_MAP_TILE_KEY
  ? `${STORY_MAP_TILE_BASE_URL}?key=${encodeURIComponent(STORY_MAP_TILE_KEY)}`
  : STORY_MAP_TILE_BASE_URL;
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

  // Greedy spatial clustering must use canonical identities, never translated label order.
  const working = [...groups]
    .sort((left, right) => left.latitude - right.latitude || left.longitude - right.longitude || left.slug.localeCompare(right.slug, "en"))
    .map((group) => ({
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
    const summary = summarizeMapStories(cluster.members.flatMap((member) => member.entries));
    const latitude = average(cluster.members.map((member) => member.latitude));
    const longitude = average(cluster.members.map((member) => member.longitude));

    return {
      id: cluster.members.length === 1 ? cluster.members[0].slug : `cluster-${index}-${memberSlugs.join("-")}`,
      latitude,
      longitude,
      ...summary,
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
  const contentKind = getStoryMapMarkerKind(marker);
  const markerKind = marker.isCluster ? "cluster" : contentKind;

  const classes = [
    "story-map-pin",
    `story-map-pin--${markerKind}`,
    `story-map-pin--effect-${getStoryMapEffect(marker.authors)}`,
    isActive ? "story-map-pin--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const pinIcon = '<svg viewBox="0 0 24 24"><path d="M12 22s7-8 7-13a7 7 0 0 0-14 0c0 5 7 13 7 13Z"/><circle cx="12" cy="9" r="2"/></svg>';
  const playIcon = '<svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z"/></svg>';
  const photoIcon = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 18 5-5 3 3 4-6 5 8"/></svg>';
  const typeIcons = [marker.articleCount ? pinIcon : "", marker.documentaryCount ? playIcon : "", marker.galleryCount ? photoIcon : ""].filter(Boolean).join("");
  const html = `
    <span class="${classes}" style="--map-author-background:${getStoryMapAuthorBackground(marker.authors)};--map-author-color:${marker.authors[0]?.color || "#334155"}">
      ${markerKind === "article" ? '<span class="story-map-pin__tail"></span>' : ""}
      <span class="story-map-pin__visual">
        <span class="story-map-pin__core"></span>
        <span class="story-map-pin__count">${marker.totalCount}</span>
        <span class="story-map-pin__types" aria-hidden="true">${typeIcons}</span>
      </span>
    </span>`;

  return leaflet.divIcon({
    className: "story-map-pin-wrap",
    html,
    iconSize: markerKind === "article" ? [58, 74] : [62, 62],
    iconAnchor: markerKind === "article" ? [29, 68] : [31, 31],
  });
}

export function StoryMapLeafletMap({
  lang,
  copy,
  groups,
  activeLocation,
  activeCluster,
  isFiltered,
  filterStateKey,
  resetRevision,
  onActivateLocation,
  onActivateCluster,
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
  const activeGroup = groups.find((group) => group.locationSlugs.includes(activeLocation)) || null;

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
        keyboard: true,
        inertia: true,
        zoomAnimation: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        fadeAnimation: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        markerZoomAnimation: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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

    const renderedIds = new Set(renderMarkers.map((marker) => marker.id));
    for (const [id, marker] of markersRef.current) {
      if (!renderedIds.has(id)) {
        markerLayer.removeLayer(marker);
        markersRef.current.delete(id);
      }
    }

    for (const markerData of renderMarkers) {
      const icon = createMarkerIcon(
        leaflet, markerData,
        markerData.memberSlugs.includes(activeGroup?.slug || activeLocation) || markerData.memberSlugs.some((slug) => activeCluster.includes(slug))
      );
      const accessibleName = `${markerData.tooltip}: ${markerData.totalCount} · ${[
          markerData.articleCount ? `${copy.textsLabel} ${markerData.articleCount}` : "",
          markerData.documentaryCount ? `${copy.documentariesLabel} ${markerData.documentaryCount}` : "",
          markerData.galleryCount ? `${copy.galleriesLabel} ${markerData.galleryCount}` : "",
        ].filter(Boolean).join(", ")}`;
      const existingMarker = markersRef.current.get(markerData.id);
      const marker = existingMarker || leaflet.marker([markerData.latitude, markerData.longitude], {
        icon, keyboard: true, title: accessibleName, bubblingMouseEvents: false,
      });
      if (existingMarker) {
        // Reuse Leaflet's outer element so selection/filter updates retain keyboard focus.
        marker.setLatLng([markerData.latitude, markerData.longitude]);
        marker.setIcon(icon);
        marker.unbindTooltip();
        marker.off("click");
        marker.off("keydown");
      }

      marker.bindTooltip(markerData.tooltip, {
        className: "story-map-tooltip",
        direction: "top",
        offset: [0, -18],
        opacity: 1,
        permanent: false,
      });

      marker.on("click", () => {
        if (markerData.isCluster) {
          onActivateCluster(markerData.memberSlugs);
          return;
        }

        onActivateLocation(markerData.memberSlugs[0]);
      });
      marker.on("keydown", (event) => {
        const keyboardEvent = (event as unknown as { originalEvent?: KeyboardEvent }).originalEvent;
        if (keyboardEvent?.key !== "Enter" && keyboardEvent?.key !== " ") return;
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        marker.fire("click");
      });

      marker.addTo(markerLayer);
      marker.getElement()?.setAttribute("aria-label", accessibleName);
      marker.getElement()?.setAttribute("title", accessibleName);
      markersRef.current.set(markerData.id, marker);
    }

  }, [activeCluster, activeLocation, copy, groups, isReady, onActivateCluster, onActivateLocation, viewRevision]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map) {
      return;
    }

    if (activeGroup) {
      map.flyTo([activeGroup.latitude, activeGroup.longitude], getLocationZoom(activeGroup), {
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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
          animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          duration: 0.8,
          maxZoom: groups.length === 1 ? getLocationZoom(groups[0]) : 5.6,
        });
        return;
      }
    }

    map.flyTo(defaultView.center, defaultView.zoom, {
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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

      <div className="story-map__attribution"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> × <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a></div>
    </div>
  );
}
