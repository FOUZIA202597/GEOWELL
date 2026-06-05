/**
 * GeoWell User Hub — v3.0 Supervision Sectorielle
 * Handles: RBAC, Sector Auth, Role Cards, applyRolePermissions, i18n-aware welcome
 */

// ── Sector → RBAC mapping ─────────────────────────────────────
const SECTOR_ROLE_MAP = {
    ANRH: 'ADMIN', ADE: 'ADMIN', DRE: 'ADMIN', ONA: 'ADMIN',
    ADMIN: 'ADMIN', ENGINEER: 'ENGINEER', STUDENT: 'STUDENT', FARMER: 'FARMER'
};

const SECTOR_COLORS = {
    ANRH: '#00d4ff', ADE: '#3498db', DRE: '#9b59b6',
    ONA: '#27ae60', ENGINEER: '#e67e22', STUDENT: '#1abc9c', FARMER: '#f39c12'
};

const SECTOR_ICONS = {
    ANRH: 'fa-water', ADE: 'fa-faucet-drip', DRE: 'fa-building-columns',
    ONA: 'fa-recycle', ENGINEER: 'fa-drafting-compass',
    STUDENT: 'fa-graduation-cap', FARMER: 'fa-tractor'
};

const SECTOR_INSTITUTIONS = {
    ANRH: 'ANRH — Agence Nationale des Ressources Hydrauliques',
    ADE:  'ADE — Algérienne des Eaux',
    DRE:  'DRE — Direction des Ressources en Eau',
    ONA:  'ONA — Office National de l\'Assainissement',
    ENGINEER: 'Bureau d\'Études / Expert Privé',
    STUDENT:  'Université / Institut de Recherche',
    FARMER:   'Exploitation Agricole'
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    applyRolePermissions();
});

// ── Role Card Selector ────────────────────────────────────────
window.selectRole = function(formPrefix, sector, card) {
    // Clear all selected in this grid
    const grid = document.getElementById(formPrefix + '-role-grid');
    if (grid) {
        grid.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    }
    card.classList.add('selected');

    // Update hidden input
    const hidden = document.getElementById(formPrefix + '-role');
    if (hidden) hidden.value = sector;

    // Auto-fill institution placeholder for signup
    if (formPrefix === 'signup') {
        const instInput = document.getElementById('signup-inst');
        if (instInput && SECTOR_INSTITUTIONS[sector]) {
            instInput.placeholder = SECTOR_INSTITUTIONS[sector];
        }
    }

    // Show email domain hint
    const emailInput = document.getElementById(formPrefix + '-email');
    const domainHints = {
        ANRH: 'name@anrh.dz',
        ADE:  'name@ade.dz',
        DRE:  'name@dre.gov.dz',
        ONA:  'name@ona.dz'
    };
    if (emailInput) {
        emailInput.placeholder = domainHints[sector] || 'name@institution.dz';
    }

    // Visual feedback
    const color = SECTOR_COLORS[sector] || '#00d4ff';
    card.style.borderColor = color;
    card.style.boxShadow = `0 0 14px ${color}44`;
    card.querySelector('i').style.color = color;
};

// ── Auth Action ───────────────────────────────────────────────
window.switchAuthMode = function(mode) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));
    if (mode === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('auth-view-login').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('auth-view-signup').classList.add('active');
    }
    if (typeof window.i18nInit === 'function') window.i18nInit(window.currentLang);
};

window.handleAuthAction = function(e, isSignup) {
    const btn = e.currentTarget;
    const originalHTML = btn.innerHTML;

    // Read all inputs — both login and signup
    const nameInput  = document.getElementById(isSignup ? 'signup-name'  : 'login-name');
    const emailInput = document.getElementById(isSignup ? 'signup-email' : 'login-email');
    const instInput  = document.getElementById(isSignup ? 'signup-inst'  : 'login-inst');

    const email = emailInput?.value?.trim() || '';
    const name  = nameInput?.value?.trim()  || (email ? email.split('@')[0] : 'Utilisateur');
    const inst  = instInput?.value?.trim()  || '';

    // Sector from hidden input (set by selectRole)
    const sectorId = isSignup ? 'signup-role' : 'login-role';
    const sector = document.getElementById(sectorId)?.value || 'ANRH';

    if (!email) {
        showToast('⚠️ يرجى إدخال البريد الإلكتروني', 'error');
        return;
    }

    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> SECURING SESSION...';
    btn.disabled = true;

    setTimeout(() => {
        const role = SECTOR_ROLE_MAP[sector] || 'STUDENT';
        const color = SECTOR_COLORS[sector] || '#00d4ff';

        window.mockData.activeUser.name        = name || 'Utilisateur';
        window.mockData.activeUser.role        = role;
        window.mockData.activeUser.sector      = sector;
        window.mockData.activeUser.institution = inst || SECTOR_INSTITUTIONS[sector] || sector;
        window.mockData.activeUser.tier        = getTierName(role, sector);
        window.mockData.activeUser.sectorColor = color;

        updateUserUI();
        applyRolePermissions();

        document.getElementById('auth-overlay').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('auth-overlay').style.visibility = 'hidden';
            // i18n-aware welcome
            const welcomeKey = 'welcome_' + sector;
            const welcomeMsg = window.getText ? window.getText(welcomeKey) : `✅ Welcome — ${sector}`;
            showToast(welcomeMsg + (name ? ` — ${name}` : ''), 'success');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 500);
    }, 1600);
};

window.handleCommitteeBypass = function() {
    window.mockData.activeUser.role      = 'ADMIN';
    window.mockData.activeUser.sector    = 'DRE';
    window.mockData.activeUser.name      = 'Comité / Guest';
    window.mockData.activeUser.tier      = 'Committee';
    window.mockData.activeUser.institution = 'Comité de Supervision';
    updateUserUI();
    applyRolePermissions();
    document.getElementById('auth-overlay').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('auth-overlay').style.visibility = 'hidden';
        showToast('👥 دخول اللجنة — Committee Guest Access', 'info');
    }, 300);
};

// ── Tier name ─────────────────────────────────────────────────
function getTierName(role, sector) {
    const sectorNames = { ANRH: 'ANRH', ADE: 'ADE', DRE: 'DRE', ONA: 'ONA' };
    if (sectorNames[sector]) return sectorNames[sector];
    const tiers = { ADMIN: 'Superior', ENGINEER: 'Premium', STUDENT: 'Academic', FARMER: 'Field' };
    return tiers[role] || 'Academic';
}

// ── Update sidebar user profile ───────────────────────────────
function updateUserUI() {
    const user = window.mockData?.activeUser;
    if (!user) return;

    const sector = user.sector;
    const color  = SECTOR_COLORS[sector] || '#00d4ff';
    const icon   = SECTOR_ICONS[sector]  || 'fa-user';

    const nameEl = document.getElementById('user-display-name');
    const instEl = document.getElementById('user-institution');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (instEl) instEl.textContent = user.institution || sector;
    if (avatarEl) {
        // Replace avatar with sector icon if institutional
        if (sector && SECTOR_ICONS[sector]) {
            avatarEl.style.display = 'none';
            let iconWrap = document.getElementById('user-avatar-icon');
            if (!iconWrap) {
                iconWrap = document.createElement('div');
                iconWrap.id = 'user-avatar-icon';
                iconWrap.style.cssText = `width:40px;height:40px;border-radius:50%;border:2px solid ${color};display:flex;align-items:center;justify-content:center;background:${color}22;font-size:1.1rem;flex-shrink:0;`;
                avatarEl.parentNode.insertBefore(iconWrap, avatarEl);
            }
            iconWrap.innerHTML = `<i class="fa-solid ${icon}" style="color:${color};"></i>`;
            iconWrap.style.borderColor = color;
        } else {
            avatarEl.style.display = '';
        }
    }

    // Credits & days
    const creditsEl = document.getElementById('user-credits') || document.getElementById('modal-ac-credits');
    const daysEl    = document.getElementById('sub-days') || document.getElementById('modal-ac-days');
    if (creditsEl) creditsEl.textContent = user.credits;
    if (daysEl)    daysEl.textContent = user.daysLeft;

    // Role badge
    const badge = document.getElementById('user-role-badge');
    if (badge) {
        badge.textContent = user.tier || sector;
        badge.className = 'role-badge ' + getRoleBadgeClass(user.role, sector);
        badge.style.color = color;
        badge.style.borderColor = color + '55';
        badge.style.background = color + '18';
    }
}

function getRoleBadgeClass(role, sector) {
    const sectorClasses = { ANRH: 'role-anrh', ADE: 'role-ade', DRE: 'role-dre', ONA: 'role-ona' };
    if (sectorClasses[sector]) return sectorClasses[sector];
    const classes = { ADMIN: 'role-superior', ENGINEER: 'role-premium', STUDENT: 'role-academic', FARMER: 'role-field' };
    return classes[role] || 'role-academic';
}

// ── Apply Role Permissions (RBAC) ─────────────────────────────
window.applyRolePermissions = function() {
    const user   = window.mockData?.activeUser;
    if (!user) return;
    const role   = user.role;
    const sector = user.sector;
    const color  = SECTOR_COLORS[sector] || '#00d4ff';
    const icon   = SECTOR_ICONS[sector]  || 'fa-user';

    // Check sector permissions matrix
    const sectorPerms = (window.permissionsMatrix && window.permissionsMatrix[sector])
        ? window.permissionsMatrix[sector]
        : (window.permissionsMatrix?.[role] || {});

    updateUserUI();

    // 1. Nav visibility
    document.querySelectorAll('.nav-item[data-role-access]').forEach(item => {
        const access = item.getAttribute('data-role-access');
        if (access === 'ALL') {
            item.style.display = '';
            return;
        }
        const allowed = access.split(',').map(r => r.trim());
        const hasAccess = allowed.includes(role) || allowed.includes(sector);
        item.style.display = hasAccess ? '' : 'none';
        if (!hasAccess) {
            const view = item.getAttribute('data-view');
            const activeViewEl = document.getElementById('view-' + view);
            if (activeViewEl && activeViewEl.classList.contains('active')) {
                if (typeof switchView === 'function') switchView('dashboard');
            }
        }
    });

    // 2. Feature locks via permissions matrix
    const featureMap = {
        'btn-export-gis':   'export_shp',
        'btnNeuralMap':     'neural_ai',
        'btn-qgis-link':    'qgis',
        'btn-gis-write':    'gis_write',
    };
    Object.entries(featureMap).forEach(([elId, permKey]) => {
        const el = document.getElementById(elId);
        if (!el) return;
        const allowed = sectorPerms[permKey] !== undefined ? sectorPerms[permKey] : true;
        el.style.opacity = allowed ? '1' : '0.35';
        el.style.pointerEvents = allowed ? '' : 'none';
        el.title = allowed ? '' : '🔒 ' + (window.getText ? window.getText('role_label') : 'Permission required');
        if (!allowed) {
            el.onclick = () => { showToast(`🔒 هذه الميزة تتطلب صلاحية أعلى`, 'error'); return false; };
        }
    });

    // 3. Neural AI button special handling
    const neuralBtn = document.getElementById('btnNeuralMap');
    if (neuralBtn) {
        const aiAllowed = sectorPerms['neural_ai'] !== false;
        if (!aiAllowed) {
            neuralBtn.style.opacity = '0.4';
            neuralBtn.onclick = () => { showToast('هذه الميزة تتطلب اشتراكاً أعلى', 'error'); return false; };
        } else {
            neuralBtn.style.opacity = '1';
        }
    }

    // 4. Farmer simplified mode
    if (role === 'FARMER') {
        document.body.setAttribute('data-farmer-mode', 'true');
    } else {
        document.body.removeAttribute('data-farmer-mode');
    }

    // 5. Inject welcome banner on dashboard (sector-colored)
    const dashView = document.getElementById('view-dashboard');
    if (dashView) {
        let banner = document.getElementById('role-welcome-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'role-welcome-banner';
            banner.className = 'role-welcome-banner';
            const firstCard = dashView.querySelector('.card, .kpi-grid, .dashboard-grid');
            if (firstCard) dashView.insertBefore(banner, firstCard);
            else dashView.prepend(banner);
        }
        const welcomeKey = 'welcome_' + sector;
        const msg = window.getText ? window.getText(welcomeKey) : `${sector} — Access Active`;
        banner.style.cssText = `background:${color}12;border:1px solid ${color}44;color:${color};display:flex;align-items:center;gap:0.8rem;padding:0.6rem 1rem;border-radius:10px;margin-bottom:1rem;font-size:0.83rem;font-weight:600;`;
        banner.innerHTML = `<i class="fa-solid ${icon}" style="font-size:1.1rem;"></i><span>${msg}</span>`;
    }

    // 6. Admin supervision nav badge
    const badge = document.getElementById('admin-pending-badge');
    if (badge && window.mockUsers) {
        badge.textContent = window.mockUsers.filter(u => u.status === 'PENDING').length;
    }
};

// ── Language Switcher ─────────────────────────────────────────
window.setLang = function(lang) {
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
        if (b.innerText.trim().toLowerCase() === lang.toLowerCase()) b.classList.add('active');
    });
    if (typeof window.i18nInit === 'function') window.i18nInit(lang);
    const toastMsg = window.getText ? window.getText('lng_toast') : 'Language Updated';
    showToast(toastMsg, 'success');

    // Re-apply role permissions to refresh welcome banner text
    setTimeout(() => {
        if (typeof applyRolePermissions === 'function') applyRolePermissions();
    }, 100);
};

// ── Pricing & Subscription ───────────────────────────────────
window.openPricingModal = function() {
    document.getElementById('modal-pricing')?.classList.add('active');
};

window.closeInnovationModal = function(id) {
    document.getElementById(id)?.classList.remove('active');
};

window.simulateRoleChange = function(newRole) {
    const plans = window.mockData?.subscriptionPlans;
    const plan = plans?.find(p => p.role === newRole);
    if (plan) {
        window.mockData.activeUser.role   = plan.role;
        window.mockData.activeUser.tier   = plan.name;
        window.mockData.activeUser.sector = newRole;
        window.mockData.activeUser.credits = (newRole === 'ADMIN' || newRole === 'ENGINEER') ? 99 : 5;
        updateUserUI();
        applyRolePermissions();
        closeInnovationModal('modal-pricing');
        showToast(`Role switched to ${plan.name}`, 'info');
    }
};

// ── BaridiMob Payment ─────────────────────────────────────────
window.openBaridiMob = function() {
    closeInnovationModal('modal-pricing');
    document.getElementById('modal-baridimob')?.classList.add('active');
};

window.processPayment = function() {
    const btn = document.querySelector('.baridi-btn');
    if (!btn) return;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> TRAITEMENT...';
    btn.disabled = true;
    setTimeout(() => {
        showToast('Paiement BaridiMob réussi ! Bienvenue dans GeoWell Premium.', 'success');
        simulateRoleChange('ENGINEER');
        closeInnovationModal('modal-baridimob');
        btn.innerHTML = 'PAYER MAINTENANT';
        btn.disabled = false;
    }, 2500);
};

// ── Well Passport ─────────────────────────────────────────────
window.openWellPassport = function(wellId) {
    const el = document.getElementById('p-id');
    if (el) el.textContent = wellId || 'W-00987-B';
    document.getElementById('modal-well-passport')?.classList.add('active');
};

// ── User Account Modal ────────────────────────────────────────
window.openUserAccount = function() {
    const user = window.mockData?.activeUser;
    if (!user) return;
    document.getElementById('modal-ac-credits').textContent = user.credits;
    document.getElementById('modal-ac-days').textContent    = user.daysLeft;
    document.getElementById('modal-ac-role').textContent    = user.tier;
    document.getElementById('modal-ac-inst').textContent    = user.institution;
    document.getElementById('modal-user-account')?.classList.add('active');
};

// ── Permission Check Helper ───────────────────────────────────
window.checkActionPermission = function(requiredRole) {
    const current = window.mockData?.activeUser?.role;
    const hierarchy = { STUDENT: 1, FARMER: 1, ENGINEER: 3, ADMIN: 4 };
    if ((hierarchy[current] || 0) < (hierarchy[requiredRole] || 99)) {
        showToast(`هذه الميزة تتطلب مستوى ${requiredRole}`, 'error');
        openPricingModal();
        return false;
    }
    return true;
};

window.handleLogin = function() { handleAuthAction({ currentTarget: document.querySelector('.btn-auth') }, false); };
