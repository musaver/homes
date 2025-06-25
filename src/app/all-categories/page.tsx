'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceCategories from '@/components/ServiceCategories';

export default function OurServices() {
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
                  <h1 className="breadcumb-title">All Categories </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li>All Categories</li>
                  </ul>
              </div>
          </div>
      </div>

      {/* All Categories */}
      <ServiceCategories />

      <Footer />

    </>
  );
} 