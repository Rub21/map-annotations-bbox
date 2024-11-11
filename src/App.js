import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import { MapProvider } from './components/MapContext';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        // Custom resize logic can go here if needed
        console.log("Resizing window");
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <MapProvider setAnnotations={setAnnotations}>
        <div className="flex flex-col h-screen"> 
          <div className="flex w-full h-full"> 
            <Sidebar annotations={annotations} />
            <main className="w-full bg-gray-100 h-full">
              <Routes>
                <Route path="/" element={<Home annotations={annotations} />} />
              </Routes>
            </main>
          </div>
        </div>
      </MapProvider>
    </Router>
  );
}

export default App;