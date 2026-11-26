/* h8ckth3b0xes — the terminal, the mini-CTF, and the small interactions.
 *
 * Four flags are hidden on this site. Finding them is optional; the site works
 * fine without ever opening the terminal. If you are reading this file to get
 * them: that is exactly what a red teamer would do. Carry on. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const PAGES = { home: "index.html", cyber: "cyber.html", projects: "projects.html", sport: "sport.html", life: "life.html" };
  const here = document.body.dataset.page || "home";
  const skin = {
    get() { try { return localStorage.getItem("h8ck.skin") || "ida"; } catch (e) { return "ida"; } },
    set(v) { try { localStorage.setItem("h8ck.skin", v); } catch (e) {} apply(v); },
  };
  function apply(v) { if (v === "phosphor") document.documentElement.dataset.skin = "phosphor"; else delete document.documentElement.dataset.skin; }
  apply(skin.get());
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ flags */
  // The flags are not secrets: each is a reward for curiosity, kept in this browser only.
  const FLAGS = {
    f1: "h8ck{h1dd3n_f1l3s_4r3n7_s3cr3ts}",
    f2: "h8ck{v13w_s0urc3_1s_r3c0n}",
    f3: "h8ck{numb3r_f1v3_4l1v3}",
    f4: "h8ck{up_up_d0wn_d0wn_g0d_m0d3}",
  };
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("h8ck.flags") || "[]"); } catch (e) { return []; } },
    set(v) { try { localStorage.setItem("h8ck.flags", JSON.stringify(v)); } catch (e) {} },
  };
  // Level 2 flags are kept only as SHA-256 fingerprints: reading this file won't give them away.
  const L2 = {"f5": "0bf4e2f142a31bf6fb7e5c8dd95cdc7bf5c379c3929f640eb63ac55706ff2418", "f6": "06deacf51629296ceab7a7feccbc3f2572437b8f20a1bbc88c6caac3eb3229c8", "f7": "9cd037789da91109780fd2fff78d8135132ca8b1e023104eb0da94aacde09bbb"};
  let found = store.get();
  const lvl1 = () => found.filter(k => FLAGS[k]).length;
  const lvl2 = () => found.filter(k => L2[k]).length;
  const count = () => lvl1() + "/4" + (lvl1() === 4 || lvl2() ? " · L2 " + lvl2() + "/3" : "");
  function paintFlags() { $$("[data-flags]").forEach(el => (el.textContent = "flags " + count())); }
  function toast(t) {
    let el = $(".flagtoast");
    if (!el) { el = document.createElement("div"); el.className = "flagtoast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = t; el.classList.add("on");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 3200);
  }
  function capture(id) {
    if (found.includes(id)) return false;
    found = [...found, id]; store.set(found); paintFlags();
    toast("⚑ flag captured · " + count());
    if (FLAGS[id] && lvl1() === 4) setTimeout(rootScreen, 900);
    if (L2[id] && lvl2() === 3) setTimeout(() => overlay("elite"), 900);
    return true;
  }
  async function sha256(t) {
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  async function submit(text) {
    const t = text.trim();
    let id = Object.keys(FLAGS).find(k => FLAGS[k] === t);
    if (!id && crypto.subtle) { const h = await sha256(t); id = Object.keys(L2).find(k => L2[k] === h); }
    if (!id) return { ok: false };
    return { ok: true, fresh: capture(id), level: L2[id] ? 2 : 1 };
  }

  /* ------------------------------------------------------------ overlays */
  function overlay(id) { const o = document.getElementById(id); if (!o) return; o.hidden = false; const b = $("button", o); b && b.focus(); }
  $$(".overlay").forEach(o => {
    o.addEventListener("click", e => { if (e.target === o || e.target.matches("[data-close]")) o.hidden = true; });
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    $$(".overlay").forEach(o => (o.hidden = true));
    if (document.activeElement && document.activeElement.closest(".overlay")) document.activeElement.blur();
  });
  function rootScreen() { overlay("root"); }

  /* ------------------------------------------------------------ konami (flag 4) */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  document.addEventListener("keydown", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; godMode(); }
  });
  // Phones have no arrow keys: five quick taps on the avatar do the same.
  let taps = [];
  $$("[data-avatar]").forEach(a => a.addEventListener("click", () => {
    const now = Date.now(); taps = taps.filter(t => now - t < 2500); taps.push(now);
    if (taps.length >= 5) { taps = []; godMode(); }
  }));
  function godMode() {
    const o = document.getElementById("god");
    if (!o) return;
    $(".flagtext", o).textContent = FLAGS.f4;
    overlay("god");
    capture("f4");
  }

  /* ------------------------------------------------------------ baseball card (flag 3) */
  const bcard = $(".bcard");
  if (bcard) {
    bcard.addEventListener("click", e => { if (!e.target.closest(".num")) bcard.classList.toggle("flip"); });
    bcard.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bcard.classList.toggle("flip"); } });
    let n = 0, t0 = 0;
    const num = $(".num", bcard);
    num && num.addEventListener("click", e => {
      e.stopPropagation();
      const now = Date.now(); n = now - t0 < 1500 ? n + 1 : 1; t0 = now;
      num.style.transform = "scale(" + (1 + n * .06) + ")";
      if (n >= 5) { n = 0; num.style.transform = ""; $("#f3text").textContent = FLAGS.f3; overlay("cardflag"); capture("f3"); }
    });
  }

  /* ------------------------------------------------------------ save the player card as a PNG */
  const save = $("[data-savecard]");
  if (save && bcard) save.addEventListener("click", async () => {
    const svg = $(".front svg", bcard);
    const W = 600, H = 840, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#f2efe6"; g.fillRect(0, 0, W, H);
    const sky = g.createLinearGradient(0, 24, 0, 660); sky.addColorStop(0, "#1d2a3a"); sky.addColorStop(.62, "#2f5d3a"); sky.addColorStop(.62, "#3d7a45"); sky.addColorStop(1, "#3d7a45");
    g.fillStyle = sky; g.fillRect(24, 24, W - 48, 636);
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="360"'));
    await img.decode().catch(() => {});
    g.imageSmoothingEnabled = false; g.drawImage(img, (W - 320) / 2, 170, 320, 360);
    await document.fonts.ready;
    g.font = "800 92px 'JetBrains Mono', monospace"; g.textAlign = "right"; g.fillStyle = "#c8302f"; g.fillText("5", W - 56, 136); g.fillStyle = "#f2efe6"; g.fillText("5", W - 62, 130);
    g.fillStyle = "#c8302f"; g.fillRect(24, 660, W - 48, 156);
    g.textAlign = "left"; g.fillStyle = "#fff"; g.font = "800 46px 'JetBrains Mono', monospace"; g.fillText("AARON TOH", 52, 728);
    g.font = "600 20px 'JetBrains Mono', monospace"; g.fillText("TEAM SINGAPORE · BASEBALL", 52, 768);
    g.font = "500 15px 'JetBrains Mono', monospace"; g.fillStyle = "rgba(255,255,255,.75)"; g.fillText("aarrontoh.github.io · card 05", 52, 798);
    c.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "aaron-toh-card-05.png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, "image/png");
  });

  /* ------------------------------------------------------------ functions window scroll-spy */
  const links = $$(".fnwin a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { links.forEach(l => l.classList.remove("on")); const a = map.get(en.target.id); a && a.classList.add("on"); } });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".fn[id]").forEach(s => io.observe(s));
  }

  /* ------------------------------------------------------------ the terminal */
  const ME = {
    who: "Aaron Toh (aka h8ckth3b0xes): red teamer and exploit developer in Singapore.",
    email: "aarrontoh@gmail.com",
    linkedin: "https://www.linkedin.com/in/aaron-toh-sheng-rong-toh-823512200/",
  };
  const FILES = {
    "about.txt": () => [
      "Aaron Toh, Singapore.",
      "Red teaming and exploit development: I write the attacks so defenders can prove what they catch.",
      "Now: C4X Cybersecurity Officer at the Digital and Intelligence Service.",
      "Before: SOC, cyber range, threat hunting, a CISO office, then a government red team.",
      "Off the keyboard: ex-Team Singapore baseball (#5), racquet sports, the gym, cooking, hiking.",
      "Motto: everything in moderation.",
    ],
    "experience.log": () => [
      "[2026-06 → now    ] Digital and Intelligence Service · C4X Cybersecurity Officer",
      "[2025-06 → 2026-03] GovTech · Cyber Security Group · Red Team DevOps, Adversary Simulation",
      "[2025-01 → 2025-05] PwC Singapore · Network Information Security Analyst (CISO office)",
      "[2024-05 → 2024-08] Digital and Intelligence Service · Threat Hunting Centre",
      "[2023-05 → 2023-08] Digital and Intelligence Service · Cyber Test Range",
      "[2022-06 → 2022-08] Digital and Intelligence Service · Security Operations Centre",
      "→ cd cyber   for the full story",
    ],
    "certs.txt": () => ["OSCP   OffSec Certified Professional     ✔", "OSWP   OffSec Wireless Professional      ✔", "CEH    Certified Ethical Hacker          ✔", "OSEE   OffSec Exploitation Expert        ⟳ next"],
    "contact.txt": () => ["email     " + ME.email, "linkedin  " + ME.linkedin, "resume    type: resume"],
    "resume.pdf": () => ["%PDF-1.7 … binary. Try: resume"],
    ".flag": () => [FLAGS.f1],
    ".bash_history": () => ["nmap -sC -sV 10.10.10.5", "cat ~/.flag", "sudo make me a sandwich", "vim ~/notes/osee.md", "exit"],
  };
  const HIDDEN = [".flag", ".bash_history"];

  function makeTerminal(root, opts = {}) {
    const out = $(".out", root), input = $("input", root);
    const hist = []; let hpos = 0;
    const cwd = () => "~" + (here === "home" ? "" : "/" + here);
    const ps = () => `<span class="ps">guest@h8ckth3b0xes<b>:${cwd()}</b>$</span> `;
    const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    function line(html, cls) { const d = document.createElement("div"); d.className = "ln" + (cls ? " " + cls : ""); d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
    function lines(arr, cls) { arr.forEach(t => line(esc(t), cls)); }

    const C = {
      help() {
        line('<span class="acc">commands</span>');
        [["whoami", "who I am"], ["about", "the short version"], ["experience", "where I've worked"], ["certs", "certifications"], ["skills", "tools and languages"], ["projects", "things I've built"], ["sport", "baseball and the rest"], ["contact", "how to reach me"], ["resume", "download my resume"], ["cd <page>", "go to home, cyber, projects, sport, life"], ["ls [-la]", "list files"], ["cat <file>", "read a file"], ["neofetch", "system info"], ["jump <name>", "go to any section (or press G)"], ["traceroute", "fly the travel globe"], ["man aaron", "the manual"], ["theme <ida|phosphor>", "switch colours"], ["flags", "mini-CTF progress"], ["submit <flag>", "turn in a flag"], ["hint", "stuck?"], ["clear", "clear the screen"]]
          .forEach(([c, d]) => line(`  <span class="cy">${esc(c.padEnd(14))}</span><span class="dim">${esc(d)}</span>`));
        line('<span class="dim">tab completes · ↑ ↓ history · there are 4 flags hidden on this site</span>');
      },
      whoami() { line(esc(ME.who)); },
      about() { lines(FILES["about.txt"]()); },
      experience() { lines(FILES["experience.log"]()); },
      exp() { C.experience(); },
      certs() { lines(FILES["certs.txt"]()); },
      skills() {
        lines(["offense   C/C++ tradecraft, Beacon Object Files, Windows internals, MITRE ATT&CK",
               "re/debug  IDA, WinDbg, CFF Explorer",
               "lang      Python, C, C++, Rust, Java, Dart, SQL, PowerShell, JS",
               "infra     GitLab CI/CD, Docker, VMware ESXi/vSphere, Linux, Scapy"]);
      },
      projects() { lines(["ahbot        personal finance OS, ~5,000 tests", "rewards      two-sided sustainability rewards platform (Flutter + Supabase)", "mindgame     mental-health tracking game (Unity/C#)", "dresssense   AI wardrobe app", "→ cd projects"]); },
      sport() { lines(["Team Singapore baseball, #5, bats/throws right, 2023 – 2025", "Asian Games 2023 (Hangzhou) · East Asia Cup 2023", "→ cd sport"]); },
      life() { lines(["food (all of it) · hiking · gym · cooking · board games", "→ cd life"]); },
      contact() { line(`email     <a href="mailto:${ME.email}">${ME.email}</a>`); line(`linkedin  <a href="${ME.linkedin}" target="_blank" rel="noopener">linkedin.com/in/aaron-toh-sheng-rong…</a>`); },
      resume() { line('opening resume… <a href="assets/Aaron_Toh_Resume.pdf" target="_blank" rel="noopener">Aaron_Toh_Resume.pdf</a>'); window.open("assets/Aaron_Toh_Resume.pdf", "_blank", "noopener"); },
      ls(args) {
        const all = args.some(a => a.startsWith("-") && a.includes("a"));
        const long = args.some(a => a.startsWith("-") && a.includes("l"));
        const names = Object.keys(FILES).filter(f => all || !HIDDEN.includes(f));
        if (all && long) { line('<span class="dim">total ' + names.length + '</span>'); names.forEach(n => line(`<span class="dim">-rw-r--r--  1 aaron  staff  ${String(FILES[n]().join("").length).padStart(4)}  Nov 23  </span>${n.startsWith(".") ? '<span class="acc">' + esc(n) + '</span>' : esc(n)}`)); }
        else line(names.map(n => esc(n)).join("    ") + (all ? "" : "    projects/"));
      },
      cat(args) {
        const f = args[0];
        if (!f) return line("cat: missing file", "err");
        if (!FILES[f]) return line("cat: " + esc(f) + ": No such file or directory", "err");
        lines(FILES[f]());
        if (f === ".flag") line('<span class="dim">looks like a flag. try: submit ' + esc(FLAGS.f1) + '</span>');
      },
      cd(args) {
        const p = (args[0] || "home").replace(/^~\/?|\/$/g, "") || "home";
        if (p === ".." || p === "~") return go("home");
        if (!PAGES[p]) return line("cd: no such page: " + esc(p) + " (try home, cyber, projects, sport, life)", "err");
        go(p);
      },
      open(args) { C.cd(args); },
      pwd() { line("/home/guest/" + (here === "home" ? "" : here)); },
      echo(args) { line(esc(args.join(" "))); },
      date() { line(new Date().toString()); },
      neofetch() {
        const art = ["   ▄▄▄▄▄▄▄   ", "  ███████████ ", "  ██ ▀█▀ ▀███ ", "  ███████████ ", "   ▀▀▀▀▀▀▀▀▀  "];
        const info = [`<span class="acc">guest</span>@<span class="acc">h8ckth3b0xes</span>`, "-----------------", `<span class="cy">OS</span>: Aaron Toh v26.11`, `<span class="cy">Role</span>: red team · exploit dev`, `<span class="cy">Certs</span>: OSCP, OSWP, CEH`, `<span class="cy">Next</span>: OSEE`, `<span class="cy">Shell</span>: discipline + caffeine`, `<span class="cy">Jersey</span>: #5`];
        for (let i = 0; i < info.length; i++) line(`<span class="acc">${esc(art[i] || "             ")}</span> ${info[i]}`);
      },
      flags() {
        line("level 1: " + lvl1() + "/4");
        Object.keys(FLAGS).forEach((k, i) => line(`  [${found.includes(k) ? '<span class="ok">x</span>' : " "}] flag ${i + 1}`));
        if (lvl1() === 4 || lvl2()) {
          line("level 2: " + lvl2() + "/3");
          ["recon", "reversing", "forensics"].forEach((n, i) => line(`  [${found.includes("f" + (i + 5)) ? '<span class="ok">x</span>' : " "}] ${n}`));
        }
        if (lvl1() < 4 || lvl2() < 3) line('<span class="dim">type hint if you are stuck</span>');
      },
      submit(args) {
        submit(args.join(" ")).then(r => {
          if (!r.ok) return line("✗ not a flag. format: h8ck{…}", "err");
          line(r.fresh ? "✔ correct! " + count() + " captured" : "✔ already captured (" + count() + ")", "ok");
        });
      },
      hint() {
        const left = Object.keys(FLAGS).filter(k => !found.includes(k));
        const H = { f1: "Some files don't show up in a plain ls.", f2: "Recon starts with reading what the server sent you. The cyber page's source has a comment worth decoding (try: base64 <text>).", f3: "A player's number means something. Tap it, a few times, on the sport page.", f4: "Old-school cheat codes still work here. (On a phone: tap my avatar quickly, five times.)" };
        if (left.length) return line(H[left[0]]);
        const L2H = { f5: "Level 2 starts where every recon starts: the file that tells robots where not to look.", f6: "In the vault, the crackme's check is reversible. Undo each step, last to first.", f7: "The picture this site sends to LinkedIn carries more than pixels. strings it." };
        const left2 = Object.keys(L2).filter(k => !found.includes(k));
        if (!left2.length) return line("all 7 flags. there is nothing left; you've earned a coffee.", "ok");
        line(L2H[left2[0]]);
      },
      base64(args) {
        const d = args[0] === "-d" ? args.slice(1) : args;
        try { line(esc(atob(d.join("")))); } catch (e) { line("base64: invalid input", "err"); }
      },
      history() { hist.forEach((h, i) => line(`  ${String(i + 1).padStart(3)}  ${esc(h)}`)); },
      clear() { out.innerHTML = ""; },
      exit() { if (opts.onExit) opts.onExit(); else line("there is no escape. (try clear)", "dim"); },
      sudo(args) {
        if (args.join(" ").includes("rm -rf")) return line("nice try. this incident will be reported (to me, and I'll laugh).", "err");
        line("[sudo] password for guest: ", "dim"); line("guest is not in the sudoers file. This incident will be reported.", "err");
      },
      rm(args) { line(args.join(" ").includes("-rf") ? "rm: permission denied. good instinct though." : "rm: permission denied", "err"); },
      ssh() { line("ssh: connect to host aaron port 22: Connection refused (try: contact)", "err"); },
      nmap() { lines(["Starting Nmap 7.95", "PORT     STATE  SERVICE", "22/tcp   closed ssh", "80/tcp   open   portfolio", "1337/tcp open   curiosity", "Nmap done: 1 IP address (1 host up)"]); },
      vim() { line("you'd never get out. (try nano. just kidding.)", "dim"); },
      hello() { line("hi! try help."); }, hi() { C.hello(); },
      theme(args) {
        const v = (args[0] || "").toLowerCase();
        if (!["ida", "phosphor"].includes(v)) return line("usage: theme ida | theme phosphor   (now: " + skin.get() + ")", "dim");
        skin.set(v); line("theme → " + v, "ok");
      },
      man(args) {
        if ((args[0] || "").toLowerCase() !== "aaron") return line("What manual page do you want? (try: man aaron)", "dim");
        lines(["AARON(1)                     User Commands                     AARON(1)", "",
               "NAME", "       aaron - red teamer, exploit developer, ex-Team Singapore #5", "",
               "SYNOPSIS", "       aaron [--red-team] [--exploit-dev] [--eat EVERYTHING]", "",
               "DESCRIPTION", "       Builds the attacks defenders need to see. Trains every day,",
               "       a little at a time. Runs on food and board games.", "",
               "OPTIONS", "       --hire     see: contact", "       --chat     see: contact",
               "", "BUGS", "       Cannot say no to a good bowl of noodles.", "",
               "SEE ALSO", "       experience(1), certs(1), sport(1), life(1)"]);
      },
      beaglesay(args) {
        const t = args.join(" ") || "woof. try help.";
        const bar = "-".repeat(Math.min(t.length + 2, 60));
        lines([" " + bar, "< " + t.slice(0, 58) + " >", " " + bar, "      \\    __", "       \\  (  o\\___", "          \\   ___ o)", "           \\_/   \\", "           /  |   |", "          (__/(___/"]);
      },
      uptime() { const d = Math.floor((Date.now() - new Date(2019, 0, 2)) / 864e5); line("up " + d + " days (since the first A-level computing class), load average: high"); },
      whois() { C.whoami(); },
      jump(args) {
        const q = args.join("_").toLowerCase();
        const f = (window.H8CK_FUNCS || []).find(x => x.name.includes(q));
        if (!q || !f) return line(q ? "jump: no function matching " + esc(q) : "usage: jump <name>   (or press G)", "dim");
        line("jmp " + f.name + " (" + f.page + ")", "dim"); location.href = f.file + "#" + f.name;
      },
      traceroute() {
        if (here !== "life") { line("routing via the life page…", "dim"); try { sessionStorage.setItem("h8ck.trace", "1"); } catch (e) {} location.href = PAGES.life; return; }
        line("starting traceroute on the globe…", "dim"); window.dispatchEvent(new Event("h8ck:trace"));
      },
    };
    const NAMES = Object.keys(C);

    function go(p) {
      line("cd " + p + " …", "dim");
      if (p === here) return;
      try { sessionStorage.setItem("h8ck.dock", "open"); } catch (e) {}
      location.href = PAGES[p];
    }
    function run(raw) {
      const text = raw.trim();
      line(ps() + esc(raw));
      if (!text) return;
      hist.push(text); hpos = hist.length;
      const [cmd, ...args] = text.split(/\s+/);
      const fn = C[cmd.toLowerCase()];
      if (fn) fn(args); else line(esc(cmd) + ": command not found. type help", "err");
    }
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { run(input.value); input.value = ""; }
      else if (e.key === "ArrowUp") { if (hpos > 0) { hpos--; input.value = hist[hpos]; } e.preventDefault(); }
      else if (e.key === "ArrowDown") { if (hpos < hist.length) { hpos++; input.value = hist[hpos] || ""; } e.preventDefault(); }
      else if (e.key === "Tab") {
        e.preventDefault();
        const parts = input.value.split(" ");
        const last = parts[parts.length - 1];
        const pool = parts.length === 1 ? NAMES : (["cat"].includes(parts[0]) ? Object.keys(FILES) : (["cd", "open"].includes(parts[0]) ? Object.keys(PAGES) : []));
        const hit = pool.filter(n => n.startsWith(last));
        if (hit.length === 1) { parts[parts.length - 1] = hit[0]; input.value = parts.join(" ") + (parts.length === 1 ? " " : ""); }
        else if (hit.length > 1) line(hit.join("  "), "dim");
      }
      if (e.key !== "F5") e.stopPropagation();   // typing never triggers the Konami code; F5 still decompiles
    });
    root.addEventListener("click", e => {
      const chip = e.target.closest("[data-cmd]");
      if (chip) { run(chip.dataset.cmd); input.focus({ preventScroll: true }); return; }
      if (!e.target.closest("a, button") && !window.getSelection().toString()) input.focus();
    });
    if (opts.greet) opts.greet({ line, run, esc });
    return { run, line, focus: () => input.focus() };
  }

  /* inline terminal on the home page: types "whoami" for you, then hands over */
  const inline = $(".inline-term");
  if (inline) {
    makeTerminal(inline, {
      greet({ line, run }) {
        line('<span class="dim">Welcome. This is a real terminal: type </span><span class="cy">help</span><span class="dim"> to look around.</span>');
        const input = $("input", inline);
        if (reduce) { run("whoami"); return; }
        const word = "whoami"; let i = 0;
        const t = setInterval(() => {
          if (document.activeElement === input && input.value && i === 0) { clearInterval(t); return; }
          input.value = word.slice(0, ++i);
          if (i === word.length) { clearInterval(t); setTimeout(() => { run(word); input.value = ""; }, 350); }
        }, 110);
      },
    });
  }

  /* the docked Output window, on every page */
  const dock = $(".dock");
  if (dock) {
    const term = makeTerminal($(".term", dock), {
      onExit: () => toggle(false),
      greet({ line }) { line('<span class="dim">Output window · type </span><span class="cy">help</span><span class="dim"> · press </span><span class="acc">`</span><span class="dim"> to open or close</span>'); },
    });
    const bar = $(".bar", dock);
    function toggle(force) {
      const open = typeof force === "boolean" ? force : !dock.classList.contains("open");
      dock.classList.toggle("open", open);
      bar.setAttribute("aria-expanded", open);
      $(".bar button", dock).textContent = open ? "▾ hide" : "▴ open";
      if (open) setTimeout(term.focus, 60);
    }
    bar.addEventListener("click", e => { if (!e.target.closest("a")) toggle(); });
    bar.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    $$("[data-open-term]").forEach(b => b.addEventListener("click", () => toggle(true)));
    document.addEventListener("keydown", e => {
      if (e.key === "`" && !e.target.matches("input, textarea")) { e.preventDefault(); toggle(); }
    });
    try { if (sessionStorage.getItem("h8ck.dock") === "open") { sessionStorage.removeItem("h8ck.dock"); toggle(true); } } catch (e) {}
  }


  /* ------------------------------------------------------------ boot: IDA autoanalysis, once per visit */
  const boot = $(".boot");
  if (boot) {
    let seen = false;
    try { seen = sessionStorage.getItem("h8ck.booted") === "1"; sessionStorage.setItem("h8ck.booted", "1"); } catch (e) {}
    if (seen || reduce) boot.remove();
    else {
      const pre = $("pre", boot);
      const L = pre.innerHTML.split("\n"); pre.innerHTML = "";
      let i = 0, done = false;
      const end = () => { if (done) return; done = true; boot.classList.add("out"); setTimeout(() => boot.remove(), 400); };
      const tick = () => { if (done) return; if (i < L.length) { pre.innerHTML += (i ? "\n" : "") + L[i++]; setTimeout(tick, 170); } else setTimeout(end, 650); };
      tick();
      boot.addEventListener("click", end);
      addEventListener("keydown", end, { once: true });
      setTimeout(end, 4000);
    }
  }

  /* ------------------------------------------------------------ navigation band */
  const band = $(".navband");
  const fns = $$(".fn[id]");
  if (band && fns.length) {
    const ptr = document.createElement("span"); ptr.className = "ptr";
    function layout() {
      band.querySelectorAll("a").forEach(a => a.remove());
      const total = fns.reduce((t, f) => t + f.offsetHeight, 0) || 1;
      fns.forEach(f => {
        const a = document.createElement("a");
        a.href = "#" + f.id; a.title = f.id; a.setAttribute("aria-label", "Jump to " + f.id.replace(/_/g, " "));
        a.style.flex = String(f.offsetHeight / total);
        band.appendChild(a);
      });
      band.appendChild(ptr); place();
    }
    function place() {
      const max = document.documentElement.scrollHeight - innerHeight;
      const frac = max > 0 ? scrollY / max : 0;
      const r = band.getBoundingClientRect(), cs = getComputedStyle(band);
      const left = parseFloat(cs.paddingLeft), width = r.width - left - parseFloat(cs.paddingRight);
      ptr.style.left = (left + frac * width) + "px";
      const cur = fns.findIndex(f => f.getBoundingClientRect().bottom > innerHeight * .35);
      band.querySelectorAll("a").forEach((a, k) => a.classList.toggle("on", k === cur));
    }
    layout();
    addEventListener("scroll", place, { passive: true });
    addEventListener("resize", layout);
    addEventListener("load", layout);
  }

  /* ------------------------------------------------------------ F5: IDA View <-> Pseudocode */
  const duals = $$(".dual");
  function show(d, which) {
    $$(".vt button", d).forEach(b => b.setAttribute("aria-selected", String(b.dataset.v === which)));
    $$("[data-pane]", d).forEach(p => (p.hidden = p.dataset.pane !== which));
  }
  duals.forEach(d => d.addEventListener("click", e => { const b = e.target.closest(".vt button"); if (b) show(d, b.dataset.v); }));
  document.addEventListener("keydown", e => {
    if (e.key !== "F5" || !duals.length) return;   // F5 means nothing in a text box, so it decompiles there too
    e.preventDefault();      // in IDA, F5 decompiles; here too
    const next = $("[data-pane='pseudo']", duals[0]).hidden ? "pseudo" : "asm";
    duals.forEach(d => show(d, next));
  });

  /* ------------------------------------------------------------ copy email */
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => {
    const text = b.dataset.copy;
    const ok = () => { const t = b.textContent; b.classList.add("done"); b.textContent = "✔ copied"; setTimeout(() => { b.classList.remove("done"); b.textContent = t; }, 1600); };
    try { navigator.clipboard.writeText(text).then(ok, ok); } catch (e) { ok(); }
  }));

  /* ------------------------------------------------------------ the handle decrypts itself */
  const handle = $("[data-decrypt]");
  if (handle && !reduce) {
    const final = handle.textContent, hex = "0123456789abcdef";
    let f = 0;
    const t = setInterval(() => {
      f++;
      handle.textContent = final.split("").map((c, i) => (i < f / 2 ? c : hex[(Math.random() * 16) | 0])).join("");
      if (f / 2 >= final.length) { clearInterval(t); handle.textContent = final; }
    }, 38);
  }

  /* ------------------------------------------------------------ find a country */
  const wfind = $("#wfind");
  if (wfind) {
    wfind.addEventListener("input", () => {
      const q = wfind.value.trim().toLowerCase();
      $$(".cont").forEach(d => {
        let shown = 0;
        $$("li", d).forEach(li => { const ok = !q || li.dataset.n.includes(q); li.hidden = !ok; shown += ok; });
        d.hidden = shown === 0;
        if (q && shown) d.open = true;
      });
    });
    wfind.addEventListener("keydown", e => e.stopPropagation());   // typing a country never triggers the Konami code
  }

  /* ------------------------------------------------------------ G: jump to function, on any page */
  const J = { box: document.getElementById("jump"), q: document.getElementById("jumpq"), list: document.getElementById("jumplist"), sel: 0, hits: [] };
  const FUNCS = window.H8CK_FUNCS || [];
  function jumpRender() {
    const q = J.q.value.trim().toLowerCase().replace(/\s+/g, "_");
    const words = J.q.value.trim().toLowerCase();
    J.hits = FUNCS.filter(f => !q || f.name.includes(q) || (f.page + " " + f.note.toLowerCase() + " " + (f.k || "")).includes(words))
      .sort((x, y) => (y.name.includes(q) - x.name.includes(q)));
    J.sel = Math.min(J.sel, Math.max(0, J.hits.length - 1));
    J.list.innerHTML = J.hits.length ? J.hits.map((f, i) => `<li><a href="${f.file}#${f.name}" class="${i === J.sel ? "sel" : ""}"><span class="a">${f.addr}</span><span>${f.name}<span class="nt"></span></span><span class="pg">${f.page}</span></a></li>`).join("") : '<li class="empty">no function by that name</li>';
    $$(".nt", J.list).forEach((el, i) => (el.textContent = J.hits[i].note));
    const s = $("a.sel", J.list); s && s.scrollIntoView({ block: "nearest" });
  }
  function jumpOpen() { if (!J.box) return; J.box.hidden = false; J.q.value = ""; J.sel = 0; jumpRender(); setTimeout(() => J.q.focus(), 10); }
  function jumpGo(f) { if (!f) return; J.box.hidden = true; J.q.blur(); if (f.file === location.pathname.split("/").pop() || (f.file === "index.html" && here === "home")) { location.hash = f.name; } else location.href = f.file + "#" + f.name; }
  if (J.box) {
    J.q.addEventListener("input", () => { J.sel = 0; jumpRender(); });
    J.q.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "ArrowDown") { J.sel = Math.min(J.sel + 1, J.hits.length - 1); jumpRender(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { J.sel = Math.max(J.sel - 1, 0); jumpRender(); e.preventDefault(); }
      else if (e.key === "Enter") { jumpGo(J.hits[J.sel]); e.preventDefault(); }
      else if (e.key === "Escape") { J.box.hidden = true; J.q.blur(); }
    });
    J.list.addEventListener("click", e => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); const i = $$("a", J.list).indexOf(a); jumpGo(J.hits[i]); });
    $$("[data-jump]").forEach(b => b.addEventListener("click", jumpOpen));
    document.addEventListener("keydown", e => {
      if (e.target.matches("input, textarea") || e.altKey) return;
      if ((e.key === "g" && !e.metaKey && !e.ctrlKey) || (e.key === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); jumpOpen(); }
    });
  }

  try { if (here === "life" && sessionStorage.getItem("h8ck.trace") === "1") { sessionStorage.removeItem("h8ck.trace"); setTimeout(() => window.dispatchEvent(new Event("h8ck:trace")), 1500); } } catch (e) {}
  paintFlags();
  // Recon, step one.
  console.log("%c h8ckth3b0xes ", "background:#e3a857;color:#0a0e13;font:700 14px monospace;padding:4px 8px;border-radius:3px");
  console.log("%cRecon starts with reading what the server sent you. The cyber page has a comment for you.", "color:#6cc6d8;font:12px monospace");
})();
