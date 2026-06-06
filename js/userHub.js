/**
 * GeoWell User Hub — v4.0 Professional SaaS Auth
 * Clean auth: empty fields, confirm password, subscription screen
 */

// ── Sector / Role mappings ─────────────────────────────────────
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
    ENGINEER: 'Bureau d\'Études / Expert GIS',
    STUDENT:  'Université / Institut de Recherche',
    FARMER:   'Exploitation Agricole'
};

// ── Session store (temp) ──────────────────────────────────────
window._pendingUser = null;

// ── OAuth Simulation ────────────────────────────────────────────
window.simulateOAuth = function(provider) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-pass');
    if (!emailInput || !passInput) return;
    
    emailInput.value = `oauth.${provider.toLowerCase()}@example.com`;
    passInput.value = `oauth-secret-${Math.random().toString(36).substr(2, 9)}`;
    
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        window.handleAuthAction({ currentTarget: loginBtn });
    } else {
        window.handleLogin({ currentTarget: document.createElement('button') });
    }
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    applyRolePermissions();
    // Live password validation
    const passEl = document.getElementById('signup-pass');
    if (passEl) {
        passEl.addEventListener('input', () => checkPassStrength(passEl.value));
    }
    const confirmEl = document.getElementById('signup-pass-confirm');
    if (confirmEl) {
        confirmEl.addEventListener('input', () => checkPassMatch());
    }
});

// ── Toggle Password Visibility ────────────────────────────────
window.togglePass = function(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') {
        inp.type = 'text';
        btn.querySelector('i').className = 'fa-solid fa-eye-slash';
    } else {
        inp.type = 'password';
        btn.querySelector('i').className = 'fa-solid fa-eye';
    }
};

// ── Password Strength ─────────────────────────────────────────
function checkPassStrength(pass) {
    const bar   = document.getElementById('pass-strength-bar');
    const fill  = document.getElementById('pass-strength-fill');
    const label = document.getElementById('pass-strength-label');
    if (!bar || !fill || !label) return;

    if (!pass) { bar.style.display = 'none'; label.textContent = ''; return; }
    bar.style.display = 'block';

    let score = 0;
    if (pass.length >= 8)   score++;
    if (pass.length >= 12)  score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const levels = [
        { pct: '20%', color: '#e74c3c', text: '🔴 Weak'    },
        { pct: '40%', color: '#e67e22', text: '🟠 Fair'    },
        { pct: '60%', color: '#f1c40f', text: '🟡 Good'    },
        { pct: '80%', color: '#2ecc71', text: '🟢 Strong'  },
        { pct: '100%',color: '#00d4ff', text: '💎 Excellent'},
    ];
    const lvl = levels[Math.min(score - 1, 4)] || levels[0];
    fill.style.width = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent = lvl.text;
    label.style.color = lvl.color;
}

// ── Password Match ────────────────────────────────────────────
function checkPassMatch() {
    const pass    = document.getElementById('signup-pass')?.value;
    const confirm = document.getElementById('signup-pass-confirm')?.value;
    const label   = document.getElementById('pass-match-label');
    if (!label || !confirm) return;
    if (pass === confirm) {
        label.textContent = '✓ Passwords match';
        label.style.color = '#2ecc71';
    } else {
        label.textContent = '✗ Passwords do not match';
        label.style.color = '#e74c3c';
    }
}

// ── Role Card Selector ────────────────────────────────────────
window.selectRole = function(formPrefix, sector, card) {
    const grid = document.getElementById(formPrefix + '-role-grid');
    if (grid) {
        grid.querySelectorAll('.role-card').forEach(c => {
            c.classList.remove('selected');
            c.style.borderColor = '';
            c.style.boxShadow = '';
            c.querySelector('i').style.color = '';
        });
    }
    card.classList.add('selected');

    const hidden = document.getElementById(formPrefix + '-role');
    if (hidden) hidden.value = sector;

    // Update institution placeholder for signup
    if (formPrefix === 'signup') {
        const instInput = document.getElementById('signup-inst');
        if (instInput && SECTOR_INSTITUTIONS[sector]) {
            instInput.placeholder = SECTOR_INSTITUTIONS[sector];
        }
    }

    // Email domain hint
    const emailInput = document.getElementById(formPrefix + '-email');
    const domainHints = {
        ANRH: 'you@anrh.dz', ADE: 'you@ade.dz',
        DRE:  'you@dre.gov.dz', ONA: 'you@ona.dz'
    };
    if (emailInput) {
        emailInput.placeholder = domainHints[sector] || 'you@institution.dz';
    }

    // Visual color feedback
    const color = SECTOR_COLORS[sector] || '#00d4ff';
    card.style.borderColor = color;
    card.style.boxShadow = `0 0 16px ${color}40`;
    const icon = card.querySelector('i');
    if (icon) icon.style.color = color;
};

// ── Auth Tab Switch ───────────────────────────────────────────
window.switchAuthMode = function(mode) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form-view').forEach(v => v.classList.remove('active'));
    const loginTab  = document.getElementById('tab-login');
    const signupTab = document.getElementById('tab-signup');
    if (mode === 'login') {
        if (loginTab) loginTab.classList.add('active');
        document.getElementById('auth-view-login')?.classList.add('active');
    } else {
        if (signupTab) signupTab.classList.add('active');
        document.getElementById('auth-view-signup')?.classList.add('active');
    }
    if (typeof window.i18nInit === 'function') window.i18nInit(window.currentLang);
};

// ── LOGIN ─────────────────────────────────────────────────────
window.handleLogin = function(e) {
    try {
        const btn = e.currentTarget;
        const email    = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-pass')?.value;
        const sector   = document.getElementById('login-role')?.value || 'ANRH';

        if (!email) { showToast('⚠️ يرجى إدخال البريد الإلكتروني', 'error'); return; }
        if (!password) { showToast('⚠️ يرجى إدخال كلمة المرور', 'error'); return; }

        const emailName = email.split('@')[0].replace(/[._]/g, ' ')
            .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
            try {
                const role  = SECTOR_ROLE_MAP[sector] || 'STUDENT';
                const color = SECTOR_COLORS[sector] || '#00d4ff';
                const userObj = {
                    name:        emailName,
                    email,
                    role,
                    sector,
                    institution: SECTOR_INSTITUTIONS[sector] || sector,
                    tier:        getTierName(role, sector),
                    sectorColor: color,
                    credits:     role === 'ADMIN' ? 99 : role === 'ENGINEER' ? 50 : 10,
                    daysLeft:    30
                };
                btn.innerHTML = orig;
                btn.disabled  = false;

                const hasActiveSubscription = (email === 'admin@anrh.dz' || email === 'fouzia@geowell.dz');

                if (hasActiveSubscription) {
                    activateUserSession(userObj, 'gov-pro');
                } else {
                    window._pendingUser = userObj;
                    showSubscriptionScreen(userObj);
                }
            } catch (err) {
                document.getElementById('auth-step-1').style.display = 'none';
                document.getElementById('auth-step-2').style.display = 'block';
                document.getElementById('auth-step-2').innerHTML = '<div style="color:red;padding:20px;font-family:monospace;text-align:left;"><b>Error inside timeout:</b><br>' + err.message + '<br>' + err.stack + '</div>';
            }
        }, 1400);
    } catch (err) {
        document.getElementById('auth-step-1').style.display = 'none';
        document.getElementById('auth-step-2').style.display = 'block';
        document.getElementById('auth-step-2').innerHTML = '<div style="color:red;padding:20px;font-family:monospace;text-align:left;"><b>Error in handleLogin:</b><br>' + err.message + '<br>' + err.stack + '</div>';
    }
};

// ── SIGNUP ────────────────────────────────────────────────────
window.handleSignup = function(e) {
    const btn = e.currentTarget;
    const name     = document.getElementById('signup-name')?.value.trim();
    const email    = document.getElementById('signup-email')?.value.trim();
    const inst     = document.getElementById('signup-inst')?.value.trim();
    const pass     = document.getElementById('signup-pass')?.value;
    const confirm  = document.getElementById('signup-pass-confirm')?.value;
    const sector   = document.getElementById('signup-role')?.value || 'ANRH';

    // Validate
    if (!name)  { showToast('⚠️ يرجى إدخال الاسم الكامل', 'error'); return; }
    if (!email) { showToast('⚠️ يرجى إدخال البريد الإلكتروني', 'error'); return; }
    if (!pass || pass.length < 8) {
        showToast('⚠️ كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error'); return;
    }
    if (pass !== confirm) {
        showToast('⚠️ كلمتا المرور غير متطابقتين', 'error'); return;
    }

    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';
    btn.disabled = true;

    setTimeout(() => {
        const role  = SECTOR_ROLE_MAP[sector] || 'STUDENT';
        const color = SECTOR_COLORS[sector] || '#00d4ff';
        window._pendingUser = {
            name,
            email,
            role,
            sector,
            institution: inst || SECTOR_INSTITUTIONS[sector] || sector,
            tier:        getTierName(role, sector),
            sectorColor: color,
            credits:     role === 'ADMIN' ? 99 : role === 'ENGINEER' ? 50 : 10,
            daysLeft:    30
        };
        btn.innerHTML = orig;
        btn.disabled  = false;
        showSubscriptionScreen(window._pendingUser);
    }, 1600);
};

// ── Subscription Screen (Step 2) ──────────────────────────────
function showSubscriptionScreen(user) {
    try {
        // Switch to step 2
        const step1 = document.getElementById('auth-step-1');
        const step2 = document.getElementById('auth-step-2');
        if (step1) step1.style.display = 'none';
        if (step2) {
            step2.style.display = 'block';
            step2.style.animation = 'fadeSlideIn 0.4s ease';
        }

        // Hello card
        const color = (SECTOR_COLORS && SECTOR_COLORS[user?.sector]) || '#00d4ff';
        const icon  = (SECTOR_ICONS && SECTOR_ICONS[user?.sector]) || 'fa-user';
        
        const nameEl = document.getElementById('plan-hello-name');
        if (nameEl) {
            const prefix = (typeof window.getText === 'function') ? window.getText('hello_prefix') : '👋 Welcome';
            nameEl.textContent = `${prefix}, ${user?.name || 'User'}!`;
        }
        
        const sectorEl = document.getElementById('plan-hello-sector');
        if (sectorEl) {
            sectorEl.textContent = user?.institution || '';
        }
        
        const avatarEl = document.getElementById('plan-avatar-icon');
        if (avatarEl) {
            avatarEl.innerHTML = `<i class="fa-solid ${icon}" style="color:${color};font-size:1.5rem;"></i>`;
            avatarEl.style.borderColor = color;
            avatarEl.style.background = color + '18';
        }

        // Render plan cards
        const plans = typeof getPlansByRole === 'function' ? getPlansByRole(user?.role, user?.sector) : [];
        const grid = document.getElementById('plan-cards-grid');
        if (grid) {
            grid.innerHTML = plans.map((plan, i) => `
                <div class="plan-card ${plan.recommended ? 'plan-recommended' : ''}" onclick="selectPlan('${plan.id}',this)">
                    ${plan.recommended ? `<div class="plan-badge">✨ ${(typeof window.getText === 'function' ? window.getText('recommended') : 'Recommended')}</div>` : ''}
                    <div class="plan-icon" style="color:${plan.color};background:${plan.color}18;border-color:${plan.color}33;">
                        <i class="fa-solid ${plan.icon}"></i>
                    </div>
                    <h3 class="plan-name">${plan.name}</h3>
                    <div class="plan-price">
                        ${plan.price === 0
                            ? `<span class="plan-free">${typeof window.getText === 'function' ? window.getText('free') : 'FREE'}</span>`
                            : `<span class="plan-amount">${plan.price.toLocaleString()} <span class="plan-currency">DZD</span></span><span class="plan-period">/ ${typeof window.getText === 'function' ? window.getText('month') : 'mo'}</span>`
                        }
                    </div>
                    <ul class="plan-features">
                        ${(plan.features || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
                    </ul>
                    <button class="btn-plan ${plan.recommended ? 'btn-plan-primary' : ''}" onclick="confirmPlan('${plan.id}',event)">
                        ${plan.price === 0 ? (typeof window.getText === 'function' ? window.getText('start_free') : 'Start Free') : (typeof window.getText === 'function' ? window.getText('choose_plan_btn') : 'Choose Plan')}
                    </button>
                </div>
            `).join('');
        }
    } catch (err) {
        const grid = document.getElementById('plan-cards-grid');
        if (grid) {
            grid.innerHTML = `<div style="color:red;padding:15px;">Error loading plans: ${err.message}</div>`;
        }
        console.error(err);
    }
}

// ── Plan definitions per role ─────────────────────────────────
function getPlansByRole(role, sector) {
    const isGov = ['ANRH','ADE','DRE','ONA'].includes(sector);
    if (isGov || role === 'ADMIN') {
        return [
            {
                id: 'gov-free', name: 'Institutionnel Gratuit', price: 0, icon: 'fa-landmark',
                color: '#00d4ff', recommended: false,
                features: ['Accès lecture cartographie','Alertes temps réel','Rapport mensuel PDF']
            },
            {
                id: 'gov-pro', name: 'Institutionnel Pro', price: 15000, icon: 'fa-shield-halved',
                color: '#9b59b6', recommended: true,
                features: ['Lecture/Écriture illimitée','Modélisation piézométrique','Export SIG/GeoTIFF','Support prioritaire']
            },
            {
                id: 'gov-enterprise', name: 'Souveraineté', price: 0, icon: 'fa-star',
                color: '#f39c12', recommended: false,
                features: ['API gouvernementale sécurisée','SLA 99.9%','Formation & intégration','Contact: admin@geowell.dz']
            }
        ];
    }
    if (role === 'ENGINEER') {
        return [
            {
                id: 'eng-basic', name: 'Basic', price: 0, icon: 'fa-drafting-compass',
                color: '#e67e22', recommended: false,
                features: ['5 projets GIS','Visualisation basique','Export limité']
            },
            {
                id: 'eng-premium', name: 'Premium GIS', price: 8000, icon: 'fa-satellite-dish',
                color: '#00d4ff', recommended: true,
                features: ['Projets illimités','QGIS intégré','IA hydro-géologique','Partage d\'équipe']
            }
        ];
    }
    if (role === 'STUDENT') {
        return [
            {
                id: 'stu-free', name: 'Académique Gratuit', price: 0, icon: 'fa-graduation-cap',
                color: '#1abc9c', recommended: true,
                features: ['Données de recherche','20 téléchargements/mois','Rapport académique','Accès bibliothèque']
            },
            {
                id: 'stu-plus', name: 'Académique+', price: 1500, icon: 'fa-flask',
                color: '#9b59b6', recommended: false,
                features: ['Données illimitées','Modélisation avancée','Support thèse','Publication rapports']
            }
        ];
    }
    // FARMER
    return [
        {
            id: 'farm-free', name: 'Agriculteur Gratuit', price: 0, icon: 'fa-tractor',
            color: '#f39c12', recommended: true,
            features: ['Alertes sécheresse','Niveau nappe locale','Interface simplifiée']
        }
    ];
}

window.confirmPlan = function(planId, e) {
    e.stopPropagation();
    const user = window._pendingUser;
    if (!user) return;

    const btn = e.currentTarget;
    const plans = typeof getPlansByRole === 'function' ? getPlansByRole(user.role, user.sector) : [];
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    // Simulate instant activation for all plans (Committee Demo Mode)
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
    btn.disabled = true;

    user.tier = selectedPlan.name;
    user.credits = selectedPlan.price > 0 ? 5000 : 0;

    setTimeout(() => {
        activateUserSession(user, planId);
    }, 800);
};
};

// ── Phase 3: Activation & Redirect ────────────────────────────
window.activateUserSession = function(user, planId) {
    // Refresh Session
    window.mockData.activeUser.name        = user.name;
    window.mockData.activeUser.role        = user.role;
    window.mockData.activeUser.sector      = user.sector;
    window.mockData.activeUser.institution = user.institution;
    window.mockData.activeUser.tier        = user.tier;
    window.mockData.activeUser.sectorColor = user.sectorColor;
    window.mockData.activeUser.credits     = user.credits;
    window.mockData.activeUser.daysLeft    = user.daysLeft;
    window.mockData.activeUser.plan        = planId;
    window.mockData.activeUser.email       = user.email;

    updateUserUI();
    applyRolePermissions();

    // Redirect to custom view (hide auth overlay smoothly)
    const overlay = document.getElementById('auth-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.visibility = 'hidden';
        const welcomeKey = 'welcome_' + user.sector;
        const welcomeMsg = window.getText ? window.getText(welcomeKey) : `✅ ${user.sector}`;
        showToast(`✅ ${welcomeMsg}`, 'success');
        window._pendingUser = null;
    }, 400);
};

window.selectPlan = function(planId, card) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('plan-selected'));
    card.classList.add('plan-selected');
};

// ── Committee Bypass ──────────────────────────────────────────
window.handleCommitteeBypass = function() {
    window.mockData.activeUser.role      = 'ADMIN';
    window.mockData.activeUser.sector    = 'DRE';
    window.mockData.activeUser.name      = 'Committee Guest';
    window.mockData.activeUser.tier      = 'Committee';
    window.mockData.activeUser.institution = 'Comité de Supervision — DRE';
    window.mockData.activeUser.sectorColor = '#9b59b6';
    updateUserUI();
    applyRolePermissions();
    const overlay = document.getElementById('auth-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.visibility = 'hidden'; showToast('👥 دخول اللجنة — Committee Access', 'info'); }, 300);
};

// ── Tier name ─────────────────────────────────────────────────
function getTierName(role, sector) {
    const s = { ANRH: 'ANRH', ADE: 'ADE', DRE: 'DRE', ONA: 'ONA' };
    if (s[sector]) return s[sector];
    return { ADMIN: 'Superior', ENGINEER: 'Premium', STUDENT: 'Academic', FARMER: 'Field' }[role] || 'Academic';
}

// ── Update sidebar UI ─────────────────────────────────────────
function updateUserUI() {
    const user = window.mockData?.activeUser;
    if (!user) return;
    const sector = user.sector;
    const color  = user.sectorColor || SECTOR_COLORS[sector] || '#00d4ff';
    const icon   = SECTOR_ICONS[sector] || 'fa-user';

    const nameEl = document.getElementById('user-display-name');
    const instEl = document.getElementById('user-institution');
    if (nameEl) nameEl.textContent = user.name || '';
    if (instEl) instEl.textContent = user.institution || sector || '';

    // Avatar → sector icon
    const avatarContainer = document.getElementById('user-avatar-container');
    const avatarIcon = document.getElementById('user-avatar-icon');
    if (avatarContainer && avatarIcon) {
        avatarContainer.style.borderColor = color;
        avatarContainer.style.background = color + '15';
        avatarIcon.className = `fa-solid ${icon}`;
        avatarIcon.style.color = color;
    }

    const creditsEl = document.getElementById('user-credits') || document.getElementById('modal-ac-credits');
    const daysEl    = document.getElementById('sub-days') || document.getElementById('modal-ac-days');
    if (creditsEl) creditsEl.textContent = user.credits ?? 99;
    if (daysEl)    daysEl.textContent    = user.daysLeft ?? 30;

    const modalRoleEl = document.getElementById('modal-ac-role');
    const modalInstEl = document.getElementById('modal-ac-inst');
    if (modalRoleEl) modalRoleEl.textContent = user.tier || sector || '';
    if (modalInstEl) modalInstEl.textContent = user.institution || sector || '';

    const planNameEl = document.getElementById('modal-ac-plan-name');
    const cycleEl = document.getElementById('modal-ac-cycle');
    if (planNameEl) {
        let pName = user.plan || user.tier || 'Gratuit (Free)';
        if (pName === 'gov-pro') pName = 'Institutionnel Pro';
        if (pName === 'gov-enterprise') pName = 'Souveraineté (Enterprise)';
        if (pName === 'eng-premium') pName = 'Premium GIS';
        planNameEl.textContent = pName;
    }
    if (cycleEl) {
        cycleEl.textContent = (user.plan && user.plan.includes('gov')) ? 'Annual (سنوي)' : 'Monthly (شهري)';
    }

    const badge = document.getElementById('user-role-badge');
    if (badge) {
        badge.textContent = user.tier || sector || '';
        badge.style.color       = color;
        badge.style.borderColor = color + '44';
        badge.style.background  = color + '15';
    }
}

// ── Apply Role Permissions (RBAC) ─────────────────────────────
window.applyRolePermissions = function() {
    const user = window.mockData?.activeUser;
    if (!user) return;
    const role   = user.role;
    const sector = user.sector;
    const color  = user.sectorColor || SECTOR_COLORS[sector] || '#00d4ff';
    const icon   = SECTOR_ICONS[sector] || 'fa-user';

    const sectorPerms = (window.permissionsMatrix && window.permissionsMatrix[sector])
        ? window.permissionsMatrix[sector]
        : (window.permissionsMatrix?.[role] || {});

    updateUserUI();

    // Nav visibility
    document.querySelectorAll('.nav-item[data-role-access]').forEach(item => {
        const access = item.getAttribute('data-role-access');
        if (access === 'ALL') { item.style.display = ''; return; }
        const allowed = access.split(',').map(r => r.trim());
        const hasAccess = allowed.includes(role) || allowed.includes(sector);
        item.style.display = hasAccess ? '' : 'none';
        if (!hasAccess) {
            const view = item.getAttribute('data-view');
            const el = document.getElementById('view-' + view);
            if (el && el.classList.contains('active') && typeof switchView === 'function') switchView('dashboard');
        }
    });

    // Feature gates
    const featureMap = {
        'btn-export-gis': 'export_shp',
        'btnNeuralMap':   'neural_ai',
        'btn-qgis-link':  'qgis',
        'btn-gis-write':  'gis_write',
    };
    Object.entries(featureMap).forEach(([elId, permKey]) => {
        const el = document.getElementById(elId);
        if (!el) return;
        const ok = sectorPerms[permKey] !== false;
        el.style.opacity = ok ? '1' : '0.35';
        el.style.pointerEvents = ok ? '' : 'none';
        if (!ok) el.onclick = () => { showToast('🔒 صلاحية مقيّدة لدورك الحالي', 'error'); return false; };
    });

    // Neural AI
    const neuralBtn = document.getElementById('btnNeuralMap');
    if (neuralBtn) {
        const ok = sectorPerms['neural_ai'] !== false;
        neuralBtn.style.opacity = ok ? '1' : '0.4';
        if (!ok) neuralBtn.onclick = () => { showToast('هذه الميزة تتطلب اشتراكاً أعلى', 'error'); return false; };
    }

    // Farmer simplified
    document.body[role === 'FARMER' ? 'setAttribute' : 'removeAttribute']('data-farmer-mode', 'true');

    // Welcome banner on dashboard
    const dashView = document.getElementById('view-dashboard');
    if (dashView && user.name) {
        let banner = document.getElementById('role-welcome-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'role-welcome-banner';
            const firstCard = dashView.querySelector('.card, .kpi-grid, .dashboard-grid');
            if (firstCard) dashView.insertBefore(banner, firstCard);
            else dashView.prepend(banner);
        }
        const welcomeKey = 'welcome_' + sector;
        const msg = window.getText ? window.getText(welcomeKey) : `${sector} — Access Active`;
        banner.style.cssText = `background:${color}10;border:1px solid ${color}33;color:${color};display:flex;align-items:center;gap:0.8rem;padding:0.6rem 1rem;border-radius:10px;margin-bottom:1rem;font-size:0.83rem;font-weight:600;animation:fadeSlideIn 0.4s ease;`;
        banner.innerHTML = `<i class="fa-solid ${icon}" style="font-size:1.1rem;"></i><span>${msg}</span>`;
    }

    // Pending badge
    const badge = document.getElementById('admin-pending-badge');
    if (badge && window.mockUsers) badge.textContent = window.mockUsers.filter(u => u.status === 'PENDING').length;
};

// ── Language Switcher ─────────────────────────────────────────
window.setLang = function(lang) {
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
        if (b.innerText.trim().toLowerCase() === lang.toLowerCase()) b.classList.add('active');
    });
    if (typeof window.i18nInit === 'function') window.i18nInit(lang);
    showToast(window.getText ? window.getText('lng_toast') : 'Language Updated', 'success');
    setTimeout(() => { if (typeof applyRolePermissions === 'function') applyRolePermissions(); }, 100);
};

// ── Pricing modal ─────────────────────────────────────────────
window.openPricingModal = function() { document.getElementById('modal-pricing')?.classList.add('active'); };
window.closeInnovationModal = function(id) { document.getElementById(id)?.classList.remove('active'); };
window.openInnovationModal = function(id) { document.getElementById(id)?.classList.add('active'); };

window.simulateRoleChange = function(newRole) {
    const plan = window.mockData?.subscriptionPlans?.find(p => p.role === newRole);
    if (plan) {
        window.mockData.activeUser.role   = plan.role;
        window.mockData.activeUser.tier   = plan.name;
        window.mockData.activeUser.sector = newRole;
        window.mockData.activeUser.credits = newRole === 'ADMIN' || newRole === 'ENGINEER' ? 99 : 5;
        updateUserUI(); applyRolePermissions(); closeInnovationModal('modal-pricing');
        showToast(`Role: ${plan.name}`, 'info');
    }
};

window.openBaridiMob = function() { closeInnovationModal('modal-pricing'); document.getElementById('modal-baridimob')?.classList.add('active'); };
window.processPayment = function() {
    const btn = document.querySelector('.baridi-btn');
    if (!btn) return;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> TRAITEMENT...'; btn.disabled = true;
    setTimeout(() => {
        showToast('Paiement réussi ! Session Activée.', 'success');
        
        if (window._pendingUser) {
            activateUserSession(window._pendingUser, window._pendingPlanId || 'premium');
        } else {
            simulateRoleChange('ENGINEER'); 
        }
        
        closeInnovationModal('modal-baridimob');
        btn.innerHTML = 'PAYER MAINTENANT'; btn.disabled = false;
    }, 2500);
};

window.openWellPassport = function(wellId) {
    const el = document.getElementById('p-id');
    if (el) el.textContent = wellId || 'W-00987-B';
    document.getElementById('modal-well-passport')?.classList.add('active');
};

window.openUserAccount = function() {
    const u = window.mockData?.activeUser;
    if (!u) return;
    document.getElementById('modal-ac-credits').textContent = u.credits;
    document.getElementById('modal-ac-days').textContent    = u.daysLeft;
    document.getElementById('modal-ac-role').textContent    = u.tier;
    document.getElementById('modal-ac-inst').textContent    = u.institution;
    document.getElementById('modal-user-account')?.classList.add('active');
};

window.checkActionPermission = function(req) {
    const h = { STUDENT:1, FARMER:1, ENGINEER:3, ADMIN:4 };
    if ((h[window.mockData?.activeUser?.role] || 0) < (h[req] || 99)) {
        showToast(`هذه الميزة تتطلب مستوى ${req}`, 'error'); openPricingModal(); return false;
    }
    return true;
};

// Legacy
window.handleAuthAction = window.handleLogin;

// ── Account Modal Logic ──────────────────────────────────────
window.switchAccTab = function(tabId, btn) {
    // Hide all tabs
    document.querySelectorAll('.acc-tab-content').forEach(el => el.style.display = 'none');
    // Remove active class from buttons
    document.querySelectorAll('.acc-tab-btn').forEach(el => {
        el.classList.remove('active');
        el.style.color = '#888';
        el.style.borderBottomColor = 'transparent';
    });
    
    // Show selected tab
    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
    
    // Activate button
    if (btn) {
        btn.classList.add('active');
        btn.style.color = '#fff';
        btn.style.borderBottomColor = 'var(--accent-primary)';
    }
};

window.logoutAction = function() {
    // Destroy Session
    window.mockData.activeUser = {
        name: null, role: null, sector: null, institution: null, plan: null
    };
    
    // Clear display data
    updateUserUI();
    
    // Close modal
    if (typeof closeInnovationModal === 'function') {
        closeInnovationModal('modal-user-account');
    }
    
    // Show auth overlay to block UI and require fresh login
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        
        // Reset auth steps to step 1
        const step1 = document.getElementById('auth-step-1');
        const step2 = document.getElementById('auth-step-2');
        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        
        // Clear inputs
        const inputs = overlay.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }
    
    if (typeof showToast === 'function') {
        showToast('تم تسجيل الخروج بنجاح. جلستك الآن آمنة.', 'info');
    }
    
    // Redirect to Dashboard view to reset state
    if (typeof switchView === 'function') {
        switchView('dashboard');
    }
};


