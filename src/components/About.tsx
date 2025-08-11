import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <div className="overflow-hidden space-bottom" id="about-sec" style={{padding: '30px 0px'}}>
      <div className="container">
        <div className="row gy-30 align-items-center">
          <div className="col-xl-7 mb-xl-0">
            <div className="img-box1">
              <div className="img2">
                <Image 
                  className="tilt-active" 
                  src="/assets/images/new/645x600.jpg" 
                  alt="Image" 
                  width={550} 
                  height={500} 
                />
              </div>
            </div>
          </div>
          <div className="col-xl-5">
            <div className="title-area">
              <span className="sub-title before-none">About Us</span>
              <h2 className="sec-title">One Company. Every Solution for Your Home</h2>
              <p className="sec-text">
                 We are a trusted home repair and maintenance service provider offering expert solutions for AC servicing, handyman work, plumbing, electrical, appliance repair, painting, and renovation. Our mission is to simplify home upkeep with prompt, affordable, and high-quality service. Whether it&apos;s a minor repair or a complete home transformation, our skilled team brings years of experience and dedication to every job. We focus on customer satisfaction, professionalism, and attention to detail, ensuring that your home is in safe hands from start to finish.
              </p>
            </div>
            <div>
              <Link href="#!" className="th-btn star-btn">Discover More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 