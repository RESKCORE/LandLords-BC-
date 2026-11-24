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

  useEffect(() => {
    // Check if user has active membership stored
    if (localStorage.getItem('landlords_member') === 'true') {
      setIsMember(true);
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
    handleCloseModal();
    alert('You have signed out of your Landlords BC member session.');
  };

  return (
    <>
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
      />

      <main>
        <Hero />
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
      <Modal modalState={modalState} onClose={handleCloseModal} />

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
