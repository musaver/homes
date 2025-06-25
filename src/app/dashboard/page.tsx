// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CurrencySymbol from '@/components/CurrencySymbol';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  serviceDate?: string;
  serviceTime?: string;
  items: Array<{
    id: string;
    productName: string;
    variantTitle?: string;
    quantity: number;
    price: string;
    totalPrice: string;
  }>;
}

interface DashboardStats {
  totalServices: number;
  totalAmount: number;
  activeServices: number;
  completedServices: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    totalAmount: 0,
    activeServices: 0,
    completedServices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login-register');
      return;
    }
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await fetch('/api/orders');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
        
        // Calculate stats from orders
        const totalServices = ordersData.orders?.length || 0;
        const totalAmount = ordersData.orders?.reduce((sum: number, order: Order) => 
          sum + parseFloat(order.totalAmount), 0) || 0;
        const activeServices = ordersData.orders?.filter((order: Order) => 
          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)).length || 0;
        const completedServices = ordersData.orders?.filter((order: Order) => 
          order.status === 'delivered').length || 0;
        
        setStats({
          totalServices,
          totalAmount,
          activeServices,
          completedServices
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
                  <h3 className="mt-3">Loading Dashboard...</h3>
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

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalServices.toString(),
      changeType: 'positive',
      icon: 'fas fa-tools',
      color: '#109FDB'
    },
    {
      title: 'Amount Spent',
      value: `${formatPrice(stats.totalAmount)}`,
      symbol: true,
      changeType: 'positive',
      icon: '',
      color: '#109FDB'
    },
    {
      title: 'Active Orders',
      value: stats.activeServices.toString(),
      icon: 'fas fa-chart-line',
      color: '#109FDB'
    },
    {
      title: 'Completed Orders',
      value: stats.completedServices.toString(),
      icon: 'fas fa-check-circle',
      color: '#109FDB'
    }
  ];

  const recentOrders = orders.slice(0, 4);

  return (
    <>
      <Header />
      

      <div className="dashboard-container">
        

        <div className="filters-section">
          <div className="container">
            <div className="status-filters">
              <Link className="filter-btn active" href="/dashboard"><i className="fas fa-th-large"></i> Dashboard </Link>
              <Link className="filter-btn " href="/dashboard/profile"><i className="fas fa-user"></i> Profile </Link>
              <Link className="filter-btn " href="/dashboard/services"><i className="fas fa-shopping-cart"></i> Orders </Link>
              <button className="filter-btn " onClick={() => signOut({ callbackUrl: '/login-register' })}><i className="fas fa-sign-out-alt"></i> Logout</button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="container">
            
            {/* Welcome Section */}
            <div className="welcome-section">
              <h2>Welcome back, {session.user?.name || 'User'}!</h2>
              <p>Here's an overview of your service activities and account status.</p>
            </div>
            
            {/* Stats Cards */}
            <div className="stats-grid">
              {statsCards.map((card, index) => (
                <div key={index} className="stats-card">
                  <div className="stats-card-content">
                    <div className="stats-info">
                      <h3 className="stats-title">{card.title}</h3>
                      <div className="stats-value">
                        {card.value}
                      </div>
                    </div>
                    <div className="stats-icon" style={{ backgroundColor: card.color }}>
                    {card.symbol ? <CurrencySymbol /> : ''}
                      <i className={card.icon}></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Services */}
            <div className="recent-services-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Recent Orders</h2>
                  <p className="section-subtitle">Complete history of your order bookings</p>
                </div>
                <Link href="/dashboard/services" className="th-btn">
                  View All Orders
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="services-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="service-card">
                      <div className="service-icon">
                        <i className={getServiceIcon(order.items[0]?.productName || 'Service')}></i>
                      </div>
                      <div className="service-info">
                        <h4 className="service-title">
                          {order.items[0]?.productName || 'Service Order'}
                        </h4>
                        <div className="service-meta">
                          <span className="service-id">#{order.orderNumber}</span>
                          <span className="service-separator">•</span>
                          <span className="service-date">Booked on {formatDate(order.createdAt)}</span>
                        </div>
                        {order.serviceDate && order.serviceTime && (
                          <div className="service-schedule">
                            <i className="fas fa-calendar-alt me-1"></i>
                            <span className="schedule-date">{formatServiceDate(order.serviceDate)}</span>
                            <span className="service-separator">•</span>
                            <i className="fas fa-clock me-1"></i>
                            <span className="schedule-time">{formatServiceTime(order.serviceTime)}</span>
                          </div>
                        )}
                      </div>
                      <div className="service-status">
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="service-price">
                        <CurrencySymbol /> {formatPrice(parseFloat(order.totalAmount))}
                      </div>
                      <div className="service-action">
                        <Link href={`/dashboard/orders/${order.id}`} className="view-details-btn">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-tools empty-icon"></i>
                  <h3>No Orders Yet</h3>
                  <p>You haven't booked any orders yet. Start by exploring our available orders.</p>
                  <Link href="/" className="btn btn-primary mt-3">
                    Explore Orders
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .nav-links-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .nav-links-wrapper::-webkit-scrollbar {
          display: none;
        }

        .nav-links-container {
          display: flex;
          gap: 20px;
          min-width: max-content;
          padding: 0 20px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          min-width: 200px;
          white-space: nowrap;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9), #4c1d95);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          border-color: var(--theme-color, #2A07F9);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 7, 249, 0.15);
        }

        .nav-link:hover::before {
          transform: scaleX(1);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--theme-color, #2A07F9), #4c1d95);
          border-color: var(--theme-color, #2A07F9);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 7, 249, 0.25);
        }

        .nav-link.active::before {
          transform: scaleX(1);
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(107, 114, 128, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .nav-link.active .nav-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .nav-link:hover .nav-icon {
          background: rgba(42, 7, 249, 0.1);
          color: var(--theme-color, #2A07F9);
        }

        .nav-link.active:hover .nav-icon {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .nav-content {
          flex: 1;
          text-align: left;
        }

        .nav-title {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }

        .nav-subtitle {
          display: block;
          font-size: 0.875rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .nav-link.active .nav-subtitle {
          opacity: 0.9;
        }

        .logout-btn {
          background: white !important;
          border: 2px solid #ef4444 !important;
          color: #ef4444 !important;
        }

        .logout-btn:hover {
          background: #ef4444 !important;
          color: white !important;
          border-color: #ef4444 !important;
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25) !important;
        }

        .logout-btn .nav-icon {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }

        .logout-btn:hover .nav-icon {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        .dashboard-content {
          padding: 40px 0;
        }

        .welcome-section {
          margin-bottom: 40px;
        }

        .welcome-section h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .welcome-section p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .stats-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .stats-card-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stats-info {
          flex: 1;
        }

        .stats-title {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
          line-height: 1;
        }

        .stats-change {
          font-size: 13px;
          font-weight: 500;
        }

        .stats-change.positive {
          color: #10b981;
        }

        .stats-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }

        .stats-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          flex-shrink: 0;
        }

        .recent-services-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .section-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: var(--theme-color, #2A07F9);
          color: white;
        }

        .btn-primary:hover {
          background: #1e06d4;
          transform: translateY(-1px);
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .service-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px 24px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
          
        }

        .service-card:last-child {
          
        }

        .service-card:hover {
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
          font-size: 18px;
          flex-shrink: 0;
        }

        .service-info {
          flex: 1;
          min-width: 0;
        }

        .service-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 6px 0;
        }

        .service-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .service-separator {
          color: #d1d5db;
        }

        .service-schedule {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #059669;
          margin-top: 4px;
          font-weight: 500;
        }

        .service-schedule i {
          font-size: 11px;
        }

        .schedule-date, .schedule-time {
          color: #059669;
        }

        .service-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .service-price {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          flex-shrink: 0;
          min-width: 100px;
          text-align: right;
        }

        .service-action {
          flex-shrink: 0;
        }

        .view-details-btn {
          color: var(--theme-color, #2A07F9);
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .view-details-btn:hover {
          background: rgba(42, 7, 249, 0.1);
          color: #1e06d4;
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .nav-link {
            min-width: 180px;
            padding: 16px 20px;
          }

          .nav-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .nav-title {
            font-size: 1rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 24px 0;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 32px;
          }

          .stats-card {
            padding: 24px;
          }

          .stats-value {
            font-size: 2rem;
          }

          .filters-section {
            padding: 24px 16px;
            margin-bottom: 24px;
          }

          .status-filters {
            gap: 12px;
            justify-content: flex-start;
          }

          .status-filters :global(a),
          .status-filters :global(button),
          .filter-btn {
            min-width: 120px !important;
            padding: 14px 20px !important;
            font-size: 0.9rem !important;
          }

          .status-filters :global(a) i,
          .status-filters :global(button) i,
          .filter-btn i {
            font-size: 0.9rem !important;
          }

          .nav-links-container {
            gap: 12px;
            padding: 0 16px;
          }

          .nav-link {
            min-width: 160px;
            padding: 16px 20px;
          }

          .nav-content {
            text-align: left;
          }

          .nav-subtitle {
            display: none;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .service-card {
            flex-wrap: wrap;
            gap: 12px;
            padding: 20px 0;
          }

          .service-info {
            order: 1;
            flex: 1 1 100%;
          }

          .service-status {
            order: 2;
          }

          .service-price {
            order: 3;
            min-width: auto;
            text-align: left;
          }

          .service-action {
            order: 4;
            margin-left: auto;
          }

          .recent-services-section {
            padding: 24px;
          }

          .welcome-section h2 {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .stats-card-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .stats-icon {
            align-self: center;
          }

          .service-card {
            padding: 16px 0;
          }

          .section-title {
            font-size: 1.25rem;
          }

          .filters-section {
            padding: 20px 12px;
          }

          .status-filters {
            gap: 8px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .status-filters :global(a),
          .status-filters :global(button),
          .filter-btn {
            min-width: 100px !important;
            padding: 12px 16px !important;
            font-size: 0.85rem !important;
            gap: 8px !important;
          }

          .status-filters :global(a) i,
          .status-filters :global(button) i,
          .filter-btn i {
            font-size: 0.85rem !important;
          }

          .nav-link {
            min-width: 140px;
            padding: 14px 16px;
          }

          .nav-icon {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }

          .nav-title {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </>
  );
}
