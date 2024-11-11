// src/components/Sidebar.js

import React, { useState, useEffect } from 'react';
import { useMapContext } from './MapContext';
import LayerCard from './LayerCard';

function Sidebar({ annotations }) {
  const { fetchAnnotationsByBBox, loadLayer } = useMapContext();
  const [visibleLayers, setVisibleLayers] = useState({});
  const [layerBounds, setLayerBounds] = useState({});

  useEffect(() => {
    const initialVisibility = {};
    annotations.forEach((annotation) => {
      const annotationId = annotation.id.replace("https://annotations.allmaps.org/maps/", "");
      initialVisibility[annotationId] = false;
    });
    setVisibleLayers(initialVisibility);
  }, [annotations]);

  const handleFetchAnnotations = async () => {
    await fetchAnnotationsByBBox();
  };

  const handleLoadLayer = (annotation) => {
    const annotationId = annotation.id.replace("https://annotations.allmaps.org/maps/", "");

    // Check if the annotation body has features and is a valid FeatureCollection
    if (annotation.body && annotation.body.type === "FeatureCollection" && annotation.body.features) {
      let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;

      annotation.body.features.forEach((feature) => {
        if (feature.geometry && feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          minLat = Math.min(minLat, lat);
          minLng = Math.min(minLng, lng);
          maxLat = Math.max(maxLat, lat);
          maxLng = Math.max(maxLng, lng);
        }
      });

      const bounds = [[minLng, minLat], [maxLng, maxLat]];

      setLayerBounds((prev) => ({ ...prev, [annotationId]: bounds }));
      loadLayer(annotationId, bounds, annotation.body);

      setVisibleLayers((prev) => ({
        ...prev,
        [annotationId]: !prev[annotationId],
      }));
    } else {
      console.warn("Annotation body does not contain a valid FeatureCollection.");
    }
  };

  return (
    <div className="w-1/2 h-full bg-gray-200 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Annotations by bbox</h2>
      <button
        onClick={handleFetchAnnotations}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        Fetch Annotations by Current Map View
      </button>
      <div className="space-y-4 overflow-y-auto">
        {annotations.length > 0 ? (
          annotations.map((annotation) => {
            const annotationId = annotation.id.replace("https://annotations.allmaps.org/maps/", "");
            const isVisible = visibleLayers[annotationId];
            const bounds = layerBounds[annotationId] || null; // Pass bounds if available

            return (
              <LayerCard
                key={annotation.id}
                annotation={annotation}
                isVisible={isVisible}
                onLoadLayer={() => handleLoadLayer(annotation)}
                bounds={bounds} // Only defined after handleLoadLayer is called
              />
            );
          })
        ) : (
          <p className="text-gray-600">No annotations loaded. Click the button to fetch data.</p>
        )}
      </div>
    </div>
  );
}

export default Sidebar;