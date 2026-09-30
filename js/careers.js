/* =============================================================================
   js/careers.js — application form behaviour
   -----------------------------------------------------------------------------
   · Positions come from CAREERS_CONFIG only. A role is never presented as a
     live vacancy unless the client has confirmed it (confirmed: true and
     publishingOpenPositions: true).
   · Skills are chip toggles collected into one field.
   · Resume is validated by extension and size before anything is attempted.
   ========================================================================== */
(function (global) {
    "use strict";

    var UM = global.UM = global.UM || {};
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    var SKILLS = [
        "Swedish massage", "Deep tissue massage", "Sports massage",
        "Head & foot massage", "Cupping", "Body scrub",
        "Facials", "Waxing", "Customer service"
    ];

    var selected = [];

    /* -------------------------------------------------------------------------
       POSITIONS
       ---------------------------------------------------------------------- */
    function publishedPositions() {
        var cfg = UM.CAREERS_CONFIG || {};
        if (!cfg.publishingOpenPositions) return [];
        return (cfg.positions || []).filter(function (p) { return p.confirmed; });
    }

    function buildPositions() {
        var select = $("[data-careers-position]");
        if (!select) return;

        var cfg = UM.CAREERS_CONFIG || {};
        var open = publishedPositions();
        var note = $("[data-careers-openings]");

        if (open.length) {
            select.innerHTML = '<option value="">Select a role</option>' +
                open.map(function (p) {
                    return '<option value="' + UM.util.escapeHtml(p.title) + '">' +
                        UM.util.escapeHtml(p.title) + "</option>";
                }).join("") +
                '<option value="General application">General application</option>';
            if (note) {
                note.className = "notice is-plain";
                note.innerHTML = '<span data-icon="info"></span><span>Openings for this centre are confirmed directly by our team. ' +
                    'If a role you are interested in is not listed, choose \u201CGeneral application\u201D.</span>';
            }
        } else {
            select.innerHTML = '<option value="General application">General application</option>' +
                (cfg.positions || []).map(function (p) {
                    return '<option value="' + UM.util.escapeHtml(p.title) +
                        ' (enquire)">' + UM.util.escapeHtml(p.title) + " \u2014 enquire</option>";
                }).join("");
            if (note) {
                note.className = "notice";
                note.innerHTML = '<span data-icon="info"></span><span>Openings at Urban Man change frequently and are confirmed by our team ' +
                    'rather than published here. Choose the role closest to yours and we will ' +
                    'confirm whether it is currently required.</span>';
            }
        }
        UM.util.hydrateIcons(document);
    }

    /* -------------------------------------------------------------------------
       SKILLS CHIPS
       ---------------------------------------------------------------------- */
    function buildSkills() {
        var host = $("[data-skills]");
        if (!host) return;

        host.innerHTML = SKILLS.map(function (s) {
            return '<button type="button" class="chip" data-skill="' + UM.util.escapeHtml(s) +
                '" aria-pressed="false">' + UM.util.escapeHtml(s) + "</button>";
        }).join("");

        host.addEventListener("click", function (e) {
            var b = e.target.closest("[data-skill]");
            if (!b) return;
            var val = b.getAttribute("data-skill");
            var on = b.getAttribute("aria-pressed") === "true";
            b.setAttribute("aria-pressed", on ? "false" : "true");
            if (on) selected = selected.filter(function (x) { return x !== val; });
            else selected.push(val);
            syncSkills();
        });

        syncSkills();
    }

    function syncSkills() {
        var input = $("[data-skills-value]");
        if (input) input.value = selected.join(", ");
        var out = $("[data-skills-count]");
        if (out) {
            out.textContent = selected.length
                ? selected.length + " selected" : "None selected";
        }
    }

    /* -------------------------------------------------------------------------
       RESUME
       ---------------------------------------------------------------------- */
    function resumeError(file) {
        var cfg = (UM.BUSINESS_CONFIG && UM.BUSINESS_CONFIG.forms) || {};
        if (!file) return null;

        var types = cfg.resumeTypes || ["pdf", "doc", "docx"];
        var ext = (file.name.split(".").pop() || "").toLowerCase();
        if (types.indexOf(ext) === -1) {
            return "Please attach a " + types.join(", ").toUpperCase() + " file.";
        }
        var max = cfg.maxResumeBytes || 5 * 1024 * 1024;
        if (file.size > max) {
            return "Please attach a file smaller than " + Math.round(max / (1024 * 1024)) + " MB.";
        }
        return null;
    }

    function buildResume() {
        var input = $("[data-resume]");
        var label = $("[data-resume-label]");
        var out = $("[data-error-for='resume']");
        var form = input ? input.closest("form") : null;
        if (!input) return;

        input.addEventListener("change", function () {
            var file = input.files && input.files[0];
            var message = resumeError(file);

            if (out) {
                if (message) {
                    out.innerHTML = '<span data-icon="alert"></span><span></span>';
                    out.lastElementChild.textContent = message;
                    out.hidden = false;
                    UM.util.hydrateIcons(out);
                } else {
                    out.hidden = true;
                    out.textContent = "";
                }
            }

            if (message) {
                input.value = "";
                if (label) label.textContent = "No file chosen";
                if (form) form._extra = null;
                return;
            }

            if (label && file) label.textContent = file.name;
            if (form) {
                form._extra = form._extra || {};
                form._extra.resume = file ? file.name : "";
            }
        });
    }

    /* -------------------------------------------------------------------------
       Public presence line — role list on the page (if not published, hidden)
       ---------------------------------------------------------------------- */
    function syncOpeningsVisibility() {
        var list = $("[data-position-list]");
        if (!list) return;
        var open = publishedPositions();
        if (!open.length) { list.hidden = true; return; }

        list.innerHTML = open.map(function (p) {
            return '<article class="position">' +
                "<div><h3>" + UM.util.escapeHtml(p.title) + "</h3></div>" +
                '<div class="p-meta"><span><span data-icon="pin"></span>' +
                UM.util.escapeHtml((UM.BUSINESS_CONFIG || {}).address ? UM.BUSINESS_CONFIG.address.city : "Pune") +
                '</span><span><span data-icon="briefcase"></span>Full time</span></div>' +
                "</article>";
        }).join("");
        UM.util.hydrateIcons(list);
    }

    function init() {
        buildPositions();
        buildSkills();
        buildResume();
        syncOpeningsVisibility();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})(window);
