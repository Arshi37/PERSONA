(function () {
  const elements = {
    topics: document.getElementById('topics'),
    style: document.getElementById('style'),
    caseGroup: document.getElementById('caseGroup'),
    startsWith: document.getElementById('startsWith'),
    minLen: document.getElementById('minLen'),
    maxLen: document.getElementById('maxLen'),
    allowNumbers: document.getElementById('allowNumbers'),
    allowSeparators: document.getElementById('allowSeparators'),
    noVowels: document.getElementById('noVowels'),
    qty: document.getElementById('qty'),
    generateBtn: document.getElementById('generateBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    clearFavsBtn: document.getElementById('clearFavsBtn'),
    resultsList: document.getElementById('resultsList'),
    favoritesList: document.getElementById('favoritesList'),
    resultStats: document.getElementById('resultStats'),
    favoritesStats: document.getElementById('favoritesStats'),
    exportFavsBtn: document.getElementById('exportFavsBtn'),
    year: document.getElementById('year')
  };

  const CASES = Object.freeze({ lower: 'lower', title: 'title', camel: 'camel', snake: 'snake' });

  const DATA = buildData();
  let selectedCase = CASES.lower;
  let latestResults = [];

  function buildData() {
    const commonAdjectives = ['bright','bold','swift','lucky','silent','stellar','urban','cosmic','prime','vivid','rapid','clever','brisk','sunny','crisp','noble','epic','mighty','neon','quiet','crystal','gamma','hyper','silver','steady','fresh','true','wild','zen','eager','brave','grand','glossy','royal','clear','nova','atomic','ultra'];

    const playfulAdjectives = ['bubbly','cheery','peppy','sparkly','zippy','snug','snazzy','snappy','poppy','peachy','fuzzy','dandy','jazzy'];
    const coolAdjectives = ['vortex','onyx','apex','zenith','shadow','rogue','strata','arctic','nitro','onyx','matrix','phantom','radial'];
    const professionalAdjectives = ['solid','reliable','trusted','global','capital','applied','integral','secure','core','prime','north'];
    const edgyAdjectives = ['toxic','void','vandal','crimson','hollow','feral','scar','venom','razor','glitch','grave'];
    const cuteAdjectives = ['cuddly','tiny','sweet','soft','puffy','honey','berry','cherry','bunny','kitty','panda','minty','rosy'];
    const fantasyAdjectives = ['mythic','ancient','arcane','runic','dragon','ember','shadowed','lunar','stellar','fae','eldritch','royal'];
    const sciFiAdjectives = ['quantum','neutron','plasma','cyber','neon','galactic','stellar','astro','ion','phase','warp','omega'];

    const commonNouns = ['studio','lab','works','base','forge','hub','zone','core','byte','leaf','stone','river','cloud','orbit','pulse','spark','flare','loop','grid','shift','mint','peak','ridge','crest','echo','craft','nest','den','path','wave','beam','field','code','pixel','logic','nova','atlas'];

    const playfulNouns = ['panda','peach','sprout','bunny','nugget','puddle','jelly','doodle','muffin','bubble','sprinkle','scoot'];
    const coolNouns = ['storm','cipher','drift','shift','haze','blaze','frost','glyph','shade','pulse','flux','quake'];
    const professionalNouns = ['partners','solutions','group','consult','advisors','systems','analytics','ventures','capital','global'];
    const edgyNouns = ['glitch','void','grave','razor','reaper','venom','vandal','riot','wrath','spike','hex'];
    const cuteNouns = ['kitty','bunny','bear','berry','cookie','cupcake','petal','panda','peach','cherry'];
    const fantasyNouns = ['dragon','rune','spirit','phoenix','griffin','quest','realm','myth','saga','ember','myst'];
    const sciFiNouns = ['nova','quantum','neutron','cyber','orbit','ion','neon','aster','comet','nebula','warp'];

    const suffixes = ['ly','ify','ster','verse','zone','scape','hub','labs','works','group','hq','smith','stack','grid','flow','space','cast','dao','pad'];
    const prefixes = ['neo','meta','hyper','ultra','astro','nano','cyber','quant','proto','omni','terra','aero','aqua'];

    return {
      adjectives: { common: commonAdjectives, playful: playfulAdjectives, cool: coolAdjectives, professional: professionalAdjectives, edgy: edgyAdjectives, cute: cuteAdjectives, fantasy: fantasyAdjectives, sciFi: sciFiAdjectives },
      nouns: { common: commonNouns, playful: playfulNouns, cool: coolNouns, professional: professionalNouns, edgy: edgyNouns, cute: cuteNouns, fantasy: fantasyNouns, sciFi: sciFiNouns },
      suffixes,
      prefixes
    };
  }

  function getStyleBuckets(style) {
    switch (style) {
      case 'playful': return { adjectives: ['common','playful'], nouns: ['common','playful'] };
      case 'cool': return { adjectives: ['common','cool'], nouns: ['common','cool'] };
      case 'professional': return { adjectives: ['common','professional'], nouns: ['common','professional'] };
      case 'edgy': return { adjectives: ['common','edgy'], nouns: ['common','edgy'] };
      case 'cute': return { adjectives: ['common','cute'], nouns: ['common','cute'] };
      case 'fantasy': return { adjectives: ['common','fantasy'], nouns: ['common','fantasy'] };
      case 'sci-fi': return { adjectives: ['common','sciFi'], nouns: ['common','sciFi'] };
      default: return { adjectives: ['common'], nouns: ['common'] };
    }
  }

  function randomInt(minInclusive, maxInclusive) {
    const min = Math.ceil(minInclusive);
    const max = Math.floor(maxInclusive);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(array) {
    return array[randomInt(0, array.length - 1)];
  }

  function pickFromBuckets(bucketNames, dict) {
    return bucketNames.flatMap(name => dict[name] || []);
  }

  function sanitizeTopicWords(input) {
    return input
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
      .map(s => s.replace(/[^a-z0-9\-\_\s]/g, ''))
      .slice(0, 6);
  }

  function maybeSeparator(allowSeparators) {
    if (!allowSeparators) return '';
    return Math.random() < 0.25 ? '_' : (Math.random() < 0.5 ? '-' : '');
  }

  function applyCaseStyle(text, caseStyle) {
    const parts = text.replace(/[\-_\s]+/g, ' ').trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (caseStyle === CASES.lower) {
      return parts.join('').toLowerCase();
    }
    if (caseStyle === CASES.snake) {
      return parts.join('_').toLowerCase();
    }
    const titled = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
    if (caseStyle === CASES.title) return titled;
    if (caseStyle === CASES.camel) return titled.charAt(0).toLowerCase() + titled.slice(1);
    return text;
  }

  function removeSomeVowels(text) {
    return text.replace(/[aeiou]{2,}/g, m => m[0]).replace(/([aeiou])(?!$)/g, (m, v) => (Math.random() < 0.4 ? '' : v));
  }

  function applyEdgyTransforms(text, isEdgy, removeVowels) {
    let t = text;
    if (isEdgy || removeVowels) {
      t = removeSomeVowels(t);
    }
    if (isEdgy && Math.random() < 0.35) {
      t = t
        .replace(/a/gi, () => (Math.random() < 0.5 ? '@' : 'a'))
        .replace(/e/gi, () => (Math.random() < 0.5 ? '3' : 'e'))
        .replace(/i/gi, () => (Math.random() < 0.5 ? '1' : 'i'))
        .replace(/o/gi, () => (Math.random() < 0.5 ? '0' : 'o'))
        .replace(/s/gi, () => (Math.random() < 0.5 ? '5' : 's'));
    }
    return t;
  }

  function clampLength(name, min, max) {
    if (name.length < min || name.length > max) return null;
    return name;
  }

  function ensureStartsWith(name, startsWith) {
    if (!startsWith) return name;
    const low = name.toLowerCase();
    if (low.startsWith(startsWith.toLowerCase())) return name;
    return null;
  }

  function ensureNumbersRule(name, allowNumbers) {
    if (allowNumbers) return name;
    return /[0-9]/.test(name) ? null : name;
  }

  function appendNumberMaybe(name, allowNumbers) {
    if (!allowNumbers) return name;
    if (Math.random() < 0.4) {
      const num = Math.random() < 0.8 ? randomInt(1, 9999) : randomInt(19, 99);
      return name + num;
    }
    return name;
  }

  function buildCandidates({ topics, style, allowSeparators }) {
    const { adjectives, nouns, prefixes, suffixes } = DATA;
    const buckets = getStyleBuckets(style);

    const adjPool = pickFromBuckets(buckets.adjectives, adjectives);
    const nounPool = pickFromBuckets(buckets.nouns, nouns);

    const sep = maybeSeparator(allowSeparators);

    const topicPool = topics.length ? topics : [];

    const candidates = [];

    for (let i = 0; i < 200; i++) {
      const pattern = randomInt(1, 8);
      let parts = [];
      if (pattern === 1) {
        parts = [choice(adjPool), choice(nounPool)];
      } else if (pattern === 2 && topicPool.length) {
        parts = [choice(topicPool), choice(nounPool)];
      } else if (pattern === 3 && topicPool.length) {
        parts = [choice(nounPool), choice(topicPool)];
      } else if (pattern === 4) {
        parts = [choice(nounPool), choice(suffixes)];
      } else if (pattern === 5) {
        parts = [choice(prefixes), choice(nounPool)];
      } else if (pattern === 6 && topicPool.length) {
        parts = [choice(prefixes), choice(topicPool)];
      } else if (pattern === 7) {
        const letter = Math.random() < 0.5 ? choice('abcdefghijklmnopqrstuvwxyz'.split('')) : '';
        const nn = choice(nounPool).replace(/^[^a-z]?/i, '');
        parts = [letter + nn, choice(suffixes)];
      } else {
        parts = [choice(adjPool), choice(nounPool), choice(suffixes)];
      }
      candidates.push(parts.join(sep));
    }

    // Alliteration boost if startsWith provided
    if (topics.length === 0 && allowSeparators) {
      const letter = choice('abcdefghijklmnopqrstuvwxyz'.split(''));
      const allit = `${letter}${choice(nounPool)}`;
      candidates.push(allit);
    }

    return candidates;
  }

  function generate(params) {
    const topics = sanitizeTopicWords(params.topics);

    const rough = buildCandidates({ topics, style: params.style, allowSeparators: params.allowSeparators });

    const isEdgy = params.style === 'edgy';

    const seen = new Set();
    const results = [];

    for (const raw of rough) {
      let name = raw;
      if (params.noVowels || isEdgy) {
        name = applyEdgyTransforms(name, isEdgy, params.noVowels);
      }
      name = appendNumberMaybe(name, params.allowNumbers);
      name = applyCaseStyle(name, params.caseStyle);

      if (params.startsWith) {
        const filtered = ensureStartsWith(name, params.startsWith);
        if (!filtered) continue;
      }

      const lengthOk = clampLength(name, params.minLen, params.maxLen);
      if (!lengthOk) continue;

      if (!ensureNumbersRule(name, params.allowNumbers)) continue;

      if (!seen.has(name)) {
        seen.add(name);
        results.push(name);
      }
      if (results.length >= params.qty) break;
    }

    // If not enough, try a second pass with more randomness
    let attempts = 0;
    while (results.length < params.qty && attempts < 5) {
      attempts++;
      rough.push(...buildCandidates({ topics: sanitizeTopicWords(params.topics), style: params.style, allowSeparators: params.allowSeparators }));
      for (const raw of rough) {
        let name = raw;
        if (params.noVowels || isEdgy) {
          name = applyEdgyTransforms(name, isEdgy, params.noVowels);
        }
        name = appendNumberMaybe(name, params.allowNumbers);
        name = applyCaseStyle(name, params.caseStyle);
        if (params.startsWith) {
          const filtered = ensureStartsWith(name, params.startsWith);
          if (!filtered) continue;
        }
        const lengthOk = clampLength(name, params.minLen, params.maxLen);
        if (!lengthOk) continue;
        if (!ensureNumbersRule(name, params.allowNumbers)) continue;
        if (!seen.has(name)) {
          seen.add(name);
          results.push(name);
        }
        if (results.length >= params.qty) break;
      }
    }

    return results.slice(0, params.qty);
  }

  function readParamsFromUi() {
    const activeCaseButton = elements.caseGroup.querySelector('button.active');
    const caseStyle = activeCaseButton ? activeCaseButton.getAttribute('data-case') : CASES.lower;
    const minLen = Math.max(3, parseInt(elements.minLen.value || '5', 10));
    const maxLen = Math.max(minLen, parseInt(elements.maxLen.value || '14', 10));

    return {
      topics: elements.topics.value,
      style: elements.style.value,
      caseStyle,
      startsWith: (elements.startsWith.value || '').trim(),
      minLen,
      maxLen,
      allowNumbers: elements.allowNumbers.checked,
      allowSeparators: elements.allowSeparators.checked,
      noVowels: elements.noVowels.checked,
      qty: Math.min(100, Math.max(5, parseInt(elements.qty.value || '30', 10)))
    };
  }

  function renderList(targetEl, names, { allowActions = true } = {}) {
    targetEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (const name of names) {
      const li = document.createElement('li');
      li.className = 'result-item';

      const span = document.createElement('span');
      span.className = 'result-name';
      span.textContent = name;

      const actions = document.createElement('div');
      actions.className = 'result-actions';

      if (allowActions) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => copyToClipboard(name));

        const favBtn = document.createElement('button');
        favBtn.className = 'fav';
        favBtn.textContent = isFavorite(name) ? '♥' : '♡';
        if (isFavorite(name)) favBtn.classList.add('active');
        favBtn.addEventListener('click', () => {
          toggleFavorite(name);
          favBtn.textContent = isFavorite(name) ? '♥' : '♡';
          favBtn.classList.toggle('active', isFavorite(name));
          refreshFavoritesUi();
        });

        actions.appendChild(copyBtn);
        actions.appendChild(favBtn);
      }

      li.appendChild(span);
      li.appendChild(actions);
      fragment.appendChild(li);
    }
    targetEl.appendChild(fragment);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (_) {}
  }

  function onGenerate() {
    const params = readParamsFromUi();
    latestResults = generate(params);
    renderList(elements.resultsList, latestResults, { allowActions: true });
    elements.resultStats.textContent = `${latestResults.length} results`;
    syncUrl();
  }

  function onShuffle() {
    onGenerate();
  }

  async function onCopyAll() {
    if (!latestResults.length) return;
    await copyToClipboard(latestResults.join('\n'));
  }

  // Favorites handling
  const FAVORITES_KEY = 'namestyler:favorites';

  function getFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.slice(0, 1000);
      return [];
    } catch (_) { return []; }
  }

  function setFavorites(arr) {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr)); } catch (_) {}
  }

  function isFavorite(name) {
    return getFavorites().includes(name);
  }

  function toggleFavorite(name) {
    const favs = getFavorites();
    const idx = favs.indexOf(name);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.unshift(name);
    }
    setFavorites(favs);
  }

  function clearFavorites() {
    setFavorites([]);
    refreshFavoritesUi();
  }

  function refreshFavoritesUi() {
    const favs = getFavorites();
    renderList(elements.favoritesList, favs, { allowActions: true });
    elements.favoritesStats.textContent = `${favs.length} saved`;
  }

  function exportFavorites() {
    const favs = getFavorites();
    const blob = new Blob([favs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namestyler-favorites.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  function initCaseButtons() {
    elements.caseGroup.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.caseGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCase = btn.getAttribute('data-case');
        syncUrl();
      });
    });
  }

  function initYear() {
    if (elements.year) {
      elements.year.textContent = new Date().getFullYear().toString();
    }
  }

  // URL state helpers
  function parseBool(value, fallback) {
    if (value == null) return fallback;
    const v = String(value).toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  }

  function readParamsFromUrl() {
    try {
      const u = new URL(window.location.href);
      const p = u.searchParams;
      const min = parseInt(p.get('min') || '5', 10);
      const max = parseInt(p.get('max') || '14', 10);
      return {
        topics: p.get('q') || '',
        style: p.get('style') || 'balanced',
        caseStyle: p.get('case') || 'lower',
        startsWith: p.get('starts') || '',
        minLen: isFinite(min) ? Math.max(3, min) : 5,
        maxLen: isFinite(max) ? Math.max(3, max) : 14,
        allowNumbers: parseBool(p.get('nums'), true),
        allowSeparators: parseBool(p.get('sep'), false),
        noVowels: parseBool(p.get('novowel'), false),
        qty: Math.min(100, Math.max(5, parseInt(p.get('qty') || '30', 10) || 30))
      };
    } catch (_) {
      return {
        topics: '', style: 'balanced', caseStyle: 'lower', startsWith: '', minLen: 5, maxLen: 14,
        allowNumbers: true, allowSeparators: false, noVowels: false, qty: 30
      };
    }
  }

  function setUiFromParams(pr) {
    elements.topics.value = pr.topics || '';
    elements.style.value = pr.style || 'balanced';
    elements.startsWith.value = pr.startsWith || '';
    elements.minLen.value = pr.minLen;
    elements.maxLen.value = pr.maxLen;
    elements.allowNumbers.checked = !!pr.allowNumbers;
    elements.allowSeparators.checked = !!pr.allowSeparators;
    elements.noVowels.checked = !!pr.noVowels;
    elements.qty.value = pr.qty;
    // case
    const btns = elements.caseGroup.querySelectorAll('button');
    btns.forEach(b => b.classList.remove('active'));
    const target = elements.caseGroup.querySelector(`[data-case="${pr.caseStyle}"]`);
    (target || elements.caseGroup.querySelector('[data-case="lower"]')).classList.add('active');
  }

  function writeParamsToUrl(pr) {
    try {
      const u = new URL(window.location.href);
      const p = u.searchParams;
      p.set('q', pr.topics || '');
      p.set('style', pr.style);
      p.set('case', pr.caseStyle);
      if (pr.startsWith) p.set('starts', pr.startsWith); else p.delete('starts');
      p.set('min', String(pr.minLen));
      p.set('max', String(pr.maxLen));
      p.set('nums', pr.allowNumbers ? '1' : '0');
      p.set('sep', pr.allowSeparators ? '1' : '0');
      p.set('novowel', pr.noVowels ? '1' : '0');
      p.set('qty', String(pr.qty));
      history.replaceState({}, '', u);
    } catch (_) {}
  }

  function syncUrl() {
    writeParamsToUrl(readParamsFromUi());
  }

  function init() {
    initCaseButtons();
    initYear();

    elements.generateBtn.addEventListener('click', onGenerate);
    elements.shuffleBtn.addEventListener('click', onShuffle);
    elements.copyAllBtn.addEventListener('click', onCopyAll);
    elements.clearFavsBtn.addEventListener('click', clearFavorites);
    elements.exportFavsBtn.addEventListener('click', exportFavorites);

    // Reflect changes to URL as user edits
    [elements.topics, elements.startsWith, elements.minLen, elements.maxLen, elements.qty]
      .forEach(el => el.addEventListener('input', syncUrl));
    [elements.style, elements.allowNumbers, elements.allowSeparators, elements.noVowels]
      .forEach(el => el.addEventListener('change', syncUrl));

    // Initial state from URL
    const initial = readParamsFromUrl();
    setUiFromParams(initial);

    // Initial render
    onGenerate();
    refreshFavoritesUi();
  }

  init();
})();