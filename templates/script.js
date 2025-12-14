// ==========================================
// 1. UI UTILITIES & THEME
// ==========================================

// --- Theme Toggle Logic ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Simple reusable function to toggle floating panels
function togglePanel(buttonId, panelId) {
    const btn = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);

    if (btn && panel) {
        btn.addEventListener("click", () => {
            panel.style.display =
                panel.style.display === "flex" ? "none" : "flex";
        });
    }
}

// ==========================================
// 2. EDITOR SYNC LOGIC
// ==========================================

function updateLineNumbers(textareaId, linesId) {
    const textarea = document.getElementById(textareaId);
    const linesDiv = document.getElementById(linesId);
    if (!textarea || !linesDiv) return;
    
    const lines = textarea.value.split('\n').length;
    linesDiv.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
}

function syncScroll(textareaId, linesId) {
    const textarea = document.getElementById(textareaId);
    const linesDiv = document.getElementById(linesId);
    if (linesDiv && textarea) {
        linesDiv.scrollTop = textarea.scrollTop;
    }
}

// ==========================================
// 3. PROJECT MANAGEMENT & DATABASE (New)
// ==========================================

// SQLite saving (frontend calls API)
async function saveCodeToDB() {
    const codeInput = document.getElementById("codeInput"); // Assuming ID is codeInput based on snippet, or inputCode based on existing
    // Note: Existing code uses 'inputCode', new snippet uses 'codeInput'. 
    // Adapting to 'inputCode' if 'codeInput' is missing, or vice versa.
    const el = document.getElementById("codeInput") || document.getElementById("inputCode");
    const code = el.value.trim();
    const language = document.getElementById("languageSelect") ? document.getElementById("languageSelect").value : document.getElementById("targetLang").value;

    if (!code) return;

    try {
        await fetch("/save-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });
    } catch (err) {
        console.error("Auto-save failed", err);
    }
}

// Load last saved code
async function loadLastSavedCode() {
    try {
        const res = await fetch("/load-last-code");
        const data = await res.json();

        if (data.status === "success" && data.data) {
            // reconcile IDs
            const codeInput = document.getElementById("codeInput") || document.getElementById("inputCode");
            const langSelect = document.getElementById("languageSelect") || document.getElementById("targetLang");
            
            if(codeInput) {
                codeInput.value = data.data.code;
                // Trigger input event for line numbers
                codeInput.dispatchEvent(new Event('input'));
            }
            if(langSelect) {
                langSelect.value = data.data.language;
            }
        }
    } catch (err) {
        console.error("Error loading last code", err);
    }
}

// Prompt user to name a project and save it
async function saveProject() {
    const name = prompt("Enter project name:");
    if (!name) return;

    const el = document.getElementById("codeInput") || document.getElementById("inputCode");
    const code = el.value.trim();
    const language = document.getElementById("languageSelect") ? document.getElementById("languageSelect").value : document.getElementById("targetLang").value;

    const res = await fetch("/save-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name, code, language })
    });

    const data = await res.json();

    if (data.status === "success") {
        // alert("Project saved!"); // Replaced showCopyToast with alert or standard notification
        if(typeof showCopyToast === 'function') showCopyToast("Project saved!");
        else alert("Project saved!");
        loadProjects();
    }
}

// Load all saved projects
async function loadProjects() {
    const list = document.getElementById("projectList");
    if (!list) return;

    try {
        const res = await fetch("/projects");
        const data = await res.json();

        list.innerHTML = "";

        // Render each project in the sidebar
        data.projects.forEach(p => {
            list.innerHTML += `
                <div class="project-item">
                    <strong>${p.project_name}</strong>
                    <div style="margin-top:5px;">
                        <button onclick="loadProject(${p.id})">Load</button>
                        <button onclick="favoriteProject(${p.id}, ${p.is_favorite ? 0 : 1})">
                            ${p.is_favorite ? "★" : "☆"}
                        </button>
                        <button onclick="deleteProject(${p.id})" style="color:red;">Del</button>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error("Error loading projects", err);
    }
}

// Load a specific project into editor
async function loadProject(id) {
    const res = await fetch("/projects");
    const data = await res.json();

    const project = data.projects.find(p => p.id === id);
    if (!project) return;

    const codeInput = document.getElementById("codeInput") || document.getElementById("inputCode");
    const langSelect = document.getElementById("languageSelect") || document.getElementById("targetLang");

    if(codeInput) {
        codeInput.value = project.code;
        codeInput.dispatchEvent(new Event('input')); // Update line numbers
    }
    if(langSelect) langSelect.value = project.language;
}

// Mark/unmark project as favorite
async function favoriteProject(id, fav) {
    await fetch("/favorite-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fav })
    });

    loadProjects();
}

// Delete project
async function deleteProject(id) {
    if(!confirm("Are you sure you want to delete this project?")) return;
    
    await fetch("/delete-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    loadProjects();
}

// ==========================================
// 4. CHAT SYSTEM
// ==========================================

// Load past chat messages
async function loadSavedChat() {
    try {
        const res = await fetch("/load-chat");
        const data = await res.json();

        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;

        if (data.status === "success") {
            // Clear existing logic if needed, or just append
            // data.chat.forEach(msg => {
            //     appendMessage(msg.user_message, "user"); 
            //     appendMessage(msg.ai_response, "assistant");
            // });
            // Using existing UI structure:
            data.chat.forEach(msg => {
                if(msg.user_message) chatBody.innerHTML += `<div class="chat-msg user-msg">${msg.user_message}</div>`;
                if(msg.ai_response) chatBody.innerHTML += `<div class="chat-msg ai-msg">${msg.ai_response.replace(/\n/g, '<br>')}</div>`;
            });
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    } catch (err) {
        console.error("Chat load failed", err);
    }
}

function toggleChat() {
    const widget = document.getElementById('chatWidget');
    if (widget.style.display === 'flex') {
        widget.style.display = 'none';
    } else {
        widget.style.display = 'flex';
        document.getElementById('chatInput').focus();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    const chatBody = document.getElementById('chatBody');
    const currentCode = document.getElementById('inputCode') ? document.getElementById('inputCode').value : document.getElementById('codeInput').value;

    if (!msg) return;

    // Add User Message
    chatBody.innerHTML += `<div class="chat-msg user-msg">${msg}</div>`;
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Loading State
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-msg ai-msg';
    loadingDiv.innerText = 'Thinking...';
    chatBody.appendChild(loadingDiv);

    try {
        const response = await fetch('/ai_chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, code_context: currentCode })
        });
        const data = await response.json();
        
        // Remove loading
        chatBody.removeChild(loadingDiv);

        if(data.status === 'success') {
            const reply = data.reply.replace(/\n/g, '<br>');
            chatBody.innerHTML += `<div class="chat-msg ai-msg">${reply}</div>`;
        } else {
            chatBody.innerHTML += `<div class="chat-msg ai-msg" style="color:red">Error: ${data.message}</div>`;
        }
    } catch(err) {
        chatBody.removeChild(loadingDiv);
        chatBody.innerHTML += `<div class="chat-msg ai-msg" style="color:red">Network Error</div>`;
    }
    chatBody.scrollTop = chatBody.scrollHeight;
}

function handleChatEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        sendChatMessage();
    }
}

// ==========================================
// 5. LAYOUT RESIZER
// ==========================================

const gutter = document.getElementById('resizeHandle');
const colLeft = document.getElementById('colLeft');
const container = document.getElementById('mainContainer');
let isResizing = false;

if (gutter && colLeft && container) {
    gutter.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        // Calculate percentage
        const containerWidth = container.offsetWidth;
        const newLeftWidth = (e.clientX / containerWidth) * 100;
        
        // Limits (10% to 90%)
        if (newLeftWidth > 10 && newLeftWidth < 90) {
            colLeft.style.width = `${newLeftWidth}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if(isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
        }
    });
}

// ==========================================
// 6. CODE ASSESSMENT & ANALYSIS API
// ==========================================

let lastReportData = {};

async function handleAssessment() {
    const inputCode = document.getElementById('inputCode') ? document.getElementById('inputCode').value : document.getElementById('codeInput').value;
    const targetLang = document.getElementById('targetLang') ? document.getElementById('targetLang').value : document.getElementById('languageSelect').value;
    
    // Safety check for candidateId - if element doesn't exist, use 'N/A'
    const candidateIdEl = document.getElementById('candidateId');
    const candidateId = candidateIdEl ? candidateIdEl.value.trim() : 'N/A';

    const outputBox = document.getElementById('outputCode');
    const errorTableBody = document.querySelector('#errorTable tbody');
    const explanationTableBody = document.querySelector('#explanationTable tbody');
    
    // UI Elements
    const integrityBadge = document.getElementById('integrityCheck');
    const detectedBadge = document.getElementById('detectedLang');
    const plagiarismCheck = document.getElementById('plagiarismCheck');
    const complianceStatus = document.getElementById('complianceStatus');
    const qualityScoreDisplay = document.getElementById('qualityScoreDisplay'); 
    
    const timeBest = document.getElementById('timeBest');
    const timeAvg = document.getElementById('timeAvg');
    const timeWorst = document.getElementById('timeWorst');
    const timeDesc = document.getElementById('timeDesc');

    const spaceBest = document.getElementById('spaceBest');
    const spaceAvg = document.getElementById('spaceAvg');
    const spaceWorst = document.getElementById('spaceWorst');
    const spaceDesc = document.getElementById('spaceDesc');

    const overlay = document.getElementById('loadingOverlay');
    const navbar = document.getElementById('mainNav');
    const containerDiv = document.getElementById('mainContainer');

    if (!inputCode.trim()) return alert("Please input candidate code.");

    if (overlay) overlay.style.display = "flex";
    if (navbar) navbar.classList.add('blur-filter');
    if (containerDiv) containerDiv.classList.add('blur-filter');

    if (outputBox) outputBox.value = "";
    updateLineNumbers('outputCode', 'outputLines');
    if (explanationTableBody) explanationTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:20px;">Generating detailed explanation...</td></tr>`;
    
    // Reset status elements
    if(complianceStatus) {
        complianceStatus.innerHTML = `<i class="fas fa-clipboard-check"></i> Compliance Status: PENDING`;
        complianceStatus.classList.remove('compliance-pass', 'compliance-fail');
    }
    
    if (plagiarismCheck) {
        plagiarismCheck.innerHTML = `<i class="fas fa-shield-alt"></i> Plagiarism Check: Analyzing...`;
        plagiarismCheck.className = "plagiarism-bar";
    }
    
    // Reset Quality Score
    if(qualityScoreDisplay) qualityScoreDisplay.innerHTML = `<i class="fas fa-star-half-stroke"></i> Quality Score: --/100`;
    
    [timeBest, timeAvg, timeWorst, spaceBest, spaceAvg, spaceWorst].forEach(el => {
        if(el) el.innerText = "--";
    });
    if(timeDesc) timeDesc.innerText = "Analyzing...";
    if(spaceDesc) spaceDesc.innerText = "Analyzing...";

    try {
        const response = await fetch('/process_code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code: inputCode, 
                target_lang: targetLang,
                candidate_id: candidateId 
            })
        });
        const data = await response.json();

        if (data.status === "error") {
            if (outputBox) outputBox.value = "Error: " + data.message;
            if (explanationTableBody) explanationTableBody.innerHTML = `<tr><td colspan="2" style="color:var(--accent-color); text-align:center;">Analysis failed.</td></tr>`;
            
            if(complianceStatus) {
                complianceStatus.innerHTML = `<i class="fas fa-times-circle"></i> Compliance Status: FAILED (Backend Error)`;
                complianceStatus.classList.add('compliance-fail');
            }

        } else {
            if (detectedBadge) detectedBadge.innerText = data.detected_language || "Unknown";
            if (integrityBadge) integrityBadge.innerText = "Integrity: " + (data.integrity_check || "--");
            
            // NEW: Update Quality Score
            if(qualityScoreDisplay) {
                const score = data.quality_score || 0;
                qualityScoreDisplay.innerHTML = `<i class="fas fa-star"></i> Quality Score: ${score}/100`;
            }

            if (plagiarismCheck) {
                if (data.plagiarism_check) {
                    plagiarismCheck.innerHTML = `<i class="fas fa-shield-alt"></i> Plagiarism Check: ${data.plagiarism_check}`;
                    if (data.plagiarism_check.toLowerCase().includes("high match")) {
                        plagiarismCheck.classList.add('plagiarism-high');
                        plagiarismCheck.classList.remove('plagiarism-low');
                    } else {
                        plagiarismCheck.classList.add('plagiarism-low');
                        plagiarismCheck.classList.remove('plagiarism-high');
                    }
                } else {
                    plagiarismCheck.innerHTML = `<i class="fas fa-shield-alt"></i> Plagiarism Check: Data Missing`;
                    plagiarismCheck.classList.add('plagiarism-high');
                }
            }
            
            if(complianceStatus) {
                if (data.final_code && data.final_code.trim().length > 0) {
                     complianceStatus.innerHTML = `<i class="fas fa-check-circle"></i> Compliance Status: PASS (100% Fixed)`;
                     complianceStatus.classList.add('compliance-pass');
                } else {
                     complianceStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Compliance Status: FAIL (Empty Output)`;
                     complianceStatus.classList.add('compliance-fail');
                }
            }

            if (outputBox) {
                outputBox.value = data.final_code;
                updateLineNumbers('outputCode', 'outputLines');
            }

            if (explanationTableBody) {
                explanationTableBody.innerHTML = "";
                if (data.code_explanation && Array.isArray(data.code_explanation)) {
                    data.code_explanation.forEach(item => {
                        const row = `<tr>
                            <td class="code-cell">${item.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                            <td>${item.explanation}</td>
                        </tr>`;
                        explanationTableBody.innerHTML += row;
                    });
                } else {
                    explanationTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center;">No explanation provided.</td></tr>`;
                }
            }

            if (errorTableBody) {
                errorTableBody.innerHTML = "";
                if (data.error_table && data.error_table.length > 0) {
                    errorTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--accent-color); padding:10px;">${data.error_table.length} Errors Found in Original Code.</td></tr>`;
                    data.error_table.forEach(err => {
                        const row = `<tr>
                            <td>${err.line}</td>
                            <td>${err.error}</td>
                        </tr>`;
                        errorTableBody.innerHTML += row;
                    });
                } else {
                    errorTableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--success-color); padding:20px;">No critical errors found in Original Code.</td></tr>`;
                }
            }
            
            if (data.complexity) {
                if (data.complexity.time) {
                    if (timeBest) timeBest.innerText = data.complexity.time.best || "?";
                    if (timeAvg) timeAvg.innerText = data.complexity.time.average || "?";
                    if (timeWorst) timeWorst.innerText = data.complexity.time.worst || "?";
                    if (timeDesc) timeDesc.innerText = data.complexity.time.desc || "";
                }
                if (data.complexity.space) {
                    if (spaceBest) spaceBest.innerText = data.complexity.space.best || "?";
                    if (spaceAvg) spaceAvg.innerText = data.complexity.space.average || "?";
                    if (spaceWorst) spaceWorst.innerText = data.complexity.space.worst || "?";
                    if (spaceDesc) spaceDesc.innerText = data.complexity.space.desc || "";
                }
            }
            
            lastReportData = {
                ...data,
                original_code: inputCode,
                compliance_status: complianceStatus ? complianceStatus.innerText : "N/A",
                time_analysis: getComplexityText(),
                error_log_text: getErrorLogText(),
                explanation_text: getExplanationTableText(),
                maintainability_index: data.maintainability_index || '--',
                readability_score: data.readability_score || '--',
            };
        }
    } catch (err) {
        if (outputBox) outputBox.value = "System Connection Error. Ensure backend is running.\n\n" + err;
         if(complianceStatus) {
            complianceStatus.innerHTML = `<i class="fas fa-times-circle"></i> Compliance Status: FAILED (System Error)`;
            complianceStatus.classList.add('compliance-fail');
         }
    } finally {
        if (overlay) overlay.style.display = "none";
        if (navbar) navbar.classList.remove('blur-filter');
        if (containerDiv) containerDiv.classList.remove('blur-filter');
    }
}

// ==========================================
// 7. REPORTING & PDF GENERATION
// ==========================================

async function downloadPdf() {
    if (Object.keys(lastReportData).length === 0 || !lastReportData.final_code) {
        alert("Please run an assessment first to generate the report data.");
        return;
    }
    
    // Updated selector to match new Navbar button
    const downloadButton = document.querySelector('button[onclick="downloadPdf()"]');
    const originalContent = downloadButton ? downloadButton.innerHTML : "Download Report";
    if (downloadButton) {
        downloadButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        downloadButton.disabled = true;
    }

    try {
        const response = await fetch('/generate_pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastReportData)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `CodeStatic_Report_${new Date().getTime()}.pdf`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match && match[1]) filename = match[1];
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            alert("Report downloaded successfully in PDF format!");

        } else {
            const errorText = await response.json();
            alert(`PDF Generation Failed: ${errorText.message || response.statusText}. Please check server logs.`);
        }
    } catch (error) {
        alert(`Network error during PDF generation. Is the backend running? Error: ${error}`);
    } finally {
        if (downloadButton) {
            downloadButton.innerHTML = originalContent;
            downloadButton.disabled = false;
        }
    }
}

// --- Helper Functions for Data Extraction ---

function getErrorLogText() {
    const rows = document.querySelectorAll('#errorTable tbody tr');
    let text = "";
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if(cols.length >= 2) {
            text += `Line ${cols[0].innerText}: ${cols[1].innerText}\n`;
        }
    });
    return text.trim() || "No critical errors found.";
}

function getExplanationTableText() {
    const rows = document.querySelectorAll('#explanationTable tbody tr');
    let text = "";
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if(cols.length >= 2) {
            text += `CODE: ${cols[0].innerText}\n   -> EXPLANATION: ${cols[1].innerText}\n\n`;
        }
    });
    return text.trim() || "No explanation provided.";
}

function getComplexityText() {
    const tBest = document.getElementById('timeBest') ? document.getElementById('timeBest').innerText : "";
    const tAvg = document.getElementById('timeAvg') ? document.getElementById('timeAvg').innerText : "";
    const tWorst = document.getElementById('timeWorst') ? document.getElementById('timeWorst').innerText : "";
    const tDesc = document.getElementById('timeDesc') ? document.getElementById('timeDesc').innerText : "";

    const sBest = document.getElementById('spaceBest') ? document.getElementById('spaceBest').innerText : "";
    const sAvg = document.getElementById('spaceAvg') ? document.getElementById('spaceAvg').innerText : "";
    const sWorst = document.getElementById('spaceWorst') ? document.getElementById('spaceWorst').innerText : "";
    const sDesc = document.getElementById('spaceDesc') ? document.getElementById('spaceDesc').innerText : "";
    
    return `TIME COMPLEXITY:
  Best: ${tBest} | Avg: ${tAvg} | Worst: ${tWorst}
  Notes: ${tDesc}

SPACE COMPLEXITY:
  Best: ${sBest} | Avg: ${sAvg} | Worst: ${sWorst}
  Notes: ${sDesc}`;
}

// --- Copy Utilities ---

function copyContent(elementId) {
    const copyText = document.getElementById(elementId);
    if (!copyText.value) return; 
    copyText.select();
    navigator.clipboard.writeText(copyText.value).then(() => {
        const originalBg = copyText.style.background;
        copyText.style.background = "#22c55e22"; 
        setTimeout(() => copyText.style.background = originalBg, 200);
    });
}

function copyTable() {
    const rows = document.querySelectorAll('#errorTable tbody tr');
    let text = "CRITICAL ERROR LOG:\n";
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if(cols.length >= 2) {
            text += `Line ${cols[0].innerText}: ${cols[1].innerText}\n`;
        }
    });
    navigator.clipboard.writeText(text).then(() => {
        alert("Error log copied to clipboard.");
    });
}

function copyExplanationTable() {
    const rows = document.querySelectorAll('#explanationTable tbody tr');
    let text = "LINE-BY-LINE EXPLANATION:\n\n";
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if(cols.length >= 2) {
            text += `CODE: ${cols[0].innerText}\n   -> ${cols[1].innerText}\n\n`;
        }
    });
    navigator.clipboard.writeText(text).then(() => {
        alert("Explanation copied to clipboard.");
    });
}

function copyComplexity() {
    const text = getComplexityText();
    navigator.clipboard.writeText(text).then(() => {
        alert("Complexity analysis copied.");
    });
}

// ==========================================
// 8. INITIALIZATION
// ==========================================

// Enable project sidebar toggle
togglePanel("projectsButton", "projectsPanel");

// Load data on startup
document.addEventListener('DOMContentLoaded', () => {
    loadLastSavedCode();
    loadProjects();
    loadSavedChat();
    
    // Auto-save listener on keyup (debounced ideally, but direct for now)
    const codeInput = document.getElementById("codeInput") || document.getElementById("inputCode");
    if (codeInput) {
        codeInput.addEventListener('keyup', saveCodeToDB);
    }
});