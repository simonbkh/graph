import { formatBytes, showNotification } from '../static/notif.js';
import { loginn } from './login.js';

// Debounce function to limit resize event calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export async function fetchUserData() {
  const query = `{
    user {
      login
      firstName
      lastName
      email
      createdAt
      auditRatio
      totalUp
      totalDown
    }
    level: transaction(
      where: {type: {_eq: "level"}, event: {object: {name: {_eq: "Module"}}}}
      order_by: { createdAt: desc}
      limit: 1
    ) {
      amount
      type
    }
    skillsTransactions: transaction(
      where: {type: {_regex: "^skill_"}}
      order_by: [{type: asc}, {createdAt: desc}]
      distinct_on: type
    ) {
      type
      amount
    }
    xpTRa: transaction(
      where: {
        type: { _regex: "^xp" },
        eventId: { _eq: 41 }
      }
    ) {
      amount
      type
      eventId
      createdAt
    }
    pro: progress(where:{eventId : {_eq : 41},object:{type:{_eq : "project"}}}){
      object {
        name
      }
      isDone
      createdAt
    }
  }`;

  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Session expired. Please log in.', 'error');
    loginn();
    return;
  }

  try {
    const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    if (result.errors || !result.data) {
      throw new Error('Failed to fetch user data');
    }

    const userData = result.data.user[0] || {
      login: 'N/A',
      firstName: 'N/A',
      lastName: '',
      email: 'N/A',
      createdAt: new Date().toISOString(),
      auditRatio: 0,
      totalUp: 0,
      totalDown: 0,
    };

    const projectStats = (result.data.pro || []).reduce(
      (acc, item) => ({
        completed: item.isDone ? acc.completed + 1 : acc.completed,
        uncompleted: !item.isDone ? acc.uncompleted + 1 : acc.uncompleted,
      }),
      { completed: 0, uncompleted: 0 }
    );

    document.getElementById('project-completed').textContent = projectStats.completed;
    document.getElementById('project-uncompleted').textContent = projectStats.uncompleted;

    document.getElementById('username').textContent = userData.login;
    document.getElementById('email').textContent = userData.email;
    document.getElementById('fullname').textContent = `${userData.firstName} ${userData.lastName}`.trim() || 'N/A';
    document.getElementById('created-at').textContent = userData.createdAt
      ? new Date(userData.createdAt).toLocaleDateString()
      : 'N/A';
    document.getElementById('audit-ratio').textContent = userData.auditRatio.toFixed(2) || '0.00';
    document.getElementById('total-up').textContent = formatBytes(userData.totalUp);
    document.getElementById('total-down').textContent = formatBytes(userData.totalDown);

    const totalXP = (result.data.xpTRa || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);
    document.getElementById('total-xp').textContent = formatBytes(totalXP || 0);

    // Render visualizations
    renderLevelSVG(result.data.level?.[0] || { amount: 0 });
    renderSkillsSVG(result.data.skillsTransactions || []);
    renderXPGraph(result.data.xpTRa || []);

    // Store data for resize re-rendering
    window.graphData = {
      level: result.data.level?.[0] || { amount: 0 },
      skills: result.data.skillsTransactions || [],
      xp: result.data.xpTRa || [],
    };

  } catch (error) {
    showNotification('Error fetching data. Logging out.', 'error');
    localStorage.removeItem('token');
    const graph = document.querySelector('.graph');
    if (graph) graph.remove();
    loginn();
  }

  function renderLevelSVG(levelData) {
    const container = document.getElementById('level-container') || createLevelContainer();
    if (!container) return;

    const containerWidth = container.offsetWidth || 360;
    const baseWidth = 360;
    const scale = containerWidth / baseWidth;
    const width = containerWidth;
    const height = 120 * scale;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${baseWidth} ${120}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'level-svg');

    const level = levelData.amount || 0;
    const currentLevel = Math.floor(level);
    const circumference = 2 * Math.PI * 40;
    const progress = level % 1;
    const strokeDashoffset = circumference * (1 - progress);

    svg.innerHTML = `
      <defs>
        <linearGradient id="level-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#5A3FFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6B46C1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="40" fill="none" stroke="#2d3748" stroke-width="8"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke="url(#level-gradient)" stroke-width="8" 
              stroke-linecap="round" stroke-dasharray="${circumference}" 
              stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 60 60)">
        <animate attributeName="stroke-dashoffset" from="${circumference}" to="${strokeDashoffset}" 
                 dur="1s" fill="freeze"/>
      </circle>
      <text x="60" y="67" text-anchor="middle" fill="var(--text-color)" font-size="20" font-weight="bold">
        ${currentLevel}
      </text>
    `;

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function createLevelContainer() {
    const levelSection = document.getElementById('audit-analytics') || document.createElement('section');
    levelSection.className = 'card';
    levelSection.id = 'audit-analytics';

    const container = document.createElement('div');
    container.id = 'level-container';
    container.className = 'level-container';
    levelSection.appendChild(container);

    if (!document.getElementById('audit-analytics')) {
      document.querySelector('.dashboard').prepend(levelSection);
    }

    return container;
  }

  function renderSkillsSVG(skillsData) {
    const container = document.getElementById('skills-list');
    if (!container) return;

    const containerWidth = container.offsetWidth || 600;
    const baseWidth = 600;
    const scale = containerWidth / baseWidth;
    const skillHeight = 60 * scale;
    const skillSpacing = 20 * scale;
    const width = containerWidth;
    const height = (skillHeight + skillSpacing) * (skillsData.length || 1);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${baseWidth} ${(60 + 20) * (skillsData.length || 1)}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'skills-svg');

    let skillElements = '';
    if (!skillsData.length) {
      skillElements = `
        <text x="${baseWidth / 2}" y="${(60 + 20) / 2}" text-anchor="middle" fill="var(--text-secondary)" font-size="18">
          No skills data available
        </text>
      `;
    } else {
      skillsData.forEach((skill, index) => {
        const trim = skill.type?.replace('skill_', '') || 'Unknown';
        const amount = skill.amount || 0;
        const y = index * (60 + 20);
        const barWidth = baseWidth - 250;
        const fillWidth = (barWidth * amount) / 100;

        const skillColor =
          amount >= 70 ? 'var(--success-color)' : amount >= 40 ? '#FBBF24' : 'var(--error-color)';

        skillElements += `
          <rect x="0" y="${y}" width="${baseWidth}" height="60" fill="var(--secondary-bg)" rx="8"/>
          <text x="25" y="${y + 25}" fill="var(--text-color)" font-size="16" font-weight="500">
            ${trim.charAt(0).toUpperCase() + trim.slice(1)}
          </text>
          <rect x="25" y="${y + 35}" width="${barWidth}" height="10" rx="5" fill="#2d3748"/>
          <rect x="25" y="${y + 35}" width="${fillWidth}" height="10" rx="5" fill="${skillColor}">
            <animate attributeName="width" from="0" to="${fillWidth}" dur="0.6s" begin="${index * 0.2}s"/>
          </rect>
          <text x="${baseWidth - 25}" y="${y + 25}" text-anchor="end" fill="var(--text-secondary)" font-size="14">
            ${amount}%
          </text>
        `;
      });
    }

    svg.innerHTML = skillElements;
    container.innerHTML = '';
    container.appendChild(svg);
  }

  function renderXPGraph(xpData) {
    const container = document.querySelector('#xp-progress .progress-bar');
    if (!container) return;

    const containerWidth = container.offsetWidth || 800;
    const baseWidth = 800;
    const scale = containerWidth / baseWidth;
    const width = containerWidth;
    const height = 400 * scale;
    const padding = { top: 50 * scale, right: 60 * scale, bottom: 80 * scale, left: 100 * scale };

    const graphWidth = baseWidth - padding.left - padding.right;
    const graphHeight = 400 - padding.top - padding.bottom;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${baseWidth} 400`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    if (!xpData || xpData.length === 0) {
      svg.innerHTML = `
        <text x="${baseWidth / 2}" y="200" text-anchor="middle" fill="var(--text-secondary)" font-size="18">
          No XP data available
        </text>
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${400 - padding.bottom}" stroke="var(--text-secondary)" stroke-width="1.5"/>
        <line x1="${padding.left}" y1="${400 - padding.bottom}" x2="${baseWidth - padding.right}" y2="${400 - padding.bottom}" stroke="var(--text-secondary)" stroke-width="1.5"/>
      `;
      container.innerHTML = '';
      container.appendChild(svg);
      return;
    }

    const sortedData = [...xpData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let total = 0;
    const points = sortedData.map((d) => {
      total += d.amount || 0;
      return { xp: total, date: new Date(d.createdAt) };
    });

    const maxXP = Math.max(...points.map((p) => p.xp), 1);
    const xScale = points.length > 1 ? graphWidth / (points.length - 1) : graphWidth;
    const yScale = graphHeight / maxXP;

    const pathData = points
      .map((point, i) => {
        const x = padding.left + i * xScale;
        const y = 400 - padding.bottom - point.xp * yScale;
        return i === 0 ? `M${x},${y}` : `L${x},${y}`;
      })
      .join('');

    const areaData = `${pathData} L${padding.left + (points.length - 1) * xScale},${400 - padding.bottom} L${padding.left},${400 - padding.bottom} Z`;

    function createSmartMonthLabels() {
      const monthLabels = [];
      let currentMonth = -1;
      const minLabelDistance = 100;
      let lastLabelX = -minLabelDistance;

      points.forEach((point, i) => {
        const month = point.date.getMonth();
        const year = point.date.getFullYear();
        const x = padding.left + i * xScale;

        if (month !== currentMonth && (x - lastLabelX) >= minLabelDistance) {
          currentMonth = month;
          const monthName = point.date.toLocaleString('default', { month: 'short' });
          const label = month === 0 || (monthLabels.length > 0 && 
            new Date(points[0].date).getFullYear() !== year)
            ? `${monthName} ${year.toString().slice(-2)}`
            : monthName;
          monthLabels.push({ x, label });
          lastLabelX = x;
        }
      });

      return monthLabels;
    }

    const monthLabels = createSmartMonthLabels();

    const yLabels = [];
    const yTickCount = 6;
    for (let i = 0; i <= yTickCount; i++) {
      const value = (maxXP / yTickCount) * i;
      const y = 400 - padding.bottom - value * yScale;
      yLabels.push({ y, label: formatBytes(value) });
    }

    svg.innerHTML = `
      <defs>
        <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#6B46C1;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#6B46C1;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      ${yLabels
        .map(
          (label) =>
            `<line x1="${padding.left}" y1="${label.y}" x2="${baseWidth - padding.right}" y2="${label.y}" stroke="#2d3748" stroke-width="1.5" stroke-dasharray="4"/>`
        )
        .join('')}
      ${yLabels
        .map(
          (label) =>
            `<text x="${padding.left - 20}" y="${label.y + 5}" text-anchor="end" fill="var(--text-color)" font-size="16" font-weight="500">${label.label}</text>`
        )
        .join('')}
      ${monthLabels
        .map(
          (label) =>
            `<text x="${label.x}" y="${400 - padding.bottom + 40}" text-anchor="middle" fill="var(--text-color)" font-size="14">${label.label}</text>`
        )
        .join('')}
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${400 - padding.bottom}" stroke="var(--text-secondary)" stroke-width="1.5"/>
      <line x1="${padding.left}" y1="${400 - padding.bottom}" x2="${baseWidth - padding.right}" y2="${400 - padding.bottom}" stroke="var(--text-secondary)" stroke-width="1.5"/>
      <path d="${areaData}" fill="url(#xp-gradient)" stroke="none"/>
      <path d="${pathData}" stroke="var(--accent-color)" stroke-width="3" fill="none"/>
      ${points
        .map((point, i) => {
          const x = padding.left + i * xScale;
          const y = 400 - padding.bottom - point.xp * yScale;
          return `<circle cx="${x}" cy="${y}" r="5" fill="var(--text-color)" stroke="var(--accent-color)" stroke-width="2"/>`;
        })
        .join('')}
    `;

    container.innerHTML = '';
    container.appendChild(svg);
  }

  // Debounced resize handler
  const handleResize = debounce(() => {
    if (window.graphData) {
      renderLevelSVG(window.graphData.level);
      renderSkillsSVG(window.graphData.skills);
      renderXPGraph(window.graphData.xp);
    }
  }, 200);

  window.addEventListener('resize', handleResize);
}