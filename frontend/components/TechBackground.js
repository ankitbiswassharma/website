"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = ["/dashboard", "/staff", "/portal", "/enterprise-login", "/pay"];

const THEMES = {
  light: {
    node: "79, 70, 229", // indigo
    accent: "8, 145, 178", // cyan
    satellite: "55, 48, 163",
    link: "79, 70, 229",
    pulse: "16, 185, 129",
    nodeAlpha: 0.35,
    linkAlpha: 0.14,
    satAlpha: 0.5,
    orbitAlpha: 0.07,
  },
  dark: {
    node: "129, 140, 248",
    accent: "34, 211, 238",
    satellite: "165, 180, 252",
    link: "129, 140, 248",
    pulse: "52, 211, 153",
    nodeAlpha: 0.45,
    linkAlpha: 0.16,
    satAlpha: 0.65,
    orbitAlpha: 0.1,
  },
};

export default function TechBackground() {
  const canvasRef = useRef(null);
  const pathname = usePathname() || "/";
  const excluded = EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (excluded) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let running = true;
    let nodes = [];
    let satellites = [];
    let pulses = [];
    let theme = THEMES[document.documentElement.dataset.theme === "dark" ? "dark" : "light"];

    const observer = new MutationObserver(() => {
      theme = THEMES[document.documentElement.dataset.theme === "dark" ? "dark" : "light"];
      if (reduceMotion.matches) drawFrame(0); // repaint static frame in new theme
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    function seed() {
      const count = Math.min(90, Math.max(35, Math.round((width * height) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.6,
        server: Math.random() < 0.12, // a few "server" squares among the dots
      }));
      const satCount = width < 720 ? 2 : 3;
      satellites = Array.from({ length: satCount }, (_, i) => ({
        cx: width * (0.2 + 0.3 * i + Math.random() * 0.1),
        cy: height * (0.25 + Math.random() * 0.5),
        rx: 90 + Math.random() * 130,
        ry: 34 + Math.random() * 46,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0016 + Math.random() * 0.0012,
        tilt: (Math.random() - 0.5) * 0.9,
        size: 5 + Math.random() * 3,
      }));
      pulses = [];
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduceMotion.matches) drawFrame(0);
    }

    function satellitePos(s) {
      const cos = Math.cos(s.angle);
      const sin = Math.sin(s.angle);
      const x = s.cx + cos * s.rx * Math.cos(s.tilt) - sin * s.ry * Math.sin(s.tilt);
      const y = s.cy + cos * s.rx * Math.sin(s.tilt) + sin * s.ry * Math.cos(s.tilt);
      return { x, y };
    }

    function drawSatellite(x, y, size, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * 0.5);
      const c = `rgba(${theme.satellite}, ${theme.satAlpha})`;
      ctx.fillStyle = c;
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      // body
      ctx.fillRect(-size / 2, -size / 2, size, size);
      // panels
      ctx.fillRect(-size * 2.1, -size / 4, size * 1.3, size / 2);
      ctx.fillRect(size * 0.8, -size / 4, size * 1.3, size / 2);
      // panel struts
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, 0);
      ctx.lineTo(-size / 2, 0);
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size * 0.8, 0);
      ctx.stroke();
      ctx.restore();
    }

    function spawnPulse() {
      if (nodes.length < 2 || pulses.length > 5) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (a === b || dist > 260 || dist < 40) return;
      pulses.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.008 });
    }

    function drawFrame(dt) {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 140;

      // move + draw nodes
      for (const n of nodes) {
        if (dt) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;
        }
      }

      // links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const alpha = theme.linkAlpha * (1 - Math.sqrt(d2) / linkDist);
            ctx.strokeStyle = `rgba(${theme.link}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        if (n.server) {
          ctx.fillStyle = `rgba(${theme.accent}, ${theme.nodeAlpha})`;
          ctx.fillRect(n.x - 2.5, n.y - 2.5, 5, 5);
        } else {
          ctx.fillStyle = `rgba(${theme.node}, ${theme.nodeAlpha})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // data pulses travelling along links
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed * (dt || 16) * 0.06;
        if (p.t >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const fade = Math.sin(p.t * Math.PI);
        ctx.fillStyle = `rgba(${theme.pulse}, ${0.55 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // satellites + orbit paths + downlinks
      for (const s of satellites) {
        if (dt) s.angle += s.speed * dt * 0.06;
        // orbit path
        ctx.strokeStyle = `rgba(${theme.satellite}, ${theme.orbitAlpha})`;
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.ellipse(s.cx, s.cy, s.rx, s.ry, s.tilt, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const pos = satellitePos(s);
        // downlink to nearest node
        let nearest = null;
        let best = 200 * 200;
        for (const n of nodes) {
          const d2 = (n.x - pos.x) ** 2 + (n.y - pos.y) ** 2;
          if (d2 < best) {
            best = d2;
            nearest = n;
          }
        }
        if (nearest) {
          ctx.strokeStyle = `rgba(${theme.accent}, 0.12)`;
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(nearest.x, nearest.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        drawSatellite(pos.x, pos.y, s.size, s.angle);
      }
    }

    let last = performance.now();
    let pulseTimer = 0;

    function loop(now) {
      if (!running) return;
      const dt = Math.min(now - last, 50);
      last = now;
      pulseTimer += dt;
      if (pulseTimer > 600) {
        pulseTimer = 0;
        spawnPulse();
      }
      drawFrame(dt);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(rafId);
      if (reduceMotion.matches) {
        drawFrame(0); // static frame only
      } else {
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else {
        running = true;
        start();
      }
    }

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener?.("change", start);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener?.("change", start);
    };
  }, [excluded]);

  if (excluded) return null;

  return <canvas ref={canvasRef} className="tech-background" aria-hidden="true" />;
}
