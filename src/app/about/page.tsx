'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutPage from '@/components/About';
import Testimonials from '@/components/Testimonials';
export default function About() {
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
                  <h1 className="breadcumb-title">About </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li>About</li>
                  </ul>
              </div>
          </div>
      </div>

      <AboutPage />
     
      <div className="counter-sec1 space-bottom">
        <div className="container">
            <div className="counter-card-wrap space">
                <div className="counter-card">
                    <div className="media-body">
                        <h2 className="box-number"><span className="counter-number">16</span>+</h2>
                        <p className="box-text">Satisfied Our Customers</p>
                    </div>
                </div>
                <div className="right-shape"><Image src="/assets/img/icon/counter-shape-1-1.png" alt="Shape" width={70} height={70}/></div>
                <div className="counter-card">
                    <div className="media-body">
                        <h2 className="box-number"><span className="counter-number">180</span>+</h2>
                        <p className="box-text">Cleaning Expert Members</p>
                    </div>
                </div>
                <div className="right-shape"><Image src="/assets/img/icon/counter-shape-1-1.png" alt="Shape" width={70} height={70}/></div>
                <div className="counter-card">
                    <div className="media-body">
                        <h2 className="box-number"><span className="counter-number">120</span>+</h2>
                        <p className="box-text">Company Award Winner</p>
                    </div>
                </div>
                <div className="right-shape"><Image src="/assets/img/icon/counter-shape-1-1.png" alt="Shape" width={70} height={70}/></div>
            </div>
        </div>
    </div>

    <section className="space background-image shape-mockup-wrap" id="process-sec" style={{backgroundImage: 'url(/assets/img/bg/team-bg-1.jpg)'}}>
        <div className="shape-mockup jump process-3-shape-1"><Image src="/assets/img/shape/team-sahpe-1-1.svg" alt="shape" width={100} height={100}/></div>
        <div className="shape-mockup jump d-lg-block d-none" style={{top: '100px', right: '180px'}}><Image src="/assets/img/shape/servicce-2-shape-theme2.svg" alt="shape" width={100} height={100}/></div>
        <div className="shape-mockup jump-reverse d-xl-block d-none" style={{bottom: '100px', left: '50px'}}><Image src="/assets/img/shape/servicce-2-shape-theme2.svg" alt="shape" width={100} height={100}/></div>
        <div className="shape-mockup jump-reverse process-3-shape-4"><Image src="/assets/img/shape/team-sahpe-1-1.svg" alt="shape" width={100} height={100}/></div>
        <div className="container">
            <div className="row">
                <div className="col-lg-12 text-center text-xl-start">
                    <div className="title-area"><span className="sub-title before-none style-theme2 lg-after-none justify-content-center justify-content-xl-start">Work Process</span>
                        <h2 className="sec-title text-white">How We Are Working!</h2></div>
                </div>
            </div>
            <div className="row gy-4 justify-content-center">
                <div className="col-xl-3 col-md-6 process-box-wrap">
                    <div className="process-box style-3">
                        <div className="box-icon"><i className="fa-solid fa-address-card"></i></div>
                        <h3 className="box-title text-white">Application</h3>
                        <p className="box-text text-white">These services range from regular housekeeping tasks to deep cleaning, sanitation, &amp; cleaning services.</p>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 process-box-wrap">
                    <div className="process-box style-3">
                        <div className="box-icon"><i className="fa-regular fa-calendar-clock"></i></div>
                        <h3 className="box-title text-white">The Date</h3>
                        <p className="box-text text-white">These services range from regular housekeeping tasks to deep cleaning, sanitation, &amp; cleaning services.</p>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 process-box-wrap">
                    <div className="process-box style-3">
                        <div className="box-icon"><i className="fa-sharp fa-solid fa-handshake"></i></div>
                        <h3 className="box-title text-white">Hire Us</h3>
                        <p className="box-text text-white">These services range from regular housekeeping tasks to deep cleaning, sanitation, &amp; cleaning services.</p>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 process-box-wrap">
                    <div className="process-box style-3">
                        <div className="box-icon"><i className="fa-solid fa-broom"></i></div>
                        <h3 className="box-title text-white">Cleaning</h3>
                        <p className="box-text text-white">These services range from regular housekeeping tasks to deep cleaning, sanitation, &amp; cleaning services.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

{/* Why Choose Us */}
    <div className="overflow-hidden space background-image shape-mockup-wrap" id="why-sec" style={{backgroundImage: 'url(/assets/img/bg/why-3-bg.jpg)'}}>
        <div className="shape-mockup zoom1 why-2-left-shape-1"><Image src="/assets/img/shape/team-sahpe-1-1.svg" alt="shape" width={100} height={100}/></div>
        <div className="shape-mockup zoom1 why-2-left-shape-2"><Image src="/assets/img/shape/team-sahpe-1-1.svg" alt="shape" width={100} height={100}/></div>
        <div className="container">
            <div className="row gy-50 align-items-center">
                <div className="col-xl-6">
                    <div className="why-2-left shape-mockup-wrap">
                        <div className="shape-mockup moving why-2-left-shape-1"><Image src="/assets/img/shape/services-shape-1-1.svg" alt="shape" width={100} height={100}/></div>
                        <div className="shape-mockup jump why-2-left-shape-2"><Image src="/assets/img/shape/why-2-shape.svg" alt="shape" width={100} height={100}/></div>
                        <div className="smoke-bg"></div>
                        <div className="theme-bg"></div>
                        <div className="theme2-bg"></div>
                        <div className="img2"><Image src="/assets/img/why/why-choose-2-left.png" alt="Image" width={500} height={500}/></div>
                    </div>
                </div>
                <div className="col-xl-6">
                    <div className="why-2-right">
                        <div className="title-area"><span className="sub-title after-none">Why choose us</span>
                            <h2 className="sec-title">Making Homes Spotless One Sweep at a Time</h2>
                            <p className="sec-text">House cleaning services are professional services designed to clean and maintain residential spaces. They provide convenience and ensure a hygienic living environment for homeowners, often offering various packages tailored to different needs and preferences.</p>
                        </div>
                    </div>
                    <div className="why-2-right-bottom-wrapper shape-mockup-wrap">
                        <div className="shape-mockup why-2-right-bg-triangle bg-mask" style={{maskImage: 'url("assets/img/bg/why-2-right-bg-triangle.png")'}}></div>
                        <div className="why-2-right-bottom">
                            <div className="why-2-right-bottom__box">
                                <div className="why-2-right-bottom__box-icon"><Image src="/assets/img/icon/why-2-right-1.svg" alt="icon" width={60} height={60}/></div>
                                <div className="why-2-right-bottom__box-content">
                                    <h3 className="box-title">Organization Services</h3></div>
                            </div>
                            <div className="why-2-right-bottom__box">
                                <div className="why-2-right-bottom__box-icon"><Image src="/assets/img/icon/why-2-right-2.svg" alt="icon" width={60} height={60}/></div>
                                <div className="why-2-right-bottom__box-content">
                                    <h3 className="box-title">Professional Team</h3></div>
                            </div>
                            <div className="why-2-right-bottom__box">
                                <div className="why-2-right-bottom__box-icon"><Image src="/assets/img/icon/why-2-right-3.svg" alt="icon" width={60} height={60}/></div>
                                <div className="why-2-right-bottom__box-content">
                                    <h3 className="box-title">Clean Project Discount</h3></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Testimonials />

    <div className="space-bottom overflow-hidden">
        <div className="container">
            <div className="row">
                <div className="brand-bg-wrap style-2">
                    <div className="row">
                        <div className="col-12">
                            <div className="brand-1-top">
                                <h3 className="box-title">Trusted by over <span className="number text-theme"><span className="counter-number">90</span>k</span><span className="plus text-theme">+</span> companies worldwide</h3></div>
                        </div>
                        <div className="col-12">
                            <div className="swiper th-slider swiper-initialized swiper-horizontal" id="blogSlider2" data-slider-options="{&quot;breakpoints&quot;:{&quot;0&quot;:{&quot;slidesPerView&quot;:2},&quot;576&quot;:{&quot;slidesPerView&quot;:&quot;2&quot;},&quot;768&quot;:{&quot;slidesPerView&quot;:&quot;3&quot;},&quot;992&quot;:{&quot;slidesPerView&quot;:&quot;4&quot;},&quot;1200&quot;:{&quot;slidesPerView&quot;:&quot;5&quot;},&quot;1400&quot;:{&quot;slidesPerView&quot;:&quot;6&quot;}}}">
                                <div className="swiper-wrapper" id="swiper-wrapper" aria-live="off" style={{transitionDuration: '0ms', transform: 'translate3d(-669px, 0px, 0px)', transitionDelay: '0ms'}}>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="7 / 14" data-swiper-slide-index="6">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_7.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="8 / 14" data-swiper-slide-index="7">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_1.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide swiper-slide-prev" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="9 / 14" data-swiper-slide-index="8">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_2.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide swiper-slide-active" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="10 / 14" data-swiper-slide-index="9">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_3.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide swiper-slide-next" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="11 / 14" data-swiper-slide-index="10">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_4.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="12 / 14" data-swiper-slide-index="11">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_5.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="13 / 14" data-swiper-slide-index="12">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_6.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" role="group" aria-label="14 / 14" data-swiper-slide-index="13" style={{width: '199px', marginRight: '24px'}}>
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_7.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="1 / 14" data-swiper-slide-index="0">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_1.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="2 / 14" data-swiper-slide-index="1">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_2.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="3 / 14" data-swiper-slide-index="2">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_3.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="4 / 14" data-swiper-slide-index="3">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_4.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="5 / 14" data-swiper-slide-index="4">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_5.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                    <div className="swiper-slide" style={{width: '199px', marginRight: '24px'}} role="group" aria-label="6 / 14" data-swiper-slide-index="5">
                                        <div className="brand-box"><Image src="/assets/img/brand/brand_1_6.svg" alt="Brand Logo" width={100} height={100}/></div>
                                    </div>
                                </div><span className="swiper-notification" aria-live="assertive" aria-atomic="true"></span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
      
    <Footer />

    </>
  );
} 