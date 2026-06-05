/**
 * GeoWell Admin Dashboard - Complete Administrative System
 * Handles: KPIs, Supervision Pages, Permissions Matrix, Impersonation, Audit Logs
 */

// ============================================================
// AUDIT LOG SYSTEM (In-memory, simulates DB-sync)
// ============================================================
window.auditLog = [];

window.logAuditEvent = function(action, target, details = '') {
    const user = window.mockData?.activeUser || {};
    const entry = {
        id: 'AUD-' + Date.now(),
        timestamp: new Date().toISOString(),
        adminId: user.name || 'Unknown',
        adminRole: user.role || 'UNKNOWN',
        action,
        target,
        details,
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        encrypted: true
    };
    window.auditLog.unshift(entry);
    if (window.auditLog.length > 200) window.auditLog.pop();
    // Persist
    try { localStorage.setItem('geowell_audit', JSON.stringify(window.auditLog.slice(0, 50))); } catch(e) {}
    renderAuditLog();
    return entry;
};

// ============================================================
// MOCK USERS DATABASE
// ============================================================
window.mockUsers = window.mockUsers || [
    { id: 'USR-001', name: 'Directeur Hadj Baali',   role: 'ADMIN',    email: 'baali@dre-batna.dz',    institution: 'DRE Batna',            status: 'ACTIVE',   credits: 99, lastLogin: '2026-06-05T10:12:00Z', location: 'Batna', pendingRequest: false },
    { id: 'USR-002', name: 'Ing. Karim Meziane',     role: 'ENGINEER', email: 'meziane@expert-gis.dz', institution: 'Bureau GeoData DZ',     status: 'ACTIVE',   credits: 45, lastLogin: '2026-06-05T09:30:00Z', location: 'Alger', pendingRequest: false },
    { id: 'USR-003', name: 'Dr. Sara Boulkhrouf',    role: 'ENGINEER', email: 'sara@anrh.dz',          institution: 'ANRH Hydro Lab',        status: 'ACTIVE',   credits: 60, lastLogin: '2026-06-04T16:00:00Z', location: 'Oran',  pendingRequest: false },
    { id: 'USR-004', name: 'Étud. Farouk Amara',     role: 'STUDENT',  email: 'farouk@univ-batna.dz',  institution: 'Université Batna-2',    status: 'ACTIVE',   credits: 10, lastLogin: '2026-06-05T08:00:00Z', location: 'Batna', pendingRequest: false },
    { id: 'USR-005', name: 'Étud. Lina Chaoui',      role: 'STUDENT',  email: 'lina@univ-constantine.dz','institution': 'Université Constantine', status: 'PENDING', credits: 0, lastLogin: null, location: 'Constantine', pendingRequest: true },
    { id: 'USR-006', name: 'Ferme Ben Khelil',       role: 'FARMER',   email: 'benkhelil@farm.dz',     institution: 'Exploitation Agricole', status: 'ACTIVE',   credits: 5,  lastLogin: '2026-06-03T07:00:00Z', location: 'Khenchela', pendingRequest: false },
    { id: 'USR-007', name: 'Ing. Ahmed Touati',      role: 'ENGINEER', email: 'touati@sonatrach.dz',   institution: 'Sonatrach Upstream',    status: 'SUSPENDED',credits: 0, lastLogin: '2026-06-01T12:00:00Z', location: 'Hassi Messaoud', pendingRequest: false },
    { id: 'USR-008', name: 'Étud. Rym Ferroukhi',   role: 'STUDENT',  email: 'rym@ens.dz',            institution: 'ENS Hydro',             status: 'PENDING',  credits: 0,  lastLogin: null, location: 'Alger', pendingRequest: true },
];

// ============================================================
// PERMISSIONS MATRIX
// ============================================================
window.permissionsMatrix = window.permissionsMatrix || {
    ADMIN:    { wells_read: true,  wells_write: true,  gis_read: true,  gis_write: true,  analytics: true,  export_shp: true,  neural_ai: true,  qgis: true,  audit_view: true  },
    ENGINEER: { wells_read: true,  wells_write: true,  gis_read: true,  gis_write: false, analytics: true,  export_shp: true,  neural_ai: true,  qgis: true,  audit_view: false },
    STUDENT:  { wells_read: true,  wells_write: false, gis_read: true,  gis_write: false, analytics: true,  export_shp: false, neural_ai: false, qgis: false, audit_view: false },
    FARMER:   { wells_read: false, wells_write: false, gis_read: false, gis_write: false, analytics: false, export_shp: false, neural_ai: false, qgis: false, audit_view: false }
};

const permissionLabels = {
    wells_read:  'قراءة الآبار',
    wells_write: 'تعديل الآبار',
    gis_read:    'عرض طبقات GIS',
    gis_write:   'تعديل GIS',
    analytics:   'التحليلات',
    export_shp:  'تصدير Shapefile',
    neural_ai:   'النمذجة بالذكاء الاصطناعي',
    qgis:        'منصة QGIS',
    audit_view:  'سجلات المراجعة'
};

// ============================================================
// IMPERSONATION MODE
// ============================================================
window._impersonationActive = false;
window._originalUser = null;

window.startImpersonation = function(targetRole) {
    if (window._impersonationActive) {
        showToast('⚠️ وضع المحاكاة نشط مسبقاً. أوقفه أولاً.', 'warning');
        return;
    }
    if (!window.mockData?.activeUser || window.mockData.activeUser.role !== 'ADMIN') {
        showToast('🔒 هذه الميزة متاحة للمسؤول فقط.', 'error');
        return;
    }
    window._originalUser = JSON.parse(JSON.stringify(window.mockData.activeUser));
    window._impersonationActive = true;

    const roleNames = { ADMIN:'Superior', ENGINEER:'Premium', STUDENT:'Academic', FARMER:'Field User' };
    window.mockData.activeUser.role = targetRole;
    window.mockData.activeUser.tier = roleNames[targetRole];

    // Show impersonation banner
    document.getElementById('impersonation-banner').style.display = 'flex';
    document.getElementById('impersonation-banner').querySelector('span').textContent =
        `👁️ تحاكي الآن دور: ${roleNames[targetRole]} — الشاشة تُظهر ما يراه هذا الدور فعلياً`;

    applyRolePermissions();
    logAuditEvent('IMPERSONATION_START', targetRole, `Admin viewed system as ${targetRole}`);
    showToast(`👁️ تم تفعيل وضع المحاكاة — تشاهد الآن واجهة ${roleNames[targetRole]}`, 'info');
    switchView('dashboard');
};

window.stopImpersonation = function() {
    if (!window._impersonationActive) return;
    window.mockData.activeUser = window._originalUser;
    window._impersonationActive = false;
    window._originalUser = null;
    document.getElementById('impersonation-banner').style.display = 'none';
    applyRolePermissions();
    logAuditEvent('IMPERSONATION_END', 'ADMIN', 'Impersonation session ended');
    showToast('✅ تم إيقاف وضع المحاكاة — عُدت لحسابك الإداري', 'success');
    switchView('admin-supervision');
};

// ============================================================
// USER MANAGEMENT ACTIONS
// ============================================================
window.approveUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    user.status = 'ACTIVE';
    user.pendingRequest = false;
    user.credits = user.role === 'STUDENT' ? 10 : 5;
    logAuditEvent('USER_APPROVED', userId, `${user.name} (${user.email}) approved`);
    showToast(`✅ تم تفعيل حساب ${user.name}`, 'success');
    renderSupervisionPage(window._currentSupPage || 'STUDENT');
    updateKPIs();
};

window.rejectUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    user.status = 'REJECTED';
    user.pendingRequest = false;
    logAuditEvent('USER_REJECTED', userId, `${user.name} (${user.email}) rejected`);
    showToast(`❌ تم رفض طلب ${user.name}`, 'warning');
    renderSupervisionPage(window._currentSupPage || 'STUDENT');
    updateKPIs();
};

window.suspendUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`⚠️ هل تريد تجميد حساب ${user.name} فوراً؟`)) {
        user.status = 'SUSPENDED';
        logAuditEvent('FORCED_REVOCATION', userId, `${user.name} session revoked — suspicious activity`);
        showToast(`🔒 تم تجميد حساب ${user.name} فورياً`, 'error');
        renderSupervisionPage(window._currentSupPage || 'ENGINEER');
        updateKPIs();
    }
};

window.reactivateUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    user.status = 'ACTIVE';
    logAuditEvent('USER_REACTIVATED', userId, `${user.name} account reactivated`);
    showToast(`🔓 تم إعادة تفعيل حساب ${user.name}`, 'success');
    renderSupervisionPage(window._currentSupPage || 'ENGINEER');
    updateKPIs();
};

window.viewUserRecord = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    const modal = document.getElementById('modal-user-record');
    if (!modal) return;
    document.getElementById('record-name').textContent = user.name;
    document.getElementById('record-id').textContent = user.id;
    document.getElementById('record-role').textContent = user.role;
    document.getElementById('record-email').textContent = user.email;
    document.getElementById('record-inst').textContent = user.institution;
    document.getElementById('record-status').textContent = user.status;
    document.getElementById('record-location').textContent = user.location;
    document.getElementById('record-lastlogin').textContent = user.lastLogin
        ? new Date(user.lastLogin).toLocaleString('ar-DZ')
        : 'لم يسجل دخولاً بعد';
    const auditEntries = window.auditLog.filter(e => e.target === userId || e.details.includes(user.name));
    document.getElementById('record-audit').innerHTML = auditEntries.length
        ? auditEntries.slice(0, 5).map(e => `<div class="audit-mini-row"><span class="audit-action">${e.action}</span><span>${new Date(e.timestamp).toLocaleString('ar-DZ')}</span></div>`).join('')
        : '<p style="color:#666;padding:0.5rem;">لا توجد سجلات بعد.</p>';
    modal.classList.add('active');
    logAuditEvent('RECORD_VIEWED', userId, `Admin viewed security record for ${user.name}`);
};

// ============================================================
// KPI UPDATE
// ============================================================
window.updateKPIs = function() {
    const users = window.mockUsers;
    const active = users.filter(u => u.status === 'ACTIVE');
    const pending = users.filter(u => u.status === 'PENDING');

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('kpi-total-users',    users.length);
    setText('kpi-active-users',   active.length);
    setText('kpi-pending',        pending.length);
    setText('kpi-admins',         active.filter(u => u.role === 'ADMIN').length);
    setText('kpi-engineers',      active.filter(u => u.role === 'ENGINEER').length);
    setText('kpi-students',       active.filter(u => u.role === 'STUDENT').length);
    setText('kpi-farmers',        active.filter(u => u.role === 'FARMER').length);
    setText('kpi-suspended',      users.filter(u => u.status === 'SUSPENDED').length);
    setText('kpi-secure-sessions',active.length + Math.floor(Math.random() * 3));
    setText('kpi-data-flow',      (active.length * 1.4 + Math.random()).toFixed(1) + ' MB/s');
    setText('kpi-audit-count',    window.auditLog.length);
    setText('kpi-wells-count',    window.mockData?.rigs?.length || window.mockData?.overview?.totalWells || 0);
};

// ============================================================
// SUPERVISION PAGES RENDERER
// ============================================================
window._currentSupPage = 'ADMIN';

const roleConfig = {
    ADMIN:    { label: 'المديريات الحكومية',      icon: 'fa-landmark',        color: '#e74c3c', badge: 'role-superior' },
    ENGINEER: { label: 'مكاتب الخبراء والمهندسين', icon: 'fa-drafting-compass', color: '#9b59b6', badge: 'role-premium' },
    STUDENT:  { label: 'القطاع الأكاديمي',        icon: 'fa-graduation-cap',  color: '#3498db', badge: 'role-academic' },
    FARMER:   { label: 'مستخدمو الميدان',          icon: 'fa-tractor',         color: '#27ae60', badge: 'role-field' }
};

window.renderSupervisionPage = function(roleFilter) {
    window._currentSupPage = roleFilter;
    const container = document.getElementById('supervision-users-list');
    if (!container) return;

    const filtered = window.mockUsers.filter(u => u.role === roleFilter);
    const cfg = roleConfig[roleFilter] || roleConfig.ENGINEER;

    // Update tab active state
    document.querySelectorAll('.sup-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.role === roleFilter);
    });

    // Update page title
    const titleEl = document.getElementById('sup-page-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid ${cfg.icon}"></i> إشراف: ${cfg.label}`;

    container.innerHTML = filtered.length === 0
        ? `<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>لا يوجد مستخدمون في هذه الفئة</p></div>`
        : filtered.map(user => `
        <div class="user-card-admin ${user.status.toLowerCase()}">
            <div class="user-card-header">
                <div class="user-avatar-admin" style="background: ${cfg.color}22; border-color: ${cfg.color};">
                    <i class="fa-solid ${cfg.icon}" style="color: ${cfg.color};"></i>
                </div>
                <div class="user-card-info">
                    <strong>${user.name}</strong>
                    <small>${user.email}</small>
                    <small>${user.institution}</small>
                </div>
                <div class="user-status-col">
                    ${getStatusBadge(user.status)}
                    <small style="color:#888;margin-top:4px;display:block;">📍 ${user.location}</small>
                </div>
            </div>
            <div class="user-card-actions">
                <button class="admin-action-btn view" onclick="viewUserRecord('${user.id}')">
                    <i class="fa-solid fa-shield-halved"></i> السجل الأمني
                </button>
                ${user.status === 'PENDING' ? `
                    <button class="admin-action-btn approve" onclick="approveUser('${user.id}')">
                        <i class="fa-solid fa-check"></i> موافقة
                    </button>
                    <button class="admin-action-btn reject" onclick="rejectUser('${user.id}')">
                        <i class="fa-solid fa-times"></i> رفض
                    </button>
                ` : ''}
                ${user.status === 'ACTIVE' ? `
                    <button class="admin-action-btn suspend" onclick="suspendUser('${user.id}')">
                        <i class="fa-solid fa-ban"></i> إيقاف إجباري
                    </button>
                    <button class="admin-action-btn impersonate" onclick="startImpersonation('${user.role}')">
                        <i class="fa-solid fa-masks-theater"></i> عرض كهذا المستخدم
                    </button>
                ` : ''}
                ${user.status === 'SUSPENDED' ? `
                    <button class="admin-action-btn approve" onclick="reactivateUser('${user.id}')">
                        <i class="fa-solid fa-rotate-left"></i> إعادة تفعيل
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
};

function getStatusBadge(status) {
    const map = {
        ACTIVE:    '<span class="status-pill active">● نشط</span>',
        PENDING:   '<span class="status-pill pending">◐ معلق</span>',
        SUSPENDED: '<span class="status-pill suspended">✕ موقوف</span>',
        REJECTED:  '<span class="status-pill rejected">✕ مرفوض</span>'
    };
    return map[status] || map.PENDING;
}

// ============================================================
// PERMISSIONS MATRIX RENDERER
// ============================================================
window.renderPermissionsMatrix = function() {
    const container = document.getElementById('permissions-matrix-grid');
    if (!container) return;

    const roles = ['ADMIN', 'ENGINEER', 'STUDENT', 'FARMER'];
    const perms = Object.keys(permissionLabels);

    container.innerHTML = `
        <table class="perms-table">
            <thead>
                <tr>
                    <th>الصلاحية</th>
                    ${roles.map(r => `<th><span class="role-badge ${roleConfig[r]?.badge || ''}">${r}</span></th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${perms.map(perm => `
                    <tr>
                        <td>${permissionLabels[perm]}</td>
                        ${roles.map(role => `
                            <td class="perm-cell">
                                <label class="perm-toggle ${role === 'ADMIN' ? 'locked' : ''}">
                                    <input type="checkbox"
                                        ${window.permissionsMatrix[role][perm] ? 'checked' : ''}
                                        ${role === 'ADMIN' ? 'disabled' : ''}
                                        onchange="updatePermission('${role}','${perm}',this.checked)">
                                    <span class="perm-slider"></span>
                                </label>
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

window.updatePermission = function(role, perm, value) {
    window.permissionsMatrix[role][perm] = value;
    logAuditEvent('PERMISSION_CHANGED', role,
        `${perm} set to ${value ? 'ENABLED' : 'DISABLED'} for ${role}`);
    showToast(`🔧 تم تعديل صلاحية "${permissionLabels[perm]}" للدور ${role}`, 'info');
    // Apply immediately
    if (window.mockData?.activeUser?.role === role) applyRolePermissions();
};

// ============================================================
// AUDIT LOG RENDERER
// ============================================================
window.renderAuditLog = function() {
    const container = document.getElementById('audit-log-body');
    if (!container) return;
    const log = window.auditLog;
    container.innerHTML = log.length === 0
        ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#666;">لا توجد سجلات بعد.</td></tr>`
        : log.slice(0, 50).map(entry => `
            <tr>
                <td><code style="color:#00d4ff;font-size:0.75em;">${entry.id}</code></td>
                <td>${new Date(entry.timestamp).toLocaleString('ar-DZ')}</td>
                <td><strong>${entry.adminId}</strong></td>
                <td><span class="audit-action-badge ${getAuditColor(entry.action)}">${entry.action}</span></td>
                <td>${entry.target}</td>
                <td style="color:#888;font-size:0.82em;">${entry.details}</td>
            </tr>
        `).join('');
};

function getAuditColor(action) {
    if (action.includes('APPROVE') || action.includes('REACTIVATED')) return 'success';
    if (action.includes('REJECT') || action.includes('SUSPENDED') || action.includes('REVOCATION')) return 'danger';
    if (action.includes('IMPERSONATION')) return 'warning';
    return 'info';
}

// ============================================================
// COORDINATE MASKING (for lower roles)
// ============================================================
window._coordsMasked = false;

window.toggleCoordsMasking = function() {
    window._coordsMasked = !window._coordsMasked;
    logAuditEvent(
        window._coordsMasked ? 'COORDS_MASKED' : 'COORDS_UNMASKED',
        'ALL_ROLES',
        `Precise coordinates ${window._coordsMasked ? 'hidden' : 'visible'} for lower roles`
    );
    const btn = document.getElementById('btn-mask-coords');
    if (btn) {
        btn.innerHTML = window._coordsMasked
            ? '<i class="fa-solid fa-eye-slash"></i> رفع الحجب'
            : '<i class="fa-solid fa-eye-slash"></i> حجب الإحداثيات';
        btn.style.background = window._coordsMasked ? 'var(--accent-danger)' : '';
    }
    showToast(
        window._coordsMasked
            ? '🔒 تم حجب الإحداثيات الدقيقة عن الفئات الدنيا'
            : '🔓 تم رفع حجب الإحداثيات',
        window._coordsMasked ? 'warning' : 'success'
    );
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Load persisted audit log
    try {
        const saved = localStorage.getItem('geowell_audit');
        if (saved) window.auditLog = JSON.parse(saved);
    } catch(e) {}

    // Seed initial audit event
    if (window.auditLog.length === 0) {
        logAuditEvent('SYSTEM_INIT', 'SYSTEM', 'GeoWell Admin Module Initialized');
    }

    updateKPIs();

    // Auto-refresh KPIs every 30s
    setInterval(() => {
        updateKPIs();
    }, 30000);
});

// Expose for global access
window.renderAuditLog     = renderAuditLog;
window.renderSupervisionPage = renderSupervisionPage;
window.renderPermissionsMatrix = renderPermissionsMatrix;
