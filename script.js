document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const session = JSON.parse(sessionStorage.getItem('mawizSession'));
    if (!session) return;

    const registrationForm = document.getElementById('registrationForm');
    const registrationCard = document.querySelector('.registration-card');
    const studentTableBody = document.getElementById('studentTableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const welcomeText = document.getElementById('welcomeText');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminStats = document.getElementById('adminStats');

    // Stats Elements
    const totalStudentsEl = document.getElementById('totalStudents');
    const activeStudentsEl = document.getElementById('activeStudents');
    const expiredStudentsEl = document.getElementById('expiredStudents');

    // Update Welcome Text
    welcomeText.textContent = `Welcome, ${session.fullName} (${session.role})`;

    // Role-Based UI
    if (session.role === 'admin') {
        if (adminStats) adminStats.style.display = 'grid';
    } else {
        if (registrationCard) {
            registrationCard.style.display = 'none';
            document.querySelector('.dashboard-grid').style.gridTemplateColumns = '1fr';
        }
    }

    // Logout Logic
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('mawizSession');
        window.location.href = 'login.html';
    });

    // Load data
    let students = JSON.parse(localStorage.getItem('mawizStudents')) || [];

    // Helper to check status
    const getStatus = (endDateStr) => {
        const today = new Date();
        const endDate = new Date(endDateStr);
        return endDate >= today ? 'active' : 'expired';
    };

    // Update Stats logic
    const updateStats = () => {
        if (session.role !== 'admin') return;
        
        const total = students.length;
        const active = students.filter(s => getStatus(s.endDate) === 'active').length;
        const expired = total - active;

        totalStudentsEl.textContent = total;
        activeStudentsEl.textContent = active;
        expiredStudentsEl.textContent = expired;
    };

    // Function to render students in the table
    const renderStudents = () => {
        const searchText = searchInput.value.toLowerCase();
        const filterVal = statusFilter.value;

        studentTableBody.innerHTML = '';
        
        // RBAC Filter
        let visibleStudents = students;
        if (session.role === 'student') {
            visibleStudents = students.filter(s => 
                s.name.toLowerCase() === session.fullName.toLowerCase() ||
                s.email === session.email
            );
        }

        // Search and Status Filter
        const filteredStudents = visibleStudents.filter(student => {
            const matchesSearch = (student.id && student.id.toLowerCase().includes(searchText)) ||
                                 (student.name && student.name.toLowerCase().includes(searchText));
            
            const status = getStatus(student.endDate);
            const matchesStatus = filterVal === 'all' || status === filterVal;

            return matchesSearch && matchesStatus;
        });

        filteredStudents.forEach((student, index) => {
            const status = getStatus(student.endDate);
            const statusClass = status === 'active' ? 'status-active' : 'status-expired';

            const row = document.createElement('tr');
            
            // Build generation URLs
            const idUrl = `../id/index.html?name=${encodeURIComponent(student.name || '')}&id=${encodeURIComponent(student.id)}`;
            const certUrl = `../certificate for mawiz/index.html?name=${encodeURIComponent(student.name || '')}&id=${encodeURIComponent(student.id)}`;

            const actionsHtml = session.role === 'admin' ? `
                <div style="display: flex; gap: 8px;">
                    <a href="${idUrl}" target="_blank" class="action-btn" style="background: rgba(212, 175, 55, 0.2); color: var(--secondary-gold); border: 1px solid var(--secondary-gold); padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 0.75rem;">Generate ID</a>
                    <a href="${certUrl}" target="_blank" class="action-btn" style="background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid var(--glass-border); padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 0.75rem;">Certificate</a>
                    <button class="delete-btn" onclick="deleteStudent(${index})" style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid #e74c3c; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.75rem;">Delete</button>
                </div>
            ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">View Only</span>`;

            row.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${student.name || 'N/A'}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${student.id}</div>
                </td>
                <td>${student.startDate}</td>
                <td>${student.endDate}</td>
                <td><span class="status-tag ${statusClass}">${status.toUpperCase()}</span></td>
                <td>${actionsHtml}</td>
            `;
            studentTableBody.appendChild(row);
        });

        if (filteredStudents.length === 0) {
            studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No ${filterVal !== 'all' ? filterVal : ''} records found</td></tr>`;
        }

        updateStats();
    };

    // Form Submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const studentName = document.getElementById('studentName').value;
            const studentId = document.getElementById('studentId').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            const newStudent = {
                name: studentName,
                id: studentId,
                startDate: startDate,
                endDate: endDate,
                registeredBy: session.email
            };

            students.push(newStudent);
            localStorage.setItem('mawizStudents', JSON.stringify(students));
            
            registrationForm.reset();
            renderStudents();
            
            alert('Student registered successfully!');
        });
    }

    // Input Listeners
    if (searchInput) searchInput.addEventListener('input', renderStudents);
    if (statusFilter) statusFilter.addEventListener('change', renderStudents);

    // Global delete function
    window.deleteStudent = (index) => {
        if (confirm('Are you sure you want to delete this record?')) {
            students.splice(index, 1);
            localStorage.setItem('mawizStudents', JSON.stringify(students));
            renderStudents();
        }
    };

    // Initial render
    renderStudents();
});
