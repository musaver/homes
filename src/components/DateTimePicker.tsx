'use client';

import { useEffect, useState } from 'react';

interface DateTimePickerProps {
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  selectedDate: string;
  selectedTime: string;
}

interface SlotAvailability {
  availableSlots: string[];
  bookedSlots: string[];
  loading: boolean;
}

export default function DateTimePicker({ onDateChange, onTimeChange, selectedDate, selectedTime }: DateTimePickerProps) {
  const [minDate, setMinDate] = useState('');
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability>({
    availableSlots: [],
    bookedSlots: [],
    loading: false
  });

  useEffect(() => {
    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch slot availability when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlotAvailability(selectedDate);
    } else {
      // Reset availability when no date is selected
      setSlotAvailability({
        availableSlots: [],
        bookedSlots: [],
        loading: false
      });
    }
  }, [selectedDate]);

  // Clear selected time if it becomes unavailable
  useEffect(() => {
    if (selectedTime && selectedDate && slotAvailability.availableSlots.length > 0) {
      if (!slotAvailability.availableSlots.includes(selectedTime)) {
        onTimeChange('');
      }
    }
  }, [selectedTime, selectedDate, slotAvailability.availableSlots, onTimeChange]);

  const fetchSlotAvailability = async (date: string) => {
    setSlotAvailability(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/booking/availability?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setSlotAvailability({
          availableSlots: data.availableSlots || [],
          bookedSlots: data.bookedSlots || [],
          loading: false
        });

        // If selected time is no longer available, clear it
        if (selectedTime && !data.availableSlots.includes(selectedTime)) {
          onTimeChange('');
        }
      } else {
        console.error('Failed to fetch slot availability');
        setSlotAvailability({
          availableSlots: [],
          bookedSlots: [],
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching slot availability:', error);
      setSlotAvailability({
        availableSlots: [],
        bookedSlots: [],
        loading: false
      });
    }
  };

  const timeSlots = [
    { value: "09:00", label: "9:00 AM" },
    { value: "09:30", label: "9:30 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "10:30", label: "10:30 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "11:30", label: "11:30 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "12:30", label: "12:30 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "13:30", label: "1:30 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "14:30", label: "2:30 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "15:30", label: "3:30 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "16:30", label: "4:30 PM" },
    { value: "17:00", label: "5:00 PM" }
  ];

  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">
          Service Date <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={minDate}
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
        <div className="position-relative">
          <select
            className="form-control"
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            required
            disabled={!selectedDate || slotAvailability.loading}
          >
          <option value="">
            {!selectedDate ? 'Select a date first' : 
             slotAvailability.loading ? 'Loading slots...' : 
             'Select time slot'}
          </option>
          {timeSlots.map((slot) => {
            const isBooked = slotAvailability.bookedSlots.includes(slot.value);
            const isAvailable = !selectedDate || slotAvailability.availableSlots.includes(slot.value);
            
            return (
              <option 
                key={slot.value} 
                value={slot.value}
                disabled={isBooked || !isAvailable}
              >
                {slot.label} {isBooked ? '(Booked)' : ''}
              </option>
            );
          })}
          </select>
          {slotAvailability.loading && (
            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="fas fa-clock me-1"></i>
            {selectedDate && !slotAvailability.loading ? (
              <>
                Available from 9:00 AM to 5:00 PM • 
                <span className="text-success"> {slotAvailability.availableSlots.length} available</span>
                {slotAvailability.bookedSlots.length > 0 && (
                  <span className="text-danger"> • {slotAvailability.bookedSlots.length} booked</span>
                )}
              </>
            ) : (
              'Available from 9:00 AM to 5:00 PM'
            )}
          </small>
          {selectedDate && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => fetchSlotAvailability(selectedDate)}
              disabled={slotAvailability.loading}
              title="Refresh slot availability"
            >
              <i className={`fas fa-sync-alt ${slotAvailability.loading ? 'fa-spin' : ''}`}></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 