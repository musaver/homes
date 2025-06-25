import Image from 'next/image'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="space-top cta-4-area" style={{padding: '30px 0px', position: 'relative'}}>
        
      <div 
        className="space overflow-hidden cta-4-area-inner" 
        style={{
          padding: '70px 0px',
          backgroundImage: 'url(/assets/img/bg/cta-v4-bg.jpg)',
          position: 'relative'
        }}
      >
        <div 
        className="cta-4-area-inner-layer" 
        style={{
            backgroundColor: '#1f1f1f',
            opacity: 0.9,
        }}
      ></div>
        <div className="shape-mockup cta-4-shape-lef">
          <Image 
            src="/assets/img/shape/cta-4-shape-left.svg" 
            alt="" 
            width={100} 
            height={100}
            style={{filter: 'brightness(0) invert(1)'}}
          />
        </div>
        <div className="shape-mockup cta-4-shape-right">
          <Image 
            src="/assets/img/shape/cta-4-shape-right.svg" 
            alt="" 
            width={100} 
            height={100}
            style={{filter: 'brightness(0) invert(1)'}}
          />
        </div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-9 col-lg-10">
              <div className="cta-box4">
                <div className="title-area text-center">
                  <h2 className="box-title text-white">Trusted Home Cleaning Solutions</h2>
                  <p className="box-text text-white">
                    At Quick Repair Home, we offer professional residential cleaning services designed to keep your home spotless, hygienic, and beautifully maintained. Take advantage of our exclusive limited-time discounts and let our expert team bring freshness and comfort back to your living space.
                  </p>
                </div>
                <div className="button-wrap d-flex gap-4 justify-content-center flex-wrap">
                  <Link href="#!" className="th-btn star-btn btn-bg-theme-3">Work With Us</Link>
                  <Link href="#!" className="th-btn star-btn btn-bg-theme-2">Contact Us</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 