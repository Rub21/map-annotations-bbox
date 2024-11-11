// src/MapContext.js

import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';

const MapContext = createContext();

export const useMapContext = () => useContext(MapContext);

export const MapProvider = ({ children, setAnnotations }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [0, 0],
      zoom: 2,
    });

    map.on('load', () => {
      map.addSource('osm-tiles', {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      });

      map.addLayer({
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm-tiles',
      });

      mapInstanceRef.current = map;
    });

    return () => map.remove();
  }, []);

  // Helper function to add TMS layer
  const displayTMSLayer = (map, tmsUrl, layerId) => {
    if (!map.getSource(layerId)) {
      map.addSource(layerId, {
        type: 'raster',
        tiles: [tmsUrl],
        tileSize: 256,
      });
      map.addLayer({
        id: layerId,
        type: 'raster',
        source: layerId,
      });
    }
  };

  // Function to get TMS URL
  const getTmsUrl = (annotationId) => {
    return `https://allmaps.xyz/maps/${annotationId}/{z}/{x}/{y}.png`;
  };

  // Function to add points from FeatureCollection with random colors
  const addPointsLayer = (annotationId, featureCollection) => {
    const map = mapInstanceRef.current;

    const pointFeatures = featureCollection.features.map((feature, index) => ({
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        color: '#A020F0',
        id: `${annotationId}-point-${index}`,
      },
    }));

    const sourceId = `points-source-${annotationId}`;
    const layerId = `points-layer-${annotationId}`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pointFeatures,
        },
      });

      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 5,
          'circle-color': ['get', 'color'],
        },
      });
    }
  };

  // Function to load a layer, zoom to its bounds, and add points
  const loadLayer = (annotationId, bounds, featureCollection) => {
    const map = mapInstanceRef.current;
    const tmsUrl = getTmsUrl(annotationId);
    const layerId = `tms-layer-${annotationId}`;

    if (map.getLayer(layerId)) {
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      map.setLayoutProperty(layerId, 'visibility', visibility === 'visible' ? 'none' : 'visible');
    } else {
      displayTMSLayer(map, tmsUrl, layerId);
      if (bounds) {
        map.fitBounds(bounds, { padding: 20 });
      }
    }

    if (featureCollection) {
      addPointsLayer(annotationId, featureCollection);
    }
  };

  const fetchAnnotationsByBBox = async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const zoom = map.getZoom();
    if (zoom <= 5) {
      console.log('Zoom level too low to fetch annotations.');
      return; // Exit function if zoom level is 7 or below
    }

    setLoading(true); // Start loading spinner

    const bounds = map.getBounds();
    const minX = bounds.getWest();
    const minY = bounds.getSouth();
    const maxX = bounds.getEast();
    const maxY = bounds.getNorth();
    const apiUrl = `https://annotations.allmaps.org/maps?limit=20&intersects=${minY},${minX},${maxY},${maxY}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      data.items.forEach((element) => {
        if (element.target.source && element.target.source.partOf) {
          element.target.source.partOf.forEach((partOf) => {
            if (partOf.partOf) {
              partOf.partOf.forEach((pof) => {
                if (pof.type === 'Manifest') {
                  element['manifest'] = pof.id;
                }
              });
            }
          });
        }
      });

      setAnnotations(data.items);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <MapContext.Provider value={{ fetchAnnotationsByBBox, loadLayer, getTmsUrl, mapContainerRef }}>
      {children}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25">
          <div className="loader border-t-transparent border-solid rounded-full w-16 h-16 border-4 border-blue-500"></div>
        </div>
      )}
    </MapContext.Provider>
  );
};