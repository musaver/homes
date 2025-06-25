'use client'

import Image from 'next/image'
import { useEffect } from 'react'

const services = [
  {
    id: '01',
    icon: 'fa-solid fa-faucet',
    title: 'Plumbing Services 2',
    description: 'From leaky taps to blocked drains, our certified plumbers ensure quick, clean, and reliable solutions. We also handle toilet repairs, water heater installations, and pump fixes.'
  },
  {
    id: '02',
    icon: 'fa-solid fa-wind',
    title: 'AC Cleaning',
    description: 'Keep your indoor air fresh and your AC system running efficiently. We offer basic filter cleaning, duct and coil deep cleaning, and full system servicing — including professional AC repairs.'
  },
  {
    id: '03',
    icon: 'fa-solid fa-bolt',
    title: 'Electrical Services',
    description: 'Keep your home powered and safe. We install lighting fixtures, repair sockets and switches, fix wiring, and more — all handled by licensed electricians.'
  },
  {
    id: '04',
    icon: 'fa-solid fa-microchip',
    title: 'Appliance Repair',
    description: 'Don&apos;t toss your broken appliances — we fix them! Our technicians repair washing machines, fridges, ovens, dishwashers, and dryers with expert precision.'
  },
  {
    id: '05',
    icon: 'fa-solid fa-paint-roller',
    title: 'Home Painting',
    description: 'Revive your home&apos;s look with professional painting. Whether it&apos;s a single apartment wall or a full villa repaint, our team delivers smooth finishes and clean edges.'
  },
  {
    id: '06',
    icon: 'fa-solid fa-house',
    title: 'Home Renovation',
    description: 'Upgrade your space with confidence. We handle bathroom and kitchen remodeling, flooring, tiling, outdoor renovations, and even CCTV installation — turning your vision into reality.'
  },
  {
    id: '07',
    icon: 'fa-solid fa-screwdriver-wrench',
    title: 'Handyman Service',
    description: 'Need a hand around the house? Our handyman services cover everything from mounting and drilling to curtain, light, and furniture installations. Pay hourly or per task.'
  }
]

export default function DetailedServices() {
  useEffect(() => {
    // Initialize styling and swiper when component mounts
    const initializeComponent = () => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Initialize background images and other styling
        const script = document.createElement('script');
        script.innerHTML = `
          if (window.jQuery) {
            var $ = window.jQuery;
            
            // Initialize background images
            if ($("[data-bg-src]").length > 0) {
              $("[data-bg-src]").each(function () {
                var src = $(this).attr("data-bg-src");
                $(this).css("background-image", "url(" + src + ")");
                $(this).removeAttr("data-bg-src").addClass("background-image");
              });
            }
            
            // Initialize animations
            $("[data-ani]").each(function () {
              var animationName = $(this).data("ani");
              $(this).addClass(animationName);
            });
            
            $("[data-ani-delay]").each(function () {
              var delayTime = $(this).data("ani-delay");
              $(this).css("animation-delay", delayTime);
            });
          }
        `;
        document.head.appendChild(script);
        document.head.removeChild(script);

        // Initialize swiper after styling is applied
        setTimeout(() => {
          const slider = document.getElementById('service-slider1');
          if (slider) {
            // Remove th-slider class temporarily
            slider.classList.remove('th-slider');
            
            // Re-add it after a brief delay to trigger initialization
            setTimeout(() => {
              slider.classList.add('th-slider');
              
              // Initialize swiper
              const swiperScript = document.createElement('script');
              swiperScript.innerHTML = `
                if (window.jQuery && window.Swiper) {
                  $('#service-slider1.th-slider').each(function () {
                    var thSlider = $(this);
                    if (this.swiper) {
                      this.swiper.destroy(true, true);
                    }
                    var settings = thSlider.data('slider-options');
                    var prevArrow = thSlider.siblings('.slider-area').find('.slider-prev');
                    var nextArrow = thSlider.siblings('.slider-area').find('.slider-next');
                    if (prevArrow.length === 0) prevArrow = thSlider.parent().find('.slider-prev');
                    if (nextArrow.length === 0) nextArrow = thSlider.parent().find('.slider-next');
                    var sliderDefault = {
                      slidesPerView: 1,
                      spaceBetween: 24,
                      loop: false,
                      speed: 1000,
                      navigation: {
                        nextEl: nextArrow.get(0),
                        prevEl: prevArrow.get(0),
                      }
                    };
                    var options = Object.assign({}, sliderDefault, settings);
                    new Swiper(thSlider.get(0), options);
                  });
                }
              `;
              document.head.appendChild(swiperScript);
              document.head.removeChild(swiperScript);
            }, 100);
          }
        }, 50);
      }
    };

    // Initialize after a delay to ensure DOM is ready
    const timer = setTimeout(initializeComponent, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="space" style={{padding: '30px 0px'}}>
      <div className="shape-mockup moving th-service-1__shape-1">
        <Image src="/assets/img/shape/services-shape-1-1.svg" alt="shape" width={50} height={50} />
      </div>
      <div className="shape-mockup jump th-service-1__shape-2">
        <Image src="/assets/img/shape/services-shape-1-2.svg" alt="shape" width={50} height={50} />
      </div>
      <div className="shape-mockup jump-reverse th-service-1__shape-3">
        <Image src="/assets/img/shape/services-shape-1-3.svg" alt="shape" width={50} height={50} />
      </div>
      <div className="shape-mockup jump th-service-1__shape-4">
        <Image src="/assets/img/shape/services-shape-1-4.svg" alt="shape" width={50} height={50} />
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-7 col-lg-7 col-md-8">
            <div className="title-area text-center">
              <span className="sub-title justify-content-center">Our Services</span>
              <h2 className="sec-title">
                The Services We Provide For
                <span className="text-theme"> Our Customer</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="row gy-30 justify-content-center">
          <div className="slider-area">
            <div 
              className="swiper th-slider" 
              id="service-slider1"
              data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}'
            >
              <div className="swiper-wrapper">
                {services.map((service, index) => (
                  <div key={index} className="swiper-slide">
                    <div className="process-box-2-wrap" data-bg-src="/assets/img/icon/how-it-work-2-shape.png">
                      <h3 className="box-count-title">{service.id}</h3>
                      <div className="process-box-2">
                        <div className="box-icon">
                          <i className={service.icon}></i>
                        </div>
                        <div className="content">
                          <h3 className="box-title">{service.title}</h3>
                          <p className="box-text">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button data-slider-prev="#service-slider1" className="slider-arrow slider-prev">
              <i className="far fa-arrow-left"></i>
            </button>
            <button data-slider-next="#service-slider1" className="slider-arrow slider-next">
              <i className="far fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .process-box-2 .content p {
          height: 200px;
        }
        .box-icon i {
          color: var(--theme-color3);
          font-size: 30px;
        }
      `}</style>
    </section>
  )
} 