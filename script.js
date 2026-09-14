(() => {
  // ---------- configuration ----------
  const BIRTHDAY_MONTH = 6;  // شهریور (Jalali/Persian calendar, 1-indexed)
  const BIRTHDAY_DAY = 27;

  // Update this once the flappy-star game is live on GitHub Pages.
  const GIFT_URL = "https://YOUR-GITHUB-USERNAME.github.io/mahsa-star-flappy/";

  const countdownView = document.getElementById("countdownView");
  const celebrateView = document.getElementById("celebrateView");
  const giftBtn = document.getElementById("giftBtn");
  const floatersEl = document.getElementById("floaters");

  const els = {
    days: document.getElementById("valDays"),
    hours: document.getElementById("valHours"),
    minutes: document.getElementById("valMinutes"),
    seconds: document.getElementById("valSeconds"),
  };

  giftBtn.href = GIFT_URL;

  // ---------- Jalali (Persian) calendar lookup, via the built-in Intl API ----------
  // Rather than hand-rolling a Jalali↔Gregorian conversion (easy to get subtly
  // wrong around leap years), we let the browser's ICU data do it and just
  // scan forward day by day to find the next 27 Shahrivar.

  function getPersianMonthDay(date) {
    const fmt = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = fmt.formatToParts(date);
    const out = {};
    parts.forEach((p) => {
      if (p.type !== "literal") out[p.type] = parseInt(p.value, 10);
    });
    return out; // { year, month, day } — Jalali
  }

  function findNextBirthdayTarget(month, day) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 400; i++) {
      const probe = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + i,
        0, 0, 0, 0
      );
      const ymd = getPersianMonthDay(probe);
      if (ymd.month === month && ymd.day === day) {
        return probe; // local midnight of that day
      }
    }
    return null;
  }

  // ---------- floating balloons/hearts in the background ----------

  const FLOAT_EMOJIS = ["🎈", "💗", "✨", "🌸", "🎉"];

  function spawnFloater() {
    const el = document.createElement("span");
    el.className = "floater";
    el.textContent = FLOAT_EMOJIS[Math.floor(Math.random() * FLOAT_EMOJIS.length)];
    el.style.left = Math.random() * 100 + "%";
    const duration = 9 + Math.random() * 6;
    el.style.animationDuration = duration + "s";
    floatersEl.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 200);
  }

  for (let i = 0; i < 6; i++) {
    setTimeout(() => spawnFloater(), i * 900);
  }
  setInterval(spawnFloater, 1500);

  // ---------- confetti burst (canvas) ----------

  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  let confettiPieces = [];
  let confettiFrame = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const CONFETTI_COLORS = ["#ff6f91", "#e13a63", "#f4c77b", "#f1e0f5", "#ffffff"];

  function makeConfettiPiece() {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
      vy: 2 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 1.6,
      sway: Math.random() * Math.PI * 2,
    };
  }

  function startConfetti() {
    confettiPieces = Array.from({ length: 160 }, makeConfettiPiece);
    let elapsed = 0;
    const durationMs = 6000;
    let last = performance.now();

    function frame(now) {
      const dt = Math.min(now - last, 32);
      last = now;
      elapsed += dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiPieces.forEach((p) => {
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rotation += p.spin;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < durationMs) {
        confettiFrame = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiFrame = null;
      }
    }
    confettiFrame = requestAnimationFrame(frame);
  }

  // ---------- countdown loop ----------

  let target = findNextBirthdayTarget(BIRTHDAY_MONTH, BIRTHDAY_DAY);
  let celebrated = false;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function showCelebration() {
    if (celebrated) return;
    celebrated = true;
    countdownView.hidden = true;
    celebrateView.hidden = false;
    startConfetti();
  }

  function tick() {
    if (!target) return;
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      showCelebration();
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();
