// =====================================================
// VideoAI Studio - SaaS Application
// =====================================================

const API_BASE = window.location.origin;

// State
let currentUser = null;
let currentJobId = null;
let statusCheckInterval = null;

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    initializeRouter();
    initializeDashboard();
});

// =====================================================
// Authentication System
// =====================================================

function initializeAuth() {
    // Check for existing session
    const session = sessionStorage.getItem('videoai_session');
    if (session) {
        try {
            currentUser = JSON.parse(session);
            updateUserUI();
        } catch (e) {
            sessionStorage.removeItem('videoai_session');
        }
    }
}

function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorEl = document.getElementById('signup-error');

    // Validation
    if (!name || !email || !password) {
        errorEl.textContent = 'All fields are required';
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('videoai_users') || '{}');
    if (users[email]) {
        errorEl.textContent = 'An account with this email already exists';
        return;
    }

    // Create user
    users[email] = {
        name,
        email,
        password: btoa(password), // Simple encoding (use proper hashing in production)
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('videoai_users', JSON.stringify(users));

    // Auto login
    currentUser = { name, email };
    sessionStorage.setItem('videoai_session', JSON.stringify(currentUser));
    updateUserUI();

    showToast('Account created successfully!', 'success');
    navigate('dashboard');
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    // Validation
    if (!email || !password) {
        errorEl.textContent = 'All fields are required';
        return;
    }

    // Check credentials
    const users = JSON.parse(localStorage.getItem('videoai_users') || '{}');
    const user = users[email];

    if (!user || user.password !== btoa(password)) {
        errorEl.textContent = 'Invalid email or password';
        return;
    }

    // Login successful
    currentUser = { name: user.name, email: user.email };
    sessionStorage.setItem('videoai_session', JSON.stringify(currentUser));
    updateUserUI();

    showToast('Welcome back!', 'success');
    navigate('dashboard');
}

function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('videoai_session');
    showToast('Logged out successfully', 'success');
    navigate('landing');
}

function updateUserUI() {
    if (currentUser) {
        const initial = currentUser.name.charAt(0).toUpperCase();
        const avatarEl = document.getElementById('user-avatar');
        const nameEl = document.getElementById('user-name');
        const settingsNameEl = document.getElementById('settings-name');
        const settingsEmailEl = document.getElementById('settings-email');

        if (avatarEl) avatarEl.textContent = initial;
        if (nameEl) nameEl.textContent = currentUser.name;
        if (settingsNameEl) settingsNameEl.textContent = currentUser.name;
        if (settingsEmailEl) settingsEmailEl.textContent = currentUser.email;
    }
}

function isAuthenticated() {
    return currentUser !== null;
}

// =====================================================
// Router
// =====================================================

function initializeRouter() {
    // Handle initial route
    const hash = window.location.hash.slice(1) || 'landing';
    navigate(hash, false);

    // Handle back/forward
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.slice(1) || 'landing';
        showPage(hash);
    });
}

function navigate(page, pushState = true) {
    // Protected routes
    if (page === 'dashboard' && !isAuthenticated()) {
        showToast('Please log in to access the dashboard', 'error');
        page = 'login';
    }

    // Redirect logged in users away from auth pages
    if ((page === 'login' || page === 'signup') && isAuthenticated()) {
        page = 'dashboard';
    }

    if (pushState) {
        window.location.hash = page;
    }

    showPage(page);
}

function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Show target page
    const pageEl = document.getElementById(`${page}-page`);
    if (pageEl) {
        pageEl.classList.add('active');

        // Update user UI when showing dashboard
        if (page === 'dashboard') {
            updateUserUI();
        }
    } else {
        // Fallback to landing
        document.getElementById('landing-page').classList.add('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// =====================================================
// Dashboard
// =====================================================

function initializeDashboard() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab);
        });
    });

    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchMode(mode);
        });
    });
}

function switchTab(tab) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tab);
    });

    // Update tab content
    document.querySelectorAll('.dashboard-tab').forEach(t => {
        t.classList.toggle('active', t.id === `${tab}-tab`);
    });
}

function switchMode(mode) {
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update mode content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.toggle('active', content.id === `${mode}-mode`);
    });
}

function setPrompt(text) {
    document.getElementById('prompt').value = text;
}

// =====================================================
// Video Generation
// =====================================================

async function handleGenerate() {
    const isAiMode = document.querySelector('.mode-btn.active').dataset.mode === 'ai';
    const btn = document.getElementById('generate-btn');

    if (isAiMode) {
        const prompt = document.getElementById('prompt').value.trim();
        if (!prompt) {
            showToast('Please enter a description for your video', 'error');
            return;
        }
        await generateVideoWithAI(prompt);
    } else {
        const tsxCode = document.getElementById('tsxCode').value.trim();
        if (!tsxCode) {
            showToast('Please enter TSX code', 'error');
            return;
        }
        await generateVideoWithCode(tsxCode);
    }
}

async function generateVideoWithAI(prompt) {
    const btn = document.getElementById('generate-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    const config = getVideoConfig();

    try {
        const response = await fetch(`${API_BASE}/api/generate-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, config })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.details
                ? (Array.isArray(data.details) ? data.details.join(', ') : data.details)
                : (data.error || data.message || 'Failed to generate video');
            throw new Error(errorMsg);
        }

        currentJobId = data.jobId;
        showStatusSection();
        startStatusPolling();
        showToast('Video generation started!', 'success');

    } catch (error) {
        console.error('AI generation error:', error);
        showToast(error.message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

async function generateVideoWithCode(tsxCode) {
    const btn = document.getElementById('generate-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    const config = getVideoConfig();

    try {
        const response = await fetch(`${API_BASE}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tsxCode, config })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.details
                ? (Array.isArray(data.details) ? data.details.join(', ') : data.details)
                : (data.error || 'Failed to generate video');
            throw new Error(errorMsg);
        }

        currentJobId = data.jobId;
        showStatusSection();
        startStatusPolling();
        showToast('Video generation started!', 'success');

    } catch (error) {
        console.error('Generation error:', error);
        showToast(error.message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function getVideoConfig() {
    return {
        duration: parseInt(document.getElementById('duration').value, 10),
        fps: parseInt(document.getElementById('fps').value, 10),
        width: 1920,
        height: 1080
    };
}

// =====================================================
// Status Polling
// =====================================================

function startStatusPolling() {
    statusCheckInterval = setInterval(checkJobStatus, 2000);
    checkJobStatus();
}

function stopStatusPolling() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

async function checkJobStatus() {
    if (!currentJobId) return;

    try {
        const response = await fetch(`${API_BASE}/api/status/${currentJobId}`);

        if (!response.ok) {
            throw new Error('Failed to check status');
        }

        const status = await response.json();
        updateStatusDisplay(status);

        if (status.status === 'completed') {
            stopStatusPolling();
            showResultSection();
        } else if (status.status === 'failed') {
            stopStatusPolling();
            showToast(status.error || 'Video generation failed', 'error');
            hideStatusSection();
        }
    } catch (error) {
        console.error('Status check error:', error);
    }
}

// =====================================================
// UI Updates
// =====================================================

function showStatusSection() {
    document.getElementById('status-section').style.display = 'block';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('status-text').textContent = 'Generating your video...';
}

function hideStatusSection() {
    document.getElementById('status-section').style.display = 'none';
}

function showResultSection() {
    document.getElementById('status-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';

    const videoUrl = `${API_BASE}/api/video/${currentJobId}`;
    document.getElementById('video-preview').src = videoUrl;
    document.getElementById('download-btn').href = videoUrl;

    showToast('Your video is ready!', 'success');
}

function updateStatusDisplay(status) {
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('status-text');
    const statusDetails = document.getElementById('status-details');

    progressFill.style.width = `${status.progress}%`;

    const messages = {
        pending: 'Preparing your video...',
        processing: `Rendering video... ${status.progress}%`,
        completed: 'Video completed!',
        failed: 'Generation failed'
    };

    statusText.textContent = messages[status.status] || 'Processing...';

    const elapsed = status.createdAt ? getElapsedTime(new Date(status.createdAt)) : '';
    statusDetails.textContent = elapsed ? `Time elapsed: ${elapsed}` : 'This usually takes 10-30 seconds';
}

function resetCreate() {
    document.getElementById('status-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('prompt').value = '';
    document.getElementById('tsxCode').value = '';
    currentJobId = null;
    stopStatusPolling();
}

// =====================================================
// Toast Notifications
// =====================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// =====================================================
// Utility Functions
// =====================================================

function getElapsedTime(startTime) {
    const elapsed = Date.now() - startTime.getTime();
    const seconds = Math.floor(elapsed / 1000);

    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Expose functions to global scope for onclick handlers
window.navigate = navigate;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.handleGenerate = handleGenerate;
window.setPrompt = setPrompt;
window.switchTab = switchTab;
window.resetCreate = resetCreate;
window.toggleMobileMenu = toggleMobileMenu;
