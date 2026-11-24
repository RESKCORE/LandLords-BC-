import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/constants';

interface NavbarProps {
  onNavigate: (target: string) => void;
  onOpenMembership: (planChoice?: string) => void;
  onOpenResources: () => void;
  onOpenMemberDashboard: () => void;
  isMember?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenMembership,
  onOpenResources,
  onOpenMemberDashboard,
  isMember = false,
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
              >
                Active Member ✓
              </button>
            ) : (
              <button
                className="nav-btn-glass"
                type="button"
                onClick={() => onOpenMembership('individual')}
              >
                Join Association
              </button>
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
        )}
        <a href={CONTACT_INFO.phoneHref}>
          Call Helpline: {CONTACT_INFO.phone}
        </a>
      </div>
    </>
  );
};
