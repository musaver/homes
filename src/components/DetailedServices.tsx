'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { normalizeProductImages } from '@/utils/jsonUtils'

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  images: string[] | string | null;
  isFeatured: boolean;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt: string;
}

interface ApiResponse {
  products: Product[];
  total: number;
}

export default function DetailedServices() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured');
        
        if (response.ok) {
          const result: ApiResponse = await response.json();
          console.log('🔍 Featured Products Frontend Debug:', result);
          setProducts(result.products);
        } else {
          setError('Failed to fetch featured products');
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setError('An error occurred while fetching featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Use the same image handling logic as category page
  const getFirstProductImage = (imagesData: any): string | null => {
    console.log('🖼️ Raw images data:', imagesData);
    
    const normalizedImages = normalizeProductImages(imagesData);
    console.log('✅ Normalized images:', normalizedImages);
    
    const firstImage = normalizedImages.length > 0 ? normalizedImages[0] : null;
    console.log('🎯 First image:', firstImage);
    
    return firstImage;
  };

  const getProductImage = (product: Product): string => {
    const imageUrl = getFirstProductImage(product.images);
    
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl;
    }
    
    return "/assets/img/gallery/project_2_1.jpg"; // Default fallback image
  };

  // ProductImage component with same logic as category page
  const ProductImage = ({ imagesData, productName, width = 355, height = 250 }: { 
    imagesData: any; 
    productName: string; 
    width?: number; 
    height?: number; 
  }) => {
    const imageUrl = getFirstProductImage(imagesData);
    
    console.log('🖼️ ProductImage render:', {
      productName,
      imageUrl,
      imagesData,
      hasImageUrl: !!imageUrl
    });
    
    if (!imageUrl) {
      console.log('❌ No image URL found, showing fallback');
      return (
        <div 
          className="d-flex align-items-center justify-content-center bg-light border"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <span className="text-muted small">No Image</span>
        </div>
      );
    }

    console.log('✅ Rendering image with URL:', imageUrl);

    return (
      <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
        <Image 
          src={imageUrl}
          alt={productName}
          width={width}
          height={height}
          className="img-fluid"
          style={{ objectFit: 'cover' }}
          onLoadingComplete={() => {
            console.log('✅ Next.js Image loaded successfully:', imageUrl);
          }}
          onError={(e) => {
            console.error('💥 Next.js Image failed to load:', imageUrl);
            console.error('Error event:', e);
          }}
        />
        <div 
          className="fallback-image d-none align-items-center justify-content-center bg-light border"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%' 
          }}
        >
          <span className="text-muted small">Image Error</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Initialize styling and swiper when component mounts
    const initializeComponent = () => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Initialize background images and other styling
        const script = document.createElement('script');
        script.innerHTML = `
          if (window.jQuery) {
            var $ = window.jQuery;
            
            // Initialize background images
            if ($("[data-bg-src]").length > 0) {
              $("[data-bg-src]").each(function () {
                var src = $(this).attr("data-bg-src");
                $(this).css("background-image", "url(" + src + ")");
                $(this).removeAttr("data-bg-src").addClass("background-image");
              });
            }
            
            // Initialize animations
            $("[data-ani]").each(function () {
              var animationName = $(this).data("ani");
              $(this).addClass(animationName);
            });
            
            $("[data-ani-delay]").each(function () {
              var delayTime = $(this).data("ani-delay");
              $(this).css("animation-delay", delayTime);
            });
          }
        `;
        document.head.appendChild(script);
        document.head.removeChild(script);

        // Initialize swiper after styling is applied
        setTimeout(() => {
          const slider = document.getElementById('service-slider1');
          if (slider) {
            // Remove th-slider class temporarily
            slider.classList.remove('th-slider');
            
            // Re-add it after a brief delay to trigger initialization
            setTimeout(() => {
              slider.classList.add('th-slider');
              
              // Initialize swiper
              const swiperScript = document.createElement('script');
              swiperScript.innerHTML = `
                if (window.jQuery && window.Swiper) {
                  $('#service-slider1.th-slider').each(function () {
                    var thSlider = $(this);
                    if (this.swiper) {
                      this.swiper.destroy(true, true);
                    }
                    var settings = thSlider.data('slider-options');
                    var prevArrow = thSlider.siblings('.slider-area').find('.slider-prev');
                    var nextArrow = thSlider.siblings('.slider-area').find('.slider-next');
                    if (prevArrow.length === 0) prevArrow = thSlider.parent().find('.slider-prev');
                    if (nextArrow.length === 0) nextArrow = thSlider.parent().find('.slider-next');
                    var sliderDefault = {
                      slidesPerView: 1,
                      spaceBetween: 24,
                      loop: false,
                      speed: 1000,
                      navigation: {
                        nextEl: nextArrow.get(0),
                        prevEl: prevArrow.get(0),
                      }
                    };
                    var options = Object.assign({}, sliderDefault, settings);
                    new Swiper(thSlider.get(0), options);
                  });
                }
              `;
              document.head.appendChild(swiperScript);
              document.head.removeChild(swiperScript);
            }, 100);
          }
        }, 50);
      }
    };

    // Initialize after a delay to ensure DOM is ready
    const timer = setTimeout(initializeComponent, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [products]); // Re-run when products change

  if (loading) {
    return (
      <section className="space" style={{padding: '30px 0px'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-6 col-xl-7 col-lg-7 col-md-8">
              <div className="title-area text-center">
                <span className="sub-title justify-content-center">Our Services</span>
                <h2 className="sec-title">
                  The Services We Provide For
                  <span className="text-theme"> Our Customer</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 text-center" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner size="medium" color="#0d6efd" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space" style={{padding: '30px 0px'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-6 col-xl-7 col-lg-7 col-md-8">
              <div className="title-area text-center">
                <span className="sub-title justify-content-center">Our Services</span>
                <h2 className="sec-title">
                  The Services We Provide For
                  <span className="text-theme"> Our Customer</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="no-products-found">
                <h3>Unable to Load Services</h3>
                <p className="text-muted">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space" style={{padding: '30px 0px'}}>
      <div className="shape-mockup moving th-service-1__shape-1">
        <Image src="/assets/img/shape/services-shape-1-1.svg" alt="shape" width={50} height={50} />
      </div>
      <div className="shape-mockup jump th-service-1__shape-2">
        <Image src="/assets/img/shape/services-shape-1-2.svg" alt="shape" width={50} height={50} />
      </div>
      <div className="shape-mockup jump-reverse th-service-1__shape-3">
        <Image src="/assets/img/shape/services-shape-1-3.svg" alt="shape" width={50} height={50} />
      </div>
      <div className="shape-mockup jump th-service-1__shape-4">
        <Image src="/assets/img/shape/services-shape-1-4.svg" alt="shape" width={50} height={50} />
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-6 col-xl-7 col-lg-7 col-md-8">
            <div className="title-area text-center">
              <span className="sub-title justify-content-center">Our Services</span>
              <h2 className="sec-title">
                The Services We Provide For
                <span className="text-theme"> Our Customer</span>
              </h2>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="row gy-30 justify-content-center">
            <div className="slider-area">
              <div 
                className="swiper th-slider" 
                id="service-slider1"
                data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}'
              >
                <div className="swiper-wrapper">
                  {products.map((product, index) => (
                    <div key={product.id} className="swiper-slide">
                      <div className="service-card">
                        <div className="box-img">
                          <Link href={`/product-details/${product.slug}`}>
                            <ProductImage 
                              imagesData={product.images} 
                              productName={product.name}
                              width={355}
                              height={250}
                            />
                          </Link>
                        </div>
                        <div className="box-content">
                          <h3 className="box-title">
                            <Link href={`/product-details/${product.slug}`}>
                              {product.name}
                            </Link>
                          </h3>
                          <p className="box-text d-none">
                            {product.shortDescription || product.description || 'Professional service with expert quality and reliable results.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button data-slider-prev="#service-slider1" className="slider-arrow slider-prev">
                <i className="far fa-arrow-left"></i>
              </button>
              <button data-slider-next="#service-slider1" className="slider-arrow slider-next">
                <i className="far fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="no-products-found">
                <h3>No Featured Services Found</h3>
                <p className="text-muted">There are currently no featured services available.</p>
                <Link href="/all-categories" className="th-btn">
                  View All Categories<i className="far fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 