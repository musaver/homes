'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('welcome'); // 'welcome', 'email', 'otp'
  const [isLogin, setIsLogin] = useState(false); // Toggle between login and register
  
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const sendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setSending(true);
    setSuccess('');
    setError('');

    const res = await fetch('/api/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to: email,
        subject: 'Your OTP Code - Home Services',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setSuccess('OTP sent successfully to your email!');
      setStep('otp');
    } else {
      setError(data.error || 'Failed to send OTP.');
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }

    setSending(true);
    setError('');
    
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, name: email.split('@')[0], password: otp }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || 'Invalid OTP code');
    } else {
      // Auto-login after register
      const login = await signIn('credentials', {
        email,
        redirect: false,
      });

      if (login?.ok) {
        router.push('/dashboard');
      } else {
        setError('Registered but login failed.');
      }
    }
  };

  const showEmailForm = () => {
    setStep('email');
    setError('');
    setSuccess('');
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('email');
    } else if (step === 'email') {
      setStep('welcome');
    }
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep('welcome');
    setError('');
    setSuccess('');
    setEmail('');
    setOtp('');
  };

  return (
    <>
      <Header />
      
      {/* Breadcrumb Area */}
      <div className="breadcumb-wrapper background-image shape-mockup-wrap" style={{backgroundImage: 'url(/assets/img/bg/breadcrumb-bg.jpg)'}}>
          <div className="breadcrumb-bottom-shape"><Image src="/assets/img/bg/breadcrumb-bottom.png" alt="shape" width={100} height={100}/></div>
          <div className="shape-mockup breadcrumb-left jump-reverse"><Image src="/assets/img/icon/breadcrumb-left.png" alt="shape" width={100} height={100}/></div>
          <div className="shape-mockup breadcrumb-right jump"><Image src="/assets/img/icon/breadcrumb-right.png" alt="shape" width={100} height={100}/></div>
          <div className="container">
              <div className="breadcumb-content">
                  <h1 className="breadcumb-title">Join Us </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li>Register</li>
                  </ul>
              </div>
          </div>
      </div>
      {/* Breadcrumb */}

      {/* Auth Section */}
      <div className="th-checkout-wrapper space-top space-extra-bottom">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="auth-wrapper">
                
                {/* Auth Header */}
                <div className="auth-header text-center mb-5">
                  <h2 className="auth-main-title">
                    {isLogin ? 'Welcome back!' : 'Join our community'}
                  </h2>
                  <p className="auth-main-subtitle text-muted">
                    {isLogin 
                      ? 'Sign in to access your account and manage your services' 
                      : 'Create your account to get started with our home services'
                    }
                  </p>
                </div>


                {/* Auth Content */}
                <div className="auth-content">
                  
                  {/* Welcome Step */}
                  {step === 'welcome' && (
                    <div className="auth-step">
                     

                      {/* Social Auth Buttons */}
                      <div className="social-auth-section mb-2">
                        <button 
                          className="th-btn social-btn facebook-btn w-100 mb-3"
                          onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                        >
                          <i className="fab fa-facebook-f me-2"></i>
                          Continue with Facebook
                        </button>

                        <button 
                          className="th-btn social-btn google-btn w-100 mb-4"
                          onClick={() => {
                            const lastVisitedPage = localStorage.getItem('lastVisitedPage') || '/dashboard';
                            signIn('google', { callbackUrl: lastVisitedPage });
                          }}
                        >
                          <i className="fab fa-google me-2"></i>
                          Continue with Google
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="auth-divider mb-4">
                        <span className="divider-text">or</span>
                      </div>

                      {/* Email Button */}
                      <button 
                        className="th-btn style3 w-100"
                        onClick={showEmailForm}
                      >
                        <i className="fas fa-envelope me-2"></i>
                        Continue with Email
                      </button>
                    </div>
                  )}

                  {/* Email Step */}
                  {step === 'email' && (
                    <div className="auth-step">
                      <div className="step-header mb-4">
                        <button className="step-back-btn" onClick={goBack}>
                          <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="step-info text-center">
                          <h3 className="auth-step-title">Enter your email</h3>
                          <p className="auth-step-subtitle text-muted">
                            We'll send you a verification code to continue
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      {error && (
                        <div className="alert alert-danger mb-3">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="alert alert-success mb-3">
                          <i className="fas fa-check-circle me-2"></i>
                          {success}
                        </div>
                      )}

                      {/* Email Form */}
                      <form className="auth-form">
                        <div className="form-group mb-4">
                          <label className="form-label">Email Address</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fas fa-envelope"></i>
                            </span>
                            <input 
                              type="email" 
                              className="form-control" 
                              placeholder="Enter your email address"
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendOTP()}
                            />
                          </div>
                        </div>

                        <button 
                          type="button"
                          className="th-btn w-100"
                          onClick={sendOTP}
                          disabled={sending || !email}
                        >
                          {sending ? (
                            <>
                              <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>
                              Send Verification Code
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* OTP Step */}
                  {step === 'otp' && (
                    <div className="auth-step">
                      <div className="step-header mb-4">
                        <button className="step-back-btn" onClick={goBack}>
                          <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="step-info text-center">
                          <h3 className="auth-step-title">Enter verification code</h3>
                          <p className="auth-step-subtitle text-muted">
                            We sent a 6-digit code to <strong>{email}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      {error && (
                        <div className="alert alert-danger mb-3">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          {error}
                        </div>
                      )}

                      {/* OTP Form */}
                      <form className="auth-form">
                        <div className="form-group mb-4">
                          <label className="form-label">Verification Code</label>
                          <div className="otp-input-container">
                            <input 
                              type="text" 
                              className="form-control otp-input text-center" 
                              placeholder="000000"
                              value={otp} 
                              onChange={(e) => setOtp(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
                              maxLength={6}
                            />
                          </div>
                          <small className="form-text text-muted mt-2">
                            Enter the 6-digit code from your email
                          </small>
                        </div>

                        <button 
                          type="button"
                          className="th-btn w-100 mb-3"
                          onClick={verifyOTP}
                          disabled={!otp || otp.length < 6 || sending}
                        >
                          {sending ? (
                            <>
                              <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check-circle me-2"></i>
                              Verify & Continue
                            </>
                          )}
                        </button>

                        {/* Resend Link */}
                        <div className="text-center">
                          <button 
                            type="button"
                            className="btn btn-link text-decoration-none"
                            onClick={sendOTP}
                            disabled={sending}
                          >
                            {sending ? (
                              <>
                                <LoadingSpinner size="small" color="#007bff" className="me-1" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-redo me-1"></i>
                                Didn't receive the code? Resend
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>

                

              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .auth-wrapper {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e8ecef;
          position: relative;
          overflow: hidden;
        }

        .auth-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9) 0%, #4c1d95 100%);
        }

        .auth-logo {
          color: var(--theme-color, #2A07F9);
        }

        .auth-main-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .auth-main-subtitle {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 0;
        }

        .auth-toggle .btn {
          padding: 12px 24px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .auth-step-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .auth-step-subtitle {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 24px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.3s ease;
          border: 2px solid;
        }

        .facebook-btn {
          background: #1877f2;
          border-color: #1877f2;
          color: white;
        }

        .facebook-btn:hover {
          background: #166fe5;
          border-color: #166fe5;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(24, 119, 242, 0.3);
        }

        .google-btn {
          background: white;
          border-color: #dadce0;
          color: #3c4043;
        }

        .google-btn:hover {
          background: #f8f9fa;
          border-color: #c1c7cd;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .auth-divider {
          position: relative;
          text-align: center;
        }

        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          background: white;
          padding: 0 1rem;
          color: #9ca3af;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .step-back-btn {
          background: #f3f4f6;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .step-back-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .step-info {
          flex: 1;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .input-group-text {
          background: #f8f9fa;
          border-color: #e5e7eb;
          color: #6b7280;
        }

        .form-control {
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          border-color: var(--theme-color, #2A07F9);
          box-shadow: 0 0 0 3px rgba(42, 7, 249, 0.1);
        }

        .otp-input {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.5rem;
          padding: 16px 20px;
        }

        .th-btn {
          background: var(--theme-color, #2A07F9);
          border: 2px solid var(--theme-color, #2A07F9);
          color: white;
          padding: 14px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
        }

        .th-btn:hover {
          background: #1e06d4;
          border-color: #1e06d4;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(42, 7, 249, 0.3);
        }

        .th-btn:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .th-btn.style3 {
          background: white;
          color: var(--theme-color, #2A07F9);
          border-color: var(--theme-color, #2A07F9);
        }

        .th-btn.style3:hover {
          background: var(--theme-color, #2A07F9);
          color: white;
        }

        .alert {
          border-radius: 10px;
          border: none;
          padding: 12px 16px;
          font-size: 0.9rem;
        }

        .alert-danger {
          background: #fef2f2;
          color: #dc2626;
        }

        .alert-success {
          background: #f0fdf4;
          color: #16a34a;
        }

        .btn-link {
          color: var(--theme-color, #2A07F9);
          font-weight: 500;
        }

        .btn-link:hover {
          color: #1e06d4;
        }

        .help-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .help-link:hover {
          color: var(--theme-color, #2A07F9);
        }

        .text-theme {
          color: var(--theme-color, #2A07F9) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .auth-wrapper {
            padding: 2rem 1.5rem;
            margin: 1rem;
            border-radius: 15px;
          }

          .auth-main-title {
            font-size: 1.75rem;
          }

          .step-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .step-back-btn {
            align-self: flex-start;
          }

          .social-btn {
            padding: 12px 20px;
            font-size: 0.95rem;
          }

          .th-btn {
            padding: 12px 24px;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .auth-wrapper {
            padding: 1.5rem 1rem;
          }

          .auth-main-title {
            font-size: 1.5rem;
          }

          .auth-step-title {
            font-size: 1.25rem;
          }

          .otp-input {
            font-size: 1.25rem;
            letter-spacing: 0.25rem;
          }
        }
      `}</style>
    </>
  );
}
