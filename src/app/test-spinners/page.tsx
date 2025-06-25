'use client';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TestSpinnersPage() {
  return (
    <>
      <Header />
      
      <section className="space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="title-area text-center mb-5">
                <h2 className="sec-title">Spinner Components Test</h2>
                <p className="sec-text">Testing different spinner types, sizes, and colors</p>
              </div>
              
              {/* Different Types */}
              <div className="row mb-5">
                <div className="col-12">
                  <h4 className="mb-4">Different Spinner Types</h4>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Clip Loader</h6>
                  <LoadingSpinner type="clip" size="medium" color="#0d6efd" />
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Beat Loader</h6>
                  <LoadingSpinner type="beat" size="medium" color="#0d6efd" />
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Ring Loader</h6>
                  <LoadingSpinner type="ring" size="medium" color="#0d6efd" />
                </div>
              </div>
              
              {/* Different Sizes */}
              <div className="row mb-5">
                <div className="col-12">
                  <h4 className="mb-4">Different Sizes</h4>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Small</h6>
                  <LoadingSpinner size="small" color="#28a745" />
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Medium</h6>
                  <LoadingSpinner size="medium" color="#28a745" />
                </div>
                <div className="col-md-4 text-center mb-4">
                  <h6>Large</h6>
                  <LoadingSpinner size="large" color="#28a745" />
                </div>
              </div>
              
              {/* Different Colors */}
              <div className="row mb-5">
                <div className="col-12">
                  <h4 className="mb-4">Different Colors</h4>
                </div>
                <div className="col-md-3 text-center mb-4">
                  <h6>Blue</h6>
                  <LoadingSpinner color="#0d6efd" />
                </div>
                <div className="col-md-3 text-center mb-4">
                  <h6>Green</h6>
                  <LoadingSpinner color="#28a745" />
                </div>
                <div className="col-md-3 text-center mb-4">
                  <h6>Red</h6>
                  <LoadingSpinner color="#dc3545" />
                </div>
                <div className="col-md-3 text-center mb-4">
                  <h6>Orange</h6>
                  <LoadingSpinner color="#fd7e14" />
                </div>
              </div>
              
              {/* In Context Examples */}
              <div className="row">
                <div className="col-12">
                  <h4 className="mb-4">In Context Examples</h4>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card p-4">
                    <h6>Loading State</h6>
                    <div className="text-center py-4">
                      <LoadingSpinner size="medium" color="#0d6efd" />
                      <p className="mt-3 text-muted">Loading content...</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card p-4">
                    <h6>Button Loading</h6>
                    <button className="btn btn-primary" disabled>
                      <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                      Processing...
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
} 