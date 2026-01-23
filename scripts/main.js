// ===============================
// JS READY FLAG (évite flash CSS)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-ready');

  const splash = document.getElementById('splash');
  const enterButton = document.getElementById('enter-btn');
  const mainContent = document.getElementById('main');
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const splashAlreadySeen = sessionStorage.getItem(
    'intraPlusSplashSeen'
  );

  // ===============================
  // Helpers
  // ===============================

  const revealMainContent = () => {
    document.body.classList.add('show-main');
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'false');
    }
  };

  const hideSplashInstantly = () => {
    if (!splash) return;
    splash.classList.add('is-hidden');
    splash.setAttribute('aria-hidden', 'true');
  };

  // ===============================
  // Splash logic
  // ===============================

  if (!splash || !enterButton || !mainContent) {
    // page sans splash (ou about)
    revealMainContent();
  } else if (splashAlreadySeen) {
    hideSplashInstantly();
    revealMainContent();
  } else if (prefersReducedMotion) {
    sessionStorage.setItem('intraPlusSplashSeen', 'true');
    hideSplashInstantly();
    revealMainContent();
  } else {
    enterButton.addEventListener('click', () => {
      if (document.body.classList.contains('is-transitioning')) return;

      sessionStorage.setItem('intraPlusSplashSeen', 'true');

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

  // ===============================
  // Reveal on scroll
  // ===============================

  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
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
      { threshold: 0.2 }
    );

    revealElements.forEach((el) =>
      revealObserver.observe(el)
    );
  }

  // ===============================
  // Cluster fade
  // ===============================

  const clusterFade = document.querySelector('[data-cluster-fade]');
  const clusterLayers = clusterFade
    ? Array.from(clusterFade.querySelectorAll('.cluster-shot'))
    : [];

  if (clusterLayers.length >= 2) {
    const clusterSources = [
      'pictures/screenshots/ClusterDemo001.png',
      'pictures/screenshots/ClusterDemo002.png',
      'pictures/screenshots/ClusterDemo003.png',
      'pictures/screenshots/ClusterDemo004.png',
      'pictures/screenshots/ClusterDemo005.png',
    ];

    clusterSources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const fadeDuration = prefersReducedMotion ? 0 : 250;
    const intervalDuration = 5000;

    let clusterIndex = 0;
    let activeLayer = 0;

    const swapClusterShot = () => {
      const nextIndex =
        (clusterIndex + 1) % clusterSources.length;

      const nextLayerIndex = activeLayer === 0 ? 1 : 0;

      const currentLayer = clusterLayers[activeLayer];
      const nextLayer = clusterLayers[nextLayerIndex];

      const activateNext = () => {
        nextLayer.classList.add('is-active');
        nextLayer.setAttribute('aria-hidden', 'false');

        const finalizeSwap = () => {
          currentLayer.classList.remove('is-active');
          currentLayer.setAttribute('aria-hidden', 'true');
          clusterIndex = nextIndex;
          activeLayer = nextLayerIndex;
        };

        if (fadeDuration === 0) {
          finalizeSwap();
          return;
        }

        setTimeout(finalizeSwap, fadeDuration);
      };

      nextLayer.src = clusterSources[nextIndex];

      if (nextLayer.complete) {
        activateNext();
      } else {
        const onLoad = () => {
          nextLayer.removeEventListener('load', onLoad);
          activateNext();
        };
        nextLayer.addEventListener('load', onLoad);
      }
    };

    setInterval(swapClusterShot, intervalDuration);
  }

  // ===============================
  // Reviews fade
  // ===============================

  const reviewFade = document.querySelector('[data-review-fade]');
  const reviewLayers = reviewFade
    ? Array.from(reviewFade.querySelectorAll('.review-shot'))
    : [];

  if (reviewLayers.length >= 2) {
    const reviewSources = [
      'pictures/screenshots/ReviewsGiven001.png',
      'pictures/screenshots/ReviewsReceived001.png',
      'pictures/screenshots/SameLevel001.png',
    ];

    reviewSources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const fadeDuration = prefersReducedMotion ? 0 : 250;
    const intervalDuration = 5000;

    let reviewIndex = 0;
    let activeLayer = 0;

    const swapReviewShot = () => {
      const nextIndex =
        (reviewIndex + 1) % reviewSources.length;

      const nextLayerIndex = activeLayer === 0 ? 1 : 0;

      const currentLayer = reviewLayers[activeLayer];
      const nextLayer = reviewLayers[nextLayerIndex];

      const activateNext = () => {
        nextLayer.classList.add('is-active');
        nextLayer.setAttribute('aria-hidden', 'false');

        const finalizeSwap = () => {
          currentLayer.classList.remove('is-active');
          currentLayer.setAttribute('aria-hidden', 'true');
          reviewIndex = nextIndex;
          activeLayer = nextLayerIndex;
        };

        if (fadeDuration === 0) {
          finalizeSwap();
          return;
        }

        setTimeout(finalizeSwap, fadeDuration);
      };

      nextLayer.src = reviewSources[nextIndex];

      if (nextLayer.complete) {
        activateNext();
      } else {
        const onLoad = () => {
          nextLayer.removeEventListener('load', onLoad);
          activateNext();
        };
        nextLayer.addEventListener('load', onLoad);
      }
    };

    setInterval(swapReviewShot, intervalDuration);
  }

  // ===============================
  // Parallax
  // ===============================

  const parallaxItems =
    document.querySelectorAll('[data-parallax]');

  if (!prefersReducedMotion && parallaxItems.length) {
    let ticking = false;

    const updateParallax = () => {
      const offset = window.scrollY;

      parallaxItems.forEach((item) => {
        const speed = Number(
          item.dataset.parallaxSpeed || 0.08
        );
        item.style.transform = `translateY(${
          offset * speed
        }px)`;
      });

      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateParallax();
  }

  // ===============================
  // Téléchargement bêta
  // ===============================

  const DL_SCRIPT_URL =
  'https://42-plus.boris-hanicotte.workers.dev/42-plus.user.js';

  document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-dl-beta]');
  if (!link) return;

  e.preventDefault();

  const username = prompt('Entre ton username 42 :');
  if (!username) return;

  const password = prompt('Mot de passe bêta :');
  if (!password) return;

  const url =
	DL_SCRIPT_URL +
	'?u=' +
	encodeURIComponent(username.trim()) +
	'&pw=' +
	encodeURIComponent(password);

  window.open(url, '_blank', 'noopener');
  });

  // ===============================
  // Popup User PW
  // ===============================

  document.addEventListener("DOMContentLoaded", () => {
	const popup = document.querySelector(".popup-overlay");
	const openBtns = document.querySelectorAll(".js-open-popup");
	const closeBtn = document.querySelector(".popup-close");

	if (!popup) return;

	function openPopup() {
	popup.style.display = "grid";
	requestAnimationFrame(() => {
		popup.classList.add("active");
	});
	}

	function closePopup() {
	popup.classList.remove("active");
	setTimeout(() => {
		popup.style.display = "none";
	}, 200);
	}

	openBtns.forEach(btn => {
		btn.addEventListener("click", e => {
		e.preventDefault();
		openPopup();
		});
	});

	closeBtn.addEventListener("click", closePopup);

	popup.addEventListener("click", e => {
		if (e.target === popup) closePopup();
	});
  });
});
