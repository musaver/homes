import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ServiceCategories from '@/components/ServiceCategories'
import About from '@/components/About'
import DetailedServices from '@/components/DetailedServices'
import Services from '@/components/Services'
import WhyChooseUs from '@/components/WhyChooseUs'
import ServiceOfferBanner from '@/components/ServiceOfferBanner'
import CTA from '@/components/CTA'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ServiceCategories />
      <About />
      <DetailedServices />
      
      <WhyChooseUs />
      <ServiceOfferBanner />
      <Services />
      <CTA />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}