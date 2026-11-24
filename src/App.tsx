import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BentoSection } from './components/BentoSection';
import { MembershipPricing } from './components/MembershipPricing';
import { ContactFooter } from './components/ContactFooter';
import { Modal } from './components/Modal';
import { ResourcesModal } from './components/ResourcesModal';
import { EventsNewsModal } from './components/EventsNewsModal';
import { PolicyModal } from './components/PolicyModal';
import { MemberDashboardModal } from './components/MemberDashboardModal';
import { useLenis } from './hooks/useLenis';
import { useScrollReveal } from './hooks/useScrollReveal';
import { ModalState } from './types';

interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
}

export default function App() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    planChoice: 'individual',
    policyId: 'privacy',
    initialTab: 'events',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string>('');
  const [receiptResent, setReceiptResent] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(null);
  const [membershipNotification, setMembershipNotification] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const { scrollTo } = useLenis(modalState.isOpen);
  useScrollReveal();

  const triggerWelcomeEmail = async (targetEmail: string) => {
    try {
      const plan =
        localStorage.getItem('pending_checkout_plan') ||
        'Individual Membership ($290 CAD / year)';
      await fetch('/api/send-welcome-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, plan }),
      });
      setReceiptResent(true);
      setTimeout(() => setReceiptResent(false), 4000);
    } catch (e) {
      console.error('Failed to dispatch receipt:', e);
    }
  };

  // Directly verify and identify if a user has an active membership
  const checkAndIdentifyMembership = async (
    email: string,
    name?: string,
    autoOpenDashboard = true
  ): Promise<boolean> => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();

    let detectedPlan =
      localStorage.getItem('pending_checkout_plan') ||
      'Individual Membership ($290 CAD / year)';
    let detectedMemberId =
      localStorage.getItem('landlords_member_id') || 'BC-MEM-8421';
    let isIdentified = false;

    // 1. Check local registry
    try {
      const registry = JSON.parse(
        localStorage.getItem('landlords_members_registry') || '{}'
      );
      if (registry[cleanEmail] && registry[cleanEmail].status === 'active') {
        isIdentified = true;
        if (registry[cleanEmail].plan) detectedPlan = registry[cleanEmail].plan;
        if (registry[cleanEmail].memberId)
          detectedMemberId = registry[cleanEmail].memberId;
      }
    } catch (_) {}

    // 2. Host / Admin email is automatically recognized as an active member
    if (cleanEmail === 'reddysantosh1310@gmail.com') {
      isIdentified = true;
      detectedPlan = 'Property Manager Membership ($590 CAD / year)';
      detectedMemberId = 'BC-MEM-8421';
    }

    // 3. Check if current browser already had active membership
    if (localStorage.getItem('landlords_member') === 'true') {
      const pending = localStorage.getItem('pending_checkout_email');
      if (!pending || pending.toLowerCase() === cleanEmail) {
        isIdentified = true;
      }
    }

    // 4. Query server API
    try {
      const res = await fetch('/api/check-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isMember) {
          isIdentified = true;
          if (data.plan) detectedPlan = data.plan;
          if (data.memberId) detectedMemberId = data.memberId;
        }
      }
    } catch (_) {}

    if (isIdentified) {
      setIsMember(true);
      localStorage.setItem('landlords_member', 'true');
      localStorage.setItem('landlords_member_id', detectedMemberId);
      localStorage.setItem('pending_checkout_plan', detectedPlan);
      localStorage.setItem('pending_checkout_email', cleanEmail);

      // Save to local registry so it persists across sessions
      try {
        const registry = JSON.parse(
          localStorage.getItem('landlords_members_registry') || '{}'
        );
        registry[cleanEmail] = {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          plan: detectedPlan,
          memberId: detectedMemberId,
          status: 'active',
          lastVerified: new Date().toISOString(),
        };
        localStorage.setItem(
          'landlords_members_registry',
          JSON.stringify(registry)
        );
      } catch (_) {}

      setMembershipNotification({
        title: 'Active Membership Identified! ✓',
        message: `Welcome back, ${name || cleanEmail}! Your ${detectedPlan} is active.`,
      });
      setTimeout(() => setMembershipNotification(null), 6000);

      if (autoOpenDashboard) {
        setModalState({
          isOpen: true,
          type: 'member-dashboard',
        });
      }
      return true;
    }

    return false;
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isRealClientId =
      clientId &&
      !clientId.includes('your_google_client_id') &&
      clientId.includes('.apps.googleusercontent.com');

    if (isRealClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('Google prompt fallback:', err);
      }
    }

    // Interactive prompt fallback
    const promptEmail = window.prompt(
      'Sign in with Google:\nPlease enter your Google email address to verify membership:',
      googleUser?.email || 'reddysantosh1310@gmail.com'
    );

    if (promptEmail && promptEmail.includes('@')) {
      const cleanEmail = promptEmail.trim().toLowerCase();
      const derivedName = cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const user: GoogleUserProfile = {
        name: derivedName,
        email: cleanEmail,
      };
      setGoogleUser(user);
      localStorage.setItem('landlords_google_user', JSON.stringify(user));

      checkAndIdentifyMembership(cleanEmail, derivedName, true).then(
        (hasPlan) => {
          if (!hasPlan) {
            setModalState({
              isOpen: true,
              type: 'membership',
              planChoice: 'individual',
            });
          }
        }
      );
    }
  };

  useEffect(() => {
    // Check if user has active membership stored
    if (localStorage.getItem('landlords_member') === 'true') {
      setIsMember(true);
    }

    // Check stored Google account and identify membership on initial load
    const savedGoogle = localStorage.getItem('landlords_google_user');
    if (savedGoogle) {
      try {
        const parsed = JSON.parse(savedGoogle);
        if (parsed && parsed.email) {
          setGoogleUser(parsed);
          checkAndIdentifyMembership(parsed.email, parsed.name, false);
        }
      } catch (_) {}
    }

    // Initialize official Google Identity Services SDK
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isRealClientId =
      clientId &&
      !clientId.includes('your_google_client_id') &&
      clientId.includes('.apps.googleusercontent.com');

    if (isRealClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                const user: GoogleUserProfile = {
                  email: payload.email,
                  name: payload.name || payload.email.split('@')[0],
                  picture: payload.picture,
                };
                setGoogleUser(user);
                localStorage.setItem(
                  'landlords_google_user',
                  JSON.stringify(user)
                );

                // Instantly check and identify membership
                await checkAndIdentifyMembership(user.email, user.name, true);
              } catch (err) {
                console.error('Error parsing Google JWT', err);
              }
            }
          },
        });
      } catch (e) {
        console.warn('Google Identity check:', e);
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      setPaymentSuccess(true);
      setIsMember(true);
      localStorage.setItem('landlords_member', 'true');

      // Determine email to receive receipt
      const emailToSend =
        localStorage.getItem('pending_checkout_email') ||
        (() => {
          try {
            return JSON.parse(
              localStorage.getItem('landlords_google_user') || '{}'
            ).email;
          } catch (_) {
            return null;
          }
        })() ||
        'reddysantosh1310@gmail.com';

      const planName =
        localStorage.getItem('pending_checkout_plan') ||
        'Individual Membership ($290 CAD / year)';
      const memberId =
        localStorage.getItem('landlords_member_id') ||
        `BC-MEM-${Math.floor(1000 + Math.random() * 9000)}`;

      // Save to local registry
      try {
        const registry = JSON.parse(
          localStorage.getItem('landlords_members_registry') || '{}'
        );
        registry[emailToSend.toLowerCase()] = {
          email: emailToSend,
          plan: planName,
          memberId,
          status: 'active',
          joinedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          'landlords_members_registry',
          JSON.stringify(registry)
        );
      } catch (_) {}

      // Register with server
      fetch('/api/register-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend, plan: planName }),
      }).catch(() => {});

      setConfirmedEmail(emailToSend);
      triggerWelcomeEmail(emailToSend);

      // Clean up URL parameters without refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleNavigate = (target: string) => {
    scrollTo(target);
  };

  const handleOpenStory = (storyId: string) => {
    setModalState({
      isOpen: true,
      type: 'story',
      storyId,
    });
  };

  const handleOpenStorySubmit = () => {
    setModalState({
      isOpen: true,
      type: 'story-submit',
    });
  };

  const handleOpenMembership = (planChoice = 'individual') => {
    setModalState({
      isOpen: true,
      type: 'membership',
      planChoice,
    });
  };

  const handleOpenResources = () => {
    setModalState({
      isOpen: true,
      type: 'resources',
    });
  };

  const handleOpenEventsNews = (initialTab: 'events' | 'news' = 'events') => {
    setModalState({
      isOpen: true,
      type: 'events-news',
      initialTab,
    });
  };

  const handleOpenMemberDashboard = () => {
    setModalState({
      isOpen: true,
      type: 'member-dashboard',
    });
  };

  const handleOpenPolicy = (policyId: string) => {
    setModalState({
      isOpen: true,
      type: 'policy',
      policyId,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleSignOut = () => {
    localStorage.removeItem('landlords_member');
    localStorage.removeItem('landlords_google_user');
    setIsMember(false);
    setGoogleUser(null);
    handleCloseModal();
    setMembershipNotification({
      title: 'Signed Out',
      message: 'You have signed out of your Landlords BC member session.',
    });
    setTimeout(() => setMembershipNotification(null), 4000);
  };

  return (
    <>
      {membershipNotification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(30, 65, 40, 0.95)',
            backdropFilter: 'blur(16px)',
            color: '#f6f0e7',
            padding: '14px 26px',
            borderRadius: '999px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13.5px',
            fontWeight: 500,
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          <span style={{ color: '#9de8ab', fontWeight: 'bold' }}>✓</span>
          <span>{membershipNotification.message}</span>
          <button
            onClick={() => setMembershipNotification(null)}
            style={{
              background: 'transparent',
              border: 0,
              color: '#f6f0e7',
              cursor: 'pointer',
              marginLeft: '4px',
              fontSize: '15px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {paymentSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#2a1a12',
            color: '#f6f0e7',
            padding: '16px 28px',
            borderRadius: '999px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <span style={{ color: '#8cd49a', fontWeight: 'bold' }}>✓</span>
          <span>
            Payment Confirmed! Welcome to Landlords BC. Membership dossier dispatched to{' '}
            <strong>{confirmedEmail || 'your email'}</strong>.
          </span>
          <button
            type="button"
            onClick={() =>
              triggerWelcomeEmail(confirmedEmail || 'reddysantosh1310@gmail.com')
            }
            style={{
              background: '#3e6345',
              border: 'none',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {receiptResent ? 'Receipt Re-sent ✓' : 'Resend Email'}
          </button>
          <button
            onClick={() => setPaymentSuccess(false)}
            style={{
              background: 'transparent',
              border: 0,
              color: '#f6f0e7',
              cursor: 'pointer',
              marginLeft: '4px',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <Navbar
        onNavigate={handleNavigate}
        onOpenMembership={handleOpenMembership}
        onOpenResources={handleOpenResources}
        onOpenMemberDashboard={handleOpenMemberDashboard}
        isMember={isMember}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
      />

      <main>
        <Hero
          isMember={isMember}
          googleUser={googleUser}
          onOpenMemberDashboard={handleOpenMemberDashboard}
          onOpenMembership={handleOpenMembership}
        />
        <BentoSection
          onOpenStory={handleOpenStory}
          onSubmitStory={handleOpenStorySubmit}
          onOpenResources={handleOpenResources}
        />
        <MembershipPricing onSelectPlan={handleOpenMembership} />
      </main>

      <ContactFooter
        onNavigate={handleNavigate}
        onSubmitStory={handleOpenStorySubmit}
        onOpenResources={handleOpenResources}
        onOpenEventsNews={handleOpenEventsNews}
        onOpenPolicy={handleOpenPolicy}
      />

      {/* Core Hardship & Enrollment Modals */}
      <Modal
        modalState={modalState}
        onClose={handleCloseModal}
        isMember={isMember}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleDisconnect={() => {
          setGoogleUser(null);
          localStorage.removeItem('landlords_google_user');
        }}
        onOpenMemberDashboard={handleOpenMemberDashboard}
      />

      {/* Knowledge Base & Forms Catalogue Modal */}
      <ResourcesModal
        isOpen={modalState.isOpen && modalState.type === 'resources'}
        onClose={handleCloseModal}
        onSelectPlan={handleOpenMembership}
        isMember={isMember}
      />

      {/* Workshops, Briefings & News Modal */}
      <EventsNewsModal
        isOpen={modalState.isOpen && modalState.type === 'events-news'}
        onClose={handleCloseModal}
        initialTab={(modalState.initialTab as 'events' | 'news') || 'events'}
      />

      {/* Active Member Dashboard Vault */}
      <MemberDashboardModal
        isOpen={modalState.isOpen && modalState.type === 'member-dashboard'}
        onClose={handleCloseModal}
        onSignOut={handleSignOut}
      />

      {/* Legal & Statutory Policies Modal */}
      <PolicyModal
        isOpen={modalState.isOpen && modalState.type === 'policy'}
        policyId={modalState.policyId}
        onClose={handleCloseModal}
        onSelectPolicy={handleOpenPolicy}
      />
    </>
  );
}
