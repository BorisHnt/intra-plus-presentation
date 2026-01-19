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

const clusterFade = document.querySelector('[data-cluster-fade]');
const clusterLayers = clusterFade ? Array.from(clusterFade.querySelectorAll('.cluster-shot')) : [];

if (clusterLayers.length >= 2) {
  const clusterSources = [
    'pictures/screenshots/ClusterDemo001.png',
    'pictures/screenshots/ClusterDemo002.png',
    'pictures/screenshots/ClusterDemo003.png',
    'pictures/screenshots/ClusterDemo004.png',
    'pictures/screenshots/ClusterDemo005.png',
  ];

  clusterSources.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  const fadeDuration = prefersReducedMotion ? 0 : 250;
  const intervalDuration = 5000;
  let clusterIndex = 0;
  let activeLayer = 0;

  const swapClusterShot = () => {
    const nextIndex = (clusterIndex + 1) % clusterSources.length;
    const nextLayerIndex = activeLayer === 0 ? 1 : 0;
    const nextLayer = clusterLayers[nextLayerIndex];
    const currentLayer = clusterLayers[activeLayer];

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

      window.setTimeout(finalizeSwap, fadeDuration);
    };

    nextLayer.src = clusterSources[nextIndex];

    if (nextLayer.complete) {
      activateNext();
      return;
    }

    const handleLoad = () => {
      nextLayer.removeEventListener('load', handleLoad);
      activateNext();
    };

    nextLayer.addEventListener('load', handleLoad);
  };

  window.setInterval(swapClusterShot, intervalDuration);
}

const parallaxItems = document.querySelectorAll('[data-parallax]');

if (!prefersReducedMotion && parallaxItems.length) {
  let ticking = false;

  const updateParallax = () => {
    const offset = window.scrollY;
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallaxSpeed || 0.08);
      item.style.transform = `translateY(${offset * speed}px)`;
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();
}
