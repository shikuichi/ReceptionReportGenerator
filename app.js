/*
 * 作品名：受信報告書ジェネレーター
 * 作者  ：しくいち (Shikuichi)
 * 著作権：Copyright (C) 2016-2026 しくいちの散歩道
 * Version: 2026-11-12
 *
 * 【ライセンスおよび利用条件について】
 * このプログラムはフリーソフトウェアです。あなたは、フリーソフトウェア財団が発行した 
 * GNU 一般公衆利用許諾書（バージョン3、またはそれ以降のライセンス）の定める条件の下で、このプログラムを再頒布または改変することができます。
 * 作者のスタンスとして、商用利用・改変・再配布などは、本ライセンスの範囲内において完全にご自由に行っていただいて構いません。
 * 本プログラムは、有用であることを願って配布されていますが、全くの無保証です。
 * 市場性および特定の目的に対する適合性についての暗黙の保証もありません。
 * ライセンスの全文（公式規定）については、以下のリンク先を各自参照してください。
 *
 * ■ GNU General Public License, version 3 (GPLv3)
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * For the full text of the license, please refer to:
 * https://www.gnu.org/licenses/gpl-3.0.html
*/

const FORM_FIELDS = [
  'report_lang', 'target_station', 'target_department', 'target_honorific',
  'station_name', 'call_sign', 'freq_unit', 'frequency_val', 'channel_val',
  'program_title', 'language', 'reception_date', 'time_start', 'time_end',
  'time_zone_type', 'reception_place', 'sinpo_s', 'sinpo_i', 'sinpo_n', 'sinpo_p', 'sinpo_o',
  'tv_picture', 'tv_sound', 'receiver_model', 'antenna_model', 'program_log',
  'comments', 'qsl_request', 'include_return_postage', 'sender_name',
  'sender_zip', 'sender_address', 'sender_email'
];

const SENDER_FIELDS = ['sender_name', 'sender_zip', 'sender_address', 'sender_email', 'receiver_model', 'antenna_model'];

const STORAGE_KEY = 'Reception_Report_Generator_Input_Data';

// タブ・コンテナ要素
const tabFormBtn = document.getElementById('tab-form-btn');
const tabPreviewBtn = document.getElementById('tab-preview-btn');
const formContainer = document.getElementById('form-container');
const printArea = document.getElementById('print-area');

// ヘッダー機能ボタン・メニュー要素
const btnHelp = document.getElementById('btn-help');
const btnLoadSample = document.getElementById('btn-load-sample');
const btnExportToggle = document.getElementById('btn-export-toggle');
const exportMenu = document.getElementById('export-menu');
const btnImportToggle = document.getElementById('btn-import-toggle');
const importMenu = document.getElementById('import-menu');

const tipHelp = document.getElementById('tip-help');
const tipSample = document.getElementById('tip-sample');
const tipExport = document.getElementById('tip-export');
const tipImport = document.getElementById('tip-import');

function hideAllMobileTips() {
  if (tipHelp) tipHelp.classList.add('hidden');
  if (tipSample) tipSample.classList.add('hidden');
  if (tipExport) tipExport.classList.add('hidden');
  if (tipImport) tipImport.classList.add('hidden');
}

function switchMobileTab(target) {
  if (window.innerWidth >= 1024) return;

  if (target === 'preview') {
    if (formContainer) formContainer.classList.add('hidden');
    if (printArea) printArea.classList.remove('hidden');

    if (tabPreviewBtn) tabPreviewBtn.className = 'py-3 text-xs font-bold border-b-2 border-amber-theme text-amber-theme flex items-center justify-center transition';
    if (tabFormBtn) tabFormBtn.className = 'py-3 text-xs font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center justify-center transition';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    if (printArea) printArea.classList.add('hidden');
    if (formContainer) formContainer.classList.remove('hidden');

    if (tabFormBtn) tabFormBtn.className = 'py-3 text-xs font-bold border-b-2 border-amber-theme text-amber-theme flex items-center justify-center transition';
    if (tabPreviewBtn) tabPreviewBtn.className = 'py-3 text-xs font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center justify-center transition';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

if (tabFormBtn) tabFormBtn.addEventListener('click', () => switchMobileTab('form'));
if (tabPreviewBtn) tabPreviewBtn.addEventListener('click', () => switchMobileTab('preview'));

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    if (formContainer) formContainer.classList.remove('hidden');
    if (printArea) printArea.classList.remove('hidden');
  } else {
    if (printArea && !printArea.classList.contains('hidden') && formContainer && formContainer.classList.contains('hidden')) {
      // プレビュー表示状態維持
    } else {
      if (formContainer) formContainer.classList.remove('hidden');
      if (printArea) printArea.classList.add('hidden');
    }
  }
});

function showToast(msg, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  const iconWrap = document.getElementById('toast-icon-wrap');

  if (!toast || !toastMsg || !iconWrap) return;

  toastMsg.textContent = msg;
  if (isSuccess) {
    iconWrap.innerHTML = '<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  } else {
    iconWrap.innerHTML = '<svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  }

  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function getFormData() {
  const data = {};
  FORM_FIELDS.forEach(id => {
    const radGroup = document.querySelectorAll(`input[name="${id}"]`);
    if (radGroup.length > 0) {
      radGroup.forEach(r => {
        if (r.checked) data[id] = r.value;
      });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    if (el.type === 'checkbox') {
      data[id] = el.checked;
    } else {
      data[id] = el.value;
    }
  });
  return data;
}

function setFormData(data, targetFields = FORM_FIELDS) {
  targetFields.forEach(id => {
    if (data[id] === undefined) return;

    const radGroup = document.querySelectorAll(`input[name="${id}"]`);
    if (radGroup.length > 0) {
      radGroup.forEach(r => {
        r.checked = (r.value === data[id]);
      });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    if (el.type === 'checkbox') {
      el.checked = !!data[id];
    } else {
      el.value = data[id];
    }
  });

  updateUIState();
  updatePreview();
}

function updateUIState() {
  const freqUnit = document.querySelector('input[name="freq_unit"]:checked')?.value || 'MHz';
  const freqGroup = document.getElementById('freq-input-group');
  const chGroup = document.getElementById('ch-input-group');
  const unitLabel = document.getElementById('freq-unit-label');
  const freqInput = document.getElementById('frequency_val');
  const chInput = document.getElementById('channel_val');

  const sinpoContainer = document.getElementById('sinpo-container');
  const tvEvalContainer = document.getElementById('tv-eval-container');
  const evalBadge = document.getElementById('eval-code-preview');

  if (freqUnit === 'ch') {
    if (freqGroup) freqGroup.classList.add('hidden');
    if (chGroup) chGroup.classList.remove('hidden');
    if (freqInput) freqInput.removeAttribute('required');
    if (chInput) chInput.setAttribute('required', 'required');

    if (sinpoContainer) sinpoContainer.classList.add('hidden');
    if (tvEvalContainer) tvEvalContainer.classList.remove('hidden');

    const tvPic = document.getElementById('tv_picture')?.value || 'P5';
    const tvSnd = document.getElementById('tv_sound')?.value || 'Q5';
    const p = tvPic.split(' ')[0] || 'P5';
    const q = tvSnd.split(' ')[0] || 'Q5';
    if (evalBadge) {
      evalBadge.textContent = `${p} / ${q}`;
    }
  } else {
    if (freqGroup) freqGroup.classList.remove('hidden');
    if (chGroup) chGroup.classList.add('hidden');
    if (freqInput) freqInput.setAttribute('required', 'required');
    if (chInput) chInput.removeAttribute('required');
    if (unitLabel) unitLabel.textContent = freqUnit;

    if (sinpoContainer) sinpoContainer.classList.remove('hidden');
    if (tvEvalContainer) tvEvalContainer.classList.add('hidden');

    const s = document.getElementById('sinpo_s')?.value;
    const i = document.getElementById('sinpo_i')?.value;
    const n = document.getElementById('sinpo_n')?.value;
    const p = document.getElementById('sinpo_p')?.value;
    const o = document.getElementById('sinpo_o')?.value;

    const isSinpoComplete = (s && i && n && p && o);

    if (evalBadge) {
      evalBadge.textContent = isSinpoComplete ? `SINPO: ${s}${i}${n}${p}${o}` : '-';
    }
  }
}

function updatePreview() {
  const data = getFormData();
  const isEn = (data.report_lang === 'en');
  const isTV = (data.freq_unit === 'ch');
  const evalBadge = document.getElementById('eval-code-preview');

  // 文書タイトル・報告日
  const docTitleEl = document.getElementById('pv-doc-title');
  if (docTitleEl) docTitleEl.textContent = isEn ? 'RECEPTION REPORT' : '受 信 報 告 書';
  const subTitleEl = document.getElementById('pv-sub-title');
  if (subTitleEl) subTitleEl.textContent = isEn ? 'Broadcast Monitoring & Verification Request' : 'Reception Report';
  const lblReportDate = document.getElementById('lbl-report-date');
  if (lblReportDate) lblReportDate.textContent = isEn ? 'Date of Report:' : '報告日:';

  const today = new Date();
  const reportDateEl = document.getElementById('pv-report-date');
  if (reportDateEl) {
    if (isEn) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      reportDateEl.textContent = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    } else {
      reportDateEl.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    }
  }

  // 宛名・部署・敬称
  const tgtStation = (data.target_station || data.station_name || '').trim();
  const targetStationEl = document.getElementById('pv-target-station');
  if (targetStationEl) {
    if (tgtStation) {
      targetStationEl.textContent = isEn ? `To: ${tgtStation}` : tgtStation;
      targetStationEl.parentElement?.classList.remove('hidden');
    } else {
      targetStationEl.textContent = '';
      targetStationEl.parentElement?.classList.add('hidden');
    }
  }

  const deptEl = document.getElementById('pv-target-department');
  const honorificEl = document.getElementById('pv-target-honorific');

  if (deptEl) deptEl.textContent = data.target_department || '';
  if (honorificEl) {
    if (isEn) {
      honorificEl.textContent = '';
      honorificEl.classList.add('hidden');
    } else {
      honorificEl.classList.remove('hidden');
      honorificEl.textContent = data.target_honorific || '';
    }
  }

  // 冒頭の挨拶文
  const greetingEl = document.getElementById('pv-greeting');
  if (greetingEl) {
    if (isEn) {
      greetingEl.textContent = 'Dear Sir/Madam: I am pleased to report reception of your broadcast as detailed below. If this report is found correct according to your log, I would be most grateful to receive your verification (QSL) card.';
    } else {
      greetingEl.textContent = '貴局の放送を下記のとおりに受信いたしましたので、ご報告申し上げます。';
    }
  }

  // 表の見出しラベル
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElText('lbl-tbl-station', isEn ? 'Station Name' : '放送局名');
  setElText('lbl-tbl-callsign', isEn ? 'Call Sign' : 'コールサイン');
  setElText('lbl-tbl-freq', isTV ? (isEn ? 'Physical Channel' : '受信チャンネル') : (isEn ? 'Frequency' : '受信周波数'));
  setElText('lbl-tbl-program', isEn ? 'Program Title' : '番組名');
  setElText('lbl-tbl-datetime', isEn ? 'Date & Time' : '受信日時');
  setElText('lbl-tbl-location', isEn ? 'Reception Location' : '受信場所');
  setElText('lbl-tbl-eval', isEn ? 'Reception Quality' : '受信状態の評価');
  setElText('lbl-tbl-equipment', isEn ? 'Equipment' : '受信機器・アンテナ');

  function setOptionalTableRow(rowId, valId, value) {
    const row = document.getElementById(rowId);
    const cell = document.getElementById(valId);
    const clean = (value || '').trim();
    if (row && cell) {
      if (clean) {
        cell.textContent = clean;
        row.classList.remove('hidden');
      } else {
        cell.textContent = '';
        row.classList.add('hidden');
      }
    }
  }

  setElText('pv-tbl-station', (data.station_name && data.station_name.trim()) ? data.station_name.trim() : '-');

  // コールサイン
  setOptionalTableRow('pv-row-callsign', 'pv-tbl-callsign', data.call_sign ? data.call_sign.toUpperCase() : '');

  // 受信周波数/チャンネル
  let freqDisplay = '-';
  if (isTV) {
    if (data.channel_val && data.channel_val.trim()) {
      freqDisplay = isEn ? `Ch. ${data.channel_val.trim()}` : `${data.channel_val.trim()} ch`;
    }
  } else {
    if (data.frequency_val && data.frequency_val.trim()) {
      freqDisplay = `${data.frequency_val.trim()} ${data.freq_unit}`;
    }
  }
  setElText('pv-tbl-freq', freqDisplay);

  let progDisplay = '';
  if (data.program_title && data.program_title.trim()) {
    const langStr = data.language && data.language.trim() ? (isEn ? ` (Language: ${data.language.trim()})` : `（言語: ${data.language.trim()}）`) : '';
    progDisplay = `${data.program_title.trim()}${langStr}`;
  }
  setOptionalTableRow('pv-row-program', 'pv-tbl-program', progDisplay);

  let dateFormatted = '';
  if (data.reception_date) {
    const parts = data.reception_date.split('-');
    if (parts.length === 3) {
      if (isEn) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateFormatted = `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
      } else {
        dateFormatted = `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
      }
    }
  }
  const tz = data.time_zone_type || 'JST';
  let timeStr = '';
  if (data.time_start && data.time_end) {
    timeStr = `${data.time_start} - ${data.time_end} (${tz})`;
  } else if (data.time_start) {
    timeStr = `${data.time_start} (${tz})`;
  }
  const fullDateTime = (dateFormatted || timeStr) ? `${dateFormatted} ${timeStr}`.trim() : '-';
  setElText('pv-tbl-datetime', fullDateTime);

  // 受信場所
  setElText('pv-tbl-location', (data.reception_place && data.reception_place.trim()) ? data.reception_place.trim() : '-');

  // 受信評価
  let evalDisplay = '-';
  if (isTV) {
    evalDisplay = `${data.tv_picture || 'P5'} / ${data.tv_sound || 'Q5'}`;
  } else {
    const s = data.sinpo_s;
    const i = data.sinpo_i;
    const n = data.sinpo_n;
    const p = data.sinpo_p;
    const o = data.sinpo_o;
    const isSinpoComplete = (s && i && n && p && o);

    if (isSinpoComplete) {
      if (evalBadge) {
        evalBadge.textContent = `SINPO: ${s}${i}${n}${p}${o}`;
      }
      evalDisplay = `SINPO: ${s}${i}${n}${p}${o} (S:${s} I:${i} N:${n} P:${p} O:${o})`;
    } else {
      if (evalBadge) {
        evalBadge.textContent = '-';
      }
      evalDisplay = '-';
    }
  }
  setElText('pv-tbl-eval', evalDisplay);

  // 受信機器・アンテナ
  const equip = [];
  if (data.receiver_model && data.receiver_model.trim()) {
    equip.push(isEn ? `[Receiver] ${data.receiver_model.trim()}` : `【受信機】${data.receiver_model.trim()}`);
  }
  if (data.antenna_model && data.antenna_model.trim()) {
    equip.push(isEn ? `[Antenna] ${data.antenna_model.trim()}` : `【空中線】${data.antenna_model.trim()}`);
  }
  setElText('pv-tbl-equipment', equip.length > 0 ? equip.join(' / ') : '-');

  // 放送内容 & 感想 見出し
  const logTitleEl = document.getElementById('lbl-log-title');
  if (logTitleEl) {
    logTitleEl.innerHTML = isEn
      ? '<span class="inline-block w-2 h-2 bg-slate-900 mr-1.5"></span>Program Details & Reception Log'
      : '<span class="inline-block w-2 h-2 bg-slate-900 mr-1.5"></span>放送内容の記録 (Reception Details)';
  }

  const commentsTitleEl = document.getElementById('lbl-comments-title');
  if (commentsTitleEl) {
    commentsTitleEl.innerHTML = isEn
      ? '<span class="inline-block w-2 h-2 bg-slate-900 mr-1.5"></span>Comments & Feedback'
      : '<span class="inline-block w-2 h-2 bg-slate-900 mr-1.5"></span>番組への感想 (Comments)';
  }

  // 放送内容の記録
  const logEl = document.getElementById('pv-program-log');
  if (logEl) {
    logEl.textContent = (data.program_log && data.program_log.trim())
      ? data.program_log.trim()
      : (isEn ? '(No reception log entered)' : '（放送内容は未入力です）');
  }

  // 番組への感想
  const commentBlock = document.getElementById('pv-comment-block');
  const commentsEl = document.getElementById('pv-comments');
  if (commentBlock && commentsEl) {
    if (data.comments && data.comments.trim()) {
      commentsEl.textContent = data.comments.trim();
      commentBlock.classList.remove('hidden');
    } else {
      commentsEl.textContent = '';
      commentBlock.classList.add('hidden');
    }
  }

  // ベリカードお願い文
  const qslReqEl = document.getElementById('pv-qsl-request');
  if (qslReqEl) {
    const defaultQsl = isEn
      ? 'If this reception report is found to be correct according to your station log, I would be most grateful to receive your verification (QSL card) to confirm my reception.'
      : '上記の内容が貴局の放送運行記録と一致しておりましたら、ご多忙中恐縮ではございますが、受信確認証（ベリカード）を1枚ご発行賜りたく存じます。';
    qslReqEl.textContent = (data.qsl_request && data.qsl_request.trim()) ? data.qsl_request.trim() : defaultQsl;
  }

  const noteEl = document.getElementById('pv-postage-note');
  if (noteEl) {
    if (data.include_return_postage) {
      noteEl.classList.remove('hidden');
      noteEl.textContent = isEn
        ? '* Enclosed is a self-addressed stamped envelope (SASE) for your kind reply.'
        : '※返信用封筒（切手貼付済）を同封いたしますのでよろしくお願い申し上げます。';
    } else {
      noteEl.classList.add('hidden');
    }
  }

  // リスナー情報
  const setSenderField = (id, val, prefix = '') => {
    const el = document.getElementById(id);
    if (!el) return;
    if (val && val.trim()) {
      el.textContent = `${prefix}${val.trim()}`;
      el.classList.remove('hidden');
    } else {
      el.textContent = '';
      el.classList.add('hidden');
    }
  };

  setSenderField('pv-sender-name', data.sender_name);
  setSenderField('pv-sender-zip', data.sender_zip, isEn ? 'ZIP: ' : '〒');
  setSenderField('pv-sender-address', data.sender_address);
  setSenderField('pv-sender-email', data.sender_email);

  // 動的ページ数・レイアウト判定
  const rawLog = data.program_log || '';
  const rawComment = data.comments || '';
  const lineCount = (rawLog.split('\n').length) + (rawComment.split('\n').length);
  const totalChars = rawLog.length + rawComment.length;

  const sheetEl = document.getElementById('reception-sheet');
  const pageBadge = document.getElementById('page-estimate-badge');

  if (sheetEl && pageBadge) {
    if (lineCount > 12 || totalChars > 500) {
      sheetEl.classList.add('multipage-mode');
      pageBadge.textContent = 'A4用紙 2枚以上（長文スタイル適応）';
      pageBadge.className = 'text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300';
    } else {
      sheetEl.classList.remove('multipage-mode');
      pageBadge.textContent = 'A4用紙 1枚';
      pageBadge.className = 'text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300';
    }
  }

  saveToStorage();
}

let saveTimeout = null;
function saveToStorage() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const data = getFormData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const ind = document.getElementById('autosave-indicator');
      if (ind) {
        ind.innerHTML = '<svg class="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>保存済</span>';
        setTimeout(() => {
          ind.innerHTML = '<svg class="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg><span>自動保存</span>';
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  }, 300);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setFormData(parsed);
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

function loadSampleData(forceLang = null) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pad = (n) => String(n).padStart(2, '0');
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const currentLang = forceLang || document.querySelector('input[name="report_lang"]:checked')?.value || 'ja';
  const isEn = (currentLang === 'en');

  const category = pick(['community_fm', 'pref_fm', 'wide_fm', 'mw_am', 'tv']);
  let station = {};

  const fictionalAreasJa = [
    '周波数', '電波塔', 'ベリカード', 'シンポコード', '空中線', '送信所',
    'キャリア波', 'フェージング', 'アンテナ山', 'チューナー川', 'ダイポール',
    '八木宇田', '同軸ケーブル', '変調波', '短波帯', '中波放送',
    '超短波', '同調回路', '電離層', '反射波', '指向性', '給電線'
  ];

  const fictionalAreasEn = [
    'Frequency Hills', 'Radio Tower Bay', 'QSL Card Valley', 'Carrier Wave City',
    'Antenna Ridge', 'Tuner River', 'Dipole Heights', 'Yagi-Uda Park',
    'Coaxial Plains', 'Modulation Coast', 'Ionosphere Point', 'Feedline Harbor'
  ];

  const area = isEn ? pick(fictionalAreasEn) : pick(fictionalAreasJa);

  if (category === 'community_fm') {
    const mhz = (randInt(761, 899) / 10).toFixed(1);
    const randId = `${randInt(1, 9)}${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}`;
    station = {
      target_station: isEn ? `${area} Community FM Co., Ltd.` : `${area}コミュニティエフエム株式会社`,
      target_department: isEn ? pick(['Technical Division / QSL Desk', 'Engineering Dept.', 'Listener Service Desk', 'Verification Section']) : pick(['技術部 QSL係', 'ベリカード受付窓口', '編成技術課', 'リスナーサービス係']),
      station_name: isEn ? `FM ${area.replace(/\s+/g, '')}` : `FM ${area}`,
      call_sign: `JOZZ${randId}-FM`,
      freq_unit: 'MHz',
      frequency_val: mhz,
      channel_val: '',
      receiver_model: pick(['PL-398MP', 'ICF-SW7600GR', 'XHDATA D-808', 'TECSUN PL-660', 'SANGEAN ATS-909X2', 'ICF-M780N']),
      antenna_model: isEn ? pick(['Built-in Telescopic Whip Antenna (Fully Extended)', 'Standard Telescopic Rod Antenna', 'Indoor Wire Dipole Antenna', 'External Whip Antenna']) : pick(['本体ロッドアンテナ（全伸）', '標準ロッドアンテナ（垂直）', '室内簡易T型フィーダーアンテナ', '外部ホイップアンテナ'])
    };
  } else if (category === 'pref_fm' || category === 'wide_fm') {
    const isWide = category === 'wide_fm';
    const mhz = isWide ? (randInt(900, 949) / 10).toFixed(1) : (randInt(770, 890) / 10).toFixed(1);
    const cLetters = `${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}`;
    station = {
      target_station: isEn ? `${area} Broadcasting Co., Ltd.` : `株式会社エフエム${area}`,
      target_department: isEn ? pick(['Engineering Department', 'Broadcast Operations Dept.', 'QSL Verification Bureau']) : pick(['技術局 送信技術部', '放送技術課 受信確認証担当', '編成局 リスナーセンター']),
      station_name: isEn ? (isWide ? `${area} Broadcasting (FM Repeater)` : `FM ${area}`) : (isWide ? `${area}放送 FM補完中継局` : `エフエム${area}`),
      call_sign: `JO${cLetters}-FM`,
      freq_unit: 'MHz',
      frequency_val: mhz,
      channel_val: '',
      receiver_model: pick(['ICF-SW7600GR', 'XHDATA D-808', 'Airspy HF+ Discovery (SDR)', 'SANGEAN WR-301', 'AR-DV10']),
      antenna_model: isEn ? pick(['Standard Telescopic Rod Antenna', 'Outdoor 3-Element Yagi Antenna', 'Balcony Mounted Dipole Antenna', 'Magnetic Base Whip Antenna']) : pick(['標準ロッドアンテナ', '屋外3素子FM専用八木アンテナ', 'ベランダ設置ダイポールアンテナ', 'マグネット基台ホイップ'])
    };
  } else if (category === 'mw_am') {
    const khz = String(randInt(59, 160) * 9);
    const cLetters = `${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}`;
    station = {
      target_station: isEn ? `${area} Radio Broadcasting Inc.` : `株式会社${area}放送`,
      target_department: isEn ? pick(['Technical Operations Division', 'Transmission Engineering Dept.', 'QSL Desk']) : pick(['技術局 送信課 QSL係', '技術部 受信報告書係', '編成制作局 送信技術グループ']),
      station_name: isEn ? `${area} Radio` : `${area}放送`,
      call_sign: `JO${cLetters}`,
      freq_unit: 'kHz',
      frequency_val: khz,
      channel_val: '',
      receiver_model: pick(['ICF-EX5MK2', 'PL-380', 'XHDATA D-808', 'AR-8600 Mark2', 'IC-R6', 'TECSUN S-2000']),
      antenna_model: isEn ? pick(['Internal Ferrite Bar Antenna', 'External Tunable Loop Antenna', 'Passive MW Loop Antenna', 'Outdoor 20m Long Wire Antenna']) : pick(['内蔵フェライトバーアンテナ', '外部チューナブル・ループアンテナ', 'AN-200 中波用パッシブルーブ', '屋外20mロングワイヤーアンテナ'])
    };
  } else {
    const ch = String(randInt(13, 52));
    const cLetters = `${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))}`;
    station = {
      target_station: isEn ? `${area} Television Broadcasting Co.` : `株式会社${area}テレビジョン`,
      target_department: isEn ? pick(['Engineering Management Dept.', 'Transmission Technology Division', 'Technical Department']) : pick(['技術局 送信技術課', '技術管理部 受信相談係', '編成技術部']),
      station_name: isEn ? `${area} TV` : `${area}テレビ`,
      call_sign: `JO${cLetters}-DTV`,
      freq_unit: 'ch',
      frequency_val: '',
      channel_val: ch,
      receiver_model: pick(['Portable Digital TV Receiver (10 inch)', 'USB DVB-T/ISDB-T TV Tuner for PC', 'Waterproof Portable LCD TV', 'Portable TV Display Monitor']),
      antenna_model: isEn ? pick(['Included Mini Dipole Antenna', 'Outdoor 20-Element UHF Yagi Antenna', 'Indoor Compact TV Antenna', 'Outdoor Flat UHF Antenna']) : pick(['付属ダイポールアンテナ', '屋外20素子高性能UHFアンテナ', '室内小型無指向性テレビアンテナ', 'マスプロ電工 屋外UHF平面アンテナ'])
    };
  }

  const timeSlots = [
    { label: '朝', startH: randInt(6, 9), themeJa: 'モーニング', themeEn: 'Morning' },
    { label: '昼', startH: randInt(11, 13), themeJa: 'ランチタイム', themeEn: 'Lunchtime' },
    { label: '夕', startH: randInt(16, 18), themeJa: 'サンセット', themeEn: 'Sunset' },
    { label: '夜', startH: randInt(20, 22), themeJa: 'ナイト', themeEn: 'Night' },
    { label: '深夜', startH: randInt(0, 3), themeJa: 'ミッドナイト', themeEn: 'Midnight' }
  ];
  const slot = pick(timeSlots);

  const titleAdjsJa = ['フレッシュ', 'デイリー', 'サウンド', 'ホリデー', 'ウィークリー', 'ミュージック', 'ワンダー', 'ハートフル'];
  const titleNounsJa = ['ステーション', 'ブリーズ', 'ジャーニー', 'クルージング', 'コネクション', 'スクエア', 'カフェ', 'パラダイス'];
  const titleAdjsEn = ['Fresh', 'Daily', 'Sound', 'Holiday', 'Weekly', 'Music', 'Wonder', 'Heartful'];
  const titleNounsEn = ['Station', 'Breeze', 'Journey', 'Cruising', 'Connection', 'Square', 'Cafe', 'Paradise'];

  const programTitle = isEn
    ? `${area} ${slot.themeEn} ${pick(titleAdjsEn)} ${pick(titleNounsEn)}`
    : `${area} ${slot.themeJa} ${pick(titleAdjsJa)}${pick(titleNounsJa)}`;

  const musicGenresJa = ['邦楽ヒットチャート', 'シティポップ', '70〜80年代フォークソング', '洋楽オールディーズ', '最新J-POP', 'リラクシング・ジャズ', 'アコースティックギター名曲選'];
  const musicGenresEn = ['Japanese Pop Chart', 'City Pop Classics', '70s-80s Folk Selection', 'Western Oldies', 'Latest Pop Hits', 'Relaxing Jazz Hour', 'Acoustic Guitar Melodies'];

  const guestTypesJa = ['地元商店街の青年部代表', '新進気鋭の地元若手ミュージシャン', '季節の果物農園を営む生産者の方', '地域イベントのボランティア代表', '県立博物館の学芸員'];
  const guestTypesEn = ['Local youth commercial committee representative', 'Emerging local indie musician', 'Local seasonal orchard producer', 'Community festival organizer', 'Prefectural museum curator'];

  const localTopicsJa = ['週末の地域お祭り・マルシェ情報', '市内の道路工事および交通規制情報', '旬の地元食材を活かしたおすすめレシピ', '季節の移り変わりと各地の紅葉・開花状況', '防災週間に伴うハザードマップ確認の呼びかけ'];
  const localTopicsEn = ['Weekend regional festival and local farmers market news', 'Traffic alerts and municipal road maintenance notices', 'Seasonal regional recipes featuring local fresh ingredients', 'Seasonal flower blooming forecast and park reports', 'Disaster preparedness information and emergency evacuation tips'];

  const startH = slot.startH;
  const duration = pick([1, 2]);
  const endH = (startH + duration) % 24;

  const genreIdx = randInt(0, musicGenresJa.length - 1);
  const guestIdx = randInt(0, guestTypesJa.length - 1);
  const topicIdx = randInt(0, localTopicsJa.length - 1);

  const selectedGenreJa = musicGenresJa[genreIdx];
  const selectedGenreEn = musicGenresEn[genreIdx];
  const selectedGuestJa = guestTypesJa[guestIdx];
  const selectedGuestEn = guestTypesEn[guestIdx];
  const selectedTopicJa = localTopicsJa[topicIdx];
  const selectedTopicEn = localTopicsEn[topicIdx];

  const logsJa = [
    `${pad(startH)}:00:00 オープニングジングル、パーソナリティによる挨拶、本日の放送メニュー紹介`,
    `${pad(startH)}:12:30 リスナーからのメッセージ紹介とお便りテーマに関するテーマトーク`,
    `${pad(startH)}:24:00 オンエア曲紹介（${selectedGenreJa}より選曲）および心地よい楽曲オンエア`,
    `${pad(startH)}:38:15 地域インフォメーションコーナー（${selectedTopicJa}）`,
    duration === 2 ? `${pad((startH + 1) % 24)}:05:00 ゲストコーナー（${selectedGuestJa}をお迎えしてのトーク）` : `${pad(startH)}:46:00 天気予報および交通情報（スタジオからのアナウンス）`,
    duration === 2 ? `${pad((startH + 1) % 24)}:32:00 リクエスト曲のオンエア、スタジオ内フリートーク` : `${pad(startH)}:52:00 リスナーへの呼びかけ・お便り募集のお知らせ`,
    `${pad((startH + duration - 1) % 24)}:57:30 エンディングトーク、次番組案内およびステーションジングル`
  ];

  const logsEn = [
    `${pad(startH)}:00:00 Station opening ID, DJ greeting and overview of today's program lineup`,
    `${pad(startH)}:12:30 Reading listener emails and discussions on weekly topic`,
    `${pad(startH)}:24:00 Music selection segment featuring ${selectedGenreEn}`,
    `${pad(startH)}:38:15 Community bulletin board (${selectedTopicEn})`,
    duration === 2 ? `${pad((startH + 1) % 24)}:05:00 Guest interview studio segment with ${selectedGuestEn}` : `${pad(startH)}:46:00 Regional weather forecast and local transportation updates`,
    duration === 2 ? `${pad((startH + 1) % 24)}:32:00 Listener song request time and casual studio chatter` : `${pad(startH)}:52:00 Announcement for message contributions and upcoming broadcasts`,
    `${pad((startH + duration - 1) % 24)}:57:30 Ending remarks, announcement of next show, and station closing jingle`
  ];

  const commentsPoolJa = [
    `初めて貴局の電波を受信いたしましたが、非常に落ち着いた語り口と${selectedGenreJa}のセレクトが心地よく、あっという間の時間でした。${selectedTopicJa}も大変参考になりました。`,
    `移動先での受信でしたが、終始安定した電波で明瞭に拝聴できました。特に${selectedGuestJa}との掛け合いが生き生きとしており、地域のあたたかさが伝わってくる素晴らしい放送でした。`,
    `地域色豊かな番組構成に引き込まれ、最後まで楽しく聴取させていただきました。スタッフおよびパーソナリティの皆様の今後のますますのご活躍を応援しております。`
  ];

  const commentsPoolEn = [
    `I was delighted to tune into your station with clear reception. The selection of ${selectedGenreEn} was enjoyable, and the feature on ${selectedTopicEn} was very informative.`,
    `Signal quality remained very stable throughout the monitoring period. The conversation with ${selectedGuestEn} was engaging and gave a great sense of your vibrant community.`,
    `Thank you for broadcasting such an entertaining and high-quality program. I thoroughly enjoyed listening and wish your station team continued success in all future broadcasts.`
  ];

  const familyNamesJa = ['受信', '電波', '周波', '放送', '無線', '通信', '音響', '空中線', '送信', '同調', '変調', '短波', '中波', '電離層', '給電', '反射波', '指向性', '聴取'];
  const givenNamesJa = ['太郎', '花子', '一郎', '次郎', '三郎', '四郎', '五郎', '六郎', '七郎', '八郎', '九郎', '十郎', '明瞭', '良好', '遠距離', '強力'];
  const senderNameJa = `${pick(familyNamesJa)} ${pick(givenNamesJa)}`;

  const familyNamesEn = ['Jushin', 'Dempa', 'Shuha', 'Hoso', 'Musen', 'Tsushin', 'Onkyo', 'Kuchusen', 'Soshin', 'Docho', 'Hencho', 'Tanpa', 'Chuuha', 'Ion'];
  const givenNamesEn = ['Taro', 'Hanako', 'Ichiro', 'Jiro', 'Saburo', 'Shiro', 'Goro', 'Rokuro', 'Shichiro', 'Hachiro', 'Kuro', 'Juro', 'Meiryo', 'Ryoko'];
  const senderNameEn = `${pick(givenNamesEn)} ${pick(familyNamesEn)}`;

  const prefectures = [
    { ja: '北海道', en: 'Hokkaido, Japan' }, { ja: '青森県', en: 'Aomori Prefecture, Japan' },
    { ja: '岩手県', en: 'Iwate Prefecture, Japan' }, { ja: '宮城県', en: 'Miyagi Prefecture, Japan' },
    { ja: '秋田県', en: 'Akita Prefecture, Japan' }, { ja: '山形県', en: 'Yamagata Prefecture, Japan' },
    { ja: '福島県', en: 'Fukushima Prefecture, Japan' }, { ja: '茨城県', en: 'Ibaraki Prefecture, Japan' },
    { ja: '栃木県', en: 'Tochigi Prefecture, Japan' }, { ja: '群馬県', en: 'Gunma Prefecture, Japan' },
    { ja: '埼玉県', en: 'Saitama Prefecture, Japan' }, { ja: '千葉県', en: 'Chiba Prefecture, Japan' },
    { ja: '東京都', en: 'Tokyo, Japan' }, { ja: '神奈川県', en: 'Kanagawa Prefecture, Japan' },
    { ja: '新潟県', en: 'Niigata Prefecture, Japan' }, { ja: '富山県', en: 'Toyama Prefecture, Japan' },
    { ja: '石川県', en: 'Ishikawa Prefecture, Japan' }, { ja: '福井県', en: 'Fukui Prefecture, Japan' },
    { ja: '山梨県', en: 'Yamanashi Prefecture, Japan' }, { ja: '長野県', en: 'Nagano Prefecture, Japan' },
    { ja: '岐阜県', en: '岐阜県', en: 'Gifu Prefecture, Japan' }, { ja: '静岡県', en: 'Shizuoka Prefecture, Japan' },
    { ja: '愛知県', en: 'Aichi Prefecture, Japan' }, { ja: '三重県', en: 'Mie Prefecture, Japan' },
    { ja: '滋賀県', en: 'Shiga Prefecture, Japan' }, { ja: '京都府', en: 'Kyoto Prefecture, Japan' },
    { ja: '大阪府', en: 'Osaka Prefecture, Japan' }, { ja: '兵庫県', en: 'Hyogo Prefecture, Japan' },
    { ja: '奈良県', en: 'Nara Prefecture, Japan' }, { ja: '和歌山県', en: 'Wakayama Prefecture, Japan' },
    { ja: '鳥取県', en: 'Tottori Prefecture, Japan' }, { ja: '島根県', en: 'Shimane Prefecture, Japan' },
    { ja: '岡山県', en: 'Okayama Prefecture, Japan' }, { ja: '広島県', en: 'Hiroshima Prefecture, Japan' },
    { ja: '山口県', en: 'Yamaguchi Prefecture, Japan' }, { ja: '徳島県', en: 'Tokushima Prefecture, Japan' },
    { ja: '香川県', en: 'Kagawa Prefecture, Japan' }, { ja: '愛媛県', en: 'Ehime Prefecture, Japan' },
    { ja: '高知県', en: 'Kochi Prefecture, Japan' }, { ja: '福岡県', en: 'Fukuoka Prefecture, Japan' },
    { ja: '佐賀県', en: 'Saga Prefecture, Japan' }, { ja: '長崎県', en: 'Nagasaki Prefecture, Japan' },
    { ja: '熊本県', en: 'Kumamoto Prefecture, Japan' }, { ja: '大分県', en: 'Oita Prefecture, Japan' },
    { ja: '宮崎県', en: 'Miyazaki Prefecture, Japan' }, { ja: '鹿児島県', en: 'Kagoshima Prefecture, Japan' },
    { ja: '沖縄県', en: 'Okinawa Prefecture, Japan' }
  ];

  const fictionalCitiesJa = [
    '電波市', '周波数区', '受信町', '送信村', 'ベリカード市', 'アンテナ区',
    'チューナー町', '短波市', '中波町', '超短波市', '空中線区',
    'ダイポール区', '八木宇田市', 'シンポ町', '電離層市', '同調回路区', '給電線町'
  ];
  const fictionalTownsJa = [
    'メガヘルツ町', 'キロヘルツ台', 'フェージング丘', 'キャリア波通り',
    'ダイポール丁目', '同軸ケーブル原', '変調波ヶ丘', '受信確認証町'
  ];
  const fictionalSpotsJa = [
    '空中線公園展望台', '電波塔見晴らし広場', 'アンテナ山山頂スペース',
    'ベリカード記念公園', '自宅ベランダ（地上高15m）', '河川敷見通し良好地点'
  ];

  const fictionalCitiesEn = [
    'Dempa City', 'Frequency Ward', 'Jushin Town', 'Soshin Village', 'Vericard City',
    'Antenna Ward', 'Tuner Town', 'Shortwave City', 'Midwave Town', 'Dipole Ward',
    'Yagi-Uda City', 'Sinpo Town', 'Ionosphere City', 'Feedline Town'
  ];
  const fictionalTownsEn = [
    'Megahertz-cho', 'Kilohertz Heights', 'Fading Hill', 'Carrier Wave Ave',
    'Coaxial Garden', 'Modulation Ridge', 'QSL Terrace'
  ];
  const fictionalSpotsEn = [
    'Antenna Park Viewpoint', 'Radio Tower Observatory', 'Antenna Hilltop Area',
    'QSL Memorial Park', 'Home Balcony (15m above ground)', 'Riverbank Open Field'
  ];

  const prefObj = pick(prefectures);
  const prefJa = prefObj.ja;
  const prefEn = prefObj.en;

  const cityIdx = randInt(0, fictionalCitiesJa.length - 1);
  const townIdx = randInt(0, fictionalTownsJa.length - 1);
  const spotIdx = randInt(0, fictionalSpotsJa.length - 1);

  const banchiNum = `${randInt(1, 9)}-${randInt(1, 25)}-${randInt(1, 18)}`;
  const fakeZip = `${pad(randInt(100, 999))}-${pad(randInt(1000, 9999))}`;

  const senderAddrJa = `${prefJa}${fictionalCitiesJa[cityIdx]}${fictionalTownsJa[townIdx]}${banchiNum}`;
  const recPlaceJa = `${prefJa}${fictionalCitiesJa[cityIdx]}${fictionalTownsJa[townIdx]}（${fictionalSpotsJa[spotIdx]}）`;

  const senderAddrEn = `${banchiNum}, ${fictionalTownsEn[townIdx]}, ${fictionalCitiesEn[cityIdx]}, ${prefEn}`;
  const recPlaceEn = `${fictionalSpotsEn[spotIdx]}, ${fictionalCitiesEn[cityIdx]}, ${prefEn}`;

  const senderEmail = `${pick(['radio', 'dx', 'wave', 'air', 'bcl', 'log'])}.${randInt(100, 999)}@example.com`;

  const now = new Date();
  const pastTime = randInt(1, 90) * 24 * 60 * 60 * 1000;
  const targetDate = new Date(now.getTime() - pastTime);
  const dateStr = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;

  const sinpoPresets = [
    { s: '5', i: '5', n: '5', p: '5', o: '5' },
    { s: '5', i: '4', n: '5', p: '4', o: '4' },
    { s: '4', i: '4', n: '4', p: '4', o: '4' },
    { s: '4', i: '3', n: '4', p: '3', o: '3' },
    { s: '3', i: '3', n: '3', p: '3', o: '3' }
  ];
  const sinpo = pick(sinpoPresets);

  const tvPictureList = [
    'P5 (鮮明・乱れなし / Excellent)',
    'P4 (良好・微小な乱れ / Good)',
    'P3 (実用可能・時々ブロック / Fair)'
  ];
  const tvSoundList = [
    'Q5 (明瞭・雑音なし / Excellent)',
    'Q4 (良好・微小な雑音 / Good)',
    'Q3 (実用可能・聞き取れる / Fair)'
  ];

  const defaultQslRequest = isEn
    ? 'If this reception report is found to be correct according to your station log, I would be most grateful to receive your verification (QSL card) to confirm my reception.'
    : '上記の内容が貴局の放送運行記録と一致しておりましたら、ご多忙中恐縮ではございますが、受信確認証（ベリカード）を1枚ご発行賜りたく存じます。';

  const sample = {
    report_lang: currentLang,
    target_station: station.target_station,
    target_department: station.target_department,
    target_honorific: isEn ? '' : pick(['御中', '様']),
    station_name: station.station_name,
    call_sign: station.call_sign,
    freq_unit: station.freq_unit,
    frequency_val: station.frequency_val,
    channel_val: station.channel_val,
    program_title: programTitle,
    language: isEn ? 'Japanese' : '日本語',
    reception_date: dateStr,
    time_start: `${pad(startH)}:00`,
    time_end: `${pad(endH)}:00`,
    time_zone_type: isEn ? pick(['JST', 'UTC']) : 'JST',
    reception_place: isEn ? recPlaceEn : recPlaceJa,
    sinpo_s: sinpo.s,
    sinpo_i: sinpo.i,
    sinpo_n: sinpo.n,
    sinpo_p: sinpo.p,
    sinpo_o: sinpo.o,
    tv_picture: pick(tvPictureList),
    tv_sound: pick(tvSoundList),
    receiver_model: station.receiver_model,
    antenna_model: station.antenna_model,
    program_log: isEn ? logsEn.join('\n') : logsJa.join('\n'),
    comments: isEn ? pick(commentsPoolEn) : pick(commentsPoolJa),
    qsl_request: defaultQslRequest,
    include_return_postage: true,
    sender_name: isEn ? senderNameEn : senderNameJa,
    sender_zip: fakeZip,
    sender_address: isEn ? senderAddrEn : senderAddrJa,
    sender_email: senderEmail
  };

  setFormData(sample);
  showToast(isEn ? 'Random English sample data generated successfully.' : 'ランダムなサンプルデータを自動生成しました');
}

function hasFormUserContent() {
  const current = getFormData();
  const checkKeys = [
    'station_name', 'call_sign', 'frequency_val', 'channel_val',
    'program_title', 'reception_place', 'receiver_model', 'antenna_model',
    'program_log', 'comments', 'sender_name', 'sender_address'
  ];
  return checkKeys.some(key => current[key] && current[key].trim().length > 0);
}

// サンプルデータ読み込みボタン
if (btnLoadSample) {
  btnLoadSample.addEventListener('click', (e) => {
    e.stopPropagation();

    if (hasFormUserContent()) {
      const currentLang = document.querySelector('input[name="report_lang"]:checked')?.value || 'ja';
      const isEn = (currentLang === 'en');
      const confirmMsg = isEn
        ? 'Loading sample data will overwrite your current inputs. Do you want to proceed?'
        : 'サンプルデータを読み込むと、現在入力されている内容が上書きされます。よろしいですか？';

      const ok = window.confirm(confirmMsg);
      if (!ok) return;
    }

    loadSampleData();
  });
}

// 言語切り替えラジオボタンの変更監視
let previousLang = document.querySelector('input[name="report_lang"]:checked')?.value || 'ja';

document.querySelectorAll('input[name="report_lang"]').forEach((radio) => {
  radio.addEventListener('click', (e) => {
    const newLang = e.target.value;
    if (newLang === previousLang) return;

    if (hasFormUserContent()) {
      const isTargetEn = (newLang === 'en');
      const confirmMsg = isTargetEn
        ? 'Switching the language will replace current inputs with English sample data. Proceed?'
        : '言語を切り替えると、現在入力されている内容は破棄されサンプルデータが再生成されます。よろしいですか？';

      const ok = window.confirm(confirmMsg);
      if (!ok) {
        e.preventDefault();
        const prevRadio = document.querySelector(`input[name="report_lang"][value="${previousLang}"]`);
        if (prevRadio) prevRadio.checked = true;
        return;
      }
    }

    previousLang = newLang;
    loadSampleData(newLang);
  });
});

// エクスポートメニューのトグル
if (btnExportToggle) {
  btnExportToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!exportMenu) return;
    const willOpen = exportMenu.classList.contains('hidden');
    if (importMenu) importMenu.classList.add('hidden');
    hideAllMobileTips();

    if (window.innerWidth < 640 && willOpen && tipExport) {
      tipExport.classList.remove('hidden');
      setTimeout(() => { tipExport.classList.add('hidden'); }, 1800);
    }

    exportMenu.classList.toggle('hidden');
  });
}

// インポートメニューのトグル
if (btnImportToggle) {
  btnImportToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!importMenu) return;
    const willOpen = importMenu.classList.contains('hidden');
    if (exportMenu) exportMenu.classList.add('hidden');
    hideAllMobileTips();

    if (window.innerWidth < 640 && willOpen && tipImport) {
      tipImport.classList.remove('hidden');
      setTimeout(() => { tipImport.classList.add('hidden'); }, 1800);
    }

    importMenu.classList.toggle('hidden');
  });
}

// メニュー外クリックで閉じる
document.addEventListener('click', () => {
  if (exportMenu && !exportMenu.classList.contains('hidden')) exportMenu.classList.add('hidden');
  if (importMenu && !importMenu.classList.contains('hidden')) importMenu.classList.add('hidden');
  hideAllMobileTips();
});

// ヘルプボタン＆モーダル制御
const helpModal = document.getElementById('help-modal');
const helpModalDialog = document.getElementById('help-modal-dialog');
const btnCloseHelpTop = document.getElementById('btn-close-help-top');
const btnCloseHelpBottom = document.getElementById('btn-close-help-bottom');

function openHelpModal() {
  if (!helpModal) return;
  helpModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeHelpModal() {
  if (!helpModal) return;
  helpModal.classList.add('hidden');
  document.body.style.overflow = '';
}

if (btnHelp && helpModal) {
  btnHelp.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (exportMenu) exportMenu.classList.add('hidden');
    if (importMenu) importMenu.classList.add('hidden');
    hideAllMobileTips();

    if (tipHelp && window.innerWidth < 640) {
      tipHelp.classList.remove('hidden');
      setTimeout(() => { tipHelp.classList.add('hidden'); }, 1800);
    }

    openHelpModal();
  });

  if (helpModalDialog) {
    helpModalDialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (btnCloseHelpTop) {
    btnCloseHelpTop.addEventListener('click', (e) => {
      e.stopPropagation();
      closeHelpModal();
    });
  }

  if (btnCloseHelpBottom) {
    btnCloseHelpBottom.addEventListener('click', (e) => {
      e.stopPropagation();
      closeHelpModal();
    });
  }

  helpModal.addEventListener('click', () => {
    closeHelpModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
      closeHelpModal();
    }
  });
}

function downloadJsonFile(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 全データエクスポート
const btnExportAll = document.getElementById('btn-export-all');
if (btnExportAll) {
  btnExportAll.addEventListener('click', () => {
    if (exportMenu) exportMenu.classList.add('hidden');
    const data = getFormData();
    const station = data.station_name ? data.station_name.replace(/[\/\\?%*:|"<>]/g, '_') : 'report';
    const date = data.reception_date || 'date';
    downloadJsonFile(data, `reception_report_all_${station}_${date}.json`);
    showToast('全データを書き出しました');
  });
}

// リスナー情報エクスポート
const btnExportSender = document.getElementById('btn-export-sender');
if (btnExportSender) {
  btnExportSender.addEventListener('click', () => {
    if (exportMenu) exportMenu.classList.add('hidden');
    const allData = getFormData();
    const senderData = {};
    SENDER_FIELDS.forEach(k => {
      if (allData[k] !== undefined) senderData[k] = allData[k];
    });
    const name = (senderData.sender_name || 'sender').replace(/[\/\\?%*:|"<>]/g, '_');
    downloadJsonFile(senderData, `sender_profile_${name}.json`);
    showToast('リスナー情報のみ書き出しました');
  });
}

const inputImportAll = document.getElementById('input-import-all');
const inputImportSender = document.getElementById('input-import-sender');
const btnTriggerImportAll = document.getElementById('btn-trigger-import-all');
const btnTriggerImportSender = document.getElementById('btn-trigger-import-sender');

if (btnTriggerImportAll && inputImportAll) {
  btnTriggerImportAll.addEventListener('click', () => {
    if (importMenu) importMenu.classList.add('hidden');
    inputImportAll.click();
  });
}

if (btnTriggerImportSender && inputImportSender) {
  btnTriggerImportSender.addEventListener('click', () => {
    if (importMenu) importMenu.classList.add('hidden');
    inputImportSender.click();
  });
}

function handleFileImport(file, targetFields, successMsg) {
  if (!file) return;

  const ok = window.confirm('JSONファイルを読み込むと、該当する項目が上書きされます。よろしいですか？');
  if (!ok) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      const current = getFormData();
      const merged = Object.assign({}, current, imported);
      setFormData(merged, targetFields);
      showToast(successMsg);
    } catch (err) {
      showToast('JSONの解析に失敗しました', false);
    }
  };
  reader.readAsText(file);
}

if (inputImportAll) {
  inputImportAll.addEventListener('change', (e) => {
    handleFileImport(e.target.files[0], FORM_FIELDS, '全データを正常に読み込みました');
    e.target.value = '';
  });
}

if (inputImportSender) {
  inputImportSender.addEventListener('change', (e) => {
    handleFileImport(e.target.files[0], SENDER_FIELDS, 'リスナー情報を正常に読み込みました');
    e.target.value = '';
  });
}

// フォームリセット
const btnResetForm = document.getElementById('btn-reset-form');
if (btnResetForm) {
  btnResetForm.addEventListener('click', () => {
    const confirmed = window.confirm('現在の入力内容をすべて消去します。よろしいですか？\n※この操作は取り消せません。');
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
}

// 印刷・PDF出力
const btnPrint = document.getElementById('btn-print');
if (btnPrint) {
  btnPrint.addEventListener('click', () => {
    const data = getFormData();
    const errors = [];

    if (!data.station_name || !data.station_name.trim()) errors.push('・放送局名');
    if (data.freq_unit === 'ch') {
      if (!data.channel_val || !data.channel_val.trim()) errors.push('・チャンネル');
    } else {
      if (!data.frequency_val || !data.frequency_val.trim()) errors.push('・周波数');
    }
    if (!data.reception_date) errors.push('・受信日');
    if (!data.time_start || !data.time_end) errors.push('・受信時刻（開始・終了）');
    if (!data.reception_place || !data.reception_place.trim()) errors.push('・受信場所');
    if (!data.receiver_model || !data.receiver_model.trim()) errors.push('・受信機 / チューナー');
    if (!data.program_log || !data.program_log.trim()) errors.push('・放送内容の記録');

    if (errors.length > 0) {
      alert("以下の必須項目が未入力です。印刷・PDF出力を行う前に入力をご確認ください：\n\n" + errors.join("\n"));
      return;
    }

    window.print();
  });
}

// フォーム入力値変更のリアルタイム監視
FORM_FIELDS.forEach(id => {
  const rads = document.querySelectorAll(`input[name="${id}"]`);
  if (rads.length > 0) {
    rads.forEach(r => {
      r.addEventListener('change', () => {
        updateUIState();
        updatePreview();
      });
    });
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      updateUIState();
      updatePreview();
    });
    el.addEventListener('change', () => {
      updateUIState();
      updatePreview();
    });
  }
});

// 初期ロード処理
window.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const hasStored = loadFromStorage();
  if (!hasStored) {
    updateUIState();
    updatePreview();
  }
});
