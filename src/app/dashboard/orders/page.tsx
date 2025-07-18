'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CurrencySymbol from '@/components/CurrencySymbol';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  productName: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  totalPrice: string;
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
  serviceDate?: string;
  serviceTime?: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login-register');
      return;
    }
    fetchOrders();
  }, [session, status, router]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Orders Page: Starting to fetch orders');
      console.log('🔍 Orders Page: Session data:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name
      });
      
      const response = await fetch('/api/orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Orders Page: Orders response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Orders Page: Orders data received:', {
          orderCount: data?.length || 0,
          isArray: Array.isArray(data)
        });
        
        // Handle the new API response format (direct array instead of wrapped object)
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        console.error('❌ Orders Page: Failed to fetch orders:', errorData);
        setError(errorData.error || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('❌ Orders Page: Error fetching orders:', error);
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': '#F59E0B',
      'confirmed': '#8B5CF6',
      'processing': '#3B82F6',
      'shipped': '#06B6D4',
      'delivered': '#10B981',
      'cancelled': '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
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

  const formatPrice = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatServiceDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatServiceTime = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
  };

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

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
                  <h3 className="mt-3">Loading Orders...</h3>
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

  return (
    <>
      <Header />
      
      <div className="orders-container">
        {/* Navigation */}
        <div className="filters-section">
          <div className="container">
            <div className="status-filters">
              <Link className="filter-btn" href="/dashboard"><i className="fas fa-th-large"></i> Dashboard </Link>
              <Link className="filter-btn" href="/dashboard/profile"><i className="fas fa-user"></i> Profile </Link>
              <Link className="filter-btn active" href="/dashboard/orders"><i className="fas fa-shopping-cart"></i> Orders </Link>
              <button className="filter-btn" onClick={() => signOut({ callbackUrl: '/login-register' })}><i className="fas fa-sign-out-alt"></i> Logout</button>
            </div>
          </div>
        </div>

        {/* Orders Content */}
        <div className="orders-content">
          <div className="container">
            
            {/* Page Header */}
            <div className="page-header">
              <div className="header-info">
                <h2 className="page-title">My Orders</h2>
                <p className="page-subtitle">Complete history of your service bookings</p>
              </div>
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statusCounts.pending + statusCounts.confirmed + statusCounts.processing + statusCounts.shipped}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statusCounts.delivered}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="error-state">
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                  <button 
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={fetchOrders}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            {!error && (
              <div className="filters-controls">
                <div className="row">
                  <div className="col-md-6">
                    <div className="search-box">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search orders by number or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <i className="fas fa-search search-icon"></i>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status ({statusCounts.all})</option>
                      <option value="pending">Pending ({statusCounts.pending})</option>
                      <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                      <option value="processing">Processing ({statusCounts.processing})</option>
                      <option value="shipped">Shipped ({statusCounts.shipped})</option>
                      <option value="delivered">Delivered ({statusCounts.delivered})</option>
                      <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Orders List */}
            {!error && (
              <div className="orders-section">
                {filteredOrders.length > 0 ? (
                  <div className="orders-list">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <h4 className="order-number">#{order.orderNumber}</h4>
                            <div className="order-meta">
                              <span className="order-date">
                                <i className="fas fa-calendar-alt me-1"></i>
                                Placed on {formatDate(order.createdAt)}
                              </span>
                              {order.serviceDate && order.serviceTime && (
                                <span className="service-schedule">
                                  <i className="fas fa-clock me-1"></i>
                                  Scheduled for {formatServiceDate(order.serviceDate)} at {formatServiceTime(order.serviceTime)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="order-status">
                            <span 
                              className="status-badge" 
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="order-items">
                          {order.items.map((item, index) => (
                            <div key={item.id} className="order-item">
                              <div className="item-icon">
                                <i className={getServiceIcon(item.productName)}></i>
                              </div>
                              <div className="item-details">
                                <h5 className="item-name">{item.productName}</h5>
                                {item.variantTitle && (
                                  <p className="item-variant">{item.variantTitle}</p>
                                )}
                                <p className="item-quantity">Quantity: {item.quantity}</p>
                              </div>
                              <div className="item-price">
                                <CurrencySymbol /> {formatPrice(item.totalPrice)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="order-footer">
                          <div className="order-total">
                            <strong>
                              Total: <CurrencySymbol /> {formatPrice(order.totalAmount)}
                            </strong>
                          </div>
                          <div className="order-actions">
                            <Link 
                              href={`/dashboard/orders/${order.id}`} 
                              className="btn btn-primary btn-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-shopping-cart empty-icon"></i>
                    <h3>No Orders Found</h3>
                    <p>
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No orders match your current filters. Try adjusting your search or filter criteria.'
                        : 'You haven\'t placed any orders yet. Start by exploring our available services.'
                      }
                    </p>
                    {(!searchTerm && statusFilter === 'all') && (
                      <Link href="/" className="btn btn-primary mt-3">
                        Explore Services
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      
      <style jsx>{`
        .orders-container {
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

        .filter-btn.active {
          border-color: var(--theme-color, #2A07F9) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 24px rgba(42, 7, 249, 0.25) !important;
        }

        .orders-content {
          padding: 40px 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 32px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--theme-color, #2A07F9);
        }

        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .error-state {
          margin-bottom: 32px;
        }

        .filters-controls {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          margin-bottom: 32px;
        }

        .search-box {
          position: relative;
        }

        .search-box input {
          padding-right: 40px;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .orders-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
        }

        .order-card {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-card:last-child {
          border-bottom: none;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .order-number {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .order-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .service-schedule {
          color: #059669;
          font-weight: 500;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .order-items {
          margin-bottom: 16px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .item-variant {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 4px 0;
        }

        .item-quantity {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .item-price {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .order-total {
          font-size: 1.125rem;
          color: #1f2937;
        }

        .empty-state {
          text-align: center;
          padding: 64px 24px;
        }

        .empty-icon {
          font-size: 64px;
          color: #d1d5db;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0 0 20px 0;
          font-size: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 24px;
          }

          .header-stats {
            gap: 16px;
          }

          .order-header {
            flex-direction: column;
            gap: 12px;
          }

          .order-footer {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .order-actions {
            text-align: center;
          }

          .filters-controls .row {
            gap: 16px;
          }

          .filters-controls .col-md-6 {
            width: 100%;
          }
        }
      `}</style>
      
      <Footer />
    </>
  );
} 