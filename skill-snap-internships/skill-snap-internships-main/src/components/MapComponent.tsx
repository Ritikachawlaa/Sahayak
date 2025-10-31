import React, { useEffect, useRef } from 'react';
// We still need the CSS for Leaflet
import 'leaflet/dist/leaflet.css';

// Type definitions are fine at the top level
interface Internship {
    id: string;
    title: string;
    company: string;
    location: string;
    lat: number;
    lng: number;
}

interface MapComponentProps {
  internships: Internship[];
}

const MapComponent: React.FC<MapComponentProps> = ({ internships }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any | null>(null); // Use 'any' as L is dynamically loaded
  const heatLayer = useRef<any | null>(null);

  // Initialize map on first render
  useEffect(() => {
    // Prevent map from initializing more than once
    if (map.current || !mapContainer.current) return;

    let isMounted = true;

    // **FIX:** Chain dynamic imports to ensure Leaflet loads before its plugin
    import('leaflet').then(L => {
      import('leaflet.heat').then(() => {
        // Ensure component is still mounted when async operations complete
        if (!isMounted || !mapContainer.current) return;
        
        // Fix leaflet's default icon path issue with bundlers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        map.current = L.map(mapContainer.current, {
          center: [22.9734, 78.6569], // Centered on India
          zoom: 5,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map.current);

        // Initialize heat layer and store its reference
        heatLayer.current = (L as any).heatLayer([], {
          radius: 25,
          blur: 15,
          maxZoom: 12,
          gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(map.current);

        // This effect will now handle populating the data
      });
    });

    // Cleanup function to run when component unmounts
    return () => {
      isMounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // This separate effect updates the heatmap layer whenever the internship data changes
  useEffect(() => {
    if (!heatLayer.current) return; // Don't run if the layer isn't initialized yet

    const heatPoints: [number, number, number][] = internships
      .filter(internship => internship.lat && internship.lng) // Ensure lat/lng exist
      .map(internship => 
          [internship.lat, internship.lng, 1] // Intensity is set to 1 for each internship
    );

    heatLayer.current.setLatLngs(heatPoints);
    
  }, [internships]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-96 rounded-lg border border-border shadow-soft"
    />
  );
};

export default MapComponent;