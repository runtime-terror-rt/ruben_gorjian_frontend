"use client";

import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useSessionContext } from '@/context/SessionContext';

function NavbarInner() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { session, loading } = useSessionContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthed = Boolean(session);
  const isAdmin = session?.role === 'ADMIN' || session?.role === 'SUPER_ADMIN';
  const hasActiveSubscription =
    session?.subscription?.status === 'ACTIVE' ||
    session?.subscription?.status === 'TRIALING';

  const dashboardHref = isAdmin
    ? '/admin'
    : hasActiveSubscription
    ? '/dashboard'
    : '/pricing';

  const dashboardLabel = isAdmin
    ? 'Admin Panel'
    : hasActiveSubscription
    ? 'Dashboard'
    : 'Select a Plan';

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/login';
  };

  const getLoginUrl = () => {
    if (
      isAuthed ||
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/signup')
    ) {
      return '/login';
    }
    const fullPath =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    return `/login?returnTo=${encodeURIComponent(fullPath)}`;
  };

  // User initials for avatar
  const userInitials = session?.name
    ? session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.email
    ? session.email[0].toUpperCase()
    : 'U';

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Talexia</Link>
        <div className="nav-links">
          <Link href="/#work">Work</Link>
          <Link href="/#process">Process</Link>
          <Link href="/plan">Plans</Link>
          <Link href="/newhome/case-studies">Case Studies</Link>
          <Link href="/#atelier">Atelier</Link>
          <Link href="/newhome/faq">FAQ</Link>
          <Link href="/newhome/contact">Contact</Link>
          {/* <a href="/brandbrief">Brand Brief</a> */}

          {loading ? (
            <div style={{ visibility: 'hidden', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span className="nav-signin">Sign In</span>
              <span className="nav-cta">Book a Call</span>
            </div>
          ) : isAuthed ? (
            <div className="nav-profile-wrapper" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="nav-profile-btn"
              >
                {session?.avatarUrl ? (
                  <img
                    src={session.avatarUrl}
                    alt="Avatar"
                    className="nav-avatar-img"
                  />
                ) : (
                  <span className="nav-avatar-initials">
                    {userInitials}
                  </span>
                )}
                <span className="nav-profile-name">
                  {session?.name || session?.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown
                  style={{
                    width: '14px',
                    height: '14px',
                    transition: 'transform 0.2s',
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: '#8a7560',
                  }}
                />
              </button>

              {userMenuOpen && (
                <div className="nav-dropdown">
                  {/* User Info */}
                  <div className="nav-dropdown-header">
                    <p className="nav-dropdown-name">{session?.name || 'User'}</p>
                    <p className="nav-dropdown-email">{session?.email}</p>
                    {!hasActiveSubscription && !isAdmin && (
                      <span className="nav-dropdown-badge">No active plan</span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="nav-dropdown-body">
                    <Link
                      href={dashboardHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="nav-dropdown-item"
                    >
                      <LayoutDashboard style={{ width: '16px', height: '16px', color: '#b08d3e' }} />
                      {dashboardLabel}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="nav-dropdown-item nav-dropdown-logout"
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href={getLoginUrl()} className="nav-signin">Sign In</Link>
              <a href="/newhome#consultation" className="nav-cta">Book a Call</a>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="nav"><a href="/" className="nav-brand">Talexia</a></nav>}>
      <NavbarInner />
    </Suspense>
  );
}
