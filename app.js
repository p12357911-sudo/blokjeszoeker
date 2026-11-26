(function () {
  'use strict';
  var KLEUREN = ['#e6007e', '#00a0e9', '#ffb000'];
  var WORKER_URL = 'https://blokjeszoeker.scheikunde-oefenen.workers.dev/zoek';
  var T = {
    nl: {
      intro: 'Maak een foto van de berg, zeg wat je zoekt, en de Blokjeszoeker wijst het aan. Voor bouwsteentjes zoals LEGO® en andere kleine stukjes.',
      stapel: '1. Foto van de berg', stapelHint: 'Leg de stukjes zo plat mogelijk uit, met goed licht.',
      wat: '2. Wat zoek je?', watPh: 'bijv. rood tweetje',
      voorbeeld: '3. Foto van wat je zoekt (mag ook niet)',
      zoek: 'Zoek', bezig: 'Even zoeken…', resultaat: 'Resultaat',
      later: 'Gratis zoekacties per dag en extra zoekacties kopen komen later.',
      bewaard: 'Bewaard.', gewist: 'Sleutel gewist.',
      privTitel: 'Privacy',
      priv: "Je foto's worden niet bewaard. De foto wordt in je browser verkleind en via onze server één keer naar de AI van Google (Gemini) gestuurd om te zoeken. Daarna wordt hij niet bewaard, niet door ons en (bij betaald gebruik) niet voor training door Google. Om misbruik te voorkomen tellen we per dag het aantal zoekacties per onherkenbaar gemaakt IP-adres. Fotografeer liever geen gezichten.",
      over: function (n) { return n === 1 ? 'Vandaag kun je nog 1 keer zoeken.' : 'Vandaag kun je nog ' + n + ' keer zoeken.'; },
      limiet: 'Je zoekacties voor vandaag zijn op. Morgen kun je weer zoeken. Extra zoekacties kopen komt later.',
      limiet_totaal: 'Het is vandaag erg druk: het maximum voor vandaag is bereikt. Probeer het morgen nog eens.',
      drukte: 'De AI is even te druk. Probeer het over een minuutje nog eens.',
      te_groot: 'De foto is te groot.',
      voet: 'Blokjeszoeker is niet verbonden aan de LEGO Group. LEGO® is een merk van de LEGO Group.',
      foto_ontbreekt: 'Kies eerst een foto van de berg.',
      wat_ontbreekt: 'Typ wat je zoekt, of voeg een foto toe van wat je zoekt.',
      geen_foto: 'Dit bestand is geen foto die de browser kan openen (probeer jpg of png).',
      ai_fout: 'Het zoeken lukte niet.',
      quota_fout: 'Limiet of budget bij Google bereikt. Probeer het later nog eens.',
      netwerk: 'Geen verbinding met de zoekserver. Controleer je internet en probeer het nog eens.',
      onleesbaar: 'Het antwoord van de AI was onleesbaar. Probeer het nog eens.',
      niets: 'Niets gevonden. Tip: spreid de stukjes wat meer uit en maak de foto van dichterbij.',
      zeker: 'zeker', zoektijd: 'Zoektijd', model: 'Model', poging: 'poging', geenModel: 'geen model gaf antwoord', server: 'server',
    },
    en: {
      intro: 'Take a photo of the pile, say what you are looking for, and Brick Finder points it out. For building bricks such as LEGO® and other small pieces.',
      stapel: '1. Photo of the pile', stapelHint: 'Spread the pieces out as flat as possible, with good light.',
      wat: '2. What are you looking for?', watPh: 'e.g. red 1x2 brick',
      voorbeeld: '3. Photo of what you are looking for (optional)',
      zoek: 'Search', bezig: 'Searching…', resultaat: 'Result',
      later: 'Free daily searches and buying extra searches are coming later.',
      bewaard: 'Saved.', gewist: 'Key cleared.',
      privTitel: 'Privacy',
      priv: 'Your photos are not stored. The photo is resized in your browser and sent once via our server to Google\'s AI (Gemini) for the search. It is not kept afterwards, not by us and (with paid use) not for training by Google. To prevent abuse we count searches per day per scrambled IP address. Please avoid photographing faces.',
      over: function (n) { return n === 1 ? 'You can search 1 more time today.' : 'You can search ' + n + ' more times today.'; },
      limiet: 'Your searches for today are used up. You can search again tomorrow. Buying extra searches is coming later.',
      limiet_totaal: 'It is very busy today: the daily maximum has been reached. Please try again tomorrow.',
      drukte: 'The AI is busy right now. Please try again in a minute.',
      te_groot: 'The photo is too large.',
      voet: 'Brick Finder is not affiliated with the LEGO Group. LEGO® is a trademark of the LEGO Group.',
      foto_ontbreekt: 'First choose a photo of the pile.',
      wat_ontbreekt: 'Type what you are looking for, or add a photo of it.',
      geen_foto: 'The browser cannot open this file as a photo (try jpg or png).',
      ai_fout: 'The search failed.',
      quota_fout: 'Limit or budget reached at Google. Please try again later.',
      netwerk: 'No connection to the search server. Check your internet and try again.',
      onleesbaar: 'The AI answer could not be read. Please try again.',
      niets: 'Nothing found. Tip: spread the pieces out more and take the photo closer.',
      zeker: 'sure', zoektijd: 'Search time', model: 'Model', poging: 'attempt', geenModel: 'no model answered', server: 'server',
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var taal = localStorage.getItem('bz_taal') === 'en' ? 'en' : 'nl';
  function t(k) { return T[taal][k]; }

  function zetTaal() {
    document.documentElement.lang = taal;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('[data-tp]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-tp')); });
    document.title = taal === 'en' ? 'Brick Finder' : 'Blokjeszoeker';
    document.querySelector('h1').textContent = document.title;
    $('taalknop').textContent = taal === 'en' ? 'NL' : 'EN';
    $('taalknop').setAttribute('aria-label', taal === 'en' ? 'Naar Nederlands' : 'Switch to English');
    if (laatsteOver !== null) $('teller').textContent = t('over')(laatsteOver);
  }
  var laatsteOver = null;

  function melding(tekst) { var m = $('melding'); m.textContent = tekst; m.hidden = !tekst; }

  // ---------- Foto verkleinen in de browser ----------
  function verklein(file, maxZijde) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxZijde / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var dataUrl = c.toDataURL('image/jpeg', 0.85);
        resolve({ canvas: c, base64: dataUrl.slice(dataUrl.indexOf(',') + 1) });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('geen_foto')); };
      img.src = url;
    });
  }

  // ---------- AI ----------
  // ---------- Tijdmeting (voor testen) ----------
  function sec(ms) { return (ms / 1000).toFixed(1).replace('.', taal === 'en' ? '.' : ',') + ' s'; }
  function toonTijd(ms, tijd) {
    $('zoektijd').textContent = t('zoektijd') + ': ' + sec(ms);
    var delen = [];
    if (tijd && Array.isArray(tijd.pogingen)) {
      var goed = null;
      tijd.pogingen.forEach(function (p) { if (p.ok) goed = p; });
      delen.push(t('model') + ': ' + (goed ? goed.model + ' (' + sec(goed.ms) + ')' : t('geenModel')));
      tijd.pogingen.forEach(function (p, i) {
        if (!p.ok) delen.push(t('poging') + ' ' + (i + 1) + ' ' + p.model + ': ' + p.status + ' (' + sec(p.ms) + ')');
      });
      if (typeof tijd.totaal_ms === 'number') delen.push(t('server') + ' ' + sec(tijd.totaal_ms));
    }
    $('tijddetail').textContent = delen.join(' · ');
    $('tijddetail').hidden = !delen.length;
    $('tijdblok').hidden = false;
  }

  function foutMet(code, detail) { var e = new Error(code); e.code = code; e.detail = detail || ''; return e; }

  // Zoeken via onze Cloudflare Worker (die bewaart de Gemini-sleutel, niet de browser).
  function zoek(wat, stapel64, voorbeeld64) {
    var body = { wat: wat, taal: taal, stapel: stapel64 };
    if (voorbeeld64) body.voorbeeld = voorbeeld64;
    return fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .catch(function () { throw foutMet('netwerk'); })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok || d.fout_code) { var e = foutMet(d.fout_code || 'ai_fout', r.ok ? '' : 'HTTP ' + r.status); e.tijd = d.tijd; throw e; }
          if (!Array.isArray(d.kandidaten)) throw foutMet('onleesbaar');
          return d;
        });
      });
  }

  // ---------- Tekenen ----------
  function teken(bron, kandidaten) {
    var doek = $('doek');
    var w = bron.width, h = bron.height;
    doek.width = w; doek.height = h;
    var ctx = doek.getContext('2d');
    ctx.drawImage(bron, 0, 0);
    var dik = Math.max(3, Math.round(Math.max(w, h) / 250));
    var font = Math.max(16, Math.round(Math.max(w, h) / 32));
    kandidaten.forEach(function (k, i) {
      var b = k.box_2d; // [ymin, xmin, ymax, xmax], 0-1000
      var x = b[1] / 1000 * w, y = b[0] / 1000 * h;
      var bw = (b[3] - b[1]) / 1000 * w, bh = (b[2] - b[0]) / 1000 * h;
      var kleur = KLEUREN[i % KLEUREN.length], pad = dik * 2;
      ctx.lineWidth = dik + 3; ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(x - pad, y - pad, bw + 2 * pad, bh + 2 * pad);
      ctx.lineWidth = dik; ctx.strokeStyle = kleur;
      ctx.strokeRect(x - pad, y - pad, bw + 2 * pad, bh + 2 * pad);
      var r = font * 0.75, cx = Math.max(r, x - pad), cy = Math.max(r, y - pad);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = kleur; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold ' + font + 'px Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), cx, cy + 1);
    });
  }

  // ---------- Knoppen ----------
  $('taalknop').addEventListener('click', function () {
    taal = taal === 'en' ? 'nl' : 'en';
    localStorage.setItem('bz_taal', taal);
    zetTaal();
  });
  $('zoekform').addEventListener('submit', function (e) {
    e.preventDefault();
    melding('');
    var stapelFile = $('stapel').files[0], voorbeeldFile = $('voorbeeld').files[0];
    var wat = $('wat').value.trim().replace(/["\u0000-\u001F]+/g, ' ').slice(0, 120);
    if (!stapelFile) { melding(t('foto_ontbreekt')); return; }
    if (!wat && !voorbeeldFile) { melding(t('wat_ontbreekt')); return; }
    var knop = $('zoekknop');
    var start = performance.now();
    $('tijdblok').hidden = true;
    knop.disabled = true; knop.textContent = t('bezig');
    var stapelCanvas;
    Promise.all([verklein(stapelFile, 1600), voorbeeldFile ? verklein(voorbeeldFile, 1000) : Promise.resolve(null)])
      .catch(function () { throw foutMet('geen_foto'); })
      .then(function (r) {
        stapelCanvas = r[0].canvas;
        return zoek(wat || 'the object in image 2', r[0].base64, r[1] && r[1].base64);
      })
      .then(function (d) {
        $('resultaat').hidden = false;
        teken(stapelCanvas, d.kandidaten);
        var lijst = $('lijst'); lijst.innerHTML = '';
        d.kandidaten.forEach(function (k, i) {
          var li = document.createElement('li');
          var stip = document.createElement('span');
          stip.textContent = '● '; stip.style.color = KLEUREN[i % KLEUREN.length];
          li.appendChild(stip);
          li.appendChild(document.createTextNode((k.label || '') + ' (' + k.zekerheid + '% ' + t('zeker') + ')'));
          lijst.appendChild(li);
        });
        if (typeof d.over_vandaag === 'number') { laatsteOver = d.over_vandaag; $('teller').textContent = t('over')(laatsteOver); }
        toonTijd(performance.now() - start, d.tijd);
        $('uitleg').textContent = d.kandidaten.length ? d.uitleg : ((d.uitleg ? d.uitleg + ' ' : '') + t('niets'));
        $('resultaat').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        var code = (err && err.code) || 'ai_fout';
        if (code === 'limiet') { laatsteOver = 0; $('teller').textContent = t('over')(0); }
        toonTijd(performance.now() - start, err && err.tijd);
        melding((t(code) || t('ai_fout')) + (err && err.detail && code === 'ai_fout' ? ' (' + err.detail + ')' : ''));
      })
      .then(function () { knop.disabled = false; knop.textContent = t('zoek'); });
  });

  zetTaal();
})();
