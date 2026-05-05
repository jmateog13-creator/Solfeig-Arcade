/* ============================================================================
   ASTRO-EXPRESS · MOTOR VFX
   - Post-processing amb canvas offscreen (bloom)
   - Sistema de partícules multi-capa (sparks, smoke, light streaks, ripples)
   - Renderitzat de formes geomètriques accessibles per andana
   ============================================================================ */

'use strict';

const VFX = {
    bloomCanvas: null,
    bloomCtx: null,
    particles: [],
    ripples: [],
    streaks: [],
    floatingTexts: []
};

// Inicialitza el canvas de bloom (offscreen → blur via filter → composite screen)
function vfxInit(bloomCanvas) {
    VFX.bloomCanvas = bloomCanvas;
    VFX.bloomCtx = bloomCanvas.getContext('2d');
}

function vfxResize() {
    if (!VFX.bloomCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    VFX.bloomCanvas.width = window.innerWidth * dpr;
    VFX.bloomCanvas.height = window.innerHeight * dpr;
    VFX.bloomCanvas.style.width = window.innerWidth + 'px';
    VFX.bloomCanvas.style.height = window.innerHeight + 'px';
    VFX.bloomCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ============================================================================
// SISTEMA DE PARTÍCULES MULTI-CAPA
// Tipus:
//   'spark' — chispa ràpida amb decay (col·lisió)
//   'glow' — partícula gran difusa (èxit)
//   'streak' — línia curta veloç (hipervelocitat)
//   'debris' — fragment amb gravetat (col·lisió pesada)
//   'ember' — espurna lenta amunt (combo)
// ============================================================================
function spawnParticles(x, y, opts) {
    const config = {
        count: opts.count || 20,
        type: opts.type || 'spark',
        color: opts.color || '#00f0ff',
        spread: opts.spread || 1,
        speed: opts.speed || 200,
        life: opts.life || 1,
        gravity: opts.gravity || 0
    };

    for (let i = 0; i < config.count; i++) {
        const angle = opts.angle !== undefined
            ? opts.angle + (Math.random() - 0.5) * config.spread * Math.PI
            : Math.random() * Math.PI * 2;
        const speedMul = 0.4 + Math.random() * 0.8;
        VFX.particles.push({
            x, y,
            vx: Math.cos(angle) * config.speed * speedMul,
            vy: Math.sin(angle) * config.speed * speedMul,
            life: config.life * (0.6 + Math.random() * 0.5),
            maxLife: config.life,
            color: config.color,
            type: config.type,
            size: config.type === 'glow' ? 4 + Math.random() * 6 : 1.5 + Math.random() * 2.5,
            gravity: config.gravity,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 8
        });
    }
}

function spawnRipple(x, y, color, maxRadius = 120, duration = 0.8) {
    VFX.ripples.push({
        x, y, color,
        radius: 0,
        maxRadius,
        life: duration,
        maxLife: duration
    });
}

function spawnStreak(x, y, angle, length, color) {
    VFX.streaks.push({
        x, y, angle, length, color,
        life: 0.4,
        maxLife: 0.4
    });
}

function spawnFloatingText(x, y, text, color, opts = {}) {
    VFX.floatingTexts.push({
        x, y, text, color,
        life: opts.life || 1.0,
        maxLife: opts.life || 1.0,
        size: opts.size || 22,
        vy: opts.vy !== undefined ? opts.vy : -60
    });
}

// ============================================================================
// UPDATE
// ============================================================================
function vfxUpdate(dt) {
    // Partícules
    for (let i = VFX.particles.length - 1; i >= 0; i--) {
        const p = VFX.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.gravity * dt;
        p.life -= dt;
        p.rotation += p.rotationSpeed * dt;
        if (p.type === 'spark') p.vx *= 0.96, p.vy *= 0.96;
        if (p.type === 'ember') p.vy -= 30 * dt; // empenta amunt
        if (p.life <= 0) VFX.particles.splice(i, 1);
    }

    // Ripples
    for (let i = VFX.ripples.length - 1; i >= 0; i--) {
        const r = VFX.ripples[i];
        const t = 1 - r.life / r.maxLife;
        r.radius = r.maxRadius * easeOutCubic(t);
        r.life -= dt;
        if (r.life <= 0) VFX.ripples.splice(i, 1);
    }

    // Streaks
    for (let i = VFX.streaks.length - 1; i >= 0; i--) {
        const s = VFX.streaks[i];
        s.life -= dt;
        if (s.life <= 0) VFX.streaks.splice(i, 1);
    }

    // Floating text
    for (let i = VFX.floatingTexts.length - 1; i >= 0; i--) {
        const f = VFX.floatingTexts[i];
        f.y += f.vy * dt;
        f.vy *= 0.96;
        f.life -= dt;
        if (f.life <= 0) VFX.floatingTexts.splice(i, 1);
    }
}

// ============================================================================
// RENDER (al canvas principal i al de bloom)
// ============================================================================
function vfxRender(ctx, bloomCtx, bloomEnabled) {
    // === Capa principal (línies primes, núcli) ===
    ctx.save();

    // Streaks
    for (const s of VFX.streaks) {
        const a = s.life / s.maxLife;
        ctx.strokeStyle = hexToRgba(s.color, a);
        ctx.lineWidth = 2 * a;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + Math.cos(s.angle) * s.length, s.y + Math.sin(s.angle) * s.length);
        ctx.stroke();
    }

    // Ripples
    for (const r of VFX.ripples) {
        const a = r.life / r.maxLife;
        ctx.strokeStyle = hexToRgba(r.color, a * 0.7);
        ctx.lineWidth = 3 * a;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Partícules (tipus per tipus)
    for (const p of VFX.particles) {
        const a = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = hexToRgba(p.color, a);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.type === 'glow' ? 16 : 8;

        if (p.type === 'debris') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillRect(-p.size, -p.size * 0.3, p.size * 2, p.size * 0.6);
            ctx.restore();
        } else if (p.type === 'glow') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * a * 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Floating texts (combo, +punts)
    for (const f of VFX.floatingTexts) {
        const a = Math.max(0, f.life / f.maxLife);
        ctx.fillStyle = hexToRgba(f.color, a);
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 20;
        ctx.font = `bold ${f.size}px "Orbitron", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(f.text, f.x, f.y);
    }

    ctx.restore();

    // === Capa de bloom: dibuixa només els elements brillants amb halo ===
    if (bloomEnabled && bloomCtx) {
        // Net amb fade per acumular un trail subtil
        bloomCtx.save();
        bloomCtx.globalCompositeOperation = 'destination-out';
        bloomCtx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        bloomCtx.fillRect(0, 0, bloomCtx.canvas.width, bloomCtx.canvas.height);
        bloomCtx.restore();

        // El bloom es dibuixa amb filter blur via CSS al pròpi canvas
        // Aquí pintem versions amplificades dels elements brillants
        bloomCtx.save();
        bloomCtx.globalCompositeOperation = 'lighter';
        bloomCtx.filter = 'blur(8px)';

        for (const r of VFX.ripples) {
            const a = r.life / r.maxLife;
            bloomCtx.strokeStyle = hexToRgba(r.color, a * 0.9);
            bloomCtx.lineWidth = 6 * a;
            bloomCtx.beginPath();
            bloomCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            bloomCtx.stroke();
        }

        for (const p of VFX.particles) {
            if (p.type === 'spark' || p.type === 'glow' || p.type === 'ember') {
                const a = Math.max(0, p.life / p.maxLife);
                bloomCtx.fillStyle = hexToRgba(p.color, a * 0.8);
                bloomCtx.beginPath();
                bloomCtx.arc(p.x, p.y, p.size * a * 2.5, 0, Math.PI * 2);
                bloomCtx.fill();
            }
        }

        for (const s of VFX.streaks) {
            const a = s.life / s.maxLife;
            bloomCtx.strokeStyle = hexToRgba(s.color, a * 0.9);
            bloomCtx.lineWidth = 5 * a;
            bloomCtx.beginPath();
            bloomCtx.moveTo(s.x, s.y);
            bloomCtx.lineTo(s.x + Math.cos(s.angle) * s.length, s.y + Math.sin(s.angle) * s.length);
            bloomCtx.stroke();
        }

        bloomCtx.filter = 'none';
        bloomCtx.restore();
    }
}

function vfxClearBloom() {
    if (!VFX.bloomCtx) return;
    const c = VFX.bloomCtx.canvas;
    VFX.bloomCtx.clearRect(0, 0, c.width, c.height);
}

function vfxClear() {
    VFX.particles = [];
    VFX.ripples = [];
    VFX.streaks = [];
    VFX.floatingTexts = [];
    vfxClearBloom();
}

// ============================================================================
// FORMES ACCESSIBLES PER ANDANA (alternativa al color)
// DO=cercle, RE=triangle, MI=quadrat, FA=pentàgon, SOL=hexàgon, LA=diamant, SI=estrella
// ============================================================================
function drawShape(ctx, type, x, y, size, color, glow = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 0.6;
    }
    ctx.lineWidth = 2;

    switch (type) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'triangle':
            polygon(ctx, 3, size, -Math.PI / 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(-size, -size, size * 2, size * 2);
            break;
        case 'pentagon':
            polygon(ctx, 5, size, -Math.PI / 2);
            ctx.fill();
            break;
        case 'hexagon':
            polygon(ctx, 6, size, 0);
            ctx.fill();
            break;
        case 'diamond':
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.closePath();
            ctx.fill();
            break;
        case 'star':
            star(ctx, 5, size, size * 0.4, -Math.PI / 2);
            ctx.fill();
            break;
    }
    ctx.restore();
}

function polygon(ctx, sides, radius, rotation) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const a = rotation + (i * Math.PI * 2) / sides;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}

function star(ctx, points, outerR, innerR, rotation) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = rotation + (i * Math.PI) / points;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}

// ============================================================================
// HELPERS
// ============================================================================
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t) { return t * t * t; }
function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function hexToRgba(hex, a) {
    if (hex.startsWith('rgba')) return hex;
    if (hex.startsWith('rgb')) {
        return hex.replace('rgb(', 'rgba(').replace(')', `, ${a})`);
    }
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Aberració cromàtica: dibuixa text amb separació RGB
function chromaticText(ctx, text, x, y, size, intensity = 4) {
    ctx.save();
    ctx.font = `bold ${size}px "Orbitron", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 0, 80, 0.7)';
    ctx.fillText(text, x - intensity, y);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.fillText(text, x + intensity, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
}
