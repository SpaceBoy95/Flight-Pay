// ---------- Storage ----------
const SETTINGS_KEY = 'flightpay-settings-v1';
const ENTRIES_KEY = 'flightpay-entries-v1';

const DEFAULT_SETTINGS = {
  rates: {
    nominal: 21.56,
    short: 17.25,
    medium: 25.87,
    long: 32.34,
    extraLong: 53.90,
    ultraLong: 64.68
  },
  commissionPercent: 10,
  delayTier1: 15,   // paid at 60+ minutes
  delayTier2: 30,   // paid at 120+ minutes
  ddoAmount: 109.52,
  idoAmount: null,  // not confirmed yet
  manualClaimRules: '',
  routeCategories: {
    'ACE-MAN': 'extraLong',
    'AGA-MAN': 'long',
    'AYT-MAN': 'extraLong',
    'BOD-MAN': 'medium',
    'CDG-MAN': 'short',
    'MAD-MAN': 'medium',
    'PFO-MAN': 'ultraLong',
    'TFS-MAN': 'extraLong'
  }
};

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return structuredClone(DEFAULT_SETTINGS);
  try {
    return Object.assign(structuredClone(DEFAULT_SETTINGS), JSON.parse(raw));
  } catch (e) {
    return structuredClone(DEFAULT_SETTINGS);
  }
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

// ---------- Helpers ----------
function routeKey(a, b) {
  return [a.trim().toUpperCase(), b.trim().toUpperCase()].sort().join('-');
}

function fmtGBP(n) {
  const v = Number(n) || 0;
  return '£' + v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function categoryLabel(cat) {
  const map = { nominal: 'Nominal', short: 'Short', medium: 'Medium', long: 'Long', extraLong: 'Extra Long', ultraLong: 'Ultra Long' };
  return map[cat] || cat;
}

function delayPayFor(minutes) {
  const m = Number(minutes) || 0;
  if (m >= 120) return { amount: settings.delayTier2, status: 'paid' };
  if (m >= 60) return { amount: settings.delayTier1, status: 'paid' };
  if (m > 0) return { amount: 0, status: 'unpaid' };
  return { amount: 0, status: 'none' };
}

function dayOffPayFor(type) {
  if (type === 'ddo') return settings.ddoAmount || 0;
  if (type === 'ido') return settings.idoAmount || 0;
  return 0;
}

function computeEntryPay(e) {
  const out = { sectorPay: 0, commission: 0, delayPay: 0, dayOffPay: 0, standbyPay: 0, otherPay: 0 };
  if (e.type === 'sector') {
    const cat = e.returnToStand ? 'nominal' : e.category;
    out.sectorPay = settings.rates[cat] || 0;
    const crew = Number(e.crewCount) || 1;
    const bar = Number(e.barTakings) || 0;
    out.commission = (bar * (settings.commissionPercent / 100)) / crew;
  } else if (e.type === 'standby') {
    out.standbyPay = Number(e.standbyPay) || 0;
  } else if (e.type === 'other') {
    out.otherPay = Number(e.otherPay) || 0;
  }
  const d = delayPayFor(e.delayMinutes);
  out.delayPay = d.amount;
  out.delayStatus = d.status;
  out.dayOffPay = dayOffPayFor(e.dayOffType);
  out.total = out.sectorPay + out.commission + out.delayPay + out.dayOffPay + out.standbyPay + out.otherPay;
  return out;
}

function monthKey(dateStr) {
  return (dateStr || '').slice(0, 7); // YYYY-MM
}

// ---------- Navigation ----------
const views = ['log', 'entries', 'delays', 'payslip', 'stats', 'settings'];
const titles = { log: 'Log entry', entries: 'Entries', delays: 'Delay evidence', payslip: 'Payslip check', stats: 'Statistics', settings: 'Settings' };

function showView(v) {
  views.forEach(name => {
    document.getElementById('view-' + name).classList.toggle('active', name === v);
  });
  document.querySelectorAll('.navbar button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === v);
  });
  document.getElementById('topbarTitle').textContent = titles[v];
  if (v === 'entries') renderEntries();
  if (v === 'delays') renderDelays();
  if (v === 'stats') renderStats();
  if (v === 'settings') fillSettingsForm();
}

document.querySelectorAll('.navbar button').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

// ---------- Log entry form ----------
const entryTypeSeg = document.getElementById('entryTypeSeg');
let currentEntryType = 'sector';

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

function tryAutoCategory() {
  const o = document.getElementById('entryOrigin').value.trim().toUpperCase();
  const d = document.getElementById('entryDest').value.trim().toUpperCase();
  const note = document.getElementById('routeMemoryNote');
  if (o.length >= 3 && d.length >= 3) {
    const key = routeKey(o, d);
    const known = settings.routeCategories[key];
    if (known) {
      document.getElementById('entryCategorySelect').value = known;
      note.textContent = `Remembered: ${o}-${d} is ${categoryLabel(known)}.`;
    } else {
      note.textContent = `New route. Pick the sector length below and it'll be remembered for next time.`;
    }
  } else {
    note.textContent = '';
  }
  updateComputedStrip();
}
document.getElementById('entryOrigin').addEventListener('input', tryAutoCategory);
document.getElementById('entryDest').addEventListener('input', tryAutoCategory);
document.getElementById('entryCategorySelect').addEventListener('change', updateComputedStrip);
document.getElementById('entryReturnToStand').addEventListener('change', updateComputedStrip);
document.getElementById('entryBar').addEventListener('input', updateComputedStrip);
document.getElementById('entryCrew').addEventListener('input', updateComputedStrip);
document.getElementById('entryDelay').addEventListener('input', updateComputedStrip);
document.getElementById('standbyPay').addEventListener('input', updateComputedStrip);
document.getElementById('otherPay').addEventListener('input', updateComputedStrip);

function buildDraftEntry() {
  if (currentEntryType === 'sector') {
    return {
      type: 'sector',
      date: document.getElementById('entryDate').value,
      origin: document.getElementById('entryOrigin').value.trim().toUpperCase(),
      dest: document.getElementById('entryDest').value.trim().toUpperCase(),
      category: document.getElementById('entryCategorySelect').value,
      returnToStand: document.getElementById('entryReturnToStand').checked,
      barTakings: document.getElementById('entryBar').value,
      crewCount: document.getElementById('entryCrew').value,
      dayOffType: currentDayOff,
      delayMinutes: document.getElementById('entryDelay').value,
      willingToFly: document.getElementById('entryWillingToFly').checked,
      notes: document.getElementById('entryNotes').value
    };
  } else if (currentEntryType === 'standby') {
    return {
      type: 'standby',
      date: document.getElementById('standbyDate').value,
      standbyMinutes: document.getElementById('standbyMinutes').value,
      standbyPay: document.getElementById('standbyPay').value,
      dayOffType: currentDayOff,
      delayMinutes: document.getElementById('entryDelay').value,
      willingToFly: document.getElementById('entryWillingToFly').checked,
      notes: document.getElementById('entryNotes').value
    };
  } else {
    return {
      type: 'other',
      date: document.getElementById('otherDate').value,
      otherDesc: document.getElementById('otherDesc').value,
      otherPay: document.getElementById('otherPay').value,
      dayOffType: currentDayOff,
      delayMinutes: document.getElementById('entryDelay').value,
      willingToFly: document.getElementById('entryWillingToFly').checked,
      notes: document.getElementById('entryNotes').value
    };
  }
}

function updateComputedStrip() {
  const draft = buildDraftEntry();
  const pay = computeEntryPay(draft);
  const strip = document.getElementById('computedStrip');
  let lines = '';
  if (draft.type === 'sector') {
    lines += `<div class="line"><span>Sector pay (${draft.returnToStand ? 'Nominal - return to stand' : categoryLabel(draft.category) || '—'})</span><span>${fmtGBP(pay.sectorPay)}</span></div>`;
    lines += `<div class="line"><span>Commission share</span><span>${fmtGBP(pay.commission)}</span></div>`;
  } else if (draft.type === 'standby') {
    lines += `<div class="line"><span>Standby pay</span><span>${fmtGBP(pay.standbyPay)}</span></div>`;
  } else {
    lines += `<div class="line"><span>${draft.otherDesc || 'Other pay'}</span><span>${fmtGBP(pay.otherPay)}</span></div>`;
  }
  if (draft.dayOffType !== 'none') {
    const label = draft.dayOffType === 'ddo' ? 'DDO' : 'IDO';
    lines += `<div class="line"><span>${label} pay${draft.dayOffType === 'ido' && !settings.idoAmount ? ' (not confirmed)' : ''}</span><span>${fmtGBP(pay.dayOffPay)}</span></div>`;
  }
  const dm = Number(draft.delayMinutes) || 0;
  if (dm > 0) {
    const statusLabel = pay.delayStatus === 'paid' ? 'paid' : 'unpaid - logged as evidence';
    lines += `<div class="line"><span>Delay ${dm}min (${statusLabel})</span><span>${fmtGBP(pay.delayPay)}</span></div>`;
  }
  lines += `<div class="line total"><span>Entry total</span><span>${fmtGBP(pay.total)}</span></div>`;
  strip.innerHTML = lines;
}

document.getElementById('saveEntryBtn').addEventListener('click', () => {
  const draft = buildDraftEntry();
  if (!draft.date) { alert('Add a date first.'); return; }
  if (draft.type === 'sector' && (!draft.origin || !draft.dest)) { alert('Add both airports.'); return; }
  if (draft.type === 'sector' && !draft.returnToStand && !draft.category) { alert('Pick a sector length.'); return; }

  if (draft.type === 'sector') {
    const key = routeKey(draft.origin, draft.dest);
    if (!draft.returnToStand && draft.category) {
      settings.routeCategories[key] = draft.category;
      saveSettings(settings);
    }
  }

  draft.id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  entries.push(draft);
  saveEntries(entries);

  // reset form
  document.getElementById('entryOrigin').value = '';
  document.getElementById('entryDest').value = '';
  document.getElementById('entryCategorySelect').value = '';
  document.getElementById('entryReturnToStand').checked = false;
  document.getElementById('entryBar').value = '';
  document.getElementById('entryCrew').value = '';
  document.getElementById('entryDelay').value = '';
  document.getElementById('entryWillingToFly').checked = false;
  document.getElementById('entryNotes').value = '';
  document.getElementById('standbyMinutes').value = '';
  document.getElementById('standbyPay').value = '';
  document.getElementById('otherDesc').value = '';
  document.getElementById('otherPay').value = '';
  currentDayOff = 'none';
  [...dayOffSeg.children].forEach((b, i) => b.classList.toggle('active', i === 0));
  document.getElementById('routeMemoryNote').textContent = '';
  updateComputedStrip();

  const btn = document.getElementById('saveEntryBtn');
  const original = btn.textContent;
  btn.textContent = 'Saved ✓';
  setTimeout(() => { btn.textContent = original; }, 1200);
});

// default date to today
document.getElementById('entryDate').value = new Date().toISOString().slice(0, 10);
document.getElementById('standbyDate').value = new Date().toISOString().slice(0, 10);
document.getElementById('otherDate').value = new Date().toISOString().slice(0, 10);
updateComputedStrip();

// ---------- Entries view ----------
let entriesViewMonth = new Date().toISOString().slice(0, 7);

document.getElementById('prevMonthBtn').addEventListener('click', () => {
  entriesViewMonth = shiftMonth(entriesViewMonth, -1);
  renderEntries();
});
document.getElementById('nextMonthBtn').addEventListener('click', () => {
  entriesViewMonth = shiftMonth(entriesViewMonth, 1);
  renderEntries();
});

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function renderEntries() {
  document.getElementById('entriesMonthLabel').textContent = entriesViewMonth;
  const list = entries.filter(e => monthKey(e.date) === entriesViewMonth).sort((a, b) => b.date.localeCompare(a.date));
  const container = document.getElementById('entriesList');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty">No entries logged for this month yet.</div>';
    return;
  }
  container.innerHTML = list.map(e => {
    const pay = computeEntryPay(e);
    let title, sub;
    if (e.type === 'sector') {
      title = `${e.origin} → ${e.dest}`;
      sub = e.returnToStand ? 'Nominal (return to stand)' : categoryLabel(e.category);
    } else if (e.type === 'standby') {
      title = 'Standby';
      sub = `${e.standbyMinutes || 0} min`;
    } else {
      title = e.otherDesc || 'Other pay';
      sub = e.date;
    }
    const tags = [];
    if (e.dayOffType === 'ddo') tags.push('<span class="tag">DDO</span>');
    if (e.dayOffType === 'ido') tags.push('<span class="tag">IDO</span>');
    if (Number(e.delayMinutes) > 0) {
      tags.push(pay.delayStatus === 'paid' ? `<span class="tag ok">Delay ${e.delayMinutes}m paid</span>` : `<span class="tag warn">Delay ${e.delayMinutes}m unpaid</span>`);
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
  const unpaid = withDelay.filter(e => delayPayFor(e.delayMinutes).status === 'unpaid');
  const paid = withDelay.filter(e => delayPayFor(e.delayMinutes).status === 'paid');

  document.getElementById('unpaidDelayCount').textContent = unpaid.length;
  document.getElementById('unpaidDelayMinutes').textContent = unpaid.reduce((s, e) => s + Number(e.delayMinutes || 0), 0) + ' min total';
  document.getElementById('paidDelayCount').textContent = paid.length;
  document.getElementById('paidDelayTotal').textContent = fmtGBP(paid.reduce((s, e) => s + delayPayFor(e.delayMinutes).amount, 0)) + ' total';

  const container = document.getElementById('delaysList');
  if (withDelay.length === 0) {
    container.innerHTML = '<div class="empty">No delays logged yet.</div>';
    return;
  }
  container.innerHTML = withDelay.map(e => {
    const d = delayPayFor(e.delayMinutes);
    const label = e.type === 'sector' ? `${e.origin} → ${e.dest}` : (e.type === 'standby' ? 'Standby' : (e.otherDesc || 'Other'));
    return `<div class="entry-item">
      <div>
        <div class="route">${label}</div>
        <div class="meta">${e.date} · ${e.delayMinutes} min delay</div>
      </div>
      <div class="tags">${d.status === 'paid' ? `<span class="tag ok">${fmtGBP(d.amount)} paid</span>` : '<span class="tag warn">Unpaid</span>'}</div>
    </div>`;
  }).join('');
}

// ---------- Payslip cross-check ----------
document.getElementById('payslipMonth').value = new Date().toISOString().slice(0, 7);

document.getElementById('compareBtn').addEventListener('click', () => {
  const month = document.getElementById('payslipMonth').value;
  if (!month) { alert('Pick the month first.'); return; }
  const monthEntries = entries.filter(e => monthKey(e.date) === month);

  let calc = { sectorPay: 0, commission: 0, delayPay: 0, dayOffPay: 0, standbyPay: 0, otherPay: 0 };
  monthEntries.forEach(e => {
    const p = computeEntryPay(e);
    calc.sectorPay += p.sectorPay;
    calc.commission += p.commission;
    calc.delayPay += p.delayPay;
    calc.dayOffPay += p.dayOffPay;
    calc.standbyPay += p.standbyPay;
    calc.otherPay += p.otherPay;
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
    return `<div class="diff-row ${match ? 'match' : 'mismatch'}">
      <span>${label}</span>
      <span class="val">${fmtGBP(mine)} logged vs ${fmtGBP(theirs)} paid ${match ? '✓' : '⚠'}</span>
    </div>`;
  }).join('');

  const totalMine = rows.reduce((s, r) => s + r[1], 0);
  const totalTheirs = rows.reduce((s, r) => s + r[2], 0);
  const diff = totalTheirs - totalMine;

  document.getElementById('compareResults').innerHTML = `
    <div class="card" style="background:var(--navy-800); margin:0;">
      ${html}
      <div class="diff-row" style="border-top:1px solid var(--navy-600); margin-top:6px; padding-top:10px; font-weight:600;">
        <span>Total</span>
        <span class="val" style="color:${Math.abs(diff) < 0.01 ? 'var(--green)' : 'var(--red)'}">${diff >= 0 ? '+' : ''}${fmtGBP(diff)} ${Math.abs(diff) < 0.01 ? '(matches)' : (diff > 0 ? '(overpaid vs your log - check entries)' : '(underpaid - worth querying)')}</span>
      </div>
    </div>`;
});

// ---------- Stats ----------
function renderStats() {
  const sectorEntries = entries.filter(e => e.type === 'sector');
  const grid = document.getElementById('statsGrid');

  const totalEarned = entries.reduce((s, e) => s + computeEntryPay(e).total, 0);
  const totalBar = sectorEntries.reduce((s, e) => s + (Number(e.barTakings) || 0), 0);
  const largestBar = sectorEntries.reduce((max, e) => Math.max(max, Number(e.barTakings) || 0), 0);
  const willingCount = entries.filter(e => e.willingToFly).length;
  const totalDelayed = entries.filter(e => Number(e.delayMinutes) > 0).length;
  const unpaidDelayMin = entries.filter(e => delayPayFor(e.delayMinutes).status === 'unpaid').reduce((s, e) => s + Number(e.delayMinutes || 0), 0);

  const stats = [
    ['Total logged pay', fmtGBP(totalEarned), `${entries.length} entries`],
    ['Total bar takings', fmtGBP(totalBar), `${sectorEntries.length} sectors`],
    ['Largest single bar', fmtGBP(largestBar), ''],
    ['Willing to fly', willingCount, 'times logged'],
    ['Sectors delayed', totalDelayed, ''],
    ['Unpaid delay minutes', unpaidDelayMin, 'union evidence']
  ];

  grid.innerHTML = stats.map(([label, value, sub]) => `
    <div class="stat-box">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="sub">${sub}</div>
    </div>`).join('');

  const routeCounts = {};
  sectorEntries.forEach(e => {
    const r = `${e.origin}-${e.dest}`;
    routeCounts[r] = (routeCounts[r] || 0) + 1;
  });
  const top = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topContainer = document.getElementById('topRoutes');
  if (top.length === 0) {
    topContainer.innerHTML = '<div class="empty">No sectors logged yet.</div>';
  } else {
    topContainer.innerHTML = top.map(([route, count]) => `
      <div class="entry-item">
        <div class="route">${route}</div>
        <div class="amount">${count}×</div>
      </div>`).join('');
  }
}

// ---------- Settings ----------
function fillSettingsForm() {
  document.getElementById('rateNominal').value = settings.rates.nominal;
  document.getElementById('rateShort').value = settings.rates.short;
  document.getElementById('rateMedium').value = settings.rates.medium;
  document.getElementById('rateLong').value = settings.rates.long;
  document.getElementById('rateExtraLong').value = settings.rates.extraLong;
  document.getElementById('rateUltraLong').value = settings.rates.ultraLong;
  document.getElementById('commissionPercent').value = settings.commissionPercent;
  document.getElementById('delayTier1').value = settings.delayTier1;
  document.getElementById('delayTier2').value = settings.delayTier2;
  document.getElementById('ddoAmount').value = settings.ddoAmount;
  document.getElementById('idoAmount').value = settings.idoAmount || '';
  document.getElementById('manualClaimRules').value = settings.manualClaimRules || '';
  document.getElementById('idoWarning').textContent = settings.idoAmount ? '' : 'IDO amount not confirmed yet - IDO entries will log as £0 until you fill this in.';

  const list = document.getElementById('routeManagerList');
  const cats = ['nominal', 'short', 'medium', 'long', 'extraLong', 'ultraLong'];
  const routes = Object.entries(settings.routeCategories);
  if (routes.length === 0) {
    list.innerHTML = '<div class="empty">No routes learned yet, they\'ll appear here as you log sectors.</div>';
  } else {
    list.innerHTML = routes.map(([route, cat]) => `
      <div class="route-manager-item">
        <span>${route}</span>
        <select data-route="${route}">
          ${cats.map(c => `<option value="${c}" ${c === cat ? 'selected' : ''}>${categoryLabel(c)}</option>`).join('')}
        </select>
      </div>`).join('');
    list.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', () => {
        settings.routeCategories[sel.dataset.route] = sel.value;
        saveSettings(settings);
      });
    });
  }
}

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  settings.rates.nominal = Number(document.getElementById('rateNominal').value) || 0;
  settings.rates.short = Number(document.getElementById('rateShort').value) || 0;
  settings.rates.medium = Number(document.getElementById('rateMedium').value) || 0;
  settings.rates.long = Number(document.getElementById('rateLong').value) || 0;
  settings.rates.extraLong = Number(document.getElementById('rateExtraLong').value) || 0;
  settings.rates.ultraLong = Number(document.getElementById('rateUltraLong').value) || 0;
  settings.commissionPercent = Number(document.getElementById('commissionPercent').value) || 0;
  settings.delayTier1 = Number(document.getElementById('delayTier1').value) || 0;
  settings.delayTier2 = Number(document.getElementById('delayTier2').value) || 0;
  settings.ddoAmount = Number(document.getElementById('ddoAmount').value) || 0;
  const idoVal = document.getElementById('idoAmount').value;
  settings.idoAmount = idoVal ? Number(idoVal) : null;
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
  a.href = url;
  a.download = `flightpay-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.settings) settings = Object.assign(structuredClone(DEFAULT_SETTINGS), data.settings);
      if (data.entries) entries = data.entries;
      saveSettings(settings);
      saveEntries(entries);
      alert('Backup imported.');
      fillSettingsForm();
    } catch (e) {
      alert('Could not read that file.');
    }
  };
  reader.readAsText(file);
});

document.getElementById('wipeBtn').addEventListener('click', () => {
  if (!confirm('This erases all entries and settings on this device permanently. Export a backup first if unsure. Continue?')) return;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(ENTRIES_KEY);
  settings = structuredClone(DEFAULT_SETTINGS);
  entries = [];
  fillSettingsForm();
  renderEntries();
  alert('All data erased.');
});

// ---------- Service worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ---------- Online/offline pill ----------
function updateOnlinePill() {
  const pill = document.getElementById('offlinePill');
  pill.textContent = navigator.onLine ? '● online' : '● offline-ready';
}
window.addEventListener('online', updateOnlinePill);
window.addEventListener('offline', updateOnlinePill);
updateOnlinePill();
