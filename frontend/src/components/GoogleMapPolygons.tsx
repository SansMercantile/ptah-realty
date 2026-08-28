import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { PropertyRecord } from '../types';
import { getArchitecturalBuilding, ArchitecturalBuildingBox } from '../utils/buildingGeometry';

interface GoogleMapPolygonsProps {
  properties: PropertyRecord[];
  selectedProperty: PropertyRecord | null;
  hoveredProperty: PropertyRecord | null;
  onSelectProperty: (property: PropertyRecord) => void;
  onHoverProperty: (property: PropertyRecord | null, pos: { x: number; y: number } | null) => void;
  buildingRenderMode?: 'building_boxes' | 'cadastre_lots' | 'hybrid';
  heading?: number;
  tilt?: number;
  onCursorCoordsChange?: (coords: { lat: number; lng: number } | null) => void;
}

export const GoogleMapPolygons: React.FC<GoogleMapPolygonsProps> = ({
  properties,
  selectedProperty,
  hoveredProperty,
  onSelectProperty,
  onHoverProperty,
  buildingRenderMode = 'building_boxes',
  heading = 0,
  tilt = 0,
  onCursorCoordsChange
}) => {
  const map = useMap();
  const polygonsRef = useRef<Map<string, google.maps.Polygon[]>>(new Map());

  // Sync Google Map Heading & Tilt with Compass tool
  useEffect(() => {
    if (!map) return;
    try {
      if (typeof map.setHeading === 'function') {
        map.setHeading(heading);
      }
      if (typeof map.setTilt === 'function') {
        map.setTilt(tilt);
      }
    } catch {
      // Ignored if map type doesn't support vector rotation
    }
  }, [map, heading, tilt]);

  // Initialize and render building boxes and lot boundaries on Google Map
  useEffect(() => {
    if (!map) return;

    // Clean up existing polygons
    polygonsRef.current.forEach((polygonGroup) => {
      polygonGroup.forEach((p) => p.setMap(null));
    });
    polygonsRef.current.clear();

    properties.forEach((prop) => {
      const building = getArchitecturalBuilding(prop);
      const isSelected = selectedProperty?.id === prop.id;
      const isHovered = hoveredProperty?.id === prop.id;
      const polygonGroup: google.maps.Polygon[] = [];

      // 1. Cadastral Lot Boundary Polygon
      if (buildingRenderMode === 'cadastre_lots' || buildingRenderMode === 'hybrid') {
        const lotPaths = building.cadastralLotGeo.map(([lng, lat]) => ({ lat, lng }));
        const lotPoly = new google.maps.Polygon({
          paths: lotPaths,
          strokeColor: isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#006980',
          strokeOpacity: isSelected ? 1 : 0.8,
          strokeWeight: isSelected ? 2.5 : 1.5,
          fillColor: isSelected ? '#00bcd4' : '#006980',
          fillOpacity: isSelected ? 0.25 : 0.12,
          map,
          zIndex: isSelected ? 8 : 2
        });

        attachListeners(lotPoly, prop);
        polygonGroup.push(lotPoly);
      }

      // 2. Architectural Main Building Box Polygon
      if (buildingRenderMode === 'building_boxes' || buildingRenderMode === 'hybrid') {
        const bldgPaths = building.mainBuildingGeo.map(([lng, lat]) => ({ lat, lng }));
        const bldgPoly = new google.maps.Polygon({
          paths: bldgPaths,
          strokeColor: isSelected ? '#00e5ff' : isHovered ? '#7dd3fc' : '#64748b',
          strokeOpacity: 1.0,
          strokeWeight: isSelected ? 3.5 : isHovered ? 2.5 : 1.8,
          fillColor: isSelected ? '#00bcd4' : isHovered ? '#0284c7' : building.roofColor || '#334155',
          fillOpacity: isSelected ? 0.85 : isHovered ? 0.75 : 0.65,
          map,
          zIndex: isSelected ? 15 : 6
        });

        attachListeners(bldgPoly, prop);
        polygonGroup.push(bldgPoly);

        // 3. Garage & Porch Outbuilding polygons
        if (building.garageGeo) {
          const garagePaths = building.garageGeo.map(([lng, lat]) => ({ lat, lng }));
          const garagePoly = new google.maps.Polygon({
            paths: garagePaths,
            strokeColor: isSelected ? '#38bdf8' : '#475569',
            strokeOpacity: 0.9,
            strokeWeight: 1.5,
            fillColor: '#334155',
            fillOpacity: 0.7,
            map,
            zIndex: isSelected ? 12 : 5
          });
          attachListeners(garagePoly, prop);
          polygonGroup.push(garagePoly);
        }

        if (building.poolGeo) {
          const poolPaths = building.poolGeo.map(([lng, lat]) => ({ lat, lng }));
          const poolPoly = new google.maps.Polygon({
            paths: poolPaths,
            strokeColor: '#38bdf8',
            strokeOpacity: 0.95,
            strokeWeight: 1.5,
            fillColor: '#0284c7',
            fillOpacity: 0.85,
            map,
            zIndex: isSelected ? 12 : 5
          });
          attachListeners(poolPoly, prop);
          polygonGroup.push(poolPoly);
        }
      }

      polygonsRef.current.set(prop.id, polygonGroup);
    });

    function attachListeners(polygon: google.maps.Polygon, prop: PropertyRecord) {
      polygon.addListener('mouseover', (e: google.maps.MapMouseEvent & { domEvent?: MouseEvent }) => {
        const clientX = e.domEvent ? e.domEvent.clientX : window.innerWidth / 2;
        const clientY = e.domEvent ? e.domEvent.clientY : window.innerHeight / 2;
        onHoverProperty(prop, { x: clientX, y: clientY });
        if (e.latLng && onCursorCoordsChange) {
          onCursorCoordsChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });

      polygon.addListener('mousemove', (e: google.maps.MapMouseEvent & { domEvent?: MouseEvent }) => {
        const clientX = e.domEvent ? e.domEvent.clientX : window.innerWidth / 2;
        const clientY = e.domEvent ? e.domEvent.clientY : window.innerHeight / 2;
        onHoverProperty(prop, { x: clientX, y: clientY });
        if (e.latLng && onCursorCoordsChange) {
          onCursorCoordsChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });

      polygon.addListener('mouseout', () => {
        onHoverProperty(null, null);
      });

      polygon.addListener('click', () => {
        onSelectProperty(prop);
      });
    }

    return () => {
      polygonsRef.current.forEach((polygonGroup) => {
        polygonGroup.forEach((p) => p.setMap(null));
      });
      polygonsRef.current.clear();
    };
  }, [map, properties, buildingRenderMode]);

  // Dynamic selection pulse animation
  useEffect(() => {
    if (!selectedProperty) return;

    let step = 0;
    const interval = setInterval(() => {
      const selectedPolys = polygonsRef.current.get(selectedProperty.id);
      if (!selectedPolys || selectedPolys.length === 0) return;

      step += 0.08;
      const wave = (Math.sin(step) + 1) / 2;
      const opacity = 0.65 + wave * 0.28;
      const weight = 3.0 + wave * 1.5;

      selectedPolys.forEach((p) => {
        p.setOptions({
          strokeWeight: weight,
          strokeOpacity: 0.85 + wave * 0.15
        });
      });
    }, 60);

    return () => clearInterval(interval);
  }, [selectedProperty, hoveredProperty]);

  return null;
};
