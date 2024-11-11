// src/layerHelpers.js

export const displayTMSLayer = (map, tmsUrl, layerId) => {
    if (map && !map.getSource(layerId)) {
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
  
  export const toggleLayerVisibility = (map, layerId) => {
    if (map && map.getLayer(layerId)) {
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      map.setLayoutProperty(
        layerId,
        'visibility',
        visibility === 'visible' ? 'none' : 'visible'
      );
    }
  };