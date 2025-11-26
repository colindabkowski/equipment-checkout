// Equipment Check-In/Out System
// Main Application Logic

class EquipmentCheckoutSystem {
    constructor() {
        // Data storage
        this.students = [];
        this.equipment = [];
        this.transactions = [];

        // Current transaction state
        this.currentStudent = null;
        this.currentEquipment = null;
        this.transactionMode = null; // 'checkout' or 'checkin'
        this.currentStudentCheckouts = [];
        this.currentPhotoData = null; // For photo uploads

        // Initialize
        this.loadData();
        this.initializeDefaultEquipment();
        this.setupEventListeners();
        this.renderAll();
    }

    // ===== DATA MANAGEMENT =====

    loadData() {
        this.students = JSON.parse(localStorage.getItem('students') || '[]');
        this.equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
        this.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    }

    saveData() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('equipment', JSON.stringify(this.equipment));
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    initializeDefaultEquipment() {
        const defaultEquipment = [];

        // Add WACS TRIPOD 1 through WACS TRIPOD 8
        for (let i = 1; i <= 8; i++) {
            defaultEquipment.push({
                type: 'Tripod',
                barcode: `WACS TRIPOD ${i}`,
                description: `WACS TRIPOD ${i}`,
                addedDate: new Date().toISOString()
            });
        }

        // Add Rode Mic 1 through Rode Mic 11
        for (let i = 1; i <= 11; i++) {
            defaultEquipment.push({
                type: 'Microphone',
                barcode: `Rode Mic ${i}`,
                description: `Rode Mic ${i}`,
                addedDate: new Date().toISOString()
            });
        }

        // Add Phone Mount 1 through Phone Mount 10
        for (let i = 1; i <= 10; i++) {
            defaultEquipment.push({
                type: 'Phone Mount',
                barcode: `Phone Mount ${i}`,
                description: `Phone Mount ${i}`,
                addedDate: new Date().toISOString()
            });
        }

        // Only add equipment that doesn't already exist
        defaultEquipment.forEach(newEquip => {
            if (!this.equipment.some(e => e.barcode === newEquip.barcode)) {
                this.equipment.push(newEquip);
            }
        });

        this.saveData();
    }

    // ===== EVENT LISTENERS =====

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Barcode scanning
        const barcodeInput = document.getElementById('barcode-input');
        barcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleScan(barcodeInput.value.trim());
                barcodeInput.value = '';
            }
        });

        // Scan tab buttons
        document.getElementById('confirm-checkout-btn').addEventListener('click', () => this.confirmCheckout());
        document.getElementById('cancel-transaction-btn').addEventListener('click', () => this.cancelTransaction());
        document.getElementById('confirm-checkin-btn').addEventListener('click', () => this.confirmCheckin());
        document.getElementById('cancel-checkin-btn').addEventListener('click', () => this.cancelTransaction());
        document.getElementById('checkin-all-btn').addEventListener('click', () => this.checkInAllStudentEquipment());
        document.getElementById('proceed-checkout-btn').addEventListener('click', () => this.proceedToCheckout());
        document.getElementById('cancel-student-options-btn').addEventListener('click', () => this.cancelTransaction());

        // Student management
        document.getElementById('show-add-student-btn').addEventListener('click', () => this.showAddStudentFormWithPassword());
        document.getElementById('student-submit-btn').addEventListener('click', () => this.addStudent());
        document.getElementById('student-cancel-btn').addEventListener('click', () => this.hideAddStudentForm());
        document.getElementById('student-search').addEventListener('keyup', () => this.filterStudents());
        document.getElementById('student-photo').addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Equipment management
        document.getElementById('show-add-equipment-btn').addEventListener('click', () => this.showAddEquipmentFormWithPassword());
        document.getElementById('equipment-submit-btn').addEventListener('click', () => this.addEquipment());
        document.getElementById('equipment-cancel-btn').addEventListener('click', () => this.hideAddEquipmentForm());
        document.getElementById('equipment-search').addEventListener('keyup', () => this.filterEquipment());
        document.getElementById('export-equipment-csv-btn').addEventListener('click', () => this.exportEquipmentCSV());

        // History
        document.getElementById('history-search').addEventListener('keyup', () => this.filterHistory());
        document.querySelectorAll('.filter-tabs .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterHistoryByStatus(e.target.dataset.filter));
        });
    }

    // ===== TAB SWITCHING =====

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName + '-tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Refresh data if needed
        if (tabName === 'history') this.renderHistoryTable();
        if (tabName === 'reports') this.renderReports();
        if (tabName === 'scan') {
            this.resetScanState();
            document.getElementById('barcode-input').focus();
        }
    }

    // ===== BARCODE SCANNING =====

    handleScan(barcode) {
        if (!barcode) return;

        this.hideMessage();

        // Check if it's a student
        const student = this.students.find(s => s.barcode === barcode);
        if (student && !this.currentStudent) {
            // Check if student has any items checked out
            const studentCheckouts = this.transactions.filter(t =>
                t.studentBarcode === barcode && t.status === 'out'
            );

            if (studentCheckouts.length > 0) {
                // Show option to check in or check out
                this.currentStudent = student;
                this.showStudentCheckoutOptions(student, studentCheckouts);
                return;
            }

            // No items checked out, proceed to checkout
            this.currentStudent = student;
            this.showStudentPhotoLarge(student);
            return;
        }

        // Check if it's equipment
        const equip = this.equipment.find(e => e.barcode === barcode);
        if (equip) {
            // Check if equipment is currently checked out
            const activeTransaction = this.transactions.find(t =>
                t.equipmentBarcode === barcode && t.status === 'out'
            );

            if (activeTransaction && !this.currentStudent) {
                // Check-in mode
                this.currentEquipment = equip;
                this.transactionMode = 'checkin';
                this.showCheckinInfo(activeTransaction);
            } else if (this.currentStudent && !activeTransaction) {
                // Check-out mode
                this.currentEquipment = equip;
                this.transactionMode = 'checkout';
                this.showCheckoutInfo();
            } else if (activeTransaction) {
                this.showMessage(`Equipment is already checked out to ${activeTransaction.studentName}`, 'error');
            } else {
                this.showMessage('Please scan a student pass first', 'error');
            }
            return;
        }

        this.showMessage('Barcode not recognized. Please add student or equipment first.', 'error');
    }

    showStudentPhotoLarge(student) {
        // Hide other sections
        document.getElementById('checkout-info').style.display = 'none';
        document.getElementById('checkin-info').style.display = 'none';
        document.getElementById('student-options').style.display = 'none';

        // Show large student photo in the status message area
        const statusMsg = document.getElementById('status-message');
        if (student.photo) {
            statusMsg.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <img src="${student.photo}" style="width: 300px; height: 300px; border-radius: 50%; object-fit: cover; border: 6px solid #667eea; box-shadow: 0 10px 30px rgba(0,0,0,0.3); margin-bottom: 20px;">
                    <h2 style="color: #667eea; margin: 20px 0 10px 0; font-size: 32px;">${student.name}</h2>
                    <p style="color: #666; font-size: 18px;">Now scan equipment to check out</p>
                </div>
            `;
        } else {
            statusMsg.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 300px; height: 300px; border-radius: 50%; background: #e9ecef; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 6px solid #667eea;">
                        <span style="font-size: 120px; color: #adb5bd;">👤</span>
                    </div>
                    <h2 style="color: #667eea; margin: 20px 0 10px 0; font-size: 32px;">${student.name}</h2>
                    <p style="color: #666; font-size: 18px;">Now scan equipment to check out</p>
                </div>
            `;
        }
        statusMsg.className = 'status-message info';
        statusMsg.style.display = 'block';
    }

    showStudentCheckoutOptions(student, checkouts) {
        this.currentStudentCheckouts = checkouts;

        // Update student name and photo
        if (student.photo) {
            document.getElementById('student-options-name').innerHTML = `
                <img src="${student.photo}" class="student-photo" alt="${student.name}" style="vertical-align: middle; margin-right: 10px;">
                ${student.name}
            `;
        } else {
            document.getElementById('student-options-name').textContent = student.name;
        }

        let listHtml = '';
        checkouts.forEach(checkout => {
            const checkoutDate = new Date(checkout.checkoutTime);
            const duration = Math.round((new Date() - checkoutDate) / (1000 * 60));
            const durationText = duration < 60 ? duration + ' min' : Math.round(duration / 60) + ' hrs';

            listHtml += `
                <div class="student-checkout-item">
                    <div class="item-info">
                        <div class="item-name">${checkout.equipmentType} - ${checkout.equipmentDescription || checkout.equipmentBarcode}</div>
                        <div class="item-time">Checked out ${durationText} ago</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-success" style="padding: 8px 16px;" onclick="app.checkInSingleItem('${checkout.equipmentBarcode}')">Check In</button>
                    </div>
                </div>
            `;
        });

        document.getElementById('student-checkout-list').innerHTML = listHtml;
        document.getElementById('student-options').style.display = 'block';
        document.getElementById('checkout-info').style.display = 'none';
        document.getElementById('checkin-info').style.display = 'none';
    }

    checkInSingleItem(equipmentBarcode) {
        const transaction = this.transactions.find(t =>
            t.equipmentBarcode === equipmentBarcode && t.status === 'out'
        );

        if (transaction) {
            transaction.checkinTime = new Date().toISOString();
            transaction.status = 'in';
            transaction.checkinNotes = 'Single item check-in';
            this.saveData();

            // Remove from current list
            this.currentStudentCheckouts = this.currentStudentCheckouts.filter(t => t.equipmentBarcode !== equipmentBarcode);

            if (this.currentStudentCheckouts.length === 0) {
                this.showMessage(`✓ All equipment returned by ${this.currentStudent.name}`, 'success');
                this.resetScanState();
            } else {
                this.showStudentCheckoutOptions(this.currentStudent, this.currentStudentCheckouts);
                this.showMessage(`✓ Item checked in successfully`, 'success');
            }

            this.renderHistoryTable();
            this.renderReports();
        }
    }

    checkInAllStudentEquipment() {
        const count = this.currentStudentCheckouts.length;

        this.currentStudentCheckouts.forEach(checkout => {
            const transaction = this.transactions.find(t =>
                t.equipmentBarcode === checkout.equipmentBarcode && t.status === 'out'
            );

            if (transaction) {
                transaction.checkinTime = new Date().toISOString();
                transaction.status = 'in';
                transaction.checkinNotes = 'Batch check-in (all items)';
            }
        });

        this.saveData();
        this.showMessage(`✓ ${count} item(s) checked in for ${this.currentStudent.name}`, 'success');
        this.resetScanState();
        this.renderHistoryTable();
        this.renderReports();
    }

    proceedToCheckout() {
        document.getElementById('student-options').style.display = 'none';
        this.showMessage(`Student: ${this.currentStudent.name}. Now scan equipment to check out.`, 'info');
    }

    showCheckoutInfo() {
        let photoHtml = '';
        if (this.currentStudent.photo) {
            photoHtml = `
                <div class="student-info-header">
                    <img src="${this.currentStudent.photo}" class="student-photo-large" alt="${this.currentStudent.name}">
                    <div class="student-info-text">
                        <h3>${this.currentStudent.name}</h3>
                        <p>${this.currentStudent.email || ''}</p>
                    </div>
                </div>
            `;
        }

        const detailsHtml = `
            ${photoHtml}
            <div class="info-row">
                <span class="info-label">Student:</span>
                <span class="info-value">${this.currentStudent.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Equipment:</span>
                <span class="info-value">${this.currentEquipment.type} - ${this.currentEquipment.description || this.currentEquipment.barcode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${new Date().toLocaleString()}</span>
            </div>
        `;

        document.getElementById('transaction-details').innerHTML = detailsHtml;

        // Set default expected return time to end of school day (3:00 PM)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(15, 0, 0, 0); // 3:00 PM
        const defaultReturn = tomorrow.toISOString().slice(0, 16);
        document.getElementById('expected-return').value = defaultReturn;

        document.getElementById('checkout-info').style.display = 'block';
        document.getElementById('checkin-info').style.display = 'none';
        document.getElementById('student-options').style.display = 'none';
    }

    showCheckinInfo(transaction) {
        const checkoutDate = new Date(transaction.checkoutTime);
        const now = new Date();
        const duration = Math.round((now - checkoutDate) / (1000 * 60)); // minutes

        const detailsHtml = `
            <div class="info-row">
                <span class="info-label">Student:</span>
                <span class="info-value">${transaction.studentName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Equipment:</span>
                <span class="info-value">${transaction.equipmentType} - ${transaction.equipmentDescription}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Checked Out:</span>
                <span class="info-value">${checkoutDate.toLocaleString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Duration:</span>
                <span class="info-value">${duration < 60 ? duration + ' minutes' : Math.round(duration / 60) + ' hours'}</span>
            </div>
        `;

        document.getElementById('checkin-details').innerHTML = detailsHtml;
        document.getElementById('checkin-info').style.display = 'block';
        document.getElementById('checkout-info').style.display = 'none';
    }

    confirmCheckout() {
        const notes = document.getElementById('notes-input').value;
        const expectedReturn = document.getElementById('expected-return').value;

        const transaction = {
            id: Date.now(),
            studentName: this.currentStudent.name,
            studentBarcode: this.currentStudent.barcode,
            equipmentType: this.currentEquipment.type,
            equipmentBarcode: this.currentEquipment.barcode,
            equipmentDescription: this.currentEquipment.description || '',
            checkoutTime: new Date().toISOString(),
            expectedReturnTime: expectedReturn ? new Date(expectedReturn).toISOString() : null,
            checkinTime: null,
            status: 'out',
            checkoutNotes: notes,
            checkinNotes: ''
        };

        this.transactions.push(transaction);
        this.saveData();

        this.showMessage(`✓ ${this.currentEquipment.type} checked out to ${this.currentStudent.name}`, 'success');
        this.resetScanState();
        this.renderHistoryTable();
        this.renderReports();
    }

    confirmCheckin() {
        const notes = document.getElementById('checkin-notes-input').value;

        const transaction = this.transactions.find(t =>
            t.equipmentBarcode === this.currentEquipment.barcode && t.status === 'out'
        );

        if (transaction) {
            transaction.checkinTime = new Date().toISOString();
            transaction.status = 'in';
            transaction.checkinNotes = notes;
            this.saveData();

            this.showMessage(`✓ ${this.currentEquipment.type} checked in successfully`, 'success');
            this.resetScanState();
            this.renderHistoryTable();
            this.renderReports();
        }
    }

    cancelTransaction() {
        this.resetScanState();
        this.showMessage('Transaction cancelled', 'info');
    }

    resetScanState() {
        this.currentStudent = null;
        this.currentEquipment = null;
        this.transactionMode = null;
        this.currentStudentCheckouts = [];
        document.getElementById('checkout-info').style.display = 'none';
        document.getElementById('checkin-info').style.display = 'none';
        document.getElementById('student-options').style.display = 'none';
        document.getElementById('notes-input').value = '';
        document.getElementById('checkin-notes-input').value = '';
        document.getElementById('expected-return').value = '';
        document.getElementById('barcode-input').value = '';
        document.getElementById('barcode-input').focus();
    }

    // ===== MESSAGES =====

    showMessage(text, type) {
        const msg = document.getElementById('status-message');
        msg.textContent = text;
        msg.className = 'status-message ' + type;
        msg.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                msg.style.display = 'none';
            }, 3000);
        }
    }

    hideMessage() {
        document.getElementById('status-message').style.display = 'none';
    }

    // ===== STUDENT MANAGEMENT =====

    showAddStudentFormWithPassword() {
        const password = prompt('Enter password to add student:');
        if (password === '2091') {
            this.showAddStudentForm();
        } else if (password !== null) {
            alert('Incorrect password. Access denied.');
        }
    }

    showAddStudentForm() {
        document.getElementById('add-student-form').style.display = 'block';
        document.getElementById('student-form-title').textContent = 'Add New Student';
        document.getElementById('student-submit-btn').textContent = 'Save Student';
        document.getElementById('student-edit-mode').value = '';
        document.getElementById('student-original-barcode').value = '';
        document.getElementById('student-name').value = '';
        document.getElementById('student-barcode').value = '';
        document.getElementById('student-email').value = '';
        document.getElementById('student-name').focus();
    }

    hideAddStudentForm() {
        document.getElementById('add-student-form').style.display = 'none';
        document.getElementById('student-name').value = '';
        document.getElementById('student-barcode').value = '';
        document.getElementById('student-email').value = '';
        document.getElementById('student-photo').value = '';
        document.getElementById('photo-preview').innerHTML = '';
        this.currentPhotoData = null;
    }

    addStudent() {
        const name = document.getElementById('student-name').value.trim();
        const barcode = document.getElementById('student-barcode').value.trim();
        const email = document.getElementById('student-email').value.trim();
        const editMode = document.getElementById('student-edit-mode').value;
        const originalBarcode = document.getElementById('student-original-barcode').value;

        if (!name || !barcode) {
            alert('Please fill in required fields');
            return;
        }

        if (editMode === 'edit') {
            // Update existing student
            const student = this.students.find(s => s.barcode === originalBarcode);
            if (student) {
                // Check if new barcode conflicts with another student
                if (barcode !== originalBarcode && this.students.some(s => s.barcode === barcode)) {
                    alert('A student with this barcode already exists');
                    return;
                }

                student.name = name;
                student.barcode = barcode;
                student.email = email;

                // Update photo if a new one was uploaded
                if (this.currentPhotoData) {
                    student.photo = this.currentPhotoData;
                }

                // Update transactions if barcode changed
                if (barcode !== originalBarcode) {
                    this.transactions.forEach(t => {
                        if (t.studentBarcode === originalBarcode) {
                            t.studentBarcode = barcode;
                        }
                    });
                }
            }
        } else {
            // Add new student
            if (this.students.some(s => s.barcode === barcode)) {
                alert('A student with this barcode already exists');
                return;
            }

            this.students.push({
                name,
                barcode,
                email,
                photo: this.currentPhotoData || null,
                addedDate: new Date().toISOString()
            });
        }

        this.currentPhotoData = null;
        this.saveData();
        this.renderStudentsTable();
        this.renderHistoryTable();
        this.hideAddStudentForm();
    }

    editStudent(barcode) {
        const student = this.students.find(s => s.barcode === barcode);
        if (!student) return;

        document.getElementById('add-student-form').style.display = 'block';
        document.getElementById('student-form-title').textContent = 'Edit Student';
        document.getElementById('student-submit-btn').textContent = 'Update Student';
        document.getElementById('student-edit-mode').value = 'edit';
        document.getElementById('student-original-barcode').value = barcode;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-barcode').value = student.barcode;
        document.getElementById('student-email').value = student.email || '';

        // Show existing photo if available
        const photoPreview = document.getElementById('photo-preview');
        if (student.photo) {
            photoPreview.innerHTML = `
                <div class="photo-preview-container">
                    <img src="${student.photo}" class="student-photo" alt="Current Photo">
                    <p style="color: #666; font-size: 12px; margin-top: 10px;">Current photo (upload new to replace)</p>
                </div>
            `;
        } else {
            photoPreview.innerHTML = '';
        }

        document.getElementById('student-name').focus();
    }

    deleteStudent(barcode) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.students = this.students.filter(s => s.barcode !== barcode);
            this.saveData();
            this.renderStudentsTable();
        }
    }

    renderStudentsTable() {
        if (this.students.length === 0) {
            document.getElementById('students-table-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>No students added yet</p>
                </div>
            `;
            return;
        }

        let html = '<table><thead><tr><th>Name</th><th>Barcode</th><th>Email</th><th>Actions</th></tr></thead><tbody>';

        this.students.forEach(student => {
            html += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.barcode}</td>
                    <td>${student.email || '-'}</td>
                    <td>
                        <button class="btn btn-primary" style="padding: 8px 16px; margin-right: 5px;" onclick="app.editStudent('${student.barcode}')">Edit</button>
                        <button class="btn btn-danger" style="padding: 8px 16px;" onclick="app.deleteStudent('${student.barcode}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        document.getElementById('students-table-container').innerHTML = html;
    }

    filterStudents() {
        const search = document.getElementById('student-search').value.toLowerCase();
        const rows = document.querySelectorAll('#students-table-container tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    }

    // ===== PHOTO HANDLING =====

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (limit to 500KB)
        if (file.size > 500000) {
            alert('Photo size too large. Please use a photo under 500KB.');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentPhotoData = e.target.result;

            // Show preview
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `
                <div class="photo-preview-container">
                    <img src="${this.currentPhotoData}" class="student-photo" alt="Student Photo">
                    <p style="color: #666; font-size: 12px; margin-top: 10px;">Photo ready to upload</p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }

    // ===== EQUIPMENT MANAGEMENT =====

    showAddEquipmentFormWithPassword() {
        const password = prompt('Enter password to add equipment:');
        if (password === '2091') {
            this.showAddEquipmentForm();
        } else if (password !== null) {
            alert('Incorrect password. Access denied.');
        }
    }

    showAddEquipmentForm() {
        document.getElementById('add-equipment-form').style.display = 'block';
        document.getElementById('equipment-form-title').textContent = 'Add New Equipment';
        document.getElementById('equipment-submit-btn').textContent = 'Save Equipment';
        document.getElementById('equipment-edit-mode').value = '';
        document.getElementById('equipment-original-barcode').value = '';
        document.getElementById('equipment-type').value = 'Microphone';
        document.getElementById('equipment-barcode').value = '';
        document.getElementById('equipment-description').value = '';
        document.getElementById('equipment-type').focus();
    }

    hideAddEquipmentForm() {
        document.getElementById('add-equipment-form').style.display = 'none';
        document.getElementById('equipment-type').value = 'Microphone';
        document.getElementById('equipment-barcode').value = '';
        document.getElementById('equipment-description').value = '';
    }

    addEquipment() {
        const type = document.getElementById('equipment-type').value;
        const barcode = document.getElementById('equipment-barcode').value.trim();
        const description = document.getElementById('equipment-description').value.trim();
        const editMode = document.getElementById('equipment-edit-mode').value;
        const originalBarcode = document.getElementById('equipment-original-barcode').value;

        if (!barcode) {
            alert('Please enter a barcode');
            return;
        }

        if (editMode === 'edit') {
            // Update existing equipment
            const equip = this.equipment.find(e => e.barcode === originalBarcode);
            if (equip) {
                // Check if new barcode conflicts with another equipment
                if (barcode !== originalBarcode && this.equipment.some(e => e.barcode === barcode)) {
                    alert('Equipment with this barcode already exists');
                    return;
                }

                equip.type = type;
                equip.barcode = barcode;
                equip.description = description;

                // Update transactions if barcode changed
                if (barcode !== originalBarcode) {
                    this.transactions.forEach(t => {
                        if (t.equipmentBarcode === originalBarcode) {
                            t.equipmentBarcode = barcode;
                        }
                    });
                }
            }
        } else {
            // Add new equipment
            if (this.equipment.some(e => e.barcode === barcode)) {
                alert('Equipment with this barcode already exists');
                return;
            }

            this.equipment.push({
                type,
                barcode,
                description,
                addedDate: new Date().toISOString()
            });
        }

        this.saveData();
        this.renderEquipmentTable();
        this.renderHistoryTable();
        this.hideAddEquipmentForm();
    }

    editEquipment(barcode) {
        const equip = this.equipment.find(e => e.barcode === barcode);
        if (!equip) return;

        document.getElementById('add-equipment-form').style.display = 'block';
        document.getElementById('equipment-form-title').textContent = 'Edit Equipment';
        document.getElementById('equipment-submit-btn').textContent = 'Update Equipment';
        document.getElementById('equipment-edit-mode').value = 'edit';
        document.getElementById('equipment-original-barcode').value = barcode;
        document.getElementById('equipment-type').value = equip.type;
        document.getElementById('equipment-barcode').value = equip.barcode;
        document.getElementById('equipment-description').value = equip.description || '';
        document.getElementById('equipment-type').focus();
    }

    deleteEquipment(barcode) {
        if (confirm('Are you sure you want to delete this equipment?')) {
            this.equipment = this.equipment.filter(e => e.barcode !== barcode);
            this.saveData();
            this.renderEquipmentTable();
        }
    }

    renderEquipmentTable() {
        if (this.equipment.length === 0) {
            document.getElementById('equipment-table-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>No equipment added yet</p>
                </div>
            `;
            return;
        }

        let html = '<table><thead><tr><th>Type</th><th>Barcode</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

        this.equipment.forEach(equip => {
            const isOut = this.transactions.some(t => t.equipmentBarcode === equip.barcode && t.status === 'out');
            const statusBadge = isOut ?
                '<span class="badge badge-danger">Checked Out</span>' :
                '<span class="badge badge-success">Available</span>';

            html += `
                <tr>
                    <td>${equip.type}</td>
                    <td>${equip.barcode}</td>
                    <td>${equip.description || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary" style="padding: 8px 16px; margin-right: 5px;" onclick="app.editEquipment('${equip.barcode}')">Edit</button>
                        <button class="btn btn-danger" style="padding: 8px 16px;" onclick="app.deleteEquipment('${equip.barcode}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        document.getElementById('equipment-table-container').innerHTML = html;
    }

    filterEquipment() {
        const search = document.getElementById('equipment-search').value.toLowerCase();
        const rows = document.querySelectorAll('#equipment-table-container tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    }

    exportEquipmentCSV() {
        if (this.equipment.length === 0) {
            alert('No equipment to export!');
            return;
        }

        // CSV header
        let csvContent = 'Type,Barcode,Description\n';

        // Add each equipment item
        this.equipment.forEach(equip => {
            const type = equip.type || '';
            const barcode = equip.barcode || '';
            const description = equip.description || '';

            // Escape commas and quotes in fields
            const escapeCSV = (field) => {
                if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                    return `"${field.replace(/"/g, '""')}"`;
                }
                return field;
            };

            csvContent += `${escapeCSV(type)},${escapeCSV(barcode)},${escapeCSV(description)}\n`;
        });

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `equipment_labels_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`✅ Exported ${this.equipment.length} equipment items to CSV!`);
    }

    // ===== HISTORY/TRANSACTIONS =====

    renderHistoryTable() {
        if (this.transactions.length === 0) {
            document.getElementById('history-table-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No transactions yet</p>
                </div>
            `;
            return;
        }

        const sortedTransactions = [...this.transactions].sort((a, b) =>
            new Date(b.checkoutTime) - new Date(a.checkoutTime)
        );

        let html = '<table><thead><tr><th>Student</th><th>Equipment</th><th>Checked Out</th><th>Expected Return</th><th>Checked In</th><th>Status</th><th>Notes</th></tr></thead><tbody>';

        sortedTransactions.forEach(t => {
            const checkoutDate = new Date(t.checkoutTime).toLocaleString();
            const expectedReturn = t.expectedReturnTime ? new Date(t.expectedReturnTime).toLocaleString() : '-';
            const checkinDate = t.checkinTime ? new Date(t.checkinTime).toLocaleString() : '-';

            // Check if overdue
            let statusBadge = '';
            let isOverdue = false;
            if (t.status === 'out') {
                isOverdue = t.expectedReturnTime && new Date() > new Date(t.expectedReturnTime);
                statusBadge = isOverdue ?
                    '<span class="badge badge-danger">Overdue</span>' :
                    '<span class="badge badge-danger">Out</span>';
            } else {
                statusBadge = '<span class="badge badge-success">Returned</span>';
            }

            const notes = (t.checkoutNotes || '') + (t.checkinNotes ? ' | ' + t.checkinNotes : '');

            html += `
                <tr data-status="${t.status}" data-overdue="${isOverdue}">
                    <td>${t.studentName}</td>
                    <td>${t.equipmentType} - ${t.equipmentDescription || t.equipmentBarcode}</td>
                    <td>${checkoutDate}</td>
                    <td>${expectedReturn}</td>
                    <td>${checkinDate}</td>
                    <td>${statusBadge}</td>
                    <td>${notes || '-'}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        document.getElementById('history-table-container').innerHTML = html;
    }

    filterHistory() {
        const search = document.getElementById('history-search').value.toLowerCase();
        const rows = document.querySelectorAll('#history-table-container tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    }

    filterHistoryByStatus(status) {
        // Update active button
        document.querySelectorAll('.filter-tabs .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${status}"]`).classList.add('active');

        const rows = document.querySelectorAll('#history-table-container tbody tr');

        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else if (status === 'overdue') {
                row.style.display = row.dataset.overdue === 'true' ? '' : 'none';
            } else {
                row.style.display = row.dataset.status === status ? '' : 'none';
            }
        });
    }

    // ===== REPORTS =====

    renderReports() {
        const checkedOut = this.transactions.filter(t => t.status === 'out');
        const returned = this.transactions.filter(t => t.status === 'in');
        const overdue = checkedOut.filter(t => t.expectedReturnTime && new Date() > new Date(t.expectedReturnTime));

        const statsHtml = `
            <div class="stat-card">
                <div class="stat-number">${this.students.length}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.equipment.length}</div>
                <div class="stat-label">Total Equipment</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${checkedOut.length}</div>
                <div class="stat-label">Currently Out</div>
            </div>
            <div class="stat-card" style="background: ${overdue.length > 0 ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}">
                <div class="stat-number">${overdue.length}</div>
                <div class="stat-label">Overdue Items</div>
            </div>
        `;

        // Update both stats containers (Reports tab and Scan page)
        document.getElementById('stats-container').innerHTML = statsHtml;
        document.getElementById('scan-stats-container').innerHTML = statsHtml;

        // Checked out equipment table
        let checkedOutHtml = '';
        if (checkedOut.length === 0) {
            checkedOutHtml = `
                <div class="empty-state">
                    <p>All equipment returned ✓</p>
                </div>
            `;
        } else {
            checkedOutHtml = '<table><thead><tr><th>Student</th><th>Equipment</th><th>Checked Out</th><th>Expected Return</th><th>Status</th></tr></thead><tbody>';

            checkedOut.forEach(t => {
                const checkoutDate = new Date(t.checkoutTime);
                const duration = Math.round((new Date() - checkoutDate) / (1000 * 60));
                const durationText = duration < 60 ? duration + ' min' : Math.round(duration / 60) + ' hrs';

                const expectedReturn = t.expectedReturnTime ? new Date(t.expectedReturnTime).toLocaleString() : '-';
                const isOverdue = t.expectedReturnTime && new Date() > new Date(t.expectedReturnTime);
                const statusBadge = isOverdue ?
                    '<span class="badge badge-danger">Overdue</span>' :
                    '<span class="badge badge-success">On Time</span>';

                checkedOutHtml += `
                    <tr>
                        <td>${t.studentName}</td>
                        <td>${t.equipmentType} - ${t.equipmentDescription || t.equipmentBarcode}</td>
                        <td>${durationText} ago</td>
                        <td>${expectedReturn}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });

            checkedOutHtml += '</tbody></table>';
        }

        // Update both checked-out containers (Reports tab and Scan page)
        document.getElementById('checked-out-container').innerHTML = checkedOutHtml;
        document.getElementById('scan-checked-out-container').innerHTML = checkedOutHtml;
    }

    // ===== RENDER ALL =====

    renderAll() {
        this.renderStudentsTable();
        this.renderEquipmentTable();
        this.renderHistoryTable();
        this.renderReports();
        document.getElementById('barcode-input').focus();
    }
}

// Initialize the application
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new EquipmentCheckoutSystem();
});
