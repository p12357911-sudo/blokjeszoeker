// Blokjeszoeker - snelle eerste ronde in de browser (gratis, geen server, geen bibliotheken).
// Volgorde zoals Peter wil: EERST VORM, dan pas kleur.
//  1) Vorm: randen-beeld (Sobel, kleur-onafhankelijk) vergelijken met het voorbeeld via
//     genormaliseerde kruiscorrelatie (NCC), op meerdere schalen en draaiingen. Grof op halve resolutie, daarna verfijnd.
//  2) Kleur: alleen als zachte factor bij het rangschikken (gewicht instelbaar, standaard laag).
//  3) Feedback: 'lijkt erop, niet hem' wordt een negatief voorbeeld; herrangschikken gebeurt direct in de browser.
(function () {
  'use strict';
  var PATCH = 24; // vaste patchgrootte voor snel vergelijken bij feedback

  // ---------- kleur ----------
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  var LIN = new Float32Array(256); for (var i = 0; i < 256; i++) LIN[i] = lin(i);
  function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
  function rgb2lab(r, g, b) {
    var R = LIN[r], G = LIN[g], B = LIN[b];
    var X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    var fx = f(X), fy = f(Y), fz = f(Z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  function hex2lab(hex) { return rgb2lab(parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16)); }

  // ---------- beelden ----------
  function pixels(canvas, w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var ctx = c.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(canvas, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  }
  function grijsEnLab(d, n) {
    var G = new Float32Array(n), L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
    for (var p = 0, q = 0; p < n; p++, q += 4) {
      G[p] = 0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2];
      var lab = rgb2lab(d[q], d[q + 1], d[q + 2]); L[p] = lab[0]; A[p] = lab[1]; B[p] = lab[2];
    }
    return { G: G, L: L, A: A, B: B };
  }
  function sobel(G, w, h) {
    var E = new Float32Array(w * h);
    for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) {
      var p = y * w + x;
      var gx = G[p - w + 1] + 2 * G[p + 1] + G[p + w + 1] - G[p - w - 1] - 2 * G[p - 1] - G[p + w - 1];
      var gy = G[p + w - 1] + 2 * G[p + w] + G[p + w + 1] - G[p - w - 1] - 2 * G[p - w] - G[p - w + 1];
      E[p] = Math.sqrt(gx * gx + gy * gy);
    }
    return E;
  }
  function halveer(E, w, h) {
    var w2 = w >> 1, h2 = h >> 1, H = new Float32Array(w2 * h2);
    for (var y = 0; y < h2; y++) for (var x = 0; x < w2; x++) {
      var p = 2 * y * w + 2 * x; H[y * w2 + x] = (E[p] + E[p + 1] + E[p + w] + E[p + w + 1]) / 4;
    }
    return { E: H, w: w2, h: h2 };
  }
  function analyseer(canvas, maxZijde) {
    var s = Math.min(1, maxZijde / Math.max(canvas.width, canvas.height));
    var w = Math.max(8, Math.round(canvas.width * s)), h = Math.max(8, Math.round(canvas.height * s));
    var gl = grijsEnLab(pixels(canvas, w, h), w * h);
    var E = sobel(gl.G, w, h);
    return { w: w, h: h, E: E, L: gl.L, A: gl.A, B: gl.B, half: halveer(E, w, h) };
  }

  // ---------- sjabloon: gedraaid randen-beeld met masker (alleen pixels binnen het gedraaide voorbeeld) ----------
  function sjabloon(canvas, breedte, hoogte, graden, maxK) {
    var rad = graden * Math.PI / 180, cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    var W = Math.max(5, Math.round(breedte * cos + hoogte * sin)) + 2, H = Math.max(5, Math.round(breedte * sin + hoogte * cos)) + 2;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.translate(W / 2, H / 2); ctx.rotate(rad); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, -breedte / 2, -hoogte / 2, breedte, hoogte);
    var d = ctx.getImageData(0, 0, W, H).data, n = W * H, G = new Float32Array(n), M = new Uint8Array(n);
    for (var p = 0; p < n; p++) { G[p] = 0.299 * d[p * 4] + 0.587 * d[p * 4 + 1] + 0.114 * d[p * 4 + 2]; M[p] = d[p * 4 + 3] > 250 ? 1 : 0; }
    var E = sobel(G, W, H), dx = [], dy = [], val = [];
    // randpixels van het masker zelf niet meetellen (kunstmatige rand)
    for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) {
      var q = y * W + x;
      if (M[q] && M[q - 1] && M[q + 1] && M[q - W] && M[q + W] && M[q - W - 1] && M[q - W + 1] && M[q + W - 1] && M[q + W + 1]) { dx.push(x - W / 2); dy.push(y - H / 2); val.push(E[q]); }
    }
    var K = val.length, stap = Math.max(1, Math.ceil(K / (maxK || 260)));
    var ox = [], oy = [], v = [];
    for (var k = 0; k < K; k += stap) { ox.push(Math.round(dx[k])); oy.push(Math.round(dy[k])); v.push(val[k]); }
    var gem = v.reduce(function (a, b) { return a + b; }, 0) / (v.length || 1), norm = 0;
    for (k = 0; k < v.length; k++) { v[k] -= gem; norm += v[k] * v[k]; }
    return { ox: Int16Array.from(ox), oy: Int16Array.from(oy), v: Float32Array.from(v), norm: Math.sqrt(norm) || 1, W: W, H: H, graden: graden, breedte: breedte, hoogte: hoogte };
  }
  // NCC op positie (cx, cy) in beeld E (breedte w)
  function nccOp(E, w, h, sj, cx, cy) {
    var K = sj.v.length, s = 0, s2 = 0, sx = 0;
    for (var k = 0; k < K; k++) {
      var x = cx + sj.ox[k], y = cy + sj.oy[k];
      if (x < 0 || y < 0 || x >= w || y >= h) return -1;
      var e = E[y * w + x]; s += e; s2 += e * e; sx += e * sj.v[k];
    }
    var vr = s2 - s * s / K;
    return vr > 1e-6 ? sx / (Math.sqrt(vr) * sj.norm) : -1;
  }

  // Patch (PATCH x PATCH) van het randen-beeld rond (cx,cy), gedraaid zodat hij in de richting van het sjabloon ligt
  function patch(img, cx, cy, bw, bh, graden) {
    var rad = -graden * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), out = new Float32Array(PATCH * PATCH), gem = 0;
    for (var j = 0; j < PATCH; j++) for (var i = 0; i < PATCH; i++) {
      var u = (i / (PATCH - 1) - 0.5) * bw, v = (j / (PATCH - 1) - 0.5) * bh;
      var x = Math.round(cx + u * c - v * s), y = Math.round(cy + u * s + v * c);
      var e = (x >= 0 && y >= 0 && x < img.w && y < img.h) ? img.E[y * img.w + x] : 0;
      out[j * PATCH + i] = e; gem += e;
    }
    gem /= out.length; var n = 0;
    for (var k = 0; k < out.length; k++) { out[k] -= gem; n += out[k] * out[k]; }
    n = Math.sqrt(n) || 1; for (k = 0; k < out.length; k++) out[k] /= n;
    return out;
  }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

  // Kleur rond een punt
  function kleurAfstand(img, cx, cy, r, doel) {
    var som = 0, n = 0, lw = doel[1] * doel[1] + doel[2] * doel[2] < 150 ? 1 : 0.45;
    for (var y = Math.round(cy - r); y <= cy + r; y++) for (var x = Math.round(cx - r); x <= cx + r; x++) {
      if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
      var p = y * img.w + x, dl = (img.L[p] - doel[0]) * lw, da = img.A[p] - doel[1], db = img.B[p] - doel[2];
      som += Math.sqrt(dl * dl + da * da + db * db); n++;
    }
    return n ? som / n : 100;
  }
  function hoofdkleur(canvas) {
    var w = 64, h = Math.max(8, Math.round(64 * canvas.height / canvas.width)), d = pixels(canvas, w, h), pts = [];
    for (var y = Math.floor(h * 0.25); y < h * 0.75; y++) for (var x = Math.floor(w * 0.25); x < w * 0.75; x++) { var q = (y * w + x) * 4; if (d[q + 3] > 250) pts.push(rgb2lab(d[q], d[q + 1], d[q + 2])); }
    if (!pts.length) return null;
    var c = [pts[0], pts[pts.length >> 1], pts[pts.length - 1]].map(function (v) { return v.slice(); }), tel = [0, 0, 0];
    for (var it = 0; it < 8; it++) {
      var som = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; tel = [0, 0, 0];
      pts.forEach(function (v) {
        var bi = 0, bd = 1e9;
        for (var k = 0; k < 3; k++) { var dd = (v[0] - c[k][0]) * (v[0] - c[k][0]) * 0.5 + (v[1] - c[k][1]) * (v[1] - c[k][1]) + (v[2] - c[k][2]) * (v[2] - c[k][2]); if (dd < bd) { bd = dd; bi = k; } }
        tel[bi]++; som[bi][0] += v[0]; som[bi][1] += v[1]; som[bi][2] += v[2];
      });
      for (var k = 0; k < 3; k++) if (tel[k]) c[k] = [som[k][0] / tel[k], som[k][1] / tel[k], som[k][2] / tel[k]];
    }
    var best = 0; for (k = 1; k < 3; k++) if (tel[k] > tel[best]) best = k;
    return c[best];
  }

  // Kunstmatig voorbeeld (bovenaanzicht) als er geen foto-voorbeeld is maar wel een standaardmaat
  function kunstVoorbeeld(maat, soort) {
    var u = 24, P = 0.2, iw = maat[1] * u, ih = maat[0] * u, c = document.createElement('canvas');
    c.width = Math.round(iw * (1 + 2 * P)); c.height = Math.round(ih * (1 + 2 * P)); c.bzPad = P;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#707070'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.translate(iw * P, ih * P);
    ctx.fillStyle = '#c8c8c8'; ctx.fillRect(0, 0, iw, ih);
    ctx.strokeStyle = '#404040'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, iw - 2, ih - 2);
    if (soort !== 'tegel') for (var i = 0; i < maat[0]; i++) for (var j = 0; j < maat[1]; j++) {
      if (soort === 'dakpan' && i > 0) continue;
      ctx.beginPath(); ctx.arc(j * u + u / 2, i * u + u / 2, u * 0.3, 0, 2 * Math.PI); ctx.fillStyle = '#d8d8d8'; ctx.fill(); ctx.stroke();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return c;
  }

  var pauze = function () { return new Promise(function (r) { setTimeout(r, 0); }); };

  /**
   * bron: canvas van de stapel. o = {
   *   voorbeeld: canvas (uitsnede, al in de juiste draaiing), voorbeeldBox: box 0-1000 als het uit deze foto komt (schaal bekend),
   *   draaien: bool ('kan gedraaid liggen'), hoek: graden (draaiing die de gebruiker koos),
   *   doelLab: [L,a,b] of null, kleurGewicht: 0..1, raster: 2..5, negatief: [patch-objecten] }
   * geeft Promise<{kandidaten, ms, info}>
   */
  function zoek(bron, o) {
    var t0 = performance.now();
    var maxZ = { 2: 480, 3: 640, 4: 800, 5: 1000 }[o.raster] || 640;
    var img = analyseer(bron, maxZ), w = img.w, h = img.h, half = img.half;
    var vb = o.voorbeeld;
    if (!vb) return Promise.resolve({ kandidaten: [], ms: performance.now() - t0, info: { fout: 'geen_voorbeeld' } });

    // schalen (lange zijde van het voorbeeld in werkpixels)
    // bzPad: marge rond het blokje in het voorbeeld (fractie per kant), zodat de buitenrand van het blokje in het sjabloon zit
    var asp = vb.width / vb.height, lang = [], pf = 1 + 2 * (vb.bzPad || 0);
    if (o.voorbeeldBox) {
      var b = o.voorbeeldBox, bw = (b[3] - b[1]) / 1000 * w, bh = (b[2] - b[0]) / 1000 * h;
      var basis = Math.max(bw, bh);
      lang = [basis * 0.88, basis, basis * 1.13];
    } else {
      var L0 = Math.max(w, h);
      lang = [0.04, 0.055, 0.075, 0.1, 0.135].map(function (f) { return L0 * f; });
    }
    // draaiingen: bouwstenen zien er na 180 graden (bijna) hetzelfde uit, dus 0..150 in stappen van 30
    var hoeken = o.draaien ? [0, 30, 60, 90, 120, 150] : [0];
    if (o.draaien && o.asymmetrisch) hoeken = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    var basisHoek = o.hoek || 0;
    hoeken = hoeken.map(function (g) { return (g + basisHoek) % 360; });

    // 1) grof: halve resolutie, stap 2, beste score per positie bijhouden
    var best = new Float32Array(half.w * half.h).fill(-1), bestI = new Int16Array(half.w * half.h).fill(-1), combis = [];
    hoeken.forEach(function (g) { lang.forEach(function (Lx) { combis.push({ g: g, L: Lx }); }); });
    var i = 0;
    var gestopt = false, tGrof0 = performance.now(), tGrof = 0, tFijn0 = 0;
    function grof() {
      if (i >= combis.length) return Promise.resolve();
      if (o.stopNa && performance.now() - t0 > o.stopNa) { gestopt = true; return Promise.resolve(); }
      var cb = combis[i], Lh = cb.L / 2;
      var bwT = asp >= 1 ? Lh : Lh * asp, bhT = asp >= 1 ? Lh / asp : Lh;
      if (Math.min(bwT, bhT) >= 3) {
        var sj = sjabloon(vb, bwT * pf, bhT * pf, cb.g, 200);
        var mx = Math.ceil(sj.W / 2), my = Math.ceil(sj.H / 2);
        for (var y = my; y < half.h - my; y += 2) for (var x = mx; x < half.w - mx; x += 2) {
          var r = nccOp(half.E, half.w, half.h, sj, x, y), p = y * half.w + x;
          if (r > best[p]) { best[p] = r; bestI[p] = i; }
        }
      }
      i++;
      return (i % 3 === 0 ? pauze() : Promise.resolve()).then(grof);
    }

    return grof().then(function () {
      tGrof = performance.now() - tGrof0; tFijn0 = performance.now();
      // pieken zoeken (niet-maximum onderdrukking)
      var pieken = [];
      for (var p = 0; p < best.length; p++) if (best[p] > 0.15) pieken.push(p);
      pieken.sort(function (a, b2) { return best[b2] - best[a]; });
      var gekozen = [];
      for (var k = 0; k < pieken.length && gekozen.length < 250; k++) {
        var q = pieken[k], x = q % half.w, y = (q / half.w) | 0, cb = combis[bestI[q]];
        var straal = Math.max(3, Math.min(cb.L / 2 / Math.max(asp, 1 / asp), cb.L / 2) * 0.6);
        var dicht = false;
        for (var j = 0; j < gekozen.length; j++) { var gk = gekozen[j]; if (Math.abs(gk.x - x) < straal && Math.abs(gk.y - y) < straal) { dicht = true; break; } }
        if (!dicht) gekozen.push({ x: x, y: y, cb: cb, r: best[q] });
      }
      // Vorm eerst, maar kleur helpt kiezen welke plekken we verfijnen (anders valt een goed gekleurde kandidaat al vroeg af).
      var dl = o.doelLab, wg = dl ? Math.max(0, Math.min(1, o.kleurGewicht == null ? 0.25 : o.kleurGewicht)) : 0;
      if (wg > 0) {
        gekozen.forEach(function (g) {
          var Lh = g.cb.L / 2, kort = Math.min(asp >= 1 ? Lh / asp : Lh, asp >= 1 ? Lh : Lh * asp);
          var kl = Math.exp(-Math.pow(kleurAfstand(img, g.x * 2, g.y * 2, Math.max(1, kort * 0.5), dl), 2) / (2 * 22 * 22));
          g.s = Math.min(1, g.r / 0.7) * (1 - wg) + kl * wg;
        });
        gekozen.sort(function (a, b2) { return b2.s - a.s; });
      }
      gekozen = gekozen.slice(0, 60);
      return pauze().then(function () { return gekozen; });
    }).then(function (gekozen) {
      // 2) verfijnen op volle werkresolutie, rond de grove positie en hoek
      var kand = gekozen.map(function (g) {
        var cx0 = g.x * 2, cy0 = g.y * 2, beste = { r: -1 };
        var hk = o.draaien ? [g.cb.g - 12, g.cb.g, g.cb.g + 12] : [g.cb.g];
        hk.forEach(function (hoek) {
          [0.94, 1, 1.06].forEach(function (sc) {
            var Lx = g.cb.L * sc, bwT = asp >= 1 ? Lx : Lx * asp, bhT = asp >= 1 ? Lx / asp : Lx;
            var sj = sjabloon(vb, bwT * pf, bhT * pf, hoek, 400);
            for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
              var r = nccOp(img.E, w, h, sj, cx0 + dx, cy0 + dy);
              if (r > beste.r) beste = { r: r, cx: cx0 + dx, cy: cy0 + dy, hoek: hoek, bw: bwT, bh: bhT, W: sj.W, H: sj.H };
            }
          });
        });
        return beste;
      }).filter(function (k) { return k.r > 0; });

      // 3) kleur als zachte factor
      var doel = o.doelLab || null, wc = doel ? Math.max(0, Math.min(1, o.kleurGewicht == null ? 0.25 : o.kleurGewicht)) : 0;
      kand.forEach(function (k) {
        k.vorm = Math.max(0, k.r);
        k.kleur = doel ? Math.exp(-Math.pow(kleurAfstand(img, k.cx, k.cy, Math.max(1, Math.min(k.bw, k.bh) * 0.25), doel), 2) / (2 * 22 * 22)) : null;
        k.patch = patch(img, k.cx, k.cy, k.bw, k.bh, k.hoek);
      });
      var refPatch = null;
      if (o.voorbeeldBox) {
        var b = o.voorbeeldBox, cx = (b[1] + b[3]) / 2000 * w, cy = (b[0] + b[2]) / 2000 * h;
        refPatch = patch(img, cx, cy, (b[3] - b[1]) / 1000 * w, (b[2] - b[0]) / 1000 * h, 0);
      }
      var res = { img: img, kand: kand, wc: wc, refPatch: refPatch, raster: o.raster || 3 };
      var uit = rangschik(res, o.negatief || []);
      uit.ms = performance.now() - t0;
      uit.info = { werk: w + 'x' + h, schalen: lang.length, hoeken: hoeken.length, combis: combis.length, gedaan: i, pieken: gekozen.length, grofMs: tGrof, fijnMs: performance.now() - tFijn0, gestopt: gestopt };
      uit.res = res;
      return uit;
    });
  }

  // Score en rangorde; negatieve voorbeelden (patches) drukken lijkende kandidaten omlaag. Snel: alleen vectorvergelijking.
  function rangschik(res, negatief) {
    var img = res.img, w = img.w, h = img.h, wc = res.wc;
    res.kand.forEach(function (k) {
      var vorm = Math.min(1, k.vorm / 0.7);                 // NCC 0.7 of hoger telt als heel goed
      var s = vorm * (1 - wc) + (k.kleur != null ? k.kleur * wc : 0);
      var neg = 0;
      negatief.forEach(function (n) { neg = Math.max(neg, dot(k.patch, n)); });
      var pos = res.refPatch ? dot(k.patch, res.refPatch) : 0.5;
      k.neg = neg;
      if (neg > 0.5 && neg > pos) s *= 0.45; else if (neg > 0.4) s *= 0.8;
      k.score = Math.round(100 * Math.max(0, Math.min(1, s)));
      var rad = k.hoek * Math.PI / 180, cw = Math.abs(Math.cos(rad)) * k.bw + Math.abs(Math.sin(rad)) * k.bh, ch = Math.abs(Math.sin(rad)) * k.bw + Math.abs(Math.cos(rad)) * k.bh;
      k.box = [Math.max(0, (k.cy - ch / 2) / h * 1000), Math.max(0, (k.cx - cw / 2) / w * 1000), Math.min(1000, (k.cy + ch / 2) / h * 1000), Math.min(1000, (k.cx + cw / 2) / w * 1000)];
    });
    var lijst = res.kand.slice().sort(function (a, b) { return b.score - a.score; });
    // geen dubbele (het raster bepaalt alleen hoe fijn we zoeken, niet hoeveel per vak)
    var gekozen = [];
    lijst.forEach(function (k) {
      for (var i = 0; i < gekozen.length; i++) { var g = gekozen[i]; if (Math.hypot(g.cx - k.cx, g.cy - k.cy) < Math.min(k.bw, k.bh) * 0.6) return; }
      gekozen.push(k);
    });
    return { kandidaten: gekozen.slice(0, 15) };
  }

  // Kleur achteraf aanpassen (zonder opnieuw te zoeken): kleurscore opnieuw berekenen.
  function herkleur(res, doelLab, gewicht) {
    res.wc = doelLab ? Math.max(0, Math.min(1, gewicht)) : 0;
    res.kand.forEach(function (k) {
      k.kleur = doelLab ? Math.exp(-Math.pow(kleurAfstand(res.img, k.cx, k.cy, Math.max(1, Math.min(k.bw, k.bh) * 0.25), doelLab), 2) / (2 * 22 * 22)) : null;
    });
  }

  window.BZDetect = { zoek: zoek, herkleur: herkleur, rangschik: rangschik, hex2lab: hex2lab, hoofdkleur: hoofdkleur, kunstVoorbeeld: kunstVoorbeeld };
})();
