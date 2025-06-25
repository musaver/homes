'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function ProjectDetails() {
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
                  <h1 className="breadcumb-title">Project Details </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li><Link href="/projects">Projects</Link></li>
                      <li>Project Details</li>
                  </ul>
              </div>
          </div>
      </div>


      <section className="space space-extra2-bottom">
        <div className="container">
            <div className="row gx-40">
                <div className="col-xxl-4 col-lg-4">
                    <aside className="sidebar-area">
                        <div className="widget widget_info">
                            <h3 className="widget_title">Project Info</h3>
                            <div className="info-box">
                                <div className="info-box_icon"><i className="fas fa-user"></i></div>
                                <div><span className="info-box_subtitle">Clients:</span>
                                    <h5 className="info-box_text">Michel Miller</h5></div>
                            </div>
                            <div className="info-box">
                                <div className="info-box_icon"><i className="fa-regular fa-folder-open"></i></div>
                                <div><span className="info-box_subtitle">Category:</span>
                                    <h5 className="info-box_text">Commercial Cleaning</h5></div>
                            </div>
                            <div className="info-box">
                                <div className="info-box_icon"><i className="fa-solid fa-calendar-days"></i></div>
                                <div><span className="info-box_subtitle">Date:</span>
                                    <h5 className="info-box_text">21 Jun, 2024</h5></div>
                            </div>
                            <div className="info-box">
                                <div className="info-box_icon"><i className="fa-solid fa-location-dot"></i></div>
                                <div><span className="info-box_subtitle">Address:</span>
                                    <h5 className="info-box_text">42 Hangston, USA</h5></div>
                            </div>
                        </div>
                        <div className="widget widget_call">
                            <div className="widget-call">
                                <h4 className="box-title text-white">Need Any Help?</h4>
                                <p className="text-white box_text">Need Any Help, Call Us 24/7 For Support</p>
                                <div className="widget_call">
                                    <div className="info-box">
                                        <div className="info-box_icon"><i className="fas fa-phone"></i></div>
                                        <div><span className="info-box_subtitle">Call Us</span>
                                            <p className="info-box_text"><a href="tel:+2869852156" className="info-box_link">+286 985 2156</a></p>
                                        </div>
                                    </div>
                                    <div className="info-box">
                                        <div className="info-box_icon"><i className="fas fa-envelope"></i></div>
                                        <div><span className="info-box_subtitle">Mail Us</span>
                                            <p className="info-box_text"><a href="mailto:info@example.com" className="info-box_link">info@example.com</a></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
                <div className="col-xxl-8 col-lg-8">
                    <div className="page-single">
                        <div className="page-img"><Image src="/assets/img/project/project_details.jpg" alt="Project Image" width={100} height={100}/></div>
                        <div className="page-content">
                            <h2 className="sec-title page-title">Hospital Out Field Cleaning</h2>
                            <p className="">Hospital outpatient field cleaning services are specialized cleaning services designed to maintain a high standard of cleanliness and hygiene in outpatient clinics, medical offices, and other healthcare facilities. These services are crucial for preventing infection, ensuring patient safety, and providing a comfortable environment for patients and staff. Strict adherence to infection control protocols to prevent cross-contamination and the spread of infectious diseases. Cleaning and disinfecting examination tables, medical equipment, countertops, and sinks.</p>
                            <p className="mb-50">Use of hospital-grade disinfectant to clean high-touch surface, medical equipment, &amp; patient areas. Compliance with guidelines set by health authorities such as the CDC (Centers for Disease Control and Prevention) and OSHA (Occupational Safety and Health Administration).</p>
                            <h2 className="sec-title page-title">The Problem</h2>
                            <p className="mb-50">These service are crucial for preventing infection, ensuring patient safety, &amp; providing a comfortable environment for patients and staff. Strict adherence to infection control protocol to prevent cross-contamination and the spread of infectious diseases. Cleaning and disinfecting examination tables.</p>
                            <h2 className="sec-title page-title">Problem Solution</h2>
                            <p className="mb-30">Helps healthcare facilities comply with health regulations &amp; standard, avoiding penalties &amp; ensuring accreditation. A clean and well-maintained facility enhances the reputation of the healthcare provider &amp; increases patient trust and satisfaction. Regular tasks such as disinfecting high-touch surfaces, emptying trash.</p>
                            <div className="row mt-30 gx-40">
                                <div className="col-md-12">
                                    <div className="th-blog blog-single has-post-thumbnail mb-4">
                                        <div className="blog-img" data-overlay="title" data-opacity="4">
                                            <Link href="blog-details.html"><Image src="/assets/img/project/project_details-1.jpg" alt="Project Image" width={100} height={100}/></Link><Link href="https://www.youtube.com/watch?v=_sI_Ps7JSEk" className="play-btn popup-video"><i className="fas fa-play"></i></Link></div>
                                    </div>
                                </div>
                            </div>
                            <p className="mb-0">Strict adherence to infection control protocol to prevent cross-contamination &amp; the spread of infection diseases. Cleaning and disinfecting examination tables, medical equipment, countertops, &amp; sinks. Use of hospital-grade disinfectant to clean high-touch surface, medical equipment, &amp; patient areas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
      
      <Footer />

    </>
  );
} 