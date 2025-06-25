'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';
export default function ContactPage() {
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
                  <h1 className="breadcumb-title">Contact </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li>Contact</li>
                  </ul>
              </div>
          </div>
      </div>


      <div className="contact-area-2 space-top" id="contact-sec">
        <div className="container">
            <div className="title-area text-center">
                <h2 className="sec-title">Our Contact Information</h2></div>
            <div className="row gy-4 justify-content-center">
                <div className="col-xl-4 col-lg-6 contact-feature-wrap">
                    <div className="contact-feature">
                        <Image className="feature-contact-icon" src="/assets/img/icon/feature-contact-icon.png" alt="icon" width={70} height={70}/>
                        <div className="contact-feature-icon"><i className="fas fa-location-dot"></i></div>
                        <div className="media-body">
                            <p className="contact-feature_label">Our Address</p><a href="https://www.google.com/maps" className="contact-feature_link">Sobha Sapphire, Business Bay, Dubai</a></div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-6 contact-feature-wrap">
                    <div className="contact-feature">
                        <Image className="feature-contact-icon" src="/assets/img/icon/feature-contact-icon.png" alt="icon" width={70} height={70}/>
                        <div className="contact-feature-icon"><i className="fas fa-phone"></i></div>
                        <div className="media-body">
                            <p className="contact-feature_label">Contact Number</p><a href="tel:971501258142" className="contact-feature_link">Mobile: +971 50 125 8142</a> <a href="mailto:info@quickrepairhomes.com" className="contact-feature_link">Email: info@quickrepairhomes.com</a></div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-6 contact-feature-wrap">
                    <div className="contact-feature">
                        <Image className="feature-contact-icon" src="/assets/img/icon/feature-contact-icon.png" alt="icon" width={70} height={70}/>
                        <div className="contact-feature-icon"><i className="fas fa-clock"></i></div>
                        <div className="media-body">
                            <p className="contact-feature_label">Opening Hour</p>
                            <span className="contact-feature_link">Monday - Saturday: 9:00 - 18:00</span>
                            <span className="contact-feature_link">Sunday: Closed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Contact />
      
    <Footer />

    </>
  );
} 