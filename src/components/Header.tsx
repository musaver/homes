'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsSubmenuOpen(false) // Close submenu when main menu toggles
    setIsUserDropdownOpen(false) // Close user dropdown when main menu toggles
  }

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSubmenuOpen(!isSubmenuOpen)
  }

  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (session) {
      setIsUserDropdownOpen(!isUserDropdownOpen)
    }
  }

  const handleUserIconClick = () => {
    if (!session) {
      // Redirect to login page if not logged in
      router.push('/login-register')
    } else {
      // Toggle dropdown if logged in
      setIsUserDropdownOpen(!isUserDropdownOpen)
    }
  }

  // Handle body class and overflow when mobile menu opens/closes
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('th-body-visible')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('th-body-visible')
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('th-body-visible')
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu */}
      <div className={`th-menu-wrapper ${isMobileMenuOpen ? 'th-body-visible' : ''}`} onClick={handleBackdropClick}>
        <div className="th-menu-area text-center">
          <button className="th-menu-toggle" onClick={toggleMobileMenu}>
            <i className="fal fa-times"></i>
          </button>
          <div className="mobile-logo">
            <Link href="/">
              <Image src="/assets/images/logo.png" alt="Quick Repairs Home" width={150} height={50} />
            </Link>
          </div>
          <div className="th-mobile-menu">
            <ul>
              <li><Link href="/" onClick={toggleMobileMenu}>Home</Link></li>
              <li><Link href="/about" onClick={toggleMobileMenu}>About Us</Link></li>
              <li className={`menu-item-has-children th-item-has-children ${isSubmenuOpen ? 'th-active' : ''}`}>
                <a href="/all-categories" onClick={toggleSubmenu}>
                  Service
                  <span className="th-mean-expand"></span>
                </a>
                <ul className={`sub-menu th-submenu ${isSubmenuOpen ? 'th-open' : ''}`} style={{display: isSubmenuOpen ? 'block' : 'none'}}>
                  <li><Link href="/category/ac-cleaning" onClick={toggleMobileMenu}>AC Cleaning</Link></li>
                  <li><Link href="/category/handyman-services" onClick={toggleMobileMenu}>Handyman Services</Link></li>
                  <li><Link href="/category/plumbing-services" onClick={toggleMobileMenu}>Plumbing Services</Link></li>
                  <li><Link href="/category/electrical-services" onClick={toggleMobileMenu}>Electrical Services</Link></li>
                  <li><Link href="/category/appliance-repair" onClick={toggleMobileMenu}>Appliance Repair</Link></li>
                  <li><Link href="/category/home-painting" onClick={toggleMobileMenu}>Home Painting</Link></li>
                  <li><Link href="/category/home-renovation" onClick={toggleMobileMenu}>Home Renovation</Link></li>
                </ul>
              </li>
              <li><Link href="/projects" onClick={toggleMobileMenu}>Project</Link></li>
              <li><Link href="/contact" onClick={toggleMobileMenu}>Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="th-header header-layout2">
        <div className="sticky-wrapper">
          <div className="container">
            <div className="menu-area">
              <div className="row align-items-center justify-content-between">
                <div className="col-auto">
                  <div className="header-logo">
                    <Link href="/">
                      <Image src="/assets/images/logo.png" alt="Quick Repairs Home" width={150} height={50} />
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <nav className="main-menu d-none d-lg-inline-block">
                        <ul>
                          <li><Link href="/">Home</Link></li>
                          <li><Link href="/about">About Us</Link></li>
                          <li className="menu-item-has-children">
                            <Link href="/all-categories">Service</Link>
                            <ul className="sub-menu">
                              <li><Link href="/category/ac-cleaning">AC Cleaning</Link></li>
                              <li><Link href="/category/handyman-services">Handyman Services</Link></li>
                              <li><Link href="/category/plumbing-services">Plumbing Services</Link></li>
                              <li><Link href="/category/electrical-services">Electrical Services</Link></li>
                              <li><Link href="/category/appliance-repair">Appliance Repair</Link></li>
                              <li><Link href="/category/home-painting">Home Painting</Link></li>
                              <li><Link href="/category/home-renovation">Home Renovation</Link></li>
                            </ul>
                          </li>
                          <li><Link href="/projects">Project</Link></li>
                          <li><Link href="/contact">Contact</Link></li>
                        </ul>
                      </nav>
                      <div className="mobile-menu-controls d-flex d-lg-none align-items-center">
                        {/* Mobile User Icon */}
                        <div className="user-dropdown-container mobile-user-icon">
                          <button 
                            className="user-icon-btn"
                            onClick={handleUserIconClick}
                            title={session ? 'User Menu' : 'Login'}
                          >
                            <i className="fas fa-user-circle"></i>
                          </button>
                          
                          {/* Mobile User Dropdown */}
                          {session && isUserDropdownOpen && (
                            <div className="user-dropdown mobile-dropdown">
                              <div className="user-dropdown-header">
                                <div className="user-avatar">
                                  <i className="fas fa-user-circle"></i>
                                </div>
                                <div className="user-info">
                                  <h4 className="user-name">{session.user?.name || 'User'}</h4>
                                  <p className="user-email">{session.user?.email}</p>
                                </div>
                              </div>
                              <div className="user-dropdown-divider"></div>
                              <div className="user-dropdown-menu">
                                <Link href="/dashboard" className="user-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                  <i className="fas fa-th-large"></i>
                                  <span>Dashboard</span>
                                </Link>
                                <Link href="/dashboard/profile" className="user-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                  <i className="fas fa-user"></i>
                                  <span>Profile</span>
                                </Link>
                                <Link href="/dashboard/services" className="user-dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                  <i className="fas fa-shopping-cart"></i>
                                  <span>Orders</span>
                                </Link>
                                <div className="user-dropdown-divider"></div>
                                <button 
                                  onClick={() => signOut({ callbackUrl: '/login-register' })}
                                  className="user-dropdown-item logout-btn"
                                >
                                  <i className="fas fa-sign-out-alt"></i>
                                  <span>Logout</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <button 
                          type="button" 
                          className="th-menu-toggle"
                          onClick={toggleMobileMenu}
                        >
                          <i className="far fa-bars"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto mobile-quote-button-center">
                  <div className="header-button">
                    <div className="header-info-box">
                      <div className="header-info-box__icon">
                        <i className="fa-sharp fa-light fa-phone"></i>
                      </div>
                      <div className="header-info-box__content">
                        <h4 className="header-info-box__title">Get Contact Now</h4>
                        <p className="header-info-box__text">
                          <Link href="tel:+971501258142" className="header-info-box__link">
                            +971 50 125 8142
                          </Link>
                        </p>
                      </div>
                    </div>
                    <Link href="/contact" className="th-btn star-btn">Get A Quote</Link>
                    
                    {/* User Icon */}
                    <div className="user-dropdown-container">
                      <button 
                        className="user-icon-btn"
                        onClick={handleUserIconClick}
                        title={session ? 'User Menu' : 'Login'}
                      >
                        <i className="fas fa-user-circle"></i>
                      </button>
                      
                      {/* User Dropdown */}
                      {session && isUserDropdownOpen && (
                        <div className="user-dropdown dropdown">
                          <div className="user-dropdown-header">
                            <div className="user-avatar">
                              <i className="fas fa-user-circle"></i>
                            </div>
                            <div className="user-info">
                              <h4 className="user-name">{session.user?.name || 'User'}</h4>
                              <p className="user-email">{session.user?.email}</p>
                            </div>
                          </div>
                          <div className="user-dropdown-divider"></div>
                          <div className="user-dropdown-menu ">
                            <Link href="/dashboard" className="user-dropdown-item  ">
                              <i className="fas fa-th-large pe-1"></i>
                              <span>Dashboard</span>
                            </Link>
                            <Link href="/dashboard/profile" className="user-dropdown-item  ">
                              <i className="fas fa-user pe-1"></i>
                              <span>Profile</span>
                            </Link>
                            <Link href="/dashboard/services" className="user-dropdown-item  ">
                              <i className="fas fa-shopping-cart pe-1"></i>
                              <span>Orders</span>
                            </Link>
                            <div className="user-dropdown-divider"></div>
                            <button 
                              onClick={() => signOut({ callbackUrl: '/login-register' })}
                              className="user-dropdown-item logout-btn"
                            >
                              <i className="fas fa-sign-out-alt pe-1"></i>
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

    </>
  )
} 