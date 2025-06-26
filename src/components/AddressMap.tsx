'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import LoadingSpinner from './LoadingSpinner';

interface AddressMapProps {
  onAddressSelect: (address: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressMap({ onAddressSelect }: AddressMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  // Google Maps API Key - you'll need to set this in your environment
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBsxw1IkvR-PMohWJRSVLpc4-tbwDknHK8';

  // Check if Google Maps is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true);
      initializeAutocomplete();
    }
  }, []);

  // Initialize autocomplete
  const initializeAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places || !inputRef.current) {
      console.log('Google Maps not ready for autocomplete');
      return;
    }

    try {
      // Clear existing autocomplete
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Create autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ae' }, // Restrict to UAE
        fields: ['formatted_address', 'geometry', 'address_components']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place || !place.formatted_address) {
          setError('Please select a valid address from the suggestions');
          return;
        }

        setError('');
        onAddressSelect(place.formatted_address);

        // Update map location if geometry is available
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location;
          
          // Extract lat/lng regardless of whether map is shown
          const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
          const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
          
          // Update our state
          setMapCenter({ lat, lng });
          
          // Update map if it's currently shown
          if (showMap && mapRef.current && markerRef.current) {
            updateMapLocation({ lat, lng });
          }
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('Autocomplete initialized successfully');
    } catch (err) {
      console.error('Error initializing autocomplete:', err);
      setError('Error loading address suggestions');
    }
  };

  // Initialize map
  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
      console.log('Google Maps not ready for map initialization');
      return;
    }

    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) {
        console.log('Map container not found');
        return;
      }

      // Create map centered on current mapCenter or Dubai as fallback
      const map = new window.google.maps.Map(mapContainer, {
        center: mapCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;

      // Create marker at current mapCenter
      const marker = new window.google.maps.Marker({
        map,
        draggable: true,
        position: mapCenter,
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current = marker;

      // Handle marker drag
      marker.addListener('dragend', () => {
        setIsLoading(true);
        setError('');
        
        const position = marker.getPosition();
        if (!position) return;

        const lat = position.lat();
        const lng = position.lng();
        
        // Update state first
        setMapCenter({ lat, lng });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            setIsLoading(false);
            
            if (status === 'OK' && results && results[0]) {
              onAddressSelect(results[0].formatted_address);
              if (inputRef.current) {
                inputRef.current.value = results[0].formatted_address;
              }
            } else {
              setError('Could not find address for this location');
            }
          }
        );
      });

      console.log('Map initialized successfully');
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Error loading map');
    }
  };

  // Update map location
  const updateMapLocation = (location: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (mapRef.current && markerRef.current) {
      // Handle both LatLng object and LatLngLiteral
      const position = location instanceof window.google.maps.LatLng 
        ? location 
        : new window.google.maps.LatLng(location.lat, location.lng);
      
      mapRef.current.setCenter(position);
      markerRef.current.setPosition(position);
    }
  };

  // Handle Google Maps script load
  const handleGoogleMapsLoad = () => {
    console.log('Google Maps script loaded');
    setGoogleMapsLoaded(true);
    
    // Small delay to ensure everything is ready
    setTimeout(() => {
      initializeAutocomplete();
      if (showMap) {
        initializeMap();
      }
    }, 100);
  };

  // Initialize map when showMap changes
  useEffect(() => {
    if (googleMapsLoaded && showMap) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [googleMapsLoaded, showMap]);

  // Update map when mapCenter changes (for cases where map is already initialized)
  useEffect(() => {
    if (mapRef.current && markerRef.current && showMap && mapCenter && !isLoading) {
      updateMapLocation(mapCenter);
    }
  }, [mapCenter, showMap, isLoading]);

  // Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Update our state
        setMapCenter(pos);
        
        // Update map if shown
        if (showMap && mapRef.current && markerRef.current) {
          updateMapLocation(pos);
        }

        // Get address for location
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            setIsLoading(false);
            if (status === 'OK' && results && results[0]) {
              onAddressSelect(results[0].formatted_address);
              if (inputRef.current) {
                inputRef.current.value = results[0].formatted_address;
              }
            } else {
              setError('Could not find address for your location');
            }
          });
        } else {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        setError('Could not get your location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <>
      {/* Load Google Maps Script */}
      {!googleMapsLoaded && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
          onLoad={handleGoogleMapsLoad}
          onError={() => {
            setError('Failed to load Google Maps. Please check your internet connection.');
          }}
        />
      )}

      <div className="address-map-container">
        <div className="input-group mb-3">
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Start typing your address..."
            aria-label="Search for an address"
          />
          {isLoading && (
            <span className="input-group-text">
              <LoadingSpinner size="small" />
            </span>
          )}
        </div>
        
        <div className="d-flex gap-2 mb-3">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={handleUseMyLocation}
            disabled={isLoading}
          >
            <i className="fas fa-location-arrow me-1"></i>
            Use My Location
          </button>
          
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowMap(!showMap)}
          >
            <i className={`fas ${showMap ? 'fa-eye-slash' : 'fa-map-marked-alt'} me-1`}></i>
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
        
        {error && (
          <div className="alert alert-warning mb-3 py-2">
            <small>
              <i className="fas fa-exclamation-triangle me-1"></i>
              {error}
            </small>
          </div>
        )}

        {!googleMapsLoaded && (
          <div className="text-center py-3">
            <LoadingSpinner />
            <p className="text-muted mt-2">Loading Google Maps...</p>
          </div>
        )}

        {showMap && googleMapsLoaded && (
          <div
            id="map-container"
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}
          />
        )}

        {showMap && googleMapsLoaded && (
          <div className="mt-2">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Drag the red marker to select your exact location
            </small>
          </div>
        )}
      </div>
    </>
  );
} 