document.documentElement.classList.add('has-js');

const moduleCards = [...document.querySelectorAll('.module-card[data-progress]')];
const overallProgress = document.querySelector('[data-overall-progress]');
const overallValue = document.querySelector('[data-overall-value]');
const moduleValues = moduleCards.map((card) => Number(card.dataset.progress) || 0);
const calculatedOverall = moduleValues.length
  ? Math.round(moduleValues.reduce((sum, value) => sum + value, 0) / moduleValues.length)
  : 0;

if (overallProgress) overallProgress.dataset.progress = String(calculatedOverall);
if (overallProgress) overallProgress.setAttribute('aria-valuenow', String(calculatedOverall));
if (overallValue) overallValue.textContent = String(calculatedOverall);

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

const complaintButton = document.querySelector('#complaint-button');
const complaintTooltip = document.querySelector('#complaint-tooltip');
const complaintMessage = document.querySelector('[data-complaint-message]');
const donationModal = document.querySelector('#donation-modal');
const donationDialog = donationModal?.querySelector('.donation-dialog');
const paypalLink = donationModal?.querySelector('[data-paypal-link]');
const paypalNote = donationModal?.querySelector('[data-paypal-note]');
let complaintCount = 0;
let tooltipTimer;

const messages = [
  { threshold: 7, text: 'Le bouton commence à envisager un arrêt maladie.' },
  { threshold: 4, text: 'Tu sais que cliquer ne compile pas plus vite ?' },
  { threshold: 1, text: 'MDR' }
];

const showTooltip = (message) => {
  if (!complaintTooltip || !complaintMessage) return;
  window.clearTimeout(tooltipTimer);
  complaintMessage.textContent = message;
  complaintTooltip.setAttribute('aria-hidden', 'false');
  complaintTooltip.classList.remove('is-visible');
  requestAnimationFrame(() => complaintTooltip.classList.add('is-visible'));
  tooltipTimer = window.setTimeout(() => {
    complaintTooltip.classList.remove('is-visible');
    complaintTooltip.setAttribute('aria-hidden', 'true');
  }, 2600);
};

const closeModal = () => {
  if (!donationModal) return;
  donationModal.classList.remove('is-open');
  donationModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-modal');
  complaintButton?.focus();
};

const openModal = () => {
  if (!donationModal) return;
  const paypalUrl = donationModal.dataset.paypalUrl?.trim();
  if (paypalUrl && paypalLink) {
    paypalLink.href = paypalUrl;
    paypalLink.removeAttribute('aria-disabled');
    paypalLink.classList.remove('is-disabled');
    if (paypalNote) paypalNote.textContent = 'Merci pour le carburant. Promis, aucun pourcentage magique ne sera inventé.';
  } else if (paypalLink) {
    paypalLink.removeAttribute('href');
    paypalLink.setAttribute('aria-disabled', 'true');
    paypalLink.classList.add('is-disabled');
  }
  donationModal.classList.add('is-open');
  donationModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-modal');
  requestAnimationFrame(() => donationDialog?.focus());
};

complaintButton?.addEventListener('click', () => {
  complaintCount += 1;
  complaintButton.classList.remove('is-pressed');
  requestAnimationFrame(() => complaintButton.classList.add('is-pressed'));
  window.setTimeout(() => complaintButton.classList.remove('is-pressed'), 220);
  const currentMessage = messages.find(({ threshold }) => complaintCount >= threshold)?.text || 'MDR';
  showTooltip(currentMessage);
  if (complaintCount >= 10) openModal();
});

donationModal?.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && donationModal?.classList.contains('is-open')) closeModal();
});
