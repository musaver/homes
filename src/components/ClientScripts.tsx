'use client';
import React, { useEffect } from 'react';

const ClientScripts: React.FC = () => {
  useEffect(() => {
    const initializeScripts = () => {
      console.log('🚀 Initializing Basic Client Scripts...');
      
      if (typeof window !== 'undefined') {
        // Mobile Menu Toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu-wrapper');
        
        if (menuToggle && mobileMenu) {
          menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            mobileMenu.classList.toggle('active');
            console.log('🍔 Mobile menu toggled');
          });
        }

        // Close Mobile Menu
        const menuClose = document.querySelector('.mobile-menu-close');
        if (menuClose && mobileMenu) {
          menuClose.addEventListener('click', function(e) {
            e.preventDefault();
            mobileMenu.classList.remove('active');
          });
        }

        // Back to Top Button
        const backToTop = document.querySelector('.scroll-to-top');
        if (backToTop) {
          window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
              backToTop.classList.add('show');
            } else {
              backToTop.classList.remove('show');
            }
          });

          backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }

        // Preloader
        setTimeout(() => {
          const preloader = document.querySelector('.preloader') as HTMLElement;
          if (preloader) {
            preloader.style.display = 'none';
          }
        }, 1000);

        console.log('✅ Basic client scripts initialized successfully!');
      }
    };

    // Initialize scripts with a small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      initializeScripts();
    }, 100);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up Basic Client Scripts...');
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  return null;
};

export default ClientScripts; 