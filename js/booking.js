/* =============================================================================
   js/booking.js — 7-step appointment REQUEST wizard
   -----------------------------------------------------------------------------
   Steps: Service → Duration → Location → Date → Time → Details → Review
   The wizard never claims availability. It validates opening hours + notice
   period, keeps state in sessionStorage (`um.booking.v1`), then hands the
   visitor to WhatsApp so the team can confirm the appointment.

   Deep links:  book.html?service=slug&duration=60
   ========================================================================== */
(function (global) {
    "use strict";

    var UM = global.UM = global.UM || {};
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    var STORAGE_KEY = "um.booking.v1";
    var STEP_TITLES = [
        "Choose your service",
        "Choose your duration",
        "Choose your location",
        "Choose your preferred date",
        "Choose a preferred time",
        "Your details",
        "Review your appointment"
    ];
    var LOCATIONS = [
        {
            id: "centre",
            title: "Centre visit",
            meta: "Urban Man, Belleza Blue, Keshav Nagar",
            desc: "Visit us at the centre — walk in to a calm, private treatment room."
        },
        {
            id: "home",
            title: "Home service",
            meta: "Subject to availability",
            desc: "Request the therapist at your address — confirmed on WhatsApp."
        }
    ];

    var state;
    var root;
    var step = 1;
    var locked = false;

    /* -------------------------------------------------------------------------
       State
       ---------------------------------------------------------------------- */
    function blankState() {
        return {
            serviceSlug: null,
            durationMinutes: null,
            durationNote: null,
            location: null,
            date: null,
            time: null,
            name: "",
            phone: "",
            note: ""
        };
    }

    function load() {
        var data = blankState();
        try {
            var raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                Object.keys(data).forEach(function (k) {
                    if (typeof parsed[k] !== "undefined") data[k] = parsed[k];
                });
            }
        } catch (e) {}
        return data;
    }

    function save() {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function service() { return state.serviceSlug ? UM.util.serviceBySlug(state.serviceSlug) : null; }

    function price() {
        var s = service();
        if (!s) return null;
        if (s.durations && s.durations.length) {
            if (state.durationMinutes) {
                for (var i = 0; i < s.durations.length; i++) {
                    if (s.durations[i].minutes === state.durationMinutes) return s.durations[i].price;
                }
            }
            return UM.util.fromPrice(s);
        }
        return s.price || null;
    }

    /* -------------------------------------------------------------------------
       Rendering — services, durations, locations, dates, times
       ---------------------------------------------------------------------- */
    function renderServices() {
        var host = $("[data-bk-services]");
        if (!host) return;
        host.innerHTML = (UM.SERVICES || []).map(function (s) {
            var selected = state.serviceSlug === s.slug;
            return '<button type="button" class="bk-choice' + (selected ? " is-selected" : "") +
                '" data-service="' + UM.util.escapeHtml(s.slug) + '" aria-pressed="' + (selected ? "true" : "false") + '">' +
                '<span class="bc-check" data-icon="check"></span>' +
                '<span class="bc-meta">' + UM.util.escapeHtml(s.category) + "</span>" +
                '<span class="bc-title">' + UM.util.escapeHtml(s.name) + "</span>" +
                '<span class="bc-desc">' + UM.util.escapeHtml(s.short) + "</span>" +
                '<span class="bc-price">' + formatFrom(s) + "</span>" +
                "</button>";
        }).join("");
        UM.util.hydrateIcons(host);
    }

    function formatFrom(s) {
        var p = UM.util.fromPrice(s);
        if (!p) return UM.util.escapeHtml(s.durationNote || "");
        if (s.durations && s.durations.length > 1) return "From " + UM.util.inr(p);
        return UM.util.inr(p);
    }

    function renderDurations() {
        var host = $("[data-bk-durations]");
        if (!host) return;
        var s = service();

        if (!s) { host.innerHTML = ""; return; }

        if (!s.durations || !s.durations.length) {
            host.innerHTML = '<div class="notice" style="grid-column:1/-1">' +
                '<span data-icon="info"></span><span>' + UM.util.escapeHtml(s.durationNote || "Duration not currently confirmed.") + "</span></div>";
            UM.util.hydrateIcons(host);
            return;
        }

        host.innerHTML = s.durations.map(function (d) {
            var selected = state.durationMinutes === d.minutes;
            return '<button type="button" class="bk-choice' + (selected ? " is-selected" : "") +
                '" data-duration="' + d.minutes + '" aria-pressed="' + (selected ? "true" : "false") + '">' +
                '<span class="bc-check" data-icon="check"></span>' +
                '<span class="bc-title">' + d.minutes + " min</span>" +
                '<span class="bc-price">' + UM.util.inr(d.price) + "</span>" +
                "</button>";
        }).join("");
        UM.util.hydrateIcons(host);
    }

    function renderLocations() {
        var host = $("[data-bk-locations]");
        if (!host) return;
        host.innerHTML = LOCATIONS.map(function (l) {
            var selected = state.location === l.id;
            return '<button type="button" class="bk-choice' + (selected ? " is-selected" : "") +
                '" data-location="' + l.id + '" aria-pressed="' + (selected ? "true" : "false") + '">' +
                '<span class="bc-check" data-icon="check"></span>' +
                '<span class="bc-meta">' + UM.util.escapeHtml(l.meta) + "</span>" +
                '<span class="bc-title">' + UM.util.escapeHtml(l.title) + "</span>" +
                '<span class="bc-desc">' + UM.util.escapeHtml(l.desc) + "</span>" +
                "</button>";
        }).join("");
        UM.util.hydrateIcons(host);
    }

    function renderDates() {
        var host = $("[data-bk-dates]");
        if (!host) return;
        var options = UM.tz.dateOptions(7);
        if (!state.date) state.date = options[0].iso;

        host.innerHTML = options.map(function (o) {
            var selected = state.date === o.iso;
            return '<button type="button" class="date-pill' + (selected ? " is-selected" : "") +
                '" data-date="' + o.iso + '" aria-pressed="' + (selected ? "true" : "false") + '" ' +
                'aria-label="' + UM.util.escapeHtml(o.long) + '">' +
                '<span class="dp-day">' + o.relative + "</span>" +
                '<span class="dp-num">' + o.day + "</span>" +
                '<span class="dp-mon">' + o.month + "</span>" +
                "</button>";
        }).join("");
    }

    function renderTimes() {
        var host = $("[data-bk-times]");
        if (!host) return;
        if (!state.date) state.date = UM.tz.dateOptions(1)[0].iso;

        var groups = UM.tz.timeGroups(state.date);
        host.innerHTML = groups.map(function (g) {
            if (!g.times.length) return "";
            return '<div class="bk-time-group">' +
                '<h4><span data-icon="' + g.icon + '"></span>' + g.name + "</h4>" +
                '<div class="time-grid">' +
                g.times.map(function (t) {
                    var selected = state.time === t.label;
                    return '<button type="button" class="time-chip' + (selected ? " is-selected" : "") +
                        '" data-time="' + t.label + '"' + (t.enabled ? "" : " disabled") +
                        ' aria-pressed="' + (selected ? "true" : "false") + '">' + t.label + "</button>";
                }).join("") +
                "</div></div>";
        }).join("");
        UM.util.hydrateIcons(host);

        var custom = $("[data-bk-custom-time]");
        if (custom) {
            var input = custom.querySelector("input[type='time']");
            if (input && state.time && !host.querySelector('[data-time="' + state.time + '"]')) {
                input.value = state.time;
            }
        }
    }

    function renderDetails() {
        var nameEl = $("[data-bk-name]");
        var phoneEl = $("[data-bk-phone]");
        var noteEl = $("[data-bk-note]");
        if (nameEl) nameEl.value = state.name || "";
        if (phoneEl) phoneEl.value = state.phone || "";
        if (noteEl) noteEl.value = state.note || "";
    }

    function renderReview() {
        var host = $("[data-bk-review]");
        if (!host) return;

        var s = service();
        var loc = LOCATIONS.filter(function (l) { return l.id === state.location; })[0];
        var durationText = s
            ? (state.durationMinutes ? state.durationMinutes + " min"
                : (state.durationNote || s.durationNote || "To be confirmed"))
            : "\u2014";
        var total = price();

        host.innerHTML =
            row("Service", s ? s.name : "\u2014") +
            row("Duration", durationText) +
            row("Location", loc ? loc.title : "\u2014") +
            row("Date", state.date ? UM.tz.longDate(state.date) : "\u2014") +
            row("Time", state.time || "\u2014") +
            row("Name", state.name || "\u2014") +
            row("Phone", state.phone || "\u2014") +
            (state.note ? row("Note", state.note) : "") +
            (total ? row("Price for centre visit", UM.util.inr(total), true) : "");

        function row(label, value, isTotal) {
            return '<div class="rv-row' + (isTotal ? " is-total" : "") + '">' +
                "<dt>" + UM.util.escapeHtml(label) + "</dt>" +
                "<dd>" + UM.util.escapeHtml(value) + "</dd></div>";
        }
    }

    function updateSummary() {
        var s = service();
        var loc = LOCATIONS.filter(function (l) { return l.id === state.location; })[0];
        var total = price();

        setSum("service", s ? s.name : null);
        setSum("duration", s
            ? (state.durationMinutes ? state.durationMinutes + " min"
                : (state.durationNote || s.durationNote || null))
            : null);
        setSum("location", loc ? loc.title : null);
        setSum("date", state.date ? UM.tz.calendar(state.date).dow + ", " +
            UM.tz.calendar(state.date).day + " " + UM.tz.calendar(state.date).month : null);
        setSum("time", state.time);
        setSum("total", total ? UM.util.inr(total) : null);

        function setSum(key, value) {
            var el = $('[data-sum="' + key + '"]');
            if (!el) return;
            el.textContent = value || (key === "total" ? "\u2014" : "Not chosen yet");
            var rowEl = el.closest(".sum-row");
            if (rowEl) rowEl.classList.toggle("is-empty", !value);
        }
    }

    /* -------------------------------------------------------------------------
       Step navigation
       ---------------------------------------------------------------------- */
    function show(n) {
        step = Math.min(Math.max(1, n), 7);
        $$("[data-bk-panel]").forEach(function (p) {
            p.classList.toggle("is-active", Number(p.getAttribute("data-bk-panel")) === step);
        });

        var label = $("[data-bk-step-label]");
        if (label) label.textContent = "Step " + step + " of 7";

        var bar = $("[data-bk-progress-bar]");
        if (bar) bar.style.width = Math.round((step / 7) * 100) + "%";

        var title = $("[data-bk-step-title]");
        if (title) title.textContent = STEP_TITLES[step - 1];

        $$("[data-bk-back]").forEach(function (b) { b.hidden = step === 1; });
        $$("[data-bk-next]").forEach(function (b) {
            b.innerHTML = step === 7
                ? '<span data-icon="whatsapp"></span> Send request on WhatsApp'
                : 'Next <span data-icon="arrow"></span>';
            UM.util.hydrateIcons(b);
        });

        clearError();
        if (step === 2) renderDurations();
        if (step === 3) renderLocations();
        if (step === 4) renderDates();
        if (step === 5) renderTimes();
        if (step === 6) renderDetails();
        if (step === 7) renderReview();
        updateSummary();
        save();

        var panel = $('[data-bk-panel="' + step + '"]');
        if (panel) {
            var head = panel.querySelector(".bk-head h2");
            var top = root ? root.offsetTop : 0;
            if (head || top) {
                window.scrollTo({
                    top: Math.max(0, (root ? root.getBoundingClientRect().top + window.scrollY - 110 : 0)),
                    behavior: "smooth"
                });
            }
        }
    }

    function error(msg) {
        var el = $("[data-bk-error]");
        if (!el) return;
        el.innerHTML = '<span data-icon="alert"></span><span></span>';
        el.lastElementChild.textContent = msg;
        UM.util.hydrateIcons(el);
        el.classList.add("is-visible");
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function clearError() {
        var el = $("[data-bk-error]");
        if (el) el.classList.remove("is-visible");
        $$(".field.is-invalid").forEach(function (f) { f.classList.remove("is-invalid"); });
    }

    function validate() {
        clearError();
        switch (step) {
            case 1:
                if (!state.serviceSlug) { error("Please choose a service."); return false; }
                return true;
            case 2: {
                var s = service();
                if (!s) { error("Please choose a service first."); return false; }
                if (s.durations && s.durations.length && !state.durationMinutes) {
                    error("Please choose a duration."); return false;
                }
                return true;
            }
            case 3:
                if (!state.location) { error("Please choose a location."); return false; }
                return true;
            case 4:
                if (!state.date) { error("Please choose your preferred date."); return false; }
                return true;
            case 5: {
                if (!state.time) { error("Please choose a preferred time."); return false; }
                if (!UM.tz.timeAllowed(state.date, state.time)) {
                    error("That time is outside opening hours or too soon. Please choose another time.");
                    return false;
                }
                return true;
            }
            case 6: {
                var ok = true;
                var nameField = $("[data-bk-name]");
                var phoneField = $("[data-bk-phone]");
                if (!state.name || state.name.trim().length < 2) {
                    if (nameField) nameField.closest(".field").classList.add("is-invalid");
                    error("Please enter your full name."); ok = false;
                }
                if (ok && !/^[+\d][\d\s-]{7,14}$/.test((state.phone || "").trim())) {
                    if (phoneField) phoneField.closest(".field").classList.add("is-invalid");
                    error("Please enter a valid mobile number."); ok = false;
                }
                return ok;
            }
            default:
                return true;
        }
    }

    /* -------------------------------------------------------------------------
       WhatsApp handoff
       ---------------------------------------------------------------------- */
    function buildMessage() {
        var s = service();
        var loc = LOCATIONS.filter(function (l) { return l.id === state.location; })[0];
        var lines = [
            "Hello " + (CFG().shortName || "Urban Man") + "! I would like to request an appointment.",
            "",
            "Service: " + (s ? s.name : "-")
        ];

        if (s && s.durations && s.durations.length && state.durationMinutes) {
            lines.push("Duration: " + state.durationMinutes + " min" +
                (price() ? " (" + UM.util.inr(price()) + ")" : ""));
        } else if (s && s.durationNote) {
            lines.push("Duration: " + s.durationNote);
        }

        lines.push("Location: " + (loc ? loc.title : "-"));
        if (state.date) lines.push("Preferred date: " + UM.tz.longDate(state.date));
        if (state.time) lines.push("Preferred time: " + state.time);
        lines.push("Name: " + state.name);
        lines.push("Phone: " + state.phone);
        if (state.note) lines.push("Note: " + state.note);
        lines.push("", "This is a request — please confirm availability on WhatsApp. Thank you!");
        return lines.join("\n");
    }

    function CFG() { return UM.BUSINESS_CONFIG || {}; }

    function finish() {
        if (locked) return;
        locked = true;

        var btn = $("[data-bk-next]");
        if (btn) {
            btn.setAttribute("aria-disabled", "true");
            btn.innerHTML = '<span class="spinner"></span> Opening WhatsApp…';
        }

        var url = UM.util.waLink(CFG().whatsapp, buildMessage());
        window.open(url, "_blank", "noopener");

        setTimeout(function () {
            var wizard = $("[data-bk-wizard]");
            var success = $("[data-bk-success]");
            if (success) {
                success.hidden = false;
                success.scrollIntoView({ behavior: "smooth", block: "center" });
                var link = success.querySelector("[data-bk-wa]");
                if (link) link.setAttribute("href", url);
            } else {
                UM.toast("Your request is ready — WhatsApp should open in a new tab.", "whatsapp");
            }
            if (btn) {
                btn.removeAttribute("aria-disabled");
                btn.innerHTML = 'Next <span data-icon="arrow"></span>';
                UM.util.hydrateIcons(btn);
            }
            locked = false;
        }, 350);
    }

    function reset() {
        state = blankState();
        try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
        var success = $("[data-bk-success]");
        if (success) success.hidden = true;
        renderServices();
        show(1);
    }

    /* -------------------------------------------------------------------------
       Wiring
       ---------------------------------------------------------------------- */
    function applyDeepLink() {
        try {
            var params = new URL(location.href).searchParams;
            var slug = params.get("service");
            var dur = parseInt(params.get("duration"), 10);
            if (slug && UM.util.serviceBySlug(slug)) {
                state.serviceSlug = slug;
                var s = UM.util.serviceBySlug(slug);
                if (dur && s.durations.some(function (d) { return d.minutes === dur; })) {
                    state.durationMinutes = dur;
                }
            }
        } catch (e) {}
    }

    function init() {
        root = $("[data-booking-root]");
        if (!root) return;

        state = load();
        applyDeepLink();

        renderServices();
        renderDurations();
        renderLocations();

        /* Choices (delegated) */
        UM.delegate(root, "click", "[data-service]", function (e, el) {
            var slug = el.getAttribute("data-service");
            if (state.serviceSlug !== slug) {
                state.serviceSlug = slug;
                state.durationMinutes = null;
                var s = service();
                state.durationNote = s && s.durationNote ? s.durationNote : null;
            }
            renderServices();
            renderDurations();
            updateSummary();
            clearError();
            save();
        });

        UM.delegate(root, "click", "[data-duration]", function (e, el) {
            state.durationMinutes = Number(el.getAttribute("data-duration"));
            renderDurations();
            updateSummary();
            clearError();
            save();
        });

        UM.delegate(root, "click", "[data-location]", function (e, el) {
            state.location = el.getAttribute("data-location");
            renderLocations();
            updateSummary();
            clearError();
            save();
        });

        UM.delegate(root, "click", "[data-date]", function (e, el) {
            state.date = el.getAttribute("data-date");
            state.time = null;
            renderDates();
            renderTimes();
            updateSummary();
            clearError();
            save();
        });

        UM.delegate(root, "click", "[data-time]", function (e, el) {
            if (el.disabled) return;
            state.time = el.getAttribute("data-time");
            renderTimes();
            updateSummary();
            clearError();
            save();
        });

        var customForm = $("[data-bk-custom-form]");
        if (customForm) {
            UM.on(customForm, "submit", function (e) {
                e.preventDefault();
                var input = customForm.querySelector("input[type='time']");
                var value = input ? input.value : "";
                if (!value) { error("Please choose a preferred time."); return; }
                if (!UM.tz.timeAllowed(state.date, value)) {
                    error("That time is outside opening hours or too soon. Please choose another time.");
                    return;
                }
                state.time = value;
                renderTimes();
                updateSummary();
                clearError();
                save();
            });
        }

        /* Details inputs */
        var nameEl = $("[data-bk-name]");
        var phoneEl = $("[data-bk-phone]");
        var noteEl = $("[data-bk-note]");
        UM.on(nameEl, "input", function () { state.name = nameEl.value; save(); });
        UM.on(phoneEl, "input", function () { state.phone = phoneEl.value; save(); });
        UM.on(noteEl, "input", function () { state.note = noteEl.value; save(); });

        /* Navigation */
        UM.delegate(root, "click", "[data-bk-next]", function () {
            if (!validate()) return;
            if (step === 7) finish();
            else show(step + 1);
        });
        UM.delegate(root, "click", "[data-bk-back]", function () { show(step - 1); });
        UM.delegate(root, "click", "[data-bk-restart]", function () { reset(); });

        show(1);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})(window);
