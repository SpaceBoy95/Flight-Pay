// bump this alongside CACHE in sw.js on every deploy - shown in the topbar so it's
// obvious from the app itself whether a device has picked up the latest update
const APP_VERSION = 'v8';
document.getElementById('appVersion').textContent = APP_VERSION;

// ---------- Storage ----------
const SETTINGS_KEY = 'flightpay-settings-v2';
const ENTRIES_KEY = 'flightpay-entries-v1';
const OLD_SETTINGS_KEY = 'flightpay-settings-v1';

const CATS = ['nominal', 'short', 'medium', 'long', 'extraLong', 'ultraLong'];

const DEFAULT_DEAL = {
  id: 'deal-default',
  effectiveFrom: '2000-01-01',
  rates: { nominal: 21.56, short: 17.25, medium: 25.87, long: 32.34, extraLong: 53.90, ultraLong: 64.68 },
  commissionPercent: 10,
  delayTier1: 15,
  delayTier2: 30,
  ddoAmount: 109.52,
  idoAmount: null
};

const SEED_ROUTES = {"MAN-BES": "short", "MAN-BFS": "short", "MAN-BHD": "short", "MAN-BRU": "short", "MAN-CRL": "short", "MAN-DUS": "short", "MAN-EDI": "short", "MAN-GVA": "short", "MAN-INV": "short", "MAN-JER": "short", "MAN-LGW": "short", "MAN-LUX": "short", "MAN-NQY": "short", "MAN-NTE": "short", "MAN-ORY": "short", "MAN-RNS": "short", "MAN-ABZ": "short", "MAN-IOM": "short", "MAN-LDY": "short", "MAN-ORK": "short", "MAN-SNN": "short", "MAN-DUB": "short", "MAN-CDG": "short", "MAN-AMS": "short", "MAN-CGN": "short", "MAN-BOD": "medium", "MAN-OPO": "medium", "MAN-LCG": "medium", "MAN-BIO": "medium", "MAN-PMI": "medium", "MAN-GDN": "medium", "MAN-SZG": "medium", "MAN-LJU": "medium", "MAN-LIS": "medium", "MAN-JTR": "long", "MAN-PMO": "long", "MAN-TPS": "long", "MAN-RHO": "extraLong", "MAN-KGS": "extraLong", "MAN-BJV": "extraLong", "MAN-AYT": "extraLong", "MAN-AEY": "medium", "MAN-AJA": "medium", "MAN-ALC": "medium", "MAN-ARN": "medium", "MAN-BER": "medium", "MAN-BGO": "medium", "MAN-BGY": "medium", "MAN-BIA": "medium", "MAN-BLQ": "medium", "MAN-BSL": "medium", "MAN-BUD": "medium", "MAN-CAG": "medium", "MAN-CPH": "medium", "MAN-FAE": "medium", "MAN-FCO": "medium", "MAN-FRA": "medium", "MAN-GNB": "medium", "MAN-GOA": "medium", "MAN-GOT": "medium", "MAN-GRO": "medium", "MAN-GRX": "medium", "MAN-HAM": "medium", "MAN-HEL": "medium", "MAN-IBZ": "medium", "MAN-INN": "medium", "MAN-KEF": "medium", "MAN-KRK": "medium", "MAN-KSC": "medium", "MAN-LEI": "medium", "MAN-LIN": "medium", "MAN-LRH": "medium", "MAN-LWO": "medium", "MAN-LYS": "medium", "MAN-MAD": "medium", "MAN-MAH": "medium", "MAN-MRS": "medium", "MAN-MUC": "medium", "MAN-MXP": "medium", "MAN-NCE": "medium", "MAN-NUE": "medium", "MAN-OLB": "medium", "MAN-OSL": "medium", "MAN-POZ": "medium", "MAN-PRG": "medium", "MAN-PSA": "medium", "MAN-PUJ": "medium", "MAN-REU": "medium", "MAN-RIX": "medium", "MAN-RMU": "medium", "MAN-RZE": "medium", "MAN-SCR": "medium", "MAN-SPU": "medium", "MAN-SVG": "medium", "MAN-TLL": "medium", "MAN-TLS": "medium", "MAN-TRN": "medium", "MAN-TRS": "medium", "MAN-VCE": "medium", "MAN-VIE": "medium", "MAN-VLC": "medium", "MAN-VNO": "medium", "MAN-VRN": "medium", "MAN-WAW": "medium", "MAN-WRO": "medium", "MAN-ZAD": "medium", "MAN-ZAG": "medium", "MAN-ZRH": "medium", "MAN-AGA": "long", "MAN-AGP": "long", "MAN-ATH": "long", "MAN-BEG": "long", "MAN-BOJ": "long", "MAN-BRI": "long", "MAN-CFU": "long", "MAN-CLJ": "long", "MAN-CMN": "long", "MAN-CTA": "long", "MAN-DJE": "long", "MAN-EFL": "long", "MAN-ENF": "long", "MAN-FAO": "long", "MAN-FNC": "long", "MAN-GIB": "long", "MAN-IST": "long", "MAN-IVL": "long", "MAN-JMK": "long", "MAN-JSI": "long", "MAN-KBP": "long", "MAN-KLX": "long", "MAN-KRN": "long", "MAN-KVA": "long", "MAN-MJT": "long", "MAN-MLA": "long", "MAN-NAP": "long", "MAN-NBE": "long", "MAN-OHD": "long", "MAN-OTP": "long", "MAN-OUD": "long", "MAN-PDL": "long", "MAN-PRN": "long", "MAN-PVK": "long", "MAN-RAK": "long", "MAN-RBA": "long", "MAN-RVN": "long", "MAN-SKG": "long", "MAN-SOF": "long", "MAN-TIA": "long", "MAN-TOS": "long", "MAN-VAR": "long", "MAN-ACE": "extraLong", "MAN-ADB": "extraLong", "MAN-CHQ": "extraLong", "MAN-DLM": "extraLong", "MAN-ESB": "extraLong", "MAN-LPA": "extraLong", "MAN-SPC": "extraLong", "MAN-TFS": "extraLong", "MAN-AQJ": "ultraLong", "MAN-ASM": "ultraLong", "MAN-BEY": "ultraLong", "MAN-BVC": "ultraLong", "MAN-EVN": "ultraLong", "MAN-GYD": "ultraLong", "MAN-HRG": "ultraLong", "MAN-LCA": "ultraLong", "MAN-LXR": "ultraLong", "MAN-PFO": "ultraLong", "MAN-SPX": "ultraLong", "MAN-TBS": "ultraLong", "MAN-TLV": "ultraLong", "MAN-VXE": "ultraLong"};

// seed keys are written as "MAN-XXX" but lookups use routeKey() which sorts alphabetically,
// so "MAN-AEY" (A before M) would never match a lookup for "AEY-MAN" - renormalize once here
function normalizeRouteMap(map) {
  const out = {};
  for (const [k, v] of Object.entries(map)) {
    const [a, b] = k.split('-');
    if (a && b) out[routeKey(a, b)] = v;
  }
  return out;
}

const NORMALIZED_SEED_ROUTES = normalizeRouteMap(SEED_ROUTES);

function defaultSettings() {
  return {
    payDeals: [structuredClone(DEFAULT_DEAL)],
    manualClaimRules: '',
    routeCategories: structuredClone(NORMALIZED_SEED_ROUTES)
  };
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.payDeals || !parsed.payDeals.length) parsed.payDeals = [structuredClone(DEFAULT_DEAL)];
      // re-key any previously-saved routes (some installs may predate the routeKey fix) and backfill new seed routes
      parsed.routeCategories = Object.assign(structuredClone(NORMALIZED_SEED_ROUTES), normalizeRouteMap(parsed.routeCategories || {}));
      if (typeof parsed.manualClaimRules !== 'string') parsed.manualClaimRules = '';
      return parsed;
    } catch (e) { /* fall through */ }
  }
  // migrate from v1 flat-rate settings if present
  const oldRaw = localStorage.getItem(OLD_SETTINGS_KEY);
  if (oldRaw) {
    try {
      const old = JSON.parse(oldRaw);
      const deal = structuredClone(DEFAULT_DEAL);
      if (old.rates) deal.rates = old.rates;
      if (old.commissionPercent != null) deal.commissionPercent = old.commissionPercent;
      if (old.delayTier1 != null) deal.delayTier1 = old.delayTier1;
      if (old.delayTier2 != null) deal.delayTier2 = old.delayTier2;
      if (old.ddoAmount != null) deal.ddoAmount = old.ddoAmount;
      if (old.idoAmount != null) deal.idoAmount = old.idoAmount;
      return {
        payDeals: [deal],
        manualClaimRules: old.manualClaimRules || '',
        routeCategories: Object.assign(structuredClone(NORMALIZED_SEED_ROUTES), normalizeRouteMap(old.routeCategories || {}))
      };
    } catch (e) { /* fall through */ }
  }
  return defaultSettings();
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function loadEntries() {
  const raw = localStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

function saveEntries(list) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(list));
}

let settings = loadSettings();
let entries = loadEntries();
saveSettings(settings); // persist any migration immediately

// ---------- Pay deal lookup ----------
function dealFor(dateStr) {
  const deals = [...settings.payDeals].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  let chosen = deals[0];
  for (const d of deals) {
    if (d.effectiveFrom <= (dateStr || '9999-99-99')) chosen = d;
  }
  return chosen;
}

// ---------- Helpers ----------
function routeKey(a, b) {
  return [a.trim().toUpperCase(), b.trim().toUpperCase()].sort().join('-');
}

// for display only - always shows MAN first since every logged route starts/ends at base
function displayRoute(key) {
  const parts = key.split('-');
  if (parts.length === 2 && parts.includes('MAN')) return ['MAN', parts.find(p => p !== 'MAN')].join('-');
  return key;
}

function fmtGBP(n) {
  const v = Number(n) || 0;
  return '£' + v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtMins(m) {
  m = Math.round(Number(m) || 0);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}m`;
  return `${h}h ${mm}m`;
}

function categoryLabel(cat) {
  const map = { nominal: 'Nominal', short: 'Short', medium: 'Medium', long: 'Long', extraLong: 'Extra Long', ultraLong: 'Ultra Long' };
  return map[cat] || cat;
}

// splits a delay into the minutes that earned pay vs minutes that didn't, per the entry's applicable pay deal
function delaySplit(minutes, deal) {
  const m = Number(minutes) || 0;
  if (m <= 0) return { paidMinutes: 0, unpaidMinutes: 0, amount: 0, status: 'none' };
  if (m >= 120) return { paidMinutes: 120, unpaidMinutes: m - 120, amount: deal.delayTier2, status: 'paid' };
  if (m >= 60) return { paidMinutes: 60, unpaidMinutes: m - 60, amount: deal.delayTier1, status: 'paid' };
  return { paidMinutes: 0, unpaidMinutes: m, amount: 0, status: 'unpaid' };
}

function dayOffPayFor(type, deal) {
  if (type === 'ddo') return deal.ddoAmount || 0;
  if (type === 'ido') return deal.idoAmount || 0;
  return 0;
}

function computeEntryPay(e) {
  const deal = dealFor(e.date);
  const out = { sectorPay: 0, commission: 0, delayPay: 0, dayOffPay: 0, standbyPay: 0, otherPay: 0 };
  if (e.type === 'sector') {
    if (e.diverted) {
      out.sectorPay = Number(e.manualPay) || 0;
    } else {
      const cat = e.returnToStand ? 'nominal' : e.category;
      out.sectorPay = deal.rates[cat] || 0;
    }
    const crew = Number(e.crewCount) || 1;
    const bar = Number(e.barTakings) || 0;
    out.commission = (bar * (deal.commissionPercent / 100)) / crew;
  } else if (e.type === 'standby') {
    out.standbyPay = Number(e.standbyPay) || 0;
  } else if (e.type === 'other') {
    out.otherPay = Number(e.otherPay) || 0;
  }
  const split = delaySplit(e.delayMinutes, deal);
  out.delayPay = split.amount;
  out.delayStatus = split.status;
  out.delayPaidMinutes = split.paidMinutes;
  out.delayUnpaidMinutes = split.unpaidMinutes;
  out.dayOffPay = dayOffPayFor(e.dayOffType, deal);
  out.total = out.sectorPay + out.commission + out.delayPay + out.dayOffPay + out.standbyPay + out.otherPay;
  return out;
}

function monthKey(dateStr) { return (dateStr || '').slice(0, 7); }
function yearKey(dateStr) { return (dateStr || '').slice(0, 4); }

// ---------- Navigation ----------
const views = ['log', 'entries', 'delays', 'payslip', 'stats', 'settings'];
const titles = { log: 'Log entry', entries: 'Entries', delays: 'Delay evidence', payslip: 'Payslip check', stats: 'Statistics', settings: 'Settings' };

function showView(v) {
  views.forEach(name => document.getElementById('view-' + name).classList.toggle('active', name === v));
  document.querySelectorAll('.navbar button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === v));
  document.getElementById('topbarTitle').textContent = titles[v];
  if (v === 'entries') renderEntries();
  if (v === 'delays') renderDelays();
  if (v === 'stats') renderStats();
  if (v === 'settings') fillSettingsForm();
}
document.querySelectorAll('.navbar button').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

// ---------- Log entry form ----------
const entryTypeSeg = document.getElementById('entryTypeSeg');
let currentEntryType = 'sector';
let sectorCount = 1;

entryTypeSeg.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  currentEntryType = btn.dataset.val;
  [...entryTypeSeg.children].forEach(b => b.classList.toggle('active', b === btn));
  document.getElementById('sectorFields').style.display = currentEntryType === 'sector' ? 'block' : 'none';
  document.getElementById('standbyFields').style.display = currentEntryType === 'standby' ? 'block' : 'none';
  document.getElementById('otherFields').style.display = currentEntryType === 'other' ? 'block' : 'none';
  updateComputedStrip();
});

const dayOffSeg = document.getElementById('dayOffSeg');
let currentDayOff = 'none';
dayOffSeg.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  currentDayOff = btn.dataset.val;
  [...dayOffSeg.children].forEach(b => b.classList.toggle('active', b === btn));
  updateComputedStrip();
});

const sectorCountSeg = document.getElementById('sectorCountSeg');
let expandedSectorIdx = 0;
sectorCountSeg.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  sectorCount = Number(btn.dataset.val);
  [...sectorCountSeg.children].forEach(b => b.classList.toggle('active', b === btn));
  expandedSectorIdx = sectorCount - 1; // reveal the newly-added sector, collapse the rest
  renderSectorBlocks();
});

function sectorBlockTemplate(i) {
  return `
  <div class="sector-block" data-idx="${i}">
    <button type="button" class="sector-block-head">
      <span class="sector-block-title">Sector ${i + 1}</span>
      <span class="sector-block-summary"></span>
      <span class="sector-block-chevron">▾</span>
    </button>
    <div class="sector-block-body">
      <div class="row">
        <div>
          <label>From</label>
          <input type="text" class="sb-origin" placeholder="MAN" maxlength="4" style="text-transform:uppercase">
        </div>
        <div>
          <label>To</label>
          <input type="text" class="sb-dest" placeholder="CDG" maxlength="4" style="text-transform:uppercase">
        </div>
      </div>
      <label>Sector length</label>
      <select class="sb-category">
        <option value="">Select or type route above</option>
        <option value="nominal">Nominal (£21.56)</option>
        <option value="short">Short</option>
        <option value="medium">Medium</option>
        <option value="long">Long</option>
        <option value="extraLong">Extra Long</option>
        <option value="ultraLong">Ultra Long</option>
      </select>
      <div class="helptext sb-route-note"></div>

      <div class="check-row">
        <span>Returned to stand / diverted to base</span>
        <label class="switch"><input type="checkbox" class="sb-return"><span class="track"></span><span class="thumb"></span></label>
      </div>

      <div class="check-row">
        <span>Diverted enroute to a different airport</span>
        <label class="switch"><input type="checkbox" class="sb-diverted"><span class="track"></span><span class="thumb"></span></label>
      </div>
      <div class="sb-manual-pay-wrap" style="display:none;">
        <label>Diverted to (airport)</label>
        <input type="text" class="sb-diverted-to" placeholder="e.g. BRS" maxlength="4" style="text-transform:uppercase">
        <label>Sector pay for this diversion (£) - work out manually</label>
        <input type="number" class="sb-manual-pay" step="0.01" placeholder="0.00">
      </div>

      <label>Bar takings this sector (£)</label>
      <input type="number" class="sb-bar" inputmode="decimal" step="0.01" placeholder="0.00">

      <label>Crew operating</label>
      <input type="number" class="sb-crew" inputmode="numeric" min="1" placeholder="4">
      <div class="helptext">Commission is split evenly across this many crew — e.g. £4,000 bar takings at 10% with 4 crew is £100 each.</div>
    </div>
  </div>`;
}

// collapsed-card summary line, e.g. "MAN → CDG · Short" - kept live so a collapsed
// sector still shows what's in it without having to open it back up
function sectorBlockSummary(block) {
  const o = block.querySelector('.sb-origin').value.trim().toUpperCase();
  const d = block.querySelector('.sb-dest').value.trim().toUpperCase();
  const route = o && d ? `${o} → ${d}` : '';
  let detail;
  if (block.querySelector('.sb-diverted').checked) detail = 'Diverted';
  else if (block.querySelector('.sb-return').checked) detail = 'Return to stand';
  else detail = categoryLabel(block.querySelector('.sb-category').value) || '';
  return [route, detail].filter(Boolean).join(' · ') || 'Not filled in yet';
}

function applySectorAccordionState(container) {
  container.querySelectorAll('.sector-block').forEach(block => {
    const idx = Number(block.dataset.idx);
    const expanded = idx === expandedSectorIdx;
    block.classList.toggle('collapsed', !expanded);
    block.querySelector('.sector-block-summary').textContent = expanded ? '' : sectorBlockSummary(block);
  });
}

function captureSectorBlockValues() {
  return [...document.querySelectorAll('#sectorBlocksContainer .sector-block')].map(block => ({
    origin: block.querySelector('.sb-origin').value,
    dest: block.querySelector('.sb-dest').value,
    category: block.querySelector('.sb-category').value,
    returnToStand: block.querySelector('.sb-return').checked,
    diverted: block.querySelector('.sb-diverted').checked,
    divertedTo: block.querySelector('.sb-diverted-to')?.value || '',
    manualPay: block.querySelector('.sb-manual-pay')?.value || '',
    barTakings: block.querySelector('.sb-bar').value,
    crewCount: block.querySelector('.sb-crew').value
  }));
}

function applySectorBlockValues(values) {
  [...document.querySelectorAll('#sectorBlocksContainer .sector-block')].forEach((block, i) => {
    const v = values[i];
    if (!v) return;
    block.querySelector('.sb-origin').value = v.origin || '';
    block.querySelector('.sb-dest').value = v.dest || '';
    block.querySelector('.sb-category').value = v.category || '';
    block.querySelector('.sb-return').checked = v.returnToStand;
    block.querySelector('.sb-diverted').checked = v.diverted;
    const manualWrap = block.querySelector('.sb-manual-pay-wrap');
    manualWrap.style.display = v.diverted ? 'block' : 'none';
    const divertedToInput = block.querySelector('.sb-diverted-to');
    if (divertedToInput) divertedToInput.value = v.divertedTo || '';
    const manualPayInput = block.querySelector('.sb-manual-pay');
    if (manualPayInput) manualPayInput.value = v.manualPay || '';
    block.querySelector('.sb-bar').value = v.barTakings || '';
    block.querySelector('.sb-crew').value = v.crewCount || '';

    const note = block.querySelector('.sb-route-note');
    const o = (v.origin || '').trim().toUpperCase();
    const d = (v.dest || '').trim().toUpperCase();
    if (o.length >= 3 && d.length >= 3) {
      const known = settings.routeCategories[routeKey(o, d)];
      note.textContent = known ? `Remembered: ${o}-${d} is ${categoryLabel(known)}.` : 'New route — pick the sector length and it will be remembered.';
    }
  });
}

function renderSectorBlocks(preserveExisting = true) {
  const preservedValues = preserveExisting ? captureSectorBlockValues() : [];
  const container = document.getElementById('sectorBlocksContainer');
  let html = '';
  for (let i = 0; i < sectorCount; i++) html += sectorBlockTemplate(i);
  container.innerHTML = html;
  container.querySelectorAll('.sector-block').forEach(block => {
    const origin = block.querySelector('.sb-origin');
    const dest = block.querySelector('.sb-dest');
    const catSel = block.querySelector('.sb-category');
    const returnChk = block.querySelector('.sb-return');
    const divertChk = block.querySelector('.sb-diverted');
    const manualWrap = block.querySelector('.sb-manual-pay-wrap');
    const note = block.querySelector('.sb-route-note');

    function autoCat() {
      const o = origin.value.trim().toUpperCase();
      const d = dest.value.trim().toUpperCase();
      if (o.length >= 3 && d.length >= 3) {
        const key = routeKey(o, d);
        const known = settings.routeCategories[key];
        if (known) { catSel.value = known; note.textContent = `Remembered: ${o}-${d} is ${categoryLabel(known)}.`; }
        else { note.textContent = 'New route — pick the sector length and it will be remembered.'; }
      } else { note.textContent = ''; }
      updateComputedStrip();
    }
    origin.addEventListener('input', autoCat);
    dest.addEventListener('input', autoCat);
    catSel.addEventListener('change', updateComputedStrip);
    returnChk.addEventListener('change', updateComputedStrip);
    block.querySelector('.sb-bar').addEventListener('input', updateComputedStrip);
    block.querySelector('.sb-crew').addEventListener('input', updateComputedStrip);
    divertChk.addEventListener('change', () => {
      manualWrap.style.display = divertChk.checked ? 'block' : 'none';
      updateComputedStrip();
    });
    block.querySelector('.sb-manual-pay')?.addEventListener('input', updateComputedStrip);
    block.querySelector('.sb-diverted-to')?.addEventListener('input', updateComputedStrip);
  });
  if (preservedValues.length) applySectorBlockValues(preservedValues);
  applySectorAccordionState(container);
  updateComputedStrip();
}

document.getElementById('sectorBlocksContainer').addEventListener('click', (ev) => {
  const head = ev.target.closest('.sector-block-head');
  if (!head) return;
  const block = head.closest('.sector-block');
  const idx = Number(block.dataset.idx);
  expandedSectorIdx = expandedSectorIdx === idx ? -1 : idx; // click again to close, only one open at a time
  applySectorAccordionState(document.getElementById('sectorBlocksContainer'));
});

document.getElementById('entryDelay').addEventListener('input', updateComputedStrip);
document.getElementById('standbyPay').addEventListener('input', updateComputedStrip);
document.getElementById('otherPay').addEventListener('input', updateComputedStrip);
document.getElementById('entryDate').addEventListener('change', updateComputedStrip);

function readSectorBlocks() {
  return [...document.querySelectorAll('#sectorBlocksContainer .sector-block')].map(block => ({
    origin: block.querySelector('.sb-origin').value.trim().toUpperCase(),
    dest: block.querySelector('.sb-dest').value.trim().toUpperCase(),
    category: block.querySelector('.sb-category').value,
    returnToStand: block.querySelector('.sb-return').checked,
    diverted: block.querySelector('.sb-diverted').checked,
    manualPay: block.querySelector('.sb-manual-pay')?.value || 0,
    divertedTo: (block.querySelector('.sb-diverted-to')?.value || '').trim().toUpperCase(),
    barTakings: block.querySelector('.sb-bar').value,
    crewCount: block.querySelector('.sb-crew').value
  }));
}

function buildDraftEntries() {
  const date = document.getElementById('entryDate').value;
  const willingToFly = document.getElementById('entryWillingToFly').checked;
  const notes = document.getElementById('entryNotes').value;
  const delayMinutes = document.getElementById('entryDelay').value;

  if (currentEntryType === 'sector') {
    const blocks = readSectorBlocks();
    return blocks.map((b, i) => ({
      type: 'sector',
      date, origin: b.origin, dest: b.dest, category: b.category,
      returnToStand: b.returnToStand, diverted: b.diverted, manualPay: b.manualPay, divertedTo: b.divertedTo,
      barTakings: b.barTakings, crewCount: b.crewCount,
      // delay / day-off apply once per duty, only attached to the first sector to avoid double-counting
      dayOffType: i === 0 ? currentDayOff : 'none',
      delayMinutes: i === 0 ? delayMinutes : 0,
      willingToFly: i === 0 ? willingToFly : false,
      notes: i === 0 ? notes : ''
    }));
  } else if (currentEntryType === 'standby') {
    return [{
      type: 'standby', date,
      standbyMinutes: document.getElementById('standbyMinutes').value,
      standbyPay: document.getElementById('standbyPay').value,
      dayOffType: currentDayOff, delayMinutes, willingToFly, notes
    }];
  } else {
    return [{
      type: 'other', date,
      otherDesc: document.getElementById('otherDesc').value,
      otherPay: document.getElementById('otherPay').value,
      dayOffType: currentDayOff, delayMinutes, willingToFly, notes
    }];
  }
}

function updateComputedStrip() {
  const drafts = buildDraftEntries();
  const strip = document.getElementById('computedStrip');
  let lines = '';
  let grandTotal = 0;
  drafts.forEach((draft, i) => {
    const pay = computeEntryPay(draft);
    grandTotal += pay.total;
    if (draft.type === 'sector') {
      const label = draft.diverted ? `Diverted${draft.divertedTo ? ' to ' + draft.divertedTo : ''} — manual` : (draft.returnToStand ? 'Nominal — return to stand' : (categoryLabel(draft.category) || '—'));
      lines += `<div class="line"><span>Sector ${i + 1} pay (${label})</span><span>${fmtGBP(pay.sectorPay)}</span></div>`;
      lines += `<div class="line"><span>Sector ${i + 1} commission</span><span>${fmtGBP(pay.commission)}</span></div>`;
    } else if (draft.type === 'standby') {
      lines += `<div class="line"><span>Standby pay</span><span>${fmtGBP(pay.standbyPay)}</span></div>`;
    } else {
      lines += `<div class="line"><span>${draft.otherDesc || 'Other pay'}</span><span>${fmtGBP(pay.otherPay)}</span></div>`;
    }
    if (draft.dayOffType !== 'none') {
      const label = draft.dayOffType === 'ddo' ? 'DDO' : 'IDO';
      const deal = dealFor(draft.date);
      lines += `<div class="line"><span>${label} pay${draft.dayOffType === 'ido' && !deal.idoAmount ? ' (not confirmed)' : ''}</span><span>${fmtGBP(pay.dayOffPay)}</span></div>`;
    }
    const dm = Number(draft.delayMinutes) || 0;
    if (dm > 0) {
      const statusLabel = pay.delayStatus === 'paid' ? `${fmtMins(pay.delayPaidMinutes)} paid, ${fmtMins(pay.delayUnpaidMinutes)} unpaid` : 'unpaid — logged as evidence';
      lines += `<div class="line"><span>Delay ${dm}min (${statusLabel})</span><span>${fmtGBP(pay.delayPay)}</span></div>`;
    }
  });
  lines += `<div class="line total"><span>Entry total</span><span>${fmtGBP(grandTotal)}</span></div>`;
  strip.innerHTML = lines;

  const sbContainer = document.getElementById('sectorBlocksContainer');
  if (sbContainer) applySectorAccordionState(sbContainer);
}

document.getElementById('saveEntryBtn').addEventListener('click', () => {
  const drafts = buildDraftEntries();
  if (!drafts[0].date) { alert('Add a date first.'); return; }
  if (currentEntryType === 'sector') {
    for (const d of drafts) {
      if (!d.origin || !d.dest) { alert('Add both airports for every sector.'); return; }
      if (!d.returnToStand && !d.diverted && !d.category) { alert('Pick a sector length for every sector (or mark it as return to stand / diverted).'); return; }
      if ((Number(d.barTakings) || 0) > 0 && !(Number(d.crewCount) > 0)) { alert('Enter the crew operating so commission can be split correctly.'); return; }
    }
  }

  drafts.forEach(d => {
    if (d.type === 'sector' && !d.returnToStand && !d.diverted && d.category) {
      const key = routeKey(d.origin, d.dest);
      settings.routeCategories[key] = d.category;
    }
    d.id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  });
  saveSettings(settings);
  entries.push(...drafts);
  saveEntries(entries);

  // reset form (clean wipe - don't carry the just-saved sector values into the new entry)
  sectorCount = 1;
  expandedSectorIdx = 0;
  [...sectorCountSeg.children].forEach((b, i) => b.classList.toggle('active', i === 0));
  renderSectorBlocks(false);
  document.getElementById('entryDelay').value = '';
  document.getElementById('entryWillingToFly').checked = false;
  document.getElementById('entryNotes').value = '';
  document.getElementById('standbyMinutes').value = '';
  document.getElementById('standbyPay').value = '';
  document.getElementById('otherDesc').value = '';
  document.getElementById('otherPay').value = '';
  currentDayOff = 'none';
  [...dayOffSeg.children].forEach((b, i) => b.classList.toggle('active', i === 0));

  const btn = document.getElementById('saveEntryBtn');
  const original = btn.textContent;
  btn.textContent = drafts.length > 1 ? `Saved ${drafts.length} sectors ✓` : 'Saved ✓';
  setTimeout(() => { btn.textContent = original; }, 1400);
});

document.getElementById('entryDate').value = new Date().toISOString().slice(0, 10);
document.getElementById('standbyDate').value = new Date().toISOString().slice(0, 10);
document.getElementById('otherDate').value = new Date().toISOString().slice(0, 10);
renderSectorBlocks();

// ---------- Entries view ----------
let entriesViewMonth = new Date().toISOString().slice(0, 7);
document.getElementById('prevMonthBtn').addEventListener('click', () => { entriesViewMonth = shiftMonth(entriesViewMonth, -1); renderEntries(); });
document.getElementById('nextMonthBtn').addEventListener('click', () => { entriesViewMonth = shiftMonth(entriesViewMonth, 1); renderEntries(); });

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function renderEntries() {
  document.getElementById('entriesMonthLabel').textContent = entriesViewMonth;
  const list = entries.filter(e => monthKey(e.date) === entriesViewMonth).sort((a, b) => b.date.localeCompare(a.date));
  const container = document.getElementById('entriesList');
  if (list.length === 0) { container.innerHTML = '<div class="empty">No entries logged for this month yet.</div>'; return; }
  container.innerHTML = list.map(e => {
    const pay = computeEntryPay(e);
    let title, sub;
    if (e.type === 'sector') {
      title = `${e.origin} → ${e.dest}`;
      sub = e.diverted ? `Diverted enroute${e.divertedTo ? ' to ' + e.divertedTo : ''} (manual)` : (e.returnToStand ? 'Nominal (return to stand)' : categoryLabel(e.category));
    } else if (e.type === 'standby') { title = 'Standby'; sub = `${e.standbyMinutes || 0} min`; }
    else { title = e.otherDesc || 'Other pay'; sub = e.date; }
    const tags = [];
    if (e.dayOffType === 'ddo') tags.push('<span class="tag">DDO</span>');
    if (e.dayOffType === 'ido') tags.push('<span class="tag">IDO</span>');
    if (e.diverted) tags.push('<span class="tag warn">Diverted</span>');
    if (e.source === 'payslip-import') tags.push('<span class="tag">Imported</span>');
    if (Number(e.delayMinutes) > 0) {
      tags.push(pay.delayStatus === 'paid' ? `<span class="tag ok">Delay ${fmtMins(e.delayMinutes)} paid</span>` : `<span class="tag warn">Delay ${fmtMins(e.delayMinutes)} unpaid</span>`);
    }
    if (e.willingToFly) tags.push('<span class="tag">Willing to fly</span>');
    return `<div class="entry-item">
      <div>
        <div class="route">${title}</div>
        <div class="meta">${e.date} · ${sub}</div>
        <div class="tags">${tags.join('')}</div>
      </div>
      <div>
        <div class="amount">${fmtGBP(pay.total)}</div>
        <button class="icon-btn" data-del="${e.id}">✕</button>
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this entry?')) return;
      entries = entries.filter(e => e.id !== btn.dataset.del);
      saveEntries(entries);
      renderEntries();
    });
  });
}

// ---------- Delays view ----------
function renderDelays() {
  const withDelay = entries.filter(e => Number(e.delayMinutes) > 0).sort((a, b) => b.date.localeCompare(a.date));
  let paidMin = 0, unpaidMin = 0, paidTotal = 0, paidCount = 0, unpaidCount = 0;
  withDelay.forEach(e => {
    const deal = dealFor(e.date);
    const s = delaySplit(e.delayMinutes, deal);
    paidMin += s.paidMinutes; unpaidMin += s.unpaidMinutes;
    if (s.status === 'paid') { paidTotal += s.amount; paidCount++; } else { unpaidCount++; }
  });

  document.getElementById('unpaidDelayCount').textContent = withDelay.length;
  document.getElementById('unpaidDelayMinutes').textContent = `${fmtMins(unpaidMin)} unpaid, ${fmtMins(paidMin)} paid`;
  document.getElementById('paidDelayCount').textContent = paidCount;
  document.getElementById('paidDelayTotal').textContent = fmtGBP(paidTotal) + ' total';

  const container = document.getElementById('delaysList');
  if (withDelay.length === 0) { container.innerHTML = '<div class="empty">No delays logged yet.</div>'; return; }
  container.innerHTML = withDelay.map(e => {
    const deal = dealFor(e.date);
    const s = delaySplit(e.delayMinutes, deal);
    const label = e.type === 'sector' ? `${e.origin} → ${e.dest}` : (e.type === 'standby' ? 'Standby' : (e.otherDesc || 'Other'));
    const detail = s.status === 'paid' ? `${fmtMins(s.paidMinutes)} paid (${fmtGBP(s.amount)}), ${fmtMins(s.unpaidMinutes)} unpaid on top` : `${fmtMins(s.unpaidMinutes)} — all unpaid`;
    return `<div class="entry-item">
      <div><div class="route">${label}</div><div class="meta">${e.date} · ${fmtMins(e.delayMinutes)} total delay</div></div>
      <div>
        <div class="tags">${s.status === 'paid' ? `<span class="tag ok">${detail}</span>` : `<span class="tag warn">${detail}</span>`}</div>
        <button class="icon-btn" data-del="${e.id}">✕</button>
      </div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Remove this delay record?')) return;
      entries = entries.filter(e => e.id !== btn.dataset.del);
      saveEntries(entries);
      renderDelays();
    });
  });
}

// ---------- Payslip cross-check (single month) ----------
document.getElementById('payslipMonth').value = new Date().toISOString().slice(0, 7);
document.getElementById('compareBtn').addEventListener('click', () => {
  const month = document.getElementById('payslipMonth').value;
  if (!month) { alert('Pick the month first.'); return; }
  const monthEntries = entries.filter(e => monthKey(e.date) === month);
  let calc = { sectorPay: 0, commission: 0, delayPay: 0, dayOffPay: 0, standbyPay: 0 };
  monthEntries.forEach(e => {
    const p = computeEntryPay(e);
    calc.sectorPay += p.sectorPay; calc.commission += p.commission; calc.delayPay += p.delayPay;
    calc.dayOffPay += p.dayOffPay; calc.standbyPay += p.standbyPay;
  });
  const payslip = {
    sectorPay: Number(document.getElementById('pSectorPay').value) || 0,
    commission: Number(document.getElementById('pCommission').value) || 0,
    delayPay: Number(document.getElementById('pDelay').value) || 0,
    dayOffPay: Number(document.getElementById('pDayOff').value) || 0,
    standbyPay: Number(document.getElementById('pStandby').value) || 0
  };
  const rows = [
    ['Sector Pay', calc.sectorPay, payslip.sectorPay],
    ['Commission', calc.commission, payslip.commission],
    ['Delay / Disruption Pay', calc.delayPay, payslip.delayPay],
    ['Day Off Disruption Pay', calc.dayOffPay, payslip.dayOffPay],
    ['Airport Standby Pay', calc.standbyPay, payslip.standbyPay]
  ];
  const html = rows.map(([label, mine, theirs]) => {
    const match = Math.abs(mine - theirs) < 0.01;
    return `<div class="diff-row ${match ? 'match' : 'mismatch'}"><span>${label}</span><span class="val">${fmtGBP(mine)} logged vs ${fmtGBP(theirs)} paid ${match ? '✓' : '⚠'}</span></div>`;
  }).join('');
  const totalMine = rows.reduce((s, r) => s + r[1], 0);
  const totalTheirs = rows.reduce((s, r) => s + r[2], 0);
  const diff = totalTheirs - totalMine;
  document.getElementById('compareResults').innerHTML = `<div class="card" style="background:var(--navy-800); margin:0;">${html}
    <div class="diff-row" style="border-top:1px solid var(--navy-600); margin-top:6px; padding-top:10px; font-weight:600;">
      <span>Total</span><span class="val" style="color:${Math.abs(diff) < 0.01 ? 'var(--green)' : 'var(--red)'}">${diff >= 0 ? '+' : ''}${fmtGBP(diff)} ${Math.abs(diff) < 0.01 ? '(matches)' : (diff > 0 ? '(overpaid vs your log)' : '(underpaid — worth querying)')}</span>
    </div></div>`;
});

// ---------- Payslip paste-import (bulk historical) ----------
const CAT_WORD_MAP = [
  ['ultra-long', 'ultraLong'], ['ultra long', 'ultraLong'],
  ['extra-long', 'extraLong'], ['extra long', 'extraLong'],
  ['nominal', 'nominal'], ['medium', 'medium'], ['long', 'long'], ['short', 'short']
];
const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

function parsePayslipText(text) {
  const results = [];
  const dateSplit = /(\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})/g;
  const marks = [...text.matchAll(dateSplit)];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index;
    const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
    const chunk = text.slice(start, end);
    const [, dd, mon, yyyy] = marks[i];
    const date = `${yyyy}-${MONTHS[mon]}-${dd}`;

    if (/Sector Pay/i.test(chunk)) {
      const catMatch = CAT_WORD_MAP.find(([word]) => chunk.toLowerCase().includes(word));
      const routeMatch = chunk.match(/from\s+([A-Z]{3})\s+to\s+([A-Z]{3})/i);
      if (catMatch && routeMatch) {
        results.push({
          include: true, type: 'sector', date,
          origin: routeMatch[1].toUpperCase(), dest: routeMatch[2].toUpperCase(),
          category: catMatch[1], returnToStand: false, diverted: false,
          barTakings: 0, crewCount: '', dayOffType: 'none', delayMinutes: 0, willingToFly: false,
          notes: 'Imported from payslip — bar takings/crew not on payslip, add if known.',
          source: 'payslip-import'
        });
      }
    } else if (/Airport Standby Pay/i.test(chunk)) {
      const minMatch = chunk.match(/(\d+)\s*minute standby/i);
      results.push({
        include: true, type: 'standby', date,
        standbyMinutes: minMatch ? minMatch[1] : '', standbyPay: 0,
        dayOffType: 'none', delayMinutes: 0, willingToFly: false,
        notes: 'Imported from payslip — amount not on this line, check your TOTALS section.',
        source: 'payslip-import'
      });
    } else if (/Disrupted\/Infringed Day Off Pay|Delayed day off/i.test(chunk)) {
      results.push({
        include: true, type: 'other', date,
        otherDesc: 'Disrupted Day Off (imported)', otherPay: 0,
        dayOffType: 'none', delayMinutes: 0, willingToFly: false,
        notes: 'Imported from payslip — check DDO vs IDO and the amount from your TOTALS section.',
        source: 'payslip-import'
      });
    } else if (/Leave Pay/i.test(chunk)) {
      results.push({
        include: true, type: 'other', date,
        otherDesc: 'Leave Pay (imported)', otherPay: 0,
        dayOffType: 'none', delayMinutes: 0, willingToFly: false,
        notes: 'Imported from payslip — check amount from your TOTALS section.',
        source: 'payslip-import'
      });
    }
  }
  return results;
}

let pendingImport = [];

// extracts text from a PDF page-by-page, grouping items sharing a y-position into one line
// so the output reads similarly to what you'd get copy-pasting from a PDF viewer
async function readPdfText(doc) {
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY = null, line = '';
    for (const item of content.items) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) { text += line.trim() + '\n'; line = ''; }
      line += item.str + ' ';
      lastY = y;
    }
    text += line.trim() + '\n';
  }
  return text;
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
}

async function extractTextFromPdf(file) {
  if (!window.__pdfjsLib) throw new Error('The PDF reader is still loading — wait a second and try again.');
  try {
    // a fresh Uint8Array per attempt - pdf.js transfers (and so detaches) this buffer
    // when handing it to its worker, and reusing an already-detached buffer on retry
    // throws "The object can not be cloned" instead of actually retrying
    const buf = new Uint8Array(await file.arrayBuffer());
    const doc = await withTimeout(
      window.__pdfjsLib.getDocument({ data: buf }).promise,
      12000,
      'Timed out starting the PDF reader.'
    );
    return await readPdfText(doc);
  } catch (e) {
    // Some browsers (notably Safari, when the page is controlled by a service worker) can
    // fail to start pdf.js's dedicated module worker and hang or throw instead of reading
    // the file. Retry once with the worker disabled so parsing runs on the main thread.
    const buf = new Uint8Array(await file.arrayBuffer());
    const doc = await withTimeout(
      window.__pdfjsLib.getDocument({ data: buf, worker: null }).promise,
      20000,
      'Timed out reading the PDF, even without the background worker.'
    );
    return await readPdfText(doc);
  }
}

document.getElementById('payslipPdfFile').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const status = document.getElementById('payslipPdfStatus');
  status.textContent = 'Reading PDF…';
  try {
    const text = await extractTextFromPdf(file);
    document.getElementById('payslipPasteArea').value = text;
    pendingImport = parsePayslipText(text);
    renderImportPreview();
    status.textContent = pendingImport.length
      ? `Read ${pendingImport.length} rows from the PDF — check them below before importing.`
      : 'Read the PDF but found nothing recognisable. Check the text below, or paste the VARIABLE PAY section manually.';
  } catch (e) {
    status.textContent = 'Could not read that PDF (' + e.message + '). Try pasting the text instead.';
  }
  document.getElementById('payslipPdfFile').value = '';
});

document.getElementById('parsePayslipBtn').addEventListener('click', () => {
  const text = document.getElementById('payslipPasteArea').value;
  if (!text.trim()) { alert('Paste the VARIABLE PAY section text first.'); return; }
  pendingImport = parsePayslipText(text);
  renderImportPreview();
});

function renderImportPreview() {
  const container = document.getElementById('importPreview');
  if (pendingImport.length === 0) {
    container.innerHTML = '<div class="empty">Nothing recognised in that text. Make sure you copied the VARIABLE PAY section.</div>';
    document.getElementById('confirmImportBtn').style.display = 'none';
    return;
  }
  container.innerHTML = pendingImport.map((row, i) => {
    const label = row.type === 'sector' ? `${row.origin} → ${row.dest} (${categoryLabel(row.category)})` : (row.type === 'standby' ? `Standby, ${row.standbyMinutes || '?'} min` : row.otherDesc);
    return `<div class="check-row">
      <span>${row.date} · ${label}</span>
      <label class="switch"><input type="checkbox" class="import-toggle" data-i="${i}" checked><span class="track"></span><span class="thumb"></span></label>
    </div>`;
  }).join('');
  container.querySelectorAll('.import-toggle').forEach(chk => {
    chk.addEventListener('change', () => { pendingImport[Number(chk.dataset.i)].include = chk.checked; });
  });
  document.getElementById('confirmImportBtn').style.display = 'block';
  document.getElementById('confirmImportBtn').textContent = `Import ${pendingImport.length} rows`;
}

document.getElementById('confirmImportBtn').addEventListener('click', () => {
  const toImport = pendingImport.filter(r => r.include).map(r => {
    const { include, ...rest } = r;
    rest.id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    return rest;
  });
  entries.push(...toImport);
  saveEntries(entries);
  alert(`Imported ${toImport.length} entries. You can review them in Entries, they're tagged "Imported".`);
  document.getElementById('payslipPasteArea').value = '';
  pendingImport = [];
  renderImportPreview();
});

// ---------- CSV delay import (e.g. exported from Flighty or similar) ----------
let csvRows = [];
let csvHeaders = [];

document.getElementById('csvFile').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseCSV(reader.result);
    csvHeaders = parsed.headers;
    csvRows = parsed.rows;
    const mapDiv = document.getElementById('csvMapping');

    // guess sensible defaults - Flighty-style exports don't have a ready-made "delay minutes"
    // column, but do have scheduled vs actual arrival timestamps we can work the delay out from
    const findCol = (...names) => csvHeaders.find(h => names.some(n => h.toLowerCase() === n.toLowerCase())) || '— none —';
    const guessDate = findCol('date');
    const guessOrigin = findCol('from', 'origin', 'departure airport');
    const guessDest = findCol('to', 'destination', 'arrival airport');
    const guessDelayMinutes = findCol('delay', 'delay minutes', 'delay (minutes)');
    const guessSched = findCol('gate arrival (scheduled)', 'landing (scheduled)', 'scheduled arrival');
    const guessActual = findCol('gate arrival (actual)', 'landing (actual)', 'actual arrival');
    const defaultMode = guessDelayMinutes !== '— none —' ? 'minutes'
      : (guessSched !== '— none —' && guessActual !== '— none —' ? 'timestamps' : 'minutes');

    const opts = (selected) => ['— none —', ...csvHeaders].map(h => `<option ${h === selected ? 'selected' : ''}>${h}</option>`).join('');

    mapDiv.innerHTML = `
      <label>Date column</label><select id="csvDateCol">${opts(guessDate)}</select>
      <label>Origin column (optional)</label><select id="csvOriginCol">${opts(guessOrigin)}</select>
      <label>Destination column (optional)</label><select id="csvDestCol">${opts(guessDest)}</select>

      <label>How is the delay recorded?</label>
      <select id="csvDelayMode">
        <option value="minutes" ${defaultMode === 'minutes' ? 'selected' : ''}>A single delay-minutes column</option>
        <option value="timestamps" ${defaultMode === 'timestamps' ? 'selected' : ''}>Scheduled vs actual arrival time (work the delay out for me)</option>
      </select>

      <div id="csvDelayMinutesWrap" style="${defaultMode === 'minutes' ? '' : 'display:none;'}">
        <label>Delay minutes column</label><select id="csvDelayCol">${opts(guessDelayMinutes)}</select>
      </div>
      <div id="csvDelayTimestampsWrap" style="${defaultMode === 'timestamps' ? '' : 'display:none;'}">
        <label>Scheduled arrival column</label><select id="csvSchedCol">${opts(guessSched)}</select>
        <label>Actual arrival column</label><select id="csvActualCol">${opts(guessActual)}</select>
      </div>
      <div class="helptext">${csvRows.length} rows found in file.</div>`;

    document.getElementById('csvDelayMode').addEventListener('change', (e) => {
      const mode = e.target.value;
      document.getElementById('csvDelayMinutesWrap').style.display = mode === 'minutes' ? 'block' : 'none';
      document.getElementById('csvDelayTimestampsWrap').style.display = mode === 'timestamps' ? 'block' : 'none';
    });

    document.getElementById('csvImportBtn').style.display = 'block';
  };
  reader.readAsText(file);
});

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const splitLine = (line) => {
    const out = []; let cur = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQuotes = !inQuotes; }
      else if (c === ',' && !inQuotes) { out.push(cur); cur = ''; }
      else { cur += c; }
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(splitLine);
  return { headers, rows };
}

document.getElementById('csvImportBtn').addEventListener('click', () => {
  const dateCol = document.getElementById('csvDateCol').value;
  const originCol = document.getElementById('csvOriginCol').value;
  const destCol = document.getElementById('csvDestCol').value;
  const mode = document.getElementById('csvDelayMode').value;
  if (dateCol === '— none —') { alert('Pick a date column.'); return; }
  const dateIdx = csvHeaders.indexOf(dateCol);
  const originIdx = csvHeaders.indexOf(originCol);
  const destIdx = csvHeaders.indexOf(destCol);

  let getMinutes;
  if (mode === 'minutes') {
    const delayCol = document.getElementById('csvDelayCol').value;
    if (delayCol === '— none —') { alert('Pick the delay minutes column.'); return; }
    const delayIdx = csvHeaders.indexOf(delayCol);
    getMinutes = (row) => Number(row[delayIdx]);
  } else {
    const schedCol = document.getElementById('csvSchedCol').value;
    const actualCol = document.getElementById('csvActualCol').value;
    if (schedCol === '— none —' || actualCol === '— none —') { alert('Pick both the scheduled and actual arrival columns.'); return; }
    const schedIdx = csvHeaders.indexOf(schedCol);
    const actualIdx = csvHeaders.indexOf(actualCol);
    // delay = how much later the actual arrival was than scheduled, in whole minutes
    getMinutes = (row) => {
      const sched = new Date(row[schedIdx]);
      const actual = new Date(row[actualIdx]);
      if (isNaN(sched.getTime()) || isNaN(actual.getTime())) return NaN;
      return Math.round((actual.getTime() - sched.getTime()) / 60000);
    };
  }

  // group by day - a delayed roster runs late as a whole duty, not as separate delays
  // per sector, so a 4-sector day all running ~30min late becomes one 30min delay
  // entry for that day (the worst delay seen that day), not four
  const byDate = new Map();
  csvRows.forEach(row => {
    const rawDate = row[dateIdx];
    if (!rawDate) return;
    const mins = getMinutes(row);
    if (!mins || isNaN(mins) || mins <= 0) return;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return;
    const date = d.toISOString().slice(0, 10);
    const origin = originIdx >= 0 ? row[originIdx] : '';
    const dest = destIdx >= 0 ? row[destIdx] : '';
    if (!byDate.has(date)) byDate.set(date, { maxMins: 0, legs: [] });
    const day = byDate.get(date);
    day.maxMins = Math.max(day.maxMins, mins);
    if (origin || dest) day.legs.push(origin && dest ? `${origin}-${dest}` : (origin || dest));
  });

  let imported = 0;
  byDate.forEach((day, date) => {
    const label = day.legs.length > 1
      ? `${day.legs[0]} … ${day.legs[day.legs.length - 1]} (${day.legs.length} sectors)`
      : (day.legs[0] || 'Imported delay');
    entries.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type: 'other', date,
      otherDesc: label,
      otherPay: 0, dayOffType: 'none', delayMinutes: day.maxMins, willingToFly: false,
      notes: 'Imported from CSV for delay evidence only — no pay attached.',
      source: 'csv-import'
    });
    imported++;
  });
  saveEntries(entries);
  alert(`Imported ${imported} day(s) with a delay.`);
  document.getElementById('csvFile').value = '';
  document.getElementById('csvMapping').innerHTML = '';
  document.getElementById('csvImportBtn').style.display = 'none';
});

// ---------- Stats ----------
let statsPeriod = 'all';
document.getElementById('statsPeriodSeg').addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  statsPeriod = btn.dataset.val;
  [...document.getElementById('statsPeriodSeg').children].forEach(b => b.classList.toggle('active', b === btn));
  renderStats();
});

function entriesForStatsPeriod() {
  if (statsPeriod === 'month') { const mk = new Date().toISOString().slice(0, 7); return entries.filter(e => monthKey(e.date) === mk); }
  if (statsPeriod === 'year') { const yk = new Date().toISOString().slice(0, 4); return entries.filter(e => yearKey(e.date) === yk); }
  return entries;
}

function renderStats() {
  const scoped = entriesForStatsPeriod();
  const sectorEntries = scoped.filter(e => e.type === 'sector');
  const grid = document.getElementById('statsGrid');

  const totalEarned = scoped.reduce((s, e) => s + computeEntryPay(e).total, 0);
  const totalBar = sectorEntries.reduce((s, e) => s + (Number(e.barTakings) || 0), 0);
  const largestBar = sectorEntries.reduce((max, e) => Math.max(max, Number(e.barTakings) || 0), 0);
  const willingCount = scoped.filter(e => e.willingToFly).length;
  const delayedEntries = scoped.filter(e => Number(e.delayMinutes) > 0);
  let unpaidMin = 0, paidMin = 0;
  delayedEntries.forEach(e => { const s = delaySplit(e.delayMinutes, dealFor(e.date)); unpaidMin += s.unpaidMinutes; paidMin += s.paidMinutes; });

  const stats = [
    ['Total logged pay', fmtGBP(totalEarned), `${scoped.length} entries`],
    ['Total bar takings', fmtGBP(totalBar), `${sectorEntries.length} sectors`],
    ['Largest single bar', fmtGBP(largestBar), ''],
    ['Willing to fly', willingCount, 'times logged'],
    ['Sectors delayed', delayedEntries.length, ''],
    ['Unpaid delay time', fmtMins(unpaidMin), `${fmtMins(paidMin)} paid on top`]
  ];
  grid.innerHTML = stats.map(([label, value, sub]) => `<div class="stat-box"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`).join('');

  const routeCounts = {};
  sectorEntries.forEach(e => { const r = `${e.origin}-${e.dest}`; routeCounts[r] = (routeCounts[r] || 0) + 1; });
  const top = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topContainer = document.getElementById('topRoutes');
  topContainer.innerHTML = top.length === 0 ? '<div class="empty">No sectors logged yet.</div>' :
    top.map(([route, count]) => `<div class="entry-item"><div class="route">${route}</div><div class="amount">${count}×</div></div>`).join('');

  renderBreakdowns();
}

// month-by-month and year-by-year totals, independent of the period selector above
function renderBreakdowns() {
  const byMonth = {};
  const byYear = {};
  entries.forEach(e => {
    const mk = monthKey(e.date);
    const yk = yearKey(e.date);
    if (!mk || !yk) return;
    const pay = computeEntryPay(e);
    const dm = Number(e.delayMinutes) || 0;
    const split = dm > 0 ? delaySplit(dm, dealFor(e.date)) : { paidMinutes: 0, unpaidMinutes: 0 };

    if (!byMonth[mk]) byMonth[mk] = { total: 0, sectors: 0, unpaidDelay: 0, paidDelay: 0 };
    byMonth[mk].total += pay.total;
    if (e.type === 'sector') byMonth[mk].sectors++;
    byMonth[mk].unpaidDelay += split.unpaidMinutes;
    byMonth[mk].paidDelay += split.paidMinutes;

    if (!byYear[yk]) byYear[yk] = { total: 0, sectors: 0, unpaidDelay: 0, paidDelay: 0 };
    byYear[yk].total += pay.total;
    if (e.type === 'sector') byYear[yk].sectors++;
    byYear[yk].unpaidDelay += split.unpaidMinutes;
    byYear[yk].paidDelay += split.paidMinutes;
  });

  const rowHtml = (label, s) => `
    <div class="entry-item">
      <div>
        <div class="route">${label}</div>
        <div class="meta">${s.sectors} sectors · ${fmtMins(s.unpaidDelay)} unpaid delay, ${fmtMins(s.paidDelay)} paid</div>
      </div>
      <div class="amount">${fmtGBP(s.total)}</div>
    </div>`;

  const monthRows = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));
  const yearRows = Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0]));

  document.getElementById('monthlyBreakdown').innerHTML = monthRows.length === 0
    ? '<div class="empty">No entries logged yet.</div>'
    : monthRows.map(([k, s]) => rowHtml(k, s)).join('');

  document.getElementById('yearlyBreakdown').innerHTML = yearRows.length === 0
    ? '<div class="empty">No entries logged yet.</div>'
    : yearRows.map(([k, s]) => rowHtml(k, s)).join('');
}

// ---------- Settings ----------
function fillSettingsForm() {
  const deals = [...settings.payDeals].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  const list = document.getElementById('payDealsList');
  list.innerHTML = deals.map(d => `
    <div class="pay-deal-card" data-id="${d.id}">
      <div class="pay-deal-head">
        <input type="date" class="pd-effective" value="${d.effectiveFrom}">
        ${deals.length > 1 ? `<button class="icon-btn pd-delete">✕</button>` : ''}
      </div>
      <div class="row"><div><label>Nominal</label><input type="number" step="0.01" class="pd-nominal" value="${d.rates.nominal}"></div>
      <div><label>Short</label><input type="number" step="0.01" class="pd-short" value="${d.rates.short}"></div></div>
      <div class="row"><div><label>Medium</label><input type="number" step="0.01" class="pd-medium" value="${d.rates.medium}"></div>
      <div><label>Long</label><input type="number" step="0.01" class="pd-long" value="${d.rates.long}"></div></div>
      <div class="row"><div><label>Extra Long</label><input type="number" step="0.01" class="pd-extraLong" value="${d.rates.extraLong}"></div>
      <div><label>Ultra Long</label><input type="number" step="0.01" class="pd-ultraLong" value="${d.rates.ultraLong}"></div></div>
      <div class="row"><div><label>Commission %</label><input type="number" step="0.1" class="pd-commission" value="${d.commissionPercent}"></div>
      <div><label>DDO £</label><input type="number" step="0.01" class="pd-ddo" value="${d.ddoAmount}"></div></div>
      <div class="row"><div><label>IDO £</label><input type="number" step="0.01" class="pd-ido" value="${d.idoAmount || ''}" placeholder="Not confirmed"></div>
      <div></div></div>
      <div class="row"><div><label>Delay 1hr+ £</label><input type="number" step="0.01" class="pd-tier1" value="${d.delayTier1}"></div>
      <div><label>Delay 2hr+ £</label><input type="number" step="0.01" class="pd-tier2" value="${d.delayTier2}"></div></div>
    </div>`).join('');

  list.querySelectorAll('.pd-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.pay-deal-card').dataset.id;
      if (!confirm('Remove this pay deal version? Entries dated within it will fall back to the next applicable deal.')) return;
      settings.payDeals = settings.payDeals.filter(d => d.id !== id);
      saveSettings(settings);
      fillSettingsForm();
    });
  });

  document.getElementById('manualClaimRules').value = settings.manualClaimRules || '';

  const routeList = document.getElementById('routeManagerList');
  const cats = ['nominal', 'short', 'medium', 'long', 'extraLong', 'ultraLong'];
  const routes = Object.entries(settings.routeCategories).sort((a, b) => a[0].localeCompare(b[0]));
  document.getElementById('routeCountLabel').textContent = `${routes.length} routes`;
  routeList.innerHTML = routes.map(([route, cat]) => `
    <div class="route-manager-item">
      <span>${displayRoute(route)}</span>
      <select data-route="${route}">${cats.map(c => `<option value="${c}" ${c === cat ? 'selected' : ''}>${categoryLabel(c)}</option>`).join('')}</select>
    </div>`).join('');
  routeList.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', () => { settings.routeCategories[sel.dataset.route] = sel.value; saveSettings(settings); });
  });
}

document.getElementById('addPayDealBtn').addEventListener('click', () => {
  const latest = dealFor(new Date().toISOString().slice(0, 10));
  const newDeal = structuredClone(latest);
  newDeal.id = 'deal-' + Date.now();
  newDeal.effectiveFrom = new Date().toISOString().slice(0, 10);
  settings.payDeals.push(newDeal);
  saveSettings(settings);
  fillSettingsForm();
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  document.querySelectorAll('.pay-deal-card').forEach(card => {
    const id = card.dataset.id;
    const deal = settings.payDeals.find(d => d.id === id);
    if (!deal) return;
    deal.effectiveFrom = card.querySelector('.pd-effective').value || deal.effectiveFrom;
    deal.rates.nominal = Number(card.querySelector('.pd-nominal').value) || 0;
    deal.rates.short = Number(card.querySelector('.pd-short').value) || 0;
    deal.rates.medium = Number(card.querySelector('.pd-medium').value) || 0;
    deal.rates.long = Number(card.querySelector('.pd-long').value) || 0;
    deal.rates.extraLong = Number(card.querySelector('.pd-extraLong').value) || 0;
    deal.rates.ultraLong = Number(card.querySelector('.pd-ultraLong').value) || 0;
    deal.commissionPercent = Number(card.querySelector('.pd-commission').value) || 0;
    deal.ddoAmount = Number(card.querySelector('.pd-ddo').value) || 0;
    const idoVal = card.querySelector('.pd-ido').value;
    deal.idoAmount = idoVal ? Number(idoVal) : null;
    deal.delayTier1 = Number(card.querySelector('.pd-tier1').value) || 0;
    deal.delayTier2 = Number(card.querySelector('.pd-tier2').value) || 0;
  });
  settings.manualClaimRules = document.getElementById('manualClaimRules').value;
  saveSettings(settings);
  const btn = document.getElementById('saveSettingsBtn');
  const original = btn.textContent;
  btn.textContent = 'Saved ✓';
  setTimeout(() => { btn.textContent = original; }, 1200);
  fillSettingsForm();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify({ settings, entries }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `flightpay-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.settings) settings = Object.assign(defaultSettings(), data.settings);
      if (data.entries) entries = data.entries;
      saveSettings(settings); saveEntries(entries);
      alert('Backup imported.');
      fillSettingsForm();
    } catch (e) { alert('Could not read that file.'); }
  };
  reader.readAsText(file);
});

document.getElementById('wipeBtn').addEventListener('click', () => {
  if (!confirm('This erases all entries and settings on this device permanently. Export a backup first if unsure. Continue?')) return;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(ENTRIES_KEY);
  settings = defaultSettings();
  entries = [];
  saveSettings(settings);
  fillSettingsForm();
  renderEntries();
  alert('All data erased.');
});

// ---------- Service worker ----------
// PWAs installed on a phone keep serving whatever was cached on first install otherwise -
// this makes sure a newly-activated worker takes over and reloads the page automatically.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.update();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update(); });
    }).catch(() => {});
  });
  let refreshingForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    location.reload();
  });
}

function updateOnlinePill() {
  document.getElementById('offlinePill').textContent = navigator.onLine ? '● online' : '● offline-ready';
}
window.addEventListener('online', updateOnlinePill);
window.addEventListener('offline', updateOnlinePill);
updateOnlinePill();
