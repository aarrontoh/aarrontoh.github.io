/* The travel map on the Life page: a canvas globe (drag to spin), a flat
 * view, arcs from home, glowing pins, and "trace route", which flies to
 * every place in turn and logs each hop like traceroute.
 * Data: assets/data/countries-110m.json (shapes) + assets/data/travel.json
 * (what he has visited, written by build.py). */
(() => {
  "use strict";
  const root = document.getElementById("atlas");
  if (!root || !window.d3 || !window.topojson) return;
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const tip = root.querySelector(".tip");
  const log = root.querySelector(".tlog");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  Promise.all([d3.json("assets/data/countries-110m.json"), d3.json("assets/data/travel.json")]).then(([world, T]) => {
    const land = topojson.feature(world, world.objects.countries).features;
    const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
    const visited = new Set(T.visited), wish = new Set(T.wishlist);
    const byName = new Map(land.map(f => [f.properties.name, f]));
    const home = [T.home.lon, T.home.lat];
    // Places: his cities, or the middle of each visited country until he names them.
    const places = T.cities.length ? T.cities.map(c => ({ name: c.name, country: c.country, at: [c.lon, c.lat] }))
      : T.visited.map(n => ({ name: T.display[n] || n, country: T.display[n] || n, at: d3.geoCentroid(byName.get(n)) }));
    const km = p => Math.round(d3.geoDistance(home, p) * 6371);
    places.forEach(p => (p.km = km(p.at)));
    const route = places.slice().sort((a, b) => a.km - b.km);

    let mode = "globe", W = 0, H = 0, dpr = 1, spin = !reduce, pulse = 0, focus = null, hover = null, tracing = null;
    const globe = d3.geoOrthographic().clipAngle(90).precision(.4).rotate([-104, -15]);
    const flat = d3.geoNaturalEarth1().precision(.4);
    const grat = d3.geoGraticule10();
    const proj = () => (mode === "globe" ? globe : flat);
    const path = () => d3.geoPath(proj(), ctx);

    function size() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      globe.translate([W / 2, H / 2]).scale(Math.min(W, H) / 2.15);
      flat.fitExtent([[10, 10], [W - 10, H - 10]], { type: "Sphere" });
    }

    function visible(p) {
      if (mode !== "globe") return true;
      const r = globe.rotate();
      return d3.geoDistance(p, [-r[0], -r[1]]) < Math.PI / 2 - .02;
    }

    function draw() {
      const P = path(), pr = proj();
      const C = { bg: css("--bg"), panel: css("--panel"), line: css("--line-2"), hot: css("--hot"), addr: css("--addr"), mnem: css("--mnem"), dim: css("--dim") };
      ctx.clearRect(0, 0, W, H);
      // atmosphere
      if (mode === "globe") {
        const [cx, cy] = globe.translate(), R = globe.scale();
        const g = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.18);
        g.addColorStop(0, "rgba(108,198,216,.18)"); g.addColorStop(1, "rgba(108,198,216,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.18, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.beginPath(); P({ type: "Sphere" }); ctx.fillStyle = "#070b10"; ctx.fill();
      ctx.beginPath(); P(grat); ctx.strokeStyle = "rgba(108,198,216,.07)"; ctx.lineWidth = .6; ctx.stroke();
      // land
      for (const f of land) {
        const n = f.properties.name;
        ctx.beginPath(); P(f);
        if (visited.has(n)) { ctx.fillStyle = focus === n || hover === n ? "#ff8a8a" : C.hot; ctx.shadowColor = C.hot; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0; }
        else { ctx.fillStyle = hover === n ? "#25313f" : "#1a2430"; ctx.fill(); }
        if (wish.has(n)) { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]); }
      }
      ctx.beginPath(); P(borders); ctx.strokeStyle = "rgba(10,14,19,.9)"; ctx.lineWidth = .5; ctx.stroke();
      ctx.beginPath(); P({ type: "Sphere" }); ctx.strokeStyle = "rgba(108,198,216,.25)"; ctx.lineWidth = 1; ctx.stroke();
      // arcs from home: dashes flow outward
      ctx.lineWidth = 1.2;
      for (const p of places) {
        const line = { type: "LineString", coordinates: [home, p.at] };
        ctx.beginPath(); P(line);
        ctx.setLineDash([4, 6]); ctx.lineDashOffset = -pulse * 18;
        ctx.strokeStyle = tracing && tracing.p === p ? C.addr : "rgba(227,168,87,.45)"; ctx.stroke();
      }
      ctx.setLineDash([]);
      // the plane on trace route
      if (tracing) {
        const xy = pr(d3.geoInterpolate(home, tracing.p.at)(tracing.t));
        if (xy && visible(d3.geoInterpolate(home, tracing.p.at)(tracing.t))) {
          ctx.beginPath(); ctx.arc(xy[0], xy[1], 4, 0, 2 * Math.PI); ctx.fillStyle = C.addr; ctx.shadowColor = C.addr; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
        }
      }
      // pins
      for (const p of places) {
        if (!visible(p.at)) continue;
        const xy = pr(p.at); if (!xy) continue;
        const r = 2.6 + (hover === p ? 1.5 : 0);
        ctx.beginPath(); ctx.arc(xy[0], xy[1], r + 3 + 3 * ((pulse + p.km / 900) % 1), 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255,107,107," + (0.55 - .5 * ((pulse + p.km / 900) % 1)) + ")"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI); ctx.fillStyle = "#fff"; ctx.fill();
      }
      // home
      if (visible(home)) {
        const xy = pr(home);
        if (xy) {
          const k = pulse % 1;
          ctx.beginPath(); ctx.arc(xy[0], xy[1], 5 + 10 * k, 0, 2 * Math.PI); ctx.strokeStyle = "rgba(227,168,87," + (1 - k) + ")"; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.arc(xy[0], xy[1], 4.5, 0, 2 * Math.PI); ctx.fillStyle = C.addr; ctx.fill();
        }
      }
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(50, now - last); last = now;
      pulse += dt / 1600;
      if (mode === "globe" && spin && !dragging && !tracing && !flying) { const r = globe.rotate(); globe.rotate([r[0] + dt * .006, r[1], r[2]]); }
      draw();
      requestAnimationFrame(frame);
    }

    // fly the globe to a point
    let flying = false;
    function flyTo(at, ms = 1100) {
      if (mode !== "globe") return Promise.resolve();
      flying = true;
      const from = globe.rotate(), to = [-at[0], -at[1] * .8, 0];
      const i = d3.interpolate(from, to);
      return new Promise(res => {
        const t0 = performance.now();
        (function step(now) {
          const k = Math.min(1, (now - t0) / (reduce ? 1 : ms));
          globe.rotate(i(d3.easeCubicInOut(k)));
          if (k < 1) requestAnimationFrame(step); else { flying = false; res(); }
        })(t0);
      });
    }

    // drag to spin
    let dragging = false;
    d3.select(canvas).call(d3.drag()
      .on("start", () => { dragging = true; root.classList.add("grab"); })
      .on("drag", e => {
        if (mode !== "globe") return;
        const r = globe.rotate(), k = 75 / globe.scale();
        globe.rotate([r[0] + e.dx * k, Math.max(-70, Math.min(70, r[1] - e.dy * k)), r[2]]);
      })
      .on("end", () => { dragging = false; root.classList.remove("grab"); }));

    // hover: nearest pin, else the country under the cursor
    function at(ev) {
      const b = canvas.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
      let best = null, bd = 12;
      for (const p of places) { if (!visible(p.at)) continue; const xy = proj()(p.at); if (!xy) continue; const d = Math.hypot(xy[0] - x, xy[1] - y); if (d < bd) { bd = d; best = p; } }
      if (best) return { pin: best, x, y };
      const ll = proj().invert([x, y]);
      if (!ll || (mode === "globe" && !visible(ll))) return { x, y };
      const f = land.find(f => d3.geoContains(f, ll));
      return { country: f && f.properties.name, x, y };
    }
    function showTip(h) {
      if (!h || (!h.pin && !h.country)) { tip.hidden = true; hover = null; return; }
      hover = h.pin || h.country;
      const name = h.pin ? h.pin.name : (T.display[h.country] || h.country);
      const sub = h.pin ? (h.pin.country !== h.pin.name ? h.pin.country + " · " : "") + h.pin.km.toLocaleString() + " km from home"
        : visited.has(h.country) ? "breakpoint hit" : wish.has(h.country) ? "on the list" : "not yet";
      tip.innerHTML = "<b></b><span></span>"; tip.firstChild.textContent = name; tip.lastChild.textContent = sub;
      tip.hidden = false;
      tip.style.left = Math.min(W - 170, h.x + 14) + "px"; tip.style.top = Math.max(6, h.y - 40) + "px";
    }
    canvas.addEventListener("pointermove", e => { if (!dragging) showTip(at(e)); });
    canvas.addEventListener("pointerleave", () => showTip(null));
    canvas.addEventListener("click", e => { const h = at(e); showTip(h); if (h.pin) flyTo(h.pin.at); });

    // controls
    const btn = s => root.querySelector("[data-a='" + s + "']");
    function setMode(m) {
      mode = m;
      btn("globe").setAttribute("aria-pressed", String(m === "globe"));
      btn("flat").setAttribute("aria-pressed", String(m === "flat"));
      btn("spin").disabled = m !== "globe";
    }
    btn("globe").addEventListener("click", () => setMode("globe"));
    btn("flat").addEventListener("click", () => setMode("flat"));
    btn("spin").addEventListener("click", () => { spin = !spin; btn("spin").setAttribute("aria-pressed", String(spin)); });
    btn("spin").setAttribute("aria-pressed", String(spin));
    btn("trace").addEventListener("click", trace);

    async function trace() {
      if (tracing) return;
      const b = btn("trace"); b.disabled = true;
      log.hidden = false; log.textContent = "traceroute to the world (" + route.length + " hops), from " + T.home.name + "\n";
      for (let i = 0; i < route.length; i++) {
        const p = route[i];
        const hop = Math.max(260, 24000 / route.length);   // the whole trace takes ~25 s, however many places
        await flyTo(d3.geoInterpolate(home, p.at)(.5), hop * .45);
        tracing = { p, t: 0 };
        await new Promise(res => { const t0 = performance.now(), ms = reduce ? 1 : hop * .55; (function st(now) { tracing.t = Math.min(1, (now - t0) / ms); if (tracing.t < 1) requestAnimationFrame(st); else res(); })(t0); });
        log.textContent += String(i + 1).padStart(2) + "  " + (p.name + (p.country !== p.name ? ", " + p.country : "")).padEnd(30) + p.km.toLocaleString().padStart(7) + " km\n";
        log.scrollTop = log.scrollHeight;
      }
      tracing = null;
      log.textContent += "trace complete. " + T.visited.length + " countries, " + (T.cities.length || "?") + " places.\n";
      b.disabled = false;
    }

    // the list below the map spins the globe to a country
    document.querySelectorAll(".cont li[data-atlas]").forEach(li => {
      li.addEventListener("click", () => {
        const f = byName.get(li.dataset.atlas); if (!f) return;
        setMode("globe"); focus = li.dataset.atlas; spin = false; btn("spin").setAttribute("aria-pressed", "false");
        root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        flyTo(d3.geoCentroid(f)).then(() => setTimeout(() => (focus = null), 1800));
      });
    });
    window.addEventListener("h8ck:trace", () => { root.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(trace, 500); });

    // stats
    const far = route[route.length - 1];
    root.querySelector("[data-s='far']").textContent = far ? far.name + " · " + far.km.toLocaleString() + " km" : "–";
    root.querySelector("[data-s='places']").textContent = T.cities.length ? String(T.cities.length) : "soon";

    size(); addEventListener("resize", size);
    flyTo(home, 1).then(() => {});
    requestAnimationFrame(frame);
    root.classList.add("ready");
  }).catch(() => { root.classList.add("failed"); });
})();
