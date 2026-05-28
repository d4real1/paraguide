document.addEventListener('DOMContentLoaded', () => {
    let currentParasites = [];
    let compareList = [];

    // Helper: normalise evidence level for sorting
    function getEvidenceRank(evidenceStr) {
        const str = evidenceStr.toLowerCase();
        if (str.includes('strong') || str.includes('clinical trial') || str.includes('human study')) return 1;
        if (str.includes('moderate') || str.includes('field trial')) return 2;
        if (str.includes('traditional') || str.includes('historical') || str.includes('vitro')) return 3;
        return 4;
    }

    // Helper: filter by body system
    function filterByBodySystem(system) {
        if (!system) return window.parasiteData;
        return window.parasiteData.filter(p => p.body_system && p.body_system.includes(system));
    }

    // Helper: filter by symptom (fix underscore bug)
    function filterBySymptom(symptom) {
        const searchTerm = symptom.replace(/_/g, ' ').toLowerCase();
        return window.parasiteData.filter(p => 
            p.key_symptoms && p.key_symptoms.toLowerCase().includes(searchTerm)
        );
    }

    // Render parasite grid
    function renderGrid(parasites) {
        const grid = document.getElementById('parasiteGrid');
        if (!parasites.length) {
            grid.innerHTML = '<div class="loading">No parasites found.</div>';
            return;
        }
        grid.innerHTML = parasites.map(p => `
            <div class="parasite-card" data-name="${escapeHtml(p.name)}">
                <div class="card-header">
                    <span class="parasite-name">${escapeHtml(p.name)}</span>
                    <span class="type-badge">${escapeHtml(p.body_system.split(',')[0])}</span>
                </div>
                <div class="card-location">📍 System: ${escapeHtml(p.body_system)}</div>
                <div class="card-symptoms">🤒 ${escapeHtml(p.key_symptoms.substring(0, 80))}${p.key_symptoms.length > 80 ? '…' : ''}</div>
                <div class="card-checkbox">
                    <input type="checkbox" class="compare-checkbox" data-name="${escapeHtml(p.name)}" aria-label="Add ${escapeHtml(p.name)} to compare" ${compareList.some(c => c.name === p.name) ? 'checked' : ''}>
                    <label>Compare</label>
                </div>
            </div>
        `).join('');
        attachCardEvents();
        attachCheckboxEvents();
    }

    // Simple escape to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function attachCardEvents() {
        document.querySelectorAll('.parasite-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('compare-checkbox')) return;
                const name = card.dataset.name;
                const parasite = window.parasiteData.find(p => p.name === name);
                if (parasite) showModal(parasite);
            });
        });
    }

    function attachCheckboxEvents() {
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            cb.removeEventListener('change', handleCompare);
            cb.addEventListener('change', handleCompare);
        });
    }

    function handleCompare(e) {
        const name = e.target.dataset.name;
        const parasite = window.parasiteData.find(p => p.name === name);
        if (e.target.checked) {
            if (!compareList.find(p => p.name === name) && compareList.length < 3) compareList.push(parasite);
            else if (compareList.length >= 3) { e.target.checked = false; alert('Max 3 parasites to compare.'); }
        } else compareList = compareList.filter(p => p.name !== name);
        updateCompareUI();
    }

    function updateCompareUI() {
        const container = document.getElementById('compareList');
        const compareBtn = document.getElementById('compareBtn');
        container.innerHTML = compareList.map(p => `<span class="compare-badge">${escapeHtml(p.name)} <button class="remove-compare" data-name="${escapeHtml(p.name)}" aria-label="Remove ${escapeHtml(p.name)} from compare">✖</button></span>`).join('');
        document.querySelectorAll('.remove-compare').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = btn.dataset.name;
                compareList = compareList.filter(p => p.name !== name);
                updateCompareUI();
                const cb = document.querySelector(`.compare-checkbox[data-name="${name.replace(/[\\"]/g, '\\$&')}"]`);
                if (cb) cb.checked = false;
            });
        });
        compareBtn.disabled = compareList.length < 2;
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            cb.checked = compareList.some(p => p.name === cb.dataset.name);
        });
    }

    // Modal with focus management and collapsible ARIA
    function showModal(parasite) {
        const modal = document.getElementById('parasiteModal');
        const modalBody = document.getElementById('modalBody');
        let html = `<h2 id="modalTitle">${escapeHtml(parasite.name)}</h2>`;
        html += `<p><strong>🔬 Body systems:</strong> ${escapeHtml(parasite.body_system)}</p>`;
        html += `<p><strong>⚠️ Pathology & damage:</strong> ${escapeHtml(parasite.pathology_damage)}</p>`;
        html += `<p><strong>🤒 Key symptoms:</strong> ${escapeHtml(parasite.key_symptoms)}</p>`;
        html += `<div class="treatment-section"><strong>💊 Standard medical cure:</strong> ${escapeHtml(parasite.treatments.standard)}</div>`;
        if (parasite.treatments.natural_remedies && parasite.treatments.natural_remedies.length) {
            html += `<div class="collapsible" role="button" tabindex="0" aria-expanded="false">🌿 Natural remedies (click to expand)</div><div class="collapsible-content" style="display:none;">`;
            parasite.treatments.natural_remedies.forEach(r => { html += `<p><strong>${escapeHtml(r.name)}</strong> (${escapeHtml(r.evidence)}): ${escapeHtml(r.detail)}</p>`; });
            html += `</div>`;
        }
        if (parasite.treatments.historical_remedies && parasite.treatments.historical_remedies.length) {
            html += `<div class="collapsible" role="button" tabindex="0" aria-expanded="false">📜 Historical remedies (click to expand)</div><div class="collapsible-content" style="display:none;">`;
            parasite.treatments.historical_remedies.forEach(r => { html += `<p><strong>${escapeHtml(r.name)}</strong> (${escapeHtml(r.region)}, ${escapeHtml(r.evidence)}): ${escapeHtml(r.detail)}</p>`; });
            html += `</div>`;
        }
        html += `<button id="printSingleBtn" class="tool-btn" style="margin-top:16px" aria-label="Print this parasite">🖨️ Print this parasite</button>`;
        modalBody.innerHTML = html;
        modal.style.display = 'block';
        
        // Collapsible logic with ARIA
        modalBody.querySelectorAll('.collapsible').forEach(coll => {
            const content = coll.nextElementSibling;
            coll.addEventListener('click', () => {
                const expanded = coll.getAttribute('aria-expanded') === 'true';
                coll.setAttribute('aria-expanded', !expanded);
                content.style.display = expanded ? 'none' : 'block';
            });
            coll.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); coll.click(); } });
        });
        
        document.getElementById('printSingleBtn')?.addEventListener('click', () => printSingle(parasite));
        
        // Focus management: move focus to close button
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) closeBtn.focus();
    }

    function printSingle(p) {
        const win = window.open();
        win.document.write(`<html><head><title>${p.name}</title></head><body><h1>${p.name}</h1><p>System: ${p.body_system}</p><p>Pathology: ${p.pathology_damage}</p><p>Symptoms: ${p.key_symptoms}</p><p>Treatment: ${p.treatments.standard}</p><p>⚠️ Not medical advice.</p></body></html>`);
        win.document.close(); win.print();
    }

    // Compare modal with horizontal scroll wrapper
    function showCompareModal() {
        if (compareList.length < 2) return;
        const modal = document.getElementById('compareModal');
        const tableDiv = document.getElementById('compareTable');
        let html = '<div class="compare-table-wrapper"><table class="compare-table"><thead><tr><th>Attribute</th>';
        compareList.forEach(p => html += `<th>${escapeHtml(p.name)}</th>`);
        html += '</tr></thead><tbody>';
        const attrs = ['body_system', 'pathology_damage', 'key_symptoms', 'treatments.standard'];
        attrs.forEach(attr => {
            html += `<tr><td><strong>${attr.replace('treatments.', '')}</strong></td>`;
            compareList.forEach(p => {
                let val = attr.includes('.') ? p.treatments[attr.split('.')[1]] : p[attr];
                html += `<td>${escapeHtml(val || 'None')}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        tableDiv.innerHTML = html;
        modal.style.display = 'block';
        const closeBtn = modal.querySelector('.close-compare-modal');
        if (closeBtn) closeBtn.focus();
    }

    // Remedies table with normalised evidence sorting
    function renderRemediesTable(filter = '', sort = 'evidence') {
        let remedies = [...window.naturalRemedies];
        if (filter.trim()) {
            const lowerFilter = filter.trim().toLowerCase();
            remedies = remedies.filter(r => r.name.toLowerCase().includes(lowerFilter) || r.target.toLowerCase().includes(lowerFilter));
        }
        if (sort === 'evidence') {
            remedies.sort((a,b) => getEvidenceRank(a.evidence_level) - getEvidenceRank(b.evidence_level));
        } else {
            remedies.sort((a,b) => a.name.localeCompare(b.name));
        }
        let html = '<table class="remedy-table"><thead><tr><th>Remedy</th><th>Target</th><th>Evidence</th><th>Region</th><th>Details</th></tr></thead><tbody>';
        remedies.forEach(r => {
            html += `<tr><td><strong>${escapeHtml(r.name)}</strong></td><td>${escapeHtml(r.target)}</td><td>${escapeHtml(r.evidence_level)}</td><td>${escapeHtml(r.region)}</td><td>${escapeHtml(r.detail)}</td></tr>`;
        });
        html += '</tbody></table>';
        document.getElementById('remedyTableContainer').innerHTML = html;
    }

    // Doctor locator with user-friendly errors
    function findDoctor() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    window.open(`https://www.google.com/maps/search/doctor+infectious+disease/@${position.coords.latitude},${position.coords.longitude},12z`);
                },
                (error) => {
                    let msg = "Could not get your location. ";
                    if (error.code === error.PERMISSION_DENIED) msg += "Permission denied. ";
                    else if (error.code === error.TIMEOUT) msg += "Location request timed out. ";
                    msg += "Opening general doctor search.";
                    alert(msg);
                    window.open('https://www.google.com/maps/search/infectious+disease+doctor');
                }
            );
        } else {
            alert("Geolocation not supported. Opening general search.");
            window.open('https://www.google.com/maps/search/infectious+disease+doctor');
        }
    }

    // Back to top button logic
    const backToTopBtn = document.getElementById('backToTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) backToTopBtn.classList.add('visible');
        else backToTopBtn.classList.remove('visible');
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Event listeners
    document.getElementById('bodySystemBtn').addEventListener('click', () => {
        const system = document.getElementById('bodySystemSelect').value;
        currentParasites = filterByBodySystem(system);
        renderGrid(currentParasites);
        switchTab('grid');
    });
    document.getElementById('showAllBtn').addEventListener('click', () => {
        currentParasites = [...window.parasiteData];
        renderGrid(currentParasites);
        switchTab('grid');
    });
    document.getElementById('symptomBtn').addEventListener('click', () => {
        const symptom = document.getElementById('symptomSelect').value;
        if (!symptom) return alert('Select a symptom');
        currentParasites = filterBySymptom(symptom);
        renderGrid(currentParasites);
        switchTab('grid');
    });
    document.getElementById('compareBtn').addEventListener('click', showCompareModal);
    document.getElementById('clearCompareBtn').addEventListener('click', () => { compareList = []; updateCompareUI(); renderGrid(currentParasites); });
    document.getElementById('remedySearchBtn').addEventListener('click', () => {
        const filter = document.getElementById('remedySearchInput').value;
        const sort = document.getElementById('remedySortSelect').value;
        renderRemediesTable(filter, sort);
    });
    document.getElementById('globalPrintBtn').addEventListener('click', () => {
        let html = '<html><head><title>Parasite Summary</title></head><body><h1>ParaGuide+ Full List</h1>';
        window.parasiteData.forEach(p => { html += `<h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.pathology_damage)}</p><p>Treatment: ${escapeHtml(p.treatments.standard)}</p>`; });
        html += '<p>⚠️ Not medical advice.</p></body></html>';
        const w = window.open(); w.document.write(html); w.document.close(); w.print();
    });
    document.getElementById('doctorBtn').onclick = findDoctor;
    document.getElementById('feedbackBtn').onclick = () => alert('Please send feedback to: feedback@paraguide.example.com (replace with your actual link)');

    // Dark mode / large text
    const body = document.body;
    document.getElementById('darkModeToggle').onclick = () => { body.classList.toggle('dark'); document.getElementById('darkModeToggle').textContent = body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark'; };
    document.getElementById('largeTextToggle').onclick = () => { body.classList.toggle('large-text'); document.getElementById('largeTextToggle').textContent = body.classList.contains('large-text') ? '🔤 Normal' : '🔤 Large'; };

    // Modal close (both modals)
    document.querySelectorAll('.close-modal, .close-compare-modal').forEach(close => close.onclick = () => { document.getElementById('parasiteModal').style.display = 'none'; document.getElementById('compareModal').style.display = 'none'; });
    window.onclick = (e) => { if (e.target.classList.contains('modal')) { document.getElementById('parasiteModal').style.display = 'none'; document.getElementById('compareModal').style.display = 'none'; } };

    // Tab switching
    function switchTab(tabId) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
        document.querySelectorAll('.tab-btn, .bottom-nav-btn').forEach(btn => {
            if (btn.dataset.tab === tabId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        if (tabId === 'remedies') renderRemediesTable();
    }
    document.querySelectorAll('.tab-btn, .bottom-nav-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    // Initial load
    renderGrid([]);
    updateCompareUI();
    renderRemediesTable();
});
