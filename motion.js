(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  let media;
  let introPlayed = false;
  function start() {
    if (media) return;
    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector('.edition-cover');
      if (!hero) return;
      if (!introPlayed && window.scrollY < 24) {
        gsap.from('.cover-type > *', { y: 12, opacity: .87, stagger: .07, duration: .7, ease: 'power3.out', clearProps: 'transform,opacity' });
        introPlayed = true;
      }
      gsap.fromTo('.city-window img', { scale: 1.075, yPercent: -2.5 }, {
        scale: 1.075, yPercent: 2.5, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(document.body);
      return () => observer.disconnect();
    });
  }
  window.addEventListener('pagehide', () => { media?.revert(); media = null; });
  window.addEventListener('pageshow', start);
  start();
})();
