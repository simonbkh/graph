
import { formatBytes, showNotification } from "../static/notif.js"
import { loginn } from "./login.js"

export async function fetchUserData() {
  const query = ` {
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
    ){
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
  }`

  const token = localStorage.getItem("token")

  const response = await fetch(
    "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: query }),
    }
  )

  const result = await response.json()

  if (result.errors) {
    showNotification("Error During Fetching Data", "error")
    localStorage.removeItem("token")
    const grp = document.getElementsByClassName("graph")[0]
    grp.remove()
    loginn()
  }

  let countfalse = 0
  let counttrue = 0
  result.data.pro.forEach(item => {
    if (item.isDone === false) {
      countfalse++
    } else {
      counttrue++
    }
  })

  document.getElementById("project-completed").textContent = counttrue
  document.getElementById("project-uncompleted").textContent = countfalse

  document.getElementById("username").textContent = result.data.user[0].login
  document.getElementById("email").textContent = result.data.user[0].email
  document.getElementById("fullname").textContent =
    result.data.user[0].firstName + " " + result.data.user[0].lastName
  document.getElementById("created-at").textContent =
    new Date(result.data.user[0].createdAt).toDateString()

  document.getElementById("audit-ratio").textContent =
    result.data.user[0].auditRatio.toFixed(2)
  document.getElementById("total-up").textContent = formatBytes(
    result.data.user[0].totalUp
  )
  document.getElementById("total-down").textContent = formatBytes(
    result.data.user[0].totalDown
  )

  const totalXP = result.data.xpTRa.reduce((sum, tx) => sum + tx.amount, 0)
  document.getElementById("total-xp").textContent = formatBytes(totalXP)

  // Render Level SVG
  renderLevelSVG(result.data.level[0])
  
  // Render Skills SVG
  renderSkillsSVG(result.data.skillsTransactions)

  function util(){
    const data = [...result.data.xpTRa].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    let total = 0
    const points = data.map(d => {
      total += d.amount
      return {
        xp: total,
        date: new Date(d.createdAt)
      }
    })
    return { data, points}
  }

  function renderLevelSVG(levelData) {
    let container = document.getElementById("level-container")
    
    if (!container) {
      const levelSection = document.getElementById("level-section")
      if (levelSection) {
        container = document.createElement("div")
        container.id = "level-container"
        container.className = "level-container"
        levelSection.appendChild(container)
      } else {
        const dashboard = document.querySelector(".dashboard")
        if (dashboard) {
          const levelSection = document.createElement("div")
          levelSection.id = "level-section"
          levelSection.className = "card" 
          
          const levelTitle = document.createElement("h2")
          levelTitle.textContent = "Current Level"
          levelSection.appendChild(levelTitle)
          
          container = document.createElement("div")
          container.id = "level-container"
          container.className = "level-container"
          levelSection.appendChild(container)
          
          dashboard.append(levelSection, dashboard.firstChild)
          
        }
      }
    }
    
    if (!container) {
      console.error("Could not create level container")
      return
    }

    const width = 300
    const height = 80
    const level = levelData.amount

    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", width)
    svg.setAttribute("height", height)
    svg.setAttribute("class", "level-svg")

    const currentLevel = Math.floor(level)
    const circumference = 2 * Math.PI * 30 
    const strokeDasharray = circumference
    svg.innerHTML = `
      <defs>
        <linearGradient id="level-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="level-bg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4B5563;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="40" cy="40" r="30" fill="none" stroke="#374151" stroke-width="4"/>
      
      <!-- Progress circle -->
      <circle cx="40" cy="40" r="30" fill="none" 
        stroke="url(#level-gradient)" 
        stroke-width="4" 
        stroke-linecap="round"
        stroke-dasharray="${strokeDasharray}"
        transform="rotate(-90 40 40)">
        <animate attributeName="stroke-dashoffset" 
          from="${circumference}" 
          dur="2s" 
          begin="0.5s"/>
      </circle>
      
      <!-- Level number -->
      <text x="40" y="45" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="bold">
        ${currentLevel}
      </text>

    `

    container.innerHTML = ""
    container.appendChild(svg)
  }

  function renderSkillsSVG(skillsData) {
    const container = document.getElementById("skills-list") // Your existing skills container
    const skillHeight = 40
    const skillSpacing = 10
    const width = container.offsetWidth || 400
    const height = (skillHeight + skillSpacing) * skillsData.length
    
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", width)
    svg.setAttribute("height", height)
    svg.setAttribute("class", "skills-svg")

    let skillElements = ""
    
    skillsData.forEach((skill, index) => {
      const trim = skill.type.replace('skill_', "")
      const y = index * (skillHeight + skillSpacing)
      const barWidth = width - 200 // Reserve space for label and percentage
      const fillWidth = (barWidth * skill.amount) / 100
      
      // Skill color based on percentage
      let skillColor = "#EF4444" // Red for low skills
      if (skill.amount >= 70) skillColor = "#10B981" // Green for high skills
      else if (skill.amount >= 40) skillColor = "#F59E0B" // Yellow for medium skills

      skillElements += `
        <!-- Skill background -->
        <rect x="0" y="${y}" width="${width}" height="${skillHeight}" 
          fill="#1F2937" rx="8" stroke="#374151" stroke-width="1"/>
        
        <!-- Skill label -->
        <text x="15" y="${y + 15}" fill="#FFFFFF" font-size="14" font-weight="500">
          ${trim.charAt(0).toUpperCase() + trim.slice(1)}
        </text>
        
        <!-- Progress bar background -->
        <rect x="15" y="${y + 22}" width="${barWidth}" height="6" rx="3" fill="#374151"/>
        
        <!-- Progress bar fill -->
        <rect x="15" y="${y + 22}" width="${fillWidth}" height="6" rx="3" fill="${skillColor}">
          <animate attributeName="width" from="0" to="${fillWidth}" dur="1s" begin="${index * 0.1}s"/>
        </rect>
        
        <!-- Percentage text -->
        <text x="${width - 15}" y="${y + 15}" text-anchor="end" fill="#A799FF" font-size="12" font-weight="600">
          ${skill.amount}%
        </text>
        
        <!-- Skill level indicator -->
        <circle cx="${15 + fillWidth}" cy="${y + 25}" r="3" fill="${skillColor}">
          <animate attributeName="r" from="0" to="3" dur="0.5s" begin="${index * 0.1 + 1}s"/>
        </circle>
      `
    })

    svg.innerHTML = `
      <defs>
        <linearGradient id="skill-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#A799FF;stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:#A799FF;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#A799FF;stop-opacity:0.3" />
        </linearGradient>
      </defs>
      
      ${skillElements}
    `

    container.innerHTML = ""
    container.appendChild(svg)
  }

  function renderXPGraph() {
    const res = util()
    
    const container = document.querySelector("#xp-progress .progress-barr")
    const width = container.offsetWidth
    const height = 180
    const padding = { top: 20, right: 30, bottom: 50, left: 80 }

    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    const maxXP = Math.max(...res.points.map(p => p.xp))
    const xScale = graphWidth / (res.points.length - 1 || 1)
    const yScale = graphHeight / (maxXP || 1)

    // Generate path data
    const pathData = res.points.map((point, i) => {
      const x = padding.left + i * xScale
      const y = height - padding.bottom - point.xp * yScale
      return i === 0 ? `M${x},${y}` : `L${x},${y}`
    }).join(" ")

    const areaData = pathData + ` L${padding.left + (res.points.length - 1) * xScale},${height - padding.bottom} L${padding.left},${height - padding.bottom} Z`

    // Smart Month Label Spacing
    function createSmartMonthLabels() {
      const monthLabels = []
      let currentMonth = -1
      const minLabelDistance = 60
      let lastLabelX = -minLabelDistance
      
      res.points.forEach((point, i) => {
        const month = point.date.getMonth()
        const year = point.date.getFullYear()
        const x = padding.left + i * xScale
        
        if (month !== currentMonth && (x - lastLabelX) >= minLabelDistance) {
          currentMonth = month
          const monthName = point.date.toLocaleString('default', { month: 'short' })
          
          const label = month === 0 || (monthLabels.length > 0 && 
            new Date(res.points[0].date).getFullYear() !== year) 
            ? `${monthName} ${year.toString().slice(-2)}` 
            : monthName
          
          monthLabels.push({ x, label })
          lastLabelX = x
        }
      })
      
      return monthLabels
    }

    // function createAdaptiveMonthLabels() {
    //   const monthLabels = []
    //   let currentMonth = -1
      
    //   const avgLabelWidth = 40
    //   const maxLabels = Math.floor(graphWidth / avgLabelWidth)
      
    //   if (width < 400) {
    //     const skipInterval = Math.max(2, Math.ceil(res.points.length / maxLabels))
        
    //     res.points.forEach((point, i) => {
    //       const month = point.date.getMonth()
    //       if (month !== currentMonth && i % skipInterval === 0) {
    //         currentMonth = month
    //         const x = padding.left + i * xScale
    //         const monthName = point.date.toLocaleString('default', { month: 'short' })
    //         monthLabels.push({ x, label: monthName })
    //       }
    //     })
    //   } else if (width < 600) {
    //     return createSmartMonthLabels()
    //   } else {
    //     res.points.forEach((point, i) => {
    //       const month = point.date.getMonth()
    //       if (month !== currentMonth) {
    //         currentMonth = month
    //         const x = padding.left + i * xScale
    //         const monthName = point.date.toLocaleString('default', { month: 'short' })
    //         monthLabels.push({ x, label: monthName })
    //       }
    //     })
    //   }
      
    //   return monthLabels
    // }

    // const monthLabels = createAdaptiveMonthLabels()

    // Y-axis labels
    const yLabels = []
    const yTickCount = 5
    for (let i = 0; i <= yTickCount; i++) {
      const value = Math.round((maxXP / yTickCount) * i)
      const y = height - padding.bottom - value * yScale
      yLabels.push({ y, label: formatBytes(value) })
    }

    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", width)
    svg.setAttribute("height", height)
    
    const gradientId = "xp-gradient"
    
    svg.innerHTML = `
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#A799FF;stop-opacity:0.7" />
          <stop offset="100%" style="stop-color:#A799FF;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <!-- Grid lines -->
      ${yLabels.map(label => 
        `<line x1="${padding.left}" y1="${label.y}" x2="${width - padding.right}" y2="${label.y}" 
          stroke="#3B3363" stroke-width="1" stroke-dasharray="5,5" />`
      ).join("")}
      
      <!-- Y-axis labels -->
      ${yLabels.map(label => 
        `<text x="${padding.left - 5}" y="${label.y + 4}" text-anchor="end" 
          fill="#A799FF" font-size="12" dominant-baseline="middle">${label.label}</text>`
      ).join("")}      
      <!-- Y-axis line -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" 
        stroke="#A799FF" stroke-width="1" />
      
      <!-- X-axis line -->
      <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" 
        stroke="#A799FF" stroke-width="1" />
      
      <!-- Area fill -->
      <path d="${areaData}" fill="url(#${gradientId})" stroke="none" />
      
      <!-- Line chart -->
      <path d="${pathData}" stroke="#A799FF" stroke-width="2.5" fill="none" />
      
      <!-- Data points -->
      ${res.points.map((point, i) => {
        const x = padding.left + i * xScale
        const y = height - padding.bottom - point.xp * yScale
        return `<circle cx="${x}" cy="${y}" r="3" fill="#FFFFFF" stroke="#A799FF" stroke-width="1.5" />`
      }).join("")}
    `

    container.innerHTML = ""
    container.appendChild(svg)
  }

  renderXPGraph()

  window.addEventListener("resize", () => {
    renderXPGraph()
    renderSkillsSVG(result.data.skillsTransactions) // Re-render skills on resize
  })
}