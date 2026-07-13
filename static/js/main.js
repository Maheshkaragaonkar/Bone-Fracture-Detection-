// -------------------------------------------------------------
// OsteoScan AI - Frontend Interactivity & Logic
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const dropzoneContent = document.getElementById('dropzoneContent');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const laser = document.getElementById('laser');

    const resetBtn = document.getElementById('resetBtn');
    const predictBtn = document.getElementById('predictBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    const emptyState = document.getElementById('emptyState');
    const findingsContainer = document.getElementById('findingsContainer');
    const reportCard = document.getElementById('reportCard');
    const reportIdEl = document.getElementById('reportId');
    const reportTimestampEl = document.getElementById('reportTimestamp');
    const reportImage = document.getElementById('reportImage');
    const resPart = document.querySelector('#resPart span');
    const resStatus = document.getElementById('resStatus');

    const historyBody = document.getElementById('historyBody');
    const rulesBtn = document.getElementById('rulesBtn');
    const rulesModal = document.getElementById('rulesModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let currentFile = null;
    let scanHistory = JSON.parse(localStorage.getItem('osteoScanHistory')) || [];

    // Initialize UI
    renderHistory();

    // 1. Drag & Drop Upload Handlers
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropzone.addEventListener('click', () => {
        if (!currentFile) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Invalid file format. Please upload an image file.');
            return;
        }
        currentFile = file;

        // Show Image Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropzoneContent.style.display = 'none';
            previewContainer.style.display = 'flex';

            // Update button states
            resetBtn.disabled = false;
            predictBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // 2. Control Actions (Predict / Reset)
    resetBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        dropzoneContent.style.display = 'flex';
        previewContainer.style.display = 'none';
        laser.style.display = 'none';

        resetBtn.disabled = true;
        predictBtn.disabled = true;

        // Clear predictions
        emptyState.style.display = 'flex';
        findingsContainer.style.display = 'none';
    });

    predictBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // Start laser animation & loading states
        laser.style.display = 'block';
        predictBtn.disabled = true;
        resetBtn.disabled = true;

        // Build FormData
        const formData = new FormData();
        formData.append('file', currentFile);

        // Add a deliberate 1.8s delay to simulate full clinical processing,
        // allowing the laser scanning animation to look visually impressive.
        const [response] = await Promise.all([
            fetch('/api/predict', {
                method: 'POST',
                body: formData
            }).then(r => r.json()).catch(err => ({ success: false, error: err.message })),
            new Promise(resolve => setTimeout(resolve, 1800))
        ]);

        // Stop scanning
        laser.style.display = 'none';
        resetBtn.disabled = false;
        predictBtn.disabled = false;

        if (response.success) {
            displayResults(response);
            saveToHistory(response);
        } else {
            alert(`Diagnosis Failed: ${response.error || 'Server error occurred.'}`);
        }
    });

    function displayResults(data) {
        emptyState.style.display = 'none';
        findingsContainer.style.display = 'flex';

        // Generate Report Metadata
        const reportId = `OS-${Math.floor(10000 + Math.random() * 90000)}`;
        const timestamp = new Date().toLocaleString();

        reportIdEl.textContent = `ID: #${reportId}`;
        reportTimestampEl.textContent = timestamp;
        reportImage.src = data.image_url;

        // Anatomical Part
        resPart.textContent = data.body_part;

        // Findings Badge
        const status = data.result.toLowerCase();
        resStatus.innerHTML = '';
        const badge = document.createElement('span');

        if (status === 'fractured') {
            badge.className = 'badge badge-fractured';
            badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Fractured`;
        } else {
            badge.className = 'badge badge-normal';
            badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Normal`;
        }
        resStatus.appendChild(badge);

        // Save metadata on elements for report download
        reportCard.dataset.id = reportId;
        reportCard.dataset.part = data.body_part;
        reportCard.dataset.status = status;
    }

    // 3. History Session Management
    function saveToHistory(data) {
        const item = {
            id: `OS-${Math.floor(10000 + Math.random() * 90000)}`,
            timestamp: new Date().toLocaleString(),
            body_part: data.body_part,
            result: data.result,
            image_url: data.image_url
        };

        scanHistory.unshift(item);
        // Limit to last 8 entries
        if (scanHistory.length > 8) {
            scanHistory.pop();
        }
        localStorage.setItem('osteoScanHistory', JSON.stringify(scanHistory));
        renderHistory();
    }

    function renderHistory() {
        if (scanHistory.length === 0) {
            historyBody.innerHTML = `
                <tr class="no-history">
                    <td colspan="5">No scans recorded in this session.</td>
                </tr>
            `;
            return;
        }

        historyBody.innerHTML = '';
        scanHistory.forEach(item => {
            const tr = document.createElement('tr');

            const badgeClass = item.result.toLowerCase() === 'fractured' ? 'badge-mini badge-mini-fractured' : 'badge-mini badge-mini-normal';

            tr.innerHTML = `
                <td><strong>#${item.id}</strong></td>
                <td>${item.timestamp}</td>
                <td><i class="fa-solid fa-bone"></i> ${item.body_part}</td>
                <td><span class="${badgeClass}">${item.result}</span></td>
                <td>
                    <button class="btn btn-secondary btn-restore" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </td>
            `;

            // Restore scan view on click
            tr.querySelector('.btn-restore').addEventListener('click', () => {
                displayResults({
                    body_part: item.body_part,
                    result: item.result,
                    image_url: item.image_url
                });

                // Set the correct uploaded preview image box
                imagePreview.src = item.image_url;
                dropzoneContent.style.display = 'none';
                previewContainer.style.display = 'flex';
                resetBtn.disabled = false;
                predictBtn.disabled = false;
            });

            historyBody.appendChild(tr);
        });
    }

    // 4. Modal Dialog (Rules / Guidelines)
    rulesBtn.addEventListener('click', () => {
        rulesModal.classList.add('active');
    });

    const closeModal = () => {
        rulesModal.classList.remove('active');
    };

    closeModalBtn.addEventListener('click', closeModal);
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && rulesModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 5. Canvas-based "Download Report" Generation
    downloadBtn.addEventListener('click', () => {
        const id = reportCard.dataset.id || '0000';
        const part = reportCard.dataset.part || 'Unknown';
        const status = reportCard.dataset.status || 'unknown';
        const imgSource = reportImage.src;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 600;
        canvas.height = 420;

        // Background Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Outer Glow Frame border
        ctx.strokeStyle = status === 'fractured' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

        // Header Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = "bold 20px 'Outfit', sans-serif";
        ctx.fillText("OSTEOSCAN AI - DIAGNOSTIC REPORT", 25, 45);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(25, 65);
        ctx.lineTo(canvas.width - 25, 65);
        ctx.stroke();

        // Details labels
        ctx.fillStyle = '#6B7280';
        ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("REPORT ID", 240, 95);
        ctx.fillText("TIMESTAMP", 240, 155);
        ctx.fillText("ANATOMICAL REGION", 240, 215);
        ctx.fillText("PATHOLOGY FINDING", 240, 275);

        // Details values
        ctx.fillStyle = '#FFFFFF';
        ctx.font = "bold 15px 'Outfit', sans-serif";
        ctx.fillText(`#${id}`, 240, 118);
        ctx.fillText(new Date().toLocaleString(), 240, 178);
        ctx.fillText(part, 240, 238);

        // Findings Badge drawing
        ctx.save();
        if (status === 'fractured') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.fillRect(240, 288, 140, 32);
            ctx.strokeRect(240, 288, 140, 32);
            ctx.fillStyle = '#EF4444';
            ctx.font = "bold 13px 'Outfit', sans-serif";
            ctx.fillText("FRACTURED", 275, 309);
            // Draw exclamation mark icon
            ctx.fillStyle = '#EF4444';
            ctx.font = "bold 13px 'FontAwesome'";
            ctx.fillText("\u26A0", 253, 309);
        } else {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.fillRect(240, 288, 140, 32);
            ctx.strokeRect(240, 288, 140, 32);
            ctx.fillStyle = '#10B981';
            ctx.font = "bold 13px 'Outfit', sans-serif";
            ctx.fillText("NORMAL", 285, 309);
            // Draw checkmark icon
            ctx.fillStyle = '#10B981';
            ctx.font = "bold 13px 'FontAwesome'";
            ctx.fillText("\u2714", 255, 309);
        }
        ctx.restore();

        // Footer Notice
        ctx.fillStyle = '#4B5563';
        ctx.font = "italic 9px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("This report is computer-generated and must be clinically correlated by a radiologist.", 25, 395);

        // Draw Image (load it asynchronously to make sure it loads)
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
            // Draw thumbnail image frame
            ctx.fillStyle = '#000000';
            ctx.fillRect(25, 85, 190, 190);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.strokeRect(25, 85, 190, 190);

            // Draw image preserving aspect ratio
            const scale = Math.min(190 / img.width, 190 / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = 25 + (190 - w) / 2;
            const y = 85 + (190 - h) / 2;
            ctx.drawImage(img, x, y, w, h);

            // Trigger download link
            const link = document.createElement('a');
            link.download = `OsteoScan_Report_${id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = imgSource;
    });
});
