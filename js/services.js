/* =============================================================================
   js/services.js — catalogue filtering + config-driven page details
   -----------------------------------------------------------------------------
   · Category chips filter the static cards on services.html (and home).
   · The "Home service" note on a service page is refreshed from config.js so
     the published sentence always matches the configuration.
   Cards themselves are static HTML — this file only decorates them.
   ========================================================================== */
(function (global) {
    "use strict";

    var UM = global.UM = global.UM || {};

    var HOME_SERVICE_HTML =
        "Home service for this treatment is subject to availability and confirmation. " +
        "Request it during booking and the team will confirm on WhatsApp."
            .replace("subject to availability and confirmation",
                "<strong>subject to availability and confirmation</strong>");

    /* -------------------------------------------------------------------------
       Category filtering
       ---------------------------------------------------------------------- */
    function initFilters() {
        var grid = document.querySelector("[data-service-grid]");
        var bar = document.querySelector("[data-filters]");
        if (!grid || !bar) return;

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-category]"));
        var countEl = document.querySelector("[data-filter-count]");
        var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter]"));

        function apply(value) {
            var shown = 0;
            cards.forEach(function (card) {
                var match = value === "All" || card.dataset.category === value;
                card.classList.toggle("is-hidden", !match);
                if (match) shown++;
            });

            buttons.forEach(function (b) {
                var active = b.dataset.filter === value;
                b.classList.toggle("is-active", active);
                b.setAttribute("aria-pressed", active ? "true" : "false");
            });

            if (countEl) {
                countEl.textContent = shown + (shown === 1 ? " service" : " services");
            }

            var empty = grid.querySelector(".empty-state");
            if (empty) empty.hidden = shown !== 0;

            /* Keep the URL shareable without reloading */
            try {
                var url = new URL(location.href);
                if (value === "All") url.searchParams.delete("category");
                else url.searchParams.set("category", value);
                history.replaceState(null, "", url);
            } catch (e) { /* file:// without URL support — ignore */ }
        }

        buttons.forEach(function (b) {
            b.addEventListener("click", function () { apply(b.dataset.filter); });
        });

        var initial = "All";
        try {
            var q = new URL(location.href).searchParams.get("category");
            if (q && buttons.some(function (b) { return b.dataset.filter === q; })) initial = q;
        } catch (e) {}

        apply(initial);
    }

    /* -------------------------------------------------------------------------
       Home-service notice on service detail pages
       ---------------------------------------------------------------------- */
    function initHomeServiceNote() {
        var note = document.querySelector("[data-home-service-note]");
        if (!note) return;

        var slug = note.getAttribute("data-home-service-note");
        var service = UM.util.serviceBySlug(slug);
        if (!service) { note.innerHTML = HOME_SERVICE_HTML; return; }

        if (service.homeServiceAvailable === false) {
            note.textContent = "Home service is not available for this treatment.";
        } else if (service.homeServiceAvailable === true) {
            note.innerHTML = "Home service is available for this treatment " +
                "<strong>subject to confirmation</strong> — request it during booking.";
        } else {
            note.innerHTML = HOME_SERVICE_HTML;
        }
    }

    /* -------------------------------------------------------------------------
       Duration chips inside a card — update the displayed price and the
       Book Now deep link (?service=slug&duration=minutes)
       ---------------------------------------------------------------------- */
    function initDurationPickers() {
        UM.delegate(document, "click", ".duration-picker .chip[data-duration]", function (e, el) {
            var group = el.closest(".duration-picker");
            var card = el.closest(".service-card");
            if (!group || !card) return;

            UM.$$(".chip[data-duration]", group).forEach(function (c) {
                c.setAttribute("aria-pressed", c === el ? "true" : "false");
            });

            var price = Number(el.getAttribute("data-price"));
            var priceEl = card.querySelector("[data-price-display]");
            var durEl = card.querySelector("[data-dur-display]");
            if (priceEl) priceEl.textContent = UM.util.inr(price);
            if (durEl) durEl.textContent = el.getAttribute("data-duration") + " min";

            var book = card.querySelector("[data-book-link]");
            if (book) {
                var base = book.getAttribute("href").split("?")[0];
                book.setAttribute("href", base + "?service=" + card.dataset.slug +
                    "&duration=" + el.getAttribute("data-duration"));
            }
        });
    }

    /* -------------------------------------------------------------------------
       Service detail page ([data-service-page="slug"])
       · duration lines update price, note and the book deep link
       · home-service notice and Ask-on-WhatsApp link are filled from config
       ---------------------------------------------------------------------- */
    function initDetailPage() {
        var root = document.querySelector("[data-service-page]");
        if (!root) return;

        var slug = root.getAttribute("data-service-page");
        var svc = UM.util.serviceBySlug(slug);
        if (!svc) return;

        var durations = svc.durations || [];
        var none = durations.length === 0;
        var active = none ? null : durations[0].minutes;

        var lines = root.querySelector("[data-duration-lines]");
        var priceBig = root.querySelector("[data-price-big]");
        var bookBtn = root.querySelector("[data-detail-book]");
        var durNote = root.querySelector("[data-duration-note]");

        function priceFor(min) {
            var d = durations.filter(function (x) { return x.minutes === min; })[0];
            if (d) return d.price;
            return svc.price != null ? svc.price : null;
        }

        function sync() {
            var p = priceFor(active);
            if (priceBig) priceBig.textContent = p != null ? UM.util.inr(p) : "\u2014";
            if (durNote) {
                durNote.textContent = active
                    ? active + " min session"
                    : (svc.durationNote || "Duration not currently confirmed.");
            }
            if (bookBtn) {
                bookBtn.setAttribute("href", "../book.html?service=" + slug +
                    (active ? "&duration=" + active : ""));
            }
        }

        if (lines && !none) {
            UM.delegate(lines, "click", ".duration-line", function (e, el) {
                active = Number(el.getAttribute("data-minutes"));
                UM.$$(".duration-line", lines).forEach(function (b) {
                    b.setAttribute("aria-pressed", Number(b.getAttribute("data-minutes")) === active ? "true" : "false");
                });
                sync();
            });
        }
        sync();

        var hs = root.querySelector("[data-home-notice]");
        if (hs) {
            var span = hs.querySelector("span:last-child") || hs;
            span.innerHTML = "Home service for this treatment is " +
                "<strong>subject to availability and confirmation</strong>. " +
                "Request it during booking and the team will confirm on WhatsApp.";
        }

        var wa = root.querySelector("[data-detail-whatsapp]");
        if (wa) {
            var msg = "Hello Urban Man, I would like to know more about " + svc.name +
                (active ? " (" + active + " min)" : "") + ".";
            wa.setAttribute("href", UM.util.waLink((UM.BUSINESS_CONFIG || {}).whatsapp, msg));
            wa.setAttribute("target", "_blank");
            wa.setAttribute("rel", "noopener");
        }
    }

    /* -------------------------------------------------------------------------
       Booking deep links (?service=slug)
       ---------------------------------------------------------------------- */
    function initBookingLinks() {
        UM.$$("[data-book-service]").forEach(function (el) {
            var service = UM.util.serviceBySlug(el.getAttribute("data-book-service"));
            if (service) el.setAttribute("href", UM.util.bookingLink(service));
        });
    }

    function init() {
        initFilters();
        initHomeServiceNote();
        initDurationPickers();
        initDetailPage();
        initBookingLinks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})(window);
