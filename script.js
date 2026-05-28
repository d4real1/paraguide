// Wait for DOM and external data
document.addEventListener('DOMContentLoaded', () => {
    // Global state
    let currentParasites = [];
    let compareList = []; // stores parasite objects
    let currentTab = 'grid';
    let remedyData = window.naturalRemedies || [];

    // Helper: determine parasite type for color coding
    function getParasiteType(parasite) {
        const name = parasite.name.toLowerCase();
        if (name.includes('protozoa') || parasite.type === 'protozoa' || ['entamoeba', 'giardia', 'plasmodium', 'toxoplasma', 'trypanosoma', 'leishmania', 'cryptosporidium', 'babesia', 'balantidium', 'cyclospora', 'cystoisospora', 'sarcocystis'].some(k => name.includes(k)))
            return 'protozoa';
        if (name.includes('helminth') || parasite.type === 'helminth' || ['ascaris', 'enterobius', 'hookworm', 'strongyloides', 'trichuris', 'trichinella', 'anisakis', 'dracunculus', 'taenia', 'diphyllobothrium', 'hymenolepis', 'echinococcus', 'schistosoma', 'paragonimus', 'clonorchis', 'fasciola', 'fasciolopsis', 'heterophyes', 'metagonimus'].some(k => name.includes(k)))
            return 'helminth';
        return 'ectoparasite';
    }

    // Render parasite card for grid
    function renderParasiteCard(p) {
        const type = getParasiteType(p);
        const typeLabel = type === 'protozoa' ? '🦠 Protozoa' : (type === 'helminth' ? '🐛 Helminth' : '🪲 Ectoparasite');
        const isSelected = compareList.some(c => c.name === p.name);
        return `
            <div class="parasite-card" data-name="${p.name}">
                <div class="card-header">
                    <span class="parasite-name">${p.name}</span>
                    <span class="type-badge type-${type}">${typeLabel}</span>
                </div>
                <div class="card-location">📍 ${p.body_location}</div>
                <div class="card-symptoms">🤒 ${p.symptoms.substring(0, 80)}${p.symptoms.length > 80 ? '…' : ''}</div>
                <div class="card-checkbox">
                    <input type="checkbox" class="compare-checkbox" data-name="${p.name}" ${isSelected ? 'checked' : ''}>
                    <label>Compare</label>
                </div>
            </div>
        `;
    }

    // Full parasite display in modal (collapsible sections)
    function getParasiteModalHTML(p) {
        let html = `<h2>${p.name}</h2><p><strong>📍 Lives in:</strong> ${p.body_location} — ${p.why_there}</p>`;
        html += `<p><strong>Effects:</strong> ${p.effects_why}</p><p><strong>Symptoms:</strong> ${p.symptoms}</p>`;
        html += `<div class="treatment-section"><strong>💊 Doctor’s prescription:</strong> ${p.treatments.doctor}</div>`;
        // Collapsible natural remedies
        if (p.treatments.natural && p.treatments.natural !== 'None') {
            html += `<div class="collapsible">🌿 Natural remedies (click to expand)</div><div class="collapsible-content">${p.treatments.natural}</div>`;
        }
        if (p.treatments.historical && p.treatments.historical !== 'None') {
            html += `<div class="collapsible">📜 Historical / traditional (click to expand)</div><div class="collapsible-content">${p.treatments.historical}</div>`;
        }
        if (p.treatments.untested && p.treatments.untested !== 'None') {
            html += `<div class="untested-warning"><div class="collapsible">⚠️ Untested / experimental (click - not recommended)</div><div class="collapsible-content">${p.treatments.untested}</div></div>`;
        }
        html += `<button id="printSingleBtn" data-name="${p.name}" class="tool-btn" style="margin-top:16px">🖨️ Print this parasite</button>`;
        return html;
    }

    // Populate grid
    function populateGrid(parasites) {
        const grid = document.getElementById('parasiteGrid');
        if (!parasites.length) {
            grid.innerHTML = '<div class="loading">No parasites match. Try another symptom.</div>';
            return;
        }
        grid.innerHTML = parasites.map(p => renderParasiteCard(p)).join('');
        // attach card click and checkbox events
        document.querySelectorAll('.parasite-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('compare-checkbox')) return;
                const name = card.dataset.name;
                const parasite = window.parasiteData.find(p => p.name === name);
                if (parasite) showModal(parasite);
            });
        });
        attachCheckboxEvents();
    }

    function attachCheckboxEvents() {
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            cb.removeEventListener('change', handleCompareChange);
            cb.addEventListener('change', handleCompareChange);
        });
    }

    function handleCompareChange(e) {
        e.stopPropagation();
        const name = e.target.dataset.name;
        const parasite = window.parasiteData.find(p => p.name === name);
        if (e.target.checked) {
            if (!compareList.find(p => p.name === name) && compareList.length < 3) {
                compareList.push(parasite);
            } else if (compareList.length >= 3) {
                e.target.checked = false;
                alert('You can compare up to 3 parasites.');
            }
        } else {
            compareList = compareList.filter(p => p.name !== name);
        }
        updateCompareUI();
    }

    function updateCompareUI() {
        const container = document.getElementById('compareList');
        const compareBtn = document.getElementById('compareBtn');
        container.innerHTML = compareList.map(p => `<span class="compare-badge">${p.name} <button class="remove-compare" data-name="${p.name}">✖</button></span>`).join('');
        document.querySelectorAll('.remove-compare').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = btn.dataset.name;
                compareList = compareList.filter(p => p.name !== name);
                updateCompareUI();
                // uncheck corresponding checkbox
                const cb = document.querySelector(`.compare-checkbox[data-name="${name}"]`);
                if (cb) cb.checked = false;
            });
        });
        compareBtn.disabled = compareList.length < 2;
        // update checkbox states in grid
        document.querySelectorAll('.compare-checkbox').forEach(cb => {
            cb.checked = compareList.some(p => p.name === cb.dataset.name);
        });
    }

    function showModal(parasite) {
        const modal = document.getElementById('parasiteModal');
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = getParasiteModalHTML(parasite);
        modal.style.display = 'block';
        // collapsible handlers
        modalBody.querySelectorAll('.collapsible').forEach(coll => {
            coll.addEventListener('click', () => {
                const content = coll.nextElementSibling;
                if (content.style.display === 'block') content.style.display = 'none';
                else content.style.display = 'block';
            });
        });
        const printBtn = modalBody.querySelector('#printSingleBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => printSingleParasite(parasite));
        }
    }

    function printSingleParasite(p) {
        const win = window.open();
        win.document.write(`<html><head><title>${p.name} - ParaGuide+</title></head><body><h1>${p.name}</h1><p>Location: ${p.body_location}</p><p>Effects: ${p.effects_why}</p><p>Symptoms: ${p.symptoms}</p><p>Doctor Rx: ${p.treatments.doctor}</p><p>Natural: ${p.treatments.natural || 'None'}</p><p>Historical: ${p.treatments.historical || 'None'}</p><p>⚠️ Not medical advice.</p></body></html>`);
        win.document.close();
        win.print();
    }

    // Compare modal
    function showCompareModal() {
        if (compareList.length < 2) return;
        const modal = document.getElementById('compareModal');
        const tableDiv = document.getElementById('compareTable');
        let html = '<table class="compare-table"><thead><tr><th>Attribute</th>';
        compareList.forEach(p => { html += `<th>${p.name}</th>`; });
        html += '</tr></thead><tbody>';
        const attributes = ['body_location', 'effects_why', 'symptoms', 'treatments.doctor', 'treatments.natural'];
        attributes.forEach(attr => {
            html += '<tr><td><strong>' + attr.replace('treatments.', '') + '</strong></td>';
            compareList.forEach(p => {
                let val = attr.includes('.') ? p.treatments[attr.split('.')[1]] : p[attr];
                if (!val) val = 'None';
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        tableDiv.innerHTML = html;
        modal.style.display = 'block';
    }

    // Symptom search
    function searchBySymptom(symptom) {
        const matches = window.parasiteData.filter(p => p.symptom_keywords && p.symptom_keywords.includes(symptom));
        currentParasites = matches;
        populateGrid(matches);
        document.getElementById('parasiteGrid').scrollIntoView({ behavior: 'smooth' });
    }

    // Search by name
    function searchByName(query) {
        const matches = window.parasiteData.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        const container = document.getElementById('searchResults');
        if (!matches.length) container.innerHTML = '<div class="loading">No parasites found.</div>';
        else container.innerHTML = matches.map(p => renderParasiteCard(p)).join('');
        attachCheckboxEvents();
        // attach card clicks
        document.querySelectorAll('#searchResults .parasite-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('compare-checkbox')) return;
                const name = card.dataset.name;
                const parasite = window.parasiteData.find(p => p.name === name);
                if (parasite) showModal(parasite);
            });
        });
    }

    // All parasites
    function showAllParasites() {
        const container = document.getElementById('allParasitesGrid');
        container.innerHTML = window.parasiteData.map(p => renderParasiteCard(p)).join('');
        attachCheckboxEvents();
        document.querySelectorAll('#allParasitesGrid .parasite-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('compare-checkbox')) return;
                const name = card.dataset.name;
                const parasite = window.parasiteData.find(p => p.name === name);
                if (parasite) showModal(parasite);
            });
        });
    }

    // Remedies table
    function renderRemediesTable(filter = '', sort = 'evidence') {
        let remedies = [...remedyData];
        if (filter) {
            remedies = remedies.filter(r => r.name.toLowerCase().includes(filter) || r.target.toLowerCase().includes(filter));
        }
        const evidenceOrder = { 'Human clinical study': 1, 'Randomized controlled trial': 1, 'Field trial': 2, 'Small human study': 3, 'In vitro': 4, 'Traditional': 5 };
        if (sort === 'evidence') {
            remedies.sort((a,b) => (evidenceOrder[a.evidence.split(' ')[0]] || 99) - (evidenceOrder[b.evidence.split(' ')[0]] || 99));
        } else {
            remedies.sort((a,b) => a.name.localeCompare(b.name));
        }
        let html = '<table class="remedy-table"><thead><tr><th>Remedy</th><th>Targets</th><th>Evidence</th><th>Safety</th></tr></thead><tbody>';
        remedies.forEach(r => {
            html += `<tr><td><strong>${r.name}</strong></td><td>${r.target}</td><td>${r.evidence}</td><td>${r.safety}</td></tr>`;
        });
        html += '</tbody></table>';
        document.getElementById('remedyTableContainer').innerHTML = html;
    }

    // Tab switching
    function switchTab(tabId) {
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
        document.querySelectorAll('.tab-btn, .bottom-nav-btn').forEach(btn => {
            if (btn.dataset.tab === tabId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        currentTab = tabId;
        if (tabId === 'all') showAllParasites();
        if (tabId === 'remedies') renderRemediesTable();
        if (tabId === 'grid' && currentParasites.length) populateGrid(currentParasites);
    }

    // Event listeners
    document.getElementById('symptomBtn').addEventListener('click', () => {
        const symptom = document.getElementById('symptomSelect').value;
        if (!symptom) return alert('Select a symptom');
        searchBySymptom(symptom);
        switchTab('grid');
    });
    document.getElementById('searchBtn').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return alert('Enter a parasite name');
        searchByName(query);
        switchTab('search');
    });
    document.getElementById('compareBtn').addEventListener('click', showCompareModal);
    document.getElementById('clearCompareBtn').addEventListener('click', () => {
        compareList = [];
        updateCompareUI();
    });
    document.getElementById('remedySearchBtn').addEventListener('click', () => {
        const filter = document.getElementById('remedySearchInput').value.toLowerCase();
        const sort = document.getElementById('remedySortSelect').value;
        renderRemediesTable(filter, sort);
    });
    document.getElementById('globalPrintBtn').addEventListener('click', () => {
        let html = '<html><head><title>Parasite Summary</title></head><body><h1>Parasite Reference</h1>';
        window.parasiteData.forEach(p => {
            html += `<h2>${p.name}</h2><p>${p.body_location} - ${p.effects_why}</p><p>Doctor: ${p.treatments.doctor}</p>`;
        });
        html += '<p>Not medical advice.</p></body></html>';
        const w = window.open(); w.document.write(html); w.document.close(); w.print();
    });
    document.getElementById('doctorBtn').addEventListener('click', () => {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => window.open(`https://www.google.com/maps/search/doctor+infectious+disease/@${p.coords.latitude},${p.coords.longitude},12z`), () => window.open('https://www.google.com/maps/search/infectious+disease+doctor'));
        else window.open('https://www.google.com/maps/search/infectious+disease+doctor');
    });
    document.getElementById('feedbackBtn').addEventListener('click', () => alert('Replace with Google Form link'));

    // Dark mode / large text
    const body = document.body;
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        body.classList.toggle('dark');
        document.getElementById('darkModeToggle').textContent = body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
    });
    document.getElementById('largeTextToggle').addEventListener('click', () => {
        body.classList.toggle('large-text');
        document.getElementById('largeTextToggle').textContent = body.classList.contains('large-text') ? '🔤 Normal' : '🔤 Large';
    });

    // Dismissible warning
    const banner = document.getElementById('warningBanner');
    const dismissBtn = document.getElementById('dismissWarningBtn');
    if (localStorage.getItem('warningDismissed')) banner.classList.add('hidden');
    dismissBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
        localStorage.setItem('warningDismissed', 'true');
    });

    // Modal close
    document.querySelectorAll('.close-modal, .close-compare-modal').forEach(close => {
        close.addEventListener('click', () => {
            document.getElementById('parasiteModal').style.display = 'none';
            document.getElementById('compareModal').style.display = 'none';
        });
    });
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            document.getElementById('parasiteModal').style.display = 'none';
            document.getElementById('compareModal').style.display = 'none';
        }
    };

    // Tab buttons (desktop and bottom)
    document.querySelectorAll('.tab-btn, .bottom-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Initial load: show all parasites in grid (optional) or empty
    currentParasites = window.parasiteData;
    populateGrid(currentParasites);
    updateCompareUI();
    renderRemediesTable();
});
