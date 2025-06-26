'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CurrencySymbol from '@/components/CurrencySymbol';
import LoadingSpinner from '@/components/LoadingSpinner';
import DateTimePicker from '@/components/DateTimePicker';
import AddressMap from '@/components/AddressMap';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { getCart, clearCart, type Cart, type CartItem } from '../../utils/cart';
import { calculateTaxes, fetchTaxSettings } from '../../utils/taxUtils';

declare global {
  interface Window {
    google: any;
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 }); // Dubai coordinates
  const [isInitializingAutocomplete, setIsInitializingAutocomplete] = useState(false);
  
  // Google Maps refs
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [taxSettings, setTaxSettings] = useState<{
    vatTax: { enabled: boolean; type: 'percentage' | 'fixed'; value: number };
    serviceTax: { enabled: boolean; type: 'percentage' | 'fixed'; value: number };
  } | null>(null);

  const [totalTaxCalculation, setTotalTaxCalculation] = useState<{
    vatAmount: number;
    serviceAmount: number;
    totalTaxAmount: number;
    finalAmount: number;
  }>({
    vatAmount: 0,
    serviceAmount: 0,
    totalTaxAmount: 0,
    finalAmount: 0,
  });

  // Check authentication and load cart
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login-register');
      return;
    }

    // Load cart
    const currentCart = getCart();
    setCart(currentCart);
    
    if (currentCart.items.length === 0) {
      router.push('/');
      return;
    }

    // Pre-fill form with user data
    if (session.user) {
      setName(session.user.name || '');
      // Fetch additional user profile data
      fetchUserProfile();
    }
  }, [session, status, router]);

  // Fetch user profile data to pre-populate form
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const userData = data.profile || data;
        setPhone(userData.phone || '');
        setCity(userData.city || '');
        setState(userData.state || '');
        setPostalCode(userData.postalCode || '');
        setAddress(userData.address || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Geocode address to get coordinates with proper error handling
  const geocodeAddress = (address: string) => {
    if (!window.google || !address || address.trim().length < 5) {
      console.log('Skipping geocoding: insufficient data or Google Maps not loaded');
      return;
    }
    
    const geocoder = new window.google.maps.Geocoder();
    
    // Add a timeout to prevent hanging requests
    const geocodePromise = new Promise((resolve, reject) => {
      geocoder.geocode(
        { 
          address: address.trim(),
          region: 'AE' // Bias results to UAE
        }, 
        (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            setMapCenter({ lat: location.lat(), lng: location.lng() });
            console.log('Successfully geocoded address:', address);
            resolve(results[0]);
          } else {
            console.warn('Geocoding failed:', status, 'for address:', address);
            // Don't reject, just resolve with default coordinates
            resolve({
              geometry: {
                location: new window.google.maps.LatLng(25.2048, 55.2708) // Dubai coordinates
              }
            });
          }
        }
      );
    });

    // Set a 5-second timeout for geocoding
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.warn('Geocoding timeout - using default coordinates');
        resolve({
          geometry: {
            location: new window.google.maps.LatLng(25.2048, 55.2708) // Dubai coordinates
          }
        });
      }, 5000);
    });

    Promise.race([geocodePromise, timeoutPromise])
      .then((result: any) => {
        const location = result.geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
      })
      .catch(error => {
        console.error('Geocoding error:', error);
        // Fall back to default Dubai coordinates
        setMapCenter({ lat: 25.2048, lng: 55.2708 });
      });
  };

  // Initialize Google Maps Autocomplete with better error handling
  const initializeAutocomplete = () => {
    if (!window.google || !addressInputRef.current || isInitializingAutocomplete) {
      console.log('Cannot initialize autocomplete: Google Maps not loaded, input ref not available, or already initializing');
      return;
    }

    setIsInitializingAutocomplete(true);

    try {
      // Clear any existing autocomplete
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'ae' }, // Restrict to UAE addresses
          fields: ['formatted_address', 'geometry', 'address_components'] // Limit fields to reduce quota usage
        }
      );

      autocomplete.addListener('place_changed', () => {
        try {
          const place = autocomplete.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            console.warn('No geometry found for selected place');
            return;
          }

          const location = place.geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
          
          if (place.formatted_address) {
            setAddress(place.formatted_address);
          }

          // Parse address components safely
          if (place.address_components && Array.isArray(place.address_components)) {
            let newCity = '';
            let newState = '';
            let newPostalCode = '';

            place.address_components.forEach((component: any) => {
              if (!component || !component.types) return;

              const types = component.types;
              if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                newCity = component.long_name || '';
              } else if (types.includes('administrative_area_level_1')) {
                newState = component.long_name || '';
              } else if (types.includes('postal_code')) {
                newPostalCode = component.long_name || '';
              }
            });

            if (newCity) setCity(newCity);
            if (newState) setState(newState);
            if (newPostalCode) setPostalCode(newPostalCode);
          }
        } catch (error) {
          console.error('Error handling place selection:', error);
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    } finally {
      setIsInitializingAutocomplete(false);
    }
  };

  // Initialize Google Map with error handling
  const initializeMap = () => {
    console.log('initializeMap called', { google: !!window.google, showMap });
    
    if (!window.google || !showMap) {
      console.log('Cannot initialize map: Google Maps not loaded or map not shown');
      return;
    }

    const mapElement = document.getElementById('google-map');
    console.log('Map element found:', !!mapElement);
    
    if (!mapElement) {
      console.log('Map element not found');
      return;
    }

    try {
      console.log('Creating map with center:', mapCenter);
      const map = new window.google.maps.Map(mapElement, {
        center: mapCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [], // Use default styling
      });

      console.log('Creating marker');
      const marker = new window.google.maps.Marker({
        position: mapCenter,
        map: map,
        draggable: true,
        title: 'Drag to select your location',
        animation: window.google.maps.Animation.DROP,
      });

      // Handle marker drag with debouncing
      let dragTimeout: NodeJS.Timeout;
      marker.addListener('dragend', () => {
        clearTimeout(dragTimeout);
        dragTimeout = setTimeout(() => {
          try {
            const position = marker.getPosition();
            if (!position) {
              console.log('No position found for dragged marker');
              return;
            }

            const lat = position.lat();
            const lng = position.lng();
            setMapCenter({ lat, lng });
            
            // Reverse geocode to get address with error handling
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { 
                location: { lat, lng },
                region: 'AE' // Bias results to UAE
              }, 
              (results: any, status: any) => {
                if (status === 'OK' && results && results[0]) {
                  if (results[0].formatted_address) {
                    setAddress(results[0].formatted_address);
                  }
                  
                  // Parse address components safely
                  if (results[0].address_components && Array.isArray(results[0].address_components)) {
                    let newCity = '';
                    let newState = '';
                    let newPostalCode = '';
                    
                    results[0].address_components.forEach((component: any) => {
                      if (!component || !component.types) return;
                      
                      const types = component.types;
                      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                        newCity = component.long_name || '';
                      } else if (types.includes('administrative_area_level_1')) {
                        newState = component.long_name || '';
                      } else if (types.includes('postal_code')) {
                        newPostalCode = component.long_name || '';
                      }
                    });
                    
                    if (newCity) setCity(newCity);
                    if (newState) setState(newState);
                    if (newPostalCode) setPostalCode(newPostalCode);
                  }
                } else {
                  console.warn('Reverse geocoding failed:', status);
                }
              }
            );
          } catch (error) {
            console.error('Error in marker dragend listener:', error);
          }
        }, 500); // Debounce by 500ms
      });

      mapRef.current = map;
      markerRef.current = marker;
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Initialize Google Maps when the script is loaded
  useEffect(() => {
    const handleGoogleMapsLoaded = () => {
      console.log('Google Maps loaded event received');
      setGoogleMapsLoaded(true);
      initializeAutocomplete();
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      handleGoogleMapsLoaded();
    } else {
      // Listen for the custom event
      window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
    }

    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
    };
  }, []);

  // Initialize map when showMap or mapCenter changes
  useEffect(() => {
    if (googleMapsLoaded && showMap) {
      console.log('Initializing map');
      setTimeout(() => initializeMap(), 100); // Small delay to ensure DOM is ready
    }
  }, [googleMapsLoaded, showMap, mapCenter]);

  // Update marker position when mapCenter changes
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setPosition(mapCenter);
      mapRef.current.setCenter(mapCenter);
    }
  }, [mapCenter]);

  // Fetch tax settings
  useEffect(() => {
    const getTaxSettings = async () => {
      try {
        const settings = await fetchTaxSettings();
        setTaxSettings(settings);
      } catch (error) {
        console.error('Error fetching tax settings:', error);
      }
    };
    getTaxSettings();
  }, []);

  // Calculate total taxes whenever cart changes
  useEffect(() => {
    if (taxSettings && cart.total > 0) {
      const taxes = calculateTaxes(cart.total, taxSettings.vatTax, taxSettings.serviceTax);
      setTotalTaxCalculation(taxes);
    }
  }, [cart.total, taxSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !address || !serviceDate || !serviceTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          city,
          state,
          postalCode,
          serviceDate,
          serviceTime,
          specialInstructions,
          cartItems: cart.items,
          subtotal: cart.total,
          vatAmount: totalTaxCalculation.vatAmount,
          serviceAmount: totalTaxCalculation.serviceAmount,
          total: totalTaxCalculation.finalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart and show success
      clearCart();
      setSuccess(`Order placed successfully! Order number: ${data.orderNumber}`);
      
      // Redirect to success page or home after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (status === 'loading') {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <LoadingSpinner />
          <p className="mt-3">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!session) {
    return null;
  }

  if (success) {
    return (
      <>
        <Header />
        <section className="space-extra-bottom">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10">
                <div className="page-single">
                  <div className="page-content text-center">
                    <div className="success-icon mb-4">
                      <i className="fas fa-check-circle text-success" style={{fontSize: '4rem'}}></i>
                    </div>
                    <h2 className="mb-3">Order Placed Successfully!</h2>
                    <div className="alert alert-success">
                      {success}
                    </div>
                    <p className="mb-4">
                      You will receive an order confirmation email shortly. 
                      Your order is currently pending and will be processed by our team.
                    </p>
                    <p className="text-muted">Redirecting to dashboard in 3 seconds...</p>
                    <Link href="/dashboard" className="th-btn star-btn">
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <section className="space-extra-bottom">
        <div className="container">
          <div className="row">
            {/* Checkout Form */}
            <div className="col-lg-8">
              <div className="page-single">
                <div className="page-content">
                  <div className="auth-card mb-4">
                    <div className="auth-card-body p-4">
                      <h3 className="mb-4">Billing Information</h3>
                      
                      {error && (
                        <div className="alert alert-danger mb-4">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-12 mb-3">
                            <label className="form-label">
                              Full Name <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              value={session.user?.email || ''}
                              disabled
                            />
                            <small className="text-muted">From your account</small>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Phone Number <span className="text-danger">*</span>
                            </label>
                            <input
                              type="tel"
                              className="form-control"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>

                          <div className="col-12 mb-3">
                            <label className="form-label">
                              Address <span className="text-danger">*</span>
                            </label>
                            <AddressMap onAddressSelect={setAddress} />
                            {address && (
                              <div className="mt-2">
                                {/*
                                <strong>Selected Address:</strong>
                                <p className="mb-0 text-muted">{address}</p>
                                */}
                              </div>
                            )}
                          </div>

                          <DateTimePicker
                            selectedDate={serviceDate}
                            selectedTime={serviceTime}
                            onDateChange={setServiceDate}
                            onTimeChange={setServiceTime}
                          />
                        </div>

                        {/* Order Notes Section */}
                        <div className="row mt-4">
                          <div className="col-12">
                            <h4 className="mb-3">Order Notes</h4>
                            <div className="mb-3">
                              <label className="form-label">
                                Special Instructions
                              </label>
                              <textarea
                                className="form-control"
                                rows={4}
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                placeholder="Any special instructions or notes for our team? (Optional)"
                              />
                              <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Let us know if you have any specific requirements or requests
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <Link href="/" className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i>
                            Continue Shopping
                          </Link>
                          
                          <button 
                            type="submit" 
                            className="th-btn"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Place Order (<CurrencySymbol /> {formatPrice(totalTaxCalculation.finalAmount)})
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-lg-4">
              <div className="checkout-sidebar">
                <div className="order-summary-widget">
                  <h4 className="summary-title">Summary</h4>
                  
                  {cart.items.map((item: CartItem, index) => (
                    <div key={index} className="order-item">
                      <div className="product-info">
                        <h5 className="product-name">{item.productTitle}</h5>
                        
                        {/* Show selected variations */}
                        {Object.keys(item.selectedVariations).length > 0 && (
                          <div className="variations-display">
                            {Object.entries(item.selectedVariations).map(([key, value]) => (
                              <span key={key} className="variation-item">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add-ons */}
                      {item.selectedAddons.length > 0 && (
                        <div className="addons-section">
                          <div className="addons-list">
                            {Object.entries(
                              item.selectedAddons.reduce((groups: Record<string, typeof item.selectedAddons>, addon) => {
                                const groupKey = addon.groupTitle || 'Other';
                                if (!groups[groupKey]) groups[groupKey] = [];
                                groups[groupKey].push(addon);
                                return groups;
                              }, {})
                            ).map(([groupTitle, groupAddons]) => (
                              <div key={groupTitle} className="addon-group">
                                {groupTitle !== 'Other' && (
                                  <div className="addon-group-header">{groupTitle}:</div>
                                )}
                                {groupAddons.map((addon, addonIndex) => (
                                  <div key={addonIndex} className="addon-item">
                                    <span className="addon-name">• {addon.title} ({addon.quantity}x)</span>
                                    <span className="addon-price"><CurrencySymbol /> {formatPrice(addon.price * addon.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="item-total-section">
                        <div className="price-row">
                          <span className="price-label">Item Total:</span>
                          <span className="price-value">
                            <CurrencySymbol />
                            {formatPrice(item.productPrice * item.quantity + 
                              item.selectedAddons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0)
                            )}
                          </span>
                        </div>
                      </div>

                      {index < cart.items.length - 1 && <hr className="item-divider" />}
                    </div>
                  ))}

                  <hr className="summary-divider" />

                  <div className="total-section">
                    <div className="total-row subtotal-row">
                      <span className="total-label">Subtotal:</span>
                      <span className="total-amount"><CurrencySymbol /> {formatPrice(cart.total)}</span>
                    </div>

                    {taxSettings?.vatTax.enabled && (
                      <div className="total-row tax-row">
                        <span className="total-label">
                          VAT ({taxSettings.vatTax.type === 'percentage' ? `${taxSettings.vatTax.value}%` : 'Fixed'}):
                        </span>
                        <span className="total-amount">
                          <CurrencySymbol /> {formatPrice(totalTaxCalculation.vatAmount)}
                        </span>
                      </div>
                    )}

                    {taxSettings?.serviceTax.enabled && (
                      <div className="total-row tax-row">
                        <span className="total-label">
                          Service Tax ({taxSettings.serviceTax.type === 'percentage' ? `${taxSettings.serviceTax.value}%` : 'Fixed'}):
                        </span>
                        <span className="total-amount">
                          <CurrencySymbol /> {formatPrice(totalTaxCalculation.serviceAmount)}
                        </span>
                      </div>
                    )}

                    <hr className="summary-divider" />

                    <div className="total-row grand-total-row">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">
                        <CurrencySymbol /> {formatPrice(totalTaxCalculation.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <style jsx>{`
        .checkout-sidebar {
          position: sticky;
          top: 120px;
          align-self: flex-start;
        }

        .order-summary-widget {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0;
        }

        .order-item {
          margin-bottom: 1.5rem;
        }

        .product-info {
          margin-bottom: 1rem;
        }

        .product-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .variations-display {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .variation-item {
          background: #f2f2f2;
          padding: 5px 12px;
          margin-bottom: 5px;
          display: inline-block;
          border-radius: 24px;
          font-weight: 500;
          color: black;
          margin-right: 0.5rem;
        }

        .addons-section {
          margin-bottom: 0.75rem;
        }

        .addons-list {
          margin-left: 0;
        }

        .addon-group {
          margin-bottom: 0.75rem;
        }

        .addon-group:last-child {
          margin-bottom: 0;
        }

        .addon-group-header {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 600;
          margin-bottom: 0.25rem;
          margin-left: 0.25rem;
        }

        .addon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }

        .addon-name {
          font-size: 0.9rem;
          color: #6b7280;
          flex: 1;
        }

        .addon-price {
          font-size: 0.9rem;
          color: #1f2937;
          font-weight: 500;
        }

        .item-total-section {
          margin-bottom: 1rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .price-label {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 400;
        }

        .price-value {
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
        }

        .item-divider {
          border: none;
          border-top: 1px solid #f3f4f6;
          margin: 1rem 0;
        }

        .summary-divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 0.75rem 0;
        }

        .total-section {
          padding-top: 0.5rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          font-size: 1.1rem;
          color: #1f2937;
          font-weight: 600;
        }

        .total-amount {
          font-size: 1.25rem;
          color: #3b82f6;
          font-weight: 700;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .checkout-sidebar {
            position: static;
            top: auto;
          }
          
          .order-summary-widget {
            padding: 20px;
            margin-bottom: 1rem;
          }
          
          .summary-title {
            font-size: 1.3rem;
          }
          
          .total-amount {
            font-size: 1.15rem;
          }
        }

        .subtotal-row {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .tax-row {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 8px 0;
        }

        .grand-total-row {
          margin-top: 12px;
          font-weight: 700;
        }
      `}</style>
    </>
  );
} 