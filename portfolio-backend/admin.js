const loadButton = document.getElementById('loadButton');
const saveButton = document.getElementById('saveButton');
const logoutButton = document.getElementById('logoutButton');
const statusText = document.getElementById('adminStatus');
const adminForm = document.getElementById('adminForm');
const heroNameInput = document.getElementById('heroName');
const heroBrandInput = document.getElementById('heroBrand');
const heroTaglineInput = document.getElementById('heroTagline');
const aboutTextInput = document.getElementById('aboutText');
const projectsList = document.getElementById('projectsList');
const addProjectButton = document.getElementById('addProject');
const skillsTextInput = document.getElementById('skillsText');
const certificationsTextInput = document.getElementById('certificationsText');
const contactEmailInput = document.getElementById('contactEmail');
const heroPhotoUrlInput = document.getElementById('heroPhotoUrl');
const contactLinksList = document.getElementById('contactLinksList');
const addLinkButton = document.getElementById('addLink');
const previewPanel = document.getElementById('previewPanel');
const refreshPreviewButton = document.getElementById('refreshPreview');
const saveButtonEditor = document.getElementById('saveButtonEditor');
const refreshPreviewEditor = document.getElementById('refreshPreviewEditor');
const saveButtonStatus = document.getElementById('saveButtonStatus');
const dashboardStats = document.getElementById('dashboardStats');
const pageLinks = document.querySelectorAll('[data-page]');
const pageSections = {
    dashboard: document.getElementById('page-dashboard'),
    editor: document.getElementById('page-editor'),
    projects: document.getElementById('page-projects'),
    encryptor: document.getElementById('page-encryptor')
};
const encryptorProjectSelect = document.getElementById('encryptorProjectSelect');
const encryptorPasswordInput = document.getElementById('encryptorPassword');
const encryptButton = document.getElementById('encryptButton');
const decryptButton = document.getElementById('decryptButton');
const encryptorStatus = document.getElementById('encryptorStatus');

const API_BASE = '/api';
const AVAILABLE_PAGES = ['dashboard', 'editor', 'projects', 'encryptor'];
let currentContent = null;

function setStatus(message, type = 'info') {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.className = type === 'success' ? 'text-sm text-emerald-400' : type === 'error' ? 'text-sm text-rose-400' : 'text-sm text-slate-400';
}

function setEncryptorStatus(message, type = 'info') {
    if (!encryptorStatus) return;
    encryptorStatus.textContent = message;
    encryptorStatus.className = type === 'success' ? 'text-sm text-emerald-400' : type === 'error' ? 'text-sm text-rose-400' : 'text-sm text-slate-400';
}

function setSaveButtonState(isSaving) {
    [saveButton, saveButtonEditor].forEach(button => {
        if (!button) return;
        button.disabled = isSaving;
        if (button.id === 'saveButton' || button.id === 'saveButtonEditor') {
            button.textContent = isSaving ? 'Saving...' : 'Save content';
        }
    });
    if (saveButtonStatus) {
        saveButtonStatus.textContent = isSaving ? 'Saving changes…' : 'Use Save content to write changes to the backend data store.';
    }
}

function handleUnauthorized() {
    window.location.href = '/login';
}

function getCurrentPageFromPath() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const page = pathParts[1] || 'dashboard';
    return AVAILABLE_PAGES.includes(page) ? page : 'dashboard';
}

function showPage(page) {
    Object.entries(pageSections).forEach(([key, section]) => {
        if (!section) return;
        section.classList.toggle('hidden', key !== page);
    });

    pageLinks.forEach(link => {
        const active = link.dataset.page === page;
        link.classList.toggle('bg-neonBlue/10', active);
        link.classList.toggle('border-neonBlue', active);
    });

    const newTitle = page === 'dashboard' ? 'Admin Dashboard' : page === 'editor' ? 'Portfolio Editor' : page === 'projects' ? 'Projects Manager' : 'Project Encryptor';
    document.title = `${newTitle} • Portfolio Admin`;
}

function navigateTo(page) {
    if (!AVAILABLE_PAGES.includes(page)) page = 'dashboard';
    const newPath = `/admin/${page}`;
    if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
    }
    showPage(page);
}

function updateNavigation() {
    pageLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function createProjectRow(project = {}, index = 0) {
    const isEncrypted = Boolean(project.encrypted);
    const wrapper = document.createElement('div');
    wrapper.className = 'rounded-2xl border border-slate-700 bg-slate-950/90 p-4';
    wrapper.dataset.projectIndex = index;
    wrapper.dataset.encrypted = isEncrypted ? 'true' : 'false';
    wrapper.dataset.payload = project.payload || '';
    wrapper.dataset.iv = project.iv || '';

    wrapper.innerHTML = `
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h3 class="font-semibold text-slate-100">${project.title || 'Untitled Project'}</h3>
                <p class="text-slate-500 text-sm">${isEncrypted ? 'Encrypted private project' : 'Public or private project entry'}</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button type="button" class="encryptToggle rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-neonBlue">${isEncrypted ? 'Decrypt' : 'Encrypt'}</button>
                <button type="button" class="removeProject rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-neonPink">Remove</button>
            </div>
        </div>
        <div class="grid gap-4 mt-4 md:grid-cols-2">
            <div>
                <label class="block text-slate-300 text-sm mb-1">Title</label>
                <input class="project-title w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${project.title || ''}" />
            </div>
            <div>
                <label class="block text-slate-300 text-sm mb-1">Category</label>
                <input class="project-category w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${project.category || ''}" />
            </div>
        </div>
        <div class="grid gap-4 mt-4 md:grid-cols-2">
            <div>
                <label class="block text-slate-300 text-sm mb-1">Status</label>
                <input class="project-status w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${project.status || ''}" />
            </div>
            <div>
                <label class="block text-slate-300 text-sm mb-1">Privacy</label>
                <select class="project-privacy w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue">
                    <option value="public" ${project.privacy !== 'private' ? 'selected' : ''}>Public</option>
                    <option value="private" ${project.privacy === 'private' ? 'selected' : ''}>Private</option>
                </select>
            </div>
        </div>
        <div class="mt-4">
            <label class="block text-slate-300 text-sm mb-1">Link</label>
            <input class="project-link w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${project.link || ''}" ${isEncrypted ? 'disabled' : ''} />
        </div>
        <div class="mt-4">
            <label class="block text-slate-300 text-sm mb-1">Description</label>
            <textarea class="project-description w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" rows="3" ${isEncrypted ? 'disabled' : ''}>${project.description || ''}</textarea>
        </div>
        <div class="mt-4">
            <label class="block text-slate-300 text-sm mb-1">Tech</label>
            <input class="project-tech w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${project.tech || ''}" ${isEncrypted ? 'disabled' : ''} />
        </div>
    `;

    wrapper.querySelector('.removeProject').addEventListener('click', () => wrapper.remove());

    wrapper.querySelector('.encryptToggle').addEventListener('click', async () => {
        const password = window.prompt('Enter the project encryption password');
        if (!password) return;
        if (wrapper.dataset.encrypted === 'true') {
            await decryptProjectRow(wrapper, password);
        } else {
            await encryptProjectRow(wrapper, password);
        }
        refreshEncryptorOptions();
    });

    return wrapper;
}

function createContactLinkRow(link = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'rounded-2xl border border-slate-700 bg-slate-950/90 p-4 flex flex-col gap-4';

    wrapper.innerHTML = `
        <div class="flex items-start justify-between gap-4">
            <h3 class="font-semibold text-slate-100">Contact link</h3>
            <button type="button" class="removeLink rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-neonPink">Remove</button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
            <div>
                <label class="block text-slate-300 text-sm mb-1">Name</label>
                <input class="link-name w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${link.name || ''}" />
            </div>
            <div>
                <label class="block text-slate-300 text-sm mb-1">URL</label>
                <input class="link-url w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${link.url || ''}" />
            </div>
        </div>
        <div>
            <label class="block text-slate-300 text-sm mb-1">Icon</label>
            <input class="link-icon w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-100 outline-none focus:border-neonBlue" value="${link.icon || ''}" placeholder="e.g. 🐙" />
        </div>
    `;

    wrapper.querySelector('.removeLink').addEventListener('click', () => wrapper.remove());
    return wrapper;
}

function clearProjects() {
    projectsList.innerHTML = '';
}

function clearLinks() {
    contactLinksList.innerHTML = '';
}

function updateProjectRows(projects = []) {
    clearProjects();
    if (!projects.length) {
        projectsList.appendChild(createProjectRow({}, 0));
    } else {
        projects.forEach((project, index) => projectsList.appendChild(createProjectRow(project, index)));
    }
    refreshEncryptorOptions();
}

function updateLinkRows(links = []) {
    clearLinks();
    if (!links.length) {
        contactLinksList.appendChild(createContactLinkRow());
        return;
    }
    links.forEach(link => contactLinksList.appendChild(createContactLinkRow(link)));
}

async function loadContent() {
    setStatus('Loading content...', 'info');
    try {
        const response = await fetch(`${API_BASE}/content`);
        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            throw new Error('Failed to load content');
        }
        const data = await response.json();
        currentContent = data;

        heroNameInput.value = data.name || '';
        heroBrandInput.value = data.brand || '';
        heroTaglineInput.value = data.tagline || '';
        aboutTextInput.value = data.about || '';
        heroPhotoUrlInput.value = data.photoUrl || '';
        skillsTextInput.value = Array.isArray(data.skills) ? data.skills.join(', ') : '';
        certificationsTextInput.value = Array.isArray(data.certifications) ? data.certifications.join(', ') : '';
        contactEmailInput.value = data.contactEmail || '';

        updateProjectRows(Array.isArray(data.projects) ? data.projects : []);
        updateLinkRows(Array.isArray(data.contactLinks) ? data.contactLinks : []);
        renderDashboardStats(data);

        setStatus('Loaded current content. Edit the fields and save.', 'success');
    } catch (error) {
        setStatus('Unable to load content. Is the backend running?', 'error');
        console.error(error);
    }
}

function collectProjects() {
    return Array.from(projectsList.children).map(wrapper => {
        const encrypted = wrapper.dataset.encrypted === 'true';
        const project = {
            title: wrapper.querySelector('.project-title').value.trim(),
            category: wrapper.querySelector('.project-category').value.trim(),
            status: wrapper.querySelector('.project-status').value.trim(),
            privacy: wrapper.querySelector('.project-privacy').value,
        };

        if (encrypted) {
            return {
                ...project,
                encrypted: true,
                payload: wrapper.dataset.payload,
                iv: wrapper.dataset.iv
            };
        }

        return {
            ...project,
            link: wrapper.querySelector('.project-link').value.trim(),
            description: wrapper.querySelector('.project-description').value.trim(),
            tech: wrapper.querySelector('.project-tech').value.trim()
        };
    }).filter(project => project.title || project.description || project.category || project.encrypted);
}

function collectLinks() {
    return Array.from(contactLinksList.children).map(item => ({
        name: item.querySelector('.link-name').value.trim(),
        url: item.querySelector('.link-url').value.trim(),
        icon: item.querySelector('.link-icon').value.trim()
    })).filter(link => link.name || link.url);
}

function gatherFormData() {
    return {
        name: heroNameInput.value.trim(),
        brand: heroBrandInput.value.trim(),
        tagline: heroTaglineInput.value.trim(),
        about: aboutTextInput.value.trim(),
        photoUrl: heroPhotoUrlInput.value.trim(),
        projects: collectProjects(),
        skills: skillsTextInput.value.split(',').map(item => item.trim()).filter(Boolean),
        certifications: certificationsTextInput.value.split(',').map(item => item.trim()).filter(Boolean),
        contactEmail: contactEmailInput.value.trim(),
        contactLinks: collectLinks()
    };
}

function renderPreview(data) {
    if (!previewPanel) return;

    const projectsHtml = data.projects.length
        ? data.projects.slice(0, 2).map(project => `
            <div class="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div class="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 mb-2">
                    <span>${project.category || 'Project'}</span>
                    <span>${project.status || 'LIVE'}</span>
                </div>
                <h3 class="text-white font-bold text-base mb-2">${project.title || 'Untitled project'}</h3>
                <p class="text-slate-400 text-sm mb-2">${project.description || 'No description yet.'}</p>
                <p class="text-slate-500 text-xs">${project.tech || 'Tech not specified'}</p>
            </div>
        `).join('')
        : '<p class="text-slate-500">Add at least one project to preview it here.</p>';

    const photoHtml = data.photoUrl ? `<div class="rounded-3xl overflow-hidden border border-slate-700 bg-slate-950"><img src="${data.photoUrl}" alt="Profile photo" class="h-48 w-full object-cover filter grayscale hover:grayscale-0 transition duration-300" /></div>` : '';
    const linksHtml = data.contactLinks.length
        ? data.contactLinks.map(link => `<span class="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">${link.icon || '🔗'} ${link.name}</span>`).join(' ')
        : '<p class="text-slate-500">Add a contact link to preview it.</p>';

    previewPanel.innerHTML = `
        <div class="rounded-2xl border border-slate-700 bg-slate-900/90 p-4 space-y-4">
            ${photoHtml}
            <div>
                <p class="text-slate-400 text-xs uppercase tracking-widest">Hero preview</p>
                <h2 class="text-xl font-bold text-white mt-2">${data.name || 'Your Name'}</h2>
                <p class="text-slate-400">${data.tagline || 'Your tagline goes here.'}</p>
            </div>
            <div>
                <p class="text-slate-400 text-xs uppercase tracking-widest">About</p>
                <p class="mt-2 text-slate-300 text-sm">${data.about || 'A short summary of your background and strengths.'}</p>
            </div>
            <div>
                <p class="text-slate-400 text-xs uppercase tracking-widest">Projects preview</p>
                <div class="mt-3 grid gap-4">${projectsHtml}</div>
            </div>
            <div>
                <p class="text-slate-400 text-xs uppercase tracking-widest">Contact preview</p>
                <div class="mt-3 flex flex-wrap gap-2">${linksHtml}</div>
            </div>
            <div>
                <p class="text-slate-400 text-xs uppercase tracking-widest">Skills</p>
                <p class="mt-2 text-slate-300 text-sm">${data.skills.length ? data.skills.join(', ') : 'Add skills to show them here.'}</p>
            </div>
        </div>
    `;
}

async function saveContent(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    setSaveButtonState(true);
    setStatus('Saving content...', 'info');

    const payload = gatherFormData();

    try {
        const response = await fetch(`${API_BASE}/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Save failed');
        }

        setStatus('Content saved successfully. Refresh the portfolio page to see updates.', 'success');
        renderPreview(payload);
    } catch (error) {
        if (error.message === 'Unauthorized') {
            handleUnauthorized();
            return;
        }
        setStatus(`Save failed: ${error.message}`, 'error');
        console.error(error);
    } finally {
        setSaveButtonState(false);
    }
}

function renderDashboardStats(data) {
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const publicProjects = projects.filter(item => item.privacy !== 'private');
    const privateProjects = projects.filter(item => item.privacy === 'private');
    const encryptedProjects = projects.filter(item => item.encrypted === true);

    if (!dashboardStats) return;
    dashboardStats.innerHTML = `
        <div class="rounded-3xl border border-neonBlue/20 bg-slate-900/90 p-6">
            <p class="text-slate-400 text-sm uppercase tracking-widest">Total projects</p>
            <p class="mt-3 text-3xl font-bold text-white">${projects.length}</p>
        </div>
        <div class="rounded-3xl border border-neonBlue/20 bg-slate-900/90 p-6">
            <p class="text-slate-400 text-sm uppercase tracking-widest">Public projects</p>
            <p class="mt-3 text-3xl font-bold text-white">${publicProjects.length}</p>
        </div>
        <div class="rounded-3xl border border-neonBlue/20 bg-slate-900/90 p-6">
            <p class="text-slate-400 text-sm uppercase tracking-widest">Private projects</p>
            <p class="mt-3 text-3xl font-bold text-white">${privateProjects.length}</p>
        </div>
        <div class="rounded-3xl border border-neonBlue/20 bg-slate-900/90 p-6">
            <p class="text-slate-400 text-sm uppercase tracking-widest">Encrypted projects</p>
            <p class="mt-3 text-3xl font-bold text-white">${encryptedProjects.length}</p>
        </div>
    `;
}

function textToArrayBuffer(text) {
    return new TextEncoder().encode(text);
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

async function deriveKey(password) {
    const passwordData = textToArrayBuffer(password);
    const hash = await crypto.subtle.digest('SHA-256', passwordData);
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptProjectRow(wrapper, password) {
    const link = wrapper.querySelector('.project-link').value.trim();
    const description = wrapper.querySelector('.project-description').value.trim();
    const tech = wrapper.querySelector('.project-tech').value.trim();
    const payload = JSON.stringify({ link, description, tech });
    const key = await deriveKey(password);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textToArrayBuffer(payload));

    wrapper.dataset.encrypted = 'true';
    wrapper.dataset.payload = arrayBufferToBase64(encryptedData);
    wrapper.dataset.iv = arrayBufferToBase64(iv);
    wrapper.querySelector('.project-privacy').value = 'private';
    wrapper.querySelector('.project-link').value = 'Encrypted content';
    wrapper.querySelector('.project-description').value = 'Encrypted content';
    wrapper.querySelector('.project-tech').value = 'Encrypted content';
    wrapper.querySelector('.project-link').disabled = true;
    wrapper.querySelector('.project-description').disabled = true;
    wrapper.querySelector('.project-tech').disabled = true;
    wrapper.querySelector('.encryptToggle').textContent = 'Decrypt';
    renderDashboardStats(gatherFormData());
    setEncryptorStatus('Project encrypted successfully.', 'success');
}

async function decryptProjectRow(wrapper, password) {
    try {
        const payloadB64 = wrapper.dataset.payload;
        const ivB64 = wrapper.dataset.iv;
        if (!payloadB64 || !ivB64) {
            throw new Error('No encrypted payload found.');
        }

        const key = await deriveKey(password);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: base64ToArrayBuffer(ivB64) },
            key,
            base64ToArrayBuffer(payloadB64)
        );

        const decoded = new TextDecoder().decode(decrypted);
        const { link, description, tech } = JSON.parse(decoded);

        wrapper.dataset.encrypted = 'false';
        wrapper.dataset.payload = '';
        wrapper.dataset.iv = '';
        wrapper.querySelector('.project-link').value = link;
        wrapper.querySelector('.project-description').value = description;
        wrapper.querySelector('.project-tech').value = tech;
        wrapper.querySelector('.project-link').disabled = false;
        wrapper.querySelector('.project-description').disabled = false;
        wrapper.querySelector('.project-tech').disabled = false;
        wrapper.querySelector('.encryptToggle').textContent = 'Encrypt';
        renderDashboardStats(gatherFormData());
        setEncryptorStatus('Project decrypted successfully.', 'success');
    } catch (error) {
        setEncryptorStatus('Unable to decrypt with that password.', 'error');
        console.error(error);
    }
}

function refreshEncryptorOptions() {
    if (!encryptorProjectSelect) return;
    encryptorProjectSelect.innerHTML = '';
    Array.from(projectsList.children).forEach((wrapper, index) => {
        const title = wrapper.querySelector('.project-title')?.value.trim() || `Project ${index + 1}`;
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = `${title} ${wrapper.dataset.encrypted === 'true' ? '(Encrypted)' : ''}`;
        encryptorProjectSelect.appendChild(option);
    });
}

function getSelectedProjectWrapper() {
    const index = Number(encryptorProjectSelect.value);
    return projectsList.children[index] || null;
}

async function encryptSelectedProject() {
    const wrapper = getSelectedProjectWrapper();
    const password = encryptorPasswordInput.value.trim();
    if (!wrapper) {
        setEncryptorStatus('Select a project first.', 'error');
        return;
    }
    if (!password) {
        setEncryptorStatus('Enter a password to encrypt project data.', 'error');
        return;
    }
    if (wrapper.dataset.encrypted === 'true') {
        setEncryptorStatus('Project is already encrypted. Use decrypt.', 'error');
        return;
    }
    await encryptProjectRow(wrapper, password);
    refreshEncryptorOptions();
}

async function decryptSelectedProject() {
    const wrapper = getSelectedProjectWrapper();
    const password = encryptorPasswordInput.value.trim();
    if (!wrapper) {
        setEncryptorStatus('Select a project first.', 'error');
        return;
    }
    if (!password) {
        setEncryptorStatus('Enter a password to decrypt project data.', 'error');
        return;
    }
    if (wrapper.dataset.encrypted !== 'true') {
        setEncryptorStatus('Project is not encrypted.', 'error');
        return;
    }
    await decryptProjectRow(wrapper, password);
    refreshEncryptorOptions();
}

loadButton.addEventListener('click', event => {
    event.preventDefault();
    loadContent();
});

logoutButton.addEventListener('click', async () => {
    try {
        await fetch(`${API_BASE}/logout`, { method: 'POST' });
    } catch (error) {
        console.warn('Logout request failed', error);
    }
    window.location.href = '/login';
});

addProjectButton.addEventListener('click', () => {
    const wrapper = createProjectRow({}, projectsList.children.length);
    projectsList.appendChild(wrapper);
    refreshEncryptorOptions();
});

addLinkButton.addEventListener('click', () => {
    contactLinksList.appendChild(createContactLinkRow());
});

refreshPreviewButton.addEventListener('click', () => {
    renderPreview(gatherFormData());
});

if (refreshPreviewEditor) {
    refreshPreviewEditor.addEventListener('click', () => {
        renderPreview(gatherFormData());
    });
}

encryptButton.addEventListener('click', encryptSelectedProject);
decryptButton.addEventListener('click', decryptSelectedProject);

adminForm.addEventListener('input', () => {
    renderPreview(gatherFormData());
    renderDashboardStats(gatherFormData());
});

saveButton.addEventListener('click', saveContent);
if (saveButtonEditor) {
    saveButtonEditor.addEventListener('click', saveContent);
}

window.addEventListener('popstate', () => {
    showPage(getCurrentPageFromPath());
});

window.addEventListener('load', async () => {
    updateProjectRows();
    updateLinkRows();
    renderPreview(gatherFormData());
    updateNavigation();
    showPage(getCurrentPageFromPath());
    await loadContent();
});
