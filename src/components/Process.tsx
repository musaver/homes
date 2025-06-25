'use client'

import Image from 'next/image'
import Link from 'next/link'

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
    description: 'We plan efficiently with you to minimize disruption your time matters'
  },
  {
    icon: 'fa-solid fa-truck-fast',
    title: 'Service Delivered',
    description: 'Punctual, professional, and clean — we ensure your satisfaction with guaranteed quality.'
  }
]

export default function Process() {
  return (
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
              <div className="swiper th-slider service-3-slider" id="service-3">
                <div className="swiper-wrapper">
                  {processSteps.map((step, index) => (
                    <div key={index} className="swiper-slide">
                      <div className="service-3-wrap">
                        <div className="service-3-card" style={{backgroundImage: 'url(/assets/img/bg/service-3-card-bg.png)'}}>
                          <Link href="#!" className="link-service-3">
                            <i className="fa-regular fa-arrow-right-long"></i>
                          </Link>
                          <div className="service-3-card__icon">
                            <i className={step.icon}></i>
                          </div>
                          <div className="service-3-card__content">
                            <h3 className="box-title">
                              <Link href="#!">{step.title}</Link>
                            </h3>
                            <p className="box-text">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="slider-arrow slider-next">
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
    </section>
  )
} 