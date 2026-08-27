import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { PropertyRecord } from '../types';

interface GoogleMapPolygonsProps {
  properties: PropertyRecord[];
  selectedProperty: PropertyRecord | null;
  hoveredProperty: PropertyRecord | null;
  onSelectProperty: (property: PropertyRecord) => void;
  onHoverProperty: (property: PropertyRecord | null, pos: { x: number; y: number } | null) => void;
}

// Convert property SVG cadastral points / GPS centroid to real geographic polygon bounds
function getPropertyPolygonLatLngs(prop: PropertyRecord): google.maps.LatLngLiteral[] {
  if (!prop.gps) return [];
  const { lat, lng } = prop.gps;

  if (prop.polygonPoints && prop.polygonPoints.length > 0) {
    const avgX = prop.polygonPoints.reduce((acc, p) => acc + p[0], 0) / prop.polygonPoints.length;
    const avgY = prop.polygonPoints.reduce((acc, p) => acc + p[1], 0) / prop.polygonPoints.length;
    
    // Scale factor: roughly 0.0000035 degrees latitude/longitude per SVG unit
    const latScale = 0.0000038;
    const lngScale = 0.0000046;

    return prop.polygonPoints.map(([x, y]) => ({
      lat: lat - (y - avgY) * latScale,
      lng: lng + (x - avgX) * lngScale
    }));
  }

  // Fallback rectangular lot based on extentM2
  const side = Math.sqrt(prop.extentM2 || 200) * 0.000008;
  return [
    { lat: lat + side * 0.5, lng: lng - side * 0.6 },
    { lat: lat + side * 0.5, lng: lng + side * 0.6 },
    { lat: lat - side * 0.5, lng: lng + side * 0.6 },
    { lat: lat - side * 0.5, lng: lng - side * 0.6 }
  ];
}

export const GoogleMapPolygons: React.FC<GoogleMapPolygonsProps> = ({
  properties,
  selectedProperty,
  hoveredProperty,
  onSelectProperty,
  onHoverProperty
}) => {
  const map = useMap();
  const polygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());

  // Initialize and attach polygons to Google Map instance
  useEffect(() => {
    if (!map) return;

    // Clean up existing polygons
    polygonsRef.current.forEach((polygon) => polygon.setMap(null));
    polygonsRef.current.clear();

    properties.forEach((prop) => {
      const paths = getPropertyPolygonLatLngs(prop);
      if (paths.length === 0) return;

      const isSelected = selectedProperty?.id === prop.id;
      const isHovered = hoveredProperty?.id === prop.id;

      const polygon = new google.maps.Polygon({
        paths,
        strokeColor: isSelected ? '#00bcd4' : isHovered ? '#38bdf8' : '#006980',
        strokeOpacity: 0.95,
        strokeWeight: isSelected ? 3 : isHovered ? 2.5 : 1.5,
        fillColor: isSelected ? '#00bcd4' : isHovered ? '#0284c7' : '#006980',
        fillOpacity: isSelected ? 0.45 : isHovered ? 0.35 : 0.22,
        map,
        zIndex: isSelected ? 10 : isHovered ? 5 : 1
      });

      polygon.addListener('mouseover', (e: google.maps.MapMouseEvent & { domEvent?: MouseEvent }) => {
        const clientX = e.domEvent ? e.domEvent.clientX : window.innerWidth / 2;
        const clientY = e.domEvent ? e.domEvent.clientY : window.innerHeight / 2;
        onHoverProperty(prop, { x: clientX, y: clientY });
      });

      polygon.addListener('mousemove', (e: google.maps.MapMouseEvent & { domEvent?: MouseEvent }) => {
        const clientX = e.domEvent ? e.domEvent.clientX : window.innerWidth / 2;
        const clientY = e.domEvent ? e.domEvent.clientY : window.innerHeight / 2;
        onHoverProperty(prop, { x: clientX, y: clientY });
      });

      polygon.addListener('mouseout', () => {
        onHoverProperty(null, null);
      });

      polygon.addListener('click', () => {
        onSelectProperty(prop);
      });

      polygonsRef.current.set(prop.id, polygon);
    });

    return () => {
      polygonsRef.current.forEach((polygon) => polygon.setMap(null));
      polygonsRef.current.clear();
    };
  }, [map, properties]);

  // Update styles dynamically when selection or hover changes
  useEffect(() => {
    polygonsRef.current.forEach((polygon, propId) => {
      const isSelected = selectedProperty?.id === propId;
      const isHovered = hoveredProperty?.id === propId;

      polygon.setOptions({
        strokeColor: isSelected ? '#00bcd4' : isHovered ? '#38bdf8' : '#006980',
        strokeWeight: isSelected ? 3.5 : isHovered ? 2.5 : 1.5,
        fillColor: isSelected ? '#00bcd4' : isHovered ? '#0284c7' : '#006980',
        fillOpacity: isSelected ? 0.5 : isHovered ? 0.38 : 0.22,
        zIndex: isSelected ? 10 : isHovered ? 5 : 1
      });
    });
  }, [selectedProperty, hoveredProperty]);

  return null;
};
