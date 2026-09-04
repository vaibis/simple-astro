// =========================================
// syllabus data
// mirrors the IOAA theory syllabus (Part A) section-for-section.
// each topic's PDF is expected at:
//   guides/{section-slug}/{topic-slug}/{topic-slug}.pdf
// add a "file" key to override that convention for a specific topic.
// nothing else needs to change here as guides get written —
// a topic just starts working the moment its PDF exists on disk.
// =========================================

const SYLLABUS = [
    {
        id: "01",
        slug: "basic-astrophysics",
        title: "Basic Astrophysics",
        topics: [
            { slug: "celestial-mechanics", title: "Celestial Mechanics" },
            { slug: "orbital-geometry", title: "Orbital Geometry" },
            { slug: "electromagnetic-theory-quantum-physics", title: "EM Theory & Quantum Physics" },
            { slug: "thermodynamics", title: "Thermodynamics" },
            { slug: "spectroscopy-atomic-physics", title: "Spectroscopy & Atomic Physics" },
            { slug: "nuclear-physics", title: "Nuclear Physics" },
            { slug: "relativity", title: "Relativity" },
        ],
    },
    {
        id: "02",
        slug: "coordinates-and-times",
        title: "Coordinates & Times",
        topics: [
            { slug: "celestial-sphere", title: "Celestial Sphere" },
            { slug: "concept-of-time", title: "Concept of Time" },
        ],
    },
    {
        id: "03",
        slug: "solar-system",
        title: "Solar System",
        topics: [
            { slug: "the-sun", title: "The Sun" },
            { slug: "the-solar-system", title: "The Solar System" },
            { slug: "space-exploration", title: "Space Exploration" },
            { slug: "phenomena", title: "Phenomena" },
        ],
    },
    {
        id: "04",
        slug: "stars",
        title: "Stars",
        topics: [
            { slug: "stellar-properties", title: "Stellar Properties" },
            { slug: "stellar-interior-and-atmospheres", title: "Stellar Interior & Atmospheres" },
            { slug: "stellar-evolution", title: "Stellar Evolution" },
        ],
    },
    {
        id: "05",
        slug: "stellar-systems",
        title: "Stellar Systems",
        topics: [
            { slug: "binary-star-systems", title: "Binary Star Systems" },
            { slug: "exoplanets", title: "Exoplanets" },
            { slug: "star-clusters", title: "Star Clusters" },
            { slug: "milky-way-galaxy", title: "Milky Way Galaxy" },
            { slug: "interstellar-medium", title: "Interstellar Medium" },
            { slug: "galaxies", title: "Galaxies" },
            { slug: "accretion-processes", title: "Accretion Processes" },
        ],
    },
    {
        id: "06",
        slug: "cosmology",
        title: "Cosmology",
        topics: [
            { slug: "elementary-cosmology", title: "Elementary Cosmology" },
        ],
    },
    {
        id: "07",
        slug: "instrumentation-and-space-technologies",
        title: "Instrumentation & Space Tech",
        topics: [
            { slug: "multi-wavelength-astronomy", title: "Multi-wavelength Astronomy" },
            { slug: "instrumentation", title: "Instrumentation" },
        ],
    },
    {
        id: "08",
        slug: "mathematical-tools",
        title: "Math Tools",
        topics: [
            { slug: "calculus", title: "Calculus" },
        ],
    },
];

function topicFile(section, topic) {
    return topic.file || `guides/${section.slug}/${topic.slug}/${topic.slug}.pdf`;
}

// =========================================
// pdf.js setup
// =========================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// =========================================
// dom refs
// =========================================

const tocEl = document.getElementById("toc");
const sidebarEl = document.getElementById("sidebar");
const sidebarScrimEl = document.getElementById("sidebarScrim");
const menuButtonEl = document.getElementById("menuButton");
const sidebarCloseEl = document.getElementById("sidebarClose");

const topbarEyebrowEl = document.getElementById("topbarEyebrow");
const topbarTitleEl = document.getElementById("topbarTitle");
const downloadButtonEl = document.getElementById("downloadButton");

const aboutPanelEl = document.getElementById("aboutPanel");
const pdfPanelEl = document.getElementById("pdfPanel");
const pdfStatusEl = document.getElementById("pdfStatus");
const pdfPagesEl = document.getElementById("pdfPages");

let currentLoadToken = 0;

// =========================================
// build sidebar
// =========================================

function buildSidebar() {
    const aboutLink = document.createElement("a");
    aboutLink.href = "#00";
    aboutLink.className = "toc-about";
    aboutLink.dataset.route = "00";
    aboutLink.innerHTML = `<span class="toc-num">00</span><span>About the Guide</span>`;
    tocEl.appendChild(aboutLink);

    SYLLABUS.forEach((section) => {
        const sectionEl = document.createElement("div");
        sectionEl.className = "toc-section";
        sectionEl.dataset.section = section.slug;

        const header = document.createElement("button");
        header.type = "button";
        header.className = "toc-section-header";
        header.innerHTML = `
            <span class="toc-num">${section.id}</span>
            <span class="toc-section-title">${section.title}</span>
            <span class="toc-caret">&#9656;</span>
        `;
        header.addEventListener("click", () => {
            sectionEl.classList.toggle("open");
        });
        sectionEl.appendChild(header);

        const topicsEl = document.createElement("div");
        topicsEl.className = "toc-topics";

        section.topics.forEach((topic) => {
            const link = document.createElement("a");
            link.href = `#${section.slug}/${topic.slug}`;
            link.className = "toc-topic";
            link.dataset.route = `${section.slug}/${topic.slug}`;
            link.innerHTML = `
                <svg class="toc-star" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 1.5 L14.35 9.65 L22.5 12 L14.35 14.35 L12 22.5 L9.65 14.35 L1.5 12 L9.65 9.65 Z" />
                </svg>
                <span>${topic.title}</span>
            `;
            topicsEl.appendChild(link);
        });

        sectionEl.appendChild(topicsEl);
        tocEl.appendChild(sectionEl);
    });
}

// =========================================
// routing
// =========================================

function parseHash() {
    const raw = (location.hash || "#00").slice(1);
    if (raw === "00" || raw === "") return { kind: "about" };

    const [sectionSlug, topicSlug] = raw.split("/");
    const section = SYLLABUS.find((s) => s.slug === sectionSlug);
    if (!section) return { kind: "about" };

    const topic = section.topics.find((t) => t.slug === topicSlug);
    if (!topic) return { kind: "about" };

    return { kind: "topic", section, topic };
}

function setActiveLink(route) {
    document.querySelectorAll("[data-route]").forEach((el) => el.classList.remove("active"));
    const match = document.querySelector(`[data-route="${route}"]`);
    if (match) {
        match.classList.add("active");
        const parentSection = match.closest(".toc-section");
        if (parentSection) parentSection.classList.add("open");
    }
}

function render() {
    const route = parseHash();
    closeMobileSidebar();

    if (route.kind === "about") {
        setActiveLink("00");
        topbarEyebrowEl.textContent = "SECTION 00";
        topbarTitleEl.textContent = "About the Guide";
        downloadButtonEl.hidden = true;

        aboutPanelEl.hidden = false;
        pdfPanelEl.hidden = true;
        return;
    }

    const { section, topic } = route;
    setActiveLink(`${section.slug}/${topic.slug}`);

    topbarEyebrowEl.textContent = `SECTION ${section.id} · ${section.title.toUpperCase()}`;
    topbarTitleEl.textContent = topic.title;

    const file = topicFile(section, topic);
    downloadButtonEl.href = file;
    downloadButtonEl.setAttribute("download", `${topic.slug}.pdf`);
    downloadButtonEl.hidden = false;

    aboutPanelEl.hidden = true;
    pdfPanelEl.hidden = false;

    loadPdf(file, topic.title);
}

// =========================================
// pdf rendering
// =========================================

async function loadPdf(url, title) {
    const loadToken = ++currentLoadToken;

    pdfPagesEl.innerHTML = "";
    pdfStatusEl.hidden = false;
    pdfStatusEl.className = "pdf-status";
    pdfStatusEl.textContent = `loading ${title.toLowerCase()}…`;

    let pdf;
    try {
        pdf = await pdfjsLib.getDocument(url).promise;
    } catch (err) {
        if (loadToken !== currentLoadToken) return;
        pdfStatusEl.className = "pdf-status empty";
        pdfStatusEl.innerHTML = `
            <span class="pdf-status-title">This guide hasn't been written yet.</span>
            The rest of the section is on the way — check back soon,
            or pick another topic from the sidebar.
        `;
        return;
    }

    if (loadToken !== currentLoadToken) return;
    pdfStatusEl.hidden = true;

    const containerWidth = Math.min(pdfPagesEl.clientWidth || 800, 800);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (loadToken !== currentLoadToken) return;

        const page = await pdf.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth / unscaledViewport.width) * (window.devicePixelRatio || 1);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const wrapper = document.createElement("div");
        wrapper.className = "pdf-page";
        wrapper.appendChild(canvas);
        pdfPagesEl.appendChild(wrapper);

        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
    }
}

// =========================================
// mobile sidebar toggle
// =========================================

function openMobileSidebar() {
    sidebarEl.classList.add("open");
    sidebarScrimEl.classList.add("open");
}

function closeMobileSidebar() {
    sidebarEl.classList.remove("open");
    sidebarScrimEl.classList.remove("open");
}

menuButtonEl.addEventListener("click", openMobileSidebar);
sidebarCloseEl.addEventListener("click", closeMobileSidebar);
sidebarScrimEl.addEventListener("click", closeMobileSidebar);

// =========================================
// init
// =========================================

buildSidebar();
window.addEventListener("hashchange", render);
render();