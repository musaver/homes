'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import CurrencySymbol from '@/components/CurrencySymbol';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  productName: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  totalPrice: string;
  productImage?: string;
  addons?: any;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  phone?: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes?: string;
  serviceDate?: string;
  serviceTime?: string;
  items: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login-register');
      return;
    }

    fetchOrder();
  }, [session, status, router, resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }

      setOrder(data.order);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending' },
      confirmed: { class: 'badge-info', text: 'Confirmed' },
      processing: { class: 'badge-primary', text: 'Processing' },
      shipped: { class: 'badge-secondary', text: 'Shipped' },
      delivered: { class: 'badge-success', text: 'Delivered' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatPrice = (price: string) => {
  const num = parseFloat(price);
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatServiceDateTime = (date?: string, time?: string) => {
    if (!date || !time) return 'Not scheduled';
    
    const serviceDate = new Date(date);
    const formattedDate = serviceDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
    
    return { date: formattedDate, time: formattedTime };
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <section className="space-top space-extra-bottom">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center">
                                <LoadingSpinner size="medium" color="#0d6efd" />
                  <h3 className="mt-3">Loading Order Details...</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <>
        <Header />
        
        <section className="space-top space-extra-bottom">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center">
                  <div className="error-icon mb-3">
                    <i className="fas fa-exclamation-triangle" style={{fontSize: '4rem', color: '#ef4444'}}></i>
                  </div>
                  <h2 className="mb-3">Order Not Found</h2>
                  <p className="text-muted mb-4">{error}</p>
                  <Link href="/dashboard/services" className="btn btn-primary">
                    Back
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <section className="space-top space-extra-bottom">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center">
                  <div className="error-icon mb-3">
                    <i className="fas fa-question-circle" style={{fontSize: '4rem', color: '#6b7280'}}></i>
                  </div>
                  <h2 className="mb-3">Order Not Found</h2>
                  <p className="text-muted mb-4">The requested order could not be found.</p>
                  <Link href="/dashboard/services" className="btn btn-primary">
                    Back
                  </Link>
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
    
      {/* Order Details Section */}
      <div className="service-details-container">
        <div className="service-header">
          <div className="container">
            <div className="header-content">
              <Link href="/dashboard/services" className="btn btn-outline-secondary max-width-100" style={{width: '200px'}}>
                <i className="fas fa-arrow-left"></i>
                <span className="ms-2">Back </span>
              </Link>
              
              <div className="service-info">
                <div className="service-icon">
                  <i className="fas fa-wrench"></i>
                </div>
                <div className="service-title-section">
                  <h1 className="service-title">Order Details</h1>
                  <p className="service-id">#{order.orderNumber}</p>
                  <p className="service-id">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="service-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: 'red' }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="service-content">
          <div className="container">
            <div className="content-grid">
              
              {/* Left Column */}
              <div className="left-column">
                

              {order.items.map((item) => (
                          <div key={item.id} className="section">
                            <div className="">
                            <h2 className="section-title">{item.productName}</h2>
                            <p className="section-subtitle mb-1">Check variations and add-ons</p>
                              

                          

                            <div className="variations-list">
                              {item.variantTitle && (
                                
                                <div className="variation-card">
                                  <div className="variation-info">
                                    <p className="variation-name">{item.variantTitle}</p>
                                  </div>
                                  <div className="variation-price">
                                    <CurrencySymbol /> {formatPrice(item.price)}
                                  </div>
                                </div>
                              )}
                            </div>
                              
                              
                              {(() => {
                                try {
                                  let processedAddons = null;
                                  
                                  if (Array.isArray(item.addons)) {
                                    processedAddons = item.addons;
                                  } else if (typeof item.addons === 'string') {
                                    // Handle double-encoded JSON strings
                                    let parsed = JSON.parse(item.addons);
                                    if (typeof parsed === 'string') {
                                      // It's double-encoded, parse again
                                      processedAddons = JSON.parse(parsed);
                                    } else {
                                      processedAddons = parsed;
                                    }
                                  } else if (item.addons && typeof item.addons === 'object') {
                                    processedAddons = item.addons;
                                  }
                                  
                                  if (processedAddons && Array.isArray(processedAddons) && processedAddons.length > 0) {
                                    // Group addons by groupTitle
                                    const groupedAddons = processedAddons.reduce((groups: Record<string, any[]>, addon: any) => {
                                      const groupKey = addon.groupTitle || 'Ungrouped';
                                      if (!groups[groupKey]) groups[groupKey] = [];
                                      groups[groupKey].push(addon);
                                      return groups;
                                    }, {});

                                    return (
                                      <div className="item-addons">
                                        {Object.entries(groupedAddons).map(([groupTitle, groupAddons]) => (
                                          <div key={groupTitle} className="addon-group mb-2">
                                            <div className="addon-group-title mb-2 mt-4">{groupTitle}:</div>
                                            <div className="addon-group-list variation-list">
                                              {(groupAddons as any[]).map((addon: any, index: number) => (
                                                <div key={index} className="addons-item variation-card mb-2">
                                                  <div className="variation-info">
                                                    <span className="addon-name">{addon.title || addon.name || addon.addonTitle}</span>
                                                    {addon.quantity && addon.quantity > 1 && (
                                                      <span className="addon-quantity"> × {addon.quantity}</span>
                                                    )}
                                                  </div>
                                                  <div className="variation-price">
                                                    {addon.price && (
                                                      <span className="addon-price"><CurrencySymbol /> {formatPrice(addon.price.toString())}</span>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                } catch (error: any) {
                                  return <div><strong>Error processing addons:</strong> {error.message}</div>;
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        ))}



                {/* Customer Notes */}
                {order.notes && (
                  <div className="section">
                    <h2 className="section-title">Service Notes</h2>
                    <div className="notes-content">
                      <p>{order.notes}</p>
                    </div>
                  </div>
                )}

              </div>

                {/* Right Column */}
              <div className="right-column">
                
                {/* Price Summary */}
                <div className="summary-card">
                  <h3 className="summary-title">Price Summary</h3>
                  
                  <div className="summary-item">
                    <span>Order Total</span>
                    <span><CurrencySymbol /> {formatPrice(order.totalAmount)}</span>
                  </div>
                  
                  
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-item">
                    <span>Subtotal</span>
                    <span><CurrencySymbol /> {formatPrice(order.totalAmount)}</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-item total">
                    <span>Total</span>
                    <span><CurrencySymbol /> {formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="details-card">
                  <h3 className="card-title">Service Details</h3>
                  
                  {order.serviceDate && order.serviceTime ? (
                    <>
                      <div className="detail-item">
                        <div className="detail-icon">
                          <i className="fas fa-calendar"></i>
                        </div>
                        <div className="detail-info">
                          <div className="detail-label">Service Date</div>
                          <div className="detail-value">
                            {(() => {
                              const formatted = formatServiceDateTime(order.serviceDate, order.serviceTime);
                              return typeof formatted === 'object' ? formatted.date : formatted;
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="detail-info">
                          <div className="detail-label">Service Time</div>
                          <div className="detail-value">
                            {(() => {
                              const formatted = formatServiceDateTime(order.serviceDate, order.serviceTime);
                              return typeof formatted === 'object' ? formatted.time : formatted;
                            })()}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-calendar-times"></i>
                      </div>
                      <div className="detail-info">
                        <div className="detail-label">Service Schedule</div>
                        <div className="detail-value">Not scheduled yet</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="detail-info">
                      <div className="detail-label">Service Location</div>
                      <div className="detail-value">{order.shippingAddress1}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="detail-info">
                      <div className="detail-label">Order Placed</div>
                      <div className="detail-value">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Assigned Technician */}
                <div className="technician-card">
                  <h3 className="card-title">Assigned Technician</h3>
                  
                  <div className="technician-info">
                    <div className="technician-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="technician-details">
                      <h4 className="technician-name">{order.email}</h4>
                      <p className="technician-title">{order.email}</p>
                    </div>
                  </div>
                  
                  <div className="contact-info">
                    <div className="contact-item">
                      <i className="fas fa-phone"></i>
                      <span>{order.phone}</span>
                    </div>
                    <div className="contact-item">
                      <i className="fas fa-envelope"></i>
                      <span>{order.email}</span>
                    </div>
                  </div>
                  
                  
                </div>

              </div>


            </div>
          </div>
        </div>

        
      </div>
      <Footer />

      <style jsx>{`
       .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          margin-top: 1rem;
        }

        .service-details-container {
          background: #f8fafc;
          min-height: calc(100vh - 140px);
        }

        .service-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #374151;
        }

        .service-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .service-icon {
          width: 48px;
          height: 48px;
          background: #f3f4f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 20px;
        }

        .service-title-section {
          flex: 1;
        }

        .service-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .service-id {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        .service-content {
          padding: 32px 0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .section-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .variations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .variation-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .variation-card:hover {
          border-color: #d1d5db;
        }

        .variation-card.selected {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .variation-info {
          flex: 1;
        }

        .variation-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .variation-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .variation-price {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .addons-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .status-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e5e7eb;
          flex-shrink: 0;
        }

        .status-step.completed .status-dot {
          background: var(--theme-color, #2A07F9);
        }

        .status-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .status-step.completed .status-label {
          color: #1f2937;
          font-weight: 500;
        }

        .addon-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .addon-checkbox {
          position: relative;
        }

        .addon-checkbox input[type="checkbox"] {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .addon-checkbox input[type="checkbox"]:checked {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .addon-checkbox input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .addon-info {
          flex: 1;
        }

        .addon-name {
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .addon-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .addon-price {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .notes-content {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .notes-content p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
        }

        .summary-card, .details-card, .technician-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .summary-title, .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          font-size: 14px;
          color: #374151;
        }

        .summary-item.total {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          padding-top: 16px;
        }

        .summary-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 8px 0;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-icon {
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 14px;
          flex-shrink: 0;
        }

        .detail-info {
          flex: 1;
        }

        .detail-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .detail-value {
          font-size: 14px;
          color: #1f2937;
          font-weight: 500;
        }

        .technician-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .technician-avatar {
          width: 48px;
          height: 48px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 20px;
          overflow: hidden;
        }

        .technician-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .technician-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 2px 0;
        }

        .technician-title {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }

        .technician-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .rating-stars {
          color: #fbbf24;
        }

        .rating-value {
          color: #6b7280;
          font-weight: 500;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }

        .contact-item i {
          width: 16px;
          color: #6b7280;
        }

        .specialties {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }

        .specialties-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .specialties-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .specialty-tag {
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 12px;
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .service-content {
            padding: 24px 0;
          }

          .section, .summary-card, .details-card, .technician-card {
            padding: 20px;
            margin-bottom: 20px;
          }

          .service-info {
            flex-wrap: wrap;
            gap: 12px;
          }

          .service-title {
            font-size: 20px;
          }

          .variation-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .variation-price {
            align-self: flex-end;
          }

          .addon-item {
            flex-wrap: wrap;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .service-header {
            padding: 16px 0;
          }

          .header-content {
            gap: 16px;
          }

          .service-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .section-title {
            font-size: 18px;
          }

          .variation-card, .addon-item {
            padding: 16px;
          }

          .technician-info {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .technician-avatar {
            align-self: center;
          }
        }

        .filters-section {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 32px 24px;
          border-radius: 20px;
          margin-bottom: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .status-filters {
          display: flex;
          gap: 16px;
          justify-content: center;
          width: max-content;
          margin: 0 auto;
        }

        .status-filters :global(a),
        .status-filters :global(button),
        .filter-btn {
          border-radius: 100px;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 16px 24px !important;
          background: white !important;
          border: 2px solid #e5e7eb !important;
          color: #6b7280 !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          text-decoration: none !important;
          position: relative !important;
          overflow: hidden !important;
          min-width: 140px !important;
          justify-content: center !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }

        .status-filters :global(a)::before,
        .status-filters :global(button)::before,
        .filter-btn::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: -100% !important;
          width: 100% !important;
          height: 100% !important;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent) !important;
          transition: left 0.5s ease !important;
        }

        .status-filters :global(a):hover::before,
        .status-filters :global(button):hover::before,
        .filter-btn:hover::before {
          left: 100% !important;
        }

        .status-filters :global(a):hover,
        .status-filters :global(button):hover,
        .filter-btn:hover {
          border-color: var(--theme-color, #2A07F9) !important;
          color: var(--theme-color, #2A07F9) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 24px rgba(42, 7, 249, 0.15) !important;
        }

        .status-filters :global(a.active),
        .status-filters :global(button.active),
        .filter-btn.active {
          border-color: var(--theme-color, #2A07F9) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 24px rgba(42, 7, 249, 0.25) !important;
        }

        .status-filters :global(a.active)::before,
        .status-filters :global(button.active)::before,
        .filter-btn.active::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
        }

        .status-filters :global(a.active):hover,
        .status-filters :global(button.active):hover,
        .filter-btn.active:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 32px rgba(42, 7, 249, 0.3) !important;
        }

        /* Logout button specific styling */
        .status-filters :global(button:last-child) {
          background: white !important;
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }

        .status-filters :global(button:last-child):hover {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          border-color: #ef4444 !important;
          color: white !important;
          box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25) !important;
        }

        .status-filters :global(button:last-child)::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
        }

        /* Icon styling */
        .status-filters :global(a) i,
        .status-filters :global(button) i,
        .filter-btn i {
          font-size: 1rem !important;
          transition: transform 0.3s ease !important;
        }

        .status-filters :global(a):hover i,
        .status-filters :global(button):hover i,
        .filter-btn:hover i {
          transform: scale(1.1) !important;
        }

        .status-filters :global(a.active) i,
        .status-filters :global(button.active) i,
        .filter-btn.active i {
          transform: scale(1.05) !important;
        }
      `}</style>
    </>
  );
} 