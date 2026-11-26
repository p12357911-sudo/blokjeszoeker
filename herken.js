// Slimme herkenning (3D): vergelijkt kandidaten met kleurloze LDraw-renders via een klein beeldnetwerk (MobileNetV2 0.5,
// lokaal gehost, Apache 2.0) en een snelle 'macro'-laag (noppen boven / buisjes onder). Alles in de browser, geen externe verzoeken.
(function () {
  'use strict';
  var DELEN = { // LDraw-nummer -> omschrijving en noppen (rijen x kolommen)
    '3005': { nl: 'steen 1×1', m: [1, 1], s: 'steen' }, '3004': { nl: 'steen 1×2', m: [1, 2], s: 'steen' },
    '3622': { nl: 'steen 1×3', m: [1, 3], s: 'steen' }, '3010': { nl: 'steen 1×4', m: [1, 4], s: 'steen' },
    '3003': { nl: 'steen 2×2', m: [2, 2], s: 'steen' }, '3002': { nl: 'steen 2×3', m: [2, 3], s: 'steen' },
    '3001': { nl: 'steen 2×4', m: [2, 4], s: 'steen' }, '3023b': { nl: 'plaat 1×2', m: [1, 2], s: 'plaat' },
    '3022': { nl: 'plaat 2×2', m: [2, 2], s: 'plaat' }, '3068b': { nl: 'tegel 2×2', m: [2, 2], s: 'tegel' },
    '3039': { nl: 'dakpan 2×2 45°', m: [2, 2], s: 'dakpan' }
  };
  var Z = 224, model = null, db = null, bezig = null, MODUS = 'rand';
  function laadScript(src) { return new Promise(function (ok, nee) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = nee; document.head.appendChild(s); }); }
  function laad(basis) {
    basis = basis || '';
    if (bezig) return bezig;
    var t0 = performance.now();
    bezig = (self.tf ? Promise.resolve() : laadScript(basis + 'lib/tf.min.js')).then(function () {
      return Promise.all([tf.loadGraphModel(basis + 'model/mobilenet_v2_050/model.json'), fetch(basis + 'model/lego-inbedding.json').then(function (r) { return r.ok ? r.json() : null; })]);
    }).then(function (r) {
      model = r[0]; db = r[1];
      if (db) { MODUS = db.modus || MODUS; db.vec = db.items.map(function (it) { return ontpak(it.v, db.dim); }); }
      tf.tidy(function () { model.predict(tf.zeros([1, Z, Z, 3])); }); // opwarmen
      return { ms: performance.now() - t0, backend: tf.getBackend() };
    });
    return bezig;
  }
  // int8 (base64) -> genormaliseerde Float32Array
  function ontpak(b64, dim) {
    var s = atob(b64), v = new Float32Array(dim), n = 0;
    for (var i = 0; i < dim; i++) { var x = s.charCodeAt(i); if (x > 127) x -= 256; v[i] = x; n += x * x; }
    n = Math.sqrt(n) || 1; for (var j = 0; j < dim; j++) v[j] /= n; return v;
  }
  function pak(v) { var m = 0, i, s = ''; for (i = 0; i < v.length; i++) m = Math.max(m, Math.abs(v[i])); m = m || 1; for (i = 0; i < v.length; i++) s += String.fromCharCode((Math.round(v[i] / m * 127) + 256) & 255); return btoa(s); }

  // Grijs beeld (Float32, 0..1) uit een canvas-gebied; vierkant gemaakt met achtergrondgrijs
  function grijsVierkant(bron, x, y, w, h, N) {
    var c = document.createElement('canvas'); c.width = N; c.height = N;
    var cx = c.getContext('2d', { willReadFrequently: true }); cx.fillStyle = '#d8d8d8'; cx.fillRect(0, 0, N, N);
    var s = N / Math.max(w, h), dw = w * s, dh = h * s;
    cx.imageSmoothingQuality = 'high'; cx.drawImage(bron, x, y, w, h, (N - dw) / 2, (N - dh) / 2, dw, dh);
    var d = cx.getImageData(0, 0, N, N).data, g = new Float32Array(N * N);
    for (var i = 0, p = 0; i < g.length; i++, p += 4) g[i] = (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) / 255;
    return g;
  }
  // Voorbewerking: 'grijs' = contrast rekken; 'rand' = Sobel-randen (donker op licht), los van kleur en belichting
  function voorbewerk(g, N) {
    var o = new Float32Array(N * N), i;
    if (MODUS === 'rand') {
      var mx = 0;
      for (var y = 1; y < N - 1; y++) for (var x = 1; x < N - 1; x++) {
        i = y * N + x;
        var gx = g[i - N + 1] + 2 * g[i + 1] + g[i + N + 1] - g[i - N - 1] - 2 * g[i - 1] - g[i + N - 1];
        var gy = g[i + N - 1] + 2 * g[i + N] + g[i + N + 1] - g[i - N - 1] - 2 * g[i - N] - g[i - N + 1];
        o[i] = Math.sqrt(gx * gx + gy * gy); if (o[i] > mx) mx = o[i];
      }
      mx = mx * 0.5 || 1; for (i = 0; i < o.length; i++) o[i] = 1 - Math.min(1, o[i] / mx);
      return o;
    }
    var srt = Array.prototype.slice.call(g).sort(function (a, b) { return a - b; }), lo = srt[Math.floor(g.length * 0.02)], hi = srt[Math.floor(g.length * 0.98)], d = (hi - lo) || 1;
    for (i = 0; i < o.length; i++) o[i] = Math.max(0, Math.min(1, (g[i] - lo) / d));
    return o;
  }
  function inbedding(lijst) { // lijst van Float32Array (Z*Z, 0..1)
    return tf.tidy(function () {
      var data = new Float32Array(lijst.length * Z * Z * 3);
      lijst.forEach(function (g, k) { var b = k * Z * Z * 3; for (var i = 0; i < Z * Z; i++) { data[b + 3 * i] = data[b + 3 * i + 1] = data[b + 3 * i + 2] = g[i]; } });
      var uit = model.predict(tf.tensor4d(data, [lijst.length, Z, Z, 3]));
      var a = uit.dataSync(), dim = a.length / lijst.length, res = [];
      for (var k = 0; k < lijst.length; k++) { var v = a.slice(k * dim, (k + 1) * dim), n = 0; for (var j = 0; j < dim; j++) n += v[j] * v[j]; n = Math.sqrt(n) || 1; for (j = 0; j < dim; j++) v[j] /= n; res.push(v); }
      return res;
    });
  }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
  // per onderdeel de beste overeenkomst (dichtstbijzijnde aanzicht: werkt ook als een deel van het blokje ontbreekt)
  function perDeel(v) {
    var best = {};
    db.items.forEach(function (it, i) { var s = dot(v, db.vec[i]); if (!(it.deel in best) || s > best[it.deel].sim) best[it.deel] = { sim: s, aanzicht: it.aanzicht }; });
    return Object.keys(best).map(function (d) { return { deel: d, sim: best[d].sim, aanzicht: best[d].aanzicht, naam: DELEN[d] ? DELEN[d].nl : d }; }).sort(function (a, b) { return b.sim - a.sim; });
  }

  // ---------- macro-laag: noppen (boven) / buisjes en rand (onder) ----------
  // g: grijs N x N; kort: korte zijde van het blokje in pixels van g. Geeft {zijde, noppen, cirkels, ringScore}
  function macro(g, N, kort) {
    var mag = new Float32Array(N * N), gxA = new Float32Array(N * N), gyA = new Float32Array(N * N), mx = 0, i, x, y;
    for (y = 1; y < N - 1; y++) for (x = 1; x < N - 1; x++) {
      i = y * N + x;
      var gx = g[i - N + 1] + 2 * g[i + 1] + g[i + N + 1] - g[i - N - 1] - 2 * g[i - 1] - g[i + N - 1];
      var gy = g[i + N - 1] + 2 * g[i + N] + g[i + N + 1] - g[i - N - 1] - 2 * g[i - N] - g[i - N + 1];
      gxA[i] = gx; gyA[i] = gy; mag[i] = Math.sqrt(gx * gx + gy * gy); if (mag[i] > mx) mx = mag[i];
    }
    var drempel = mx * 0.08, stralen = [], r0 = Math.max(2.5, kort * 0.1), r1 = Math.max(r0 + 1, kort * 0.36);
    for (var r = r0; r <= r1 + 1e-6; r *= 1.12) stralen.push(r);
    var acc = stralen.map(function () { return new Float32Array(N * N); });
    for (i = 0; i < N * N; i++) {
      if (mag[i] < drempel) continue;
      x = i % N; y = (i / N) | 0; var ux = gxA[i] / mag[i], uy = gyA[i] / mag[i];
      for (var k = 0; k < stralen.length; k++) for (var sg = -1; sg <= 1; sg += 2) {
        var px = Math.round(x + sg * ux * stralen[k]), py = Math.round(y + sg * uy * stralen[k]);
        if (px >= 0 && py >= 0 && px < N && py < N) acc[k][py * N + px] += 1;
      }
    }
    // pieken: aandeel van de omtrek dat stemt (vervaagd over 3x3)
    var pieken = [];
    for (var k2 = 0; k2 < stralen.length; k2++) {
      var A = acc[k2], omtrek = 2 * Math.PI * stralen[k2];
      for (y = 1; y < N - 1; y++) for (x = 1; x < N - 1; x++) {
        i = y * N + x; var s = A[i] + 0.5 * (A[i - 1] + A[i + 1] + A[i - N] + A[i + N]);
        var sc = s / (omtrek * 1.6);
        if (sc > 0.45) pieken.push({ x: x, y: y, r: stralen[k2], sc: sc });
      }
    }
    pieken.sort(function (a, b) { return b.sc - a.sc; });
    var cirkels = [];
    pieken.forEach(function (p) {
      for (var j = 0; j < cirkels.length; j++) { var c = cirkels[j]; if (Math.hypot(c.x - p.x, c.y - p.y) < Math.max(c.r, p.r) * 1.3) return; }
      cirkels.push(p);
    });
    // gelijke maat: noppen op één blokje zijn even groot; houd de cirkels rond de mediane straal
    if (cirkels.length) {
      var rs = cirkels.slice(0, 12).map(function (c) { return c.r; }).sort(function (a, b) { return a - b; }), rm = rs[rs.length >> 1];
      cirkels = cirkels.filter(function (c) { return c.r > rm * 0.75 && c.r < rm * 1.33; });
    }
    // ringtoets: een buisje (onderkant) heeft een tweede, concentrische rand
    function randOp(c, f) { var t = 0, n = 0; for (var a = 0; a < 24; a++) { var px = Math.round(c.x + Math.cos(a / 24 * 2 * Math.PI) * c.r * f), py = Math.round(c.y + Math.sin(a / 24 * 2 * Math.PI) * c.r * f); if (px > 0 && py > 0 && px < N && py < N) { t += mag[py * N + px]; n++; } } return n ? t / n : 0; }
    var ring = 0;
    cirkels.forEach(function (c) { var e1 = randOp(c, 1) || 1; ring += Math.max(randOp(c, 0.7), randOp(c, 1.4)) / e1; });
    ring = cirkels.length ? ring / cirkels.length : 0;
    // onderkant is van binnen donkerder dan de rand
    var bin = 0, nb = 0, buit = 0, nu = 0, m0 = N * 0.3, m1 = N * 0.7;
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) { var v = g[y * N + x]; if (x > m0 && x < m1 && y > m0 && y < m1) { bin += v; nb++; } }
    for (i = 0; i < N * N; i++) if (Math.abs(g[i] - 0.847) > 0.05) { buit += g[i]; nu++; } // alles wat geen achtergrond is
    var donker = nu ? (buit / nu - bin / nb) : 0;
    var zijde = cirkels.length === 0 ? '?' : (ring > 0.55 || donker > 0.12) ? 'onder' : 'boven';
    return { zijde: zijde, noppen: zijde === 'boven' ? cirkels.length : null, cirkels: cirkels, ring: ring, donker: donker };
  }

  // doel-onderdeel uit maat + soort (bijv. [1,2] + 'steen' -> 3004)
  function doelDeel(maat, soort) {
    if (!maat) return null;
    var m = maat.slice().sort(function (a, b) { return a - b; }), s = soort || 'steen', reserve = null;
    for (var d in DELEN) { var x = DELEN[d]; if (x.m[0] === m[0] && x.m[1] === m[1]) { if (x.s === s) return d; reserve = reserve || d; } }
    return reserve;
  }
  function noppenVan(d) { var x = DELEN[d]; return x.s === 'tegel' ? 0 : x.s === 'dakpan' ? x.m[1] : x.m[0] * x.m[1]; }
  // Beoordeel kandidaten. dets: [{box:[y0,x0,y1,x1] (0-1000), kort: korte zijde in bronpixels}], o: {doel, ref (canvas)}
  function beoordeel(bron, dets, o) {
    var t0 = performance.now(), W = bron.width, H = bron.height, beelden = [], mac = [];
    dets.forEach(function (d) {
      var b = d.box, x = b[1] / 1000 * W, y = b[0] / 1000 * H, w = (b[3] - b[1]) / 1000 * W, h = (b[2] - b[0]) / 1000 * H, m = 0.08 * Math.max(w, h);
      beelden.push(voorbewerk(grijsVierkant(bron, x - m, y - m, w + 2 * m, h + 2 * m, Z), Z));
      var N = 96, sc = N / (Math.max(w, h) + 2 * m);
      mac.push(macro(grijsVierkant(bron, x - m, y - m, w + 2 * m, h + 2 * m, N), N, (d.kort || Math.min(w, h)) * sc));
    });
    var doel = o.doel || null, refDeel = null;
    if (o.ref) { var gr = voorbewerk(grijsVierkant(o.ref, 0, 0, o.ref.width, o.ref.height, Z), Z); beelden.push(gr); }
    var vs = beelden.length ? inbedding(beelden) : [];
    if (o.ref) { refDeel = perDeel(vs.pop())[0]; if (!doel) doel = refDeel.deel; }
    var nt = doel ? noppenVan(doel) : null;
    var uit = dets.map(function (d, i) {
      var r = perDeel(vs[i]), mc = mac[i], n = mc.zijde === 'boven' ? mc.noppen : null;
      // macro als ondergrens: een blokje met n zichtbare noppen heeft er minstens n
      var kandidaat = r.filter(function (p) { return n == null || noppenVan(p.deel) >= n; })[0] || r[0];
      var res = { deel: kandidaat.deel, naam: kandidaat.naam, sim: kandidaat.sim, zijde: mc.zijde, noppen: n, slim: null, simDoel: null };
      if (doel) {
        var top = r[0].sim, laag = r[r.length - 1].sim, st = r.filter(function (p) { return p.deel === doel; })[0].sim;
        var pRel = top > laag ? (st - laag) / (top - laag) : 0.5;
        var ms = n == null ? 0.6 : n === nt ? 1 : n > nt ? 0.2 : 0.7;
        res.simDoel = st; res.slim = 0.65 * pRel + 0.35 * ms;
      }
      return res;
    });
    return { kand: uit, doel: doel, refDeel: refDeel, ms: performance.now() - t0 };
  }
  self.BZHerken = { doelDeel: doelDeel, beoordeel: beoordeel, noppenVan: noppenVan, DELEN: DELEN, laad: laad, grijsVierkant: grijsVierkant, voorbewerk: voorbewerk, inbedding: inbedding, perDeel: perDeel, macro: macro, pak: pak, Z: Z,
    zetModus: function (m) { MODUS = m; }, db: function () { return db; } };
})();
