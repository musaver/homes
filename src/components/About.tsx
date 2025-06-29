import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <div className="overflow-hidden space-bottom" id="about-sec" style={{padding: '30px 0px'}}>
      <div className="container">
        <div className="row gy-30 align-items-center">
          <div className="col-xl-7 mb-xl-0">
            <div className="img-box1">
              <div className="img1 jump-reverse">
                <Image src="/assets/images/about-1-left.jpg" alt="About" width={300} height={400} />
              </div>
              <div className="shape1 jump">
                <Image src="/assets/images/about-1-right.jpg" alt="Image" width={200} height={300} />
              </div>
              <div className="img2">
                <Image 
                  className="tilt-active" 
                  src="/assets/images/about-1-main.jpg" 
                  alt="Image" 
                  width={400} 
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
                We are a trusted home services provider offering expert solutions for AC cleaning, handyman work, plumbing, electrical, appliance repair, home painting, and renovation. Our mission is to simplify home maintenance with prompt, affordable, and high-quality service. Whether it&apos;s a small fix or a complete home transformation, our skilled team brings years of experience and dedication to every job. We focus on customer satisfaction, professionalism, and attention to detail, ensuring that your home is in safe hands from start to finish.
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