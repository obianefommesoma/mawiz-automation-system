document.addEventListener('DOMContentLoaded', () => {
    // Form Inputs
    const nameInput = document.getElementById('staff-name');
    const idInput = document.getElementById('staff-id');
    const designationInput = document.getElementById('staff-designation');
    const deptSelect = document.getElementById('staff-dept');
    const phoneInput = document.getElementById('staff-phone');
    const emailInput = document.getElementById('staff-email');
    const photoInput = document.getElementById('staff-photo');
    const downloadBtn = document.getElementById('download-btn');
    const downloadBackBtn = document.getElementById('download-back-btn');

    // Display Elements
    const displayName = document.getElementById('display-name');
    const displayId = document.getElementById('display-id');
    const displayDesignation = document.getElementById('display-designation');
    const displayDept = document.getElementById('display-dept');
    const displayPhone = document.getElementById('display-phone');
    const displayEmail = document.getElementById('display-email');
    const displayPhoto = document.getElementById('display-photo');
    const logoIcons = document.querySelectorAll('.logo-icon');

    // Container Elements
    const cardFront = document.getElementById('id-card-front');
    const cardBack = document.getElementById('id-card-back');
    const viewToggles = document.querySelectorAll('.view-toggle');

    // --- Image-to-Base64 Utility (for reliable downloads) --- //
    function loadImageAsBase64(imgElement, callback) {
        if (!imgElement || !imgElement.src) {
            if (callback) callback(false);
            return;
        }
        if (imgElement.src.startsWith('data:')) {
            if (callback) callback(true);
            return;
        }
        const xhr = new XMLHttpRequest();
        xhr.open('GET', imgElement.src, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                imgElement.src = reader.result;
                if (callback) callback(true);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function () {
            // Fallback for file:// protocol
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            tempCanvas.width = imgElement.naturalWidth || 100;
            tempCanvas.height = imgElement.naturalHeight || 100;
            try {
                ctx.drawImage(imgElement, 0, 0);
                imgElement.src = tempCanvas.toDataURL('image/png');
                if (callback) callback(true);
            } catch (e) {
                console.warn('Could not convert image to Base64:', e.message);
                if (callback) callback(false);
            }
        };
        xhr.send();
    }

    // Pre-convert logos and placeholder photo
    logoIcons.forEach(logo => loadImageAsBase64(logo));
    loadImageAsBase64(displayPhoto);

    // --- QR Code Logic --- //
    let qrcode = null;
    function updateQRCode(text) {
        const qrContainer = document.getElementById('card-qrcode');
        if (!qrContainer) return;
        qrContainer.innerHTML = '';
        qrcode = new QRCode(qrContainer, {
            text: text || 'MTH-STF-000',
            width: 65,
            height: 65,
            colorDark: "#001b54",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    updateQRCode('MTH-STF-000');

    // --- Real-time Binding --- //
    nameInput.addEventListener('input', (e) => displayName.textContent = e.target.value || "STAFF NAME");
    idInput.addEventListener('input', (e) => {
        const val = e.target.value || "MTH-STF-000";
        displayId.textContent = val;
        updateQRCode(val);
    });
    designationInput.addEventListener('input', (e) => displayDesignation.textContent = e.target.value || "DESIGNATION");
    deptSelect.addEventListener('change', (e) => displayDept.textContent = e.target.value || "DEPARTMENT");
    phoneInput.addEventListener('input', (e) => displayPhone.textContent = e.target.value || "+234 000 000 0000");
    emailInput.addEventListener('input', (e) => displayEmail.textContent = e.target.value || "staff@mawizhub.com");

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => displayPhoto.src = event.target.result;
            reader.readAsDataURL(file);
        }
    });

    // --- View Toggle --- //
    viewToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            viewToggles.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (view === 'front') {
                cardFront.style.display = 'flex';
                cardBack.style.display = 'none';
            } else {
                cardFront.style.display = 'none';
                cardBack.style.display = 'flex';
            }
        });
    });

    // --- 3D Tilt Effect --- //
    [cardFront, cardBack].forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            const shine = card.querySelector('.shine');
            if (shine) {
                shine.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                shine.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });

    // --- Capture Function --- //
    function capture(element, filename, btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Generating...';
        btn.disabled = true;

        const photoContainer = element.querySelector('.photo-container');
        const info = element.querySelector('.student-info');
        const clip = element.querySelector('.card-clip');
        const hole = element.querySelector('.punch-hole');
        const originalTransform = element.style.transform;

        element.style.transform = 'none';
        if (photoContainer) photoContainer.style.transform = 'none';
        if (info) info.style.transform = 'none';
        if (clip) clip.style.display = 'none';
        if (hole) hole.style.display = 'none';

        html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${filename}.png`;
            link.click();

            btn.textContent = '✓ Downloaded';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
                element.style.transform = originalTransform;
                if (photoContainer) photoContainer.style.transform = '';
                if (info) info.style.transform = '';
                if (clip) clip.style.display = '';
                if (hole) hole.style.display = '';
            }, 2000);
        }).catch(err => {
            console.error('html2canvas error:', err);
            btn.textContent = originalText;
            btn.disabled = false;
            element.style.transform = originalTransform;
            if (photoContainer) photoContainer.style.transform = '';
            if (info) info.style.transform = '';
            if (clip) clip.style.display = '';
            if (hole) hole.style.display = '';
            alert('Download failed.\n\nFor best results, please open this project with a local server (like VS Code Live Server) instead of double-clicking the file.');
        });
    }

    downloadBtn.addEventListener('click', () => {
        // Ensure the front view is active before capturing
        document.querySelector('.view-toggle[data-view="front"]').click();
        
        const name = nameInput.value.trim().replace(/\s+/g, '_').toLowerCase() || 'staff';
        
        // Wait for CSS transitions to finish before capturing
        setTimeout(() => {
            capture(cardFront, `mawiz_staff_front_${name}`, downloadBtn);
        }, 300);
    });

    downloadBackBtn.addEventListener('click', () => {
        // Ensure the back view is active before capturing
        document.querySelector('.view-toggle[data-view="back"]').click();
        
        const name = nameInput.value.trim().replace(/\s+/g, '_').toLowerCase() || 'staff';
        
        // Wait for CSS transitions to finish before capturing
        setTimeout(() => {
            capture(cardBack, `mawiz_staff_back_${name}`, downloadBackBtn);
        }, 300);
    });
});
