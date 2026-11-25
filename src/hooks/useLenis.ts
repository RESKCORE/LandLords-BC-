import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function useLenis(isModalOpen: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 900 || window.matchMedia('(pointer: coarse)').matches;
    // On mobile and touch devices, native 120Hz smooth momentum scroll is superior and prevents touch lag
    if (prefersReducedMotion || isMobile) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    const nav = document.getElementById('nav');
    const hand = document.getElementById('hand-img');
    const stage = document.getElementById('stage');

    let stageTop = 0;
    let stageHeight = 1;
    let winH = window.innerHeight;
    let isNavScrolled = false;

    const measureGeometry = () => {
      winH = window.innerHeight;
      if (stage) {
        const r = stage.getBoundingClientRect();
        stageTop = r.top + window.scrollY;
        stageHeight = Math.max(1, r.height);
      }
    };

    measureGeometry();
    window.addEventListener('resize', measureGeometry, { passive: true });
    window.addEventListener('load', measureGeometry);

    const onScroll = (scrollPos: number | unknown) => {
      const y = typeof scrollPos === 'number' ? scrollPos : window.scrollY;
      const nextScrolled = y > 20;
      if (nextScrolled !== isNavScrolled && nav) {
        isNavScrolled = nextScrolled;
        nav.classList.toggle('scrolled', isNavScrolled);
      }
      if (hand && stage) {
        const rTop = stageTop - y;
        if (rTop < winH && rTop > -stageHeight) {
          const p = Math.min(1, Math.max(0, (winH - rTop) / (winH + stageHeight)));
          hand.style.transform = `translate3d(0, ${(-p * 12).toFixed(2)}%, 0)`;
        }
      }
    };

    lenis.on('scroll', (e: { scroll: number }) => onScroll(e.scroll));

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Initial check
    onScroll(window.scrollY);

    return () => {
      window.removeEventListener('resize', measureGeometry);
      window.removeEventListener('load', measureGeometry);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle modal pause/resume
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isModalOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isModalOpen]);

  const scrollTo = (target: string | HTMLElement, offset = -70) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset, duration: 1.2 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return { lenis: lenisRef.current, scrollTo };
}

