'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CurrencySymbol from '@/components/CurrencySymbol';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { getCart, clearCart, type Cart, type CartItem } from '../../utils/cart';

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
  
  // Google Maps refs
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
        const userData = data.profile || data; // Handle both nested and direct response
        console.log('Fetched user profile:', userData);
        
        // Auto-fill form fields from user data
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
        setCity(userData.city || '');
        setState(userData.state || '');
        setPostalCode(userData.postalCode || '');
        
        // If user has address, try to geocode it to center the map
        if (userData.address && googleMapsLoaded) {
          geocodeAddress(userData.address);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Geocode address to get coordinates
  const geocodeAddress = (address: string) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
      }
    });
  };

  // Initialize Google Maps Autocomplete
  const initializeAutocomplete = () => {
    if (!window.google || !addressInputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'ae' }, // Restrict to UAE addresses
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setAddress(place.formatted_address);
        
        // Update map center if place has geometry
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
        }
        
        // Parse address components
        if (place.address_components) {
          let city = '';
          let state = '';
          let postalCode = '';
          
          place.address_components.forEach((component: any) => {
            const types = component.types;
            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          });
          
          setCity(city);
          setState(state);
          setPostalCode(postalCode);
        }
      }
    });

    autocompleteRef.current = autocomplete;
  };

  // Initialize Google Map
  const initializeMap = () => {
    if (!window.google || !showMap) return;

    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    const map = new window.google.maps.Map(mapElement, {
      center: mapCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const marker = new window.google.maps.Marker({
      position: mapCenter,
      map: map,
      draggable: true,
      title: 'Drag to select your location',
    });

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        setMapCenter({ lat, lng });
        
        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            setAddress(results[0].formatted_address);
            
            // Parse address components
            if (results[0].address_components) {
              let city = '';
              let state = '';
              let postalCode = '';
              
              results[0].address_components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                  city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  state = component.long_name;
                } else if (types.includes('postal_code')) {
                  postalCode = component.long_name;
                }
              });
              
              setCity(city);
              setState(state);
              setPostalCode(postalCode);
            }
          }
        });
      }
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

  // Handle Google Maps script load
  const handleGoogleMapsLoad = () => {
    setGoogleMapsLoaded(true);
    initializeAutocomplete();
  };

  // Reinitialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (googleMapsLoaded) {
      initializeAutocomplete();
      // Re-fetch user profile to center map if user has address
      if (session?.user) {
        fetchUserProfile();
      }
    }
  }, [googleMapsLoaded, session]);

  // Initialize map when showMap or mapCenter changes
  useEffect(() => {
    if (googleMapsLoaded && showMap) {
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
          total: cart.total, // No tax/shipping for now
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
    
  }

  if (!session) {
    return null;
  }

  if (success) {
    return (
      <>
        <Header />
        <section className=" space-extra-bottom">
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
      {/* Google Maps API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBsxw1IkvR-PMohWJRSVLpc4-tbwDknHK8&libraries=places`}
        onLoad={handleGoogleMapsLoad}
      />
      
      

      {/* Checkout Section */}
      <section className=" space-extra-bottom">
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
                            <input
                              ref={addressInputRef}
                              type="text"
                              className="form-control"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Start typing your address..."
                              required
                            />
                            <small className="text-muted">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              Start typing and select from suggestions
                            </small>
                            
                            <div className="mt-2">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setShowMap(!showMap)}
                              >
                                <i className={`fas ${showMap ? 'fa-eye-slash' : 'fa-map-marked-alt'} me-1`}></i>
                                {showMap ? 'Hide Map' : 'Show Map & Pin Location'}
                              </button>
                            </div>
                            
                            {showMap && (
                              <div className="map-container mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small className="text-muted">
                                    <i className="fas fa-hand-pointer me-1"></i>
                                    Drag the pin to select your exact location
                                  </small>
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => {
                                      if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                          (position) => {
                                            const { latitude, longitude } = position.coords;
                                            setMapCenter({ lat: latitude, lng: longitude });
                                            
                                            // Reverse geocode to get address
                                            if (window.google) {
                                              const geocoder = new window.google.maps.Geocoder();
                                              geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
                                                if (status === 'OK' && results[0]) {
                                                  setAddress(results[0].formatted_address);
                                                  
                                                  // Parse address components
                                                  if (results[0].address_components) {
                                                    let city = '';
                                                    let state = '';
                                                    let postalCode = '';
                                                    
                                                    results[0].address_components.forEach((component: any) => {
                                                      const types = component.types;
                                                      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                                                        city = component.long_name;
                                                      } else if (types.includes('administrative_area_level_1')) {
                                                        state = component.long_name;
                                                      } else if (types.includes('postal_code')) {
                                                        postalCode = component.long_name;
                                                      }
                                                    });
                                                    
                                                    setCity(city);
                                                    setState(state);
                                                    setPostalCode(postalCode);
                                                  }
                                                }
                                              });
                                            }
                                          },
                                          (error) => {
                                            console.error('Error getting current location:', error);
                                            alert('Unable to get your current location. Please check your browser permissions.');
                                          }
                                        );
                                      } else {
                                        alert('Geolocation is not supported by this browser.');
                                      }
                                    }}
                                  >
                                    <i className="fas fa-crosshairs me-1"></i>
                                    Use My Location
                                  </button>
                                </div>
                                <div
                                  id="google-map"
                                  style={{
                                    height: '300px',
                                    width: '100%',
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6'
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="col-md-4 mb-3">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Enter city"
                            />
                          </div>

                          <div className="col-md-4 mb-3">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              className="form-control"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="Enter state"
                            />
                          </div>

                          <div className="col-md-4 mb-3">
                            <label className="form-label">Postal Code</label>
                            <input
                              type="text"
                              className="form-control"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              placeholder="Enter postal code"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Service Date <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              value={serviceDate}
                              onChange={(e) => setServiceDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
                            <small className="text-muted">
                              <i className="fas fa-calendar-alt me-1"></i>
                              Select your preferred service date
                            </small>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Service Time <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-control"
                              value={serviceTime}
                              onChange={(e) => setServiceTime(e.target.value)}
                              required
                            >
                              <option value="">Select time slot</option>
                              <option value="09:00">9:00 AM</option>
                              <option value="09:30">9:30 AM</option>
                              <option value="10:00">10:00 AM</option>
                              <option value="10:30">10:30 AM</option>
                              <option value="11:00">11:00 AM</option>
                              <option value="11:30">11:30 AM</option>
                              <option value="12:00">12:00 PM</option>
                              <option value="12:30">12:30 PM</option>
                              <option value="13:00">1:00 PM</option>
                              <option value="13:30">1:30 PM</option>
                              <option value="14:00">2:00 PM</option>
                              <option value="14:30">2:30 PM</option>
                              <option value="15:00">3:00 PM</option>
                              <option value="15:30">3:30 PM</option>
                              <option value="16:00">4:00 PM</option>
                              <option value="16:30">4:30 PM</option>
                              <option value="17:00">5:00 PM</option>
                            </select>
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              Available from 9:00 AM to 5:00 PM
                            </small>
                          </div>
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
                                
                                Place Order (<CurrencySymbol /> {formatPrice(cart.total)})
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
                    <div className="total-row">
                      <span className="total-label">Total:</span>
                                                    <span className="total-amount"><CurrencySymbol /> {formatPrice(cart.total)}</span>
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
    -webkit-border-radius: 24px;
    -moz-border-radius: 24px;
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
`}</style>
    </>
  );
} 