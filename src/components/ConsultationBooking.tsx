'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner';

interface ConsultationBookingProps {
  productName: string;
  productId: string;
}



export default function ConsultationBooking({ productName, productId }: ConsultationBookingProps) {
  const { data: session } = useSession();
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [minDate, setMinDate] = useState('');



  // Time slot options
  const timeSlotOptions = [
    { value: 'morning', label: 'Morning (9:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 3:00 PM)' },
    { value: 'evening', label: 'Evening (3:00 PM - 6:00 PM)' },
  ];

  // Set minimum date and prefill user data
  useEffect(() => {
    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);

    // Prefill user data if logged in
    if (session?.user) {
      setFullName(session.user.name || '');
      setEmailAddress(session.user.email || '');
    }

    // Prefill service type with product name
    setServiceType(productName);
  }, [session, productName]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName.trim() || !phoneNumber.trim() || !emailAddress.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!serviceType.trim()) {
      setError('Please specify the service type');
      return;
    }

    if (!consultationDate || !consultationTime) {
      setError('Please select consultation date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/consultation/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productName,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          emailAddress: emailAddress.trim(),
          serviceType: serviceType.trim(),
          consultationDate,
          consultationTime,
          additionalNotes: additionalNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book consultation');
      }

      setSuccess('Consultation booked successfully! We will contact you shortly to confirm the details.');
      
      // Reset form
      setFullName('');
      setPhoneNumber('');
      setEmailAddress('');
      setServiceType('');
      setConsultationDate('');
      setConsultationTime('');
      setAdditionalNotes('');

      // Prefill user data and service type again
      if (session?.user) {
        setFullName(session.user.name || '');
        setEmailAddress(session.user.email || '');
      }
      setServiceType(productName);

    } catch (error: any) {
      setError(error.message || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="consultation-booking-form">
        <div className="consultation-header mb-4">
          <h3 className="consultation-title">Book a Consultation</h3>
          <p className="consultation-subtitle text-muted">
            Get expert advice for your {productName.toLowerCase()} project
          </p>
        </div>

        <div className="alert alert-success">
          <div className="d-flex align-items-center mb-3">
            <i className="fas fa-check-circle text-success me-3" style={{ fontSize: '2rem' }}></i>
            <div>
              <h5 className="mb-1">Consultation Booked!</h5>
              <p className="mb-0">{success}</p>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-outline-primary me-2"
              onClick={() => setSuccess('')}
            >
              Book Another Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-booking-form">
      <div className="consultation-header mb-4">
        <h3 className="consultation-title">Book a Consultation</h3>
        <p className="consultation-subtitle text-muted">
          Get expert advice for your {productName.toLowerCase()} project. Our specialists will help you plan and execute your renovation.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Full Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Email Address */}
          <div className="col-12 mb-3">
            <label className="form-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Service Type */}
          <div className="col-12 mb-4">
            <label className="form-label">
              Service Type <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Enter the service type"
              required
            />
            <small className="text-muted">
              This field is automatically filled with the current product name. You can modify it if needed.
            </small>
          </div>

          {/* Consultation Date */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Preferred Consultation Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              min={minDate}
              required
            />
          </div>

          {/* Consultation Time */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Preferred Time <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={consultationTime}
              onChange={(e) => setConsultationTime(e.target.value)}
              required
            >
              <option value="">Select preferred time</option>
              {timeSlotOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div className="col-12 mb-4">
            <label className="form-label">
              Additional Notes <span className="text-muted">(Optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Tell us more about your project, budget, timeline, or any specific requirements..."
            />
          </div>

          {/* Submit Button */}
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                  Booking Consultation...
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-check me-2"></i>
                  Book Free Consultation
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .consultation-booking-form {
          background: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .consultation-title {
          color: #1f2937;
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .consultation-subtitle {
          font-size: 1rem;
          line-height: 1.5;
        }



        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-control,
        .form-select {
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          border: none;
          border-radius: 8px;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
          width: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }

        .btn-primary:disabled {
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .consultation-booking-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
