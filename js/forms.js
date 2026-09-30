/* =============================================================================
   js/forms.js — honest, validated form handling (contact / careers / course)
   -----------------------------------------------------------------------------
   · Client-side validation with specific messages per field type.
   · A 2.2 s minimum fill time plus a honeypot stops accidental bot posts.
   · When a backend endpoint is configured the form POSTs JSON and renders the
     server's {success, message, errors} response.
   · With NO endpoint configured the form NEVER reports a fake success: it
     explains the situation and hands over a prefilled e-mail draft and a
     WhatsApp button instead.
   ========================================================================== */
(function (global) {
    "use strict";

    var UM = global.UM = global.UM || {};
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    var MIN_FILL_MS = 2200;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_RE = /^[+\d][\d\s-]{7,14}$/;

    var MSG = {
        required: "This field is required.",
        name: "Please enter your full name.",
        email: "Please enter a valid email address.",
        phone: "Please enter a valid mobile number.",
        message: "Please tell us a little more so we can help.",
        select: "Please choose an option."
    };

    /* Friendly labels used in the mail draft body */
    var FIELD_LABELS = {
        interest: "I'm interested in",
        position: "Position",
        skills: "Skills",
        experience: "Experience",
        resume: "Resume",
        note: "Message"
    };

    function CFG() { return UM.BUSINESS_CONFIG || {}; }

    /* -------------------------------------------------------------------------
       Validation
       ---------------------------------------------------------------------- */
    function fieldOf(control) { return control.closest(".field") || control.parentElement; }

    function setError(control, message) {
        var field = fieldOf(control);
        if (!field) return;
        field.classList.add("is-invalid");
        var out = field.querySelector(".field-error");
        if (out) {
            out.innerHTML = '<span data-icon="alert"></span><span class="fe-text"></span>';
            out.querySelector(".fe-text").textContent = message;
            UM.util.hydrateIcons(out);
        }
        control.setAttribute("aria-invalid", "true");
    }

    function clearError(control) {
        var field = fieldOf(control);
        if (!field) return;
        field.classList.remove("is-invalid");
        control.removeAttribute("aria-invalid");
    }

    function validateControl(control) {
        var value = (control.value || "").trim();
        var kind = control.getAttribute("data-validate") || "";
        var type = (control.type || "").toLowerCase();
        var isSelect = control.tagName === "SELECT";
        var required = control.hasAttribute("required");

        clearError(control);

        if (!value) {
            if (!required) return true;
            setError(control, isSelect ? MSG.select : (kind === "message" ? MSG.message : MSG.required));
            return false;
        }
        if (kind === "name" || (control.name === "name" && value.length < 2)) {
            if (value.length < 2) { setError(control, MSG.name); return false; }
        }
        if (kind === "email" || type === "email") {
            if (!EMAIL_RE.test(value)) { setError(control, MSG.email); return false; }
        }
        if (kind === "phone" || type === "tel") {
            if (!PHONE_RE.test(value)) { setError(control, MSG.phone); return false; }
        }
        if (kind === "message" && value.length < 8) {
            setError(control, MSG.message); return false;
        }
        if (isSelect && required && !value) {
            setError(control, MSG.select); return false;
        }
        return true;
    }

    function validateForm(form) {
        var ok = true;
        var firstBad = null;

        $$("input, select, textarea", form).forEach(function (control) {
            if (control.type === "hidden" || control.closest(".honey")) return;
            if (!control.closest(".field") && !control.hasAttribute("data-validate") && !control.hasAttribute("required")) return;
            if (!validateControl(control)) {
                ok = false;
                if (!firstBad) firstBad = control;
            }
        });

        if (firstBad) firstBad.focus({ preventScroll: false });
        return ok;
    }

    /* -------------------------------------------------------------------------
       Status rendering
       ---------------------------------------------------------------------- */
    function statusEl(form) { return form.querySelector("[data-form-status]"); }

    function showStatus(form, tone, message, extraHtml) {
        var el = statusEl(form);
        if (!el) { UM.toast(message, tone === "success" ? "checkCircle" : "info"); return; }

        var icon = tone === "success" ? "checkCircle" : (tone === "danger" ? "alert" : "info");
        el.className = "form-status is-visible notice" +
            (tone === "success" ? " is-success" : (tone === "danger" ? " is-danger" : " is-plain"));
        el.setAttribute("role", tone === "danger" ? "alert" : "status");
        el.innerHTML = '<span data-icon="' + icon + '"></span><span class="fs-body"></span>';
        el.querySelector(".fs-body").innerHTML = "";
        el.querySelector(".fs-body").appendChild(document.createTextNode(message));
        if (extraHtml) {
            var wrap = document.createElement("span");
            wrap.innerHTML = extraHtml;
            el.querySelector(".fs-body").appendChild(wrap);
        }
        UM.util.hydrateIcons(el);
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideStatus(form) {
        var el = statusEl(form);
        if (el) { el.className = "form-status"; el.innerHTML = ""; }
    }

    /* -------------------------------------------------------------------------
       Payload + fallback
       ---------------------------------------------------------------------- */
    function collect(form) {
        var data = {};
        $$("input, select, textarea", form).forEach(function (control) {
            if (!control.name || control.type === "file" || control.closest(".honey")) return;
            var value = (control.value || "").trim();
            if (value) data[control.name] = value;
        });
        if (form._extra) Object.keys(form._extra).forEach(function (k) { data[k] = form._extra[k]; });
        return data;
    }

    function labelFor(name) {
        if (FIELD_LABELS[name]) return FIELD_LABELS[name];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function buildMailDraft(subject, data) {
        var body = Object.keys(data).map(function (k) {
            return labelFor(k) + ": " + data[k];
        }).join("\n");
        return "mailto:" + CFG().email +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(body);
    }

    function fallback(form, kind, data) {
        var mail = buildMailDraft(kind === "careers" ? "Job application — Urban Man" : "Enquiry — Urban Man", data);
        var waText = kind === "careers"
            ? "Hello Urban Man! I would like to apply. Details:\n\n" +
                Object.keys(data).map(function (k) { return labelFor(k) + ": " + data[k]; }).join("\n")
            : "Hello Urban Man! I have a question:\n\n" + (data.message || data.note || "");
        var wa = UM.util.waLink(CFG().whatsapp, waText);

        var lines = kind === "careers"
            ? [
                "We could not send this automatically — no application inbox is configured yet. ",
                "Use one of the buttons below — please attach your resume in the e-mail or send it on WhatsApp."
            ]
            : [
                "We could not send this automatically — no message inbox is configured yet. ",
                "Please reach us directly using one of the buttons below; your details stay in the draft."
            ];

        var html = "<p>" + lines.join("") + "</p>" +
            '<p class="btn-row" style="margin-top:.9rem">' +
            '<a class="btn btn--sm" href="' + mail + '"><span data-icon="mail"></span> Open e-mail draft</a>' +
            '<a class="btn btn--sm btn--ghost" href="' + wa + '" target="_blank" rel="noopener">' +
            '<span data-icon="whatsapp"></span> Send on WhatsApp</a></p>';

        showStatus(form, "info", "Your details are ready to send.", html);
    }

    /* -------------------------------------------------------------------------
       Submit
       ---------------------------------------------------------------------- */
    function submit(form) {
        var kind = form.getAttribute("data-form-kind") || "contact";
        var cfgForms = CFG().forms || {};
        var endpoint = kind === "careers"
            ? (cfgForms.resumeEndpoint || CFG().applicationEndpoint)
            : (cfgForms.endpoint || form.getAttribute("data-endpoint") || null);

        var data = collect(form);
        data.kind = kind;
        data.page = location.pathname.split("/").pop() || "index.html";

        var btn = form.querySelector("[type='submit']");
        var restore = btn ? btn.innerHTML : null;

        if (!endpoint) {
            /* No backend — never claim success. */
            fallback(form, kind, data);
            return;
        }

        if (btn) {
            btn.setAttribute("aria-disabled", "true");
            btn.innerHTML = '<span class="spinner"></span> Sending…';
        }

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(function (res) { return res.json().catch(function () { return { success: res.ok }; }); })
            .then(function (json) {
                if (json && json.success) {
                    showStatus(form, "success",
                        json.message || "Thank you — your message has been sent. We will reply shortly.");
                    form.reset();
                    form.dataset.started = "";
                    form._extra = null;
                    if (form._afterSuccess) form._afterSuccess();
                } else {
                    var msg = (json && json.message) ||
                        "Something went wrong on our side. Please try again or use the buttons below.";
                    showStatus(form, "danger", msg);
                    if (json && json.errors) applyServerErrors(form, json.errors);
                }
            })
            .catch(function () {
                showStatus(form, "danger",
                    "We could not reach the server. Please try again, or use the buttons below.");
            })
            .then(function () {
                if (btn) { btn.removeAttribute("aria-disabled"); btn.innerHTML = restore; UM.util.hydrateIcons(btn); }
            });
    }

    function applyServerErrors(form, errors) {
        if (!errors || typeof errors !== "object") return;
        Object.keys(errors).forEach(function (name) {
            var control = form.querySelector('[name="' + name + '"]');
            if (control) setError(control, errors[name]);
        });
    }

    /* -------------------------------------------------------------------------
       Wiring
       ---------------------------------------------------------------------- */
    function init() {
        $$("form[data-form]").forEach(function (form) {
            if (form.dataset.wired) return;
            form.dataset.wired = "1";

            /* Time trap + honeypot */
            form.dataset.startedAt = String(Date.now());
            var honeypot = form.querySelector(".honey input");
            if (honeypot) honeypot.value = "";

            $$("input, select, textarea", form).forEach(function (control) {
                UM.on(control, "blur", function () {
                    if ((control.value || "").trim()) validateControl(control);
                });
                UM.on(control, "input", function () {
                    var field = fieldOf(control);
                    if (field && field.classList.contains("is-invalid")) validateControl(control);
                });
            });

            UM.on(form, "submit", function (e) {
                e.preventDefault();
                hideStatus(form);

                if (honeypot && honeypot.value) return; /* bot got trapped */

                var elapsed = Date.now() - Number(form.dataset.startedAt || Date.now());
                if (elapsed < MIN_FILL_MS) {
                    UM.toast("Please take a moment to complete the form.", "clock");
                    return;
                }

                if (!validateForm(form)) return;
                submit(form);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    UM.forms = {
        validate: validateForm,
        validateControl: validateControl,
        setError: setError,
        showStatus: showStatus,
        hideStatus: hideStatus,
        init: init,
        MSG: MSG
    };

})(window);
