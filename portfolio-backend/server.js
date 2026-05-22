const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'secret123';
const contentFilePath = path.join(__dirname, 'content.json');
const messagesFilePath = path.join(__dirname, 'messages.json');
const publicSiteRoot = path.resolve(__dirname, '..');
const SESSION_TTL = 1000 * 60 * 60; // 1 hour
const sessions = new Map();

function loadMessages() {
    try {
        const raw = fs.readFileSync(messagesFilePath, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        return [];
    }
}

function saveMessages(messages) {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf-8');
}

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log('[REQ]', req.method, req.originalUrl);
    next();
});

function loadContent() {
    try {
        const rawData = fs.readFileSync(contentFilePath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Unable to load content.json:', error);
        return null;
    }
}

function saveContent(data) {
    fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

function parseCookies(req) {
    const header = req.headers.cookie || '';
    return header.split(';').reduce((cookies, part) => {
        const [name, ...rest] = part.trim().split('=');
        if (!name) return cookies;
        cookies[name] = rest.join('=');
        return cookies;
    }, {});
}

function createSession() {
    const token = crypto.randomBytes(24).toString('hex');
    const expires = Date.now() + SESSION_TTL;
    sessions.set(token, expires);
    return token;
}

function isSessionValid(token) {
    if (!token || !sessions.has(token)) return false;
    const expires = sessions.get(token);
    if (!expires || expires < Date.now()) {
        sessions.delete(token);
        return false;
    }
    return true;
}

function requireAdminSession(req, res, next) {
    const cookies = parseCookies(req);
    const token = cookies['admin-token'];
    if (!isSessionValid(token)) {
        return res.redirect('/login.html');
    }
    next();
}

function requireAdminApi(req, res, next) {
    const cookies = parseCookies(req);
    const token = cookies['admin-token'];
    if (!isSessionValid(token)) {
        return res.status(401).json({ status: 'DENIED', error: 'Unauthorized' });
    }
    next();
}

function cleanupSessions() {
    const now = Date.now();
    for (const [token, expires] of sessions.entries()) {
        if (expires < now) {
            sessions.delete(token);
        }
    }
}

setInterval(cleanupSessions, 60000);

app.get('/admin.html', requireAdminSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve the single-page admin app for /admin and any nested paths.
app.get(/^\/admin(\/.*)?$/, requireAdminSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/login', (req, res) => {
    const cookies = parseCookies(req);
    const token = cookies['admin-token'];
    if (isSessionValid(token)) {
        return res.redirect('/admin/dashboard');
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/', (req, res) => {
    const indexPath = path.join(publicSiteRoot, 'index.html');
    console.log('[ROUTE] GET / -> sending public index:', publicSiteRoot, indexPath);
    res.sendFile(indexPath);
});

app.use(express.static(publicSiteRoot));
app.use(express.static(__dirname));

let receivedMessages = loadMessages();

// Content endpoints
app.get('/api/content', (req, res) => {
    const content = loadContent();
    if (!content) {
        return res.status(500).json({ status: 'ERROR', error: 'Unable to load content store' });
    }
    res.json(content);
});

app.post('/api/login', (req, res) => {
    const { secret } = req.body;
    if (!secret || secret !== ADMIN_SECRET) {
        return res.status(401).json({ status: 'DENIED', error: 'Invalid admin secret' });
    }

    const token = createSession();
    res.cookie('admin-token', token, {
        httpOnly: true,
        maxAge: SESSION_TTL,
        sameSite: 'lax',
        path: '/'
    });
    res.json({ status: 'AUTHORIZED' });
});

app.post('/api/logout', requireAdminApi, (req, res) => {
    const cookies = parseCookies(req);
    const token = cookies['admin-token'];
    if (token) {
        sessions.delete(token);
    }
    res.clearCookie('admin-token', { path: '/' });
    res.json({ status: 'LOGGED_OUT' });
});

app.post('/api/content', requireAdminApi, (req, res) => {
    const content = req.body;
    if (!content || typeof content !== 'object') {
        return res.status(400).json({ status: 'DENIED', error: 'Content payload must be a valid object' });
    }

    try {
        saveContent(content);
        return res.json({ status: 'SAVED', message: 'Content updated successfully' });
    } catch (error) {
        console.error('Unable to save content:', error);
        return res.status(500).json({ status: 'ERROR', error: 'Failed to persist content' });
    }
});

// API endpoints
app.post('/api/messages', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ status: "DENIED", error: "Missing required packet strings" });
    }

    const newLog = { id: Date.now(), name, email, message, timestamp: new Date() };
    receivedMessages.push(newLog);
    saveMessages(receivedMessages);
    
    console.log("📥 NEW COMM RECEIVED:\n", newLog);
    
    return res.status(201).json({ status: "ACCEPTED", message: "Packet successfully cataloged" });
});

app.get('/api/messages', requireAdminApi, (req, res) => {
    const messages = loadMessages();
    res.json({ messages });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ systemStatus: "OPERATIONAL", databaseLogs: receivedMessages.length });
});

app.listen(PORT, () => {
    console.log(`[SYSTEM RUNNING] Cyber-api server online on port ${PORT}`);
});