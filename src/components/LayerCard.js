import React from 'react';
import { useMapContext } from './MapContext';

function LayerCard({ annotation, isVisible, onLoadLayer, bounds }) {
  const { getTmsUrl } = useMapContext();
  const annotationId = annotation.id.replace("https://annotations.allmaps.org/maps/", "");

  // Get the TMS URL for this layer
  const tmsUrl = getTmsUrl(annotationId);

  // Construct the JOSM URL for loading the TMS layer
  const josmTmsUrl = tmsUrl
    ? `http://localhost:8111/imagery?title=${annotationId}&type=tms&url=${encodeURIComponent(tmsUrl)}`
    : null;

  // Construct the JOSM URL for loading and zooming to bounds, if bounds are defined
  const josmZoomUrl = bounds
    ? `http://localhost:8111/load_and_zoom?left=${bounds[0][0]}&bottom=${bounds[0][1]}&right=${bounds[1][0]}&top=${bounds[1][1]}`
    : null;

  // Get the manifest URL if it exists
  const manifestUrl = annotation.manifest || null;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50" onClick={onLoadLayer}>
      <div className="flex items-center space-x-2">
        {/* Hand Icon */}
        {/* <HandIcon className="h-5 w-5 text-gray-500" /> */}
        
        {/* Annotation ID */}
        <p className="text-blue-700 font-semibold">
          Annotation ID: {annotationId}
        </p>
      </div>
      <div className="flex items-center space-x-2 mt-4">

        {/* Load TMS Layer in JOSM button */}
        {josmTmsUrl && (
          <a
            href={josmTmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Load TMS in JOSM
          </a>
        )}

        {/* Zoom to Layer Bounds in JOSM button */}
        {josmZoomUrl && (
          <a
            href={josmZoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
          >
            Zoom to Layer in JOSM
          </a>
        )}

        {/* Display Manifest URL button if available */}
        {manifestUrl && (
          <a
            href={manifestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 text-sm"
          >
            View Manifest
          </a>
        )}
      </div>
    </div>
  );
}

export default LayerCard;
