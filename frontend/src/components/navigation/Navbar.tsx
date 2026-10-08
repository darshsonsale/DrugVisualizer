import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from '../../types/navigation';
import { MobileNav } from './MobileNav';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="app-navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-link" aria-label="Drug Path Visualiser Home">
          <div className="brand-icon-box">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              medication
            </span>
          </div>
          <span className="brand-title">Drug Path Visualiser</span>
        </Link>

        {/* Center Desktop Navigation Pills */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          {MAIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Utilities */}
        <div className="nav-utilities">
          <button
            type="button"
            className="icon-btn"
            aria-label="Search Visualizer"
            title="Search"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              search
            </span>
          </button>

          <span className="sign-in-btn">Sign In</span>

          <div className="avatar-badge" title="User Profile">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              person
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};
