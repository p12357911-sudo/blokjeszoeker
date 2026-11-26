(function () {
  'use strict';
  var KLEUREN = ['#e6007e', '#00a0e9', '#ffb000'];
  var STANDAARD_MODEL = 'gemini-3.8-flash';
  var T = {
    nl: {
      intro: 'Maak een foto van de berg, zeg wat je zoekt, en de Blokjeszoeker wijst het aan. Voor bouwsteentjes zoals LEGO® en andere kleine stukjes.',
      demo: 'DEMO-modus: er is nog geen sleutel ingesteld, dus de resultaten zijn nep. Zo kun je de pagina testen.',
      stapel: '1. Foto van de berg', stapelHint: 'Leg de stukjes zo plat mogelijk uit, met goed licht.',
      wat: '2. Wat zoek je?', watPh: 'bijv. rood tweetje',
      voorbeeld: '3. Foto van wat je zoekt (mag ook niet)',
      zoek: 'Zoek', bezig: 'Even zoeken…', resultaat: 'Resultaat',
      later: 'Gratis zoekacties per dag en extra zoekacties kopen komen later.',
      instTitel: 'Instellingen', sleutel: 'Eigen Gemini API-sleutel', sleutelPh: 'plak hier je sleutel', model: 'Model',
      bewaar: 'Bewaar', wis: 'Wis sleutel',
      waarschuwing: 'De sleutel blijft alleen in deze browser (op dit apparaat) en gaat alleen naar Google. Stel bij Google een budgetlimiet in, gebruik dit niet op een gedeelde computer en wis de sleutel als je klaar bent. Zonder sleutel werkt de site in DEMO-modus.',
      metSleutel: 'Sleutel ingesteld: er wordt echt gezocht met Gemini.', zonderSleutel: 'Geen sleutel: DEMO-modus.',
      bewaard: 'Bewaard.', gewist: 'Sleutel gewist.',
      privTitel: 'Privacy',
      priv: "Deze site heeft geen eigen server en bewaart je foto's niet. De foto wordt in je browser verkleind en alleen naar de AI van Google (Gemini) gestuurd, met je eigen sleutel. In DEMO-modus verlaat de foto je apparaat niet. Fotografeer liever geen gezichten.",
      voet: 'Blokjeszoeker is niet verbonden aan de LEGO Group. LEGO® is een merk van de LEGO Group.',
      foto_ontbreekt: 'Kies eerst een foto van de berg.',
      wat_ontbreekt: 'Typ wat je zoekt, of voeg een foto toe van wat je zoekt.',
      geen_foto: 'Dit bestand is geen foto die de browser kan openen (probeer jpg of png).',
      ai_fout: 'Het zoeken lukte niet.', sleutel_fout: 'Google weigert de sleutel. Controleer hem bij Instellingen.',
      model_fout: 'Dit model bestaat niet (meer). Kijk bij Instellingen naar de modelnaam.',
      quota_fout: 'Limiet of budget bij Google bereikt. Probeer het later nog eens.',
      netwerk: 'Geen verbinding met Google. Probeer het nog eens.',
      onleesbaar: 'Het antwoord van de AI was onleesbaar. Probeer het nog eens.',
      niets: 'Niets gevonden. Tip: spreid de stukjes wat meer uit en maak de foto van dichterbij.',
      zeker: 'zeker',
      demoUitleg: 'DEMO-modus: dit zijn nepresultaten om de pagina te testen. Er is geen AI gebruikt.'
    },
    en: {
      intro: 'Take a photo of the pile, say what you are looking for, and Brick Finder points it out. For building bricks such as LEGO® and other small pieces.',
      demo: 'DEMO mode: no key has been set, so results are fake. Use it to test the page.',
      stapel: '1. Photo of the pile', stapelHint: 'Spread the pieces out as flat as possible, with good light.',
      wat: '2. What are you looking for?', watPh: 'e.g. red 1x2 brick',
      voorbeeld: '3. Photo of what you are looking for (optional)',
      zoek: 'Search', bezig: 'Searching…', resultaat: 'Result',
      later: 'Free daily searches and buying extra searches are coming later.',
      instTitel: 'Settings', sleutel: 'Your own Gemini API key', sleutelPh: 'paste your key here', model: 'Model',
      bewaar: 'Save', wis: 'Clear key',
      waarschuwing: 'The key stays in this browser only (on this device) and is only sent to Google. Set a budget limit at Google, do not use this on a shared computer and clear the key when done. Without a key the site runs in DEMO mode.',
      metSleutel: 'Key set: real searches with Gemini.', zonderSleutel: 'No key: DEMO mode.',
      bewaard: 'Saved.', gewist: 'Key cleared.',
      privTitel: 'Privacy',
      priv: 'This site has no server of its own and does not store your photos. The photo is resized in your browser and only sent to Google\'s AI (Gemini), with your own key. In DEMO mode the photo never leaves your device. Please avoid photographing faces.',
      voet: 'Brick Finder is not affiliated with the LEGO Group. LEGO® is a trademark of the LEGO Group.',
      foto_ontbreekt: 'First choose a photo of the pile.',
      wat_ontbreekt: 'Type what you are looking for, or add a photo of it.',
      geen_foto: 'The browser cannot open this file as a photo (try jpg or png).',
      ai_fout: 'The search failed.', sleutel_fout: 'Google rejects the key. Check it under Settings.',
      model_fout: 'This model does not exist (any more). Check the model name under Settings.',
      quota_fout: 'Limit or budget reached at Google. Please try again later.',
      netwerk: 'No connection to Google. Please try again.',
      onleesbaar: 'The AI answer could not be read. Please try again.',
      niets: 'Nothing found. Tip: spread the pieces out more and take the photo closer.',
      zeker: 'sure',
      demoUitleg: 'DEMO mode: these are fake results so you can test the page. No AI was used.'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var taal = localStorage.getItem('bz_taal') === 'en' ? 'en' : 'nl';
  function t(k) { return T[taal][k]; }
  function sleutel() { return localStorage.getItem('bz_sleutel') || ''; }
  function model() { return (localStorage.getItem('bz_model') || STANDAARD_MODEL).replace(/[^a-zA-Z0-9.\-_]/g, '') || STANDAARD_MODEL; }

  function zetTaal() {
    document.documentElement.lang = taal;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('[data-tp]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-tp')); });
    document.title = taal === 'en' ? 'Brick Finder' : 'Blokjeszoeker';
    document.querySelector('h1').textContent = document.title;
    $('taalknop').textContent = taal === 'en' ? 'NL' : 'EN';
    $('taalknop').setAttribute('aria-label', taal === 'en' ? 'Naar Nederlands' : 'Switch to English');
    toonSleutelStatus('');
  }

  function toonSleutelStatus(extra) {
    var heeft = !!sleutel();
    $('demobalk').hidden = heeft;
    $('sleutelstatus').textContent = (extra ? extra + ' ' : '') + (heeft ? t('metSleutel') : t('zonderSleutel'));
  }

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
  function prompt(wat, metVoorbeeld) {
    var uitlegTaal = taal === 'en' ? 'English' : 'Dutch (Nederlands)';
    return 'You help someone find one specific small object in a cluttered photo, for example one building brick in a big pile of toy bricks.\n' +
      'Image 1 is the photo to search in.\n' +
      (metVoorbeeld ? 'Image 2 is a reference photo of the object the user is looking for. Find that object (same shape and colour) in image 1.\n' : '') +
      'The user is looking for: "' + wat + '"\n' +
      '(The description may be in Dutch. Dutch brick slang: "tweetje" = 1x2 brick (2 studs), "viertje" = 2x2 brick (4 studs), "achtje" = 2x4 brick (8 studs), "plaatje" = flat plate.)\n\n' +
      'Look carefully at colour, shape and the number of studs. Similar colours (red/orange, grey/dark grey, blue/dark blue) and similar sizes (1x2 vs 1x3) are easily confused, so be strict.\n' +
      'Return at most 3 candidates in image 1, best match first. If you see nothing that matches, return an empty list.\n' +
      'Answer ONLY with JSON in this exact form:\n' +
      '{"kandidaten":[{"box_2d":[ymin,xmin,ymax,xmax],"label":"short description","zekerheid":0-100}],"uitleg":"one or two short sentences for the user"}\n' +
      'box_2d is normalized to 0-1000 relative to image 1. Write "label" and "uitleg" in ' + uitlegTaal + '.';
  }

  function foutMet(code, detail) { var e = new Error(code); e.code = code; e.detail = detail || ''; return e; }

  function gemini(wat, stapel64, voorbeeld64) {
    var parts = [{ text: prompt(wat, !!voorbeeld64) }, { inline_data: { mime_type: 'image/jpeg', data: stapel64 } }];
    if (voorbeeld64) parts.push({ inline_data: { mime_type: 'image/jpeg', data: voorbeeld64 } });
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model()) + ':generateContent';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': sleutel() },
      body: JSON.stringify({ contents: [{ role: 'user', parts: parts }], generationConfig: { responseMimeType: 'application/json' } })
    }).catch(function () { throw foutMet('netwerk'); })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) {
            var msg = (j && j.error && j.error.message) || '';
            if (r.status === 400 && /api key/i.test(msg) || r.status === 401 || r.status === 403) throw foutMet('sleutel_fout', msg);
            if (r.status === 404) throw foutMet('model_fout', msg);
            if (r.status === 429) throw foutMet('quota_fout', msg);
            throw foutMet('ai_fout', 'HTTP ' + r.status + ' ' + msg);
          }
          var tekst = '';
          (((j.candidates || [])[0] || {}).content || { parts: [] }).parts.forEach(function (p) {
            if (p.text && !p.thought) tekst += p.text;
          });
          return parseAntwoord(tekst);
        });
      });
  }

  // Zelfde controle als in de PHP-versie: maakt van de AI-tekst een veilige lijst kandidaten.
  function parseAntwoord(tekst) {
    tekst = String(tekst || '').trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
    var d = null;
    try { d = JSON.parse(tekst); } catch (e) {
      var m = tekst.match(/\{[\s\S]*\}/);
      if (m) { try { d = JSON.parse(m[0]); } catch (e2) { d = null; } }
    }
    if (!d || typeof d !== 'object') throw foutMet('onleesbaar');
    var lijst = Array.isArray(d) ? d : (Array.isArray(d.kandidaten) ? d.kandidaten : []);
    var uit = [];
    lijst.forEach(function (k) {
      if (!k || !Array.isArray(k.box_2d) || k.box_2d.length !== 4) return;
      var b = k.box_2d.map(function (v) { var n = Math.round(parseFloat(v)); return isNaN(n) ? -1 : Math.max(0, Math.min(1000, n)); });
      if (b.indexOf(-1) !== -1) return;
      var y0 = Math.min(b[0], b[2]), y1 = Math.max(b[0], b[2]), x0 = Math.min(b[1], b[3]), x1 = Math.max(b[1], b[3]);
      if (y1 - y0 < 2 || x1 - x0 < 2) return;
      var z = parseFloat(k.zekerheid != null ? k.zekerheid : (k.confidence != null ? k.confidence : 50));
      if (isNaN(z)) z = 50;
      if (z > 0 && z <= 1) z *= 100;
      uit.push({ box_2d: [y0, x0, y1, x1], label: String(k.label || '').trim().slice(0, 80), zekerheid: Math.round(Math.max(0, Math.min(100, z))) });
    });
    uit.sort(function (a, b) { return b.zekerheid - a.zekerheid; });
    return { kandidaten: uit.slice(0, 3), uitleg: String(d.uitleg || '').trim().slice(0, 400) };
  }

  function demo() {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({
          demo: true,
          kandidaten: [
            { box_2d: [420, 300, 520, 420], label: 'DEMO', zekerheid: 82 },
            { box_2d: [150, 640, 240, 760], label: 'DEMO', zekerheid: 55 },
            { box_2d: [700, 120, 790, 230], label: 'DEMO', zekerheid: 31 }
          ],
          uitleg: t('demoUitleg')
        });
      }, 700);
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
  $('bewaar').addEventListener('click', function () {
    var s = $('sleutel').value.trim(), m = $('model').value.trim();
    if (s) localStorage.setItem('bz_sleutel', s);
    if (m && m !== STANDAARD_MODEL) localStorage.setItem('bz_model', m); else localStorage.removeItem('bz_model');
    $('sleutel').value = '';
    $('model').value = model();
    toonSleutelStatus(t('bewaard'));
  });
  $('wis').addEventListener('click', function () {
    localStorage.removeItem('bz_sleutel');
    $('sleutel').value = '';
    toonSleutelStatus(t('gewist'));
  });

  $('zoekform').addEventListener('submit', function (e) {
    e.preventDefault();
    melding('');
    var stapelFile = $('stapel').files[0], voorbeeldFile = $('voorbeeld').files[0];
    var wat = $('wat').value.trim().replace(/["\u0000-\u001F]+/g, ' ').slice(0, 120);
    if (!stapelFile) { melding(t('foto_ontbreekt')); return; }
    if (!wat && !voorbeeldFile) { melding(t('wat_ontbreekt')); return; }
    var knop = $('zoekknop');
    knop.disabled = true; knop.textContent = t('bezig');
    var stapelCanvas;
    Promise.all([verklein(stapelFile, 1600), voorbeeldFile ? verklein(voorbeeldFile, 1000) : Promise.resolve(null)])
      .catch(function () { throw foutMet('geen_foto'); })
      .then(function (r) {
        stapelCanvas = r[0].canvas;
        if (!sleutel()) return demo();
        return gemini(wat || 'the object in image 2', r[0].base64, r[1] && r[1].base64);
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
        $('uitleg').textContent = d.kandidaten.length ? d.uitleg : ((d.uitleg ? d.uitleg + ' ' : '') + t('niets'));
        $('resultaat').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        var code = (err && err.code) || 'ai_fout';
        melding((t(code) || t('ai_fout')) + (err && err.detail && code === 'ai_fout' ? ' (' + err.detail + ')' : ''));
      })
      .then(function () { knop.disabled = false; knop.textContent = t('zoek'); });
  });

  $('model').value = model();
  zetTaal();
  // Alleen voor tests: window.bzParse
  window.bzParse = parseAntwoord;
})();
