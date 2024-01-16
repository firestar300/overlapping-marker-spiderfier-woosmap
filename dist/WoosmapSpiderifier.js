const u = function() {
}, o = {
  each: w,
  mapTimes: y,
  eachTimes: d
}, f = {
  animate: !1,
  // to animate the spiral
  animationSpeed: 0,
  // animation speed in milliseconds
  customPin: !1,
  // If false, sets a default icon for pins in spider legs.
  onInit: u,
  onClick: u,
  // --- <SPIDER TUNING Params>
  // circleSpiralSwitchover: show spiral instead of circle from this marker count upwards
  //                        0 -> always spiral; Infinity -> always circle
  circleSpiralSwitchover: 9,
  circleFootSeparation: 25,
  // related to circumference of circle
  spiralFootSeparation: 28,
  // related to size of spiral (experiment!)
  spiralLengthStart: 15,
  // ditto
  spiralLengthFactor: 4
  // ditto
  // ---
};
class S {
  constructor(i, t) {
    typeof woosmap > "u" && console.error("Woosmap is not defined."), this.map = i, this.options = { ...f, ...t }, this.previousSpiderLegs = [], this.createMarkerElements = P.bind(this), this.generateCircleParams = v.bind(this), this.generateSpiralParams = M.bind(this), this.generateSpiderLegParams = L.bind(this), this.each = function(e) {
      o.each(this.previousSpiderLegs, e);
    };
  }
  spiderfy(i, t) {
    const { options: e } = this, a = this.generateSpiderLegParams(t.length);
    this.unspiderfy();
    const s = t.map((r, c) => {
      const p = a[c], m = new window.woosmap.map.Marker({
        position: new woosmap.map.LatLng(i)
      }), h = this.createMarkerElements(p, m._element), l = {
        feature: r,
        elements: h,
        woosmapMarker: m,
        param: p
      };
      return e.onInit(l), h.container.onclick = function(g) {
        e.onClick(g, l);
      }, l;
    });
    o.each(s.reverse(), (r) => {
      r.woosmapMarker.setMap(this.map);
    }), e.animate && setTimeout(function() {
      o.each(s.reverse(), function(r, c) {
        r.elements.container.className = (r.elements.container.className || "").replace("initial", ""), r.elements.container.style.transitionDelay = e.animationSpeed / 1e3 / s.length * c + "s";
      });
    }), this.previousSpiderLegs = s;
  }
  unspiderfy() {
    const { options: i } = this;
    o.each(this.previousSpiderLegs.reverse(), function(t, e) {
      i.animate ? (t.elements.container.style.transitionDelay = i.animationSpeed / 1e3 / this.previousSpiderLegs.length * e + "s", t.elements.container.className += " exit", setTimeout(function() {
        t.woosmapMarker.setMap(null);
      }, i.animationSpeed + 100)) : t.woosmapMarker.setMap(null);
    }), this.previousSpiderLegs = [];
  }
}
function L(n) {
  return n >= this.options.circleSpiralSwitchover ? this.generateSpiralParams(n) : this.generateCircleParams(n);
}
function M(n) {
  const { options: i } = this, t = Math.PI * 2, e = i.spiralLengthStart + 50;
  let a = 0;
  return o.mapTimes(n, function(s) {
    a = a + (i.spiralFootSeparation / e + s * 5e-4);
    const r = {
      x: e * Math.cos(a),
      y: e * Math.sin(a),
      angle: a,
      legLength: e,
      index: s
    };
    return e = e + t * i.spiralLengthFactor / a, r;
  });
}
function v(n) {
  const i = Math.PI * 2, e = this.options.circleFootSeparation * (2 + n) / i, a = i / n;
  return o.mapTimes(n, function(s) {
    const r = s * a;
    return {
      x: e * Math.cos(r),
      y: e * Math.sin(r),
      angle: r,
      legLength: e,
      index: s
    };
  });
}
function P(n, i) {
  const { options: t } = this, e = i, a = document.createElement("div"), s = document.createElement("div");
  return e.querySelector("div").remove(), e.classList.add("spider-leg-container"), t.animate && e.classList.add("animate", "initial"), s.className = "spider-leg-line", a.className = "spider-leg-pin" + (t.customPin ? "" : " default-spider-pin"), e.appendChild(s), e.appendChild(a), e.style["margin-left"] = n.x + "px", e.style["margin-top"] = n.y + "px", s.style.height = n.legLength + "px", s.style.transform = "rotate(" + (n.angle - Math.PI / 2) + "rad)", { container: e, line: s, pin: a };
}
function w(n, i) {
  let t = 0;
  if (!n || !n.length)
    return [];
  for (t = 0; t < n.length; t++)
    i(n[t], t);
}
function d(n, i) {
  if (!n)
    return [];
  for (var t = 0; t < n; t++)
    i(t);
}
function y(n, i) {
  let t = [];
  return d(n, function(e) {
    t.push(i(e));
  }), t;
}
const k = S;
export {
  k as default
};
