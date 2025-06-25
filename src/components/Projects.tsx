'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Projects() {
  return (
    <>
    <div className="overflow-hidden space gallery-sec-3">
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-xl-8 col-lg-9">
                    <div className="title-area text-center"><span className="sub-title style-3 justify-content-center">
                        <span className="left"></span> Work Gallery <span className="right"></span></span>
                        <h2 className="sec-title">Our Work Gallery That We Do!</h2></div>
                </div>
            </div>
            <div className="row gallery-row filter-active justify-content-center gy-4">
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_1.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_2.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_3.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_4.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_6.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_5.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_7.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_8.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-xl-4 col-xxl-4 filter-item">
                    <div className="gallery-card2">
                        <div className="gallery-img"><Image src="/assets/img/gallery/gallery_3_9.jpg" alt="gallery image" width={300} height={300} /> 
                    <Link href="service-details.html" className="icon-btn"><i className="fa-regular fa-arrow-right"></i></Link>
                            <div className="gallery-content">
                                <p className="box-text">Commercial cleaning</p>
                                <h2 className="box-title"><a href="service-details.html">Hospital Out Field Cleaning</a></h2></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
      
    </>
  )
} 