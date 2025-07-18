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
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
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
      setLoading(true);
      setError('');
      
      console.log('🔍 Order Details: Fetching order:', resolvedParams.id);
      
      const response = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Order Details: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Order Details: Order data received:', data);
        setOrder(data.order);
      } else {
        const errorData = await response.json();
        console.error('❌ Order Details: Failed to fetch order:', errorData);
        setError(errorData.error || 'Failed to fetch order details');
      }
    } catch (error: any) {
      console.error('❌ Order Details: Error:', error);
      setError(error.message || 'An error occurred while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#8B5CF6',
      processing: '#3B82F6',
      shipped: '#06B6D4',
      delivered: '#10B981',
      cancelled: '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: '#F59E0B',
      paid: '#10B981',
      failed: '#EF4444',
      refunded: '#6B7280'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
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

  const formatServiceDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatServiceTime = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
  };

  const getServiceIcon = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('plumb')) return 'fas fa-wrench';
    if (name.includes('electric')) return 'fas fa-bolt';
    if (name.includes('clean')) return 'fas fa-broom';
    if (name.includes('hvac') || name.includes('heating')) return 'fas fa-fan';
    if (name.includes('paint')) return 'fas fa-paint-roller';
    return 'fas fa-tools';
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
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                  <Link href="/dashboard/orders" className="btn btn-primary">
                    Back to Orders
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
                  <h3>Order not found</h3>
                  <Link href="/dashboard/orders" className="btn btn-primary">
                    Back to Orders
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
    
      <div className="order-details-container">
        {/* Navigation */}
        <div className="filters-section">
          <div className="container">
            <div className="status-filters">
              <Link className="filter-btn" href="/dashboard"><i className="fas fa-th-large"></i> Dashboard</Link>
              <Link className="filter-btn" href="/dashboard/profile"><i className="fas fa-user"></i> Profile</Link>
              <Link className="filter-btn active" href="/dashboard/orders"><i className="fas fa-shopping-cart"></i> Orders</Link>
              <button className="filter-btn" onClick={() => signOut({ callbackUrl: '/login-register' })}><i className="fas fa-sign-out-alt"></i> Logout</button>
            </div>
          </div>
        </div>

        {/* Order Details Content */}
        <div className="order-details-content">
          <div className="container">
            
            {/* Back Button */}
            <div className="back-section">
              <Link href="/dashboard/orders" className="btn btn-outline-secondary">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Orders
              </Link>
            </div>

            {/* Order Header */}
            <div className="order-header-card">
              <div className="order-header-content">
                <div className="order-info">
                  <h1 className="order-title">Order #{order.orderNumber}</h1>
                  <div className="order-meta">
                    <span className="order-date">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Placed on {formatDate(order.createdAt)}
                    </span>
                    {order.serviceDate && order.serviceTime && (
                      <span className="service-schedule">
                        <i className="fas fa-clock me-2"></i>
                        Scheduled for {formatServiceDate(order.serviceDate)} at {formatServiceTime(order.serviceTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="order-status-badges">
                  <div className="status-badge-wrapper">
                    <span className="status-label">Order Status: &nbsp; </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <br />
                  <div className="status-badge-wrapper">
                    <span className="status-label">Payment Status: &nbsp; </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-content-grid">
              {/* Left Column - Order Items */}
              <div className="order-items-section">
                <div className="section-card">
                  <h2 className="section-title">Order Items</h2>
                  <div className="items-list">
                    {order.items.map((item) => (
                      <div key={item.id} className="item-card">
                        <div className="item-icon">
                          <i className={getServiceIcon(item.productName)}></i>
                        </div>
                        <div className="item-details">
                          <h3 className="item-name">{item.productName}</h3>
                          {item.variantTitle && (
                            <p className="item-variant">{item.variantTitle}</p>
                          )}
                          <div className="item-meta">
                            <span className="item-quantity">Qty: {item.quantity}</span>
                            <span className="item-unit-price">
                              <CurrencySymbol /> {formatPrice(item.price)} each
                            </span>
                          </div>
                          {item.addons && Array.isArray(item.addons) && item.addons.length > 0 && (
                            <div className="item-addons">
                              <h4>Add-ons:</h4>
                              {item.addons.map((addon: any, index: number) => (
                                <div key={index} className="addon-item">
                                  <span>{addon.title || addon.name || `Addon ${index + 1}`}</span>
                                  <span>Qty: {addon.quantity || 1}</span>
                                  <span><CurrencySymbol /> {formatPrice(addon.price || '0')}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="item-total">
                          <CurrencySymbol /> {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary & Details */}
              <div className="order-summary-section">
                {/* Order Summary */}
                <div className="section-card">
                  <h2 className="section-title">Order Summary</h2>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span><CurrencySymbol /> {formatPrice(order.subtotal || '0')}</span>
                    </div>
                    {order.taxAmount && parseFloat(order.taxAmount) > 0 && (
                      <div className="summary-row">
                        <span>Tax</span>
                        <span><CurrencySymbol /> {formatPrice(order.taxAmount)}</span>
                      </div>
                    )}
                    {order.shippingAmount && parseFloat(order.shippingAmount) > 0 && (
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span><CurrencySymbol /> {formatPrice(order.shippingAmount)}</span>
                      </div>
                    )}
                    {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                      <div className="summary-row">
                        <span>Discount</span>
                        <span><CurrencySymbol /> {formatPrice(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="summary-row total-row">
                      <span>Total</span>
                      <span><CurrencySymbol /> {formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="section-card">
                  <h2 className="section-title">Contact Information</h2>
                  <div className="contact-details">
                    <div className="contact-item">
                      <i className="fas fa-envelope"></i>
                      <span>{order.email}</span>
                    </div>
                    {order.phone && (
                      <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{order.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Address */}
                <div className="section-card">
                  <h2 className="section-title">Service Address</h2>
                  <div className="address-details">
                    <p>{order.shippingAddress1}</p>
                    {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
                    <p>
                      {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                    </p>
                    <p>{order.shippingCountry}</p>
                  </div>
                </div>

                {/* Special Instructions */}
                {order.notes && (
                  <div className="section-card">
                    <h2 className="section-title">Special Instructions</h2>
                    <div className="notes-content">
                      <p>{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        .order-details-container {
          min-height: 100vh;
          background: #f8fafc;
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

        .filter-btn:hover {
          border-color: var(--theme-color, #2A07F9) !important;
          color: var(--theme-color, #2A07F9) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 24px rgba(42, 7, 249, 0.15) !important;
        }

        .order-details-content {
          padding: 40px 0;
        }

        .back-section {
          margin-bottom: 24px;
        }

        .order-header-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .order-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .order-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .order-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .service-schedule {
          color: #059669;
          font-weight: 500;
        }

        .order-status-badges {
          display: block;
          gap: 12px;
          text-align: right;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .order-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .section-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
        }

        .item-icon {
          width: 48px;
          height: 48px;
          background: var(--theme-color, #2A07F9);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .item-variant {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 8px 0;
        }

        .item-meta {
          display: flex;
          gap: 16px;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .item-addons {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .item-addons h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .addon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .item-total {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          flex-shrink: 0;
        }

        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 0.875rem;
        }

        .summary-row.total-row {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          margin-top: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .contact-item i {
          width: 20px;
          color: var(--theme-color, #2A07F9);
        }

        .address-details {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
        }

        .address-details p {
          margin: 0 0 4px 0;
        }

        .notes-content {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
        }

        .notes-content p {
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .order-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .order-header-content {
            flex-direction: column;
            gap: 16px;
          }

          .order-status-badges {
            align-self: flex-start;
          }

          .item-card {
            flex-direction: column;
            gap: 12px;
          }

          .item-details {
            order: 1;
          }

          .item-total {
            order: 2;
            align-self: flex-start;
          }

          .order-meta {
            gap: 4px;
          }
        }


        .services-container {
          min-height: 100vh;
          background: #f8fafc;
        }

        .filters-section {
          background: white;
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