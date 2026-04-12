(function () {
  const formatUsdCompact = new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1
  });
  const formatUsdFull = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0
  });
  const formatPercent = new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });

  const state = {
    year: 2023,
    data: null,
    selectedKey: null
  };

  const root = {
    yearSwitch: document.getElementById("year-switch"),
    noteStrip: document.getElementById("note-strip"),
    metrics: document.getElementById("metrics"),
    matrixGrid: document.getElementById("matrix-grid"),
    gapList: document.getElementById("gap-list"),
    regionList: document.getElementById("region-list"),
    sectorBars: document.getElementById("sector-bars"),
    countryTable: document.getElementById("country-table"),
    targetTags: document.getElementById("target-tags"),
    projectBody: document.getElementById("project-body"),
    cellInspector: document.getElementById("cell-inspector"),
    status: document.getElementById("status")
  };

  renderYearSwitch();
  loadDashboard(state.year);

  function renderYearSwitch() {
    const fragment = document.createDocumentFragment();
    [2019, 2020, 2021, 2022, 2023].forEach((year) => {
      const button = document.createElement("button");
      button.className = "year-pill";
      button.type = "button";
      button.textContent = year + "년";
      button.setAttribute("aria-pressed", String(year === state.year));
      button.addEventListener("click", () => {
        if (state.year === year) return;
        state.year = year;
        renderYearSwitch();
        loadDashboard(year);
      });
      fragment.appendChild(button);
    });

    root.yearSwitch.innerHTML = "";
    root.yearSwitch.appendChild(fragment);
  }

  async function loadDashboard(year) {
    setStatus("대시보드 데이터를 불러오는 중입니다.");
    setLoadingState();

    try {
      const base = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "";
      const response = await fetch(`${base}/api/oda/dashboard?year=${year}`);
      if (!response.ok) throw new Error("API 응답을 읽지 못했습니다.");
      state.data = await response.json();
      state.selectedKey = state.data.matrixRows.length ? toKey(state.data.matrixRows[0]) : null;
      render();
      setStatus(state.data.meta.caveats.join(" "));
    } catch (error) {
      root.metrics.innerHTML = "";
      root.matrixGrid.innerHTML = `<div class="loading">데이터를 불러오지 못했습니다. ${escapeHtml(error.message)}</div>`;
      root.gapList.innerHTML = "";
      root.regionList.innerHTML = "";
      root.sectorBars.innerHTML = "";
      root.countryTable.innerHTML = "";
      root.targetTags.innerHTML = "";
      root.projectBody.innerHTML = "";
      root.cellInspector.innerHTML = "";
      setStatus("데이터 로드에 실패했습니다. 서버 실행 상태와 외부 데이터 연결을 확인해 주세요.");
    }
  }

  function render() {
    renderNotes();
    renderMetrics();
    renderGapList();
    renderRegionList();
    renderMatrix();
    renderInspector();
    renderSectorBars();
    renderCountryTable();
    renderTargetTags();
    renderProjects();
  }

  function renderNotes() {
    const { meta } = state.data;
    const notes = [
      `분석연도 ${meta.analysisYear}년, 추세 기준 ${meta.trendStartYear}-${meta.analysisYear}년`,
      `${meta.countryCount}개 국가와 ${meta.sectorCount}개 분야를 같은 좌표계에서 비교`,
      meta.sources.join(" / ")
    ];
    root.noteStrip.innerHTML = notes
      .map((note) => `<div class="note">${escapeHtml(note)}</div>`)
      .join("");
  }

  function renderMetrics() {
    const { overview, meta } = state.data;
    const metricRows = [
      {
        label: "KOICA 공급 합계",
        value: "$" + formatUsdCompact.format(overview.totalSupplyUsd),
        description: `${meta.countryCount}개 선정국, ${meta.analysisYear}년 기준`
      },
      {
        label: "추정 CSO 금액",
        value: "$" + formatUsdCompact.format(overview.estimatedCsoUsd),
        description: "시민사회협력프로그램 사업리스트 기반 연차 추정"
      },
      {
        label: "추정 CSO 지분",
        value: formatPercent.format(overview.estimatedCsoSharePct) + "%",
        description: "선정 국가군과 분야 조합 안에서의 비교치"
      },
      {
        label: "우선 검토 조합",
        value: String(overview.topGapRows.length),
        description: "Top Gap Queue에 표시된 수요-공급 공백 후보"
      }
    ];

    root.metrics.innerHTML = metricRows
      .map(
        (metric) => `
          <article class="metric">
            <label>${escapeHtml(metric.label)}</label>
            <strong>${escapeHtml(metric.value)}</strong>
            <span>${escapeHtml(metric.description)}</span>
          </article>
        `
      )
      .join("");
  }

  function renderGapList() {
    root.gapList.innerHTML = state.data.overview.topGapRows
      .map(
        (row) => `
          <div class="rank-item">
            <div class="rank-line">
              <strong>${escapeHtml(row.country)} / ${escapeHtml(row.sector)}</strong>
              <span class="score-chip">${formatPercent.format(row.opportunityScore)}점</span>
            </div>
            <span>수요 ${formatPercent.format(row.demandScore)} / 공급 $${formatUsdCompact.format(row.supplyUsd)} / CSO ${formatPercent.format(row.estimatedCsoSharePct)}%</span>
          </div>
        `
      )
      .join("");
  }

  function renderRegionList() {
    root.regionList.innerHTML = state.data.overview.regionShareRows
      .map(
        (row) => `
          <div class="plain-item">
            <div class="rank-line">
              <strong>${escapeHtml(row.region)}</strong>
              <span>${formatPercent.format(row.sharePct)}%</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  function renderMatrix() {
    const headers = ['국가', ...state.data.sectorOrder];
    const fragment = document.createDocumentFragment();
    headers.forEach((header) => {
      const cell = document.createElement("div");
      cell.className = "matrix-header";
      cell.textContent = header;
      fragment.appendChild(cell);
    });

    state.data.countrySummaries.forEach((summary) => {
      const country = document.createElement("div");
      country.className = "matrix-country";
      country.innerHTML = `
        <strong>${escapeHtml(summary.country)}</strong>
        <span>평균 수요 ${formatPercent.format(summary.averageDemandScore)} / CSO ${formatPercent.format(summary.csoSharePct)}%</span>
      `;
      fragment.appendChild(country);

      state.data.sectorOrder.forEach((sector) => {
        const row = state.data.matrixRows.find((item) => item.country === summary.country && item.sector === sector);
        const key = toKey(row);
        const demandOpacity = 0.14 + (row.demandScore / 100) * 0.76;
        const bubbleSize = 18 + scaleValue(row.supplyUsd, 58);
        const ringSize = 18 + Math.max(8, bubbleSize * 0.82);

        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "matrix-cell" + (state.selectedKey === key ? " is-selected" : "");
        cell.style.background = `linear-gradient(135deg, rgba(180, 91, 54, ${demandOpacity * 0.22}), rgba(180, 91, 54, ${demandOpacity}))`;
        cell.innerHTML = `
          <div class="cell-top">
            <span class="cell-demand">수요 ${formatPercent.format(row.demandScore)}</span>
            <span>공백 ${formatPercent.format(row.opportunityScore)}</span>
          </div>
          <div class="cell-meta">
            <strong>${escapeHtml(sector)}</strong>
            <span>$${formatUsdCompact.format(row.supplyUsd)} / CSO ${formatPercent.format(row.estimatedCsoSharePct)}%</span>
          </div>
          <div class="cell-bubble" style="width:${bubbleSize}px;height:${bubbleSize}px;"></div>
          <div class="cell-ring" style="width:${ringSize}px;height:${ringSize}px;border-width:${1 + (row.estimatedCsoSharePct / 100) * 4}px;"></div>
        `;
        cell.addEventListener("click", () => {
          state.selectedKey = key;
          renderMatrix();
          renderInspector();
        });
        fragment.appendChild(cell);
      });
    });

    root.matrixGrid.innerHTML = "";
    root.matrixGrid.appendChild(fragment);
  }

  function renderInspector() {
    const row = state.data.matrixRows.find((item) => toKey(item) === state.selectedKey) || state.data.matrixRows[0];
    if (!row) {
      root.cellInspector.innerHTML = `<div class="loading">선택된 셀이 없습니다.</div>`;
      return;
    }

    const indicatorMarkup = row.indicators.length
      ? row.indicators
          .map(
            (indicator) => `
              <div class="plain-item">
                <div class="rank-line">
                  <strong>${escapeHtml(indicator.label)}</strong>
                  <span>${escapeHtml(String(indicator.year || "-"))}</span>
                </div>
                <span>값 ${escapeHtml(formatNumber(indicator.value))} / 정규화 점수 ${formatPercent.format(indicator.score)}</span>
              </div>
            `
          )
          .join("")
      : `<div class="plain-item"><span>가용 지표가 부족해 기본값 50점을 사용했습니다.</span></div>`;

    root.cellInspector.innerHTML = `
      <div>
        <strong style="font-size:1.04rem;">${escapeHtml(row.country)} / ${escapeHtml(row.sector)}</strong>
        <p style="margin:8px 0 0;color:var(--muted);line-height:1.65;font-size:0.9rem;">
          선택 셀의 수요, 공급, CSO 지분과 기초 지표를 함께 보여줍니다.
        </p>
      </div>
      <div class="inspector-grid">
        <div class="mini-card">
          <label>수요지수</label>
          <strong>${formatPercent.format(row.demandScore)}</strong>
        </div>
        <div class="mini-card">
          <label>공백점수</label>
          <strong>${formatPercent.format(row.opportunityScore)}</strong>
        </div>
        <div class="mini-card">
          <label>KOICA 공급</label>
          <strong>$${formatUsdCompact.format(row.supplyUsd)}</strong>
        </div>
        <div class="mini-card">
          <label>추정 CSO 지분</label>
          <strong>${formatPercent.format(row.estimatedCsoSharePct)}%</strong>
        </div>
      </div>
      <div class="plain-list">${indicatorMarkup}</div>
    `;
  }

  function renderSectorBars() {
    const maxSupply = Math.max(...state.data.sectorSummaries.map((row) => row.supplyUsd), 1);
    root.sectorBars.innerHTML = state.data.sectorSummaries
      .map((row) => {
        const supplyWidth = (row.supplyUsd / maxSupply) * 100;
        const csoWidth = (row.csoUsd / maxSupply) * 100;
        return `
          <div class="bar-row">
            <strong>${escapeHtml(row.sector)}</strong>
            <div class="bar-track">
              <span class="bar-fill" style="width:${supplyWidth}%;"></span>
              <span class="bar-fill-alt" style="width:${csoWidth}%;"></span>
            </div>
            <span>${formatPercent.format(row.estimatedCsoSharePct)}%</span>
          </div>
        `;
      })
      .join("");
  }

  function renderCountryTable() {
    root.countryTable.innerHTML = state.data.countrySummaries
      .map((row) => {
        const sparkline = createSparkline(row.yearlyTrend);
        return `
          <div class="country-row">
            <strong>${escapeHtml(row.country)}</strong>
            <span>$${formatUsdCompact.format(row.supplyUsd)}</span>
            <span>CSO ${formatPercent.format(row.csoSharePct)}%</span>
            <div>${sparkline}</div>
          </div>
        `;
      })
      .join("");
  }

  function renderTargetTags() {
    root.targetTags.innerHTML = state.data.targetGroupRows
      .map(
        (row) => `
          <span class="tag">
            ${escapeHtml(row.tag)}
            <small>${row.count}건</small>
          </span>
        `
      )
      .join("");
  }

  function renderProjects() {
    root.projectBody.innerHTML = state.data.projectRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.country)}</td>
            <td>${escapeHtml(row.sector)}</td>
            <td>${escapeHtml(row.programType)}</td>
            <td>${escapeHtml(row.partnerName)}</td>
            <td>${escapeHtml(row.title)}</td>
            <td>$${formatUsdCompact.format(row.annualizedBudgetUsd)}</td>
            <td>${row.targetTags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</td>
          </tr>
        `
      )
      .join("");
  }

  function setLoadingState() {
    const loading = `<div class="loading">데이터를 불러오는 중입니다.</div>`;
    root.metrics.innerHTML = loading;
    root.matrixGrid.innerHTML = loading;
    root.gapList.innerHTML = loading;
    root.regionList.innerHTML = loading;
    root.sectorBars.innerHTML = loading;
    root.countryTable.innerHTML = loading;
    root.targetTags.innerHTML = loading;
    root.projectBody.innerHTML = "";
    root.cellInspector.innerHTML = loading;
  }

  function setStatus(message) {
    root.status.textContent = message;
  }

  function createSparkline(rows) {
    const points = rows.map((row) => row.supplyUsd);
    if (!points.length) return "";
    const max = Math.max(...points);
    const min = Math.min(...points);
    const width = 240;
    const height = 40;
    const step = points.length === 1 ? 0 : width / (points.length - 1);
    const polyline = points
      .map((value, index) => {
        const x = step * index;
        const y = max === min ? height / 2 : height - ((value - min) / (max - min)) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(" ");
    return `
      <svg class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        <polyline fill="none" stroke="rgba(31,108,91,0.2)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />
        <polyline fill="none" stroke="rgba(31,108,91,0.92)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />
      </svg>
    `;
  }

  function scaleValue(value, maxBubble) {
    const values = state.data.matrixRows.map((row) => Math.log10(row.supplyUsd + 1));
    const current = Math.log10(value + 1);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return maxBubble * 0.5;
    return ((current - min) / (max - min)) * maxBubble;
  }

  function toKey(row) {
    return `${row.country}::${row.sector}`;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
