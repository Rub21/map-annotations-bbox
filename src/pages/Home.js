import React from 'react';
import { useMapContext } from '../components/MapContext';

function Home({ annotations }) {
  const { mapContainerRef } = useMapContext();

  return (
    <div className="h-full flex flex-col">
      <div ref={mapContainerRef} className="flex-grow" style={{ width: '100%' }} />
    </div>
  );
}

export default Home;