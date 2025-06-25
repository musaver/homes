'use client'

import Image from 'next/image'

const services = [
  'AC CLEANING',
  'Handyman SERVICE',
  'plumber service',
  'Electrical Service',
  'Appliance Repair',
  'Home Painting',
  'Home Renovation'
]

export default function ServiceOfferBanner() {
  return (
    <>
      <style jsx>{`
        .service-offer-wrapper.style-2 .service-offer-box .service-offer-group .text {
          padding: 30px 0px !important;
        }
      `}</style>
      
      <div className="service-offer-sec-3 overflow-hidden">
        <div className="service-offer-wrapper style-2" style={{padding: '30px 0px'}}>
          <div className="service-offer-box">
            <div className="service-offer-group">
              {/* First set of services */}
              {services.map((service, index) => (
                <div key={index} className="text">
                  <a href="#!">
                    <Image src="/assets/img/icon/cta-3.svg" alt="" width={20} height={20} />
                    {service}
                  </a>
                </div>
              ))}
              {/* Second set of services for scrolling effect */}
              {services.map((service, index) => (
                <div key={`repeat-${index}`} className="text">
                  <a href="#!">
                    <Image src="/assets/img/icon/cta-3.svg" alt="" width={20} height={20} />
                    {service}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 