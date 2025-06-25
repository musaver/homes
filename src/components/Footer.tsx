'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer-wrapper footer-layout1 style-2" style={{background: '#109FDB'}}>
      <div className="widget-area">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-md-6 col-xl-auto">
              <div className="widget footer-widget">
                <div className="th-widget-about">
                  <div className="about-logo">
                    <Link href="/">
                      <Image 
                        src="/assets/images/logo.png" 
                        alt="Quick Repairs Home" 
                        width={150} 
                        height={50}
                        style={{filter: 'brightness(0) invert(1)'}}
                      />
                    </Link>
                  </div>
                  <p className="about-text">
                    We are a trusted home services provider offering expert solutions for
                    AC cleaning, handyman work, plumbing, electrical, appliance repair, home painting, and
                    renovation.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Quick Links</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li><Link href="#!">About Us</Link></li>
                    <li><Link href="#!">Our Services</Link></li>
                    <li><Link href="#!">Faq&apos;s</Link></li>
                    <li><Link href="#!">Privacy Policy</Link></li>
                    <li><Link href="#!">Contact Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Our Services</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li><Link href="#!">AC Cleaning</Link></li>
                    <li><Link href="#!">Handyman</Link></li>
                    <li><Link href="#!">Plumber</Link></li>
                    <li><Link href="#!">Electrician</Link></li>
                    <li><Link href="#!">Appliance Repair</Link></li>
                    <li><Link href="#!">Home Renovation</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-auto">
              <div className="widget footer-widget">
                <h3 className="widget_title">Contact Us</h3>
                <div className="th-widget-contact">
                  <div className="info-box">
                    <div className="info-box_icon">
                      <i className="fas fa-location-dot"></i>
                    </div>
                    <div className="info-contnt">
                      <h4 className="footer-info-title">Address</h4>
                      <p className="info-box_text">Sobha Sapphire, Business Bay, Dubai</p>
                    </div>
                  </div>
                  <div className="info-box">
                    <div className="info-box_icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="info-contnt">
                      <h4 className="footer-info-title">Call Us</h4>
                      <p className="info-box_text">
                        <Link href="tel:+971501258142" className="info-box_link">
                          +971 50 125 8142
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div className="info-box">
                    <div className="info-box_icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="info-contnt">
                      <h4 className="footer-info-title">Email Us</h4>
                      <p className="info-box_text">
                        <Link href="mailto:info@quickrepairhomes.com" className="info-box_link">
                          info@quickrepairhomes.com
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="copyright-wrap">
        <div className="container">
          <div className="row gy-3 align-items-center">
            <div className="col-lg-6">
              <p className="copyright-text">
                Copyright <i className="fal fa-copyright"></i> 2025{' '}
                <Link href="#!" className="text-white">Quick Repair Home</Link>. All Rights Reserved.
              </p>
            </div>
            <div className="col-lg-6 text-center text-lg-end">
              <div className="th-social">
                <Link href="https://www.facebook.com/">
                  <i className="fab fa-facebook-f"></i>
                </Link>
                <Link href="https://www.twitter.com/">
                  <i className="fab fa-twitter"></i>
                </Link>
                <Link href="https://www.linkedin.com/">
                  <i className="fab fa-linkedin-in"></i>
                </Link>
                <Link href="https://www.whatsapp.com/">
                  <i className="fab fa-whatsapp"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-widget .info-box_link:hover {
          color: #000 !important;
        }
      `}</style>
    </footer>
  )
} 