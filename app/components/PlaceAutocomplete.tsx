'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PlaceAutocomplete.module.css';

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder: string;
  type?: 'hospital' | 'locality';
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  restrictToCity?: string;
}

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  type = 'hospital',
  className,
  id,
  name,
  required,
  restrictToCity,
}: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      setLoadError(true);
      return;
    }

    // Check if script already exists
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      // Wait for it to load
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // @ts-ignore
    window.initMap = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setLoadError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      // @ts-ignore
      delete window.initMap;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Configure autocomplete options based on type
    const options: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: 'in' }, // Restrict to India
      fields: ['formatted_address', 'name', 'geometry', 'place_id', 'address_components'],
    };

    if (type === 'hospital') {
      // Use 'establishment' for hospitals - it covers hospitals, clinics, health centers
      options.types = ['establishment'];
      
      // If restrictToCity is provided, add location bias
      if (restrictToCity) {
        // Create a geocoder to get city bounds
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: restrictToCity, componentRestrictions: { country: 'in' } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const bounds = results[0].geometry.bounds;
            if (bounds && autocompleteRef.current) {
              autocompleteRef.current.setBounds(bounds);
              autocompleteRef.current.setOptions({ strictBounds: true });
            }
          }
        });
      }
    } else {
      options.types = ['(cities)'];
    }

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    // Add place changed listener
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place) {
        // Always use formatted_address to get the full address from Google Maps
        const displayValue = place.formatted_address || place.name || '';
        
        onChange(displayValue, place);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [isLoaded, type, restrictToCity || '']);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update on manual typing, not when autocomplete is selecting
    onChange(e.target.value);
  };

  if (loadError) {
    return (
      <div className={styles.errorContainer}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          id={id}
          name={name}
          required={required}
        />
        <small className={styles.errorText}>
          ⚠️ Google Maps autocomplete unavailable. Manual entry enabled.
        </small>
      </div>
    );
  }

  return (
    <div className={styles.autocompleteContainer}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        id={id}
        name={name}
        required={required}
      />
      {!isLoaded && (
        <small className={styles.loadingText}>
          📍 Loading Google Maps...
        </small>
      )}
    </div>
  );
}
