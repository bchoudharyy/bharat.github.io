// Front-End App Control Deck
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const statusText = document.getElementById("formStatus");
    const heroName = document.getElementById("heroName");
    const heroBrand = document.getElementById("heroBrand");
    const heroTagline = document.getElementById("heroTagline");
    const aboutText = document.getElementById("aboutText");
    const heroPrimaryCta = document.getElementById("heroPrimaryCta");
    const heroSecondaryCta = document.getElementById("heroSecondaryCta");
    const metaDescription = document.getElementById("metaDescription");
    const projectsContainer = document.getElementById("projectsContainer");
    const featuresContainer = document.getElementById("featuresContainer");
    const statsContainer = document.getElementById("statsContainer");
    const skillsList = document.getElementById("skillsList");
    const certificationsList = document.getElementById("certificationsList");
    const contactEmail = document.getElementById("contactEmail");
    const contactLinks = document.getElementById("contactLinks");
    const heroPhoto = document.getElementById('heroPhoto');
    const heroPhotoFallback = document.getElementById('heroPhotoFallback');
    const footerYear = document.getElementById("footerYear");
    const footerText = document.getElementById("footerText");

    const API_BASE_URL = '';
    const CONTENT_API_URL = `${API_BASE_URL}/api/content`;
    const MESSAGES_API_URL = `${API_BASE_URL}/api/messages`;

    footerYear.innerText = new Date().getFullYear();

    function renderContent(data) {
        if (!data) return;

        document.title = data.siteTitle || `${data.name} // ${data.brand}`;
        if (metaDescription) metaDescription.content = data.siteDescription || '';
        heroName.innerText = data.name;
        heroBrand.innerText = data.brand;
        heroTagline.innerText = data.tagline;
        aboutText.innerText = data.about;
        if (heroPrimaryCta) {
            heroPrimaryCta.innerText = data.ctaPrimaryText || 'Explore projects';
            heroPrimaryCta.href = data.ctaPrimaryLink || '#projects';
        }
        if (heroSecondaryCta) {
            heroSecondaryCta.innerText = data.ctaSecondaryText || 'Contact';
            heroSecondaryCta.href = data.ctaSecondaryLink || '#contact';
        }
        if (footerText) footerText.innerText = data.footerNote || 'All rights secured // User access granted.';

        const photoUrl = data.photoUrl || '';
        if (photoUrl) {
            heroPhoto.src = photoUrl;
            heroPhoto.style.display = 'block';
            heroPhotoFallback.style.display = 'none';
        } else {
            heroPhoto.style.display = 'none';
            heroPhotoFallback.style.display = 'flex';
        }

        const publicProjects = Array.isArray(data.projects)
            ? data.projects.filter(project => project.privacy !== 'private')
            : [];

        if (publicProjects.length) {
            projectsContainer.innerHTML = publicProjects.map((project, index) => {
                const statusLabel = project.status ? project.status.toUpperCase() : 'LIVE';
                const projectLink = project.link || '#';

                return `
                    <div class="bg-cyberCard border border-purple-900/30 rounded p-6 hover:border-neonBlue/50 transition duration-300 flex flex-col justify-between group">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <span class="text-xs font-bold text-neonBlue bg-neonBlue/10 px-2 py-1 rounded">${project.category || 'Project'}</span>
                                <div class="text-right space-y-1">
                                    <span class="text-xs text-slate-500 font-mono">${(index + 1).toString().padStart(2, '0')} // ${statusLabel}</span>
                                    ${project.date ? `<span class="text-xs text-slate-400 font-mono">${project.date}</span>` : ''}
                                </div>
                            </div>
                            <h3 class="text-xl font-bold text-white group-hover:text-neonBlue transition duration-300">${project.title}</h3>
                            <p class="text-slate-400 text-sm mt-2">${project.description}</p>
                        </div>
                        <div class="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span class="text-xs text-slate-500">${project.tech || 'Tech details coming soon'}</span>
                            <a href="${projectLink}" class="text-neonBlue hover:underline text-sm font-bold">Inspect →</a>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (Array.isArray(data.features) && data.features.length && featuresContainer) {
            featuresContainer.innerHTML = data.features.map(feature => `
                <div class="rounded-3xl border border-slate-700 bg-slate-900/90 p-6 shadow-lg shadow-slate-950/40 hover:-translate-y-1 transition-transform duration-300">
                    <div class="text-4xl mb-4">${feature.icon || '🚀'}</div>
                    <h3 class="text-xl font-bold text-white mb-2">${feature.title || 'Feature title'}</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">${feature.description || 'Feature description goes here.'}</p>
                </div>
            `).join('');
        }

        if (Array.isArray(data.stats) && data.stats.length && statsContainer) {
            statsContainer.innerHTML = data.stats.map(stat => `
                <div class="rounded-3xl border border-slate-700 bg-slate-950/90 p-6 text-center shadow-glow-purple">
                    <p class="text-4xl font-bold text-white">${stat.value || '--'}</p>
                    <p class="text-slate-400 text-sm mt-2">${stat.label || 'Metric description'}</p>
                </div>
            `).join('');
        }

        if (Array.isArray(data.skills) && data.skills.length) {
            skillsList.innerHTML = data.skills.map(skill => `
                <li class="rounded border border-slate-800 bg-slate-950/80 px-4 py-3">${skill}</li>
            `).join('');
        }

        if (Array.isArray(data.certifications) && data.certifications.length) {
            certificationsList.innerHTML = data.certifications.map(cert => `
                <span class="inline-flex items-center rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2">${cert}</span>
            `).join('');
        }

        contactEmail.innerText = data.contactEmail || 'contact@example.com';

        if (Array.isArray(data.contactLinks) && data.contactLinks.length) {
            contactLinks.innerHTML = data.contactLinks.map(link => `
                <a href="${link.url}" target="_blank" rel="noreferrer" class="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 hover:border-neonBlue">${link.icon || '🔗'} ${link.name}</a>
            `).join('');
        }
    }

    async function loadContent() {
        try {
            const response = await fetch(CONTENT_API_URL);
            if (!response.ok) throw new Error('Content endpoint returned an error');
            const data = await response.json();
            renderContent(data);
        } catch (error) {
            console.warn('Failed to load backend content:', error);
        }
    }

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById("formName").value,
            email: document.getElementById("formEmail").value,
            message: document.getElementById("formMessage").value
        };

        statusText.classList.remove("hidden", "text-red-500", "text-neonBlue");
        statusText.classList.add("text-neonBlue");
        statusText.innerText = "TRANSMITTING ENCRYPTED PACKET...";

        try {
            const response = await fetch(MESSAGES_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                statusText.className = "text-xs text-center font-bold mt-2 text-green-400";
                statusText.innerText = "TRANSMISSION SUCCESSFUL // RECORD STORED IN LOGS";
                contactForm.reset();
            } else {
                throw new Error("Network response mismatch");
            }

        } catch (error) {
            console.error("Transmission Failure:", error);
            statusText.className = "text-xs text-center font-bold mt-2 text-neonPink";
            statusText.innerText = "TRANSMISSION ERROR // BACKEND OFFLINE. TRY AGAIN LATER.";
        }
    });

    loadContent();
});