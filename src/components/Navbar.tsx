import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/constants';

interface NavbarProps {
  onNavigate: (target: string) => void;
  onOpenMembership: (planChoice?: string) => void;
  onOpenResources: () => void;
  onOpenMemberDashboard: () => void;
  isMember?: boolean;
  googleUser?: { name: string; email: string; picture?: string } | null;
  onGoogleSignIn?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenMembership,
  onOpenResources,
  onOpenMemberDashboard,
  isMember = false,
  googleUser = null,
  onGoogleSignIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(hash);
  };

  const handleTenancyGuidanceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    // Smoothly scroll down to the interactive Tenancy Guidance Consultation Terminal
    onNavigate('#studio');
  };

  return (
    <>
      <header className={`nav ${isScrolled ? 'scrolled' : ''}`} id="nav">
        <div className="wrap">
          {/* Left: Floating Frosted Glass Navigation Pills */}
          <nav className="nav-l" aria-label="Primary Navigation">
            <a
              className="pill"
              href="#studio"
              onClick={handleTenancyGuidanceClick}
              title="View BC Tenancy Guidance & Legal Consultation Desk"
            >
              Tenancy Guidance
            </a>
            <a
              className="pill"
              href="#features"
              onClick={(e) => handleLinkClick(e, '#features')}
            >
              Resources &amp; Advocacy
            </a>
            <button
              type="button"
              className="pill"
              onClick={onOpenResources}
            >
              Forms &amp; Guides
            </button>
            <a
              className="pill"
              href="#pricing"
              onClick={(e) => handleLinkClick(e, '#pricing')}
            >
              Membership
            </a>
          </nav>

          {/* Center: Brand Logo */}
          <a
            className="logo"
            href="#product"
            aria-label="Landlords BC Home"
            onClick={(e) => handleLinkClick(e, '#product')}
          >
            <svg viewBox="0 0 40 40" fill="#2a1a12">
              <path d="M5 5h13v13H5zM22 22h13v13H22z" />
              <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
            </svg>
          </a>

          {/* Right: Frosted Glass Phone Helpline & CTA Button */}
          <div className="nav-r">
            <a
              className="lang"
              href={CONTACT_INFO.phoneHref}
              aria-label="Call Landlords BC Helpline"
            >
              <span>{CONTACT_INFO.phone}</span>
              <svg className="flag" viewBox="0 0 20 14" aria-hidden="true">
                <rect width="20" height="14" rx="2" fill="#3b2116" />
                <path
                  d="M6.5 3.5h2l1 2.2-1.2 1.1a7 7 0 0 0 3.4 3.4l1.1-1.2 2.2 1v2a1.5 1.5 0 0 1-1.5 1.5A8.5 8.5 0 0 1 5 5a1.5 1.5 0 0 1 1.5-1.5z"
                  fill="#f6f0e7"
                />
              </svg>
              <svg
                className="chev"
                viewBox="0 0 9 6"
                fill="none"
                stroke="#2a1a12"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  d="M1 1.25L4.5 4.75L8 1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {isMember ? (
              <button
                className="nav-btn-member-glass"
                type="button"
                onClick={onOpenMemberDashboard}
                title="Open Active Member Dashboard & Vault"
              >
                {googleUser?.picture ? (
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      marginRight: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.65)',
                      objectFit: 'cover',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                    }}
                  />
                ) : null}
                <span>Active Member ✓</span>
              </button>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {onGoogleSignIn && (
                  <button
                    className="nav-btn-signin-glass"
                    type="button"
                    onClick={onGoogleSignIn}
                    title="Sign in with your Google account to restore membership"
                  >
                    <svg viewBox="0 0 18 18" width="14" height="14" style={{ flexShrink: 0 }}>
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                    </svg>
                    <span>Sign In</span>
                  </button>
                )}
                <button
                  className="nav-btn-glass"
                  type="button"
                  onClick={() => onOpenMembership('individual')}
                >
                  Join Association
                </button>
              </div>
            )}

            <button
              className="burger"
              id="burger"
              type="button"
              aria-label="Toggle Menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <i></i>
              <i></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className="mmenu" id="mmenu" aria-label="Mobile Navigation">
        <a href="#studio" onClick={handleTenancyGuidanceClick}>
          Tenancy Guidance
        </a>
        <a href="#features" onClick={(e) => handleLinkClick(e, '#features')}>
          Resources &amp; Advocacy
        </a>
        <a
          href="#resources"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onOpenResources();
          }}
        >
          Forms &amp; Guides
        </a>
        <a href="#pricing" onClick={(e) => handleLinkClick(e, '#pricing')}>
          Membership Plans (CAD)
        </a>
        {isMember ? (
          <a
            href="#portal"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onOpenMemberDashboard();
            }}
          >
            Member Dashboard ✓
          </a>
        ) : (
          <>
            {onGoogleSignIn && (
              <a
                href="#signin"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  onGoogleSignIn();
                }}
              >
                Sign In with Google
              </a>
            )}
            <a
              href="#join"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onOpenMembership('individual');
              }}
            >
              Join Association (CAD)
            </a>
          </>
        )}
        <a href={CONTACT_INFO.phoneHref}>
          Call Helpline: {CONTACT_INFO.phone}
        </a>
      </div>
    </>
  );
};
