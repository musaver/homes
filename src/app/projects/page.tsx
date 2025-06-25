'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Projects from '@/components/Projects';
export default function OurProjects() {
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
                  <h1 className="breadcumb-title">Projects </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li>Projects</li>
                  </ul>
              </div>
          </div>
      </div>

      {/* Projects */}
      <Projects />

      <Footer />

    </>
  );
} 