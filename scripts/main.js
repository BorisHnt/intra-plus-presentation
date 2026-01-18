const splash = document.getElementById('splash');
const enterButton = document.getElementById('enter-btn');
const mainContent = document.getElementById('main');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealMainContent = () => {
  document.body.classList.add('show-main');
  mainContent.setAttribute('aria-hidden', 'false');
};

const hideSplashInstantly = () => {
  splash.classList.add('is-hidden');
  splash.setAttribute('aria-hidden', 'true');
};

if (prefersReducedMotion) {
  hideSplashInstantly();
  revealMainContent();
} else {
  enterButton.addEventListener('click', () => {
    if (document.body.classList.contains('is-transitioning')) {
      return;
    }

    document.body.classList.add('is-transitioning');
    splash.classList.add('is-exiting');

    const logoDuration = 600;
    const mainDuration = 800;

    window.setTimeout(() => {
      revealMainContent();
    }, logoDuration);

    window.setTimeout(() => {
      hideSplashInstantly();
      document.body.classList.remove('is-transitioning');
    }, logoDuration + mainDuration);
  });
}

// Scroll-triggered reveals
const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const setupFeatureToggles = () => {
  const toggles = document.querySelectorAll('[data-feature-toggle]');
  toggles.forEach((toggle) => {
    const card = toggle.closest('[data-feature-card]');
    if (!card) return;
    const className = `is-${toggle.dataset.featureToggle}`;
    const applyState = () => {
      card.classList.toggle(className, toggle.checked);
    };
    toggle.addEventListener('change', applyState);
    applyState();
  });
};

const setActionStatus = (card, message) => {
  const status = card.querySelector('[data-action-status]');
  if (status) {
    status.textContent = message;
  }
};

const setupFeatureActions = () => {
  const actionButtons = document.querySelectorAll('[data-feature-action]');
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('[data-feature-card]');
      if (!card) return;
      const action = button.dataset.featureAction;

      if (action === 'clearHighScores') {
        const scoreList = card.querySelector('[data-score-list]');
        if (scoreList) {
          scoreList.querySelectorAll('[data-score]').forEach((score) => {
            score.textContent = '0';
          });
        }
        setActionStatus(card, 'High scores supprimés');
      }

      if (action === 'clearCache' || action === 'refreshCache') {
        const avatarList = card.querySelector('[data-avatar-list]');
        if (!avatarList) return;
        if (!avatarList.dataset.defaultHtml) {
          avatarList.dataset.defaultHtml = avatarList.innerHTML;
        }

        if (action === 'clearCache') {
          avatarList.innerHTML = '<span class=\"avatar empty\">--</span>';
          setActionStatus(card, 'Cache vidé');
        } else {
          setActionStatus(card, 'Rafraîchissement...');
          window.setTimeout(() => {
            avatarList.innerHTML = avatarList.dataset.defaultHtml;
            setActionStatus(card, 'Cache prêt');
          }, 900);
        }
      }
    });
  });
};

const setupGameTabs = () => {
  const gameCards = document.querySelectorAll('[data-game-card]');
  gameCards.forEach((card) => {
    const tabs = card.querySelectorAll('[data-game-tab]');
    const screen = card.querySelector('[data-game-screen]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((item) => item.classList.remove('is-active'));
        tab.classList.add('is-active');
        if (screen) {
          screen.textContent = tab.dataset.gameLabel || tab.textContent;
        }
      });
    });
  });
};

setupFeatureToggles();
setupFeatureActions();
setupGameTabs();
