// Blokjeszoeker - fotokijker: knijpen/scrollen om te zoomen, slepen om te verschuiven,
// en in de stand 'aanwijzen' een kader trekken met hoekgrepen om het daarna bij te stellen.
// Alle coördinaten van het kader zijn in pixels van de foto, dus inzoomen verandert niets aan wat je aanwijst.
(function () {
  'use strict';
  var GREEP = 22; // aanraakafstand voor een hoekgreep, in schermpixels

  function Kijker(canvas, opt) {
    this.c = canvas; this.opt = opt || {};
    this.beeld = null; this.s = 1; this.ox = 0; this.oy = 0; this.fit = 1;
    this.modus = this.opt.modus || 'kijk';
    this.kader = null;           // [x0, y0, x1, y1] in fotopixels
    this.wijzers = new Map(); this.actie = null; this.knijp = null; this.negeer = false;
    var k = this;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', function (e) { k._neer(e); });
    canvas.addEventListener('pointermove', function (e) { k._beweeg(e); });
    canvas.addEventListener('pointerup', function (e) { k._op(e, false); });
    canvas.addEventListener('pointercancel', function (e) { k._op(e, true); });
    canvas.addEventListener('wheel', function (e) {
      if (!k.beeld) return; e.preventDefault();
      var p = k._punt(e); k.zoomOm(Math.exp(-e.deltaY * 0.0015), p.x, p.y);
    }, { passive: false });
    canvas.addEventListener('dblclick', function (e) { if (!k.beeld || k.modus === 'wijs') return; var p = k._punt(e); k.zoomOm(2, p.x, p.y); });
    window.addEventListener('resize', function () { if (k.beeld) { var r = k.s / k.fit; k._maat(); k.s = k.fit * r; k._klem(); k.teken(); } });
  }
  Kijker.prototype.zetBeeld = function (beeld) { this.beeld = beeld; this.kader = null; this._maat(); this.passend(); };
  Kijker.prototype._maat = function () {
    var b = this.beeld, br = this.c.parentElement.clientWidth || 300;
    var maxH = Math.max(220, Math.round(window.innerHeight * (this.opt.maxHoogte || 0.62)));
    var h = Math.min(maxH, Math.round(br * b.height / b.width));
    this.c.style.width = br + 'px'; this.c.style.height = h + 'px';
    var dpr = Math.min(3, window.devicePixelRatio || 1);
    this.cw = br; this.ch = h; this.dpr = dpr; this.c.width = Math.round(br * dpr); this.c.height = Math.round(h * dpr);
    this.fit = Math.min(br / b.width, h / b.height);
  };
  Kijker.prototype.passend = function () { this.s = this.fit; this._klem(); this.teken(); };
  Kijker.prototype.zoomOm = function (f, x, y) {
    if (x == null) { x = this.cw / 2; y = this.ch / 2; }
    var ns = Math.max(this.fit, Math.min(this.fit * 16, this.s * f));
    var ix = (x - this.ox) / this.s, iy = (y - this.oy) / this.s;
    this.s = ns; this.ox = x - ix * ns; this.oy = y - iy * ns; this._klem(); this.teken();
  };
  Kijker.prototype.zoomFactor = function () { return this.s / this.fit; };
  // Zorg dat de foto in beeld blijft (gecentreerd als hij kleiner is dan het venster)
  Kijker.prototype._klem = function () {
    var bw = this.beeld.width * this.s, bh = this.beeld.height * this.s;
    this.ox = bw <= this.cw ? (this.cw - bw) / 2 : Math.min(0, Math.max(this.cw - bw, this.ox));
    this.oy = bh <= this.ch ? (this.ch - bh) / 2 : Math.min(0, Math.max(this.ch - bh, this.oy));
  };
  Kijker.prototype.naarBeeld = function (x, y) { return { x: (x - this.ox) / this.s, y: (y - this.oy) / this.s }; };
  Kijker.prototype.centreerOp = function (ix, iy, zoom) {
    if (zoom) this.s = Math.max(this.fit, Math.min(this.fit * 16, this.fit * zoom));
    this.ox = this.cw / 2 - ix * this.s; this.oy = this.ch / 2 - iy * this.s; this._klem(); this.teken();
  };
  Kijker.prototype.zetModus = function (m) { this.modus = m; this.c.style.cursor = m === 'wijs' ? 'crosshair' : 'grab'; this.teken(); };
  Kijker.prototype._punt = function (e) { var r = this.c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  Kijker.prototype._neer = function (e) {
    if (!this.beeld) return;
    e.preventDefault(); this.c.setPointerCapture(e.pointerId);
    var p = this._punt(e); this.wijzers.set(e.pointerId, p);
    if (this.wijzers.size === 2) {
      // twee vingers: altijd zoomen/verschuiven, ook in de stand 'aanwijzen'
      if (this.actie && this.actie.soort === 'nieuw') this.kader = this.actie.oud;
      this.actie = null;
      var ps = Array.from(this.wijzers.values());
      this.knijp = { d: Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) || 1, mx: (ps[0].x + ps[1].x) / 2, my: (ps[0].y + ps[1].y) / 2, s: this.s, ox: this.ox, oy: this.oy };
      this.teken(); return;
    }
    if (this.wijzers.size > 2 || this.negeer) return;
    if (this.modus === 'wijs') {
      var g = this._raak(p);
      var ip = this.naarBeeld(p.x, p.y);
      if (g) this.actie = { soort: g, start: ip, oud: this.kader.slice() };
      else this.actie = { soort: 'nieuw', start: ip, oud: this.kader ? this.kader.slice() : null };
    } else this.actie = { soort: 'schuif', x: p.x, y: p.y, ox: this.ox, oy: this.oy, bewogen: false };
  };
  // Welke greep wordt aangeraakt? hoeken ('lb','rb','lo','ro'), binnen ('binnen') of niets
  Kijker.prototype._raak = function (p) {
    if (!this.kader) return null;
    var k = this.kader, s = this.s, X0 = k[0] * s + this.ox, Y0 = k[1] * s + this.oy, X1 = k[2] * s + this.ox, Y1 = k[3] * s + this.oy;
    var hoeken = { lb: [X0, Y0], rb: [X1, Y0], lo: [X0, Y1], ro: [X1, Y1] }, beste = null, bd = GREEP;
    for (var n in hoeken) { var d = Math.hypot(p.x - hoeken[n][0], p.y - hoeken[n][1]); if (d < bd) { bd = d; beste = n; } }
    if (beste) return beste;
    if (p.x > X0 && p.x < X1 && p.y > Y0 && p.y < Y1) return 'binnen';
    return null;
  };
  Kijker.prototype._beweeg = function (e) {
    if (!this.wijzers.has(e.pointerId)) return;
    var p = this._punt(e); this.wijzers.set(e.pointerId, p);
    if (this.knijp && this.wijzers.size >= 2) {
      var ps = Array.from(this.wijzers.values()), kn = this.knijp;
      var d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y), mx = (ps[0].x + ps[1].x) / 2, my = (ps[0].y + ps[1].y) / 2;
      var ns = Math.max(this.fit, Math.min(this.fit * 16, kn.s * d / kn.d));
      var ix = (kn.mx - kn.ox) / kn.s, iy = (kn.my - kn.oy) / kn.s;
      this.s = ns; this.ox = mx - ix * ns; this.oy = my - iy * ns; this._klem(); this.teken(); return;
    }
    var a = this.actie; if (!a) return;
    if (a.soort === 'schuif') {
      if (Math.hypot(p.x - a.x, p.y - a.y) > 6) a.bewogen = true;
      this.ox = a.ox + p.x - a.x; this.oy = a.oy + p.y - a.y; this._klem(); this.teken(); return;
    }
    var ip = this.naarBeeld(p.x, p.y), W = this.beeld.width, H = this.beeld.height;
    ip.x = Math.max(0, Math.min(W, ip.x)); ip.y = Math.max(0, Math.min(H, ip.y));
    var o = a.oud, k;
    if (a.soort === 'nieuw') k = [Math.min(a.start.x, ip.x), Math.min(a.start.y, ip.y), Math.max(a.start.x, ip.x), Math.max(a.start.y, ip.y)];
    else if (a.soort === 'binnen') {
      var dx = ip.x - a.start.x, dy = ip.y - a.start.y;
      dx = Math.max(-o[0], Math.min(W - o[2], dx)); dy = Math.max(-o[1], Math.min(H - o[3], dy));
      k = [o[0] + dx, o[1] + dy, o[2] + dx, o[3] + dy];
    } else {
      k = o.slice();
      if (a.soort[0] === 'l') k[0] = ip.x; else k[2] = ip.x;
      if (a.soort[1] === 'b') k[1] = ip.y; else k[3] = ip.y;
      k = [Math.min(k[0], k[2]), Math.min(k[1], k[3]), Math.max(k[0], k[2]), Math.max(k[1], k[3])];
    }
    this.kader = k; this.teken();
    if (this.opt.opKader) this.opt.opKader(k, false);
  };
  Kijker.prototype._op = function (e, geannuleerd) {
    if (!this.wijzers.has(e.pointerId)) return;
    this.wijzers.delete(e.pointerId);
    if (this.knijp) { if (this.wijzers.size < 2) { this.knijp = null; this.negeer = this.wijzers.size > 0; } return; }
    if (this.wijzers.size === 0) this.negeer = false;
    var a = this.actie; this.actie = null; if (!a || geannuleerd) { if (a && a.oud !== undefined && a.soort !== 'schuif') { this.kader = a.oud; this.teken(); } return; }
    if (a.soort === 'schuif') {
      if (!a.bewogen && this.opt.opTik) { var p = this._punt(e), ip = this.naarBeeld(p.x, p.y); this.opt.opTik(ip.x, ip.y); }
      return;
    }
    var k = this.kader, minZ = 6 / this.s; // minstens 6 schermpixels
    if (!k || k[2] - k[0] < minZ || k[3] - k[1] < minZ) { this.kader = a.oud; this.teken(); return; }
    if (this.opt.opKader) this.opt.opKader(k, true);
  };

  Kijker.prototype.teken = function () {
    if (!this.beeld) return;
    var ctx = this.c.getContext('2d'), d = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#d9d9d9'; ctx.fillRect(0, 0, this.c.width, this.c.height);
    ctx.setTransform(d * this.s, 0, 0, d * this.s, d * this.ox, d * this.oy);
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(this.beeld, 0, 0);
    // extra lagen van de pagina, in fotocoördinaten; px = één schermpixel
    if (this.opt.tekenExtra) { ctx.save(); this.opt.tekenExtra(ctx, 1 / this.s, this); ctx.restore(); }
    if (this.kader && this.modus === 'wijs') {
      var k = this.kader, px = 1 / this.s;
      ctx.save();
      // buiten het kader iets donkerder, zodat duidelijk is wat je aanwijst
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath();
      ctx.rect(0, 0, this.beeld.width, this.beeld.height); ctx.rect(k[0], k[1], k[2] - k[0], k[3] - k[1]); ctx.fill('evenodd');
      ctx.lineWidth = 2 * px; ctx.strokeStyle = '#ffb000'; ctx.strokeRect(k[0], k[1], k[2] - k[0], k[3] - k[1]);
      [[k[0], k[1]], [k[2], k[1]], [k[0], k[3]], [k[2], k[3]]].forEach(function (h) {
        ctx.beginPath(); ctx.arc(h[0], h[1], 8 * px, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 3 * px; ctx.strokeStyle = '#ffb000'; ctx.stroke();
      });
      ctx.restore();
    }
    if (this.opt.naTekenen) this.opt.naTekenen(this);
  };
  self.Kijker = Kijker;
})();
