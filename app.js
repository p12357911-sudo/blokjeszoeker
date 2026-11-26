(function () {
  'use strict';
  // Blokjeszoeker: alles gebeurt in de browser. Geen server, geen AI, geen limiet.
  var TIJDLIMIET_MS = 60000;
  var KLEUREN_KADER = ['#e6007e', '#00a0e9', '#ffb000'];

  var T = {
    nl: {
      intro: 'Maak een foto van de berg, laat zien wat je zoekt, en de Blokjeszoeker wijst het aan. Alles gebeurt op je eigen telefoon of computer. Voor bouwsteentjes zoals LEGO® en andere kleine stukjes.',
      stap1: '1. Foto van de berg', stapelHint: 'Leg de stukjes zo plat mogelijk uit, met goed licht, recht van boven.',
      fotoHint: 'Verschuiven/zoomen: knijp met twee vingers of scroll om te zoomen, sleep om te verschuiven. Na het zoeken: tik op een plek om die in het vergrootglas te bekijken.',
      fotoHintWijs: 'Aanwijzen: sleep met één vinger een kader om één blokje. Daarna kun je de hoekjes verslepen of het kader verschuiven. Met twee vingers kun je nog steeds zoomen.',
      modusKijk: '✋ Verschuiven / zoomen', modusWijs: '⬚ Blokje aanwijzen', passend: 'Passend',
      raster: 'Raster (detail):', rasterHint: 'Schuif naar rechts voor een fijner raster: vindt kleinere stukjes, maar zoekt langer.',
      schatting: function (tijd, maat, nog) { return 'Geschatte zoektijd ≈ ' + tijd + ' (werkformaat ' + maat + ')' + nog; },
      schattingNog: ' · ruwe schatting, wordt nauwkeuriger na de eerste zoekactie',
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
      resHint: 'Sleep het kader over de foto (of tik ergens). Het vergrootglas laat zien wat erin zit. Zit een gekleurd kader net naast het blokje? Tik erop en versleep het, of trek aan de witte hoekjes. Met de knoppen zeg je of dat blokje het is.',
      alsVoorbeeld: '＋ Gebruik als voorbeeld', geenKandHier: 'Hier ligt geen kandidaat. Staat het goede blokje in het kader? Kies dan “Dit is hem!” of “Gebruik als voorbeeld”.',
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
      priv: "Het gewone zoeken gebeurt helemaal in je browser: je foto verlaat je apparaat niet. Alleen als je zelf op “Laat AI meekijken” drukt, gaat een verkleinde foto (of uitsneden) plus je voorbeeld via onze server naar Mistral AI (Frankrijk). Wij bewaren die beelden niet. Fotografeer liever geen gezichten.",
      aiTitel: '🤖 AI-hulp (optioneel)', aiUitleg: 'Twijfel je? Laat AI (Mistral, Europees) de beste kandidaten controleren en zelf omkaderen. Gratis maar beperkt per dag.',
      aiWerkwijze: 'AI kijkt naar:', aiFoto: 'hele foto', aiMozaiek: 'uitsneden (top 6)',
      aiKnop: function (n) { return '🤖 Laat AI meekijken' + (n != null ? ' (nog ' + n + ' vandaag)' : ''); },
      aiNiet: 'AI-hulp nog niet beschikbaar', aiBezig: '🤖 AI kijkt mee…', aiOp: 'Je AI-checks voor vandaag zijn op. Morgen weer.',
      aiDruk: 'De AI is nu te druk of gaf een fout. Probeer het zo nog eens.', aiFout: 'AI-hulp lukte niet (geen verbinding).',
      aiTijd: function (tot, model, m, werk) { return 'AI-check: ' + tot + ' (waarvan model ' + m + ') · ' + model + ' · ' + werk; },
      aiUitslag: function (b, tw, n, v) { return 'AI-oordeel: ' + b + ' bevestigd, ' + tw + ' twijfel, ' + n + ' nee' + (v ? ', ' + v + ' nieuwe AI-vondst(en) (paars)' : '') + '.'; },
      aiGeen: 'AI vond geen exacte match in dit beeld.',
      ai_bevestigd: 'AI: bevestigd', ai_twijfel: 'AI: twijfel', ai_nee: 'AI: nee', aiVondst: 'AI-vondst',
      slimTxt: 'Slimme herkenning (3D) – experimenteel', slimHint: 'Laat per kandidaat zien op welk onderdeel het lijkt (3D-modellen van LDraw), welke kant boven ligt en hoeveel noppen te zien zijn. Verandert de volgorde niet. Werkt in je browser; laadt eenmalig ± 4 MB. 3D-modellen: LDraw.org (CC BY 4.0).',
      slimBezig: 'Slimme herkenning (3D) bezig…', slimFout: 'Slimme herkenning (3D) lukte niet; gewone uitslag getoond.',
      zijde_boven: 'bovenkant', zijde_onder: 'onderkant', 'zijde_?': 'geen noppen gezien', noppen: 'noppen', lijkt3d: 'lijkt op',
      slimRegel: function (s) { return 'Slimme herkenning (3D): ' + s.ms + ' voor ' + s.n + ' kandidaten' + (s.laad ? ' · model laden ' + s.laad : '') + ' · ' + s.backend + (s.doel ? ' · doel: ' + s.doel : ''); },
      voet: 'Blokjeszoeker is niet verbonden aan de LEGO Group. LEGO® is een merk van de LEGO Group.'
    },
    en: {
      intro: 'Take a photo of the pile, show what you are looking for, and Brick Finder points it out. Everything happens on your own phone or computer. For building bricks such as LEGO® and other small pieces.',
      stap1: '1. Photo of the pile', stapelHint: 'Spread the pieces out as flat as possible, with good light, straight from above.',
      fotoHint: 'Move/zoom: pinch with two fingers or scroll to zoom, drag to move. After searching: tap a spot to view it in the magnifier.',
      fotoHintWijs: 'Point out: drag a box around one piece with one finger. Then drag the corners or move the box. Two fingers still zoom.',
      modusKijk: '✋ Move / zoom', modusWijs: '⬚ Point out a piece', passend: 'Fit',
      raster: 'Grid (detail):', rasterHint: 'Slide right for a finer grid: finds smaller pieces, but takes longer.',
      schatting: function (tijd, maat, nog) { return 'Estimated search time ≈ ' + tijd + ' (working size ' + maat + ')' + nog; },
      schattingNog: ' · rough estimate, gets more accurate after the first search',
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
      resHint: 'Drag the box over the photo (or tap anywhere). The magnifier shows what is inside. Is a coloured box slightly off the piece? Tap it and drag it, or pull the white corners. Use the buttons to say whether that piece is the one.',
      alsVoorbeeld: '＋ Use as example', geenKandHier: 'There is no candidate here. Is the right piece inside the box? Then choose “This is it!” or “Use as example”.',
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
      priv: 'The normal search runs entirely in your browser: your photo never leaves your device. Only when you press “Let AI take a look” is a downscaled photo (or crops) plus your example sent via our server to Mistral AI (France). We do not store those images. Please avoid photographing faces.',
      aiTitel: '🤖 AI help (optional)', aiUitleg: 'Not sure? Let AI (Mistral, European) check the best candidates and outline matches itself. Free but limited per day.',
      aiWerkwijze: 'AI looks at:', aiFoto: 'whole photo', aiMozaiek: 'crops (top 6)',
      aiKnop: function (n) { return '🤖 Let AI take a look' + (n != null ? ' (' + n + ' left today)' : ''); },
      aiNiet: 'AI help not available yet', aiBezig: '🤖 AI is looking…', aiOp: 'Your AI checks for today are used up. Back tomorrow.',
      aiDruk: 'The AI is busy or returned an error. Please try again shortly.', aiFout: 'AI help failed (no connection).',
      aiTijd: function (tot, model, m, werk) { return 'AI check: ' + tot + ' (model ' + m + ') · ' + model + ' · ' + werk; },
      aiUitslag: function (b, tw, n, v) { return 'AI verdict: ' + b + ' confirmed, ' + tw + ' unsure, ' + n + ' no' + (v ? ', ' + v + ' new AI find(s) (purple)' : '') + '.'; },
      aiGeen: 'AI found no exact match in this image.',
      ai_bevestigd: 'AI: confirmed', ai_twijfel: 'AI: unsure', ai_nee: 'AI: no', aiVondst: 'AI find',
      slimTxt: 'Smart recognition (3D) – experimental', slimHint: 'Shows per candidate which part it looks like (LDraw 3D models), which side faces up and how many studs are visible. Does not change the order. Runs in your browser; loads ± 4 MB once. 3D models: LDraw.org (CC BY 4.0).',
      slimBezig: 'Smart recognition (3D) running…', slimFout: 'Smart recognition (3D) failed; showing the normal result.',
      zijde_boven: 'top', zijde_onder: 'bottom', 'zijde_?': 'no studs seen', noppen: 'studs', lijkt3d: 'looks like',
      slimRegel: function (s) { return 'Smart recognition (3D): ' + s.ms + ' for ' + s.n + ' candidates' + (s.laad ? ' · model load ' + s.laad : '') + ' · ' + s.backend + (s.doel ? ' · target: ' + s.doel : ''); },
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
    bron: null, n: parseInt(localStorage.getItem('bz_raster') || '6', 10), modus: 'kijk',
    maat: null, soort: null, kleur: null, licht: 0, kleurGewicht: 0.25,
    ref: null,      // { canvas: uitsnede, box: [0-1000] als uit de stapel, bron: 'foto'|'bestand', vol: canvas van de losse foto }
    hoek: 0, draaien: true, slim: localStorage.getItem('bz_slim') === '1', slimInfo: null,
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
    if (S.bron) werkSchattingBij();
  }

  function zetTaal() {
    document.documentElement.lang = taal;
    document.querySelectorAll('[data-t]').forEach(function (el) { var v = t(el.getAttribute('data-t')); if (typeof v === 'string') el.textContent = v; });
    document.title = taal === 'en' ? 'Brick Finder' : 'Blokjeszoeker';
    document.querySelector('h1').textContent = document.title;
    $('taalknop').textContent = taal === 'en' ? 'NL' : 'EN';
    $('fotohint').textContent = t(S.modus === 'wijs' ? 'fotoHintWijs' : 'fotoHint'); werkSchattingBij();
    if (S.ref) $('reftekst').textContent = S.ref.bron === 'foto' ? t('refUitFoto') : t('refUitBestand');
    bouwKeuzes(); tekenLijst(); if (S.tijd) toonTijd(); if (S.ai) aiKnopTekst();
  }

  // ---------- tekenen ----------
  function zichtbaar() { return S.kand.filter(function (k) { return k.status !== 'weg'; }); }
  function toonLijst() {
    var z = zichtbaar().slice();
    z.sort(function (a, b) { return (b.status === 'hem') - (a.status === 'hem') || b.det.score - a.det.score; });
    return z.slice(0, 3);
  }
  // ---------- tekenen op de hoofdfoto (via de kijker: zoom/verschuiven) ----------
  function teken() { if (KF && S.bron) KF.teken(); }
  function tekenOpFoto(ctx, px) {
    var W = S.bron.width, H = S.bron.height;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5 * px; ctx.setLineDash([6 * px, 5 * px]);
    ctx.beginPath();
    for (var i = 1; i < S.n; i++) { ctx.moveTo(i * W / S.n, 0); ctx.lineTo(i * W / S.n, H); ctx.moveTo(0, i * H / S.n); ctx.lineTo(W, i * H / S.n); }
    ctx.stroke(); ctx.setLineDash([]);
    if (S.ref && S.ref.box && S.modus !== 'wijs') {
      var r = S.ref.box; ctx.lineWidth = 2.5 * px; ctx.strokeStyle = '#ffb000'; ctx.setLineDash([5 * px, 4 * px]);
      ctx.strokeRect(r[1] / 1000 * W, r[0] / 1000 * H, (r[3] - r[1]) / 1000 * W, (r[2] - r[0]) / 1000 * H); ctx.setLineDash([]);
    }
    var font = 15 * px;
    toonLijst().forEach(function (k, idx) {
      var b = k.det.box, x = b[1] / 1000 * W, y = b[0] / 1000 * H, w = (b[3] - b[1]) / 1000 * W, h = (b[2] - b[0]) / 1000 * H;
      var kleur = k.status === 'hem' ? '#00c853' : KLEUREN_KADER[idx], p = 3 * px;
      ctx.lineWidth = 5 * px; ctx.strokeStyle = '#fff'; ctx.strokeRect(x - p, y - p, w + 2 * p, h + 2 * p);
      ctx.lineWidth = 3 * px; ctx.strokeStyle = kleur; ctx.strokeRect(x - p, y - p, w + 2 * p, h + 2 * p);
      var rr = 11 * px, cx = x - p, cy = y - p;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 2 * Math.PI); ctx.fillStyle = kleur; ctx.fill();
      ctx.lineWidth = 2 * px; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold ' + font + 'px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(k.status === 'hem' ? '✓' : String(idx + 1), cx, cy + px);
    });
    if (S.vizier && S.modus !== 'wijs') {
      var v = S.vizier, vx = v[1] / 1000 * W, vy = v[0] / 1000 * H, vw = (v[3] - v[1]) / 1000 * W, vh = (v[2] - v[0]) / 1000 * H;
      ctx.lineWidth = 2 * px; ctx.strokeStyle = '#111'; ctx.strokeRect(vx, vy, vw, vh);
      ctx.setLineDash([5 * px, 5 * px]); ctx.strokeStyle = '#fff'; ctx.strokeRect(vx, vy, vw, vh); ctx.setLineDash([]);
    }
  }
  // Vergrote voorvertoning van het kader, in de hoek van de foto (tijdens aanwijzen)
  function naTekenenFoto(k) {
    $('zoomwaarde').textContent = Math.round(k.zoomFactor() * 100) + '%';
    if (S.modus === 'wijs' && k.kader) {
      var q = k.kader, ctx = k.c.getContext('2d'), d = k.dpr, Z = Math.min(110, k.cw * 0.3);
      var links = (q[0] + q[2]) / 2 * k.s + k.ox > k.cw / 2; // voorvertoning aan de andere kant dan het kader
      var x = links ? 8 : k.cw - Z - 8, y = 8, bw = q[2] - q[0], bh = q[3] - q[1], sc = Math.min(Z / bw, Z / bh);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y - 3, Z + 6, Z + 6);
      ctx.drawImage(S.bron, q[0], q[1], bw, bh, x + (Z - bw * sc) / 2, y + (Z - bh * sc) / 2, bw * sc, bh * sc);
      ctx.lineWidth = 2; ctx.strokeStyle = '#ffb000'; ctx.strokeRect(x - 3, y - 3, Z + 6, Z + 6);
    }
    tekenLoep();
  }
  // Resultaatfoto: hele foto staat vast, het kader (vizier) is versleepbaar
  function tekenResFoto() {
    var c = $('resfoto'); if (!S.bron || $('resultaat').hidden) return;
    var cw = c.parentElement.clientWidth; if (!cw) return;
    var W = S.bron.width, H = S.bron.height, dpr = Math.min(3, window.devicePixelRatio || 1);
    var ch = Math.round(cw * H / W);
    if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); c.style.height = ch + 'px'; }
    var ctx = c.getContext('2d'), s = c.width / W, px = 1 / s;
    ctx.setTransform(s, 0, 0, s, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(S.bron, 0, 0);
    toonLijst().forEach(function (k, idx) {
      var b = k.det.box, x = b[1] / 1000 * W, y = b[0] / 1000 * H, w = (b[3] - b[1]) / 1000 * W, h = (b[2] - b[0]) / 1000 * H;
      var kleur = k.status === 'hem' ? '#00c853' : KLEUREN_KADER[idx];
      ctx.lineWidth = 4 * dpr * px; ctx.strokeStyle = '#fff'; ctx.strokeRect(x - 2 * px, y - 2 * px, w + 4 * px, h + 4 * px);
      ctx.lineWidth = 2.5 * dpr * px; ctx.strokeStyle = kleur; ctx.strokeRect(x - 2 * px, y - 2 * px, w + 4 * px, h + 4 * px);
    });
    (S.aiBoxen || []).forEach(function (q) {
      var x = q[1] / 1000 * W, y = q[0] / 1000 * H, w = (q[3] - q[1]) / 1000 * W, h = (q[2] - q[0]) / 1000 * H;
      ctx.save(); ctx.setLineDash([6 * dpr * px, 4 * dpr * px]); ctx.lineWidth = 3 * dpr * px; ctx.strokeStyle = '#7b1fa2'; ctx.strokeRect(x - 5 * px, y - 5 * px, w + 10 * px, h + 10 * px); ctx.restore();
      ctx.fillStyle = '#7b1fa2'; ctx.font = 'bold ' + (11 * dpr * px) + 'px Arial'; ctx.textBaseline = 'bottom'; ctx.fillText('AI', x - 5 * px, y - 6 * px);
    });
    if (S.vizier) {
      var v = S.vizier, vx = v[1] / 1000 * W, vy = v[0] / 1000 * H, vw = (v[3] - v[1]) / 1000 * W, vh = (v[2] - v[0]) / 1000 * H;
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(vx, vy, vw, vh); ctx.fill('evenodd');
      ctx.lineWidth = 5 * dpr * px; ctx.strokeStyle = '#111'; ctx.strokeRect(vx, vy, vw, vh);
      ctx.lineWidth = 2.5 * dpr * px; ctx.strokeStyle = '#fff'; ctx.strokeRect(vx, vy, vw, vh);
      // greepje in het midden: laat zien dat je het kader kunt slepen
      ctx.beginPath(); ctx.arc(vx + vw / 2, vy + vh / 2, 7 * dpr * px, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
      ctx.lineWidth = 2 * dpr * px; ctx.strokeStyle = '#003A5C'; ctx.stroke();
    }
    // geselecteerde kandidaat: precies kader + hoekgrepen (verslepen = verplaatsen, hoekjes = maat)
    var g = S.gekozen;
    if (g && g.status !== 'weg') {
      var gb = g.det.box, gx = gb[1] / 1000 * W, gy = gb[0] / 1000 * H, gw = (gb[3] - gb[1]) / 1000 * W, gh = (gb[2] - gb[0]) / 1000 * H;
      ctx.lineWidth = 2 * dpr * px; ctx.strokeStyle = '#fff'; ctx.setLineDash([4 * dpr * px, 3 * dpr * px]); ctx.strokeRect(gx, gy, gw, gh); ctx.setLineDash([]);
      [[gx, gy], [gx + gw, gy], [gx, gy + gh], [gx + gw, gy + gh]].forEach(function (q) {
        ctx.beginPath(); ctx.arc(q[0], q[1], 6 * dpr * px, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 2.5 * dpr * px; ctx.strokeStyle = g.status === 'hem' ? '#00c853' : '#e6007e'; ctx.stroke();
      });
    }
  }
  function tekenLoep() {
    tekenResFoto();
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
    var g = S.gekozen;
    if (g && g.status !== 'weg') {
      var gb = g.det.box, X0 = (gb[1] - v[1]) / (v[3] - v[1]) * c.width, Y0 = (gb[0] - v[0]) / (v[2] - v[0]) * c.height, X1 = (gb[3] - v[1]) / (v[3] - v[1]) * c.width, Y1 = (gb[2] - v[0]) / (v[2] - v[0]) * c.height;
      ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.setLineDash([6, 4]); ctx.strokeRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.setLineDash([]);
      [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]].forEach(function (q) {
        ctx.beginPath(); ctx.arc(q[0], q[1], 11, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = g.status === 'hem' ? '#00c853' : '#e6007e'; ctx.stroke();
      });
    }
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(c.width / 2 - 10, c.height / 2); ctx.lineTo(c.width / 2 + 10, c.height / 2);
    ctx.moveTo(c.width / 2, c.height / 2 - 10); ctx.lineTo(c.width / 2, c.height / 2 + 10); ctx.stroke();
  }
  function zetVizier(cy, cx) {
    var W = S.bron.width, H = S.bron.height, zijde = Math.min(W, H) / (S.zoom * 0.75 + 0.5);
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
  // ---------- aanwijzen in de foto ----------
  function naarBox(k, W, H) { return [k[1] / H * 1000, k[0] / W * 1000, k[3] / H * 1000, k[2] / W * 1000]; }
  function naarKader(b, W, H) { return [b[1] / 1000 * W, b[0] / 1000 * H, b[3] / 1000 * W, b[2] / 1000 * H]; }
  function zetModus(m) {
    S.modus = m;
    $('modus').querySelectorAll('button').forEach(function (b) { b.classList.toggle('aan', b.getAttribute('data-m') === m); });
    if (m === 'wijs' && S.ref && S.ref.bron === 'foto') KF.kader = naarKader(S.ref.box, S.bron.width, S.bron.height);
    else if (m === 'wijs') KF.kader = null;
    $('fotohint').textContent = t(m === 'wijs' ? 'fotoHintWijs' : 'fotoHint');
    $('wijsknop').classList.toggle('actief', m === 'wijs');
    KF.zetModus(m);
  }
  var KF = null, KE = null;
  function koppel() {
    KF = new Kijker($('foto'), {
      tekenExtra: tekenOpFoto, naTekenen: naTekenenFoto,
      opTik: function (ix, iy) { if (S.res) zetVizier(iy / S.bron.height * 1000, ix / S.bron.width * 1000); },
      opKader: function (k, klaar) {
        var box = naarBox(k, S.bron.width, S.bron.height);
        S.ref = { canvas: snij(S.bron, box, 24, 400), zoek: klaar ? snijMetMarge(S.bron, box) : null, box: box, bron: 'foto' };
        $('refeditorblok').hidden = true;
        if (klaar) { zetHoek(S.hoek); werkSchattingBij(); } else tekenRefSnel();
      }
    });
    $('modus').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && S.bron) zetModus(b.getAttribute('data-m')); });
    $('zoomIn').addEventListener('click', function () { KF.zoomOm(1.6); });
    $('zoomUit').addEventListener('click', function () { KF.zoomOm(1 / 1.6); });
    $('zoomReset').addEventListener('click', function () { KF.passend(); });

    KE = new Kijker($('refeditor'), {
      modus: 'wijs', maxHoogte: 0.5,
      opKader: function (k, klaar) {
        var r = S.ref; if (!r || !r.vol) return;
        r.kader = naarBox(k, r.vol.width, r.vol.height); r.canvas = snij(r.vol, r.kader, 24, 400);
        if (klaar) { r.zoek = snijMetMarge(r.vol, r.kader); tekenRef(); } else tekenRefSnel();
      }
    });
    KE.zetModus('wijs');
    $('edIn').addEventListener('click', function () { KE.zoomOm(1.6); });
    $('edUit').addEventListener('click', function () { KE.zoomOm(1 / 1.6); });
    $('edReset').addEventListener('click', function () { KE.passend(); });

    // Kandidaatkaders bewerken: in de geselecteerde kandidaat slepen = verplaatsen, hoekjes = groter/kleiner.
    // Elders slepen = het vergrootglas-kader verschuiven. Tik op een ander kandidaatkader = selecteren.
    var GREEP_PX = 20;
    function raak(p, tolY, tolX) {
      var g = S.gekozen;
      if (g && g.status !== 'weg') {
        var b = g.det.box, hoeken = { lb: [b[0], b[1]], rb: [b[0], b[3]], lo: [b[2], b[1]], ro: [b[2], b[3]] }, beste = null, bd = 1;
        var binnen = p[0] > b[0] && p[0] < b[2] && p[1] > b[1] && p[1] < b[3];
        // binnen het kader telt een hoek alleen vlak bij die hoek (anders kun je een klein kader niet verplaatsen)
        if (binnen) { tolY = Math.min(tolY, (b[2] - b[0]) * 0.3); tolX = Math.min(tolX, (b[3] - b[1]) * 0.3); }
        for (var n in hoeken) { var d = Math.hypot((p[0] - hoeken[n][0]) / tolY, (p[1] - hoeken[n][1]) / tolX); if (d < bd) { bd = d; beste = n; } }
        if (beste) return { k: g, greep: beste };
        if (binnen) return { k: g, greep: 'binnen' };
      }
      var ander = toonLijst().filter(function (k) { var b = k.det.box; return p[0] > b[0] && p[0] < b[2] && p[1] > b[1] && p[1] < b[3]; })[0];
      return ander ? { k: ander, greep: 'kies' } : null;
    }
    function bewerk(st, p) {
      var o = st.oud, dy = p[0] - st.p0[0], dx = p[1] - st.p0[1], b;
      if (st.greep === 'binnen') {
        dy = klem(dy, -o[0], 1000 - o[2]); dx = klem(dx, -o[1], 1000 - o[3]);
        b = [o[0] + dy, o[1] + dx, o[2] + dy, o[3] + dx];
      } else {
        b = o.slice();
        if (st.greep[1] === 'b') b[0] = klem(o[0] + dy, 0, 1000); else b[2] = klem(o[2] + dy, 0, 1000);
        if (st.greep[0] === 'l') b[1] = klem(o[1] + dx, 0, 1000); else b[3] = klem(o[3] + dx, 0, 1000);
        b = [Math.min(b[0], b[2]), Math.min(b[1], b[3]), Math.max(b[0], b[2]), Math.max(b[1], b[3])];
        if (b[2] - b[0] < 3 || b[3] - b[1] < 3) return;
      }
      st.k.det.box = b; st.k.det.vast = true; st.k.aangepast = true; teken();
    }
    function koppelBewerken(el, naarFoto, tolerantie, schuifVizier) {
      var st = null;
      el.addEventListener('pointerdown', function (e) {
        if (!S.bron || !S.vizier) return; e.preventDefault(); el.setPointerCapture(e.pointerId);
        var p = naarFoto(e), tol = tolerantie(), h = raak(p, tol[0], tol[1]);
        if (h && h.greep !== 'kies') st = { id: e.pointerId, soort: 'kand', k: h.k, greep: h.greep, p0: p, oud: h.k.det.box.slice() };
        else st = { id: e.pointerId, soort: 'vizier', kies: h ? h.k : null, x0: e.clientX, y0: e.clientY, bewogen: false, v: schuifVizier.start(e, p) };
      });
      el.addEventListener('pointermove', function (e) {
        if (!st || e.pointerId !== st.id) return;
        if (st.soort === 'kand') { bewerk(st, naarFoto(e)); return; }
        if (Math.hypot(e.clientX - st.x0, e.clientY - st.y0) > 5) st.bewogen = true;
        if (st.bewogen || !st.kies) schuifVizier.beweeg(e, st.v);
      });
      function los(e) {
        if (!st || e.pointerId !== st.id) return;
        if (st.soort === 'vizier' && st.kies && !st.bewogen) kies(st.kies);
        if (st.soort === 'kand') tekenLijst();
        st = null;
      }
      el.addEventListener('pointerup', los); el.addEventListener('pointercancel', los);
    }
    var rf = $('resfoto');
    function rfPunt(e) { var r = rf.getBoundingClientRect(); return [klem((e.clientY - r.top) / r.height * 1000, 0, 1000), klem((e.clientX - r.left) / r.width * 1000, 0, 1000)]; }
    koppelBewerken(rf, rfPunt, function () { var r = rf.getBoundingClientRect(); return [GREEP_PX / r.height * 1000, GREEP_PX / r.width * 1000]; }, {
      // resultaatfoto: kader pakken en slepen; buiten het kader tikken zet het kader daar neer
      start: function (e, p) {
        var v = S.vizier, m = vizierMidden(), binnen = p[0] > v[0] && p[0] < v[2] && p[1] > v[1] && p[1] < v[3];
        var d = { dy: binnen ? m[0] - p[0] : 0, dx: binnen ? m[1] - p[1] : 0, binnen: binnen, p: p };
        return d;
      },
      beweeg: function (e, d) { var p = rfPunt(e); zetVizier(p[0] + d.dy, p[1] + d.dx); }
    });
    // tik buiten het kader (zonder kandidaat) zet het vergrootglas daar neer
    rf.addEventListener('pointerup', function (e) { if (!S.vizier) return; var p = rfPunt(e), v = S.vizier; if (!(p[0] > v[0] && p[0] < v[2] && p[1] > v[1] && p[1] < v[3]) && !raak(p, 1, 1)) zetVizier(p[0], p[1]); });
    window.addEventListener('resize', function () { tekenResFoto(); });
    $('alsvoorbeeld').addEventListener('click', function () {
      if (!S.vizier || S.bezig) return;
      // middelste derde van het kader als nieuw voorbeeld; daarna kun je het in de foto bijstellen
      var v = S.vizier, hh = (v[2] - v[0]) / 6, hw = (v[3] - v[1]) / 6, m = vizierMidden();
      var box = [m[0] - hh, m[1] - hw, m[0] + hh, m[1] + hw], g = S.gekozen;
      // ligt de (eventueel bijgestelde) geselecteerde kandidaat in het vergrootglas? dan precies dat kader gebruiken
      if (g && g.status !== 'weg') { var gm = [(g.det.box[0] + g.det.box[2]) / 2, (g.det.box[1] + g.det.box[3]) / 2]; if (gm[0] > v[0] && gm[0] < v[2] && gm[1] > v[1] && gm[1] < v[3]) box = g.det.box.slice(); }
      S.ref = { canvas: snij(S.bron, box, 24, 400), zoek: snijMetMarge(S.bron, box), box: box, bron: 'foto' };
      $('refeditorblok').hidden = true; zetHoek(0);
      zetModus('wijs'); KF.centreerOp((box[1] + box[3]) / 2000 * S.bron.width, (box[0] + box[2]) / 2000 * S.bron.height, 4);
      $('fotoblok').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // loep: zelfde bewerken (kandidaat verplaatsen/maat), elders slepen verschuift het vizier
    var loep = $('loep'); loep.style.touchAction = 'none';
    function loepPunt(e) { var r = loep.getBoundingClientRect(), v = S.vizier; return [v[0] + (e.clientY - r.top) / r.height * (v[2] - v[0]), v[1] + (e.clientX - r.left) / r.width * (v[3] - v[1])]; }
    koppelBewerken(loep, loepPunt, function () { var r = loep.getBoundingClientRect(), v = S.vizier; return [GREEP_PX / r.height * (v[2] - v[0]), GREEP_PX / r.width * (v[3] - v[1])]; }, {
      start: function (e) { return { x: e.clientX, y: e.clientY, m: vizierMidden(), v: S.vizier.slice() }; },
      beweeg: function (e, d) { var r = loep.getBoundingClientRect(), v = d.v; zetVizier(d.m[0] - (e.clientY - d.y) / r.height * (v[2] - v[0]), d.m[1] - (e.clientX - d.x) / r.width * (v[3] - v[1])); }
    });
  }
  function tekenRefSnel() { if (S.ref) { $('refblok').hidden = false; tekenRef(); } }

  // ---------- zoeken (alles in de browser, verdeeld over Web Workers) ----------
  var klok = null, WERKERS = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 2) - 1)), pool = null, werkersKapot = false;
  function werkerPool() {
    if (pool || werkersKapot) return pool;
    try { pool = []; for (var i = 0; i < WERKERS; i++) pool.push(new Worker('zoekwerker.js')); }
    catch (e) { pool = null; werkersKapot = true; }
    return pool;
  }
  function aantalCombis() {
    var hoeken = (S.draaien || !S.ref) ? (S.soort === 'dakpan' ? 12 : 6) : 1;
    var schalen = S.ref && S.ref.bron === 'foto' ? 3 : 5 + (S.n >= 7 ? 1 : 0) + (S.n >= 11 ? 1 : 0);
    return hoeken * schalen;
  }
  // Tijdschatting: rekenwerk x gemeten snelheid van dit apparaat (na de eerste zoekactie nauwkeuriger)
  function schatMs() {
    if (!S.bron) return null;
    var rate = parseFloat(localStorage.getItem('bz_snelheid') || '0') || 2.5e-6;
    return BZDetect.rekenwerk(S.bron.width, S.bron.height, S.n, aantalCombis()) * rate / (werkersKapot ? 1 : WERKERS) + 120;
  }
  function werkSchattingBij() {
    $('rasterwaarde').textContent = S.n + '×' + S.n;
    var ms = schatMs(); if (ms == null) { $('schatting').textContent = ''; return; }
    var m = BZDetect.werkMaat(S.bron.width, S.bron.height, S.n);
    $('schatting').textContent = t('schatting')(sec(ms), m.w + '×' + m.h, localStorage.getItem('bz_snelheid') ? '' : t('schattingNog'));
  }
  function zoekMetWerkers(bron, o, voortgang) {
    var ws = werkerPool(); if (!ws) return Promise.reject(new Error('geen werkers'));
    var m = BZDetect.werkMaat(bron.width, bron.height, o.raster);
    var c = document.createElement('canvas'); c.width = m.w; c.height = m.h;
    var cx = c.getContext('2d', { willReadFrequently: true }); cx.imageSmoothingQuality = 'high'; cx.drawImage(bron, 0, 0, m.w, m.h);
    var beeld = cx.getImageData(0, 0, m.w, m.h);
    var vbC = o.voorbeeld, vc = document.createElement('canvas'); vc.width = vbC.width; vc.height = vbC.height;
    var vx = vc.getContext('2d', { willReadFrequently: true }); vx.drawImage(vbC, 0, 0);
    var vb = vx.getImageData(0, 0, vc.width, vc.height);
    var oc = { voorbeeldBox: o.voorbeeldBox, hoek: o.hoek, draaien: o.draaien, asymmetrisch: o.asymmetrisch, doelLab: o.doelLab, kleurGewicht: o.kleurGewicht, raster: o.raster };
    var stopOp = Date.now() + o.stopNa, N = ws.length, klaar = new Array(N).fill(0), tg = performance.now();
    return new Promise(function (resolve, reject) {
      var best = null, bestI = null, binnen = 0, gestopt = false, gedaan = 0;
      ws.forEach(function (w, i) {
        w.onerror = function (e) { reject(e); };
        w.onmessage = function (e) {
          var d = e.data;
          if (d.cmd === 'voortgang') { klaar[d.deel] = d.klaar; voortgang(klaar.reduce(function (a, b) { return a + b; }, 0) / N); return; }
          if (d.cmd === 'grof') {
            if (!best) { best = d.best; bestI = d.bestI; }
            else for (var p = 0; p < best.length; p++) if (d.best[p] > best[p]) { best[p] = d.best[p]; bestI[p] = d.bestI[p]; }
            gestopt = gestopt || d.gestopt; gedaan = Math.max(gedaan, d.gedaan);
            if (++binnen === N) {
              var grofMs = performance.now() - tg;
              ws[0].onmessage = function (e2) {
                var u = e2.data.uit; u.kandidaten = u.kandidaten.map(function (ix) { return u.res.kand[ix]; });
                u.info.grofMs = grofMs; u.info.gestopt = gestopt; u.info.gedaan = gedaan; u.info.werkers = N;
                resolve(u);
              };
              ws[0].postMessage({ cmd: 'fijn', best: best, bestI: bestI }, [best.buffer, bestI.buffer]);
            }
          }
        };
        w.postMessage({ cmd: 'grof', beeld: { data: beeld.data.buffer.slice(0), width: m.w, height: m.h }, vb: { data: vb.data.buffer.slice(0), width: vb.width, height: vb.height }, vbPad: vbC.bzPad || 0, o: oc, deel: i, aantal: N, hoofd: i === 0, stopOp: stopOp });
      });
    });
  }
  function zoek() {
    melding('');
    if (!S.bron) { melding(t('foto_ontbreekt')); return; }
    if (!S.ref && !S.maat) { melding(t('wat_ontbreekt')); return; }
    if (S.ref && !S.ref.zoek) S.ref.zoek = S.ref.bron === 'foto' ? snijMetMarge(S.bron, S.ref.box) : snijMetMarge(S.ref.vol, S.ref.kader);
    if (S.modus === 'wijs') zetModus('kijk');
    var knop = $('zoekknop'); knop.disabled = true; knop.textContent = t('bezig'); S.bezig = true;
    $('resultaat').hidden = true; $('gevonden').hidden = true; $('tijdblok').hidden = true;
    S.kand = []; S.negatief = []; S.res = null; S.gekozen = null; S.aiBoxen = null; $('aistatus').textContent = '';
    var t0 = performance.now(), deel = 0;
    clearInterval(klok); klok = setInterval(function () { $('voortgang').textContent = t('nogBezig')(sec(performance.now() - t0) + (deel ? ' · ' + Math.round(deel * 100) + '%' : '')); }, 100);
    var opties = {
      voorbeeld: S.ref ? S.ref.zoek : BZDetect.kunstVoorbeeld(S.maat, S.soort), voorbeeldBox: S.ref && S.ref.box ? S.ref.box : null,
      hoek: S.hoek, draaien: S.draaien || !S.ref, asymmetrisch: S.soort === 'dakpan',
      doelLab: doelLab(), kleurGewicht: S.kleurGewicht, raster: S.n, stopNa: TIJDLIMIET_MS,
      voortgang: function (f) { deel = f; }
    };
    var ops = BZDetect.rekenwerk(S.bron.width, S.bron.height, S.n, aantalCombis());
    zoekMetWerkers(S.bron, opties, opties.voortgang).catch(function (e) {
      console.warn('Web Workers niet beschikbaar, zoek op de hoofddraad', e); werkersKapot = true; pool = null;
      return BZDetect.zoek(S.bron, opties);
    }).then(function (uit) {
      S.res = uit.res;
      S.kand = uit.kandidaten.map(function (d) { return { det: d, status: 'open' }; });
      // het aangewezen voorbeeld zelf is geen nieuwe vondst
      if (S.ref && S.ref.box) S.kand = S.kand.filter(function (k) { return overlap(k.det.box, S.ref.box) < 0.3; });
      var totaal = performance.now() - t0;
      S.tijd = { totaal: totaal, info: uit.info, her: null };
      if (!uit.info.gestopt) localStorage.setItem('bz_snelheid', String(Math.max(1e-7, (totaal - 120) * (uit.info.werkers || 1) / ops)));
      S.slimInfo = null;
      (S.slim ? slimToepassen() : Promise.resolve()).then(klaar, klaar);
      if (uit.info.gestopt) melding(t('gestopt'));
    }, function (e) { console.error(e); melding(t('geen_foto')); klaar(); });
    function klaar() {
      clearInterval(klok); $('voortgang').textContent = '';
      knop.disabled = false; knop.textContent = t('zoek'); S.bezig = false;
      werkSchattingBij(); toonResultaat(); aiKnopTekst();
    }
  }


  // ---------- Slimme herkenning (3D): optionele tweede laag, alleen in de browser ----------
  function slimWissen() { if (S.res) S.res.kand.forEach(function (d) { d.drie = null; }); S.slimInfo = null; }
  function slimToepassen() {
    if (!S.res || !self.BZHerken) return Promise.resolve();
    $('voortgang').textContent = t('slimBezig');
    var eerst = !S.slimGeladen;
    return BZHerken.laad('').then(function (info) {
      S.slimGeladen = true;
      // Alleen informatie per kandidaat (onderdeel, zijde, gelijkenis). De rangorde blijft die van het gewone zoeken:
      // in de test (stapel-echt.jpg, 21 zoekvragen) maakte meewegen de top-1/top-5 niet beter. Zie NOTITIES.md.
      var dets = S.kand.filter(function (k) { return !k.aiVondst && !k.handmatig && k.det.box; }).map(function (k) { return k.det; });
      var sx = S.bron.width / S.res.img.w;
      var r = BZHerken.beoordeel(S.bron, dets.map(function (d) { return { box: d.box, kort: d.bw ? Math.min(d.bw, d.bh) * sx : null }; }),
        { doel: BZHerken.doelDeel(S.maat, S.soort), ref: S.ref && !S.maat ? S.ref.zoek : null });
      S.res.kand.forEach(function (d) { d.drie = null; });
      dets.forEach(function (d, i) { d.drie = r.kand[i]; });
      S.slimInfo = { ms: r.ms, n: dets.length, laad: eerst ? info.ms : null, backend: info.backend, doel: r.doel ? BZHerken.DELEN[r.doel].nl + ' (' + r.doel + ')' : null };
    }).catch(function (e) { console.warn('3D', e); slimWissen(); melding(t('slimFout')); });
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
    S.zoom = klem(Math.round((Math.min(W, H) / nodig - 0.5) / 0.75), 1, 8); $('zoom').value = S.zoom;
    // als de hoofdfoto is ingezoomd: meeschuiven naar dit blokje
    if (KF && KF.zoomFactor() > 1.05) { KF.ox = KF.cw / 2 - (b[1] + b[3]) / 2000 * W * KF.s; KF.oy = KF.ch / 2 - (b[0] + b[2]) / 2000 * H * KF.s; KF._klem(); }
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
      var d = k.det.det || {}, d3 = !k.aiVondst && !k.handmatig ? k.det.drie : null;
      var tx = document.createElement('span'); tx.className = 'tekst';
      tx.textContent = k.aiVondst ? '' : k.handmatig ? t('handmatig') : (k.det.score + '% ' + t('zeker') + ' · ' + t('vorm') + ' ' + Math.round(100 * Math.min(1, k.det.vorm / 0.7)) + '%' + (k.det.kleur != null ? ' · ' + t('kleur') + ' ' + Math.round(100 * k.det.kleur) + '%' : ''));
      if (d3) { var dr = document.createElement('span'); dr.className = 'drie'; dr.textContent = '3D: ' + t('lijkt3d') + ' ' + d3.naam + ' · ' + t('zijde_' + d3.zijde) + (d3.noppen ? ' · ' + d3.noppen + ' ' + t('noppen') : '') + ' · ' + Math.round(100 * d3.sim) + '%'; tx.appendChild(dr); }
      if (k.ai || k.aiVondst) { var bd = document.createElement('span'); bd.className = 'aibadge ' + (k.aiVondst ? 'vondst' : k.ai); bd.textContent = k.aiVondst ? t('aiVondst') : t('ai_' + k.ai); tx.appendChild(bd); }
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
    S.kand.forEach(function (k) { if ((k.status === 'weg' || k.status === 'hem' || k.handmatig || k.aiVondst) && nieuw.indexOf(k) < 0) nieuw.push(k); });
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
    if (!k && S.gekozen && S.gekozen.status !== 'weg') {
      var gv = S.vizier, gb = S.gekozen.det.box, gm = [(gb[0] + gb[2]) / 2, (gb[1] + gb[3]) / 2];
      if (gm[0] > gv[0] && gm[0] < gv[2] && gm[1] > gv[1] && gm[1] < gv[3]) k = S.gekozen;
    }
    if (!k) {
      var m = vizierMidden();
      k = zichtbaar().filter(function (x) { var b = x.det.box; return m[0] > b[0] - 15 && m[0] < b[2] + 15 && m[1] > b[1] - 15 && m[1] < b[3] + 15; })[0] || null;
      if (!k && actie === 'hem') {
        var v = S.vizier, hh = (v[2] - v[0]) / 6, hw = (v[3] - v[1]) / 6;
        k = { det: { box: [m[0] - hh, m[1] - hw, m[0] + hh, m[1] + hw], score: 100, vorm: 0.7, kleur: null }, status: 'open', handmatig: true };
        S.kand.push(k);
      }
    }
    if (!k) { melding(t('geenKandHier')); return; }
    melding('');
    if (actie === 'hem') {
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
    if (S.slimInfo && S.slimInfo.ms != null) regels.push(t('slimRegel')({ ms: sec(S.slimInfo.ms), n: S.slimInfo.n, laad: S.slimInfo.laad != null ? sec(S.slimInfo.laad) : null, backend: S.slimInfo.backend, doel: S.slimInfo.doel }));
    $('tijddetail').textContent = regels.join('\n');
    $('tijdblok').hidden = false;
  }

  // ---------- optionele AI-stap (Mistral via onze Worker; alleen op knopdruk) ----------
  var WORKER = 'https://blokjeszoeker.scheikunde-oefenen.workers.dev';
  (function () { var q = new URLSearchParams(location.search).get('worker'); if (q && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(q)) WORKER = q; })();
  S.ai = { beschikbaar: false, over: null, modus: 'foto', bezig: false };
  function aiKnopTekst() {
    var k = $('aiknop');
    if (S.ai.bezig) { k.textContent = t('aiBezig'); k.disabled = true; return; }
    if (!S.ai.beschikbaar) { k.textContent = t('aiNiet'); k.disabled = true; return; }
    k.textContent = t('aiKnop')(S.ai.over); k.disabled = S.ai.over === 0 || !S.res;
  }
  function aiStatus() {
    fetch(WORKER + '/status').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      S.ai.beschikbaar = !!(j && j.ai); S.ai.over = j ? j.over_vandaag : null; aiKnopTekst();
    }, function () { S.ai.beschikbaar = false; aiKnopTekst(); });
  }
  function jpeg(c, q) { return c.toDataURL('image/jpeg', q || 0.85).split(',')[1]; }
  function verklein(bron, maxZ) {
    var s = Math.min(1, maxZ / Math.max(bron.width, bron.height)), c = document.createElement('canvas');
    c.width = Math.round(bron.width * s); c.height = Math.round(bron.height * s);
    var x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(bron, 0, 0, c.width, c.height); return c;
  }
  function beschrijvingEn() {
    var d = [];
    if (S.kleur) d.push(S.kleur.en);
    if (S.maat) d.push(S.maat[0] + 'x' + S.maat[1]);
    d.push(S.soort ? SOORTEN.filter(function (x) { return x.id === S.soort; })[0].en : 'brick');
    return d.join(' ') + (S.maat ? ' (' + S.maat[0] * S.maat[1] + ' studs)' : '');
  }
  // AI-box [xmin,ymin,xmax,ymax] (0-1000 van het verstuurde beeld) -> onze box [y0,x0,y1,x1] (0-1000 van de foto)
  function oordeel(c, boxen) {
    var cm = [(c[0] + c[2]) / 2, (c[1] + c[3]) / 2], best = 'nee';
    boxen.forEach(function (a) {
      var am = [(a[0] + a[2]) / 2, (a[1] + a[3]) / 2];
      var cin = cm[0] > a[0] && cm[0] < a[2] && cm[1] > a[1] && cm[1] < a[3], ain = am[0] > c[0] && am[0] < c[2] && am[1] > c[1] && am[1] < c[3];
      var i = overlap(c, a);
      if (i >= 0.3 || (cin && ain)) best = 'bevestigd';
      else if ((cin || ain || i >= 0.1) && best !== 'bevestigd') best = 'twijfel';
    });
    return best;
  }
  function aiCheck() {
    if (!S.res || S.ai.bezig || !S.ai.beschikbaar) return;
    var modus = S.ai.modus, kand = zichtbaar().filter(function (k) { return !k.aiVondst; }), payload = { modus: modus }, tegels = [];
    if (modus === 'foto') {
      payload.beeld = { data: jpeg(verklein(S.bron, 1280)) };
    } else {
      // mozaïek: top 6 kandidaten als genummerde tegels van 320 px (meer detail per kandidaat)
      var top = kand.slice().sort(function (a, b) { return b.det.score - a.det.score; }).slice(0, 6), T = 320, kol = 3, rij = Math.ceil(top.length / kol);
      var m = document.createElement('canvas'); m.width = kol * T; m.height = Math.max(1, rij) * T;
      var mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.fillRect(0, 0, m.width, m.height);
      top.forEach(function (k, i) {
        var r = rondom(k.det.box, 2.2, 0.04), W = S.bron.width, H = S.bron.height, x0 = (i % kol) * T, y0 = Math.floor(i / kol) * T;
        mx.drawImage(S.bron, r[1] / 1000 * W, r[0] / 1000 * H, (r[3] - r[1]) / 1000 * W, (r[2] - r[0]) / 1000 * H, x0 + 2, y0 + 2, T - 4, T - 4);
        mx.fillStyle = '#000'; mx.fillRect(x0 + 2, y0 + 2, 26, 22); mx.fillStyle = '#fff'; mx.font = 'bold 16px Arial'; mx.fillText(String(i + 1), x0 + 9, y0 + 19);
        tegels.push({ k: k, r: r, x0: x0, y0: y0 });
      });
      payload.beeld = { data: jpeg(m) }; payload._w = m.width; payload._h = m.height;
      kand = top;
    }
    if (S.ref) { var rc = S.ref.canvas, s = Math.max(1, 160 / Math.max(rc.width, rc.height)), vc = document.createElement('canvas'); vc.width = Math.round(rc.width * s); vc.height = Math.round(rc.height * s); vc.getContext('2d').drawImage(rc, 0, 0, vc.width, vc.height); payload.voorbeeld = { data: jpeg(vc, 0.9) }; }
    if (S.kleur || S.maat || !S.ref) payload.beschrijving = beschrijvingEn();
    var mw = payload._w, mh = payload._h; delete payload._w; delete payload._h;
    S.ai.bezig = true; aiKnopTekst(); $('aistatus').textContent = '';
    var t0 = performance.now(), klokAI = setInterval(function () { $('aistatus').textContent = t('nogBezig')(sec(performance.now() - t0)); }, 200);
    fetch(WORKER + '/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { return { st: r.status, j: j }; }); })
      .then(function (x) {
        clearInterval(klokAI); S.ai.bezig = false;
        var j = x.j || {}; if (j.over_vandaag != null) S.ai.over = j.over_vandaag;
        if (x.st !== 200) { $('aistatus').textContent = x.st === 429 ? t('aiOp') : (j.fout === 'geen_toegang' || j.fout === 'uit') ? t('aiNiet') : t('aiDruk'); aiKnopTekst(); return; }
        // AI-boxen omrekenen naar fotocoördinaten
        var boxen = [];
        j.boxen.forEach(function (b) {
          var q = [b.box_2d[1], b.box_2d[0], b.box_2d[3], b.box_2d[2]]; // [y0,x0,y1,x1] in 0-1000 van het verstuurde beeld
          if (modus === 'foto') { boxen.push(q); return; }
          var px = [q[0] / 1000 * mh, q[1] / 1000 * mw, q[2] / 1000 * mh, q[3] / 1000 * mw], cy = (px[0] + px[2]) / 2, cx = (px[1] + px[3]) / 2;
          var tg = tegels.filter(function (g) { return cx >= g.x0 && cx < g.x0 + 320 && cy >= g.y0 && cy < g.y0 + 320; })[0]; if (!tg) return;
          var r = tg.r, f = function (v, o, a, b2) { return a + (Math.max(0, Math.min(316, v - o - 2)) / 316) * (b2 - a); };
          boxen.push([f(px[0], tg.y0, r[0], r[2]), f(px[1], tg.x0, r[1], r[3]), f(px[2], tg.y0, r[0], r[2]), f(px[3], tg.x0, r[1], r[3])]);
        });
        S.kand.forEach(function (k) { delete k.ai; });
        var tel = { bevestigd: 0, twijfel: 0, nee: 0 };
        kand.forEach(function (k) { k.ai = oordeel(k.det.box, boxen); tel[k.ai]++; });
        // AI-boxen die bij geen enkele kandidaat horen: nieuwe AI-vondsten
        var nieuw = boxen.filter(function (q) { return !S.kand.some(function (k) { return oordeel(k.det.box, [q]) !== 'nee'; }); });
        S.kand = S.kand.filter(function (k) { return !k.aiVondst; });
        nieuw.forEach(function (q) { S.kand.push({ det: { box: q, score: 90, vorm: 0, kleur: null }, status: 'open', aiVondst: true }); });
        S.aiBoxen = boxen;
        $('aistatus').textContent = (boxen.length ? t('aiUitslag')(tel.bevestigd, tel.twijfel, tel.nee, nieuw.length) : t('aiGeen')) + '\n' +
          t('aiTijd')(sec(performance.now() - t0), j.model, sec(j.tijd.model_ms), modus === 'foto' ? t('aiFoto') : t('aiMozaiek'));
        aiKnopTekst(); naFeedback();
      }, function () { clearInterval(klokAI); S.ai.bezig = false; $('aistatus').textContent = t('aiFout'); aiKnopTekst(); });
  }
  $('aiknop').addEventListener('click', aiCheck);
  $('aimodus').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; S.ai.modus = b.getAttribute('data-m');
    $('aimodus').querySelectorAll('button').forEach(function (x) { x.classList.toggle('aan', x === b); });
  });

  // ---------- knoppen ----------
  $('taalknop').addEventListener('click', function () { taal = taal === 'en' ? 'nl' : 'en'; localStorage.setItem('bz_taal', taal); zetTaal(); });
  $('stapel').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    laadBestand(f, 2400).then(function (c) {
      S.bron = c; S.kand = []; S.res = null; S.vizier = null; $('resultaat').hidden = true; $('tijdblok').hidden = true;
      if (S.ref && S.ref.bron === 'foto') { S.ref = null; $('refblok').hidden = true; }
      $('fotoblok').hidden = false; $('wijsknop').disabled = false;
      KF.zetBeeld(c); zetModus('kijk'); werkSchattingBij(); melding(''); bouwKeuzes();
    }, function () { melding(t('geen_foto')); });
  });
  $('voorbeeld').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    laadBestand(f, 1200).then(function (c) {
      var kader = [100, 100, 900, 900];
      S.ref = { vol: c, kader: kader, canvas: snij(c, kader, 24, 400), zoek: snijMetMarge(c, kader), bron: 'bestand' };
      $('refeditorblok').hidden = false; KE.zetBeeld(c); KE.kader = naarKader(kader, c.width, c.height); KE.teken();
      if (S.modus === 'wijs') zetModus('kijk');
      zetHoek(0); teken(); werkSchattingBij();
    }, function () { melding(t('geen_foto')); });
  });
  $('wijsknop').addEventListener('click', function () {
    if (!S.bron) return;
    zetModus(S.modus === 'wijs' ? 'kijk' : 'wijs');
    if (S.modus === 'wijs') $('fotoblok').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('refweg').addEventListener('click', function () { S.ref = null; if (S.modus === 'wijs') { KF.kader = null; zetModus('kijk'); } $('refblok').hidden = true; $('refeditorblok').hidden = true; $('voorbeeld').value = ''; teken(); bouwKeuzes(); });
  $('hoek').addEventListener('input', function () { zetHoek(parseInt(this.value, 10)); });
  $('draaiL').addEventListener('click', function () { zetHoek(S.hoek - 90); });
  $('draaiR').addEventListener('click', function () { zetHoek(S.hoek + 90); });
  $('draaien').addEventListener('change', function () { S.draaien = this.checked; bouwKeuzes(); werkSchattingBij(); });
  $('licht').addEventListener('input', function () { S.licht = parseInt(this.value, 10); bouwKeuzes(); herkleur(); });
  $('slim').checked = S.slim;
  $('slim').addEventListener('change', function () {
    S.slim = this.checked; localStorage.setItem('bz_slim', S.slim ? '1' : '0');
    if (!S.res || S.bezig) return;
    (S.slim ? slimToepassen() : Promise.resolve(slimWissen())).then(function () { $('voortgang').textContent = ''; naFeedback(); });
  });
  $('kleurgewicht').addEventListener('input', function () { S.kleurGewicht = parseInt(this.value, 10) / 100; $('kleurgewichtwaarde').textContent = this.value + '%'; herkleur(); });
  $('raster').addEventListener('input', function () { S.n = parseInt(this.value, 10); localStorage.setItem('bz_raster', S.n); werkSchattingBij(); teken(); });
  $('zoom').addEventListener('input', function () { S.zoom = parseInt(this.value, 10); var m = vizierMidden(); zetVizier(m[0], m[1]); });
  document.querySelectorAll('.loepknoppen [data-actie]').forEach(function (b) { b.addEventListener('click', function () { feedback(b.getAttribute('data-actie'), null); }); });
  $('zoekknop').addEventListener('click', zoek);

  if (!(S.n >= 2 && S.n <= 16)) S.n = 6;
  $('raster').value = S.n; koppel(); zetTaal(); werkSchattingBij(); aiStatus();
  window.bzState = S; window.__KF = KF; // voor tests
})();
