"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = ["/dashboard", "/staff", "/portal", "/enterprise-login", "/pay"];

/**
 * Ambient network constellation rendered on a full-viewport canvas behind the
 * app. Drifting nodes connect into a soft multi-colour mesh with the occasional
 * data pulse travelling a link. Tuned to be subtle premium texture — richer on
 * the dark default, whisper-quiet on light. (Satellites were removed; they read
 * as clip-art against the new vibrant design.)
 */
const THEMES = {
  light: {
    // indigo, violet, cyan — matches the vibrant token palette
    palette: ["79, 70, 229", "124, 58, 237", "8, 145, 178"],
    link: "99, 90, 210",
    pulse: "8, 145, 178",
    pulseAlt: "5, 150, 105",
    nodeAlpha: 0.5,
    glowAlpha: 0.05,
    linkAlpha: 0.12,
  },
  dark: {
    palette: ["129, 140, 248", "167, 139, 250", "34, 211, 238"],
    link: "129, 140, 248",
    pulse: "34, 211, 238",
    pulseAlt: "52, 211, 153",
    nodeAlpha: 0.72,
    glowAlpha: 0.09,
    linkAlpha: 0.16,
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
    let pulses = [];
    let theme = THEMES[document.documentElement.dataset.theme === "dark" ? "dark" : "light"];

    const observer = new MutationObserver(() => {
      theme = THEMES[document.documentElement.dataset.theme === "dark" ? "dark" : "light"];
      if (reduceMotion.matches) drawFrame(0); // repaint static frame in new theme
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    function seed() {
      const count = Math.min(78, Math.max(28, Math.round((width * height) / 30000)));
      nodes = Array.from({ length: count }, () => {
        const hub = Math.random() < 0.14; // a few brighter "hub" nodes
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: hub ? 2.2 + Math.random() * 1.4 : 1 + Math.random() * 1.3,
          hub,
          color: Math.floor(Math.random() * theme.palette.length),
        };
      });
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

    function spawnPulse() {
      if (nodes.length < 2 || pulses.length > 6) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (a === b || dist > 240 || dist < 40) return;
      pulses.push({
        a,
        b,
        t: 0,
        speed: 0.008 + Math.random() * 0.007,
        alt: Math.random() < 0.4,
      });
    }

    function drawFrame(dt) {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 155;

      // move nodes (wrap around edges)
      if (dt) {
        for (const n of nodes) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          if (n.x < -24) n.x = width + 24;
          if (n.x > width + 24) n.x = -24;
          if (n.y < -24) n.y = height + 24;
          if (n.y > height + 24) n.y = -24;
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

      // nodes — soft glow halo + crisp core
      for (const n of nodes) {
        const rgb = theme.palette[n.color];
        const glow = n.hub ? theme.glowAlpha * 1.8 : theme.glowAlpha;
        ctx.fillStyle = `rgba(${rgb}, ${glow})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${rgb}, ${n.hub ? Math.min(1, theme.nodeAlpha + 0.2) : theme.nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // subtle ring on hub nodes
        if (n.hub) {
          ctx.strokeStyle = `rgba(${rgb}, ${theme.nodeAlpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 3.5, 0, Math.PI * 2);
          ctx.stroke();
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
        const rgb = p.alt ? theme.pulseAlt : theme.pulse;
        ctx.fillStyle = `rgba(${rgb}, ${0.16 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${rgb}, ${0.7 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let last = performance.now();
    let pulseTimer = 0;

    function loop(now) {
      if (!running) return;
      const dt = Math.min(now - last, 50);
      last = now;
      pulseTimer += dt;
      if (pulseTimer > 700) {
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
