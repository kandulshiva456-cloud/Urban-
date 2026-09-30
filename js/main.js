/* =============================================================================
   js/main.js — shared chrome and helpers
   -----------------------------------------------------------------------------
   · UM.util  — escaping, formatting, icon hydration
   · UM.tz    — Asia/Kolkata date & time rules used by the booking wizard
   · Page behaviour: sticky header, mobile drawer, reveal-on-scroll, FAQ,
     gallery lightbox, hero video, mobile action bar, toasts
   Initialise is idempotent — it is safe to call from any page.
   ========================================================================== */
(function (global) {
    "use strict";

    var UM = global.UM = global.UM || {};
    var CFG = UM.BUSINESS_CONFIG || {};

    /* =========================================================================
       DOM helpers
       ====================================================================== */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function on(el, type, fn, opts) { if (el) el.addEventListener(type, fn, opts); }

    function delegate(root, type, sel, fn) {
        on(root, type, function (e) {
            var t = e.target.closest ? e.target.closest(sel) : null;
            if (t && root.contains(t)) fn.call(t, e, t);
        });
    }

    function ready(fn) {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
        else fn();
    }

    /* =========================================================================
       Icons — inline SVG, stroke-based (viewBox 0 0 24 24)
       ====================================================================== */
    var ICONS = {
        phone: ['<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'],
        whatsapp: ['<path fill="currentColor" stroke="none" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.06c-.25.69-1.45 1.32-2 1.4-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.63-2.98-1.29-4.92-4.28-5.07-4.48-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.25.6.84 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.41Z"/>'],
        mail: ['<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'],
        pin: ['<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/>'],
        clock: ['<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
        check: ['<path d="M4 12.5 9 17.5 20 6.5"/>'],
        checkCircle: ['<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'],
        close: ['<path d="M6 6l12 12"/><path d="M18 6 6 18"/>'],
        closeCircle: ['<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6"/><path d="M15 9l-6 6"/>'],
        arrow: ['<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'],
        arrowLeft: ['<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'],
        chevron: ['<path d="m6 9 6 6 6-6"/>'],
        chevronRight: ['<path d="m9 6 6 6-6 6"/>'],
        plus: ['<path d="M12 5v14"/><path d="M5 12h14"/>'],
        minus: ['<path d="M5 12h14"/>'],
        shield: ['<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>'],
        shieldCheck: ['<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'],
        sparkles: ['<path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6l4.4-1.6Z"/><path d="m18.5 15 .7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7Z"/>'],
        sparkle: ['<path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6l4.4-1.6Z"/><path d="m18.5 15 .7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7Z"/>'],
        droplet: ['<path d="M12 2.7 17.7 8.4a8 8 0 1 1-11.4 0Z"/>'],
        drop: ['<path d="M12 2.7 17.7 8.4a8 8 0 1 1-11.4 0Z"/>'],
        leaf: ['<path d="M11 20A7 7 0 0 1 4 13C4 7 11 4 20 4c0 9-3 16-9 16Z"/><path d="M4 20c3-4 6.5-6.5 11-8"/>'],
        lotus: ['<path d="M12 21c-4 0-7-2.5-7-6 1.6-.6 3.4-.3 4.7.8"/><path d="M12 21c4 0 7-2.5 7-6-1.6-.6-3.4-.3-4.7.8"/><path d="M12 21c-2.8-2.6-3.6-6.3-2.2-9.4 1 .6 1.9 1.6 2.2 2.8.3-1.2 1.2-2.2 2.2-2.8 1.4 3.1.6 6.8-2.2 9.4Z"/><path d="M12 5.5c1.4 1.5 2 3.4 1.7 5.3M12 5.5c-1.4 1.5-2 3.4-1.7 5.3"/>'],
        calendar: ['<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 11h18"/>'],
        user: ['<circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>'],
        users: ['<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'],
        briefcase: ['<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'],
        book: ['<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>'],
        info: ['<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v5h1"/>'],
        alert: ['<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/>'],
        home: ['<path d="m3 10.5 9-7.5 9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'],
        building: ['<rect x="4" y="3" width="12" height="18"/><path d="M16 9h4v12h-4"/><path d="M8 7h2"/><path d="M12 7h1"/><path d="M8 11h2"/><path d="M12 11h1"/><path d="M8 15h2"/><path d="M12 15h1"/><path d="M2 21h20"/>'],
        star: ['<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.9l-5.4 2-.4-6.1-4.4-4.3 6.1-.9Z"/>'],
        starFill: ['<path fill="currentColor" stroke="none" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.9l-5.4 2-.4-6.1-4.4-4.3 6.1-.9Z"/>'],
        play: ['<path d="M8 5.5v13l11-6.5Z"/>'],
        send: ['<path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/>'],
        upload: ['<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>'],
        refresh: ['<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'],
        edit: ['<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>'],
        tag: ['<path d="M20.6 13.4 12 22l-9-9V4a1 1 0 0 1 1-1h9Z"/><path d="M7.5 7.5h.01"/>'],
        sun: ['<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>'],
        moon: ['<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>'],
        handHeart: ['<path d="M11 14.5 8.6 12a1.8 1.8 0 0 1 2.6-2.6l1.3 1.3 1.4-1.4a1.8 1.8 0 0 1 2.6 2.6L14 14.5"/><path d="M3 13.5 6.5 17c.6.6 1.4.9 2.2.9H16a3 3 0 0 0 3-3v-1.2a1.8 1.8 0 0 0-3-1.4l-1.6 1.4"/><path d="M3 13.5V20h9.5"/>'],
        spa: ['<path d="M12 21c-3.5 0-6-2.2-6-5.3 2.3 1 4.6 1 6-.5 1.4 1.5 3.7 1.5 6 .5 0 3.1-2.5 5.3-6 5.3Z"/><path d="M12 15.2c-.8-2.4-2.6-4.3-5-5.3 0 3.3 2.1 5.9 5 7"/><path d="M12 15.2c.8-2.4 2.6-4.3 5-5.3 0 3.3-2.1 5.9-5 7"/><path d="M12 3v6"/>'],
        location: ['<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/>'],
        image: ['<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-6 6-3-3-4 4"/>'],
        instagram: ['<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>'],
        facebook: ['<path fill="currentColor" stroke="none" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.2Z"/>'],
        google: ['<path d="M21 12.2c0-.7-.1-1.5-.3-2.2H12v4.2h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.2 2.7-7.3Z" fill="currentColor" stroke="none"/><path d="M12 21c2.6 0 4.8-.9 6.3-2.5l-3.1-2.4c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.7-5.3-4h-3.2v2.5A9.5 9.5 0 0 0 12 21Z" fill="currentColor" stroke="none" opacity=".72"/><path d="M6.7 13c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6.5H3.5A9.5 9.5 0 0 0 2.5 11c0 1.6.4 3.1 1 4.5L6.7 13Z" fill="currentColor" stroke="none" opacity=".52"/><path d="M12 5.8c1.4 0 2.7.5 3.7 1.4l2.7-2.7C16.8 2.9 14.6 2 12 2a9.5 9.5 0 0 0-8.5 5.2L6.7 9c.7-1.9 2.8-3.2 5.3-3.2Z" fill="currentColor" stroke="none" opacity=".9"/>'],
        whatsappOutline: ['<path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.2-5.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.7 9.2c.4 2.5 2.4 4.6 5 5.1l1-1.4 1.7.8-.4 1.6c-3.7.5-7.7-3.4-7.2-7.2l1.6-.4.8 1.7Z"/>']
    };

    function icon(name) {
        var paths = ICONS[name];
        if (!paths) paths = ICONS.info;
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            paths.join("") + "</svg>";
    }

    function hydrateIcons(root) {
        $$("[data-icon]", root).forEach(function (el) {
            if (el.firstElementChild && el.dataset.iconDone) return;
            el.innerHTML = icon(el.dataset.icon);
            el.dataset.iconDone = "1";
            el.setAttribute("aria-hidden", "true");
        });
    }

    function hydrateSocialLinks(root) {
        var socials = UM.SOCIALS || {};
        $$("[data-social]", root || document).forEach(function (el) {
            var key = el.getAttribute("data-social");
            if (socials[key]) el.setAttribute("href", socials[key]);
        });
    }

    function renderTestimonials() {
        var host = document.querySelector("[data-testimonials]");
        if (!host || !Array.isArray(UM.TESTIMONIALS) || !UM.TESTIMONIALS.length) return;
        host.innerHTML = UM.TESTIMONIALS.map(function (item) {
            return '<article class="testimonial" tabindex="0">' +
                '<div class="t-top"><span class="t-stars" aria-label="5 out of 5 stars">★★★★★</span><span class="t-source"><span data-icon="google"></span> Google Review</span></div>' +
                '<blockquote>“' + escapeHtml(item.text) + '”</blockquote>' +
                '<cite>' + escapeHtml(item.name) + '<span>' + escapeHtml(item.meta) + '</span></cite>' +
                '</article>';
        }).join("");
        hydrateIcons(host);
    }

    function initTestimonialCarousel() {
        var host = document.querySelector("[data-testimonials]");
        if (!host) return;
        var cards = $$(".testimonial", host);
        var prev = document.querySelector("[data-review-prev]");
        var next = document.querySelector("[data-review-next]");
        var dots = document.querySelector("[data-review-dots]");
        if (!cards.length) return;
        function show(index) {
            index = (index + cards.length) % cards.length;
            cards.forEach(function (c, i) { c.classList.toggle("is-active", i === index); });
            if (dots) {
                dots.innerHTML = cards.map(function (_, i) { return '<button type="button" aria-label="Show review ' + (i + 1) + '" class="review-dot' + (i === index ? ' is-active' : '') + '" data-review-dot="' + i + '"></button>'; }).join("");
                $$("[data-review-dot]", dots).forEach(function (d) { d.addEventListener("click", function () { show(Number(d.dataset.reviewDot)); }); });
            }
        }
        on(prev, "click", function () { var i = cards.findIndex(function (c) { return c.classList.contains("is-active"); }); show(i - 1); });
        on(next, "click", function () { var i = cards.findIndex(function (c) { return c.classList.contains("is-active"); }); show(i + 1); });
        show(0);
    }

    /* =========================================================================
       UM.util
       ====================================================================== */
    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function inr(amount) {
        if (typeof amount !== "number") return "";
        try {
            return "\u20B9" + amount.toLocaleString("en-IN");
        } catch (e) {
            return "\u20B9" + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }

    function durationLabel(minutes) { return minutes + " min"; }

    function serviceBySlug(slug) {
        var list = UM.SERVICES || [];
        for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return list[i];
        return null;
    }

    function fromPrice(service) {
        if (!service) return null;
        if (service.durations && service.durations.length) {
            return Math.min.apply(null, service.durations.map(function (d) { return d.price; }));
        }
        return service.price || null;
    }

    function durationSummary(service) {
        if (!service) return "";
        if (service.durations && service.durations.length) {
            if (service.durations.length === 1) return durationLabel(service.durations[0].minutes) + " session";
            return service.durations.map(function (d) { return d.minutes; }).join(" / ") + " minutes";
        }
        return service.durationNote || "";
    }

    function waLink(number, text) {
        var n = String(number || "").replace(/\D/g, "");
        return "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "");
    }

    function telLink(number) { return "tel:" + String(number || "").replace(/[^\d+]/g, ""); }

    function bookingLink(service) {
        return service ? "book.html?service=" + encodeURIComponent(service.slug) : "book.html";
    }

    /* =========================================================================
       UM.tz — Asia/Kolkata clock and booking-window rules
       ====================================================================== */
    var tz = (function () {
        var zone = (CFG.timezone) || "Asia/Kolkata";
        var partsFmt;
        try {
            partsFmt = new Intl.DateTimeFormat("en-US", {
                timeZone: zone, hour12: false,
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", weekday: "short"
            });
        } catch (e) { partsFmt = null; }

        function pad(n) { return (n < 10 ? "0" : "") + n; }

        function nowParts() {
            var d = new Date();
            if (partsFmt) {
                var map = {};
                partsFmt.formatToParts(d).forEach(function (p) { map[p.type] = p.value; });
                var hour = parseInt(map.hour, 10); if (hour === 24) hour = 0;
                return {
                    date: map.year + "-" + map.month + "-" + map.day,
                    time: pad(hour) + ":" + map.minute,
                    minutes: hour * 60 + parseInt(map.minute, 10),
                    weekday: map.weekday
                };
            }
            /* Fallback: assume local time is close enough */
            return {
                date: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
                time: pad(d.getHours()) + ":" + pad(d.getMinutes()),
                minutes: d.getHours() * 60 + d.getMinutes(),
                weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]
            };
        }

        function toMinutes(hhmm) {
            if (!hhmm) return NaN;
            var bits = String(hhmm).split(":");
            return parseInt(bits[0], 10) * 60 + parseInt(bits[1], 10);
        }

        function addDays(dateISO, n) {
            var d = new Date(dateISO + "T00:00:00Z");
            d.setUTCDate(d.getUTCDate() + n);
            return d.toISOString().slice(0, 10);
        }

        function calendar(dateISO) {
            var d = new Date(dateISO + "T00:00:00Z");
            return {
                dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()],
                day: d.getUTCDate(),
                month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()]
            };
        }

        function longDate(dateISO) {
            var c = calendar(dateISO);
            var d = new Date(dateISO + "T00:00:00Z");
            var full = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()];
            var monFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getUTCMonth()];
            return full + ", " + c.day + " " + monFull;
        }

        /* True when HH:MM on dateISO is inside opening hours AND far enough ahead. */
        function timeAllowed(dateISO, hhmm) {
            var mins = toMinutes(hhmm);
            if (isNaN(mins)) return false;
            var open = (CFG.openingHour || 7) * 60;
            var close = (CFG.closingHour || 23) * 60;
            if (mins < open || mins >= close) return false;

            var now = nowParts();
            if (dateISO < now.date) return false;
            if (dateISO === now.date) {
                return mins >= now.minutes + (CFG.minimumBookingNoticeMinutes || 0);
            }
            return true;
        }

        function dateOptions(count) {
            var now = nowParts();
            var opts = [];
            for (var i = 0; i < count; i++) {
                var iso = addDays(now.date, i);
                var c = calendar(iso);
                opts.push({
                    iso: iso,
                    relative: i === 0 ? "Today" : (i === 1 ? "Tmrw" : c.dow),
                    dow: c.dow,
                    day: c.day,
                    month: c.month,
                    long: longDate(iso)
                });
            }
            return opts;
        }

        function timeGroups(dateISO) {
            var now = nowParts();
            var open = (CFG.openingHour || 7) * 60;
            var close = (CFG.closingHour || 23) * 60;
            var groups = [
                { name: "Morning", icon: "sun", times: [] },
                { name: "Afternoon", icon: "sparkles", times: [] },
                { name: "Evening", icon: "moon", times: [] }
            ];
            for (var m = open; m < close; m += 30) {
                var hh = Math.floor(m / 60), mm = m % 60;
                var label = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
                var ok = timeAllowed(dateISO, label);
                var entry = { label: label, enabled: ok };
                if (hh < 12) groups[0].times.push(entry);
                else if (hh < 17) groups[1].times.push(entry);
                else groups[2].times.push(entry);
            }
            return groups;
        }

        return {
            zone: zone,
            now: nowParts,
            toMinutes: toMinutes,
            addDays: addDays,
            calendar: calendar,
            longDate: longDate,
            timeAllowed: timeAllowed,
            dateOptions: dateOptions,
            timeGroups: timeGroups
        };
    })();

    /* =========================================================================
       Header / mobile navigation
       ====================================================================== */
    function initHeader() {
        var header = $(".site-header");
        var toggle = $(".nav-toggle");
        var drawer = $(".mobile-nav");

        if (header) {
            var solidify = function () {
                header.classList.toggle("is-solid", window.scrollY > 24);
            };
            solidify();
            on(window, "scroll", solidify, { passive: true });
        }

        function setDrawer(open) {
            if (!toggle || !drawer) return;
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            drawer.classList.toggle("is-open", open);
            document.body.classList.toggle("nav-open", open);
            if (open) {
                var first = drawer.querySelector("a, button");
                if (first) first.focus({ preventScroll: true });
            }
        }

        if (toggle) {
            on(toggle, "click", function () {
                setDrawer(toggle.getAttribute("aria-expanded") !== "true");
            });
        }
        if (drawer) {
            delegate(drawer, "click", "a", function () { setDrawer(false); });
        }
        on(document, "keydown", function (e) {
            if (e.key === "Escape") setDrawer(false);
        });

        /* Mark the current page in both navs */
        var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
        if (!here || here === "") here = "index.html";
        $$("a[data-nav]").forEach(function (a) {
            var target = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
            if (target === here) a.setAttribute("aria-current", "page");
        });
        $$("a[href]").forEach(function (a) {
            var href = a.getAttribute("href");
            if (!href || href.charAt(0) === "#" || /^(https?:|tel:|mailto:)/.test(href)) return;
            var target = href.split("/").pop().split("?")[0].toLowerCase();
            if (target && target === here) a.setAttribute("aria-current", "page");
        });
    }

    /* =========================================================================
       Mobile action bar
       ====================================================================== */
    function initStickyBar() {
        var bar = $(".sticky-bar");
        if (!bar) return;
        var sync = function () {
            bar.classList.toggle("is-visible", window.scrollY > 420);
        };
        sync();
        on(window, "scroll", sync, { passive: true });
    }

    /* =========================================================================
       Reveal on scroll
       ====================================================================== */
    function initReveal() {
        var items = $$(".reveal");
        if (!items.length) return;

        var reduce = false;
        try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

        if (reduce || !("IntersectionObserver" in window)) {
            items.forEach(function (el) { el.classList.add("is-revealed"); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.dataset.delay || "0", 10);
                if (delay) el.style.setProperty("--reveal-delay", delay + "ms");
                el.classList.add("is-revealed");
                io.unobserve(el);
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });

        items.forEach(function (el) { io.observe(el); });
    }

    /* =========================================================================
       FAQ accordions (details/summary)
       ====================================================================== */
    function initFaq() {
        $$("[data-faq]").forEach(function (list) {
            var items = $$("details", list);
            items.forEach(function (d) {
                var sync = function () { d.classList.toggle("is-open", d.open); };
                sync();
                on(d, "toggle", function () {
                    if (d.open) items.forEach(function (other) { if (other !== d) other.open = false; });
                    items.forEach(function (other) { other.classList.toggle("is-open", other.open); });
                });
                var summary = d.querySelector("summary");
                if (summary && !summary.querySelector(".faq-icon")) {
                    var span = document.createElement("span");
                    span.className = "faq-icon";
                    span.setAttribute("data-icon", "plus");
                    summary.appendChild(span);
                    hydrateIcons(summary);
                }
                sync();
            });
        });
    }

    /* =========================================================================
       Gallery lightbox
       ====================================================================== */
    function initLightbox() {
        var items = $$("[data-lightbox-item]");
        if (!items.length) return;

        var box = document.createElement("div");
        box.className = "lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Image viewer");
        box.innerHTML =
            '<figure><img alt="">' +
            "<figcaption></figcaption></figure>" +
            '<button type="button" class="lightbox-close" aria-label="Close"><span data-icon="close"></span></button>' +
            '<button type="button" class="lightbox-prev" aria-label="Previous image"><span data-icon="arrowLeft"></span></button>' +
            '<button type="button" class="lightbox-next" aria-label="Next image"><span data-icon="arrow"></span></button>';
        document.body.appendChild(box);
        hydrateIcons(box);

        var img = box.querySelector("img");
        var cap = box.querySelector("figcaption");
        var index = 0;

        function show(i) {
            index = (i + items.length) % items.length;
            var source = items[index];
            var target = source.tagName === "IMG" ? source : source.querySelector("img");
            if (!target) return;
            img.src = target.currentSrc || target.src;
            img.alt = target.alt || "";
            cap.textContent = target.alt || "";
        }

        function open(i) {
            show(i);
            box.classList.add("is-open");
            document.body.classList.add("modal-open");
            box.querySelector(".lightbox-close").focus();
        }

        function close() {
            box.classList.remove("is-open");
            document.body.classList.remove("modal-open");
        }

        items.forEach(function (el, i) {
            el.addEventListener("click", function (e) { e.preventDefault(); open(i); });
        });

        on(box.querySelector(".lightbox-close"), "click", close);
        on(box.querySelector(".lightbox-prev"), "click", function () { show(index - 1); });
        on(box.querySelector(".lightbox-next"), "click", function () { show(index + 1); });
        on(box, "click", function (e) { if (e.target === box) close(); });
        on(document, "keydown", function (e) {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") show(index - 1);
            if (e.key === "ArrowRight") show(index + 1);
        });
    }

    /* =========================================================================
       Hero video — desktop loop, mobile loop, reduced-motion poster
       ====================================================================== */
    function initHeroVideo() {
        var stage = $("[data-hero-video]");
        if (!stage || !CFG.hero || !CFG.hero.enabled) return;

        var reduce = false;
        try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
        if (reduce) return;

        var video = document.createElement("video");
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.preload = "metadata";
        video.setAttribute("aria-hidden", "true");

        var small = window.matchMedia("(max-width: 760px)").matches;
        video.src = (small && CFG.hero.videoSmall) ? CFG.hero.videoSmall : CFG.hero.video;
        stage.appendChild(video);

        var tryPlay = function () {
            var p = video.play();
            if (p && p.catch) p.catch(function () { /* poster remains */ });
        };
        tryPlay();

        on(document, "visibilitychange", function () {
            if (document.hidden) video.pause();
            else tryPlay();
        });

        if ("IntersectionObserver" in window && stage.closest) {
            var hero = stage.closest(".hero");
            if (hero) {
                new IntersectionObserver(function (entries) {
                    entries.forEach(function (en) {
                        if (en.isIntersecting) tryPlay();
                        else video.pause();
                    });
                }, { threshold: .1 }).observe(hero);
            }
        }
    }

    /* =========================================================================
       Toast
       ====================================================================== */
    function toast(message, iconName) {
        var el = $(".toast");
        if (!el) {
            el = document.createElement("div");
            el.className = "toast";
            el.setAttribute("role", "status");
            el.setAttribute("aria-live", "polite");
            document.body.appendChild(el);
        }
        el.innerHTML = '<span data-icon="' + (iconName || "info") + '"></span><span></span>';
        el.lastElementChild.textContent = message;
        hydrateIcons(el);
        el.classList.add("is-visible");
        clearTimeout(el._timer);
        el._timer = setTimeout(function () { el.classList.remove("is-visible"); }, 5200);
    }

    /* =========================================================================
       Small page chrome
       ====================================================================== */
    function initYear() {
        $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    }

    function initAutoTel() {
        $$("[data-phone-link]").forEach(function (el) {
            var num = el.dataset.phoneLink || (CFG.phones || [])[0];
            el.setAttribute("href", telLink(num));
        });

        $$("[data-phone-text]").forEach(function (el) {
            var num = el.dataset.phoneText || (CFG.phones || [])[0];
            el.textContent = num ? "+91 " + String(num).replace(/(\d{5})(\d{5})/, "$1 $2") : "";
        });

        $$("[data-address]").forEach(function (el) {
            if (CFG.address) el.textContent = CFG.address.line;
        });

        $$("[data-opening-hours]").forEach(function (el) {
            if (CFG.openingHours) el.textContent = CFG.openingHours;
        });

        $$("[data-email-link]").forEach(function (el) {
            el.setAttribute("href", "mailto:" + CFG.email);
            if (!el.textContent.trim()) el.textContent = CFG.email;
        });

        $$("[data-whatsapp-link]").forEach(function (el) {
            var num = el.dataset.whatsappLink || CFG.whatsapp;
            var text = el.dataset.whatsappMessage || el.dataset.waText || "";
            el.setAttribute("href", waLink(num, text));
            if (el.hasAttribute("data-wa-blank") || el.hasAttribute("data-whatsapp-message")) {
                el.setAttribute("target", "_blank");
                el.setAttribute("rel", "noopener");
            }
        });

        $$("[data-map-link]").forEach(function (el) {
            if (CFG.googleMapsUrl) {
                el.setAttribute("href", CFG.googleMapsUrl);
            } else {
                el.setAttribute("href", "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(CFG.address ? CFG.address.line : CFG.name));
            }
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener");
        });
    }

    /* =========================================================================
       Boot
       ====================================================================== */
    function init() {
        hydrateIcons(document);
        hydrateSocialLinks(document);
        renderTestimonials();
        initTestimonialCarousel();
        initYear();
        initHeader();
        initStickyBar();
        initReveal();
        initFaq();
        initLightbox();
        initHeroVideo();
        initAutoTel();
        if (typeof UM.validateConfig === "function") UM.validateConfig();
    }

    /* Public surface */
    UM.$ = $;
    UM.$$ = $$;
    UM.on = on;
    UM.delegate = delegate;
    UM.ready = ready;
    UM.icon = icon;
    UM.util = {
        escapeHtml: escapeHtml,
        inr: inr,
        icon: icon,
        hydrateIcons: hydrateIcons,
        durationLabel: durationLabel,
        serviceBySlug: serviceBySlug,
        fromPrice: fromPrice,
        durationSummary: durationSummary,
        waLink: waLink,
        telLink: telLink,
        bookingLink: bookingLink
    };
    UM.tz = tz;
    UM.toast = toast;
    UM.init = init;

    ready(init);

})(window);
