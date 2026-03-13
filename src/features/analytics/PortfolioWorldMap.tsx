"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { formatEur } from "@/lib/utils.js";
import type { GeoAllocation } from "@/types/analytics.js";
import {
  CONTINENT_COLORS,
  REGION_CENTROIDS,
  REGION_TO_CONTINENT,
} from "@/utils/geoMapping.js";
import { motion } from "framer-motion";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useState } from "react";
import type { CircleLayerSpecification } from "react-map-gl/maplibre";
import Map, { Layer, Source, useMap } from "react-map-gl/maplibre";

/** GeoJSON Point feature with portfolio region properties. */
interface RegionPointFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: { region: string; value: number; weight: number; color: string };
}

interface RegionFeatureCollection {
  type: "FeatureCollection";
  features: RegionPointFeature[];
}

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const DEFAULT_FILL = "hsl(0, 0%, 50%)";

function getContinentColor(region: string): string {
  const continent = REGION_TO_CONTINENT[region] ?? "Other";
  return CONTINENT_COLORS[continent] ?? DEFAULT_FILL;
}

export interface PortfolioWorldMapProps {
  byRegion: GeoAllocation[];
  isLoading?: boolean;
}

function buildGeoJSON(byRegion: GeoAllocation[]): RegionFeatureCollection {
  const features: RegionPointFeature[] = byRegion
    .filter((r) => r.weight > 0)
    .map((r) => {
      const coords = REGION_CENTROIDS[r.region] ?? REGION_CENTROIDS.Other;
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coords,
        },
        properties: {
          region: r.region,
          value: r.value,
          weight: r.weight,
          color: getContinentColor(r.region),
        },
      };
    });
  return { type: "FeatureCollection", features };
}

const circleLayerStyle: CircleLayerSpecification = {
  id: "region-circles",
  type: "circle",
  source: "portfolio-regions",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["get", "weight"],
      0,
      8,
      25,
      18,
      50,
      28,
      75,
      38,
      100,
      48,
    ],
    "circle-color": ["get", "color"],
    "circle-stroke-width": 2,
    "circle-stroke-color": "rgba(255,255,255,0.8)",
  },
};

function MapTooltip({
  hoveredFeature,
}: {
  hoveredFeature: RegionPointFeature | null;
}) {
  if (!hoveredFeature?.properties) return null;
  const { region, value, weight } = hoveredFeature.properties;
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
      <p className="font-medium">{region}</p>
      <p className="text-muted-foreground text-sm">{formatEur(value)}</p>
      <p className="text-muted-foreground text-xs">{weight.toFixed(1)} %</p>
    </div>
  );
}

function MapContent({
  geojson,
  onHover,
}: {
  geojson: RegionFeatureCollection;
  onHover: (f: RegionPointFeature | null) => void;
}) {
  return (
    <>
      <Source id="portfolio-regions" type="geojson" data={geojson}>
        <Layer {...circleLayerStyle} />
      </Source>
      <MapEventHandler onHover={onHover} />
    </>
  );
}

function MapEventHandler({
  onHover,
}: {
  onHover: (f: RegionPointFeature | null) => void;
}) {
  const { current: map } = useMap();
  useEffect(() => {
    if (!map) return;
    const mapInstance = map.getMap();
    const handleMove = (e: { point: { x: number; y: number } }) => {
      const features = mapInstance.queryRenderedFeatures(
        [e.point.x, e.point.y],
        {
          layers: ["region-circles"],
        },
      );
      const feature =
        features.length > 0
          ? (features[0] as unknown as RegionPointFeature)
          : null;
      onHover(feature);
    };
    const handleLeave = () => onHover(null);
    mapInstance.on("mousemove", handleMove);
    mapInstance.on("mouseleave", handleLeave);
    return () => {
      mapInstance.off("mousemove", handleMove);
      mapInstance.off("mouseleave", handleLeave);
    };
  }, [map, onHover]);
  return null;
}

export function PortfolioWorldMap({
  byRegion,
  isLoading = false,
}: PortfolioWorldMapProps) {
  const [hoveredFeature, setHoveredFeature] =
    useState<RegionPointFeature | null>(null);

  const geojson = useMemo(() => buildGeoJSON(byRegion), [byRegion]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-2xl">
        <CardHeader>
          <CardTitle>Allocation géographique</CardTitle>
          <CardDescription>Carte mondiale du portefeuille</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (byRegion.length === 0 || geojson.features.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl">
        <CardHeader>
          <CardTitle>Allocation géographique</CardTitle>
          <CardDescription>Carte mondiale du portefeuille</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
          Importez un CSV pour afficher la carte.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader>
        <CardTitle>Allocation géographique</CardTitle>
        <CardDescription>
          Exposition par zone (taille proportionnelle au poids)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[400px] w-full overflow-hidden rounded-xl"
        >
          <Map
            initialViewState={{
              longitude: 20,
              latitude: 30,
              zoom: 1.5,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_STYLE}
          >
            <MapContent geojson={geojson} onHover={setHoveredFeature} />
          </Map>
          <MapTooltip hoveredFeature={hoveredFeature} />
        </motion.div>
      </CardContent>
    </Card>
  );
}
