/**
 * GeoWell Admin Dashboard — Système de Supervision Sectorielle
 * Hيئات: ANRH | ADE | DRE | ONA + Engineer | Student | Farmer
 * Version 2.0 — Souveraineté Numérique
 */

// ============================================================
// SECTOR DEFINITIONS — الهيئات القطاعية
// ============================================================
window.SECTORS = {
    ANRH: {
        id: 'ANRH',
        name: 'ANRH',
        fullName: 'الوكالة الوطنية للموارد المائية',
        fullNameFr: 'Agence Nationale des Ressources Hydrauliques',
        domain: 'anrh.dz',
        icon: 'fa-water',
        color: '#00d4ff',
        colorLight: '#00d4ff22',
        badge: 'anrh',
        role: 'ADMIN',
        accessLevel: 'READ_WRITE_FULL',
        tasks: [
            'مراقبة المستويات الجوفية (Suivi Piézométrique)',
            'تحديث النمذجة الهيدروكيميائية',
            'مؤشرات جودة المياه (WQI)',
            'تصدير خرائط الطبقات الجيومكانية'
        ],
        permissions: {
            // 🗺️ الخريطة
            map_view: true, map_edit: true,
            // 📊 التحليلات
            analytics: true,
            // 🔔 التنبيهات
            alert_receive: true, alert_send: true,
            // 💧 إدارة الآبار
            wells_read: true, wells_write: true,
            // ⚙️ الأصول والمعدات
            assets_view: true, assets_edit: true,
            // 📚 المكتبة العلمية
            library_view: true, library_upload: true, library_delete: true,
            // 👥 مركز المجتمع والخبراء
            community_view: true, community_post: true, experts_contact: true,
            // 🗂️ طبقات GIS
            gis_read: true, gis_write: true, export_shp: true,
            // 🤖 الذكاء الاصطناعي
            neural_ai: true,
            // 🔭 QGIS
            qgis: true,
            // 📡 البيزومتري وجودة المياه
            piezo_monitoring: true, wqi_monitoring: true,
            // 🔐 الإدارة
            audit_view: true
        }
    },
    ADE: {
        id: 'ADE',
        name: 'ADE',
        fullName: 'الجزائرية للمياه',
        fullNameFr: 'Algérienne des Eaux',
        domain: 'ade.dz',
        icon: 'fa-faucet-drip',
        color: '#3498db',
        colorLight: '#3498db22',
        badge: 'ade',
        role: 'ADMIN',
        accessLevel: 'READ_LIMITED_WRITE',
        tasks: [
            'مراقبة مخزون آبار الشرب',
            'استقبال إنذارات التلوث فوراً',
            'رصد ملوحة الآبار الميدانية',
            'إجراءات الضخ أو القطع الطارئ'
        ],
        permissions: {
            map_view: true,  map_edit: false,
            analytics: true,
            alert_receive: true, alert_send: false,
            wells_read: true, wells_write: false,
            assets_view: true, assets_edit: false,
            library_view: true, library_upload: false, library_delete: false,
            community_view: true, community_post: false, experts_contact: false,
            gis_read: true, gis_write: false, export_shp: false,
            neural_ai: false,
            qgis: false,
            piezo_monitoring: true, wqi_monitoring: true,
            audit_view: false
        }
    },
    DRE: {
        id: 'DRE',
        name: 'DRE',
        fullName: 'مديرية الموارد المائية الولائية',
        fullNameFr: 'Direction des Ressources en Eau',
        domain: 'dre.gov.dz',
        icon: 'fa-building-columns',
        color: '#9b59b6',
        colorLight: '#9b59b622',
        badge: 'dre',
        role: 'ADMIN',
        accessLevel: 'REGIONAL_SUPERVISION',
        tasks: [
            'متابعة تراخيص حفر الآبار الجديدة',
            'مراقبة الحصيلة المائية المحلية',
            'دعم اتخاذ القرار الولائي',
            'التنسيق مع الإدارة المركزية'
        ],
        permissions: {
            map_view: true,  map_edit: false,
            analytics: true,
            alert_receive: true, alert_send: true,
            wells_read: true, wells_write: true,
            assets_view: true, assets_edit: false,
            library_view: true, library_upload: false, library_delete: false,
            community_view: true, community_post: false, experts_contact: true,
            gis_read: true, gis_write: false, export_shp: true,
            neural_ai: false,
            qgis: true,
            piezo_monitoring: true, wqi_monitoring: false,
            audit_view: false
        }
    },
    ONA: {
        id: 'ONA',
        name: 'ONA',
        fullName: 'الديوان الوطني للتطهير',
        fullNameFr: 'Office National de l\'Assainissement',
        domain: 'ona.dz',
        icon: 'fa-recycle',
        color: '#27ae60',
        colorLight: '#27ae6022',
        badge: 'ona',
        role: 'ADMIN',
        accessLevel: 'ENVIRONMENTAL_PROTECTION',
        tasks: [
            'مراقبة محطات التطهير',
            'جودة المياه المعالجة',
            'رصد تأثير مياه الصرف على الطبقات الجوفية',
            'طبقات الحماية البيئية (GIS)'
        ],
        permissions: {
            map_view: true,  map_edit: false,
            analytics: true,
            alert_receive: true, alert_send: true,
            wells_read: true, wells_write: false,
            assets_view: true, assets_edit: false,
            library_view: true, library_upload: true,  library_delete: false,
            community_view: true, community_post: true,  experts_contact: true,
            gis_read: true, gis_write: true, export_shp: true,
            neural_ai: false,
            qgis: true,
            piezo_monitoring: false, wqi_monitoring: true,
            audit_view: false
        }
    }
};

// Domain → Sector mapping for automatic detection
window.DOMAIN_TO_SECTOR = {
    'anrh.dz':      'ANRH',
    'ade.dz':       'ADE',
    'dre.gov.dz':   'DRE',
    'dre.dz':       'DRE',
    'ona.dz':       'ONA',
};

// Detect sector from email domain
window.detectSectorFromEmail = function(email) {
    if (!email) return null;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    for (const [d, sector] of Object.entries(window.DOMAIN_TO_SECTOR)) {
        if (domain === d || domain.endsWith('.' + d)) return sector;
    }
    return null;
};

// ============================================================
// AUDIT LOG SYSTEM
// ============================================================
window.auditLog = [];

window.logAuditEvent = function(action, target, details = '', sector = null) {
    const user = window.mockData?.activeUser || {};
    const actor = window.mockUsers?.find(u => u.name === user.name);
    const entry = {
        id: 'AUD-' + Date.now(),
        timestamp: new Date().toISOString(),
        adminId: user.name || 'Unknown',
        adminRole: user.role || 'UNKNOWN',
        sector: sector || actor?.sector || '—',
        institution: actor?.institution || user.institution || '—',
        action,
        target,
        details,
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        encrypted: true
    };
    window.auditLog.unshift(entry);
    if (window.auditLog.length > 200) window.auditLog.pop();
    try { localStorage.setItem('geowell_audit', JSON.stringify(window.auditLog.slice(0, 100))); } catch(e) {}
    renderAuditLog();
    return entry;
};

// ============================================================
// EXTENDED MOCK USERS DATABASE — بيانات الهيئات
// ============================================================
window.mockUsers = window.mockUsers || [
    // ── ANRH ──────────────────────────────────────────────────
    { id: 'USR-A01', name: 'Dr. Nadir Boufares',      role: 'ADMIN',    sector: 'ANRH', email: 'boufares@anrh.dz',         institution: 'ANRH — Alger (Siège)',        status: 'ACTIVE',   credits: 99, lastLogin: '2026-06-05T10:00:00Z', location: 'Alger',         pendingRequest: false },
    { id: 'USR-A02', name: 'Ing. Soraya Khelil',      role: 'ADMIN',    sector: 'ANRH', email: 'skhelil@anrh.dz',          institution: 'ANRH — Station Batna',        status: 'ACTIVE',   credits: 80, lastLogin: '2026-06-05T08:30:00Z', location: 'Batna',         pendingRequest: false },
    { id: 'USR-A03', name: 'Tech. Amine Chouiref',    role: 'ADMIN',    sector: 'ANRH', email: 'chouiref@anrh.dz',         institution: 'ANRH — Labo Hydro Oran',     status: 'PENDING',  credits: 0,  lastLogin: null,                   location: 'Oran',          pendingRequest: true  },

    // ── ADE ───────────────────────────────────────────────────
    { id: 'USR-B01', name: 'Dir. Fatima Benali',      role: 'ADMIN',    sector: 'ADE',  email: 'fbenali@ade.dz',           institution: 'ADE — Direction Constantine', status: 'ACTIVE',   credits: 60, lastLogin: '2026-06-05T09:15:00Z', location: 'Constantine',   pendingRequest: false },
    { id: 'USR-B02', name: 'Ing. Khalid Mezaache',    role: 'ADMIN',    sector: 'ADE',  email: 'kmezaache@ade.dz',         institution: 'ADE — Réseau Batna',         status: 'ACTIVE',   credits: 45, lastLogin: '2026-06-04T14:00:00Z', location: 'Batna',         pendingRequest: false },
    { id: 'USR-B03', name: 'Mme. Lynda Ouchen',       role: 'ADMIN',    sector: 'ADE',  email: 'louchen@ade.dz',           institution: 'ADE — Antenne Sétif',        status: 'PENDING',  credits: 0,  lastLogin: null,                   location: 'Sétif',         pendingRequest: true  },

    // ── DRE ───────────────────────────────────────────────────
    { id: 'USR-C01', name: 'Directeur Hadj Baali',    role: 'ADMIN',    sector: 'DRE',  email: 'baali@dre.gov.dz',         institution: 'DRE — Wilaya de Batna',      status: 'ACTIVE',   credits: 99, lastLogin: '2026-06-05T10:12:00Z', location: 'Batna',         pendingRequest: false },
    { id: 'USR-C02', name: 'Sous-Dir. Ben Amara',     role: 'ADMIN',    sector: 'DRE',  email: 'benamara@dre.gov.dz',      institution: 'DRE — Wilaya de Khenchela',  status: 'ACTIVE',   credits: 70, lastLogin: '2026-06-05T07:45:00Z', location: 'Khenchela',     pendingRequest: false },
    { id: 'USR-C03', name: 'Ing. Samira Dif',         role: 'ADMIN',    sector: 'DRE',  email: 'sdif@dre.gov.dz',          institution: 'DRE — Wilaya de Biskra',     status: 'SUSPENDED',credits: 0,  lastLogin: '2026-06-01T10:00:00Z', location: 'Biskra',        pendingRequest: false },

    // ── ONA ───────────────────────────────────────────────────
    { id: 'USR-D01', name: 'Ing. Omar Seddiki',       role: 'ADMIN',    sector: 'ONA',  email: 'oseddiki@ona.dz',          institution: 'ONA — Station Épuration Alger',status:'ACTIVE',  credits: 55, lastLogin: '2026-06-05T09:00:00Z', location: 'Alger',         pendingRequest: false },
    { id: 'USR-D02', name: 'Dr. Nadia Bouchrit',      role: 'ADMIN',    sector: 'ONA',  email: 'nbouchrit@ona.dz',         institution: 'ONA — Labo Analyse Oran',    status: 'ACTIVE',   credits: 65, lastLogin: '2026-06-04T15:30:00Z', location: 'Oran',          pendingRequest: false },
    { id: 'USR-D03', name: 'Tech. Ryad Benkhaled',    role: 'ADMIN',    sector: 'ONA',  email: 'rbenkhaled@ona.dz',        institution: 'ONA — Antenne Est',          status: 'PENDING',  credits: 0,  lastLogin: null,                   location: 'Annaba',        pendingRequest: true  },

    // ── ENGINEERS ─────────────────────────────────────────────
    { id: 'USR-E01', name: 'Ing. Karim Meziane',      role: 'ENGINEER', sector: null,   email: 'meziane@expert-gis.dz',    institution: 'Bureau GeoData DZ',          status: 'ACTIVE',   credits: 45, lastLogin: '2026-06-05T09:30:00Z', location: 'Alger',         pendingRequest: false },
    { id: 'USR-E02', name: 'Dr. Sara Boulkhrouf',     role: 'ENGINEER', sector: null,   email: 'sara@hydro-consult.dz',    institution: 'HydroConsult DZ',            status: 'ACTIVE',   credits: 60, lastLogin: '2026-06-04T16:00:00Z', location: 'Oran',          pendingRequest: false },
    { id: 'USR-E03', name: 'Ing. Ahmed Touati',       role: 'ENGINEER', sector: null,   email: 'touati@sonatrach.dz',      institution: 'Sonatrach Upstream',         status: 'SUSPENDED',credits: 0,  lastLogin: '2026-06-01T12:00:00Z', location: 'Hassi Messaoud',pendingRequest: false },

    // ── STUDENTS ──────────────────────────────────────────────
    { id: 'USR-S01', name: 'Étud. Farouk Amara',      role: 'STUDENT',  sector: null,   email: 'farouk@univ-batna.dz',     institution: 'Université Batna-2',         status: 'ACTIVE',   credits: 10, lastLogin: '2026-06-05T08:00:00Z', location: 'Batna',         pendingRequest: false },
    { id: 'USR-S02', name: 'Étud. Lina Chaoui',       role: 'STUDENT',  sector: null,   email: 'lina@univ-constantine.dz', institution: 'Université Constantine',     status: 'PENDING',  credits: 0,  lastLogin: null,                   location: 'Constantine',   pendingRequest: true  },
    { id: 'USR-S03', name: 'Étud. Rym Ferroukhi',     role: 'STUDENT',  sector: null,   email: 'rym@ens.dz',               institution: 'ENS Hydro',                  status: 'PENDING',  credits: 0,  lastLogin: null,                   location: 'Alger',         pendingRequest: true  },

    // ── FARMERS ───────────────────────────────────────────────
    { id: 'USR-F01', name: 'Ferme Ben Khelil',        role: 'FARMER',   sector: null,   email: 'benkhelil@farm.dz',        institution: 'Exploitation Agricole',      status: 'ACTIVE',   credits: 5,  lastLogin: '2026-06-03T07:00:00Z', location: 'Khenchela',     pendingRequest: false },
    { id: 'USR-F02', name: 'Agric. Mourad Taleb',     role: 'FARMER',   sector: null,   email: 'mtaleb@agri.dz',           institution: 'Coopérative Agri Biskra',    status: 'ACTIVE',   credits: 5,  lastLogin: '2026-06-02T06:30:00Z', location: 'Biskra',        pendingRequest: false },
];

// ============================================================
// EXTENDED PERMISSIONS MATRIX (per sector + per role)
// ============================================================
window.permissionsMatrix = window.permissionsMatrix || {
    ADMIN: {
        map_view: true,  map_edit: true,
        analytics: true,
        alert_receive: true,  alert_send: true,
        wells_read: true, wells_write: true,
        assets_view: true, assets_edit: true,
        library_view: true, library_upload: true, library_delete: true,
        community_view: true, community_post: true, experts_contact: true,
        gis_read: true, gis_write: true, export_shp: true,
        neural_ai: true,
        qgis: true,
        piezo_monitoring: true, wqi_monitoring: true,
        audit_view: true
    },
    ENGINEER: {
        map_view: true,  map_edit: false,
        analytics: true,
        alert_receive: true,  alert_send: false,
        wells_read: true, wells_write: true,
        assets_view: true, assets_edit: true,
        library_view: true, library_upload: true, library_delete: false,
        community_view: true, community_post: true, experts_contact: true,
        gis_read: true, gis_write: false, export_shp: true,
        neural_ai: true,
        qgis: true,
        piezo_monitoring: true, wqi_monitoring: true,
        audit_view: false
    },
    STUDENT: {
        map_view: true,  map_edit: false,
        analytics: true,
        alert_receive: false, alert_send: false,
        wells_read: true, wells_write: false,
        assets_view: false, assets_edit: false,
        library_view: true, library_upload: false, library_delete: false,
        community_view: true, community_post: true, experts_contact: false,
        gis_read: true, gis_write: false, export_shp: false,
        neural_ai: false,
        qgis: false,
        piezo_monitoring: true, wqi_monitoring: false,
        audit_view: false
    },
    FARMER: {
        map_view: true,  map_edit: false,
        analytics: false,
        alert_receive: true,  alert_send: false,
        wells_read: false, wells_write: false,
        assets_view: false, assets_edit: false,
        library_view: false, library_upload: false, library_delete: false,
        community_view: true, community_post: false, experts_contact: false,
        gis_read: false, gis_write: false, export_shp: false,
        neural_ai: false,
        qgis: false,
        piezo_monitoring: false, wqi_monitoring: false,
        audit_view: false
    },
    // Sector-specific (override for ADMIN sub-roles)
    ANRH: null,
    ADE:  null,
    DRE:  null,
    ONA:  null,
};
// Load sector permissions from definitions
['ANRH','ADE','DRE','ONA'].forEach(s => {
    window.permissionsMatrix[s] = { ...window.SECTORS[s].permissions };
});

const permissionLabels = {
    // 🗺️ الخريطة
    map_view:          '🗺️ عرض الخريطة التفاعلية',
    map_edit:          '✏️ تعديل عناصر الخريطة',
    // 📊 التحليلات
    analytics:         '📊 التحليلات والمخططات',
    // 🔔 التنبيهات
    alert_receive:     '🔔 استقبال إنذارات التلوث',
    alert_send:        '🚨 إرسال تنبيهات الطوارئ',
    // 💧 إدارة الآبار
    wells_read:        '💧 قراءة بيانات الآبار',
    wells_write:       '✍️ تعديل بيانات الآبار',
    // ⚙️ الأصول والمعدات
    assets_view:       '⚙️ عرض الأصول والمعدات',
    assets_edit:       '🔧 تعديل الأصول والمعدات',
    // 📚 المكتبة العلمية
    library_view:      '📚 تصفح المكتبة العلمية',
    library_upload:    '📤 رفع وثائق للمكتبة',
    library_delete:    '🗑️ حذف وثائق المكتبة',
    // 👥 مركز المجتمع والخبراء
    community_view:    '👥 عرض مركز المجتمع',
    community_post:    '💬 النشر في مركز المجتمع',
    experts_contact:   '🏅 التواصل مع الخبراء',
    // 🗂️ طبقات GIS
    gis_read:          '🗂️ عرض طبقات GIS / SIG',
    gis_write:         '🖊️ تعديل طبقات GIS',
    export_shp:        '📦 تصدير Shapefile / GeoTIFF',
    // 🤖 الذكاء الاصطناعي
    neural_ai:         '🤖 النمذجة بالذكاء الاصطناعي',
    // 🔭 QGIS
    qgis:              '🔭 منصة QGIS بيئة العمل',
    // 📡 المراقبة
    piezo_monitoring:  '📡 مراقبة الرصد البيزومتري',
    wqi_monitoring:    '🧪 مؤشرات جودة المياه WQI',
    // 🔐 الإدارة
    audit_view:        '🔐 عرض سجلات المراجعة',
};

// Permission section grouping for display
const permissionGroups = [
    { key: 'map',       label: '🗺️ الخريطة',                  keys: ['map_view','map_edit'] },
    { key: 'analytics', label: '📊 التحليلات',                 keys: ['analytics'] },
    { key: 'alerts',    label: '🔔 التنبيهات والإنذارات',      keys: ['alert_receive','alert_send'] },
    { key: 'wells',     label: '💧 إدارة الآبار',              keys: ['wells_read','wells_write'] },
    { key: 'assets',    label: '⚙️ الأصول والمعدات',           keys: ['assets_view','assets_edit'] },
    { key: 'library',   label: '📚 المكتبة العلمية',           keys: ['library_view','library_upload','library_delete'] },
    { key: 'community', label: '👥 مركز المجتمع والخبراء',    keys: ['community_view','community_post','experts_contact'] },
    { key: 'gis',       label: '🗂️ طبقات GIS / البيانات',    keys: ['gis_read','gis_write','export_shp'] },
    { key: 'ai',        label: '🤖 الذكاء الاصطناعي',         keys: ['neural_ai'] },
    { key: 'qgis',      label: '🔭 بيئة QGIS',                keys: ['qgis'] },
    { key: 'monitoring',label: '📡 المراقبة والرصد',           keys: ['piezo_monitoring','wqi_monitoring'] },
    { key: 'admin',     label: '🔐 الإدارة والمراجعة',         keys: ['audit_view'] },
];

// ============================================================
// SUPERVISION TAB CONFIG
// ============================================================
window._currentSupPage = 'ANRH';

const tabConfig = {
    ANRH:     { label: 'ANRH — موارد مائية',     icon: 'fa-water',             color: '#00d4ff', isInstitutional: true  },
    ADE:      { label: 'ADE — جزائرية للمياه',    icon: 'fa-faucet-drip',       color: '#3498db', isInstitutional: true  },
    DRE:      { label: 'DRE — مديريات ولائية',    icon: 'fa-building-columns',  color: '#9b59b6', isInstitutional: true  },
    ONA:      { label: 'ONA — التطهير',            icon: 'fa-recycle',           color: '#27ae60', isInstitutional: true  },
    ENGINEER: { label: 'مكاتب الخبراء',            icon: 'fa-drafting-compass',  color: '#e67e22', isInstitutional: false },
    STUDENT:  { label: 'القطاع الأكاديمي',         icon: 'fa-graduation-cap',    color: '#1abc9c', isInstitutional: false },
    FARMER:   { label: 'مستخدمو الميدان',          icon: 'fa-tractor',           color: '#f39c12', isInstitutional: false },
};

// ============================================================
// RENDER SUPERVISION PAGE
// ============================================================
window.renderSupervisionPage = function(pageKey) {
    window._currentSupPage = pageKey;
    const container = document.getElementById('supervision-users-list');
    if (!container) return;

    const cfg = tabConfig[pageKey] || tabConfig.ENGINEER;

    // Update tab active state
    document.querySelectorAll('.sup-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.role === pageKey);
    });

    // Update page title
    const titleEl = document.getElementById('sup-page-title');
    if (titleEl) titleEl.innerHTML =
        `<i class="fa-solid ${cfg.icon}" style="color:${cfg.color}"></i> إشراف: ${cfg.label}`;

    // Filter users
    let filtered;
    if (['ANRH','ADE','DRE','ONA'].includes(pageKey)) {
        filtered = window.mockUsers.filter(u => u.sector === pageKey);
    } else {
        filtered = window.mockUsers.filter(u => u.role === pageKey && !u.sector);
    }

    // Render sector header card (institutional tabs only)
    let sectorHeader = '';
    if (cfg.isInstitutional && window.SECTORS[pageKey]) {
        const sec = window.SECTORS[pageKey];
        sectorHeader = `
        <div class="sector-header-card" style="border-left:4px solid ${cfg.color};margin-bottom:1.2rem;">
            <div class="sector-hdr-top">
                <div class="sector-icon-lg" style="background:${cfg.color}22;border-color:${cfg.color};">
                    <i class="fa-solid ${cfg.icon}" style="color:${cfg.color};font-size:1.8rem;"></i>
                </div>
                <div>
                    <h3 style="margin:0;color:#fff;">${sec.name} <small style="color:${cfg.color};font-size:0.8em;">— ${sec.fullNameFr}</small></h3>
                    <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.82rem;">${sec.fullName}</p>
                    <span class="domain-badge" style="border-color:${cfg.color};color:${cfg.color};">@${sec.domain}</span>
                    <span class="access-badge" style="background:${cfg.color}18;color:${cfg.color};">${sec.accessLevel.replace(/_/g,' ')}</span>
                </div>
            </div>
            <div class="sector-tasks">
                <strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">المهام الرئيسية</strong>
                <ul style="margin:0.5rem 0 0;padding-right:1.2rem;color:#ccc;font-size:0.83rem;">
                    ${sec.tasks.map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>
            <div class="sector-perms-mini">
                ${Object.entries(sec.permissions).map(([k,v]) => `
                    <span class="perm-chip ${v ? 'on' : 'off'}" title="${permissionLabels[k] || k}">
                        <i class="fa-solid ${v ? 'fa-check' : 'fa-times'}"></i> ${k.replace(/_/g,' ')}
                    </span>
                `).join('')}
            </div>
            <button class="admin-action-btn view" onclick="openSectorPermissions('${pageKey}')" style="margin-top:0.7rem;">
                <i class="fa-solid fa-sliders"></i> تعديل صلاحيات ${sec.name}
            </button>
        </div>`;
    }

    // Render users
    const usersHtml = filtered.length === 0
        ? `<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>لا يوجد مستخدمون في هذه الفئة</p></div>`
        : filtered.map(user => renderUserCard(user, cfg)).join('');

    container.innerHTML = sectorHeader + usersHtml;
};

function renderUserCard(user, cfg) {
    const sectorInfo = user.sector ? window.SECTORS[user.sector] : null;
    const color = sectorInfo?.color || cfg.color;
    const icon = sectorInfo?.icon || cfg.icon;
    const domainValid = user.sector
        ? user.email.endsWith('@' + window.SECTORS[user.sector]?.domain)
        : true;

    return `
    <div class="user-card-admin ${user.status.toLowerCase()}" style="border-left-color:${color};">
        <div class="user-card-header">
            <div class="user-avatar-admin" style="background:${color}22;border-color:${color};">
                <i class="fa-solid ${icon}" style="color:${color};"></i>
            </div>
            <div class="user-card-info">
                <strong>${user.name}</strong>
                <small style="display:flex;align-items:center;gap:4px;">
                    ${user.email}
                    ${domainValid
                        ? `<span style="color:#2ecc71;font-size:0.7em;" title="نطاق رسمي معتمد">✓ نطاق معتمد</span>`
                        : `<span style="color:#e74c3c;font-size:0.7em;" title="نطاق غير رسمي">⚠ نطاق غير رسمي</span>`}
                </small>
                <small>${user.institution}</small>
                ${user.sector ? `<small class="sector-tag" style="color:${color};">🏛 ${user.sector}</small>` : ''}
            </div>
            <div class="user-status-col">
                ${getStatusBadge(user.status)}
                <small style="color:#888;margin-top:4px;display:block;">📍 ${user.location}</small>
                ${user.lastLogin
                    ? `<small style="color:#666;font-size:0.7rem;">${new Date(user.lastLogin).toLocaleDateString('ar-DZ')}</small>`
                    : `<small style="color:#555;font-size:0.7rem;">لم يسجل بعد</small>`}
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
                <button class="admin-action-btn impersonate" onclick="startImpersonation('${user.role}', '${user.sector || ''}')">
                    <i class="fa-solid fa-masks-theater"></i> محاكاة
                </button>
            ` : ''}
            ${user.status === 'SUSPENDED' ? `
                <button class="admin-action-btn approve" onclick="reactivateUser('${user.id}')">
                    <i class="fa-solid fa-rotate-left"></i> إعادة تفعيل
                </button>
            ` : ''}
        </div>
    </div>`;
}

// ============================================================
// SECTOR PERMISSIONS MODAL
// ============================================================
window.openSectorPermissions = function(sectorId) {
    const sec = window.SECTORS[sectorId];
    if (!sec) return;
    const perms = window.permissionsMatrix[sectorId] || {};
    const color = tabConfig[sectorId]?.color || '#00d4ff';

    const modal = document.getElementById('modal-sector-perms');
    if (!modal) return;

    document.getElementById('sector-perms-title').innerHTML =
        `<i class="fa-solid ${tabConfig[sectorId]?.icon}" style="color:${color}"></i> صلاحيات ${sec.name} — ${sec.fullName}`;

    document.getElementById('sector-perms-grid').innerHTML = Object.entries(permissionLabels).map(([key, label]) => `
        <div class="sector-perm-row">
            <label class="perm-toggle">
                <input type="checkbox"
                    ${perms[key] ? 'checked' : ''}
                    onchange="updateSectorPermission('${sectorId}','${key}',this.checked)">
                <span class="perm-slider"></span>
            </label>
            <span>${label}</span>
        </div>
    `).join('');

    modal.classList.add('active');
};

window.updateSectorPermission = function(sector, perm, value) {
    if (!window.permissionsMatrix[sector]) window.permissionsMatrix[sector] = {};
    window.permissionsMatrix[sector][perm] = value;
    
    // Sync the change back to the SECTORS object
    if (window.SECTORS[sector] && window.SECTORS[sector].permissions) {
        window.SECTORS[sector].permissions[perm] = value;
        
        // Re-render the supervision page to update the chips immediately behind the modal
        if (window._currentSupPage === sector && typeof window.renderSupervisionPage === 'function') {
            window.renderSupervisionPage(sector);
        }
    }
    
    logAuditEvent('SECTOR_PERMISSION_CHANGED', sector,
        `${perm} → ${value ? 'ENABLED' : 'DISABLED'} pour ${sector}`,
        sector);
    showToast(`🔧 صلاحية "${permissionLabels[perm]}" للهيئة ${sector}: ${value ? '✅ مفعّلة' : '❌ معطّلة'}`, 'info');
    
    // التحديث الفوري للواجهة (Live Preview) في حالة المحاكاة أو الاستخدام المباشر
    if (typeof window.applyRolePermissions === 'function') {
        window.applyRolePermissions();
    }
};

// ============================================================
// PERMISSIONS MATRIX RENDERER (Extended: Sectors + Roles)
// ============================================================
window.renderPermissionsMatrix = function() {
    const container = document.getElementById('permissions-matrix-grid');
    if (!container) return;

    const institutionalCols = ['ANRH', 'ADE', 'DRE', 'ONA'];
    const roleCols          = ['ENGINEER', 'STUDENT', 'FARMER'];
    const allCols           = [...institutionalCols, ...roleCols];

    const colHeader = (key, isInst) => {
        const cfg = tabConfig[key] || {};
        return `<th style="min-width:88px;position:sticky;top:0;z-index:2;background:#0d1520;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px;">
                <i class="fa-solid ${cfg.icon}" style="color:${cfg.color};font-size:1.1rem;"></i>
                <span style="color:${cfg.color};font-weight:700;font-size:0.76rem;letter-spacing:0.03em;">${key}</span>
                <span style="font-size:0.58rem;color:#555;background:rgba(255,255,255,0.05);padding:1px 6px;border-radius:4px;">${isInst ? 'قطاعي' : 'عام'}</span>
            </div>
        </th>`;
    };

    // Build rows grouped by section
    const bodyRows = permissionGroups.map(group => {
        const groupHeader = `
        <tr class="perm-group-row">
            <td colspan="${allCols.length + 1}" style="
                background: linear-gradient(90deg,rgba(0,212,255,0.10),rgba(0,212,255,0.03),transparent);
                color:#00d4ff; font-weight:700; font-size:0.78rem;
                padding: 8px 14px; letter-spacing:0.05em;
                border-top: 1px solid rgba(0,212,255,0.15);
                border-bottom: 1px solid rgba(0,212,255,0.08);
            ">${group.label}</td>
        </tr>`;

        const permRows = group.keys.map(perm => {
            if (!permissionLabels[perm]) return '';
            return `
            <tr class="perm-data-row" style="transition:background 0.15s;" onmouseover="this.style.background='rgba(0,212,255,0.04)'" onmouseout="this.style.background=''">
                <td style="text-align:right;font-size:0.8rem;color:#cbd5e1;padding:7px 14px;white-space:nowrap;">${permissionLabels[perm]}</td>
                ${allCols.map((col, idx) => {
                    const matrix = window.permissionsMatrix[col] || {};
                    const val    = matrix[perm];
                    const isGov  = idx < institutionalCols.length;
                    // No locked permissions - full control
                    const isLocked = false;
                    return `<td class="perm-cell" style="text-align:center;${isGov ? 'background:rgba(0,212,255,0.015);' : ''}">
                        <label class="perm-toggle${isLocked ? ' locked' : ''}" title="${permissionLabels[perm]} — ${col}">
                            <input type="checkbox"
                                ${val ? 'checked' : ''}
                                ${isLocked ? 'disabled' : ''}
                                onchange="updatePermission('${col}','${perm}',this.checked)">
                            <span class="perm-slider"></span>
                        </label>
                    </td>`;
                }).join('')}
            </tr>`;
        }).join('');

        return groupHeader + permRows;
    }).join('');

    container.innerHTML = `
        <table class="perms-table" style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:#0a1220;">
                    <th style="text-align:right;min-width:210px;padding:10px 14px;position:sticky;top:0;z-index:3;background:#0a1220;"
                        rowspan="2">القسم / الصلاحية</th>
                    <th colspan="${institutionalCols.length}" style="
                        background:rgba(0,212,255,0.10);color:#00d4ff;
                        text-align:center;font-size:0.72rem;letter-spacing:0.1em;
                        padding:7px;border-bottom:2px solid rgba(0,212,255,0.3);
                        position:sticky;top:0;z-index:3;
                    ">🏛 الهيئات الحكومية</th>
                    <th colspan="${roleCols.length}" style="
                        background:rgba(155,89,182,0.10);color:#c39bd3;
                        text-align:center;font-size:0.72rem;letter-spacing:0.1em;
                        padding:7px;border-bottom:2px solid rgba(155,89,182,0.3);
                        position:sticky;top:0;z-index:3;
                    ">👤 المستخدمون العامون</th>
                </tr>
                <tr>
                    ${institutionalCols.map(k => colHeader(k, true)).join('')}
                    ${roleCols.map(k => colHeader(k, false)).join('')}
                </tr>
            </thead>
            <tbody>${bodyRows}</tbody>
        </table>`;
};

window.updatePermission = function(col, perm, value) {
    if (!window.permissionsMatrix[col]) window.permissionsMatrix[col] = {};
    window.permissionsMatrix[col][perm] = value;
    const sector = ['ANRH','ADE','DRE','ONA'].includes(col) ? col : null;
    
    // Sync the change back to the SECTORS object so the mini-chips in the UI reflect the reality
    if (sector && window.SECTORS[sector] && window.SECTORS[sector].permissions) {
        window.SECTORS[sector].permissions[perm] = value;
        
        // Re-render the supervision page if it's currently open to update the chips immediately
        if (window._currentSupPage === sector && typeof window.renderSupervisionPage === 'function') {
            window.renderSupervisionPage(sector);
        }
    }
    
    logAuditEvent('PERMISSION_CHANGED', col,
        `${permissionLabels[perm]} → ${value ? 'مفعّلة' : 'معطّلة'} للـ ${col}`,
        sector);
    showToast(`🔧 "${permissionLabels[perm]}" لـ ${col}: ${value ? '✅' : '❌'}`, 'info');
    
    // التحديث الفوري للواجهة (Live Preview) في حالة المحاكاة أو الاستخدام المباشر
    if (typeof window.applyRolePermissions === 'function') {
        window.applyRolePermissions();
    }
};

// ============================================================
// AUDIT LOG RENDERER (Extended with Sector column)
// ============================================================
window.renderAuditLog = function() {
    const container = document.getElementById('audit-log-body');
    if (!container) return;
    const log = window.auditLog;
    container.innerHTML = log.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#666;">لا توجد سجلات بعد.</td></tr>`
        : log.slice(0, 100).map(entry => {
            const sectorColor = entry.sector && tabConfig[entry.sector]?.color;
            return `
            <tr>
                <td><code style="color:#00d4ff;font-size:0.7em;">${entry.id.slice(-8)}</code></td>
                <td style="font-size:0.78rem;white-space:nowrap;">${new Date(entry.timestamp).toLocaleString('ar-DZ')}</td>
                <td>
                    <strong style="font-size:0.82rem;">${entry.adminId}</strong>
                    ${entry.sector
                        ? `<br><span style="font-size:0.68rem;color:${sectorColor || '#aaa'};">🏛 ${entry.sector}</span>`
                        : ''}
                </td>
                <td>${entry.institution !== '—' ? `<small style="color:#888;font-size:0.72rem;">${entry.institution}</small>` : ''}</td>
                <td><span class="audit-action-badge ${getAuditColor(entry.action)}">${entry.action}</span></td>
                <td style="color:#aaa;font-size:0.8rem;">${entry.target}</td>
                <td style="color:#777;font-size:0.75rem;max-width:220px;overflow:hidden;text-overflow:ellipsis;">${entry.details}</td>
            </tr>`;
        }).join('');
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
    setText('kpi-active-users',   active.length + ' نشط');
    setText('kpi-pending',        pending.length);
    setText('kpi-engineers',      active.filter(u => u.role === 'ENGINEER').length);
    setText('kpi-students',       active.filter(u => u.role === 'STUDENT').length);
    setText('kpi-farmers',        active.filter(u => u.role === 'FARMER').length);
    setText('kpi-suspended',      users.filter(u => u.status === 'SUSPENDED').length);
    setText('kpi-secure-sessions',active.length + Math.floor(Math.random() * 5));
    setText('kpi-data-flow',      (active.length * 1.4 + Math.random() * 2).toFixed(1) + ' MB/s');
    setText('kpi-audit-count',    window.auditLog.length);
    setText('kpi-wells-count',    window.mockData?.rigs?.length || window.mockData?.overview?.totalWells || 0);

    // Sector breakdown
    ['ANRH','ADE','DRE','ONA'].forEach(s => {
        const el = document.getElementById('kpi-sector-' + s.toLowerCase());
        if (el) el.textContent = users.filter(u => u.sector === s && u.status === 'ACTIVE').length;
    });

    // Pending badge on nav
    const badge = document.getElementById('admin-pending-badge');
    if (badge) badge.textContent = pending.length;
};

// ============================================================
// USER MANAGEMENT ACTIONS
// ============================================================
window.approveUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    user.status = 'ACTIVE';
    user.pendingRequest = false;
    user.credits = user.role === 'STUDENT' ? 10 : user.sector ? 80 : 30;
    logAuditEvent('USER_APPROVED', userId,
        `${user.name} (${user.email}) — ${user.institution} — approuvé`,
        user.sector);
    showToast(`✅ تم تفعيل حساب ${user.name}`, 'success');
    renderSupervisionPage(window._currentSupPage);
    updateKPIs();
};

window.rejectUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    user.status = 'REJECTED';
    user.pendingRequest = false;
    logAuditEvent('USER_REJECTED', userId,
        `${user.name} (${user.email}) — rejeté`,
        user.sector);
    showToast(`❌ تم رفض طلب ${user.name}`, 'warning');
    renderSupervisionPage(window._currentSupPage);
    updateKPIs();
};

window.suspendUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`⚠️ هل تريد تجميد حساب ${user.name} (${user.institution}) فوراً؟`)) {
        user.status = 'SUSPENDED';
        logAuditEvent('FORCED_REVOCATION', userId,
            `${user.name} — session révoquée — activité suspecte`,
            user.sector);
        showToast(`🔒 تم تجميد حساب ${user.name} فورياً`, 'error');
        renderSupervisionPage(window._currentSupPage);
        updateKPIs();
    }
};

window.reactivateUser = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    user.status = 'ACTIVE';
    logAuditEvent('USER_REACTIVATED', userId,
        `${user.name} — compte réactivé`,
        user.sector);
    showToast(`🔓 تم إعادة تفعيل حساب ${user.name}`, 'success');
    renderSupervisionPage(window._currentSupPage);
    updateKPIs();
};

window.viewUserRecord = function(userId) {
    const user = window.mockUsers.find(u => u.id === userId);
    if (!user) return;
    const modal = document.getElementById('modal-user-record');
    if (!modal) return;
    const sector = user.sector ? window.SECTORS[user.sector] : null;
    const color = sector ? tabConfig[user.sector]?.color : '#00d4ff';

    document.getElementById('record-name').textContent = user.name;
    document.getElementById('record-id').textContent = user.id;
    document.getElementById('record-role').innerHTML =
        user.sector
            ? `<span style="color:${color}">🏛 ${user.sector}</span> (${user.role})`
            : user.role;
    document.getElementById('record-email').innerHTML =
        user.email +
        (user.sector && window.SECTORS[user.sector]
            ? (user.email.endsWith('@' + window.SECTORS[user.sector].domain)
                ? ` <span style="color:#2ecc71;font-size:0.75em;">✓ نطاق معتمد</span>`
                : ` <span style="color:#e74c3c;font-size:0.75em;">⚠ نطاق غير رسمي</span>`)
            : '');
    document.getElementById('record-inst').textContent = user.institution;
    document.getElementById('record-status').textContent = user.status;
    document.getElementById('record-location').textContent = user.location;
    document.getElementById('record-lastlogin').textContent = user.lastLogin
        ? new Date(user.lastLogin).toLocaleString('ar-DZ')
        : 'لم يسجل دخولاً بعد';

    if (sector) {
        const tasksList = document.getElementById('record-tasks');
        if (tasksList) tasksList.innerHTML = sector.tasks.map(t => `<li>${t}</li>`).join('');
        const sectorSection = document.getElementById('record-sector-section');
        if (sectorSection) {
            sectorSection.style.display = 'block';
            document.getElementById('record-sector-name').textContent = sector.fullName;
        }
    } else {
        const sectorSection = document.getElementById('record-sector-section');
        if (sectorSection) sectorSection.style.display = 'none';
    }

    const auditEntries = window.auditLog.filter(e =>
        e.target === userId || e.details.includes(user.name) || e.details.includes(user.email));
    document.getElementById('record-audit').innerHTML = auditEntries.length
        ? auditEntries.slice(0, 6).map(e =>
            `<div class="audit-mini-row">
                <span class="audit-action">${e.action}</span>
                <span style="color:#888;font-size:0.75rem;">${new Date(e.timestamp).toLocaleString('ar-DZ')}</span>
            </div>`).join('')
        : '<p style="color:#555;font-size:0.82rem;padding:0.4rem;">لا توجد سجلات بعد.</p>';

    modal.classList.add('active');
    logAuditEvent('RECORD_VIEWED', userId,
        `Admin consulté le dossier sécurité de ${user.name}`,
        user.sector);
};

// ============================================================
// STATUS BADGE
// ============================================================
function getStatusBadge(status) {
    const map = {
        ACTIVE:    '<span class="status-pill active">● نشط</span>',
        PENDING:   '<span class="status-pill pending">◐ معلق</span>',
        SUSPENDED: '<span class="status-pill suspended">✕ موقوف</span>',
        REJECTED:  '<span class="status-pill rejected">✕ مرفوض</span>',
    };
    return map[status] || map.PENDING;
}

function getAuditColor(action) {
    if (action.includes('APPROVE') || action.includes('REACTIVATED')) return 'success';
    if (action.includes('REJECT') || action.includes('SUSPENDED') || action.includes('REVOCATION')) return 'danger';
    if (action.includes('IMPERSONATION') || action.includes('VIEWED')) return 'warning';
    if (action.includes('PERMISSION') || action.includes('SECTOR')) return 'info';
    return 'info';
}

// ============================================================
// IMPERSONATION
// ============================================================
window._impersonationActive = false;
window._originalUser = null;

window.startImpersonation = function(targetRole, targetSector) {
    if (window._impersonationActive) {
        showToast('⚠️ وضع المحاكاة نشط مسبقاً.', 'warning'); return;
    }
    if (window.mockData?.activeUser?.role !== 'ADMIN') {
        showToast('🔒 هذه الميزة للمسؤول فقط.', 'error'); return;
    }
    window._originalUser = JSON.parse(JSON.stringify(window.mockData.activeUser));
    window._impersonationActive = true;
    const roleNames = { ADMIN:'Superior', ENGINEER:'Premium', STUDENT:'Academic', FARMER:'Field User' };
    
    // Set both Role and Sector for accurate matrix lookup
    window.mockData.activeUser.role = targetRole;
    if (targetSector) {
        window.mockData.activeUser.sector = targetSector;
    } else {
        delete window.mockData.activeUser.sector;
    }
    window.mockData.activeUser.tier = roleNames[targetRole] || targetRole;
    
    document.getElementById('impersonation-banner').style.display = 'flex';
    document.getElementById('impersonation-banner').querySelector('span').textContent =
        `👁️ تحاكي الآن جهة: ${targetSector ? targetSector : (roleNames[targetRole] || targetRole)} — الشاشة تُظهر حقيقة الصلاحيات لهذه الفئة`;
        
    applyRolePermissions();
    logAuditEvent('IMPERSONATION_START', targetRole,
        `Admin started impersonation as ${targetSector || targetRole}`);
    showToast(`👁️ تشاهد الآن واجهة ${roleNames[targetRole]}`, 'info');
    switchView('dashboard');
};

window.stopImpersonation = function() {
    if (!window._impersonationActive) return;
    window.mockData.activeUser = window._originalUser;
    window._impersonationActive = false;
    window._originalUser = null;
    document.getElementById('impersonation-banner').style.display = 'none';
    applyRolePermissions();
    logAuditEvent('IMPERSONATION_END', 'ADMIN', 'Session de simulation terminée');
    showToast('✅ عُدت لحسابك الإداري', 'success');
    switchView('admin-supervision');
};

// ============================================================
// COORDINATE MASKING
// ============================================================
window._coordsMasked = false;

window.toggleCoordsMasking = function() {
    window._coordsMasked = !window._coordsMasked;
    const btn = document.getElementById('btn-mask-coords');
    if (btn) {
        btn.innerHTML = window._coordsMasked
            ? '<i class="fa-solid fa-eye"></i> رفع الحجب'
            : '<i class="fa-solid fa-eye-slash"></i> حجب الإحداثيات';
        btn.style.background = window._coordsMasked ? 'var(--accent-danger,#e74c3c)' : '';
    }
    logAuditEvent(
        window._coordsMasked ? 'COORDS_MASKED' : 'COORDS_UNMASKED',
        'ALL_ROLES',
        `Coordonnées précises ${window._coordsMasked ? 'masquées' : 'visibles'} pour les rôles inférieurs`
    );
    showToast(
        window._coordsMasked
            ? '🔒 تم حجب الإحداثيات الدقيقة عن الفئات الدنيا'
            : '🔓 تم رفع حجب الإحداثيات',
        window._coordsMasked ? 'warning' : 'success'
    );
};

// ============================================================
// SIMULATE LIVE ACTIVITY (Audit trail demo)
// ============================================================
function seedLiveActivity() {
    const actions = [
        { action: 'DATA_UPDATE', target: 'USR-A02', details: 'قامت Soraya Khelil (ANRH) بتحديث معطيات بئر F-16 — المستوى البيزومتري: 42.3م', sector: 'ANRH' },
        { action: 'ALERT_SENT',  target: 'USR-B01', details: 'أرسلت Fatima Benali (ADE) إنذار تلوث — بئر W-22 Constantine — تجاوز TDS: 2400 mg/L', sector: 'ADE' },
        { action: 'MAP_EXPORT',  target: 'USR-D01', details: 'قام Omar Seddiki (ONA) بتحميل خريطة جودة المياه المعالجة — Wilaya Alger — GeoTIFF', sector: 'ONA' },
        { action: 'PERMIT_FILED',target: 'USR-C01', details: 'أودع Hadj Baali (DRE Batna) ترخيص حفر جديد — بئر Oued Chaaba — عمق 180م', sector: 'DRE' },
        { action: 'WQI_UPDATE',  target: 'USR-A01', details: 'قام Dr. Boufares (ANRH) بتحديث نموذج WQI — نتائج الهيدروكيمياء لأغسطس 2026', sector: 'ANRH' },
    ];
    actions.forEach((a, i) => {
        setTimeout(() => {
            if (window.auditLog) {
                const entry = {
                    id: 'AUD-DEMO-' + (Date.now() + i),
                    timestamp: new Date(Date.now() - i * 300000).toISOString(),
                    adminId: a.details.split('(')[0].trim().split(' ').slice(-2).join(' '),
                    adminRole: 'ADMIN',
                    sector: a.sector,
                    institution: window.SECTORS[a.sector]?.fullName || '—',
                    action: a.action,
                    target: a.target,
                    details: a.details,
                    ip: '10.0.' + Math.floor(Math.random()*255) + '.' + Math.floor(Math.random()*255),
                    encrypted: true
                };
                window.auditLog.push(entry);
            }
        }, i * 50);
    });
    setTimeout(() => renderAuditLog(), 350);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    try {
        const saved = localStorage.getItem('geowell_audit');
        if (saved) window.auditLog = JSON.parse(saved);
    } catch(e) {}

    if (window.auditLog.length === 0) {
        logAuditEvent('SYSTEM_INIT', 'SYSTEM',
            'GeoWell Système de Supervision Sectorielle — Initialisé');
        seedLiveActivity();
    }

    updateKPIs();
    setInterval(updateKPIs, 30000);
});

// Expose
window.renderAuditLog          = renderAuditLog;
window.renderSupervisionPage   = renderSupervisionPage;
window.renderPermissionsMatrix = renderPermissionsMatrix;
window.openSectorPermissions   = openSectorPermissions;
