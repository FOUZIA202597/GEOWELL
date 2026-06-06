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
    const count = document.querySelectorAll('.sh-well-checkbox:checked').length;
    const element = document.getElementById('sh-element').value;
    
    if (count === 0) return;
    
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> GENERATING SHAPEFILE...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.disabled = false;
        closeShapefileExportModal();
        
        // Simulate download
        const dummyContent = "Simulated Shapefile Binary Content";
        const blob = new Blob([dummyContent], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `GeoWell_${element}_Shapefile.zip`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        
        showToast(`✅ Successfully generated Shapefile for ${count} wells.`, 'success');
    }, 2000);
};
