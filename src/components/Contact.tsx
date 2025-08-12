'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  return (
    <div className="contact-area" style={{padding: '40px 0px 80px 0px'}}>
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="contact-form">
              <h2>Get In Touch</h2>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="form-group col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      id="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      id="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      id="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <select
                      name="service"
                      id="service"
                      className="form-select"
                      value={formData.service}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Service Type</option>
                      <option value="ac-cleaning">AC Cleaning</option>
                      <option value="handyman">Handyman Service</option>
                      <option value="plumber">Plumber Service</option>
                      <option value="electrical">Electrical Service</option>
                      <option value="appliance">Appliance Repair</option>
                      <option value="painting">Home Painting</option>
                      <option value="renovation">Home Renovation</option>
                    </select>
                  </div>
                  <div className="form-group col-12">
                    <textarea
                      name="message"
                      id="message"
                      cols={30}
                      rows={3}
                      className="form-control"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="form-btn col-12">
                    <button type="submit" className="th-btn star-btn">
                      Submit Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <Image
              src="/assets/images/new/contact-banner.jpg"
              alt="Contact"
              width={645}
              height={600}
              style={{borderRadius:'20px'}}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 