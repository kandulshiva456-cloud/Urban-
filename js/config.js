/* =============================================================================
   Urban Man Ayurveda & Wellness Center
   js/config.js — single source of truth for every business fact.
   -----------------------------------------------------------------------------
   Prices, durations, contact details and rules live only here. The service
   cards on services.html are static markup, but the booking wizard and every
   script read their values from this file so a price is never declared twice
   in JavaScript.

   Load order: config.js -> main.js -> (services.js | booking.js | forms.js |
   careers.js) as needed by the page.
   ========================================================================== */
(function (global) {
    "use strict";

    /* -------------------------------------------------------------------------
       BUSINESS
       ---------------------------------------------------------------------- */
    var BUSINESS_CONFIG = {
        name: "Urban Man Ayurveda & Wellness Center",
        shortName: "Urban Man",
        tagline: "Relax. Rejuvenate. Restore.",

        phones: ["9022628158", "7774855982"],
        whatsapp: "9022628158",
        email: "urbanmanayurveda2026@gmail.com",

        address: {
            line: "Belleza Blue, Manjari\u2013Mundhwa Road, Keshav Nagar, Pune, Maharashtra \u2013 411036",
            locality: "Keshav Nagar",
            city: "Pune",
            region: "Maharashtra",
            postalCode: "411036",
            country: "India"
        },

        openingHours: "7:00 AM \u2013 11:00 PM",
        openingHour: 7,     /* 7:00 AM  — 24h clock */
        closingHour: 23,    /* 11:00 PM — 24h clock */

        experience: "2+ Years",
        timezone: "Asia/Kolkata",

        /* Earliest a preferred time may be REQUESTED (never an availability claim). */
        minimumBookingNoticeMinutes: 120,

        /* Leave empty until confirmed — the site never invents a production URL. */
        siteUrl: "",        /* TODO (CLIENT TO CONFIRM) */
        googleMapsUrl: "",  /* TODO (CLIENT TO CONFIRM) */

        social: {
            instagram: "",  /* TODO (CLIENT TO CONFIRM) — never invent accounts */
            facebook: ""
        },

        /* Booking is a WhatsApp appointment REQUEST, not a real-time engine. */
        booking: {
            mode: "whatsapp-request",
            channel: "whatsapp",
            endpoint: null,     /* TODO (BACKEND INTEGRATION POINT) */
            collectEmail: false
        },

        forms: {
            endpoint: null,             /* TODO (BACKEND INTEGRATION POINT) */
            resumeEndpoint: null,       /* TODO (BACKEND INTEGRATION POINT) */
            maxResumeBytes: 5 * 1024 * 1024,
            resumeTypes: ["pdf", "doc", "docx"]
        },

        hero: {
            video: "assets/video/hero.mp4",
            videoSmall: "assets/video/hero-sm.mp4",
            poster: "assets/images/hero.webp",
            posterMobile: "assets/images/hero-mobile.webp",
            enabled: true
        }
    };

    /* -------------------------------------------------------------------------
       SERVICE CATALOGUE — exactly 9 services. The static cards on
       services.html mirror this list; keep both in step when editing.
       ---------------------------------------------------------------------- */
    var SERVICES = [
        {
            id: "swedish-full-body",
            slug: "swedish-massage",
            name: "Swedish Full Body Massage",
            category: "Massage & Wellness",
            short: "Long, gliding strokes for complete full-body relaxation.",
            description: "Gentle full-body massage using long, gliding strokes, kneading and light tapping to promote relaxation and support circulation.",
            benefits: [
                "Supports relaxation",
                "May help reduce everyday stress",
                "Supports flexibility",
                "May help relieve muscle tension",
                "Supports restful sleep"
            ],
            durations: [{ minutes: 60, price: 1499 }, { minutes: 90, price: 2299 }],
            image: "assets/images/swedish-massage.webp",
            alt: "Therapist applying long gliding strokes during a Swedish full body massage",
            homeServiceAvailable: null,
            featured: true
        },
        {
            id: "deep-tissue-full-body",
            slug: "deep-tissue-massage",
            name: "Deep Tissue Full Body Massage",
            category: "Massage & Wellness",
            short: "Slow, firm pressure across the deeper muscle layers.",
            description: "Therapeutic technique focusing on deeper layers of muscle tissue and fascia using slow, firm strokes and deeper pressure.",
            benefits: [
                "Helps relieve muscle tension",
                "Supports recovery",
                "May help reduce muscle discomfort",
                "Supports circulation",
                "Promotes relaxation"
            ],
            durations: [{ minutes: 60, price: 1999 }, { minutes: 90, price: 2999 }],
            image: "assets/images/deep-tissue-massage.webp",
            alt: "Therapist using firm pressure during a deep tissue back massage",
            homeServiceAvailable: null,
            featured: true
        },
        {
            id: "sports-massage",
            slug: "sports-massage",
            name: "Sports Massage",
            category: "Massage & Wellness",
            short: "Targeted bodywork for active bodies and recovery.",
            description: "Targeted therapeutic bodywork for active individuals and athletes, focusing on recovery, flexibility and muscle care.",
            benefits: [
                "Supports post-workout recovery",
                "Helps improve flexibility",
                "Supports muscle relaxation",
                "Supports healthy circulation"
            ],
            durations: [{ minutes: 60, price: 1799 }, { minutes: 90, price: 2799 }],
            image: "assets/images/sports-massage.webp",
            alt: "Sports therapist working on a client's leg during a recovery massage session",
            homeServiceAvailable: null,
            featured: true
        },
        {
            id: "foot-massage",
            slug: "foot-massage",
            name: "Foot Massage",
            category: "Massage & Wellness",
            short: "Focused work on feet, ankles and lower legs.",
            description: "Focused massage for feet, ankles and lower legs using targeted pressure to promote relaxation and relieve tension.",
            benefits: [
                "Helps reduce foot tension",
                "Promotes relaxation",
                "Supports circulation",
                "May support better sleep"
            ],
            durations: [{ minutes: 20, price: 499 }, { minutes: 40, price: 999 }],
            image: "assets/images/foot-massage.webp",
            alt: "Therapist performing a professional foot massage on a client",
            homeServiceAvailable: null,
            featured: false
        },
        {
            id: "head-massage",
            slug: "head-massage",
            name: "Head Massage",
            category: "Massage & Wellness",
            short: "A calming scalp and head massage.",
            description: "A calming massage focused on the head and scalp to help you unwind and release everyday tension.",
            benefits: [
                "Promotes relaxation",
                "May help relieve everyday tension",
                "A calming break for a busy mind"
            ],
            durations: [{ minutes: 20, price: 499 }],
            image: "assets/images/head-massage.webp",
            alt: "Male client receiving a relaxing head and scalp massage treatment",
            homeServiceAvailable: null,
            featured: false
        },
        {
            id: "full-body-dry-cupping",
            slug: "dry-cupping",
            name: "Full Body Dry Cupping",
            category: "Massage & Wellness",
            short: "Traditional gentle suction, non-invasive.",
            description: "Traditional, non-invasive wellness technique using cups to create gentle suction on the skin.",
            benefits: [
                "May support circulation",
                "May help relieve muscle tension",
                "Supports relaxation",
                "May help with feelings of muscle tightness"
            ],
            durations: [{ minutes: 30, price: 999 }],
            image: "assets/images/dry-cupping.webp",
            alt: "Glass cups placed on a client's back during a dry cupping treatment",
            homeServiceAvailable: null,
            featured: true
        },
        {
            id: "full-body-scrub-polish",
            slug: "body-scrub-polish",
            name: "Full Body Scrub With Polish",
            category: "Beauty & Body Care",
            short: "Exfoliation and polishing in one body treatment.",
            description: "Body-care treatment combining exfoliation and polishing to help remove dead skin cells and leave skin smoother and refreshed.",
            benefits: [
                "Exfoliates dead skin",
                "Helps improve skin texture",
                "Supports hydration",
                "Leaves skin smoother",
                "Provides a refreshed appearance"
            ],
            durations: [{ minutes: 90, price: 3999 }],
            image: "assets/images/body-scrub-polish.webp",
            alt: "Body scrub brush used to exfoliate the skin during a body polish treatment",
            homeServiceAvailable: null,
            featured: true
        },
        {
            id: "gold-facial",
            slug: "gold-facial",
            name: "Gold Facial",
            category: "Beauty & Body Care",
            short: "Cleanse, exfoliate and nourish.",
            description: "Professional facial treatment designed to cleanse, exfoliate and nourish skin while supporting a smoother, hydrated appearance.",
            benefits: [
                "Deep cleansing",
                "Exfoliation",
                "Hydration",
                "Removes dead skin cells and impurities",
                "Supports smoother-looking skin"
            ],
            durations: [{ minutes: 45, price: 1499 }],
            image: "assets/images/gold-facial.webp",
            alt: "Gold facial mask being applied during a professional facial treatment",
            homeServiceAvailable: null,
            featured: false
        },
        {
            id: "full-body-waxing",
            slug: "full-body-waxing",
            name: "Full Body Waxing",
            category: "Beauty & Body Care",
            short: "Professional full-body hair removal.",
            description: "Professional hair-removal treatment designed to remove unwanted hair from the root across the body.",
            benefits: [
                "Smooth, hair-free skin can last approximately 3\u20136 weeks, depending on individual hair growth"
            ],
            durations: [],
            durationNote: "Duration not currently confirmed.",
            price: 5999,
            image: "assets/images/full-body-waxing.webp",
            alt: "Therapist performing a professional waxing treatment in a clean clinical setting",
            homeServiceAvailable: null,
            featured: false
        }
    ];

    var SERVICE_CATEGORIES = ["All", "Massage & Wellness", "Beauty & Body Care"];

    /* -------------------------------------------------------------------------
       MASSAGE COURSE — only confirmed facts. null = "not confirmed", and the
       UI shows a clearly marked placeholder instead of an invented figure.
       ---------------------------------------------------------------------- */
    var COURSE_CONFIG = {
        name: "Professional Massage Course",
        heroHeading: "Learn the Art of Professional Massage",

        duration: null,
        fee: null,
        timings: null,
        batchDates: null,
        eligibility: null,
        certificate: null,
        accreditation: null,
        batchSize: null,
        trainer: null,
        applicationProcess: null,

        syllabus: [
            "Swedish Massage",
            "Deep Tissue Massage",
            "Sports Massage",
            "Head & Foot Massage",
            "Body Preparation",
            "Professional Practice"
        ],
        syllabusNote: "Configurable course content — confirm the final syllabus with Urban Man.",
        enquiryEndpoint: null
    };

    /* -------------------------------------------------------------------------
       CAREERS — a role is never a live vacancy unless confirmed.
       ---------------------------------------------------------------------- */
    var CAREERS_CONFIG = {
        positions: [
            { id: "massage-therapist", title: "Massage Therapist", confirmed: false },
            { id: "beauty-therapist", title: "Beauty Therapist", confirmed: false }
        ],
        publishingOpenPositions: false,   /* TODO (CLIENT TO CONFIRM) */
        applicationEndpoint: null
    };

    /* Official social / review destinations supplied by the client. */
    var SOCIALS = {
        instagram: "https://www.instagram.com/urbanmanayurveda?stkn=dWh5emtkbnV3NWZp",
        facebook: "https://www.facebook.com/share/14sxDPXQ8tT/",
        whatsapp: "https://wa.me/919022628158",
        google: "https://share.google/UNsBLlZf3o65kYGbB"
    };

    /* Featured Google review excerpts supplied by the client. These are intentionally
       presented as selected client experiences, not as a complete review feed. */
    var TESTIMONIALS = [
        {
            name: "Jayesh Shinde",
            meta: "Google Review · 4 months ago",
            text: "You are providing an awesome massage. You have a wonderful technique of a massage and also professional as well as sensational massage which gives a nice feeling and relaxation for body and mind.",
            rating: 5
        },
        {
            name: "Nandan Shinde",
            meta: "Local Guide · Google Review · 5 months ago",
            text: "I had an absolutely incredible experience at Urban Man. From the moment I walked in, the calming aroma and soft lighting immediately put me at ease. The staff was professional and welcoming.",
            rating: 5
        },
        {
            name: "Tarun Agrawal",
            meta: "Google Review · 4 months ago",
            text: "Had a good experience in this wellness centre. The owner Prashant and other staff are polite, clean and very hygienic. The place is neat, silent with every possible facility.",
            rating: 5
        },
        {
            name: "Mayur Lonkar",
            meta: "Local Guide · Google Review · 3 months ago",
            text: "I opted for Deep tissue massage session along with dry cupping, overall the session was excellent. Mr Prashant Gore is highly professional in his work and follows ethics.",
            rating: 5
        },
        {
            name: "Shrenik Shah",
            meta: "Google Review · 5 months ago",
            text: "Tried Urban Man Ayurveda massage at home! Their service is exceptional. Specially the sports massage. Good for recovery after a hard week in the gym.",
            rating: 5
        },
        {
            name: "Rustom Dadachanji",
            meta: "Google Review · 1 month ago",
            text: "An exceptional deeply restorative massage session with Urban Man that melted away physical tension and stress. The session flowed smoothly from start to finish, leaving muscles eased and the body feeling completely renewed.",
            rating: 5
        },
        {
            name: "Rohit Pawar",
            meta: "Google Review · 2 days ago",
            text: "Had a great experience here. The staff was welcoming and professional, and the massage was very relaxing.",
            rating: 5
        },
        {
            name: "Vaibhav Chormale",
            meta: "Google Review · 2 days ago",
            text: "Really enjoyed my visit. The ambience was peaceful, the staff was friendly, and the overall service was very good.",
            rating: 5
        }
    ];

    /* Approved gallery imagery — swap files in /assets/images to update. */
    var GALLERY = [
        { src: "assets/images/center.webp", alt: "Dark wood wellness interior with warm lighting at the Urban Man centre", span: "wide" },
        { src: "assets/images/hero.webp", alt: "Professional male therapist performing a back massage in a calm treatment room", span: "tall" },
        { src: "assets/images/about.webp", alt: "Therapist working on a client's upper back during a treatment session", span: "normal" },
        { src: "assets/images/course.webp", alt: "Anatomy reference charts used during massage therapy training", span: "normal" },
        { src: "assets/images/careers.webp", alt: "Therapist at work in a professional wellness environment", span: "normal" },
        { src: "assets/images/swedish-massage.webp", alt: "Swedish full body massage performed with long gliding strokes", span: "wide" }
    ];

    /* -------------------------------------------------------------------------
       Validation — fail loudly rather than render broken UI.
       ---------------------------------------------------------------------- */
    function validateConfig() {
        var errors = [];
        var seenSlug = {};

        if (!Array.isArray(SERVICES) || SERVICES.length !== 9) {
            errors.push("SERVICES must contain exactly 9 entries.");
        }

        SERVICES.forEach(function (s, i) {
            var where = "SERVICES[" + i + "] (" + (s.slug || "?") + ")";
            if (!s.slug || !s.name || !s.category || !s.description || !s.image) {
                errors.push(where + ": missing required field.");
            }
            if (s.slug) {
                if (seenSlug[s.slug]) errors.push("Duplicate slug: " + s.slug);
                seenSlug[s.slug] = true;
            }
            if (!s.durations || s.durations.length === 0) {
                if (typeof s.price !== "number" || s.price <= 0) {
                    errors.push(where + ": no durations and no confirmed price.");
                }
                if (!s.durationNote) {
                    errors.push(where + ": no durations — durationNote required so none is invented.");
                }
            }
        });

        if (!BUSINESS_CONFIG.whatsapp) errors.push("BUSINESS_CONFIG.whatsapp is required.");
        if (!BUSINESS_CONFIG.phones || !BUSINESS_CONFIG.phones.length) errors.push("BUSINESS_CONFIG.phones is required.");
        if (typeof BUSINESS_CONFIG.minimumBookingNoticeMinutes !== "number") {
            errors.push("BUSINESS_CONFIG.minimumBookingNoticeMinutes must be a number.");
        }

        if (errors.length) {
            if (console && console.group) {
                console.group("%c[UrbanMan] Configuration problems", "color:#E08B7B;font-weight:700");
                errors.forEach(function (e) { console.error(e); });
                console.groupEnd();
            }
        } else if (console && console.info) {
            console.info("[UrbanMan] Configuration valid — " + SERVICES.length + " services.");
        }
        return errors;
    }

    global.UM = global.UM || {};
    global.UM.BUSINESS_CONFIG = BUSINESS_CONFIG;
    global.UM.SERVICES = SERVICES;
    global.UM.SERVICE_CATEGORIES = SERVICE_CATEGORIES;
    global.UM.COURSE_CONFIG = COURSE_CONFIG;
    global.UM.CAREERS_CONFIG = CAREERS_CONFIG;
    global.UM.TESTIMONIALS = TESTIMONIALS;
    global.UM.SOCIALS = SOCIALS;
    global.UM.GALLERY = GALLERY;
    global.UM.validateConfig = validateConfig;

})(window);
