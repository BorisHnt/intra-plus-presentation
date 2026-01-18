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
        tabs.forEach((item) => {
          item.classList.remove('is-active');
          if (item.hasAttribute('aria-pressed')) {
            item.setAttribute('aria-pressed', 'false');
          }
        });
        tab.classList.add('is-active');
        if (tab.hasAttribute('aria-pressed')) {
          tab.setAttribute('aria-pressed', 'true');
        }
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
      { month: 'Aou', minutes: 8139 },
      { month: 'Sep', minutes: 0 },
      { month: 'Oct', minutes: 0 },
      { month: 'Nov', minutes: 11867 },
      { month: 'Dec', minutes: 16059 },
      { month: 'Jan', minutes: 12064 },
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
    goalFill.style.width = '67.02%';
  }

  const heatmapGrid = document.querySelector('[data-heatmap-grid]');
  if (heatmapGrid) {
    const columns = 28;
    const rows = 7;
    const columnIntensity = [
      0, 1, 1, 2, 3, 2, 4, 3, 2, 1, 0, 1, 2, 3,
      4, 3, 2, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0,
    ];
    let cells = '';
    for (let col = 0; col < columns; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        const base = columnIntensity[col % columnIntensity.length];
        const offset = (row % 3) - 1;
        const level = Math.max(0, Math.min(4, base + offset));
        cells += `<span class="att-heatmap-cell level-${level}"></span>`;
      }
    }
    heatmapGrid.innerHTML = cells;
  }

  const weeklyChart = document.querySelector('[data-weekly-chart]');
  if (weeklyChart) {
    const weeklySamples = [
      { label: 'S-4', hours: 60 },
      { label: 'S-3', hours: 54 },
      { label: 'S-2', hours: 77 },
      { label: 'S. dernière', hours: 78 },
    ];
    const maxHours = Math.max(...weeklySamples.map((entry) => entry.hours), 1);
    const avgHours =
      weeklySamples.reduce((sum, entry) => sum + entry.hours, 0) / Math.max(weeklySamples.length, 1);
    const avgPct = Math.min(100, (avgHours / maxHours) * 100);

    const bars = weeklySamples
      .map((entry) => {
        const pct = Math.min(100, (entry.hours / maxHours) * 100);
        return `<div class="att-weekly-bar" style="height:${pct}%" data-label="${entry.label}">
          <span class="att-weekly-value">${Math.round(entry.hours)}h</span>
        </div>`;
      })
      .join('');

    weeklyChart.innerHTML = `<div class="att-weekly-avg" style="bottom:${avgPct.toFixed(2)}%;"></div>${bars}`;
  }

  const dailySamples = [
    { day: 1, minutes: 709 },
    { day: 2, minutes: 647 },
    { day: 3, minutes: 786 },
    { day: 4, minutes: 667 },
    { day: 5, minutes: 671 },
    { day: 6, minutes: 610 },
    { day: 7, minutes: 700 },
    { day: 8, minutes: 631 },
    { day: 9, minutes: 589 },
    { day: 10, minutes: 620 },
    { day: 11, minutes: 692 },
    { day: 12, minutes: 626 },
    { day: 13, minutes: 693 },
    { day: 14, minutes: 574 },
    { day: 15, minutes: 621 },
    { day: 16, minutes: 724 },
    { day: 17, minutes: 764 },
    { day: 18, minutes: 524 },
  ];

  const dailyChart = document.getElementById('iPlusAtt-daily-chart');
  if (dailyChart) {
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
    const avgMinutes =
      dailySamples.reduce((sum, entry) => sum + entry.minutes, 0) / Math.max(dailySamples.length, 1);
    meta.textContent = `Moyenne : ${formatMinutes(avgMinutes)} • Jours comptés : ${dailySamples.length}`;
  }
};

setupFeatureToggles();
setupFeatureActions();
setupGameTabs();
setupAttendanceDemo();
