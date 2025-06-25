'use client'

import Image from 'next/image'
import { useEffect } from 'react'

// Type declarations for global variables
declare global {
  interface Window {
    jQuery: any;
    Swiper: any;
  }
}

const processSteps = [
  {
    icon: 'fa-solid fa-calendar-check',
    title: 'Book Online',
    description: 'Book your service online at your convenience fast response, flexible slots.'
  },
  {
    icon: 'fa-solid fa-file-invoice-dollar',
    title: 'Get a Detailed Estimate',
    description: 'Honest assessment, upfront quote, and no hidden charges just clear, fair pricing.'
  },
  {
    icon: 'fa-solid fa-project-diagram',
    title: 'Work Planning',
    description: 'We plan efficiently with you to minimize disruption your   time matters'
  },
  {
    icon: 'fa-solid fa-truck-fast',
    title: 'Service Delivered',
    description: 'Punctual, professional, and clean — we ensure your satisfaction with guaranteed quality.'
  }
]

export default function Services() {
  useEffect(() => {
    // Simple approach: trigger re-initialization by temporarily removing and re-adding the th-slider class
    const reinitializeSliders = () => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const slider = document.getElementById('service-3');
        if (slider) {
          // Remove th-slider class temporarily
          slider.classList.remove('th-slider');
          
          // Re-add it after a brief delay to trigger initialization
          setTimeout(() => {
            slider.classList.add('th-slider');
            
            // Trigger the main.js initialization if jQuery is available
            const script = document.createElement('script');
            script.innerHTML = `
              if (window.jQuery && window.Swiper) {
                $('#service-3.th-slider').each(function () {
                  var thSlider = $(this);
                  if (this.swiper) {
                    this.swiper.destroy(true, true);
                  }
                  var settings = thSlider.data('slider-options');
                  var nextArrow = thSlider.find('.slider-next');
                  var sliderDefault = {
                    slidesPerView: 1,
                    spaceBetween: 24,
                    loop: false,
                    speed: 1000,
                    navigation: {
                      nextEl: nextArrow.get(0),
                    }
                  };
                  var options = Object.assign({}, sliderDefault, settings);
                  new Swiper(thSlider.get(0), options);
                });
              }
            `;
            document.head.appendChild(script);
            document.head.removeChild(script);
          }, 100);
        }
      }
    };

    // Initialize after a delay to ensure DOM is ready
    const timer = setTimeout(reinitializeSliders, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .service-3-card:hover {
          cursor: pointer;
        }
        
        .sub-title.style-3 .right,
        .sub-title.style-3 .right::after {
          background-color: #FFF;
        }
        
        .service-3-card__icon i {
          font-size: 40px;
          color: var(--theme-color3);
        }
      `}</style>
      
      <section className="service-sec-3 overflow-hidden space" id="service-sec" style={{padding: '30px 0px'}}>
        <div className="container">
          <div className="row gy-30 align-items-center justify-content-between">
            <div className="col-xxl-6 col-xl-6 col-lg-12 col-md-10">
              <div className="title-area text-center text-xl-start">
                <span className="sub-title style-3">
                  <span className="left"></span> Our Services
                </span>
                <h2 className="sec-title">The Services We Provide For Our Customer</h2>
              </div>
            </div>
            <div className="col-xxl-5 col-xl-6 col-lg-6 col-md-8 d-none d-xl-block">
              <div className="service-3-right-content">
                <p>
                  These services are designed to maintain cleanliness, hygiene, and overall appearance of homes,
                  offering convenience to homeowners and ensuring a healthy living environment. Routine cleaning
                  tasks performed weekly or bi-weekly.
                </p>
              </div>
            </div>
          </div>
          <div className="row gy-30 align-items-center">
            <div className="col-xl-5 mb-xl-0">
              <div className="service-3-wrap">
                <div 
                  className="swiper th-slider service-3-slider" 
                  id="service-3"
                  data-slider-options='{"breakpoints":{"0":{"slidesPerView":3,"mousewheel":false},"576":{"slidesPerView":"3","mousewheel":false},"768":{"slidesPerView":"3","mousewheel":false},"992":{"slidesPerView":"3","mousewheel":false},"1200":{"slidesPerView":"3"}},"direction":"vertical","mousewheel":true}'
                >
                  <div className="swiper-wrapper">
                    {processSteps.map((step, index) => (
                      <div key={index} className="swiper-slide">
                        <div className="service-3-wrap">
                          <div className="service-3-card" data-bg-src="/assets/img/bg/service-3-card-bg.png">
                            <a href="#!" className="link-service-3">
                              <i className="fa-regular fa-arrow-right-long"></i>
                            </a>
                            <div className="service-3-card__icon">
                              <i className={step.icon}></i>
                            </div>
                            <div className="service-3-card__content">
                              <h3 className="box-title">
                                <a href="#!">{step.title}</a>
                              </h3>
                              <p className="box-text">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button data-slider-next="#service-3" className="slider-arrow slider-next">
                    <i className="fa-solid fa-angle-down"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-xl-7 gx-60 mb-xl-0">
              <div className="img-box about-3">
                <Image src="/assets/images/710x495.jpg" alt="service-img" width={710} height={495} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
} 