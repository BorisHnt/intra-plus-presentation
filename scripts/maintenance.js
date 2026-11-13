document.documentElement.classList.add('has-js');

const progressElements = document.querySelectorAll('[data-progress]');

const applyProgress = (element) => {
  const value = Math.max(0, Math.min(100, Number(element.dataset.progress) || 0));
  element.style.setProperty('--progress', `${value}%`);
  const progressbar = element.matches('[role="progressbar"]')
    ? element
    : element.querySelector('[role="progressbar"]');
  progressbar?.setAttribute('aria-valuenow', String(value));
};

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      applyProgress(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  progressElements.forEach((element) => observer.observe(element));
} else {
  progressElements.forEach(applyProgress);
}
