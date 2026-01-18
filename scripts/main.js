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
        const isTrombiGrid = avatarList.classList.contains('iPlusTrombi-grid');

        if (action === 'clearCache') {
          if (isTrombiGrid) {
            avatarList.innerHTML = `
              <div class="iPlusTrombi-empty">
                <div class="iPlusTrombi-empty-title">Cache vide</div>
                <div class="iPlusTrombi-empty-copy">Aucun profil enregistré pour le moment.</div>
              </div>
            `;
          } else {
            avatarList.innerHTML = '<span class="avatar empty">--</span>';
          }
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

const formatMinutes = (totalMinutes) => {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes)) return '-';
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded - hours * 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

const renderSparkline = (target, points) => {
  target.innerHTML = '';
  if (!points.length) return;

  const width = Math.max(260, points.length * 110);
  const height = 140;
  const margin = 25;
  const bottom = 38;
  const values = points.map((point) => point.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const step = points.length > 1 ? (width - margin * 2) / (points.length - 1) : 0;

  const svgPoints = points.map((point, index) => {
    const x = margin + step * index;
    const y = height - bottom - ((point.value - min) / span) * (height - bottom - margin);
    return { x, y, month: point.month, label: point.label };
  });

  const gradientId = `iplus-att-grad-${Math.random().toString(36).slice(2, 7)}`;
  const fromColor = '#f370b2';
  const toColor = '#ae9df5';

  const linePath = svgPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');

  const areaPath = [
    `M${svgPoints[0].x.toFixed(1)},${height - bottom}`,
    ...svgPoints.map((point) => `L${point.x.toFixed(1)},${point.y.toFixed(1)}`),
    `L${svgPoints[svgPoints.length - 1].x.toFixed(1)},${height - bottom}`,
    'Z',
  ].join(' ');

  const axisLine = `M${margin},${height - bottom} L${width - margin},${height - bottom}`;

  target.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${fromColor}" stop-opacity="0.2"></stop>
          <stop offset="100%" stop-color="${toColor}" stop-opacity="0.2"></stop>
        </linearGradient>
      </defs>
      <path d="${axisLine}" stroke="var(--tertiary-border, #d3d3d3)" stroke-width="1" fill="none"></path>
      <path d="${areaPath}" fill="url(#${gradientId})" stroke="none"></path>
      <path d="${linePath}" fill="none" stroke="${fromColor}" stroke-width="2" stroke-linecap="round"></path>
      ${svgPoints
        .map(
          (point) =>
            `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(
              1,
            )}" r="3.4" fill="#fff" stroke="${fromColor}" stroke-width="1.5"></circle>`
        )
        .join('')}
      ${svgPoints
        .map(
          (point) =>
            `<text x="${point.x.toFixed(1)}" y="${height - 18}" text-anchor="middle" font-size="11" fill="#fff">${point.month}</text>
             <text x="${point.x.toFixed(1)}" y="${height - 4}" text-anchor="middle" font-size="11" fill="#fff">${point.label}</text>`
        )
        .join('')}
    </svg>
  `;
};

const setupAttendanceDemo = () => {
  const monthlyChart = document.querySelector('#iPlusAtt-monthly .iPlusAttMonthly-chart');
  if (monthlyChart) {
    const months = [
      { month: 'Mai', minutes: 7200 },
      { month: 'Jun', minutes: 6840 },
      { month: 'Jul', minutes: 7580 },
      { month: 'Aou', minutes: 6420 },
      { month: 'Sep', minutes: 7920 },
      { month: 'Oct', minutes: 7020 },
    ];
    const points = months.map((entry) => ({
      month: entry.month,
      value: entry.minutes,
      label: formatMinutes(entry.minutes),
    }));
    renderSparkline(monthlyChart, points);
  }

  const goalFill = document.querySelector('#iPlusAtt-goal .iPlusAttGoal-fill');
  if (goalFill) {
    goalFill.style.width = '68.9%';
  }

  const dailyChart = document.getElementById('iPlusAtt-daily-chart');
  if (dailyChart) {
    const dailySamples = [
      { day: 1, minutes: 360 },
      { day: 2, minutes: 420 },
      { day: 3, minutes: 300 },
      { day: 4, minutes: 480 },
      { day: 5, minutes: 390 },
      { day: 6, minutes: 0 },
      { day: 7, minutes: 510 },
      { day: 8, minutes: 450 },
      { day: 9, minutes: 420 },
      { day: 10, minutes: 360 },
      { day: 11, minutes: 300 },
      { day: 12, minutes: 540 },
      { day: 13, minutes: 360 },
      { day: 14, minutes: 420 },
      { day: 15, minutes: 480 },
      { day: 16, minutes: 240 },
      { day: 17, minutes: 390 },
      { day: 18, minutes: 450 },
    ];
    const maxMinutes = Math.max(...dailySamples.map((entry) => entry.minutes), 1);
    const avgMinutes =
      dailySamples.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(dailySamples.length, 1);
    const avgPct = Math.min(100, (avgMinutes / maxMinutes) * 100);

    const bars = dailySamples
      .map((entry) => {
        const pct = Math.min(100, (entry.minutes / maxMinutes) * 100);
        return `<div class="iPlusAttDaily-bar" style="height:${pct}%" data-label="${entry.day}"><span>${formatMinutes(
          entry.minutes
        )}</span></div>`;
      })
      .join('');

    dailyChart.innerHTML = `
      <div class="iPlusAttDaily-bars">
        <div class="iPlusAttDaily-avg" style="bottom:${avgPct.toFixed(2)}%;"></div>
        ${bars}
      </div>
    `;
  }

  const meta = document.getElementById('iPlusAtt-daily-meta');
  if (meta) {
    meta.textContent = 'Moyenne : 6h 12m • Jours comptés : 18';
  }
};

setupFeatureToggles();
setupFeatureActions();
setupGameTabs();
setupAttendanceDemo();
