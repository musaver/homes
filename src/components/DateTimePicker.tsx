'use client';

import { useEffect, useState } from 'react';

interface DateTimePickerProps {
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  selectedDate: string;
  selectedTime: string;
}

export default function DateTimePicker({ onDateChange, onTimeChange, selectedDate, selectedTime }: DateTimePickerProps) {
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

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
        <select
          className="form-control"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          required
        >
          <option value="">Select time slot</option>
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
        <small className="text-muted">
          <i className="fas fa-clock me-1"></i>
          Available from 9:00 AM to 5:00 PM
        </small>
      </div>
    </div>
  );
} 