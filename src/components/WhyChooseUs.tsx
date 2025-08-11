'use client'

import Image from 'next/image'

export default function WhyChooseUs() {
  return (
    <div className="about-sec-3 overflow-hidden space" id="about-sec" style={{background: '#19284A'}}>
      <div className="hero2-animated-bubble">
        <div className="bubbles"><Image src="/assets/img/shape/bubble_1.png" alt="Bubble-img" width={20} height={20} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_2.png" alt="Bubble-img" width={25} height={25} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_3.png" alt="Bubble-img" width={30} height={30} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_4.png" alt="Bubble-img" width={15} height={15} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_5.png" alt="Bubble-img" width={35} height={35} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_6.png" alt="Bubble-img" width={20} height={20} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_7.png" alt="Bubble-img" width={25} height={25} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_8.png" alt="Bubble-img" width={18} height={18} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_9.png" alt="Bubble-img" width={22} height={22} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_10.png" alt="Bubble-img" width={28} height={28} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_11.png" alt="Bubble-img" width={16} height={16} /></div>
        <div className="bubbles"><Image src="/assets/img/shape/bubble_12.png" alt="Bubble-img" width={32} height={32} /></div>
      </div>

      <div className="container">
        <div className="row gy-30 align-items-center">
          <div className="col-xl-6 col-lg-7 col-md-10">
            <div className="title-area">
              <span className="sub-title style-3 text-white">
                <span className="left text-white"></span> Why Choose Us
              </span>
              <h2 className="sec-title text-white">
                Trusted, Professional, and Hassle-Free Service
              </h2>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-8 d-none d-xl-block">
            <div className="about-3-right-content">
              <p className="text-white">
                We deliver expert home repair and maintenance solutions with a focus on quality, reliability, and customer satisfaction. From booking to project completion we make home care simple.
              </p>
            </div>
          </div>
        </div>

        <div className="row gy-30 gx-60 align-items-center">
          <div className="col-xl-6 mb-30 mb-xl-0">
            <div className="about-3-counter-wrap" style={{background: '#109FDB'}}>
              <div className="counter-card">
                <div className="about-3-count-shape">
                  <Image src="/assets/img/icon/about-3-count-1.png" alt="image" width={50} height={50} />
                </div>
                <div className="media-body">
                  <h2 className="box-number">
                    <span className="number">
                      <span className="counter-number">950</span>
                    </span>
                    <span className="plus">+</span>
                  </h2>
                  <p className="box-text text-white">Jobs Successfully</p>
                </div>
              </div>
              <div className="counter-card">
                <div className="about-3-count-shape">
                  <Image src="/assets/img/icon/about-3-count-2.png" alt="image" width={50} height={50} />
                </div>
                <div className="media-body">
                  <h2 className="box-number">
                    <span className="number">
                      <span className="counter-number">900</span>
                    </span>
                    <span className="plus" style={{color:'var(--theme-color3)'}}>+</span>
                  </h2>
                  <p className="box-text text-white">Satisfied Clients</p>
                </div>
              </div>
              <div className="counter-card">
                <div className="about-3-count-shape">
                  <Image src="/assets/img/icon/about-3-count-2.png" alt="image" width={50} height={50} />
                </div>
                <div className="media-body">
                  <h2 className="box-number">
                    <span className="number">
                      <span className="counter-number">50</span>
                    </span>
                    <span className="plus" style={{color: 'var(--theme-color3)'}}>+</span>
                  </h2>
                  <p className="box-text text-white">Skilled Professionals</p>
                </div>
              </div>
              <div className="counter-card">
                <div className="about-3-count-shape">
                  <Image src="/assets/img/icon/about-3-count-1.png" alt="image" width={50} height={50} />
                </div>
                <div className="media-body">
                  <h2 className="box-number">
                    <span className="number">
                      <span className="counter-number">10</span>
                    </span>
                    <span className="plus">+</span>
                  </h2>
                  <p className="box-text text-white">Served All Areas in Dubai</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 mb-30 mb-xl-0">
            <div className="img-box about-3">
              <Image src="/assets/images/new/633x470.jpg" alt="About-img" width={600} height={500} />
            </div>
          </div>
        </div>

        <div className="row mt-lg-4 mt-0 gy-30">
          <div className="col-xl-3 col-lg-3 col-md-6 col-12 about-bottom__box-wrap">
            <div className="about-sec-3-bottom">
              <div className="about-bottom__box">
                <div className="about-bottom__icon" style={{background:'var(--theme-color2)'}}>
                  {/* <i className="fas fa-hard-hat"></i> */}
                  <Image src={'/assets/images/iconss/40X40-1.png'} width={40} height={40}  alt='' style={{marginTop:'-0.5rem'}}/>
                </div>
                <div className="about-bottom__content">
                  <h3 className="about-bottom__box-title">Certified Expert Workers</h3>
                  <p className="about-bottom__box-text text-white">
                    Skilled technicians with years of hands-on experience
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6 col-12 about-bottom__box-wrap">
            <div className="about-sec-3-bottom">
              <div className="about-bottom__box">
                <div className="about-bottom__icon">
                  <Image src={'/assets/images/iconss/40X40-2.png'} width={40} height={40}  alt='' style={{marginTop:'-0.5rem'}}/>
                </div>
                <div className="about-bottom__content">
                  <h3 className="about-bottom__box-title">Fast and Quality Services</h3>
                  <p className="about-bottom__box-text text-white">
                    Timely, efficient, and precise work for every job.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6 col-12 about-bottom__box-wrap">
            <div className="about-sec-3-bottom">
              <div className="about-bottom__box">
                <div className="about-bottom__icon">
                  <Image src={'/assets/images/iconss/40X40-3.png'} width={40} height={40}  alt='' style={{marginTop:'-0.5rem'}}/>
                </div>
                <div className="about-bottom__content">
                  <h3 className="about-bottom__box-title">Best Prices in Town</h3>
                  <p className="about-bottom__box-text text-white">
                    Affordable rates without compromising on quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6 col-12 about-bottom__box-wrap">
            <div className="about-sec-3-bottom">
              <div className="about-bottom__box">
                <div className="about-bottom__icon" style={{background: 'var(--theme-color2)'}}>
                  <Image src={'/assets/images/iconss/40X40-4.png'} width={40} height={40}  alt='' style={{marginTop:'-0.5rem'}}/>
                </div>
                <div className="about-bottom__content">
                  <h3 className="about-bottom__box-title">We Have Won Awards</h3>
                  <p className="about-bottom__box-text text-white">
                    Recognized for excellence in home repair and maintenance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 