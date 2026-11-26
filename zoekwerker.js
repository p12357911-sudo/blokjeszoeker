// Blokjeszoeker - rekenhulp (Web Worker). Doet de zware grove ronde op een strook van de foto,
// zodat de pagina blijft reageren en meerdere processorkernen tegelijk meewerken.
importScripts('detect.js');
var P = null, opties = null;
onmessage = function (e) {
  var m = e.data;
  if (m.cmd === 'grof') {
    var t0 = performance.now();
    var vb = new OffscreenCanvas(m.vb.width, m.vb.height);
    vb.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(m.vb.data), m.vb.width, m.vb.height), 0, 0);
    vb.bzPad = m.vbPad || 0;
    opties = m.o; opties.voorbeeld = vb; opties.alleenRand = !m.hoofd;
    P = BZDetect.voorbereid({ data: new Uint8ClampedArray(m.beeld.data), width: m.beeld.width, height: m.beeld.height }, opties);
    var n = P.img.half.w * P.img.half.h, best = new Float32Array(n).fill(-1), bestI = new Int16Array(n).fill(-1), gestopt = false, i;
    for (i = 0; i < P.combis.length; i++) {
      if (m.stopOp && Date.now() > m.stopOp) { gestopt = true; break; }
      BZDetect.grofCombi(P, i, best, bestI, m.deel, m.aantal);
      postMessage({ cmd: 'voortgang', deel: m.deel, klaar: (i + 1) / P.combis.length });
    }
    postMessage({ cmd: 'grof', deel: m.deel, best: best, bestI: bestI, gestopt: gestopt, gedaan: i, ms: performance.now() - t0 }, [best.buffer, bestI.buffer]);
  } else if (m.cmd === 'fijn') {
    opties.negatief = m.negatief || [];
    var uit = BZDetect.afronden(P, m.best, m.bestI, opties);
    postMessage({ cmd: 'fijn', uit: { kandidaten: uit.kandidaten.map(function (k) { return uit.res.kand.indexOf(k); }), res: uit.res, info: uit.info } });
    P = null;
  }
};
