// Shapefile Export Workflow Simulation
window.openShapefileExportModal = function() {
    const modal = document.getElementById('modal-shapefile-filter');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.animation = 'fadeSlideIn 0.3s ease';
        populateShapefileWilayas();
    }
};

window.closeShapefileExportModal = function() {
    const modal = document.getElementById('modal-shapefile-filter');
    if (modal) modal.style.display = 'none';
};

function populateShapefileWilayas() {
    const wSelect = document.getElementById('sh-wilaya');
    wSelect.innerHTML = '<option value="">-- Choose Wilaya --</option>';
    if (window.geographicData && window.geographicData.states && window.geographicData.states.Algeria) {
        window.geographicData.states.Algeria.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            wSelect.appendChild(opt);
        });
    }
}

window.handleShapefileWilayaChange = function() {
    const wSelect = document.getElementById('sh-wilaya').value;
    const zSelect = document.getElementById('sh-zone');
    const tableBody = document.getElementById('sh-wells-body');
    const tableContainer = document.getElementById('sh-wells-container');
    
    tableContainer.style.display = 'none';
    
    zSelect.innerHTML = '<option value="">-- Choose Zone --</option>';
    if (!wSelect) {
        zSelect.disabled = true;
        return;
    }
    
    zSelect.disabled = false;
    if (window.geographicData && window.geographicData.districts && window.geographicData.districts[wSelect]) {
        window.geographicData.districts[wSelect].forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            zSelect.appendChild(opt);
        });
    }
};

window.handleShapefileZoneChange = function() {
    const zSelect = document.getElementById('sh-zone').value;
    const tableContainer = document.getElementById('sh-wells-container');
    const tableBody = document.getElementById('sh-wells-body');
    
    if (!zSelect) {
        tableContainer.style.display = 'none';
        return;
    }
    
    const wells = window.mockData.rigs.filter(w => w.district === zSelect);
    
    tableBody.innerHTML = '';
    
    if (wells.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:15px;color:#ff4757;">No wells found in this zone.</td></tr>';
    } else {
        wells.forEach(w => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:10px;text-align:center;">
                    <input type="checkbox" class="sh-well-checkbox" value="${w.id}" checked style="accent-color: #00d4ff; width:16px; height:16px;">
                </td>
                <td style="padding:10px;font-weight:bold;color:#fff;">${w.id || 'W-'+Math.floor(Math.random()*1000)}</td>
                <td style="padding:10px;color:#cbd5e1;">${w.hydraulics?.depth || Math.floor(Math.random()*200 + 50)} m</td>
                <td style="padding:10px;color:#cbd5e1;">${new Date().toLocaleDateString()}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
    
    tableContainer.style.display = 'block';
    updateShapefileSelectionCount();
    
    // Add event listeners to new checkboxes
    document.querySelectorAll('.sh-well-checkbox').forEach(cb => {
        cb.addEventListener('change', updateShapefileSelectionCount);
    });
};

window.toggleAllShapefileWells = function(e) {
    const checked = e.target.checked;
    document.querySelectorAll('.sh-well-checkbox').forEach(cb => {
        cb.checked = checked;
    });
    updateShapefileSelectionCount();
};

function updateShapefileSelectionCount() {
    const count = document.querySelectorAll('.sh-well-checkbox:checked').length;
    const counterEl = document.getElementById('sh-selected-count');
    const exportBtn = document.getElementById('btn-execute-shapefile');
    
    if (counterEl) counterEl.textContent = `${count} selected`;
    
    if (count > 0) {
        exportBtn.disabled = false;
        exportBtn.style.opacity = '1';
    } else {
        exportBtn.disabled = true;
        exportBtn.style.opacity = '0.5';
    }
}

window.executeShapefileExport = function(btn) {
    const checkedBoxes = document.querySelectorAll('.sh-well-checkbox:checked');
    if (checkedBoxes.length === 0) return;
    
    const element = document.getElementById('sh-element').value;
    
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> GENERATING GIS FILE...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.disabled = false;
        closeShapefileExportModal();
        
        const features = [];
        checkedBoxes.forEach(cb => {
            const wellId = cb.value;
            const well = window.mockData.rigs.find(w => String(w.id) === String(wellId));
            if (well) {
                // Generate realistic chemical value based on element
                let chemValue = 0;
                let quality = "Safe";
                
                if (element === 'nitrate') { chemValue = (Math.random() * 80); quality = chemValue > 50 ? "Critical" : chemValue > 25 ? "Warning" : "Safe"; }
                else if (element === 'calcium') { chemValue = (Math.random() * 200); quality = chemValue > 150 ? "Warning" : "Safe"; }
                else if (element === 'sulfate') { chemValue = (Math.random() * 400); quality = chemValue > 250 ? "Warning" : "Safe"; }
                else { chemValue = (Math.random() * 100); }
                
                features.push({
                    "type": "Feature",
                    "properties": {
                        "Station_ID": well.id || 'W-XX',
                        "Name": well.name || 'Unknown',
                        "State": well.state || 'Unknown',
                        "District": well.district || 'Unknown',
                        "Depth_m": well.hydraulics?.depth || 100,
                        "Element": element.toUpperCase(),
                        "Value_mgL": parseFloat(chemValue.toFixed(2)),
                        "Water_Qual": quality
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [well.lng, well.lat]
                    }
                });
            }
        });
        
        let geojson;
        if (typeof turf !== 'undefined' && features.length > 3) {
            try {
                // 1. Create Point Collection
                const pointCollection = turf.featureCollection(features);
                
                // 2. Determine BBox and expand for a wide, realistic regional map
                const bbox = turf.bbox(pointCollection);
                const expandedBbox = [bbox[0]-0.1, bbox[1]-0.1, bbox[2]+0.1, bbox[3]+0.1];
                
                // 3. Interpolate IDW Grid with high resolution (0.0015) for smooth curves
                const grid = turf.interpolate(pointCollection, 0.0015, {
                    gridType: 'point',
                    property: 'Value_mgL',
                    units: 'degrees',
                    weight: 3,
                    bbox: expandedBbox
                });
                
                // 4. Calculate dynamic breaks
                const values = features.map(f => f.properties.Value_mgL);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const step = (max - min) / 6 || 10;
                
                const breaks = [];
                for (let i = Math.floor(min); i <= Math.ceil(max) + step; i += step) {
                    breaks.push(parseFloat(i.toFixed(1)));
                }
                
                // 5. Generate Isobands (Polygons)
                const isobands = turf.isobands(grid, breaks, { zProperty: 'Value_mgL' });
                
                // 6. Clean up properties and Clip to Polygon/Hull
                let clipPolygon;
                if (window.exportPolygon) {
                    clipPolygon = window.exportPolygon.toGeoJSON();
                } else {
                    const hull = turf.convex(pointCollection);
                    clipPolygon = turf.buffer(hull, 0.05, {units: 'degrees'});
                }

                const clippedFeatures = [];
                isobands.features.forEach(f => {
                    f.properties.Element = element.toUpperCase();
                    f.properties.Concentration_Range = f.properties.Value_mgL; // Turf sets this to "min-max"
                    delete f.properties.Value_mgL; 
                    
                    try {
                        const intersection = turf.intersect(f, clipPolygon);
                        if (intersection) {
                            intersection.properties = f.properties;
                            clippedFeatures.push(intersection);
                        }
                    } catch(e) {
                        clippedFeatures.push(f); // Fallback on error
                    }
                });
                
                isobands.features = clippedFeatures;
                
                // 7. Merge original well points so QGIS shows BOTH the heatmap and the wells
                geojson = isobands;
                geojson.features = [...geojson.features, ...features];
                
                geojson.name = `GeoWell_${element}_Heatmap`;
                
            } catch(e) {
                console.error("Isobands generation failed:", e);
                // Fallback to points
                geojson = {
                    "type": "FeatureCollection",
                    "name": `GeoWell_${element}_Points`,
                    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                    "features": features
                };
            }
        } else {
            // Fallback to points if Turf is missing or not enough points
            geojson = {
                "type": "FeatureCollection",
                "name": `GeoWell_${element}_Points`,
                "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                "features": features
            };
        }
        
        const dataStr = JSON.stringify(geojson, null, 2);
        const blob = new Blob([dataStr], { type: 'application/geo+json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `GeoWell_${element}_Heatmap.geojson`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        
        if (typeof showToast === 'function') {
            showToast(`✅ Generated GIS data for ${features.length} wells. Drag it into QGIS!`, 'success');
        }
    }, 1500);
};
