import { useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { MapPin, Check, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  language: Language;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPicker({ language, onConfirm, onClose }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: 12.245566,
    lng: 109.192793,
  });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Try to get user's location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          initMap(pos.coords.latitude, pos.coords.longitude);
        },
        () => initMap(12.245566, 109.192793),
        { timeout: 5000 },
      );
    } else {
      initMap(12.245566, 109.192793);
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  function initMap(lat: number, lng: number) {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#DC2626" stroke="#fff" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setPosition({ lat: pos.lat, lng: pos.lng });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstance.current = map;
    markerRef.current = marker;
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="relative flex items-center justify-center py-4 border-b border-[#C5B5A5]/20">
        <button onClick={onClose} className="absolute left-4 p-2 text-[#5A2C11]">
          <X className="w-5 h-5" />
        </button>
        <p className="text-sm font-bold text-[#261308]">
          {language === 'vn' ? 'Chọn vị trí trên bản đồ' :
           language === 'en' ? 'Choose location on map' :
           'Выберите место на карте'}
        </p>
      </div>
      <div ref={mapRef} className="flex-1" />
      <div className="px-6 py-4 border-t border-[#C5B5A5]/20">
        <p className="text-[10px] text-[#8B7355] text-center mb-3">
          <MapPin className="w-3 h-3 inline" />
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </p>
        <button
          onClick={() => onConfirm(position.lat, position.lng)}
          className="w-full py-4 rounded-xl bg-[#5A2C11] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4A2210] transition"
        >
          <Check className="w-5 h-5" />
          {language === 'vn' ? 'Xác nhận vị trí' :
           language === 'en' ? 'Confirm location' :
           'Подтвердить местоположение'}
        </button>
      </div>
    </div>
  );
}
