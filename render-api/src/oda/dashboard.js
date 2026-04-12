"use strict";

const https = require("node:https");
const KOICA_PROJECTS = require("./koica-cso-projects.json");

const KOICA_BASE_URL = "https://www.oda.go.kr/opo";
const WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2";
const DEFAULT_ANALYSIS_YEAR = 2023;
const MIN_ANALYSIS_YEAR = 2019;
const MAX_ANALYSIS_YEAR = 2023;
const DEFAULT_COUNTRY_LIMIT = 12;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const COUNTRY_METADATA = {
  가나: { wbCode: "GHA", koicaId: "3334" },
  네팔: { wbCode: "NPL", koicaId: "1535" },
  라오스: { wbCode: "LAO", koicaId: "1433" },
  캄보디아: { wbCode: "KHM", koicaId: "1208" },
  베트남: { wbCode: "VNM", koicaId: "1775" },
  우간다: { wbCode: "UGA", koicaId: "3751" },
  방글라데시: { wbCode: "BGD", koicaId: "1154" },
  탄자니아: { wbCode: "TZA", koicaId: "3715" },
  필리핀: { wbCode: "PHL", koicaId: "1592" },
  말라위: { wbCode: "MWI", koicaId: "3469" },
  케냐: { wbCode: "KEN", koicaId: "3418" },
  몽골: { wbCode: "MNG", koicaId: "1514" },
  동티모르: { wbCode: "TLS" },
  르완다: { wbCode: "RWA", koicaId: "3619" },
  에티오피아: { wbCode: "ETH", koicaId: "3304" },
  볼리비아: { wbCode: "BOL" },
  페루: { wbCode: "PER" },
  마다가스카르: { wbCode: "MDG" },
  모리타니: { wbCode: "MRT" },
  미얀마: { wbCode: "MMR" },
  부르키나파소: { wbCode: "BFA" },
  세네갈: { wbCode: "SEN" },
  시에라리온: { wbCode: "SLE" },
  우즈베키스탄: { wbCode: "UZB" },
  인도네시아: { wbCode: "IDN" },
  짐바브웨: { wbCode: "ZWE" },
  카메룬: { wbCode: "CMR" },
  코트디부아르: { wbCode: "CIV" },
  키르기스스탄: { wbCode: "KGZ" },
  태국: { wbCode: "THA" },
  파라과이: { wbCode: "PRY" },
  콩고민주공화국: { wbCode: "COD" }
};

const COUNTRY_ALIASES = new Map([
  ["배트남", "베트남"],
  ["키르기기스스탄", "키르기스스탄"],
  ["잔지바르", "탄자니아"],
  ["DR콩고", "콩고민주공화국"]
]);

const PREFERRED_COUNTRIES = [
  "베트남",
  "캄보디아",
  "탄자니아",
  "라오스",
  "우간다",
  "필리핀",
  "방글라데시",
  "네팔",
  "케냐",
  "말라위",
  "몽골",
  "에티오피아",
  "가나",
  "르완다"
];

const DASHBOARD_SECTOR_ORDER = ["교육", "보건", "농어촌·생계", "거버넌스·다분야", "인도지원"];

const PROJECT_SECTOR_MAP = new Map([
  ["교육", "교육"],
  ["고등교육", "교육"],
  ["보건", "보건"],
  ["보건의료", "보건"],
  ["농림수산", "농어촌·생계"],
  ["농어촌개발", "농어촌·생계"],
  ["다분야", "거버넌스·다분야"],
  ["공공행정", "거버넌스·다분야"],
  ["사연경", "거버넌스·다분야"],
  ["사연경(1)", "거버넌스·다분야"],
  ["사연경(2)", "거버넌스·다분야"],
  ["기타", "거버넌스·다분야"],
  ["긴급구호", "인도지원"]
]);

const SUPPLY_SECTOR_MAP = new Map([
  ["교육", "교육"],
  ["보건의료", "보건"],
  ["농림수산", "농어촌·생계"],
  ["공공행정", "거버넌스·다분야"],
  ["기술환경에너지", "거버넌스·다분야"],
  ["기타", "거버넌스·다분야"],
  ["긴급구호", "인도지원"]
]);

const TARGET_KEYWORDS = new Map([
  ["아동", ["아동", "어린이", "유아", "영유아"]],
  ["청소년", ["청소년", "여아", "남아", "학생"]],
  ["여성", ["여성", "모자보건", "산모", "여학생", "여성농민"]],
  ["장애인", ["장애"]],
  ["농촌주민", ["농촌", "농민", "낙농", "어촌", "어민", "소농"]],
  ["난민·이주민", ["난민", "이주민", "이주", "피난민"]],
  ["보건취약계층", ["보건", "영양", "모자보건", "재활", "위생"]],
  ["소수민족", ["소수민족", "소수부족", "토착민"]]
]);

const FX_KRW_PER_USD = {
  2023: 1305,
  2024: 1363
};

const DEMAND_INDICATORS = {
  교육: [
    { code: "SE.PRM.CMPT.ZS", label: "초등교육 이수율", direction: "inverse" },
    { code: "SE.ADT.LITR.ZS", label: "성인 문해율", direction: "inverse" }
  ],
  보건: [
    { code: "SP.DYN.IMRT.IN", label: "영아사망률", direction: "direct" },
    { code: "SH.STA.MMRT", label: "모성사망비", direction: "direct" },
    { code: "SH.IMM.IDPT", label: "DPT 예방접종률", direction: "inverse" }
  ],
  "농어촌·생계": [
    { code: "EG.ELC.ACCS.RU.ZS", label: "농촌 전력 접근률", direction: "inverse" },
    { code: "SL.AGR.EMPL.ZS", label: "농업 고용 비중", direction: "direct" },
    { code: "SI.POV.DDAY", label: "극빈층 비율", direction: "direct" }
  ],
  "거버넌스·다분야": [
    { code: "IQ.CPA.TRAN.XQ", label: "투명성·책임성", direction: "inverse" },
    { code: "IQ.CPA.PUBS.XQ", label: "공공부문 관리", direction: "inverse" },
    { code: "NY.GDP.PCAP.CD", label: "1인당 GDP", direction: "inverse" }
  ],
  인도지원: [
    { code: "SI.POV.DDAY", label: "극빈층 비율", direction: "direct" },
    { code: "SP.DYN.IMRT.IN", label: "영아사망률", direction: "direct" },
    { code: "IQ.CPA.TRAN.XQ", label: "투명성·책임성", direction: "inverse" }
  ]
};

const responseCache = new Map();
const upstreamCache = new Map();

async function getDashboard(req, res) {
  try {
    const analysisYear = clampNumber(req.query.year, MIN_ANALYSIS_YEAR, MAX_ANALYSIS_YEAR, DEFAULT_ANALYSIS_YEAR);
    const trendStartYear = clampNumber(req.query.trendStartYear, MIN_ANALYSIS_YEAR, analysisYear, MIN_ANALYSIS_YEAR);
    const countryLimit = clampNumber(req.query.limit, 6, 16, DEFAULT_COUNTRY_LIMIT);
    const cacheKey = JSON.stringify({ analysisYear, trendStartYear, countryLimit });
    const cached = getCacheValue(responseCache, cacheKey);
    if (cached) return res.json(cached);

    const payload = await buildDashboardPayload({ analysisYear, trendStartYear, countryLimit });
    setCacheValue(responseCache, cacheKey, payload);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      error: "ODA dashboard data could not be built",
      detail: error && error.message ? error.message : String(error)
    });
  }
}

async function buildDashboardPayload({ analysisYear, trendStartYear, countryLimit }) {
  const normalizedProjects = normalizeProjects(KOICA_PROJECTS);
  const activeProjects = normalizedProjects.filter((project) => project.projectYear <= analysisYear);
  const selectedCountries = pickCountries(activeProjects, analysisYear, countryLimit);
  const countries = selectedCountries
    .map((country) => ({
      name: country,
      koicaId: COUNTRY_METADATA[country] ? COUNTRY_METADATA[country].koicaId : null,
      wbCode: COUNTRY_METADATA[country] ? COUNTRY_METADATA[country].wbCode : null
    }))
    .filter((country) => country.wbCode && country.koicaId);

  const demandRowsPromise = fetchDemandRows(countries, analysisYear);
  const countryTrendRows = await fetchKoicaCountryTrends(countries, trendStartYear, analysisYear);
  const countrySectorRows = await fetchKoicaCountrySectorTotals(countries, analysisYear);
  const regionShareRows = await fetchKoicaRegionShares(analysisYear);
  const sectorShareRows = await fetchKoicaSectorShares(analysisYear);
  const demandRows = await demandRowsPromise;

  const csoRows = estimateCsoRows(activeProjects, analysisYear, countries.map((country) => country.name));
  const matrixRows = buildMatrixRows({
    countries,
    demandRows,
    countrySectorRows,
    csoRows
  });
  const topGapRows = [...matrixRows]
    .sort((left, right) => right.opportunityScore - left.opportunityScore)
    .slice(0, 10);

  const countrySummaries = buildCountrySummaries(countries, countryTrendRows, matrixRows, csoRows);
  const sectorSummaries = buildSectorSummaries(matrixRows, sectorShareRows);
  const targetGroupRows = buildTargetGroupRows(activeProjects, countries.map((country) => country.name), analysisYear);
  const projectRows = buildProjectRows(activeProjects, countries.map((country) => country.name), analysisYear);

  const totalSupplyUsd = matrixRows.reduce((sum, row) => sum + row.supplyUsd, 0);
  const totalCsoUsd = matrixRows.reduce((sum, row) => sum + row.csoUsd, 0);

  return {
    meta: {
      title: "한국 개발협력 시민사회 기여 분석 대시보드",
      subtitle: "KOICA 공급 데이터와 World Bank 지표, KOICA 시민사회협력프로그램 사업리스트를 결합한 1차 프로토타입",
      analysisYear,
      trendStartYear,
      countryLimit,
      countryCount: countries.length,
      sectorCount: DASHBOARD_SECTOR_ORDER.length,
      sources: [
        "KOICA 오픈데이터포털 / 국가별·분야별 지원액",
        "World Bank API / SDG 연계 개발지표",
        "KOICA 시민사회협력프로그램 2023·2024 사업리스트"
      ],
      caveats: [
        "전체 공급은 한국 ODA 전체가 아니라 KOICA 공급 기준으로 구현되었습니다.",
        "CSO 금액과 지분은 사업리스트 총예산을 연차 균등 배분해 추정한 값입니다.",
        "인도지원 수요는 SDG 대체지표를 이용한 취약성 프록시입니다."
      ]
    },
    overview: {
      totalSupplyUsd: roundNumber(totalSupplyUsd),
      estimatedCsoUsd: roundNumber(totalCsoUsd),
      estimatedCsoSharePct: toPercent(totalSupplyUsd === 0 ? 0 : totalCsoUsd / totalSupplyUsd),
      topGapRows,
      regionShareRows
    },
    countries,
    sectorOrder: DASHBOARD_SECTOR_ORDER,
    countrySummaries,
    sectorSummaries,
    matrixRows,
    targetGroupRows,
    projectRows
  };
}

function normalizeProjects(projects) {
  return projects.map((project) => {
    const title = normalizeText(project.title);
    const rawCountry = normalizeCountry(project.country);
    const rawSector = normalizeText(project.raw_sector || project.sector || "");

    return {
      projectId: String(project.project_id || ""),
      projectYear: Number(project.project_year || 0),
      country: rawCountry,
      sector: normalizeProjectSector(rawSector),
      rawSector,
      programType: normalizeText(project.program_type || ""),
      partnerName: normalizeText(project.partner_name || ""),
      orgType: normalizeText(project.org_type || "CSO"),
      title,
      startYear: Number(project.start_year || 0) || null,
      endYear: Number(project.end_year || 0) || null,
      budgetMkrw: parseBudgetMkrw(title),
      targetTags: extractTargetTags(title)
    };
  });
}

function pickCountries(projects, analysisYear, countryLimit) {
  return PREFERRED_COUNTRIES.slice(0, countryLimit);
}

function buildCountrySummaries(countries, countryTrendRows, matrixRows, csoRows) {
  const trendMap = new Map(countryTrendRows.map((row) => [row.country, row.yearly]));
  const csoTotalMap = aggregateRows(csoRows, "country");
  const matrixByCountry = groupBy(matrixRows, (row) => row.country);

  return countries.map((country) => {
    const rows = matrixByCountry.get(country.name) || [];
    const supplyUsd = rows.reduce((sum, row) => sum + row.supplyUsd, 0);
    const csoUsd = csoTotalMap.get(country.name) ? csoTotalMap.get(country.name).usd : 0;
    return {
      country: country.name,
      wbCode: country.wbCode,
      supplyUsd: roundNumber(supplyUsd),
      csoUsd: roundNumber(csoUsd),
      csoSharePct: toPercent(supplyUsd === 0 ? 0 : csoUsd / supplyUsd),
      averageDemandScore: roundNumber(rows.reduce((sum, row) => sum + row.demandScore, 0) / Math.max(rows.length, 1)),
      highestNeedSector: rows.sort((left, right) => right.opportunityScore - left.opportunityScore)[0] || null,
      yearlyTrend: trendMap.get(country.name) || []
    };
  });
}

function buildSectorSummaries(matrixRows, officialSectorShareRows) {
  const summaryMap = new Map();
  for (const sector of DASHBOARD_SECTOR_ORDER) {
    summaryMap.set(sector, {
      sector,
      supplyUsd: 0,
      csoUsd: 0,
      averageDemandScore: 0,
      rowCount: 0,
      officialSharePct: 0
    });
  }

  for (const row of matrixRows) {
    const summary = summaryMap.get(row.sector);
    summary.supplyUsd += row.supplyUsd;
    summary.csoUsd += row.csoUsd;
    summary.averageDemandScore += row.demandScore;
    summary.rowCount += 1;
  }

  const officialMap = new Map(officialSectorShareRows.map((row) => [row.sector, row.sharePct]));
  return DASHBOARD_SECTOR_ORDER.map((sector) => {
    const summary = summaryMap.get(sector);
    return {
      sector,
      supplyUsd: roundNumber(summary.supplyUsd),
      csoUsd: roundNumber(summary.csoUsd),
      estimatedCsoSharePct: toPercent(summary.supplyUsd === 0 ? 0 : summary.csoUsd / summary.supplyUsd),
      averageDemandScore: roundNumber(summary.averageDemandScore / Math.max(summary.rowCount, 1)),
      officialSharePct: roundNumber(officialMap.get(sector) || 0, 1)
    };
  });
}

function buildTargetGroupRows(projects, selectedCountries, analysisYear) {
  const selectedSet = new Set(selectedCountries);
  const rows = [];
  for (const project of projects) {
    if (!selectedSet.has(project.country)) continue;
    if (project.startYear && project.endYear && (analysisYear < project.startYear || analysisYear > project.endYear)) {
      continue;
    }
    for (const tag of project.targetTags) {
      rows.push({
        tag,
        country: project.country,
        sector: project.sector
      });
    }
  }

  const grouped = groupBy(rows, (row) => row.tag);
  return [...grouped.entries()]
    .map(([tag, items]) => ({
      tag,
      count: items.length,
      countries: uniqueValues(items.map((item) => item.country)),
      sectors: uniqueValues(items.map((item) => item.sector))
    }))
    .sort((left, right) => right.count - left.count);
}

function buildProjectRows(projects, selectedCountries, analysisYear) {
  const selectedSet = new Set(selectedCountries);
  return projects
    .filter((project) => selectedSet.has(project.country))
    .filter((project) => !project.startYear || !project.endYear || (analysisYear >= project.startYear && analysisYear <= project.endYear))
    .map((project) => ({
      projectId: project.projectId,
      country: project.country,
      sector: project.sector,
      orgType: project.orgType,
      programType: project.programType,
      partnerName: project.partnerName,
      title: project.title,
      annualizedBudgetUsd: roundNumber(convertMkrwToUsd(getAnnualizedBudgetMkrw(project, analysisYear), project.projectYear)),
      targetTags: project.targetTags
    }))
    .sort((left, right) => right.annualizedBudgetUsd - left.annualizedBudgetUsd)
    .slice(0, 60);
}

function buildMatrixRows({ countries, demandRows, countrySectorRows, csoRows }) {
  const demandMap = new Map();
  for (const row of demandRows) {
    demandMap.set(`${row.country}::${row.sector}`, row);
  }

  const supplyMap = new Map();
  for (const row of countrySectorRows) {
    supplyMap.set(`${row.country}::${row.sector}`, row.supplyUsd);
  }

  const csoMap = new Map();
  for (const row of csoRows) {
    csoMap.set(`${row.country}::${row.sector}`, row.csoUsd);
  }

  const provisionalRows = [];
  for (const country of countries) {
    for (const sector of DASHBOARD_SECTOR_ORDER) {
      const key = `${country.name}::${sector}`;
      const supplyUsd = Number(supplyMap.get(key) || 0);
      const csoUsd = Number(csoMap.get(key) || 0);
      const demand = demandMap.get(key) || {
        country: country.name,
        sector,
        demandScore: 50,
        indicatorCount: 0,
        indicators: []
      };
      provisionalRows.push({
        country: country.name,
        sector,
        demandScore: roundNumber(demand.demandScore, 1),
        indicatorCount: demand.indicatorCount,
        indicators: demand.indicators,
        supplyUsd: roundNumber(supplyUsd),
        csoUsd: roundNumber(csoUsd),
        estimatedCsoSharePct: toPercent(supplyUsd === 0 ? 0 : csoUsd / supplyUsd)
      });
    }
  }

  const supplyNormalizer = createSectorNormalizer(provisionalRows, (row) => row.supplyUsd);
  return provisionalRows.map((row) => {
    const supplyScarcity = 100 - supplyNormalizer(row.sector, row.supplyUsd);
    const csoScarcity = 100 - row.estimatedCsoSharePct;
    const opportunityScore = roundNumber(row.demandScore * 0.55 + supplyScarcity * 0.3 + csoScarcity * 0.15, 1);
    return {
      ...row,
      opportunityScore
    };
  });
}

function estimateCsoRows(projects, analysisYear, selectedCountries) {
  const selectedSet = new Set(selectedCountries);
  const rows = [];
  for (const project of projects) {
    if (!selectedSet.has(project.country)) continue;
    if (project.startYear && project.endYear && (analysisYear < project.startYear || analysisYear > project.endYear)) {
      continue;
    }
    const annualBudgetMkrw = getAnnualizedBudgetMkrw(project, analysisYear);
    if (!annualBudgetMkrw) continue;

    rows.push({
      country: project.country,
      sector: project.sector,
      csoUsd: convertMkrwToUsd(annualBudgetMkrw, project.projectYear)
    });
  }

  return [...aggregateRows(rows, "country", "sector").values()].map((row) => ({
    country: row.country,
    sector: row.sector,
    csoUsd: roundNumber(row.usd)
  }));
}

async function fetchKoicaCountryIdMap() {
  const cacheKey = "koica-country-map";
  const cached = getCacheValue(upstreamCache, cacheKey);
  if (cached) return cached;

  const html = await koicaRequestText(`${KOICA_BASE_URL}/nnstat/opoNstatAreaList.do`);
  const map = new Map();
  const matcher = /nation="([^"]+)"\s+value="(\d+)"/g;
  for (const match of html.matchAll(matcher)) {
    map.set(normalizeCountry(match[1]), match[2]);
  }
  setCacheValue(upstreamCache, cacheKey, map);
  return map;
}

async function fetchKoicaCountryTrends(countries, trendStartYear, analysisYear) {
  const payload = await postKoicaJson("/nnstat/opoNstatAreaCompDataList_N.do", {
    beginYear3: trendStartYear,
    endYear3: analysisYear,
    P_MENU_CD: "UM002003001",
    countryIds: countries.map((country) => country.koicaId)
  });

  return (payload.list || []).map((row) => ({
    country: normalizeCountry(row.nationCD),
    yearly: (row.yearList || []).map((year, index) => ({
      year: Number(year),
      supplyUsd: roundNumber(Number((row.dlrList || [])[index] || 0))
    }))
  }));
}

async function fetchKoicaCountrySectorTotals(countries, analysisYear) {
  const payload = await postKoicaJson("/nnstat/opoNstatRealmCompList_N.do", {
    beginYear3: analysisYear,
    endYear3: analysisYear,
    P_MENU_CD: "UM002003003",
    countryIds: countries.map((country) => country.koicaId)
  });

  const categoryArray = payload.categoryArray || [];
  const rows = [];
  for (const row of payload.list || []) {
    const country = normalizeCountry(row.areaCD);
    (row.dataList || []).forEach((value, index) => {
      const sector = normalizeSupplySector(categoryArray[index]);
      if (!sector) return;
      rows.push({
        country,
        sector,
        supplyUsd: Number(value || 0)
      });
    });
  }

  return [...aggregateRows(rows, "country", "sector").values()].map((row) => ({
    country: row.country,
    sector: row.sector,
    supplyUsd: roundNumber(row.usd)
  }));
}

async function fetchKoicaRegionShares(analysisYear) {
  const payload = await postKoicaJson("/nnstat/opoNstatAreaSptAccRateList.do", {
    beginYear1: analysisYear,
    endYear1: analysisYear,
    P_MENU_CD: "UM002003001"
  });

  return (payload.list || []).map((row) => ({
    region: normalizeText(row.KOICA_AREA_SE_NM || ""),
    sharePct: roundNumber(Number(row.SAMT_RATE || 0), 1)
  }));
}

async function fetchKoicaSectorShares(analysisYear) {
  const payload = await postKoicaJson("/nnstat/opoNstatRealmSptAccRateList.do", {
    beginYear1: analysisYear,
    endYear1: analysisYear,
    P_MENU_CD: "UM002003003"
  });

  return (payload.list || [])
    .map((row) => ({
      sector: normalizeSupplySector(row.SPORT_REALM_NM || ""),
      sharePct: roundNumber(Number(row.SAMT_RATE || 0), 1)
    }))
    .filter((row) => row.sector);
}

async function fetchDemandRows(countries, analysisYear) {
  const indicatorConfigs = uniqueBy(
    Object.values(DEMAND_INDICATORS).flat(),
    (indicator) => indicator.code
  );
  const indicatorValueMap = new Map();

  await Promise.all(
    indicatorConfigs.map(async (indicator) => {
      const values = await fetchWorldBankIndicator(countries, indicator.code, analysisYear);
      indicatorValueMap.set(indicator.code, values);
    })
  );

  const rows = [];
  for (const sector of DASHBOARD_SECTOR_ORDER) {
    const indicators = DEMAND_INDICATORS[sector];
    const scoringRows = countries.map((country) => {
      const values = indicators
        .map((indicator) => {
          const countryValues = indicatorValueMap.get(indicator.code) || new Map();
          return {
            ...indicator,
            value: countryValues.get(country.wbCode) || null
          };
        })
        .filter((item) => item.value && Number.isFinite(item.value.value));

      return {
        country: country.name,
        sector,
        indicators: values
      };
    });

    const scored = scoreDemandRows(scoringRows);
    rows.push(...scored);
  }

  return rows;
}

async function fetchWorldBankIndicator(countries, indicatorCode, analysisYear) {
  const wbCodes = countries.map((country) => country.wbCode).join(";");
  const cacheKey = `wb:${indicatorCode}:${analysisYear}:${wbCodes}`;
  const cached = getCacheValue(upstreamCache, cacheKey);
  if (cached) return cached;

  const url = `${WORLD_BANK_BASE_URL}/country/${wbCodes}/indicator/${indicatorCode}?format=json&per_page=400`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`World Bank request failed for ${indicatorCode} with ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : [];
  const valueMap = new Map();

  for (const country of countries) {
    const matched = rows
      .filter((row) => row.countryiso3code === country.wbCode && row.value !== null)
      .sort((left, right) => Number(right.date) - Number(left.date));
    const preferred = matched.find((row) => Number(row.date) <= analysisYear) || matched[0];
    if (preferred) {
      valueMap.set(country.wbCode, {
        value: Number(preferred.value),
        year: Number(preferred.date)
      });
    }
  }

  setCacheValue(upstreamCache, cacheKey, valueMap);
  return valueMap;
}

function scoreDemandRows(rows) {
  const indicatorCodes = uniqueValues(rows.flatMap((row) => row.indicators.map((indicator) => indicator.code)));
  const scoredByIndicator = new Map();

  for (const code of indicatorCodes) {
    const values = rows
      .map((row) => {
        const indicator = row.indicators.find((item) => item.code === code);
        return indicator ? { country: row.country, value: indicator.value.value, direction: indicator.direction } : null;
      })
      .filter(Boolean);
    scoredByIndicator.set(code, createMinMaxScores(values));
  }

  return rows.map((row) => {
    const scoredIndicators = row.indicators.map((indicator) => {
      const scoreMap = scoredByIndicator.get(indicator.code) || new Map();
      const score = scoreMap.has(row.country) ? scoreMap.get(row.country) : 50;
      return {
        code: indicator.code,
        label: indicator.label,
        value: indicator.value.value,
        year: indicator.value.year,
        score: roundNumber(score, 1)
      };
    });

    const demandScore = scoredIndicators.length
      ? scoredIndicators.reduce((sum, indicator) => sum + indicator.score, 0) / scoredIndicators.length
      : 50;

    return {
      country: row.country,
      sector: row.sector,
      demandScore: roundNumber(demandScore, 1),
      indicatorCount: scoredIndicators.length,
      indicators: scoredIndicators
    };
  });
}

function createMinMaxScores(rows) {
  if (!rows.length) return new Map();
  const values = rows.map((row) => row.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const scoreMap = new Map();

  for (const row of rows) {
    let normalized = max === min ? 50 : ((row.value - min) / (max - min)) * 100;
    if (row.direction === "inverse") normalized = 100 - normalized;
    scoreMap.set(row.country, normalized);
  }

  return scoreMap;
}

async function postKoicaJson(pathname, { beginYear1, endYear1, beginYear3, endYear3, P_MENU_CD, countryIds }) {
  const params = new URLSearchParams({
    P_CHART_LEVEL: "",
    P_CHART_TYPE: "",
    area: "국가",
    nationCode: "",
    areaCode: "",
    P_DOWN_FILE: "",
    P_MENU_LEVEL: "3",
    P_MENU_CD,
    P_LANG: "KO"
  });

  if (beginYear1) params.set("beginYear1", String(beginYear1));
  if (endYear1) params.set("endYear1", String(endYear1));
  if (beginYear3) params.set("beginYear3", String(beginYear3));
  if (endYear3) params.set("endYear3", String(endYear3));
  for (const countryId of countryIds || []) {
    params.append("chkNation", String(countryId));
  }

  const cacheKey = `koica:${pathname}:${params.toString()}`;
  const cached = getCacheValue(upstreamCache, cacheKey);
  if (cached) return cached;

  const payload = await koicaRequestJson(`${KOICA_BASE_URL}${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: params.toString()
  });
  setCacheValue(upstreamCache, cacheKey, payload);
  return payload;
}

function normalizeCountry(country) {
  const cleaned = normalizeText(country);
  return COUNTRY_ALIASES.get(cleaned) || cleaned;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProjectSector(rawSector) {
  const cleaned = normalizeText(rawSector);
  return PROJECT_SECTOR_MAP.get(cleaned) || "거버넌스·다분야";
}

function normalizeSupplySector(rawSector) {
  const cleaned = normalizeText(rawSector);
  return SUPPLY_SECTOR_MAP.get(cleaned) || null;
}

function parseBudgetMkrw(title) {
  const match = title.match(/\/\s*([\d,]+)백만원/);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function getAnnualizedBudgetMkrw(project, analysisYear) {
  if (!project.budgetMkrw) return 0;
  if (!project.startYear || !project.endYear) return project.budgetMkrw;
  if (analysisYear < project.startYear || analysisYear > project.endYear) return 0;

  const yearSpan = Math.max(project.endYear - project.startYear + 1, 1);
  return project.budgetMkrw / yearSpan;
}

function convertMkrwToUsd(amountMkrw, projectYear) {
  const fx = FX_KRW_PER_USD[projectYear] || FX_KRW_PER_USD[DEFAULT_ANALYSIS_YEAR];
  return (amountMkrw * 1000000) / fx;
}

function extractTargetTags(title) {
  const tags = [];
  for (const [tag, keywords] of TARGET_KEYWORDS.entries()) {
    if (keywords.some((keyword) => title.includes(keyword))) {
      tags.push(tag);
    }
  }
  return tags;
}

function createSectorNormalizer(rows, selector) {
  const sectorRows = new Map();
  for (const row of rows) {
    const list = sectorRows.get(row.sector) || [];
    list.push(selector(row));
    sectorRows.set(row.sector, list);
  }

  return (sector, value) => {
    const list = sectorRows.get(sector) || [];
    if (!list.length) return 50;
    const logValues = list.map((item) => Math.log10(item + 1));
    const target = Math.log10(value + 1);
    const min = Math.min(...logValues);
    const max = Math.max(...logValues);
    if (min === max) return 50;
    return ((target - min) / (max - min)) * 100;
  };
}

function aggregateRows(rows, primaryKey, secondaryKey) {
  const map = new Map();
  for (const row of rows) {
    const key = secondaryKey ? `${row[primaryKey]}::${row[secondaryKey]}` : row[primaryKey];
    const previous = map.get(key) || {
      country: row.country,
      sector: row.sector,
      usd: 0
    };
    previous.usd += Number(row.csoUsd || row.supplyUsd || row.usd || 0);
    map.set(key, previous);
  }
  return map;
}

function groupBy(rows, selector) {
  const map = new Map();
  for (const row of rows) {
    const key = selector(row);
    const group = map.get(key) || [];
    group.push(row);
    map.set(key, group);
  }
  return map;
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function uniqueBy(values, selector) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const key = selector(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function getCacheValue(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expireAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCacheValue(cache, key, value) {
  cache.set(key, {
    value,
    expireAt: Date.now() + CACHE_TTL_MS
  });
}

function koicaRequestText(url, options) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: options && options.method ? options.method : "GET",
      headers: options && options.headers ? options.headers : {},
      rejectUnauthorized: false
    });

    request.setTimeout(30000, () => {
      request.destroy(new Error("KOICA request timed out"));
    });

    request.on("response", (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`KOICA request failed with ${response.statusCode}`));
          return;
        }
        resolve(body);
      });
    });

    request.on("error", reject);
    if (options && options.body) request.write(options.body);
    request.end();
  });
}

async function koicaRequestJson(url, options) {
  const text = await koicaRequestText(url, options);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`KOICA JSON parse failed for ${url}: ${text.slice(0, 120)}`);
  }
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.trunc(number), min), max);
}

function roundNumber(value, digits) {
  const precision = Number.isFinite(digits) ? digits : 0;
  const power = 10 ** precision;
  return Math.round((Number(value) || 0) * power) / power;
}

function toPercent(value) {
  return roundNumber((Number(value) || 0) * 100, 1);
}

module.exports = {
  getDashboard
};
