<template>
  <div class="landing-page">
    <!-- Navigation Header -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <div class="logo-icon">
            <i class="fas fa-heart-pulse"></i>
          </div>
          <span class="logo-text">DASYIN CRM</span>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#benefits" class="nav-link">Benefits</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <button @click="goToLogin" class="btn-login">Login</button>
        </div>
        <div class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ 'open': mobileMenuOpen }">
        <div class="mobile-menu-content">
          <a href="#features" class="mobile-nav-link" @click="closeMobileMenu">Features</a>
          <a href="#benefits" class="mobile-nav-link" @click="closeMobileMenu">Benefits</a>
          <a href="#pricing" class="mobile-nav-link" @click="closeMobileMenu">Pricing</a>
          <button @click="goToLogin" class="mobile-btn-login">Login</button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Streamline Your NDIS Care Management with 
            <span class="text-gradient">DASYIN CRM</span>
          </h1>
          <p class="hero-subtitle">
            Comprehensive care management platform designed specifically for NDIS providers. 
            Manage participants, staff, scheduling, and compliance all in one powerful system.
          </p>
          <div class="hero-actions">
            <button @click="goToLogin" class="btn-primary">Get Started</button>
            <button @click="scrollToFeatures" class="btn-secondary">Learn More</button>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">500+</span>
              <span class="stat-label">Participants Managed</span>
            </div>
            <div class="stat">
              <span class="stat-number">50+</span>
              <span class="stat-label">Care Providers</span>
            </div>
            <div class="stat">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Support Available</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-background">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-shape shape-3"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container-wide">
        <div class="section-header">
          <h2 class="section-title">Powerful Features for NDIS Providers</h2>
          <p class="section-subtitle">Everything you need to manage your care services efficiently and compliantly</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon participant-icon">
              <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Participant Management</h3>
              <p class="feature-description">
                Comprehensive participant profiles with medical information, care plans, 
                NDIS funding details, and emergency contacts all in one secure platform.
              </p>
              <div class="feature-highlights">
                <span class="highlight-tag">Medical Records</span>
                <span class="highlight-tag">Care Plans</span>
                <span class="highlight-tag">NDIS Funding</span>
              </div>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon scheduling-icon">
              <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Smart Scheduling</h3>
              <p class="feature-description">
                Advanced scheduling system with AI-powered conflict detection, staff availability tracking, 
                and automated shift assignments based on participant needs.
              </p>
              <div class="feature-highlights">
                <span class="highlight-tag">Conflict Detection</span>
                <span class="highlight-tag">Auto-Assignment</span>
                <span class="highlight-tag">Mobile Access</span>
              </div>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon staff-icon">
              <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Staff Management</h3>
              <p class="feature-description">
                Comprehensive staff management with role-based permissions, skill tracking, 
                performance monitoring, and automated rostering capabilities.
              </p>
              <div class="feature-highlights">
                <span class="highlight-tag">Role Permissions</span>
                <span class="highlight-tag">Skill Tracking</span>
                <span class="highlight-tag">Performance</span>
              </div>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon documents-icon">
              <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Document Management</h3>
              <p class="feature-description">
                Enterprise-grade document storage for care plans, incident reports, medical records, 
                and compliance documents with version control and audit trails.
              </p>
              <div class="feature-highlights">
                <span class="highlight-tag">Version Control</span>
                <span class="highlight-tag">Audit Trails</span>
                <span class="highlight-tag">Secure Storage</span>
              </div>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon reports-icon">
              <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Advanced Reporting</h3>
              <p class="feature-description">
                Generate detailed analytics for NDIS compliance, billing optimization, staff performance, 
                and participant outcomes with real-time dashboards and automated reporting.
              </p>
              <div class="feature-highlights">
                <span class="highlight-tag">NDIS Compliance</span>
                <span class="highlight-tag">Real-time Analytics</span>
                <span class="highlight-tag">Auto Reports</span>
              </div>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon billing-icon">
              <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                  <path d="M9 7h6"/>
                  <path d="M9 11h6"/>
                </svg>
              </div>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Billing & Invoicing</h3>
              <p class="feature-description">
                Automated billing system with NDIS price guide integration, intelligent invoice generation, 
                and comprehensive payment tracking for streamlined financial management.
              </p>
              <div class="feature-highlights">
                <span class="highlight-tag">NDIS Integration</span>
                <span class="highlight-tag">Auto Invoicing</span>
                <span class="highlight-tag">Payment Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="benefits">
      <div class="container-wide">
        <div class="benefits-content">
          <div class="benefits-text">
            <h2 class="section-title">Why Choose DASYIN CRM?</h2>
            <div class="benefit-list">
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">
                  <h4>NDIS Compliant</h4>
                  <p>Built specifically for NDIS requirements with automated compliance reporting</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">
                  <h4>Multi-Organization Support</h4>
                  <p>Manage multiple care provider organizations from a single platform</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">
                  <h4>Mobile Friendly</h4>
                  <p>Access your CRM on any device with our responsive web application</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">
                  <h4>Secure & Private</h4>
                  <p>Enterprise-grade security with encrypted data storage and access controls</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">
                  <h4>Reduce Admin Time</h4>
                  <p>Automated workflows reduce administrative tasks by 70%, saving hours each week</p>
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">✓</div>
                <div class="benefit-text">
                  <h4>100% NDIS Compliant</h4>
                  <p>Stay compliant with built-in reporting and audit trails for all NDIS requirements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing">
      <div class="container-wide">
        <div class="section-header">
          <h2 class="section-title">Simple, Transparent Pricing</h2>
          <p class="section-subtitle">Choose the plan that fits your organization's needs. All plans include 25% savings compared to industry competitors.</p>
        </div>
        
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="pricing-header">
              <h3 class="plan-name">Starter</h3>
              <p class="plan-description">Perfect for small care providers just getting started</p>
              <div class="price-container">
                <span class="price-original">$99</span>
                <span class="price-current">$75<span class="price-period">/month</span></span>
              </div>
              <div class="savings-badge">Save 25%</div>
            </div>
            <div class="pricing-features">
              <ul class="feature-list">
                <li><span class="feature-icon">✓</span>Up to 25 participants</li>
                <li><span class="feature-icon">✓</span>5 staff members</li>
                <li><span class="feature-icon">✓</span>Basic scheduling</li>
                <li><span class="feature-icon">✓</span>Document storage (1GB)</li>
                <li><span class="feature-icon">✓</span>Email support</li>
                <li><span class="feature-icon">✓</span>NDIS compliance reports</li>
              </ul>
              <button @click="goToLogin" class="btn-pricing">Get Started</button>
            </div>
          </div>

          <div class="pricing-card featured">
            <div class="popular-badge">Most Popular</div>
            <div class="pricing-header">
              <h3 class="plan-name">Professional</h3>
              <p class="plan-description">Ideal for growing organizations with multiple services</p>
              <div class="price-container">
                <span class="price-original">$199</span>
                <span class="price-current">$149<span class="price-period">/month</span></span>
              </div>
              <div class="savings-badge">Save 25%</div>
            </div>
            <div class="pricing-features">
              <ul class="feature-list">
                <li><span class="feature-icon">✓</span>Up to 100 participants</li>
                <li><span class="feature-icon">✓</span>15 staff members</li>
                <li><span class="feature-icon">✓</span>Advanced scheduling with conflicts</li>
                <li><span class="feature-icon">✓</span>Document storage (10GB)</li>
                <li><span class="feature-icon">✓</span>Priority phone & email support</li>
                <li><span class="feature-icon">✓</span>Custom reporting & analytics</li>
                <li><span class="feature-icon">✓</span>Mobile app access</li>
                <li><span class="feature-icon">✓</span>API integrations</li>
              </ul>
              <button @click="goToLogin" class="btn-pricing featured">Start Free Trial</button>
            </div>
          </div>

          <div class="pricing-card">
            <div class="pricing-header">
              <h3 class="plan-name">Enterprise</h3>
              <p class="plan-description">Comprehensive solution for large multi-site organizations</p>
              <div class="price-container">
                <span class="price-original">$399</span>
                <span class="price-current">$299<span class="price-period">/month</span></span>
              </div>
              <div class="savings-badge">Save 25%</div>
            </div>
            <div class="pricing-features">
              <ul class="feature-list">
                <li><span class="feature-icon">✓</span>Unlimited participants</li>
                <li><span class="feature-icon">✓</span>Unlimited staff</li>
                <li><span class="feature-icon">✓</span>Multi-site management</li>
                <li><span class="feature-icon">✓</span>Unlimited document storage</li>
                <li><span class="feature-icon">✓</span>24/7 dedicated support</li>
                <li><span class="feature-icon">✓</span>White-label options</li>
                <li><span class="feature-icon">✓</span>Custom integrations</li>
                <li><span class="feature-icon">✓</span>Training & onboarding</li>
              </ul>
              <button @click="contactSupport" class="btn-pricing">Contact Sales</button>
            </div>
          </div>
        </div>
        
        <div class="pricing-footer">
          <p class="pricing-note">All plans include free setup, migration assistance, and 30-day money-back guarantee. No lock-in contracts.</p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
      <div class="container-wide">
        <h2 class="section-title">What Our Clients Say</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <p class="testimonial-text">
              "DASYIN CRM has transformed how we manage our NDIS services. The scheduling system 
              alone has saved us hours each week, and the compliance reporting is fantastic."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <span>SM</span>
              </div>
              <div class="author-info">
                <h4>Sarah Mitchell</h4>
                <p>Care Coordinator, Adelaide Care Services</p>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <p class="testimonial-text">
              "The participant management features are incredibly comprehensive. Having all 
              medical information, care plans, and funding details in one place is a game-changer."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <span>DT</span>
              </div>
              <div class="author-info">
                <h4>David Thompson</h4>
                <p>Operations Manager, Community Care Plus</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <p class="testimonial-text">
              "DASYIN CRM's multi-organization support allows us to manage all our subsidiary 
              care providers efficiently. The reporting capabilities are outstanding."
            </p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <span>LW</span>
              </div>
              <div class="author-info">
                <h4>Lisa Wang</h4>
                <p>CEO, Metro Disability Services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container-narrow">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Transform Your Care Management?</h2>
          <p class="cta-subtitle">
            Join hundreds of NDIS providers who trust DASYIN CRM for their care management needs.
          </p>
          <div class="cta-actions">
            <button @click="goToLogin" class="btn-primary large">Start Your Journey</button>
            <button @click="contactSupport" class="btn-secondary large">Contact Sales</button>
          </div>
        </div>
      </div>
      <div class="cta-background">
        <div class="bg-shape shape-4"></div>
        <div class="bg-shape shape-5"></div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container-narrow">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="logo-icon">
                <i class="fas fa-heart-pulse"></i>
              </div>
              <span class="logo-text">DASYIN CRM</span>
            </div>
          </div>
          
          <div class="footer-links">
            <div class="footer-section">
              <h4>Company</h4>
              <a href="https://dasyin.com/about-us/" target="_blank">About</a>
              <a href="https://dasyin.com/services/" target="_blank">Services</a>
              <a href="https://dasyin.com/blog/" target="_blank">Blog</a>
            </div>
            <div class="footer-section">
              <h4>Support</h4>
              <a href="https://dasyin.com/contact/" target="_blank">Contact Us</a>
              <a href="#privacy">Privacy</a>
              <a href="#sitemap">Sitemap</a>
            </div>
            <div class="footer-section">
              <h4>Community</h4>
              <a href="#developer">Developer</a>
              <a href="#designer">Designer</a>
              <a href="/login">CRM Login</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-partners">
            <svg viewBox="0 0 300 92" class="partner-logo-svg">
              <defs>
                <linearGradient id="gcpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#4285f4;stop-opacity:1" />
                  <stop offset="25%" style="stop-color:#ea4335;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#fbbc04;stop-opacity:1" />
                  <stop offset="75%" style="stop-color:#34a853;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4285f4;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.1)"/>
                </filter>
              </defs>
              <rect x="3" y="3" width="294" height="86" fill="white" stroke="url(#gcpGradient)" stroke-width="3" rx="8" filter="url(#shadow)"/>
              <g transform="translate(25, 18)">
                <!-- Google Cloud icon with enhanced visibility -->
                <circle cx="12" cy="12" r="5" fill="#4285f4" stroke="white" stroke-width="1"/>
                <circle cx="24" cy="12" r="5" fill="#ea4335" stroke="white" stroke-width="1"/>
                <circle cx="36" cy="12" r="5" fill="#fbbc04" stroke="white" stroke-width="1"/>
                <circle cx="18" cy="25" r="5" fill="#34a853" stroke="white" stroke-width="1"/>
                <circle cx="30" cy="25" r="5" fill="#4285f4" stroke="white" stroke-width="1"/>
                
                <!-- Enhanced text with better contrast -->
                <text x="60" y="20" font-family="Google Sans, Roboto, Arial, sans-serif" font-size="18" font-weight="600" fill="#1a73e8">Google Cloud</text>
                <text x="60" y="38" font-family="Google Sans, Roboto, Arial, sans-serif" font-size="16" font-weight="500" fill="#202124">Partner</text>
              </g>
            </svg>
          </div>
          <div class="footer-copyright">
            <p>Design By DASYIN. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Landing',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login')
    },
    scrollToFeatures() {
      document.getElementById('features').scrollIntoView({ 
        behavior: 'smooth' 
      })
    },
    contactSupport() {
      window.open('mailto:support@dasyin.com.au?subject=DASYIN CRM Inquiry', '_blank')
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    }
  }
}
</script>

<style scoped>
/* Base Styles - Matching DASYIN.com */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Override any container constraints from parent styles */
.landing-page section,
.landing-page .navbar {
  width: 100% !important;
  max-width: none !important;
}

/* Ensure body and html allow full width when viewing landing page */
body:has(.landing-page) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: none !important;
}

html:has(.landing-page) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  max-width: none !important;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.container-wide {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.container-narrow {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 1.2rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.nav-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-icon i {
  color: white;
  font-size: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.logo-text {
  font-weight: 700;
  font-size: 1.5rem;
  color: #1e293b;
  text-shadow: none;
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #046BD2;
}

.btn-login {
  background: #046BD2;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: #045CB4;
  transform: translateY(-1px);
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background: #1e293b;
  margin: 3px 0;
  transition: 0.3s;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1001;
}

.mobile-menu.open {
  right: 0;
}

.mobile-menu-content {
  padding: 100px 30px 30px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-nav-link {
  color: #1e293b;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
  transition: color 0.3s ease;
}

.mobile-nav-link:hover {
  color: #4f46e5;
}

.mobile-btn-login {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.mobile-btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
}

/* Hero Section */
.hero {
  position: relative;
  background: linear-gradient(135deg, #F0F5FA 0%, #ffffff 100%);
  padding: 10rem 0 4rem;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #1e293b;
  text-align: center;
}

.text-gradient {
  background: linear-gradient(135deg, #046BD2 0%, #045CB4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  background: linear-gradient(135deg, #046BD2 0%, #045CB4 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(4, 107, 210, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(4, 107, 210, 0.4);
}

.btn-primary.large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

.btn-secondary {
  background: white;
  color: #4f46e5;
  border: 2px solid #4f46e5;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.btn-secondary:hover {
  background: #4f46e5;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
}

.btn-secondary.large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #046BD2;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.hero-visual {
  position: relative;
}

.dashboard-preview {
  position: relative;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dashboard-img {
  width: 100%;
  height: auto;
  display: block;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 10%;
}

/* Features Section */
.features {
  padding: 8rem 0;
  background: #ffffff;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
  margin-top: 4rem;
}

.feature-card {
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.4s ease;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  position: relative;
}

.feature-card:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transform: translateY(-8px);
  border-color: #046BD2;
}

.feature-icon {
  margin-bottom: 2rem;
}

.icon-container {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.participant-icon .icon-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.scheduling-icon .icon-container {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.staff-icon .icon-container {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.documents-icon .icon-container {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.reports-icon .icon-container {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.billing-icon .icon-container {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: white;
}

.icon-container svg {
  width: 36px;
  height: 36px;
  position: relative;
  z-index: 1;
}

.feature-content {
  flex: 1;
}

.feature-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.participant-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.scheduling-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.staff-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.documents-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.reports-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.billing-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.feature-description {
  color: #475569;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.feature-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.highlight-tag {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #475569;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.feature-card:hover .highlight-tag {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #3b82f6;
}

/* Benefits Section */
.benefits {
  padding: 8rem 0;
  background: #f8fafc;
}

.benefits-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.benefit-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.benefit-item {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.benefit-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  width: 32px;
  height: 32px;
  background: #046BD2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.benefit-text h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.benefit-text p {
  color: #64748b;
  line-height: 1.6;
}

/* Pricing Section */
.pricing {
  padding: 8rem 0;
  background: #f8fafc;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.pricing-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}

.pricing-card.featured {
  border: 2px solid #046BD2;
  transform: scale(1.05);
  position: relative;
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-4px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #046BD2 0%, #045CB4 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(4, 107, 210, 0.3);
}

.pricing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.plan-description {
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.price-container {
  margin-bottom: 1rem;
}

.price-original {
  font-size: 1.25rem;
  color: #94a3b8;
  text-decoration: line-through;
  margin-right: 0.5rem;
}

.price-current {
  font-size: 3rem;
  font-weight: 800;
  color: #046BD2;
  line-height: 1;
}

.price-period {
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
}

.savings-badge {
  display: inline-block;
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.pricing-features {
  margin-top: 2rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #64748b;
}

.feature-icon {
  color: #10b981;
  font-weight: bold;
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
}

.btn-pricing {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f1f5f9;
  color: #046BD2;
  border: 2px solid #e2e8f0;
}

.btn-pricing:hover {
  background: #046BD2;
  color: white;
  transform: translateY(-1px);
}

.btn-pricing.featured {
  background: linear-gradient(135deg, #046BD2 0%, #045CB4 100%);
  color: white;
  border: 2px solid #046BD2;
}

.btn-pricing.featured:hover {
  background: linear-gradient(135deg, #045CB4 0%, #0350a0 100%);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(4, 107, 210, 0.4);
}

.pricing-footer {
  text-align: center;
  margin-top: 3rem;
}

.pricing-note {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Testimonials Section */
.testimonials {
  padding: 8rem 0;
  background: #ffffff;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.testimonial-text {
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: #046BD2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.author-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.author-info p {
  font-size: 0.875rem;
  color: #64748b;
}

/* CTA Section */
.cta {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 8rem 0;
  text-align: center;
  overflow: hidden;
  border-top: 1px solid #e2e8f0;
}

.cta-content {
  position: relative;
  z-index: 2;
  color: white;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: #475569;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.shape-4 {
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  top: -200px;
  left: -200px;
}

.shape-5 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.05);
  bottom: -150px;
  right: -150px;
}

/* Footer */
.footer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 4rem 0 2rem;
}

.footer-content {
  text-align: center;
  margin-bottom: 3rem;
}

.footer-brand {
  margin-bottom: 2.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.footer-logo .logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-logo .logo-icon i {
  color: white;
  font-size: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.footer-logo .logo-text {
  color: #1e293b;
  font-weight: 700;
  font-size: 1.5rem;
  text-shadow: none;
  letter-spacing: -0.01em;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 6rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.footer-section {
  text-align: center;
}

.footer-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-section a {
  display: block;
  color: #64748b;
  text-decoration: none;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #046BD2;
}

.footer-bottom {
  border-top: 1px solid #f1f5f9;
  padding-top: 2rem;
  text-align: center;
}

.footer-partners {
  margin-bottom: 1.5rem;
}

.partner-logo-svg {
  height: 60px;
  width: auto;
  opacity: 1;
  transition: all 0.3s ease;
  cursor: pointer;
  filter: brightness(1.1) contrast(1.2);
}

.partner-logo-svg:hover {
  opacity: 1;
  transform: scale(1.08);
  filter: brightness(1.2) contrast(1.3);
}

.footer-copyright p {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .hero {
    padding: 6rem 0 4rem;
  }
  
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  
  .hero-title {
    font-size: 2.2rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .hero-actions .btn-primary,
  .hero-actions .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 3rem;
  }
  
  .benefits-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .feature-card {
    text-align: center;
  }
  
  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .pricing-card {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .cta-actions .btn-primary,
  .cta-actions .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
  
  .footer-links {
    gap: 2rem;
    flex-direction: column;
    text-align: center;
  }
  
  .footer-section {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .container, .container-wide, .container-narrow {
    padding: 0 1rem;
  }
  
  .nav-container {
    padding: 0.8rem 1rem;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
  }
  
  .logo-icon i {
    font-size: 18px;
  }
  
  .logo-text {
    font-size: 1.3rem;
  }
  
  .hero {
    padding: 5rem 0 3rem;
  }
  
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .cta {
    padding: 4rem 0;
  }
  
  .cta-title {
    font-size: 1.8rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .feature-icon {
    width: 70px;
    height: 70px;
  }
  
  .feature-title {
    font-size: 1.3rem;
  }
  
  .pricing-card {
    padding: 2rem 1.5rem;
  }
  
  .mobile-menu {
    width: 100%;
    right: -100%;
  }
  
  .mobile-menu-content {
    padding: 80px 20px 20px;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>