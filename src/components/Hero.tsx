'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="th-hero-wrapper hero-3" id="hero" style={{backgroundImage: 'url(/assets/images/hero_bg_3_1.jpg)'}}>
      <div className="hero-inner">
        <div className="shape-mockup hero_3-right_shape" style={{maskImage: 'url(/assets/images/hero_3-right_shape.png)'}}></div>
        <div className="shape-mockup hero_3-right_shape2" style={{maskImage: 'url(/assets/images/hero_3-right_shape2.png)'}}></div>
        <div className="shape-mockup hero_3-main-img">
          <Image src="/assets/images/560-x-745-2.png" alt="img" width={560} height={745} />
        </div>

        <div className="shape-mockup moving home-3-shape-1">
          <Image src="/assets/img/shape/services-shape-1-1.svg" alt="shape" width={50} height={50} />
        </div>
        <div className="shape-mockup jump home-3-shape-2">
          <Image src="/assets/img/shape/services-shape-1-1.svg" alt="shape" width={50} height={50} />
        </div>
        <div className="shape-mockup jump-reverse home-3-shape-3">
          <Image src="/assets/img/shape/services-shape-1-1.svg" alt="shape" width={50} height={50} />
        </div>
        <div className="shape-mockup moving home-3-shape-4">
          <Image 
            src="/assets/images/home-3-shape-3.svg" 
            alt="shape" 
            width={50} 
            height={50}
            style={{filter: 'hue-rotate(180deg)'}}
          />
        </div>

        <div className="hero-style3">
          <h1 className="hero-title">
            Your Trusted Partner for <span>Home Repairs &amp; Maintenance</span>
          </h1>
          <p className="hero-text">
            Get expert help for AC servicing, plumbing, painting, appliance repair, electrical work, and more — all at your doorstep.
          </p>
          <div className="btn-group justify-content-center">
            <Link href="#!" className="th-btn star-btn btn-bg-theme-3">
              Discover More
            </Link>
            <Link 
              className="video-wrap popup-video" 
              href="https://video-previews.elements.envatousercontent.com/h264-video-previews/bbd65fa1-024d-4620-8322-61aef3a743cd/58227272.mp4"
            >
              <div className="play-btn style-3">
                <i className="fas fa-play"></i>
              </div>
              <p>Watch Video</p>
            </Link>
          </div>

          <div className="hero-bottom">
            <div className="thumb-wrap">
              <Image src="/assets/images/hero-3-client-1.png" alt="img" width={100} height={100} />
            </div>
            <div className="content">
              <h5>Average Rating</h5>
              <p className="box-title">
                <span className="number text-theme">
                  <span className="counter-number">50</span>k
                </span>
                <span className="plus text-theme">+</span> new review
              </p>
            </div>
            <div className="rating-wrap">
              <h5>4.8</h5>
              <div className="rating">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-regular fa-star-half-stroke"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 