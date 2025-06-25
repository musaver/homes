'use client'

import Image from 'next/image'
import { useEffect } from 'react'

const testimonials = [
  {
    name: 'Fatima A',
    review: 'Having found Quick Repair Home UAE via their Instagram account, I reached out and made a booking, during the process the pricing was laid out early and any additional costs were highlighted straight away.',
    rating: 5
  },
  {
    name: 'Sevara Sattarova',
    review: 'Impressed by how detailed and careful the team was throughout the visit. They didn\'t just spray—they asked questions and adjusted the treatment to suit my home\'s needs.',
    rating: 5
  },
  {
    name: 'Mohammed K.',
    review: 'Quick Repair Home\'s team was punctual and professional. They listened to my concerns and customized the pest control treatment. Excellent service as always with their annual plan!',
    rating: 5
  },
  {
    name: 'Sarah M.',
    review: 'Excellent service! The team arrived on time, completed the work efficiently, and left everything clean. I would definitely recommend them to friends and family.',
    rating: 5
  },
  {
    name: 'Ahmed R.',
    review: 'Professional and reliable service. The technician was knowledgeable and explained everything clearly. Great value for money and quality work.',
    rating: 5
  },
  {
    name: 'Lisa K.',
    review: 'Outstanding customer service from start to finish. The booking process was easy, and the work was completed to a high standard. Very satisfied!',
    rating: 5
  }
]

export default function Testimonials() {
  useEffect(() => {
    // Initialize Swiper manually
    const initSwiper = () => {
      if (typeof window !== 'undefined' && (window as unknown as { Swiper: any }).Swiper) {
        const swiperEl = document.getElementById('testiSlide1')
        if (swiperEl) {
          new (window as unknown as { Swiper: any }).Swiper(swiperEl, {
            slidesPerView: 3,
            spaceBetween: 24,
            loop: true,
            autoplay: {
              delay: 3000,
              disableOnInteraction: false,
            },
            //navigation: {
            //  nextEl: '.swiper-button-next',
            //  prevEl: '.swiper-button-prev',
            //},
            breakpoints: {
              0: {
                slidesPerView: 1,
              },
              576: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              992: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 3,
              }
            }
          })
        }
      }
    }

    // Check if Swiper is already loaded
    if (typeof window !== 'undefined' && (window as unknown as { Swiper: any }).Swiper) {
      initSwiper()
    } else {
      // Wait for Swiper to load
      const checkSwiper = setInterval(() => {
        if (typeof window !== 'undefined' && (window as unknown as { Swiper: any }).Swiper) {
          clearInterval(checkSwiper)
          initSwiper()
        }
      }, 100)

      return () => clearInterval(checkSwiper)
    }
  }, [])

  return (
    <section className="testi-card-area-2 overflow-hidden space" id="testi-sec" style={{padding: '30px 0px'}}>
      <div className="shape-mockup testimonials-bg-3" data-right="0">
        <Image src="/assets/img/shape/testimonials-bg-3.png" alt="Image" width={200} height={400} />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-12">
            <div className="title-area">
              <span className="sub-title style-3">
                <span className="left"></span> Testimonials
              </span>
              <h2 className="sec-title">What our client say</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xxl-12">
            <div className="testi-card-slide">
              <div 
                className="swiper has-shadow th-slider" 
                id="testiSlide1"
              >
                <div className="swiper-wrapper">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="swiper-slide">
                      <div className="testi-block style-3" dir="ltr">
                        <div className="testi-block-top">
                          <div className="content">
                            <h3 className="box-title">{testimonial.name}</h3>
                          </div>
                        </div>
                        <div className="box-review">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <i key={i} className="fa-sharp fa-solid fa-star"></i>
                          ))}
                        </div>
                        <p className="box-text">{testimonial.review}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Navigation arrows 
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>*/}
                
                {/* Pagination dots */}
                <div className="swiper-pagination"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 