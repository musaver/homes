'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  iconName: string | null
  isActive: boolean
  sortOrder: number
}

export default function ServiceCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])
  if (loading) {
    return (
      <div className="" style={{padding: '30px 0px'}}>
        <div className="container">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="" style={{padding: '30px 0px'}}>
        <div className="container">
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="" style={{padding: '30px 0px'}}>
      <div className="container">
        <div className="twm-job-categories-section-2">
          <div className="job-categories-style1 m-b30">
            <div className="row">
              {categories.map((category) => (
                <div key={category.id} className="col-lg-3 col-md-6">
                  <div className="job-categories-block-2 m-b30">
                    <div className="twm-media">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className={`fa-solid ${category.iconName || 'fa-cog'}`}></div>
                      )}
                    </div>
                    <div className="twm-content">
                      <Link href={`/category/${category.slug}`}>{category.name}</Link>
                    </div>
                  </div>
                </div>
              ))}
               {/* if home page */}
               {window.location.pathname === '/' ? (
                <div className="col-lg-3 col-md-6">
                  <div className="job-categories-block-2 m-b30">
                    <div className="twm-media">
                    <img 
                          src={'/assets/img/icon/more-services.png'} 
                          alt={'More Services'}
                          style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="twm-content">
                      <Link href={`/all-categories`}>More Services</Link>
                    </div>
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .job-categories-block-2 {
          padding: 30px 0px;
          background-color: #fff;
          box-shadow: 0px 0px 25px rgba(56, 152, 226, 0.3);
          border-radius: 10px;
          position: relative;
          z-index: 1;
          overflow: hidden;
          text-align: center;
          transition: 0.5s all ease;
          margin: 10px auto;
        }
        .job-categories-block-2:after {
          width: 110px;
          height: 110px;
          position: absolute;
          right: -60px;
          bottom: -60px;
          content: '';
          background-color: var(--theme-color3);
          border-radius: 50%;
          opacity: 0.04;
          z-index: -1;
          transition: 0.5s all ease;
        }
        .job-categories-block-2:before {
          width: 110px;
          height: 110px;
          position: absolute;
          left: -60px;
          top: -60px;
          content: '';
          background-color: var(--theme-color3);
          border-radius: 50%;
          opacity: 0.04;
          z-index: -1;
          transition: 0.5s all ease;
        }
        .job-categories-block-2 .twm-media {
          width: 100px;
          height: 100px;
          line-height: 0;
          display: flex;
          position: relative;
          z-index: 1;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .job-categories-block-2 .twm-media [class*='fa-'] {
          color: var(--theme-color3);
          font-size: 70px;
          line-height: 0px;
          transition: 0.5s all ease;
        }
        .job-categories-block-2 .twm-media img {
          border-radius: 8px;
          transition: 0.5s all ease;
        }
        .job-categories-block-2 .twm-content a {
          margin-bottom: 0px;
          display: block;
          transition: 0.5s all ease;
        }
        .job-categories-block-2:hover {
          background-color: var(--theme-color3);
        }
        .job-categories-block-2:hover:after {
          background-color: #fff;
          opacity: 0.1;
          width: 500%;
          height: 500%;
        }
        .job-categories-block-2:hover:before {
          display: none;
        }
        .job-categories-block-2:hover .twm-content a {
          color: #fff;
        }
        .job-categories-block-2:hover .twm-media [class*='fa-'] {
          transform: scale(0.8);
        }
        .job-categories-block-2:hover .twm-media img {
          transform: scale(0.8);
        }
      `}</style>
    </div>
  )
} 