(function () {
  'use strict';
  // Blokjeszoeker: alles gebeurt in de browser. Geen server, geen AI, geen limiet.
  var TIJDLIMIET_MS = 60000;
  var KLEUREN_KADER = ['#e6007e', '#00a0e9', '#ffb000'];

  var T = {
    nl: {
      intro: 'Maak een foto van de berg, laat zien wat je zoekt, en de Blokjeszoeker wijst het aan. Alles gebeurt op je eigen telefoon of computer. Voor bouwsteentjes zoals LEGO® en andere kleine stukjes.',
      stap1: '1. Foto van de berg', stapelHint: 'Leg de stukjes zo plat mogelijk uit, met goed licht, recht van boven.',
      fotoHint: 'Tik op de foto om in te zoomen in het vergrootglas.',
      raster: 'Raster:', rasterHint: 'Grof raster = sneller. Fijn raster = nauwkeuriger voor kleine stukjes, maar trager.',
      stap2: '2. Wat zoek je?',
      refTitel: 'Laat zien wat je zoekt (nodig)',
      refUitleg: 'Wijs er één aan in de berg (werkt het best), of maak een foto van het blokje en zet er een kader omheen.',
      refFoto: '📷 Foto van het blokje', wijsAan: '✋ Wijs er één aan in de berg', wijsBezig: '✋ Sleep een kader om één blokje…',
      kaderHint: 'Sleep een kader precies om het blokje dat je zoekt.',
      weg: 'Weghalen', refUitFoto: 'Voorbeeld uit je foto', refUitBestand: 'Voorbeeld uit je foto van het blokje',
      hoekTxt: 'Zo ligt hij ongeveer:', draaienTxt: 'Kan gedraaid liggen (zoekt in alle richtingen, iets trager)',
      vormTitel: 'Of kies een standaardblokje (als je geen voorbeeld hebt)', kleurTitel: 'Kleur (telt maar een beetje mee)', donker: 'donkerder', licht: 'lichter',
      lichtHint: 'Schuif tot de kleur lijkt op hoe het blokje er op jouw foto uitziet. Vraagteken = kleur van het voorbeeld gebruiken.',
      kleurGewicht: 'Kleur telt mee:',
      jeZoekt: 'Je zoekt:', niksGekozen: '(nog niets gekozen)', metVoorbeeld: 'met voorbeeld', vrijeHoek: 'alle richtingen',
      zoek: 'Zoek', bezig: 'Bezig…',
      nogBezig: function (s) { return 'Nog bezig… ' + s; },
      resultaat: 'Resultaat',
      resHint: 'Sleep in het vergrootglas of tik op de foto om rond te kijken. Zeg bij een blokje of het klopt; de lijst past zich meteen aan.',
      hem: '✓ Dit is hem!', lijkt: '≈ Lijkt erop, niet hem', niet: '✗ Niet deze', zoom: 'Zoom',
      gevonden: 'Gevonden! Veel bouwplezier.',
      meer: function (n) { return 'Nog ' + n + ' kandidaten achter de hand: zeg “niet deze” om de volgende te zien.'; },
      geenMeer: 'Geen kandidaten meer. Tip: kies een fijner raster, wijs een ander voorbeeld aan, of maak de foto van dichterbij.',
      niets: 'Niets gevonden. Tip: kies een fijner raster, wijs een voorbeeld aan in de berg, of maak de foto van dichterbij.',
      zeker: 'overeenkomst', vorm: 'vorm', kleur: 'kleur', handmatig: 'zelf aangewezen',
      foto_ontbreekt: 'Kies eerst een foto van de berg.',
      wat_ontbreekt: 'Laat eerst zien wat je zoekt: wijs er één aan in de berg, kies een foto van het blokje, of kies een standaardblokje.',
      geen_foto: 'Dit bestand is geen foto die de browser kan openen (probeer jpg of png).',
      gestopt: 'Gestopt na 1 minuut: niet alle richtingen en maten zijn bekeken. Kies een grover raster of zet “kan gedraaid liggen” uit.',
      zoektijd: 'Zoektijd', inBrowser: 'helemaal in je browser, zonder server',
      tijdRegel: function (i) { return 'Werkformaat ' + i.werk + ' · ' + i.hoeken + ' richtingen × ' + i.schalen + ' maten = ' + i.combis + ' combinaties · grove ronde ' + i.grof + ' · verfijnen ' + i.fijn + ' (' + i.pieken + ' plekken)'; },
      herTijd: function (ms) { return 'Opnieuw gerangschikt in ' + ms; },
      privTitel: 'Privacy',
      priv: "Je foto's verlaten je apparaat niet: het zoeken gebeurt helemaal in je browser. Er wordt niets opgestuurd of bewaard. Fotografeer liever geen gezichten.",
      voet: 'Blokjeszoeker is niet verbonden aan de LEGO Group. LEGO® is een merk van de LEGO Group.'
    },
    en: {
      intro: 'Take a photo of the pile, show what you are looking for, and Brick Finder points it out. Everything happens on your own phone or computer. For building bricks such as LEGO® and other small pieces.',
      stap1: '1. Photo of the pile', stapelHint: 'Spread the pieces out as flat as possible, with good light, straight from above.',
      fotoHint: 'Tap the photo to zoom in with the magnifier.',
      raster: 'Grid:', rasterHint: 'Coarse grid = faster. Fine grid = more precise for small pieces, but slower.',
      stap2: '2. What are you looking for?',
      refTitel: 'Show what you are looking for (needed)',
      refUitleg: 'Point one out in the pile (works best), or take a photo of the piece and draw a box around it.',
      refFoto: '📷 Photo of the piece', wijsAan: '✋ Point one out in the pile', wijsBezig: '✋ Drag a box around one piece…',
      kaderHint: 'Drag a box tightly around the piece you are looking for.',
      weg: 'Remove', refUitFoto: 'Example from your photo', refUitBestand: 'Example from your photo of the piece',
      hoekTxt: 'It lies roughly like this:', draaienTxt: 'May lie rotated (searches all directions, a bit slower)',
      vormTitel: 'Or choose a standard brick (if you have no example)', kleurTitel: 'Colour (counts only a little)', donker: 'darker', licht: 'lighter',
      lichtHint: 'Slide until the colour looks like the piece does in your photo. Question mark = use the colour of the example.',
      kleurGewicht: 'Colour counts:',
      jeZoekt: 'You are looking for:', niksGekozen: '(nothing chosen yet)', metVoorbeeld: 'with example', vrijeHoek: 'any direction',
      zoek: 'Search', bezig: 'Working…',
      nogBezig: function (s) { return 'Working… ' + s; },
      resultaat: 'Result',
      resHint: 'Drag inside the magnifier or tap the photo to look around. Tell us whether a piece is right; the list updates immediately.',
      hem: '✓ This is it!', lijkt: '≈ Looks like it, but no', niet: '✗ Not this one', zoom: 'Zoom',
      gevonden: 'Found it! Happy building.',
      meer: function (n) { return n + ' more candidates in reserve: say “not this one” to see the next.'; },
      geenMeer: 'No more candidates. Tip: choose a finer grid, point out another example, or take the photo closer.',
      niets: 'Nothing found. Tip: choose a finer grid, point out an example in the pile, or take the photo closer.',
      zeker: 'match', vorm: 'shape', kleur: 'colour', handmatig: 'pointed out by you',
      foto_ontbreekt: 'First choose a photo of the pile.',
      wat_ontbreekt: 'First show what you are looking for: point one out in the pile, choose a photo of the piece, or choose a standard brick.',
      geen_foto: 'The browser cannot open this file as a photo (try jpg or png).',
      gestopt: 'Stopped after 1 minute: not all directions and sizes were checked. Choose a coarser grid or switch off “may lie rotated”.',
      zoektijd: 'Search time', inBrowser: 'entirely in your browser, no server',
      tijdRegel: function (i) { return 'Working size ' + i.werk + ' · ' + i.hoeken + ' directions × ' + i.schalen + ' sizes = ' + i.combis + ' combinations · first pass ' + i.grof + ' · refine ' + i.fijn + ' (' + i.pieken + ' spots)'; },
      herTijd: function (ms) { return 'Re-ranked in ' + ms; },
      privTitel: 'Privacy',
      priv: 'Your photos never leave your device: the search runs entirely in your browser. Nothing is uploaded or stored. Please avoid photographing faces.',
      voet: 'Brick Finder is not affiliated with the LEGO Group. LEGO® is a trademark of the LEGO Group.'
    }
  };

  var MATEN = [[1, 1], [1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4]];
  var SOORTEN = [{ id: 'steen', nl: 'steen', en: 'brick' }, { id: 'plaat', nl: 'plaatje', en: 'plate' }, { id: 'tegel', nl: 'tegel', en: 'tile' }, { id: 'dakpan', nl: 'dakpan', en: 'slope' }];
  // Gangbare kleuren (hex zoals in de catalogus van Rebrickable)
  var KLEUREN = [
    { nl: 'rood', en: 'red', hex: '#C91A09' }, { nl: 'oranje', en: 'orange', hex: '#FE8A18' }, { nl: 'geel', en: 'yellow', hex: '#F2CD37' },
    { nl: 'limoen', en: 'lime', hex: '#BBE90B' }, { nl: 'lichtgroen', en: 'bright green', hex: '#4B9F4A' }, { nl: 'groen', en: 'dark green', hex: '#237841' },
    { nl: 'lichtblauw', en: 'medium blue', hex: '#5A93DB' }, { nl: 'blauw', en: 'blue', hex: '#0055BF' }, { nl: 'donkerblauw', en: 'dark blue', hex: '#0A3463' },
    { nl: 'paars', en: 'purple', hex: '#AC78BA' }, { nl: 'roze', en: 'pink', hex: '#E4ADC8' }, { nl: 'bruin', en: 'reddish brown', hex: '#582A12' },
    { nl: 'beige', en: 'tan', hex: '#E4CD9E' }, { nl: 'wit', en: 'white', hex: '#FFFFFF' }, { nl: 'lichtgrijs', en: 'light grey', hex: '#A0A5A9' },
    { nl: 'donkergrijs', en: 'dark grey', hex: '#6C6E68' }, { nl: 'zwart', en: 'black', hex: '#05131D' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var taal = localStorage.getItem('bz_taal') === 'en' ? 'en' : 'nl';
  function t(k) { return T[taal][k]; }

  var S = {
    bron: null, n: parseInt(localStorage.getItem('bz_raster') || '3', 10),
    maat: null, soort: null, kleur: null, licht: 0, kleurGewicht: 0.25,
    ref: null,      // { canvas: uitsnede, box: [0-1000] als uit de stapel, bron: 'foto'|'bestand', vol: canvas van de losse foto }
    hoek: 0, draaien: true,
    wijsModus: false, sleep: null, refSleep: null,
    res: null, kand: [], negatief: [], vizier: null, gekozen: null, zoom: 3, bezig: false, tijd: null
  };

  function sec(ms) { return (ms / 1000).toFixed(ms < 1000 ? 2 : 1).replace('.', taal === 'en' ? '.' : ',') + ' s'; }
  function melding(tekst) { var m = $('melding'); m.textContent = tekst || ''; m.hidden = !tekst; }
  function klem(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mengKleur(hex, licht) {
    var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16);
    var f = licht * 0.18, doel = f > 0 ? 255 : 0, a = Math.abs(f);
    function m(c) { return Math.round(c + (doel - c) * a); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  function laadBestand(file, maxZijde) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxZijde / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); resolve(c);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('geen_foto')); };
      img.src = url;
    });
  }
  function snij(bron, box, minZ, maxZ) {
    var W = bron.width, H = bron.height;
    var x0 = Math.floor(box[1] / 1000 * W), y0 = Math.floor(box[0] / 1000 * H);
    var w = Math.max(1, Math.ceil((box[3] - box[1]) / 1000 * W)), h = Math.max(1, Math.ceil((box[2] - box[0]) / 1000 * H));
    var lang = Math.max(w, h), s = lang > maxZ ? maxZ / lang : (lang < minZ ? minZ / lang : 1);
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
    var ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bron, x0, y0, w, h, 0, 0, c.width, c.height);
    return c;
  }
  // uitsnede met marge (zodat de buitenrand van het blokje meedoet bij het vergelijken)
  var PAD = 0.2;
  function snijMetMarge(bron, box) {
    var h = box[2] - box[0], w = box[3] - box[1];
    var pb = [box[0] - h * PAD, box[1] - w * PAD, box[2] + h * PAD, box[3] + w * PAD];
    var c = snij(bron, pb.map(function (v) { return klem(v, 0, 1000); }), 32, 480);
    // als de marge buiten de foto valt, kloppen de verhoudingen niet meer precies: dan zonder marge
    if (pb[0] < 0 || pb[1] < 0 || pb[2] > 1000 || pb[3] > 1000) c = snij(bron, box, 24, 400); else c.bzPad = PAD;
    return c;
  }
  function overlap(a, b) {
    var y0 = Math.max(a[0], b[0]), x0 = Math.max(a[1], b[1]), y1 = Math.min(a[2], b[2]), x1 = Math.min(a[3], b[3]);
    var i = Math.max(0, y1 - y0) * Math.max(0, x1 - x0);
    return i / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i || 1);
  }
  function rondom(box, factor, minFrac) {
    var cy = (box[0] + box[2]) / 2, cx = (box[1] + box[3]) / 2, H = S.bron.height, W = S.bron.width;
    var zijde = Math.max(Math.max((box[2] - box[0]) / 1000 * H, (box[3] - box[1]) / 1000 * W) * factor, Math.min(W, H) * minFrac);
    var hh = zijde / H * 500, hw = zijde / W * 500;
    return [klem(cy - hh, 0, 1000), klem(cx - hw, 0, 1000), klem(cy + hh, 0, 1000), klem(cx + hw, 0, 1000)];
  }

  // ---------- doel ----------
  function doelLab() {
    if (S.kleur) { var lab = BZDetect.hex2lab(S.kleur.hex); lab[0] = klem(lab[0] + S.licht * 9, 0, 100); return lab; }
    if (S.ref) return BZDetect.hoofdkleur(S.ref.canvas);
    return null;
  }
  function samenvatting() {
    var d = [];
    if (S.kleur) d.push(taal === 'en' ? S.kleur.en : S.kleur.nl);
    if (S.soort) d.push(SOORTEN.filter(function (x) { return x.id === S.soort; })[0][taal]);
    if (S.maat) d.push(S.maat[0] + '×' + S.maat[1]);
    if (S.ref) d.push(t('metVoorbeeld') + (S.draaien ? ' (' + t('vrijeHoek') + ')' : ' (' + S.hoek + '°)'));
    return d.join(' · ');
  }

  // ---------- keuzes ----------
  function svgMaat(m) {
    var u = 9, w = m[1] * u + 4, h = m[0] * u + 4, kleur = S.kleur ? mengKleur(S.kleur.hex, S.licht) : '#9aa3ab';
    var s = '<svg width="' + (4 * u + 4) + '" height="' + (2 * u + 4) + '" viewBox="0 0 ' + (4 * u + 4) + ' ' + (2 * u + 4) + '"><rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" rx="2" fill="' + kleur + '" stroke="#333"/>';
    if (S.soort !== 'tegel') for (var i = 0; i < m[0]; i++) for (var j = 0; j < m[1]; j++) {
      if (S.soort === 'dakpan' && i > 0) continue;
      s += '<circle cx="' + (2 + u / 2 + j * u) + '" cy="' + (2 + u / 2 + i * u) + '" r="2.8" fill="none" stroke="#333" stroke-width="1"/>';
    }
    return s + '</svg>';
  }
  function svgSoort(id) {
    var k = S.kleur ? mengKleur(S.kleur.hex, S.licht) : '#9aa3ab', s = '<svg width="44" height="26" viewBox="0 0 44 26">';
    if (id === 'steen') s += '<rect x="4" y="8" width="36" height="16" fill="' + k + '" stroke="#333"/><rect x="9" y="4" width="8" height="4" fill="' + k + '" stroke="#333"/><rect x="27" y="4" width="8" height="4" fill="' + k + '" stroke="#333"/>';
    if (id === 'plaat') s += '<rect x="4" y="17" width="36" height="7" fill="' + k + '" stroke="#333"/><rect x="9" y="13" width="8" height="4" fill="' + k + '" stroke="#333"/><rect x="27" y="13" width="8" height="4" fill="' + k + '" stroke="#333"/>';
    if (id === 'tegel') s += '<rect x="4" y="17" width="36" height="7" fill="' + k + '" stroke="#333"/>';
    if (id === 'dakpan') s += '<path d="M4 24 L40 24 L40 12 L22 12 Z" fill="' + k + '" stroke="#333"/><rect x="29" y="8" width="8" height="4" fill="' + k + '" stroke="#333"/>';
    return s + '</svg>';
  }
  function bouwKeuzes() {
    var maten = $('maten'); maten.innerHTML = '';
    MATEN.forEach(function (m) {
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'chip' + (S.maat && S.maat[0] === m[0] && S.maat[1] === m[1] ? ' aan' : '');
      b.innerHTML = svgMaat(m) + '<span>' + m[0] + '×' + m[1] + '</span>';
      b.onclick = function () { S.maat = (S.maat && S.maat[0] === m[0] && S.maat[1] === m[1]) ? null : m; bouwKeuzes(); };
      maten.appendChild(b);
    });
    var soorten = $('soorten'); soorten.innerHTML = '';
    SOORTEN.forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'chip' + (S.soort === x.id ? ' aan' : '');
      b.innerHTML = svgSoort(x.id) + '<span>' + x[taal] + '</span>';
      b.onclick = function () { S.soort = S.soort === x.id ? null : x.id; bouwKeuzes(); };
      soorten.appendChild(b);
    });
    var kl = $('kleuren'); kl.innerHTML = '';
    var geen = document.createElement('button'); geen.type = 'button';
    geen.className = 'kleur geen' + (!S.kleur ? ' aan' : ''); geen.textContent = '?';
    geen.title = taal === 'en' ? 'use colour of the example' : 'kleur van het voorbeeld'; geen.setAttribute('aria-label', geen.title);
    geen.onclick = function () { S.kleur = null; bouwKeuzes(); herkleur(); };
    kl.appendChild(geen);
    KLEUREN.forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button';
      b.className = 'kleur' + (S.kleur === k ? ' aan' : '');
      b.style.background = mengKleur(k.hex, S.licht);
      b.title = k[taal]; b.setAttribute('aria-label', b.title);
      b.onclick = function () { S.kleur = k; bouwKeuzes(); herkleur(); };
      kl.appendChild(b);
    });
    $('kleurproef').style.background = S.kleur ? mengKleur(S.kleur.hex, S.licht) : 'transparent';
    $('samenvatting').textContent = samenvatting() || t('niksGekozen');
  }

  function zetTaal() {
    document.documentElement.lang = taal;
    document.querySelectorAll('[data-t]').forEach(function (el) { var v = t(el.getAttribute('data-t')); if (typeof v === 'string') el.textContent = v; });
    document.title = taal === 'en' ? 'Brick Finder' : 'Blokjeszoeker';
    document.querySelector('h1').textContent = document.title;
    $('taalknop').textContent = taal === 'en' ? 'NL' : 'EN';
    if (S.wijsModus) $('wijsknop').textContent = t('wijsBezig');
    if (S.ref) $('reftekst').textContent = S.ref.bron === 'foto' ? t('refUitFoto') : t('refUitBestand');
    bouwKeuzes(); tekenLijst(); if (S.tijd) toonTijd();
  }

  // ---------- tekenen ----------
  function zichtbaar() { return S.kand.filter(function (k) { return k.status !== 'weg'; }); }
  function toonLijst() {
    var z = zichtbaar().slice();
    z.sort(function (a, b) { return (b.status === 'hem') - (a.status === 'hem') || b.det.score - a.det.score; });
    return z.slice(0, 3);
  }
  function teken() {
    if (!S.bron) return;
    var c = $('foto'), W = S.bron.width, H = S.bron.height;
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    var ctx = c.getContext('2d'); ctx.drawImage(S.bron, 0, 0);
    var dik = Math.max(2, Math.round(Math.max(W, H) / 400));
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = dik; ctx.setLineDash([dik * 4, dik * 3]);
    for (var i = 1; i < S.n; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / S.n, 0); ctx.lineTo(i * W / S.n, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * H / S.n); ctx.lineTo(W, i * H / S.n); ctx.stroke();
    }
    ctx.restore();
    if (S.ref && S.ref.box) {
      var r = S.ref.box; ctx.save(); ctx.lineWidth = dik * 1.5; ctx.strokeStyle = '#ffb000'; ctx.setLineDash([dik * 2, dik * 2]);
      ctx.strokeRect(r[1] / 1000 * W, r[0] / 1000 * H, (r[3] - r[1]) / 1000 * W, (r[2] - r[0]) / 1000 * H); ctx.restore();
    }
    var font = Math.max(14, Math.round(Math.max(W, H) / 40));
    toonLijst().forEach(function (k, idx) {
      var b = k.det.box, x = b[1] / 1000 * W, y = b[0] / 1000 * H, w = (b[3] - b[1]) / 1000 * W, h = (b[2] - b[0]) / 1000 * H;
      var kleur = k.status === 'hem' ? '#00c853' : KLEUREN_KADER[idx], p = dik * 2;
      ctx.lineWidth = dik * 2 + 2; ctx.strokeStyle = '#fff'; ctx.strokeRect(x - p, y - p, w + 2 * p, h + 2 * p);
      ctx.lineWidth = dik * 2; ctx.strokeStyle = kleur; ctx.strokeRect(x - p, y - p, w + 2 * p, h + 2 * p);
      var rr = font * 0.7, cx = Math.max(rr, x - p), cy = Math.max(rr, y - p);
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 2 * Math.PI); ctx.fillStyle = kleur; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold ' + font + 'px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(k.status === 'hem' ? '✓' : String(idx + 1), cx, cy + 1);
    });
    if (S.vizier) {
      var v = S.vizier;
      ctx.save(); ctx.lineWidth = dik * 1.5; ctx.strokeStyle = '#111'; ctx.strokeRect(v[1] / 1000 * W, v[0] / 1000 * H, (v[3] - v[1]) / 1000 * W, (v[2] - v[0]) / 1000 * H);
      ctx.setLineDash([dik * 3, dik * 3]); ctx.strokeStyle = '#fff'; ctx.strokeRect(v[1] / 1000 * W, v[0] / 1000 * H, (v[3] - v[1]) / 1000 * W, (v[2] - v[0]) / 1000 * H); ctx.restore();
    }
    if (S.sleep && S.sleep.soort === 'wijs') {
      var a = S.sleep; ctx.save(); ctx.lineWidth = dik * 2; ctx.strokeStyle = '#ffb000'; ctx.setLineDash([dik * 4, dik * 2]);
      ctx.strokeRect(Math.min(a.x0, a.x1) / 1000 * W, Math.min(a.y0, a.y1) / 1000 * H, Math.abs(a.x1 - a.x0) / 1000 * W, Math.abs(a.y1 - a.y0) / 1000 * H); ctx.restore();
    }
    tekenLoep();
  }
  function tekenLoep() {
    var c = $('loep'), ctx = c.getContext('2d');
    ctx.fillStyle = '#ddd'; ctx.fillRect(0, 0, c.width, c.height);
    if (!S.bron || !S.vizier) return;
    var v = S.vizier, W = S.bron.width, H = S.bron.height;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(S.bron, v[1] / 1000 * W, v[0] / 1000 * H, (v[3] - v[1]) / 1000 * W, (v[2] - v[0]) / 1000 * H, 0, 0, c.width, c.height);
    toonLijst().forEach(function (k, idx) {
      var b = k.det.box;
      ctx.lineWidth = 3; ctx.strokeStyle = k.status === 'hem' ? '#00c853' : KLEUREN_KADER[idx];
      ctx.strokeRect((b[1] - v[1]) / (v[3] - v[1]) * c.width - 4, (b[0] - v[0]) / (v[2] - v[0]) * c.height - 4, (b[3] - b[1]) / (v[3] - v[1]) * c.width + 8, (b[2] - b[0]) / (v[2] - v[0]) * c.height + 8);
    });
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(c.width / 2 - 10, c.height / 2); ctx.lineTo(c.width / 2 + 10, c.height / 2);
    ctx.moveTo(c.width / 2, c.height / 2 - 10); ctx.lineTo(c.width / 2, c.height / 2 + 10); ctx.stroke();
  }
  function zetVizier(cy, cx) {
    var W = S.bron.width, H = S.bron.height, zijde = Math.min(W, H) / (S.zoom + 0.5);
    var hh = zijde / H * 500, hw = zijde / W * 500;
    cy = klem(cy, hh, 1000 - hh); cx = klem(cx, hw, 1000 - hw);
    S.vizier = [cy - hh, cx - hw, cy + hh, cx + hw]; teken();
  }
  function vizierMidden() { var v = S.vizier; return v ? [(v[0] + v[2]) / 2, (v[1] + v[3]) / 2] : [500, 500]; }

  // ---------- voorbeeld ----------
  function tekenRef() {
    if (!S.ref) return;
    var rc = $('refcanvas'), ctx = rc.getContext('2d'), c = S.ref.canvas;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, rc.width, rc.height);
    var s = Math.min(rc.width / c.width, rc.height / c.height) * 0.75;
    ctx.translate(rc.width / 2, rc.height / 2); ctx.rotate(S.hoek * Math.PI / 180);
    ctx.drawImage(c, -c.width * s / 2, -c.height * s / 2, c.width * s, c.height * s);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    $('hoekwaarde').textContent = S.hoek + '°';
    $('reftekst').textContent = S.ref.bron === 'foto' ? t('refUitFoto') : t('refUitBestand');
    $('refblok').hidden = false;
    bouwKeuzes();
  }
  function zetHoek(g) { S.hoek = ((Math.round(g) % 360) + 360) % 360; $('hoek').value = S.hoek; tekenRef(); }
  function tekenEditor() {
    var r = S.ref; if (!r || !r.vol) return;
    var c = $('refeditor'); c.width = r.vol.width; c.height = r.vol.height;
    var ctx = c.getContext('2d'); ctx.drawImage(r.vol, 0, 0);
    var b = S.refSleep ? [Math.min(S.refSleep.y0, S.refSleep.y1), Math.min(S.refSleep.x0, S.refSleep.x1), Math.max(S.refSleep.y0, S.refSleep.y1), Math.max(S.refSleep.x0, S.refSleep.x1)] : r.kader;
    if (b) {
      var dik = Math.max(2, Math.round(Math.max(c.width, c.height) / 200));
      ctx.lineWidth = dik; ctx.strokeStyle = '#ffb000'; ctx.setLineDash([dik * 3, dik * 2]);
      ctx.strokeRect(b[1] / 1000 * c.width, b[0] / 1000 * c.height, (b[3] - b[1]) / 1000 * c.width, (b[2] - b[0]) / 1000 * c.height);
    }
  }

  // ---------- aanwijzen / rondkijken ----------
  function punt(e, el) { var r = el.getBoundingClientRect(); return { x: klem((e.clientX - r.left) / r.width * 1000, 0, 1000), y: klem((e.clientY - r.top) / r.height * 1000, 0, 1000) }; }
  function koppel() {
    var c = $('foto');
    c.addEventListener('pointerdown', function (e) {
      if (!S.bron) return; c.setPointerCapture(e.pointerId);
      var p = punt(e, c);
      if (S.wijsModus) { S.sleep = { soort: 'wijs', x0: p.x, y0: p.y, x1: p.x, y1: p.y }; teken(); return; }
      S.sleep = { soort: 'kijk' }; zetVizier(p.y, p.x);
    });
    c.addEventListener('pointermove', function (e) {
      if (!S.sleep) return; var p = punt(e, c);
      if (S.sleep.soort === 'wijs') { S.sleep.x1 = p.x; S.sleep.y1 = p.y; teken(); } else zetVizier(p.y, p.x);
    });
    function los() {
      if (S.sleep && S.sleep.soort === 'wijs') {
        var a = S.sleep, box = [Math.min(a.y0, a.y1), Math.min(a.x0, a.x1), Math.max(a.y0, a.y1), Math.max(a.x0, a.x1)];
        S.sleep = null;
        if (box[2] - box[0] > 6 && box[3] - box[1] > 6) {
          S.ref = { canvas: snij(S.bron, box, 24, 400), zoek: snijMetMarge(S.bron, box), box: box, bron: 'foto' };
          $('refeditorblok').hidden = true; zetHoek(0);
          S.wijsModus = false; $('wijsknop').textContent = t('wijsAan'); $('wijsknop').classList.remove('actief');
        }
        teken(); return;
      }
      S.sleep = null;
    }
    c.addEventListener('pointerup', los); c.addEventListener('pointercancel', los);

    // kader trekken in de losse voorbeeldfoto
    var ed = $('refeditor');
    ed.addEventListener('pointerdown', function (e) { if (!S.ref || !S.ref.vol) return; ed.setPointerCapture(e.pointerId); var p = punt(e, ed); S.refSleep = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; tekenEditor(); });
    ed.addEventListener('pointermove', function (e) { if (!S.refSleep) return; var p = punt(e, ed); S.refSleep.x1 = p.x; S.refSleep.y1 = p.y; tekenEditor(); });
    function edLos() {
      if (!S.refSleep) return;
      var a = S.refSleep, box = [Math.min(a.y0, a.y1), Math.min(a.x0, a.x1), Math.max(a.y0, a.y1), Math.max(a.x0, a.x1)];
      S.refSleep = null;
      if (box[2] - box[0] > 15 && box[3] - box[1] > 15) { S.ref.kader = box; S.ref.canvas = snij(S.ref.vol, box, 24, 400); S.ref.zoek = snijMetMarge(S.ref.vol, box); tekenRef(); }
      tekenEditor();
    }
    ed.addEventListener('pointerup', edLos); ed.addEventListener('pointercancel', edLos);

    // slepen in de loep verschuift het vizier
    var loep = $('loep'), start = null; loep.style.touchAction = 'none';
    loep.addEventListener('pointerdown', function (e) { if (!S.vizier) return; loep.setPointerCapture(e.pointerId); start = { x: e.clientX, y: e.clientY, m: vizierMidden() }; });
    loep.addEventListener('pointermove', function (e) {
      if (!start) return; var r = loep.getBoundingClientRect(), v = S.vizier;
      zetVizier(start.m[0] - (e.clientY - start.y) / r.height * (v[2] - v[0]), start.m[1] - (e.clientX - start.x) / r.width * (v[3] - v[1]));
    });
    loep.addEventListener('pointerup', function () { start = null; }); loep.addEventListener('pointercancel', function () { start = null; });
  }

  // ---------- zoeken (alles in de browser) ----------
  var klok = null;
  function zoek() {
    melding('');
    if (!S.bron) { melding(t('foto_ontbreekt')); return; }
    if (!S.ref && !S.maat) { melding(t('wat_ontbreekt')); return; }
    var knop = $('zoekknop'); knop.disabled = true; knop.textContent = t('bezig'); S.bezig = true;
    $('resultaat').hidden = true; $('gevonden').hidden = true; $('tijdblok').hidden = true;
    S.kand = []; S.negatief = []; S.res = null; S.gekozen = null;
    var t0 = performance.now();
    clearInterval(klok); klok = setInterval(function () { $('voortgang').textContent = t('nogBezig')(sec(performance.now() - t0)); }, 100);
    var voorbeeld = S.ref ? S.ref.zoek : BZDetect.kunstVoorbeeld(S.maat, S.soort);
    var opties = {
      voorbeeld: voorbeeld, voorbeeldBox: S.ref && S.ref.box ? S.ref.box : null,
      hoek: S.hoek, draaien: S.draaien || !S.ref, asymmetrisch: S.soort === 'dakpan',
      doelLab: doelLab(), kleurGewicht: S.kleurGewicht, raster: S.n, stopNa: TIJDLIMIET_MS
    };
    // even wachten zodat de knop en klok eerst getekend worden
    setTimeout(function () {
      BZDetect.zoek(S.bron, opties).then(function (uit) {
        S.res = uit.res;
        S.kand = uit.kandidaten.map(function (d) { return { det: d, status: 'open' }; });
        // het aangewezen voorbeeld zelf is geen nieuwe vondst
        if (S.ref && S.ref.box) S.kand = S.kand.filter(function (k) { return overlap(k.det.box, S.ref.box) < 0.3; });
        S.tijd = { totaal: performance.now() - t0, info: uit.info, her: null };
        klaar();
        if (uit.info.gestopt) melding(t('gestopt'));
      }, function (e) { console.error(e); melding(t('geen_foto')); klaar(); });
    }, 30);
    function klaar() {
      clearInterval(klok); $('voortgang').textContent = '';
      knop.disabled = false; knop.textContent = t('zoek'); S.bezig = false;
      toonResultaat();
    }
  }

  function toonResultaat() {
    $('resultaat').hidden = false;
    var top = toonLijst();
    if (top.length) kies(top[0]); else { S.vizier = null; teken(); }
    $('uitleg').textContent = top.length ? '' : t('niets');
    tekenLijst(); toonTijd();
    $('resultaat').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function kies(k) {
    S.gekozen = k;
    var b = k.det.box, W = S.bron.width, H = S.bron.height;
    var nodig = Math.max((b[2] - b[0]) / 1000 * H, (b[3] - b[1]) / 1000 * W) * 3.2;
    S.zoom = klem(Math.round(Math.min(W, H) / nodig - 0.5), 1, 6); $('zoom').value = S.zoom;
    zetVizier((b[0] + b[2]) / 2, (b[1] + b[3]) / 2); tekenLijst();
  }
  function tekenLijst() {
    var ol = $('lijst'); ol.innerHTML = '';
    if (!S.bron || $('resultaat').hidden) return;
    var top = toonLijst();
    top.forEach(function (k, i) {
      var li = document.createElement('li'); li.className = 'kand' + (S.gekozen === k ? ' gekozen' : '');
      var nr = document.createElement('span'); nr.className = 'nr';
      nr.style.background = k.status === 'hem' ? '#00c853' : KLEUREN_KADER[i]; nr.textContent = k.status === 'hem' ? '✓' : String(i + 1);
      var dc = snij(S.bron, rondom(k.det.box, 2.2, 0.04), 64, 128); dc.style.width = '64px'; dc.style.height = '64px';
      var d = k.det.det || {};
      var tx = document.createElement('span'); tx.className = 'tekst';
      tx.textContent = k.handmatig ? t('handmatig') : (k.det.score + '% ' + t('zeker') + ' · ' + t('vorm') + ' ' + Math.round(100 * Math.min(1, k.det.vorm / 0.7)) + '%' + (k.det.kleur != null ? ' · ' + t('kleur') + ' ' + Math.round(100 * k.det.kleur) + '%' : ''));
      var kn = document.createElement('span'); kn.className = 'knoppies';
      ['hem', 'lijkt', 'niet'].forEach(function (a) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = t(a);
        b.onclick = function (ev) { ev.stopPropagation(); feedback(a, k); }; kn.appendChild(b);
      });
      li.appendChild(nr); li.appendChild(dc); li.appendChild(tx); li.appendChild(kn);
      li.onclick = function () { kies(k); }; ol.appendChild(li);
    });
    var rest = S.kand.filter(function (k) { return k.status === 'open'; }).length - top.filter(function (k) { return k.status === 'open'; }).length;
    if (!top.length && S.kand.length) { var p = document.createElement('li'); p.className = 'hint'; p.textContent = t('geenMeer'); ol.appendChild(p); }
    else if (rest > 0) { var m = document.createElement('li'); m.className = 'meer'; m.textContent = t('meer')(rest); ol.appendChild(m); }
  }

  // ---------- feedback: direct herrangschikken in de browser ----------
  function herrangschik() {
    if (!S.res) return;
    var t0 = performance.now();
    var uit = BZDetect.rangschik(S.res, S.negatief);
    var oud = {}; S.kand.forEach(function (k) { oud[S.res.kand.indexOf(k.det)] = k; });
    var nieuw = uit.kandidaten.map(function (d) { return oud[S.res.kand.indexOf(d)] || { det: d, status: 'open' }; });
    S.kand.forEach(function (k) { if ((k.status === 'weg' || k.status === 'hem' || k.handmatig) && nieuw.indexOf(k) < 0) nieuw.push(k); });
    S.kand = nieuw;
    if (S.tijd) S.tijd.her = performance.now() - t0;
  }
  function herkleur() {
    if (!S.res) return;
    BZDetect.herkleur(S.res, doelLab(), S.kleurGewicht);
    herrangschik(); naFeedback();
  }
  function feedback(actie, k) {
    if (S.bezig || !S.res) return;
    if (!k) {
      var m = vizierMidden();
      k = zichtbaar().filter(function (x) { var b = x.det.box; return m[0] > b[0] - 15 && m[0] < b[2] + 15 && m[1] > b[1] - 15 && m[1] < b[3] + 15; })[0] || null;
      if (!k && actie === 'hem') {
        var v = S.vizier, hh = (v[2] - v[0]) / 6, hw = (v[3] - v[1]) / 6;
        k = { det: { box: [m[0] - hh, m[1] - hw, m[0] + hh, m[1] + hw], score: 100, vorm: 0.7, kleur: null }, status: 'open', handmatig: true };
        S.kand.push(k);
      }
    }
    if (actie === 'hem') {
      if (!k) return;
      S.kand.forEach(function (x) { if (x.status === 'hem') x.status = 'open'; });
      k.status = 'hem'; $('gevonden').hidden = false; kies(k); teken(); return;
    }
    if (actie === 'lijkt' && k && k.det.patch) { S.negatief.push(k.det.patch); if (S.negatief.length > 5) S.negatief.shift(); }
    if (k) k.status = 'weg';
    $('gevonden').hidden = true;
    if (actie === 'lijkt') herrangschik();
    naFeedback();
  }
  function naFeedback() {
    var top = toonLijst();
    if (top.length) kies(top[0]); else teken();
    $('uitleg').textContent = top.length ? '' : t('geenMeer');
    tekenLijst(); toonTijd();
  }

  function toonTijd() {
    var T0 = S.tijd; if (!T0) return;
    var i = T0.info;
    $('zoektijd').textContent = t('zoektijd') + ': ' + sec(T0.totaal) + ' (' + t('inBrowser') + ')';
    var regels = [t('tijdRegel')({ werk: i.werk, hoeken: i.hoeken, schalen: i.schalen, combis: i.combis, grof: sec(i.grofMs), fijn: sec(i.fijnMs), pieken: i.pieken })];
    if (T0.her != null) regels.push(t('herTijd')(sec(T0.her)));
    $('tijddetail').textContent = regels.join('\n');
    $('tijdblok').hidden = false;
  }

  // ---------- knoppen ----------
  $('taalknop').addEventListener('click', function () { taal = taal === 'en' ? 'nl' : 'en'; localStorage.setItem('bz_taal', taal); zetTaal(); });
  $('stapel').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    laadBestand(f, 1600).then(function (c) {
      S.bron = c; S.kand = []; S.res = null; S.vizier = null; $('resultaat').hidden = true; $('tijdblok').hidden = true;
      if (S.ref && S.ref.bron === 'foto') { S.ref = null; $('refblok').hidden = true; }
      $('fotoblok').hidden = false; $('wijsknop').disabled = false; teken(); melding(''); bouwKeuzes();
    }, function () { melding(t('geen_foto')); });
  });
  $('voorbeeld').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    laadBestand(f, 900).then(function (c) {
      var kader = [100, 100, 900, 900];
      S.ref = { vol: c, kader: kader, canvas: snij(c, kader, 24, 400), zoek: snijMetMarge(c, kader), bron: 'bestand' };
      $('refeditorblok').hidden = false; tekenEditor(); zetHoek(0); teken();
    }, function () { melding(t('geen_foto')); });
  });
  $('wijsknop').addEventListener('click', function () {
    S.wijsModus = !S.wijsModus;
    this.textContent = S.wijsModus ? t('wijsBezig') : t('wijsAan'); this.classList.toggle('actief', S.wijsModus);
    if (S.wijsModus) $('foto').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('refweg').addEventListener('click', function () { S.ref = null; $('refblok').hidden = true; $('refeditorblok').hidden = true; $('voorbeeld').value = ''; teken(); bouwKeuzes(); });
  $('hoek').addEventListener('input', function () { zetHoek(parseInt(this.value, 10)); });
  $('draaiL').addEventListener('click', function () { zetHoek(S.hoek - 90); });
  $('draaiR').addEventListener('click', function () { zetHoek(S.hoek + 90); });
  $('draaien').addEventListener('change', function () { S.draaien = this.checked; bouwKeuzes(); });
  $('licht').addEventListener('input', function () { S.licht = parseInt(this.value, 10); bouwKeuzes(); herkleur(); });
  $('kleurgewicht').addEventListener('input', function () { S.kleurGewicht = parseInt(this.value, 10) / 100; $('kleurgewichtwaarde').textContent = this.value + '%'; herkleur(); });
  $('raster').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    S.n = parseInt(b.getAttribute('data-n'), 10); localStorage.setItem('bz_raster', S.n); markeerRaster(); teken();
  });
  function markeerRaster() { $('raster').querySelectorAll('button').forEach(function (b) { b.classList.toggle('aan', parseInt(b.getAttribute('data-n'), 10) === S.n); }); }
  $('zoom').addEventListener('input', function () { S.zoom = parseInt(this.value, 10); var m = vizierMidden(); zetVizier(m[0], m[1]); });
  document.querySelectorAll('.loepknoppen [data-actie]').forEach(function (b) { b.addEventListener('click', function () { feedback(b.getAttribute('data-actie'), null); }); });
  $('zoekknop').addEventListener('click', zoek);

  if ([2, 3, 4, 5].indexOf(S.n) < 0) S.n = 3;
  markeerRaster(); koppel(); zetTaal();
  window.bzState = S; // voor tests
})();
