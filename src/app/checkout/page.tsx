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
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
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
    vatTax: { enabled: boolean; type: 'percentage' | 'fixed'; value: number } | null;
    serviceTax: { enabled: boolean; type: 'percentage' | 'fixed'; value: number } | null;
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

  // Track if user just navigated back to step 1
  const [justNavigatedBack, setJustNavigatedBack] = useState(false);
  
  // Track previous values to detect actual changes
  const [previousServiceDate, setPreviousServiceDate] = useState('');
  const [previousServiceTime, setPreviousServiceTime] = useState('');

  // Auto-advance to step 2 when both date and time are selected (but not when navigating back)
  useEffect(() => {
    // Only auto-advance if:
    // 1. We're on step 1
    // 2. Both date and time are selected
    // 3. User didn't just navigate back
    // 4. At least one of the values actually changed (not just pre-filled)
    const dateChanged = serviceDate && serviceDate !== previousServiceDate;
    const timeChanged = serviceTime && serviceTime !== previousServiceTime;
    
    if (currentStep === 1 && serviceDate && serviceTime && !justNavigatedBack && (dateChanged || timeChanged)) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        setCurrentStep(2);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Update previous values
    setPreviousServiceDate(serviceDate);
    setPreviousServiceTime(serviceTime);
    
    // Reset the navigation flag after a short delay
    if (justNavigatedBack) {
      const resetTimer = setTimeout(() => {
        setJustNavigatedBack(false);
      }, 100);
      return () => clearTimeout(resetTimer);
    }
  }, [serviceDate, serviceTime, currentStep, justNavigatedBack, previousServiceDate, previousServiceTime]);

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

  // Calculate taxes when cart changes
  useEffect(() => {
    if (taxSettings && cart.items.length > 0) {
      const taxes = calculateTaxes(cart.total, taxSettings.vatTax, taxSettings.serviceTax);
      setTotalTaxCalculation(taxes);
    } else {
      setTotalTaxCalculation({
        vatAmount: 0,
        serviceAmount: 0,
        totalTaxAmount: 0,
        finalAmount: cart.total,
      });
    }
  }, [cart.total, taxSettings]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!serviceDate || !serviceTime) {
        setError('Please select both service date and time');
        return;
      }
      setError('');
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setJustNavigatedBack(true);
      setCurrentStep(1);
      setError('');
    }
  };

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
        // Handle slot conflict specifically
        if (response.status === 409) {
          setError(`${data.error} Please refresh and select a new time slot.`);
          // Optionally refresh the time slots for the selected date
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          throw new Error(data.error || 'Failed to place order');
        }
        return;
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
              <div className="col-lg-8">
                <div className="text-center">
                  <div className="success-icon mb-4">
                    <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="mb-3">Order Placed Successfully!</h2>
                  <p className="lead mb-4">{success}</p>
                  <p className="text-muted">Redirecting to your dashboard...</p>
                  <LoadingSpinner size="small" />
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
                      
                      {/* Step Indicator */}
                      <div className="step-indicator mb-4">
                        <div className="steps-container">
                          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Service Schedule</div>
                          </div>
                          <div className="step-line"></div>
                          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Billing Details</div>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="alert alert-danger mb-4">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        {/* Step 1: Service Date & Time */}
                        {currentStep === 1 && (
                          <div className="step-content">
                            <h3 className="mb-4">When would you like the service?</h3>
                            <p className="text-muted mb-4">Select your preferred date and time for the service.</p>
                            
                            <DateTimePicker
                              selectedDate={serviceDate}
                              selectedTime={serviceTime}
                              onDateChange={setServiceDate}
                              onTimeChange={setServiceTime}
                            />

                            <div className="d-flex justify-content-end mt-4">
                              <button
                                type="button"
                                className="th-btn"
                                onClick={handleNextStep}
                                disabled={!serviceDate || !serviceTime}
                              >
                                Next: Billing Details
                                <i className="fas fa-arrow-right ms-2"></i>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Step 2: Billing Information */}
                        {currentStep === 2 && (
                          <div className="step-content">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                              <h3 className="mb-0">Billing Information</h3>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handlePreviousStep}
                              >
                                <i className="fas fa-arrow-left me-2"></i>
                                Back
                              </button>
                            </div>
                            
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

                              <div className="col-md-6 mb-3">
                                <label className="form-label">City</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                  placeholder="City"
                                />
                              </div>

                              <div className="col-md-6 mb-3">
                                <label className="form-label">State/Emirate</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={state}
                                  onChange={(e) => setState(e.target.value)}
                                  placeholder="State/Emirate"
                                />
                              </div>

                              <div className="col-md-6 mb-3">
                                <label className="form-label">Postal Code</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={postalCode}
                                  onChange={(e) => setPostalCode(e.target.value)}
                                  placeholder="Postal Code"
                                />
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
                            
                            <div className="d-flex justify-content-between mt-4">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handlePreviousStep}
                              >
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to Schedule
                              </button>
                              
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
                          </div>
                        )}
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
                  <h4 className="summary-title">Order Summary</h4>
                  
                  {/* Service Schedule Summary */}
                  {serviceDate && serviceTime && (
                    <div className="service-schedule-summary mb-4">
                      <h6 className="text-muted mb-2">Service Schedule</h6>
                      <div className="schedule-info">
                        <div className="schedule-item">
                          <i className="fas fa-calendar me-2"></i>
                          <span>{new Date(serviceDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="schedule-item">
                          <i className="fas fa-clock me-2"></i>
                          <span>{(() => {
                            const [hours, minutes] = serviceTime.split(':');
                            const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
                            const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                            return `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
                          })()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {cart.items.map((item: CartItem, index) => (
                    <div key={index} className="order-item">
                      <div className="product-info">
                        <h5 className="product-name">{item.productTitle}</h5>
                        
                        {/* Show selected variations */}
                        {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
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
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="addons-section">
                          <div className="addons-list">
                            {Object.entries(
                              item.selectedAddons.reduce((acc: Record<string, number>, addon: any) => {
                                acc[addon.title] = (acc[addon.title] || 0) + addon.quantity;
                                return acc;
                              }, {})
                            ).map(([title, quantity]) => (
                              <div key={title} className="addon-item">
                                <span className="addon-title">{title}</span>
                                <span className="addon-quantity">x{quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="item-total-section">
                        <div className="price-breakdown">
                          <div className="price-row">
                            <span className="price-label">Total Price:</span>
                            <span className="item-price">
                              <CurrencySymbol /> {formatPrice(item.productPrice)}
                            </span>
                          </div>
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="addon-details d-none">
                              <small className="text-muted">Includes selected add-ons:</small>
                              {item.selectedAddons.map((addon, addonIndex) => (
                                <div key={addonIndex} className="addon-detail-item">
                                  <span className="addon-name">{addon.title}</span>
                                  {addon.quantity > 1 && <span className="addon-qty"> × {addon.quantity}</span>}
                                </div>
                              ))}
                            </div>
                          )}
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

                    {taxSettings?.vatTax?.enabled && (
                      <div className="total-row tax-row">
                        <span className="total-label">
                          VAT ({taxSettings.vatTax.type === 'percentage' ? `${taxSettings.vatTax.value}%` : 'Fixed'}):
                        </span>
                        <span className="total-amount">
                          <CurrencySymbol /> {formatPrice(totalTaxCalculation.vatAmount)}
                        </span>
                      </div>
                    )}

                    {taxSettings?.serviceTax?.enabled && (
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

                    <div className="total-row final-total-row">
                      <span className="total-label">Total:</span>
                      <span className="total-amount final-amount">
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

      <style jsx>{`
        .step-indicator {
          margin-bottom: 2rem;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 400px;
          margin: 0 auto;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: var(--theme-color, #2A07F9);
          color: white;
        }

        .step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .step.active .step-label {
          color: var(--theme-color, #2A07F9);
          font-weight: 600;
        }

        .step.completed .step-label {
          color: #10b981;
        }

        .step-line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          margin: 0 1rem;
          margin-top: -20px;
        }

        .step.completed + .step-line {
          background: #10b981;
        }

        .step-content {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .service-schedule-summary {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }

        .schedule-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: normal;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #374151;
        }

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
          margin-right: 8px;
        }

        .addons-section {
          margin-bottom: 1rem;
        }

        .addons-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .addon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #6b7280;
          padding: 0.25rem 0;
        }

        .addon-title {
          flex: 1;
        }

        .addon-quantity {
          font-weight: 500;
          color: #374151;
        }

        .item-total-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 0.75rem;
        }

        .price-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subtotal-item {
          border-top: 1px solid #f3f4f6;
          padding-top: 0.5rem;
          margin-top: 0.25rem;
        }

        .subtotal-item .price-label {
          font-weight: 600;
          color: #374151;
        }

        .subtotal-item .item-price {
          font-weight: 600;
          color: #374151;
        }

        .addon-details {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .addon-detail-item {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          color: #374151;
          margin-top: 0.25rem;
        }

        .addon-name {
          font-weight: 500;
        }

        .addon-qty {
          color: #6b7280;
          margin-left: 0.25rem;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .price-label {
          font-size: 0.95rem;
          color: #6b7280;
          font-weight: 400;
        }

        .item-price, .total-amount {
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
        }

        .summary-divider, .item-divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1rem 0;
        }

        .total-section {
          margin-top: 1rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .subtotal-row, .tax-row {
          font-size: 0.95rem;
        }

        .final-total-row {
          font-size: 1.1rem;
          font-weight: 600;
          padding-top: 0.75rem;
          border-top: 2px solid #e5e7eb;
        }

        .final-amount {
          font-size: 1.25rem;
          color: #3b82f6;
          font-weight: 700;
        }

        .total-label {
          color: #1f2937;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .steps-container {
            max-width: 300px;
          }
          
          .step-number {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }
          
          .step-label {
            font-size: 0.8rem;
          }
          
          .order-summary-widget {
            padding: 20px;
          }
          
          .summary-title {
            font-size: 1.3rem;
          }
          
          .final-amount {
            font-size: 1.15rem;
          }
        }
      `}</style>

      <Footer />
    </>
  );
} 