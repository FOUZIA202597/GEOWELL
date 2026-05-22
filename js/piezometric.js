
// ============================================================
// GEO WELL — PIEZOMETRIC MAP ENGINE
// Modules: IDW Interpolation | Contour Lines | Hydraulic Gradient | Water Stress
// ============================================================

window.PiezometricEngine = (function () {

    // ── 1. CONFIGURATION ────────────────────────────────────────
    const CONFIG = {
        gridResolution: 60,        // Grid cells per axis
        idwPower: 2,               // IDW power parameter (p)
        contourInterval: 5,        // Contour interval in meters
        historicalBaseline: {      // Baseline piezometric levels (year 2019)
            "AD": 360, "M": 900, "F": 40, "P": 100, "L": 180
        },
        stressThreshold: 10,       // Drawdown > 10m = water stress
        arrowGrid: 10,             // Arrow grid density for flow vectors
        colors: {
            contourNormal: '#00d4ff',
            contourMajor:  '#ffffff',
            stressLow:     '#00ff9d',
            stressMed:     '#ffbf00',
            stressHigh:    '#ff4757',
            arrow:         '#00f5d4'
        }
    };

    // ── 1. DATA EXTRACTION ───────────────────────────────────────
    function extractWellData() {
        if (!window.mockData || !window.mockData.rigs) return [];
        let rigs = window.mockData.rigs;

        const gisWilaya = document.getElementById('gisWilaya');
        const gisDaira = document.getElementById('gisDaira');
        
        if (gisWilaya && gisWilaya.value !== 'all' && gisWilaya.value !== '') {
            rigs = rigs.filter(r => r.state === gisWilaya.value);
        }
        if (gisDaira && gisDaira.value !== 'all' && gisDaira.value !== '') {
            rigs = rigs.filter(r => r.district === gisDaira.value);
        }

        return rigs
            .filter(r => r.hydraulics && r.hydraulics.piezometricLevel != null && r.lat && r.lng)
            .map(r => ({
                id:    r.id,
                name:  r.name,
                lat:   parseFloat(r.lat),
                lng:   parseFloat(r.lng),
                h:     parseFloat(r.hydraulics.piezometricLevel),
                series: r.id.split('-')[0]
            }));
    }

    // ── 3. IDW INTERPOLATION ────────────────────────────────────
    function idwInterpolate(points, queryLat, queryLng) {
        let numerator = 0, denominator = 0;
        for (const p of points) {
            const dist = Math.sqrt(
                Math.pow(queryLat - p.lat, 2) +
                Math.pow(queryLng - p.lng, 2)
            );
            if (dist < 1e-10) return p.h;
            const w = 1 / Math.pow(dist, CONFIG.idwPower);
            numerator   += w * p.h;
            denominator += w;
        }
        return denominator === 0 ? 0 : numerator / denominator;
    }

    function buildGrid(points) {
        if (points.length < 3) return null;
        const lats = points.map(p => p.lat);
        const lngs = points.map(p => p.lng);
        const minLat = Math.min(...lats) - 0.02;
        const maxLat = Math.max(...lats) + 0.02;
        const minLng = Math.min(...lngs) - 0.02;
        const maxLng = Math.max(...lngs) + 0.02;

        const n   = CONFIG.gridResolution;
        const dLat = (maxLat - minLat) / n;
        const dLng = (maxLng - minLng) / n;
        const grid = [];

        for (let i = 0; i <= n; i++) {
            grid[i] = [];
            for (let j = 0; j <= n; j++) {
                grid[i][j] = idwInterpolate(
                    points,
                    minLat + i * dLat,
                    minLng + j * dLng
                );
            }
        }

        return { grid, minLat, maxLat, minLng, maxLng, n, dLat, dLng };
    }

    // ── 4. MARCHING SQUARES — CONTOUR EXTRACTION ────────────────
    function marchingSquares(gridData, level) {
        const { grid, minLat, maxLat, minLng, maxLng, n, dLat, dLng } = gridData;
        const segments = [];

        function interp(a, b, v) {
            if (Math.abs(b - a) < 1e-10) return 0.5;
            return (v - a) / (b - a);
        }

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const v00 = grid[i][j];
                const v10 = grid[i+1][j];
                const v01 = grid[i][j+1];
                const v11 = grid[i+1][j+1];

                const b00 = v00 >= level ? 1 : 0;
                const b10 = v10 >= level ? 1 : 0;
                const b01 = v01 >= level ? 1 : 0;
                const b11 = v11 >= level ? 1 : 0;
                const idx = b00 | (b10 << 1) | (b01 << 2) | (b11 << 3);

                if (idx === 0 || idx === 15) continue;

                const lat0 = minLat + i * dLat;
                const lat1 = minLat + (i+1) * dLat;
                const lng0 = minLng + j * dLng;
                const lng1 = minLng + (j+1) * dLng;

                const points = {
                    bottom: [lat0 + interp(v00, v10, level) * dLat, lng0],
                    top:    [lat0 + interp(v01, v11, level) * dLat, lng1],
                    left:   [lat0, lng0 + interp(v00, v01, level) * dLng],
                    right:  [lat1, lng0 + interp(v10, v11, level) * dLng]
                };

                const edges = {
                    1:  [points.bottom, points.left],
                    2:  [points.bottom, points.right],
                    3:  [points.left,   points.right],
                    4:  [points.left,   points.top],
                    5:  [points.bottom, points.top],
                    6:  [points.bottom, points.left],
                    7:  [points.right,  points.top],
                    8:  [points.right,  points.top],
                    9:  [points.bottom, points.top],
                    10: [points.left,   points.right],
                    11: [points.left,   points.top],
                    12: [points.bottom, points.right],
                    13: [points.bottom, points.right],
                    14: [points.bottom, points.left]
                };

                if (edges[idx]) {
                    segments.push(edges[idx]);
                }
            }
        }
        return segments;
    }

    // ── 5. HYDRAULIC GRADIENT — FLOW DIRECTION ARROWS ───────────
    function computeGradient(gridData) {
        const { grid, minLat, minLng, n, dLat, dLng } = gridData;
        const arrows = [];
        const step   = Math.max(1, Math.floor(n / CONFIG.arrowGrid));

        for (let i = step; i < n - step; i += step) {
            for (let j = step; j < n - step; j += step) {
                const dh_dlat = (grid[i+1][j] - grid[i-1][j]) / (2 * dLat);
                const dh_dlng = (grid[i][j+1] - grid[i][j-1]) / (2 * dLng);
                const mag = Math.sqrt(dh_dlat * dh_dlat + dh_dlng * dh_dlng);
                if (mag < 0.5) continue;

                const lat = minLat + i * dLat;
                const lng = minLng + j * dLng;
                // Flow goes DOWN the gradient (negative direction)
                const scale = 0.008 / mag;
                const endLat = lat - dh_dlat * scale;
                const endLng = lng - dh_dlng * scale;

                arrows.push({ from: [lat, lng], to: [endLat, endLng], mag });
            }
        }
        return arrows;
    }

    // ── 6. WATER STRESS ANALYSIS ─────────────────────────────────
    function computeWaterStress(points) {
        return points.map(p => {
            const baseline = CONFIG.historicalBaseline[p.series] || 100;
            const drawdown = baseline - p.h;
            let level = 'normal';
            if (drawdown > CONFIG.stressThreshold * 2) level = 'critical';
            else if (drawdown > CONFIG.stressThreshold) level = 'stressed';
            return { ...p, baseline, drawdown, stressLevel: level };
        });
    }

    // ── 7. LEAFLET RENDERING ─────────────────────────────────────
    let _layerGroup = null;

    function clearLayers(map) {
        if (_layerGroup) {
            map.removeLayer(_layerGroup);
            _layerGroup = null;
        }
    }

    function renderOnMap(map) {
        clearLayers(map);
        _layerGroup = L.layerGroup().addTo(map);

        const points = extractWellData();
        if (points.length < 4) {
            showToast('⚠️ Need at least 4 wells with piezometric data.', 'warning');
            return;
        }

        const gridData = buildGrid(points);
        if (!gridData) return;

        // ── A. Contour Lines ──────────────────────────────────────
        const hValues = points.map(p => p.h);
        const minH = Math.floor(Math.min(...hValues) / CONFIG.contourInterval) * CONFIG.contourInterval;
        const maxH = Math.ceil(Math.max(...hValues)  / CONFIG.contourInterval) * CONFIG.contourInterval;

        for (let level = minH; level <= maxH; level += CONFIG.contourInterval) {
            const segments = marchingSquares(gridData, level);
            const isMajor  = level % (CONFIG.contourInterval * 5) === 0;

            segments.forEach(([p1, p2]) => {
                const line = L.polyline([p1, p2], {
                    color:   isMajor ? CONFIG.colors.contourMajor : CONFIG.colors.contourNormal,
                    weight:  isMajor ? 2 : 1,
                    opacity: isMajor ? 0.9 : 0.55,
                    dashArray: isMajor ? null : '4,4'
                });
                line.bindTooltip(`h = ${level} m`, { sticky: true, className: 'piezo-tooltip' });
                _layerGroup.addLayer(line);
            });

            // Label major contours
            if (isMajor && segments.length > 0) {
                const [p1] = segments[0];
                const label = L.marker(p1, {
                    icon: L.divIcon({
                        html: `<span style="color:#fff;font-size:10px;font-weight:700;background:rgba(0,80,120,0.7);padding:1px 4px;border-radius:3px;">${level}m</span>`,
                        className: '',
                        iconAnchor: [15, 8]
                    }),
                    interactive: false
                });
                _layerGroup.addLayer(label);
            }
        }

        // ── B. Hydraulic Gradient Arrows ──────────────────────────
        const arrows = computeGradient(gridData);
        arrows.forEach(({ from, to, mag }) => {
            const line = L.polyline([from, to], {
                color:  CONFIG.colors.arrow,
                weight: 2,
                opacity: 0.8
            });
            _layerGroup.addLayer(line);

            // Arrowhead
            const angle = Math.atan2(to[0] - from[0], to[1] - from[1]);
            const head  = L.circleMarker(to, {
                radius:      3,
                color:       CONFIG.colors.arrow,
                fillColor:   CONFIG.colors.arrow,
                fillOpacity: 1,
                weight:      1
            });
            head.bindTooltip(`∇h = ${mag.toFixed(1)} m/°`, { sticky: true });
            _layerGroup.addLayer(head);
        });

        // ── C. Water Stress Markers ───────────────────────────────
        const stressPoints = computeWaterStress(points);
        stressPoints.forEach(p => {
            const colorMap = {
                normal:   CONFIG.colors.stressLow,
                stressed: CONFIG.colors.stressMed,
                critical: CONFIG.colors.stressHigh
            };
            const color  = colorMap[p.stressLevel];
            const radius = p.stressLevel === 'critical' ? 10 : p.stressLevel === 'stressed' ? 7 : 5;

            const marker = L.circleMarker([p.lat, p.lng], {
                radius,
                color:       '#fff',
                weight:      2,
                fillColor:   color,
                fillOpacity: 0.9
            });

            const drawdownSign = p.drawdown > 0 ? '▼' : '▲';
            marker.bindPopup(`
                <div style="font-family:'Outfit',sans-serif;min-width:200px;">
                    <h4 style="margin:0 0 8px;color:#0081a7;border-bottom:2px solid #00d4ff;padding-bottom:4px;">
                        ${p.name}
                    </h4>
                    <table style="font-size:12px;width:100%;border-collapse:collapse;">
                        <tr><td><b>Current h:</b></td><td>${p.h.toFixed(1)} m</td></tr>
                        <tr><td><b>Baseline (2019):</b></td><td>${p.baseline.toFixed(1)} m</td></tr>
                        <tr><td><b>Drawdown:</b></td><td style="color:${color};font-weight:bold;">${drawdownSign} ${Math.abs(p.drawdown).toFixed(1)} m</td></tr>
                        <tr><td><b>Stress Level:</b></td><td style="color:${color};font-weight:bold;">${p.stressLevel.toUpperCase()}</td></tr>
                    </table>
                </div>
            `);
            _layerGroup.addLayer(marker);
        });

        renderLegend(map, minH, maxH);
        console.log(`[PiezometricEngine] ✅ Rendered: ${points.length} wells | ${arrows.length} flow arrows`);
    }

    // ── 8. LEGEND ─────────────────────────────────────────────────
    function renderLegend(map, minH, maxH) {
        if (window._piezoLegend) {
            map.removeControl(window._piezoLegend);
        }

        window._piezoLegend = L.control({ position: 'bottomright' });
        window._piezoLegend.onAdd = function () {
            const div = L.DomUtil.create('div', 'piezo-legend');
            div.style.cssText = `
                background: rgba(10,20,40,0.92);
                border: 1px solid #00d4ff55;
                border-radius: 10px;
                padding: 12px 16px;
                font-family: 'Outfit', sans-serif;
                font-size: 12px;
                color: #cce8f4;
                min-width: 180px;
                backdrop-filter: blur(8px);
            `;
            div.innerHTML = `
                <div style="font-weight:700;color:#00d4ff;margin-bottom:8px;font-size:13px;">
                    📊 Piezometric Map
                </div>
                <div style="margin-bottom:6px;font-weight:600;color:#aaa;font-size:11px;">ISOPIESTIC LINES</div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <div style="width:30px;height:2px;background:#fff;"></div>
                    <span>Major (×5 interval)</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <div style="width:30px;height:1px;background:#00d4ff;border-top:1px dashed #00d4ff;"></div>
                    <span>Minor (${CONFIG.contourInterval}m)</span>
                </div>
                <div style="margin-bottom:6px;font-weight:600;color:#aaa;font-size:11px;">FLOW DIRECTION</div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <div style="width:24px;height:2px;background:#00f5d4;"></div>
                    <span>Hydraulic gradient →</span>
                </div>
                <div style="margin-bottom:6px;font-weight:600;color:#aaa;font-size:11px;">WATER STRESS</div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                    <div style="width:12px;height:12px;border-radius:50%;background:#00ff9d;"></div><span>Normal</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                    <div style="width:12px;height:12px;border-radius:50%;background:#ffbf00;"></div><span>Stressed (>${CONFIG.stressThreshold}m drop)</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <div style="width:12px;height:12px;border-radius:50%;background:#ff4757;"></div><span>Critical (>${CONFIG.stressThreshold*2}m drop)</span>
                </div>
                <div style="border-top:1px solid #00d4ff33;padding-top:6px;color:#7fb3c8;font-size:10px;">
                    h range: ${minH.toFixed(0)}m – ${maxH.toFixed(0)}m<br>
                    IDW (p=${CONFIG.idwPower}) · Grid ${CONFIG.gridResolution}×${CONFIG.gridResolution}
                </div>
            `;
            return div;
        };
        window._piezoLegend.addTo(map);
    }

    // ── 9. PUBLIC EXPORT FUNCTION ─────────────────────────────────
    function exportToShapefile() {
        const points = extractWellData();
        if (points.length === 0) {
            showToast('No data to export.', 'warning');
            return;
        }

        const geojson = {
            type: "FeatureCollection",
            name: "GeoWell_Piezometric_Export",
            crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
            features: points.map(p => ({
                type: "Feature",
                properties: {
                    id:              p.id,
                    name:            p.name,
                    piezo_h:         p.h,
                    series:          p.series
                },
                geometry: { type: "Point", coordinates: [p.lng, p.lat] }
            }))
        };

        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'GeoWell_Piezometric.geojson';
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ GeoJSON exported (import into QGIS as Shapefile).', 'success');
    }

    function exportTrueContours() {
        if (typeof turf === 'undefined') {
            showToast('⚠️ Turf.js is not loaded. Please reload page.', 'error');
            return;
        }
        const points = extractWellData();
        if (points.length < 4) {
            showToast('⚠️ Need at least 4 wells in the selected region.', 'warning');
            return;
        }

        const features = points.map(p => turf.point([p.lng, p.lat], { h: p.h }));
        const pointCollection = turf.featureCollection(features);

        const hValues = points.map(p => p.h);
        const minVal = Math.min(...hValues);
        const maxVal = Math.max(...hValues);

        let dynamicInterval = Math.ceil((maxVal - minVal) / 15);
        if (dynamicInterval < 1) dynamicInterval = 1;
        else if (dynamicInterval <= 5) dynamicInterval = 5;
        else if (dynamicInterval <= 10) dynamicInterval = 10;
        else dynamicInterval = Math.ceil(dynamicInterval / 10) * 10;

        const minH = Math.floor(minVal / dynamicInterval) * dynamicInterval;
        const maxH = Math.ceil(maxVal / dynamicInterval) * dynamicInterval;
        
        const breaks = [];
        for (let level = minH; level <= maxH + dynamicInterval; level += dynamicInterval) {
            breaks.push(level);
        }

        try {
            const options = { gridType: 'point', property: 'h', units: 'kilometers', weight: 1.5 };
            const grid = turf.interpolate(pointCollection, 0.2, options);
            // Changed to isolines to get lines instead of polygons
            const isolines = turf.isolines(grid, breaks, { zProperty: 'h' });
            
            isolines.name = "Piezometric_Isolines";
            
            const blob = new Blob([JSON.stringify(isolines, null, 2)], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = 'Piezometric_Lines.geojson';
            a.click();
            URL.revokeObjectURL(url);
            showToast('✅ Piezometric Lines exported successfully!', 'success');
        } catch (e) {
            console.error(e);
            showToast('❌ Error generating Polygons.', 'error');
        }
    }

    // ── 10. TOAST HELPER ─────────────────────────────────────────
    function showToast(msg, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(msg, type);
            return;
        }
        const t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = `
            position:fixed;bottom:20px;right:20px;z-index:99999;
            background:rgba(0,20,40,0.95);color:#00d4ff;
            padding:10px 18px;border-radius:8px;font-size:13px;
            border-left:3px solid #00d4ff;font-family:'Outfit',sans-serif;
        `;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    }

    // ── PUBLIC API ────────────────────────────────────────────────
    return {
        render:         renderOnMap,
        clear:          clearLayers,
        exportGeoJSON:  exportToShapefile,
        exportTrueContours: exportTrueContours,
        getWellData:    extractWellData,
        buildGrid,
        config:         CONFIG
    };

})();

// ── AUTO-INIT: hook into existing map ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Expose global helpers for HTML buttons
    window.renderPiezometricMap = function () {
        const map = window.mainMap || window.fullMap;
        if (!map) { console.warn('[PiezometricEngine] No map instance found.'); return; }
        window.PiezometricEngine.render(map.map);
    };

    window.clearPiezometricMap = function () {
        const map = window.mainMap || window.fullMap;
        if (!map) return;
        window.PiezometricEngine.clear(map.map);
    };

    window.exportPiezometricShapefile = function () {
        window.PiezometricEngine.exportGeoJSON();
    };

    window.exportTruePiezometricShapefile = function () {
        window.PiezometricEngine.exportTrueContours();
    };
});
