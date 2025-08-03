// Simulated initial data
const initialSales = [
    { serialNumber: "SN001", companyName: "TeaCo", agentName: "John Doe", customerName: "Jane Smith", telephone: "1234567890", status: "Deployed", date: "2025-01-15" },
    { serialNumber: "SN002", companyName: "GreenLeaf", agentName: "Alice Brown", customerName: "Bob Wilson", telephone: "0987654321", status: "Deployed", date: "2025-02-20" },
];

const initialRepairs = [
    { serialNumber: "SN001", companyName: "TeaCo", issueDescription: "Calibration issue", sendDescription: "", status: "Under Repair", date: "2025-03-10" },
];

let salesData = [];
let repairsData = [];

// Load data from localStorage or initialize with default data
function loadData() {
    try {
        const savedSales = localStorage.getItem('salesData');
        const savedRepairs = localStorage.getItem('repairsData');
        salesData = savedSales ? JSON.parse(savedSales) : [...initialSales];
        repairsData = savedRepairs ? JSON.parse(savedRepairs) : [...initialRepairs];
        console.log('Data loaded from localStorage:', { salesData, repairsData });
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        salesData = [...initialSales];
        repairsData = [...initialRepairs];
    }
}

// Save data to localStorage and prompt for backup
function saveData() {
    try {
        localStorage.setItem('salesData', JSON.stringify(salesData));
        localStorage.setItem('repairsData', JSON.stringify(repairsData));
        console.log('Data saved to localStorage:', { salesData, repairsData });
        // Prompt for backup download
        if (confirm('Data has been updated. Would you like to export a JSON backup to sync with other browsers?')) {
            downloadBackup();
        }
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        document.getElementById('backupError').textContent = 'Error saving data to localStorage. Check browser storage limits.';
    }
}

// Load data and initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateTables();
    updateCompanyFilter();
    document.getElementById('searchSerial').addEventListener('input', updateTables);
    document.getElementById('filterCompany').addEventListener('change', updateTables);
    document.getElementById('filterStatus').addEventListener('change', updateTables);
    document.getElementById('saleForm').addEventListener('submit', addSaleOrRange);
    document.getElementById('repairForm').addEventListener('submit', addRepair);
    document.getElementById('bulkUploadForm').addEventListener('submit', bulkUploadSales);
    document.getElementById('restoreForm').addEventListener('submit', restoreData);
});

function updateTables() {
    const searchSerial = document.getElementById('searchSerial').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;

    // Update Sales Table
    const salesTbody = document.getElementById('salesTableBody');
    salesTbody.innerHTML = '';
    const visibleIndices = [];
    salesData.forEach((row, index) => {
        if ((searchSerial === '' || row.serialNumber.toLowerCase().includes(searchSerial)) &&
            (filterCompany === '' || row.companyName === filterCompany) &&
            (filterStatus === '' || row.status === filterStatus)) {
            visibleIndices.push(index);
            const tr = document.createElement('tr');
            tr.className = `status-${row.status.toLowerCase().replace(' ', '-')}`;
            tr.innerHTML = `
                <td><input type="checkbox" class="sale-checkbox" data-index="${index}"></td>
                <td>${row.serialNumber}</td>
                <td>${row.companyName}</td>
                <td>${row.agentName}</td>
                <td>${row.customerName}</td>
                <td>${row.telephone}</td>
                <td>${row.status}</td>
                <td>${row.date}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editRecord(${index}, 'sales')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${index}, 'sales')">Delete</button>
                </td>
                <td><a href="#" onclick="showRelatedRepairs('${row.serialNumber}')">View Repairs</a></td>
            `;
            salesTbody.appendChild(tr);
        }
    });

    // Add event listeners to checkboxes to update Select All state
    const checkboxes = document.querySelectorAll('.sale-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });

    // Update Select All checkbox state
    updateSelectAllState();

    // Update Repairs Table
    const repairsTbody = document.getElementById('repairsTableBody');
    repairsTbody.innerHTML = '';
    repairsData.forEach((row, index) => {
        if ((searchSerial === '' || row.serialNumber.toLowerCase().includes(searchSerial)) &&
            (filterCompany === '' || row.companyName === filterCompany) &&
            (filterStatus === '' || row.status === filterStatus)) {
            const tr = document.createElement('tr');
            tr.className = `status-${row.status.toLowerCase().replace(' ', '-')}`;
            tr.innerHTML = `
                <td>${row.serialNumber}</td>
                <td>${row.companyName}</td>
                <td>${row.issueDescription}</td>
                <td>${row.sendDescription}</td>
                <td>${row.status}</td>
                <td>${row.date}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editRecord(${index}, 'repairs')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${index}, 'repairs')">Delete</button>
                </td>
                <td><a href="#" onclick="showRelatedSale('${row.serialNumber}')">View Sale</a></td>
            `;
            repairsTbody.appendChild(tr);
        }
    });
}

function updateSelectAllState() {
    const checkboxes = document.querySelectorAll('.sale-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllSales');
    const selectAllMessage = document.getElementById('selectAllMessage');
    const checkedCount = document.querySelectorAll('.sale-checkbox:checked').length;
    const totalVisible = checkboxes.length;

    if (totalVisible === 0) {
        selectAllCheckbox.checked = false;
        selectAllMessage.textContent = '';
    } else if (checkedCount === totalVisible) {
        selectAllCheckbox.checked = true;
        selectAllMessage.textContent = 'All visible sales selected.';
    } else {
        selectAllCheckbox.checked = false;
        selectAllMessage.textContent = checkedCount > 0 ? `${checkedCount} of ${totalVisible} visible sales selected.` : '';
    }
}

function toggleSelectAll(logType) {
    if (logType !== 'sales') return;
    const selectAllCheckbox = document.getElementById('selectAllSales');
    const checkboxes = document.querySelectorAll('.sale-checkbox');
    const selectAllMessage = document.getElementById('selectAllMessage');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    if (selectAllCheckbox.checked) {
        selectAllMessage.textContent = `All ${checkboxes.length} visible sales selected.`;
    } else {
        selectAllMessage.textContent = '';
    }
}

function updateCompanyFilter() {
    const companies = [...new Set([...salesData.map(row => row.companyName), ...repairsData.map(row => row.companyName)])];
    const filterCompany = document.getElementById('filterCompany');
    filterCompany.innerHTML = '<option value="">All Companies</option>';
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        filterCompany.appendChild(option);
    });
}

function addSaleOrRange(event) {
    event.preventDefault();
    const serialNumber = document.getElementById('serialNumber').value.trim();
    const startSerial = document.getElementById('startSerial').value.trim();
    const endSerial = document.getElementById('endSerial').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const agentName = document.getElementById('agentName').value.trim();
    const customerName = document.getElementById('customerName').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const saleError = document.getElementById('saleError');
    const saleSuccess = document.getElementById('saleSuccess');

    // Validate required fields
    if (!companyName || !agentName || !customerName || !telephone) {
        saleError.textContent = 'All fields except serial number range are required.';
        saleSuccess.textContent = '';
        return;
    }

    const existingSerials = new Set(salesData.map(row => row.serialNumber));
    const newSales = [];
    const currentDate = new Date().toISOString().split('T')[0];

    if (serialNumber && !startSerial && !endSerial) {
        // Single serial number entry
        if (existingSerials.has(serialNumber)) {
            saleError.textContent = `Serial Number ${serialNumber} already exists.`;
            saleSuccess.textContent = '';
            return;
        }
        newSales.push({
            serialNumber,
            companyName,
            agentName,
            customerName,
            telephone,
            status: 'Deployed',
            date: currentDate
        });
    } else if (startSerial && endSerial) {
        // Serial number range entry
        const prefixRegex = /^([A-Za-z]*)([0-9]+)$/;
        const startMatch = startSerial.match(prefixRegex);
        const endMatch = endSerial.match(prefixRegex);

        if (!startMatch || !endMatch || startMatch[1] !== endMatch[1]) {
            saleError.textContent = 'Invalid serial number format or mismatched prefixes. Use format like SN0001-SN0100.';
            saleSuccess.textContent = '';
            return;
        }

        const prefix = startMatch[1];
        const startNum = parseInt(startMatch[2], 10);
        const endNum = parseInt(endMatch[2], 10);
        const padding = startMatch[2].length;

        if (startNum > endNum) {
            saleError.textContent = 'Start serial number must be less than or equal to end serial number.';
            saleSuccess.textContent = '';
            return;
        }

        for (let i = startNum; i <= endNum; i++) {
            const serial = `${prefix}${i.toString().padStart(padding, '0')}`;
            if (existingSerials.has(serial)) {
                saleError.textContent = `Serial Number ${serial} already exists in range.`;
                saleSuccess.textContent = '';
                return;
            }
            newSales.push({
                serialNumber: serial,
                companyName,
                agentName,
                customerName,
                telephone,
                status: 'Deployed',
                date: currentDate
            });
        }
    } else {
        saleError.textContent = 'Enter either a single serial number or a valid range.';
        saleSuccess.textContent = '';
        return;
    }

    salesData.push(...newSales);
    saveData();
    saleSuccess.textContent = `Successfully added ${newSales.length} sale${newSales.length > 1 ? 's' : ''}.`;
    saleError.textContent = '';
    document.getElementById('saleForm').reset();
    updateTables();
    updateCompanyFilter();
}

function downloadSampleCsv() {
    try {
        const sampleData = [
            { serialNumber: "SN1001", companyName: "TeaCo", agentName: "John Doe", customerName: "Jane Smith", telephone: "1234567890", status: "Deployed", date: "2025-08-01" },
            { serialNumber: "SN1002", companyName: "GreenLeaf", agentName: "Alice Brown", customerName: "Bob Wilson", telephone: "0987654321", status: "Deployed", date: "2025-08-01" },
            { serialNumber: "SN1003", companyName: "TeaCo", agentName: "Mary Johnson", customerName: "Tom Davis", telephone: "5551234567", status: "Under Repair", date: "2025-08-02" }
        ];
        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_sales_upload.csv';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('bulkUploadSuccess').textContent = 'Sample CSV downloaded successfully.';
        document.getElementById('bulkUploadError').textContent = '';
    } catch (error) {
        console.error('Error downloading sample CSV:', error);
        document.getElementById('bulkUploadError').textContent = 'Error downloading sample CSV. Please try again.';
        document.getElementById('bulkUploadSuccess').textContent = '';
    }
}

function bulkUploadSales(event) {
    event.preventDefault();
    const fileInput = document.getElementById('salesCsv');
    const file = fileInput.files[0];
    const bulkUploadError = document.getElementById('bulkUploadError');
    const bulkUploadSuccess = document.getElementById('bulkUploadSuccess');

    if (!file) {
        bulkUploadError.textContent = 'Please select a CSV file.';
        return;
    }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const errors = [];
            const newSales = [];
            const existingSerials = new Set(salesData.map(row => row.serialNumber));

            results.data.forEach((row, index) => {
                if (!row.serialNumber || !row.companyName || !row.agentName || !row.customerName || !row.telephone) {
                    errors.push(`Row ${index + 1}: Missing required fields.`);
                    return;
                }
                if (existingSerials.has(row.serialNumber)) {
                    errors.push(`Row ${index + 1}: Serial Number ${row.serialNumber} already exists.`);
                    return;
                }
                newSales.push({
                    serialNumber: row.serialNumber,
                    companyName: row.companyName,
                    agentName: row.agentName,
                    customerName: row.customerName,
                    telephone: row.telephone,
                    status: row.status || 'Deployed',
                    date: row.date || new Date().toISOString().split('T')[0]
                });
                existingSerials.add(row.serialNumber);
            });

            if (errors.length > 0) {
                bulkUploadError.textContent = errors.join(' ');
                bulkUploadSuccess.textContent = '';
            } else {
                salesData.push(...newSales);
                saveData();
                bulkUploadSuccess.textContent = `Successfully added ${newSales.length} sales.`;
                bulkUploadError.textContent = '';
                updateTables();
                updateCompanyFilter();
                document.getElementById('bulkUploadForm').reset();
            }
        },
        error: function(error) {
            bulkUploadError.textContent = `Error parsing CSV: ${error.message}`;
            bulkUploadSuccess.textContent = '';
        }
    });
}

function addRepair(event) {
    event.preventDefault();
    const serialNumber = document.getElementById('repairSerialNumber').value;
    const issueDescription = document.getElementById('issueDescription').value;
    const sendDescription = document.getElementById('sendDescription').value;
    const status = document.getElementById('repairStatus').value;
    const repairError = document.getElementById('repairError');

    const sale = salesData.find(row => row.serialNumber === serialNumber);
    if (!sale) {
        repairError.textContent = 'Serial Number does not exist in sales.';
        return;
    }

    repairsData.push({
        serialNumber,
        companyName: sale.companyName,
        issueDescription,
        sendDescription,
        status,
        date: new Date().toISOString().split('T')[0]
    });

    saveData();
    document.getElementById('repairForm').reset();
    repairError.textContent = '';
    updateTables();
}

function editRecord(index, logType) {
    const data = logType === 'sales' ? salesData[index] : repairsData[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editLogType').value = logType;
    document.getElementById('editSerialNumber').value = data.serialNumber;
    document.getElementById('editCompanyName').value = data.companyName;
    document.getElementById('editStatus').value = data.status;
    document.getElementById('editDate').value = data.date;

    // Show/hide fields based on log type
    document.getElementById('editAgentNameGroup').style.display = logType === 'sales' ? 'block' : 'none';
    document.getElementById('editCustomerNameGroup').style.display = logType === 'sales' ? 'block' : 'none';
    document.getElementById('editTelephoneGroup').style.display = logType === 'sales' ? 'block' : 'none';
    document.getElementById('editIssueDescriptionGroup').style.display = logType === 'repairs' ? 'block' : 'none';
    document.getElementById('editSendDescriptionGroup').style.display = logType === 'repairs' ? 'block' : 'none';

    if (logType === 'sales') {
        document.getElementById('editAgentName').value = data.agentName;
        document.getElementById('editCustomerName').value = data.customerName;
        document.getElementById('editTelephone').value = data.telephone;
    } else {
        document.getElementById('editIssueDescription').value = data.issueDescription;
        document.getElementById('editSendDescription').value = data.sendDescription;
    }

    // Clear any previous error messages in the modal
    const modalBody = document.getElementById('editModal').querySelector('.modal-body');
    const errorDiv = modalBody.querySelector('.error');
    if (errorDiv) errorDiv.remove();

    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

function saveEdit() {
    const index = parseInt(document.getElementById('editIndex').value);
    const logType = document.getElementById('editLogType').value;
    const newSerialNumber = document.getElementById('editSerialNumber').value.trim();
    const modalBody = document.getElementById('editModal').querySelector('.modal-body');
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));

    // Clear any previous error messages
    const errorDiv = modalBody.querySelector('.error');
    if (errorDiv) errorDiv.remove();

    if (logType === 'sales') {
        const originalSerialNumber = salesData[index].serialNumber;
        if (newSerialNumber !== originalSerialNumber && salesData.some((row, i) => i !== index && row.serialNumber === newSerialNumber)) {
            modalBody.insertAdjacentHTML('afterbegin', '<div class="error mb-3">Serial Number already exists.</div>');
            return;
        }

        salesData[index] = {
            serialNumber: newSerialNumber,
            companyName: document.getElementById('editCompanyName').value,
            agentName: document.getElementById('editAgentName').value,
            customerName: document.getElementById('editCustomerName').value,
            telephone: document.getElementById('editTelephone').value,
            status: document.getElementById('editStatus').value,
            date: document.getElementById('editDate').value
        };

        // Update related repairs if serial number changed
        if (newSerialNumber !== originalSerialNumber) {
            repairsData.forEach(repair => {
                if (repair.serialNumber === originalSerialNumber) {
                    repair.serialNumber = newSerialNumber;
                }
            });
        }
    } else {
        repairsData[index] = {
            serialNumber: newSerialNumber,
            companyName: document.getElementById('editCompanyName').value,
            issueDescription: document.getElementById('editIssueDescription').value,
            sendDescription: document.getElementById('editSendDescription').value,
            status: document.getElementById('editStatus').value,
            date: document.getElementById('editDate').value
        };
    }

    saveData();
    updateTables();
    updateCompanyFilter();
    editModal.hide();
}

function deleteRecord(index, logType) {
    if (!confirm(`Are you sure you want to delete this ${logType === 'sales' ? 'sale' : 'repair'} record?`)) {
        return;
    }

    if (logType === 'sales') {
        salesData.splice(index, 1);
    } else {
        repairsData.splice(index, 1);
    }

    saveData();
    updateTables();
    updateCompanyFilter();
}

function deleteSelectedSales() {
    const checkboxes = document.querySelectorAll('.sale-checkbox:checked');
    const deleteSalesSuccess = document.getElementById('deleteSalesSuccess');
    if (checkboxes.length === 0) {
        deleteSalesSuccess.textContent = 'No sales selected for deletion.';
        return;
    }

    if (!confirm(`Are you sure you want to delete ${checkboxes.length} selected sale${checkboxes.length > 1 ? 's' : ''}?`)) {
        return;
    }

    const indices = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index)).sort((a, b) => b - a);
    indices.forEach(index => salesData.splice(index, 1));

    saveData();
    deleteSalesSuccess.textContent = `Successfully deleted ${indices.length} sale${indices.length > 1 ? 's' : ''}.`;
    document.getElementById('selectAllSales').checked = false;
    document.getElementById('selectAllMessage').textContent = '';
    updateTables();
    updateCompanyFilter();
}

function showRelatedRepairs(serialNumber) {
    document.getElementById('searchSerial').value = serialNumber;
    updateTables();
    document.getElementById('repairsTableBody').scrollIntoView({ behavior: 'smooth' });
}

function showRelatedSale(serialNumber) {
    document.getElementById('searchSerial').value = serialNumber;
    updateTables();
    document.getElementById('salesTableBody').scrollIntoView({ behavior: 'smooth' });
}

function exportToExcel() {
    const combinedData = [
        ...salesData.map(row => ({ ...row, eventType: 'Sale', issueDescription: '', sendDescription: '' })),
        ...repairsData.map(row => ({
            serialNumber: row.serialNumber,
            companyName: row.companyName,
            agentName: '',
            customerName: '',
            telephone: '',
            eventType: 'Repair',
            issueDescription: row.issueDescription,
            sendDescription: row.sendDescription,
            status: row.status,
            date: row.date
        }))
    ];
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scale Records');
    XLSX.writeFile(workbook, 'scale_records.xlsx');
}

function downloadBackup() {
    try {
        const data = { salesData, repairsData };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scale_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('backupSuccess').textContent = 'Backup downloaded successfully. Save this file to sync data with other browsers.';
        document.getElementById('backupError').textContent = '';
    } catch (error) {
        console.error('Error downloading backup:', error);
        document.getElementById('backupError').textContent = 'Error downloading backup. Please try again.';
        document.getElementById('backupSuccess').textContent = '';
    }
}

function restoreData(event) {
    event.preventDefault();
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    const backupError = document.getElementById('backupError');
    const backupSuccess = document.getElementById('backupSuccess');

    if (!file) {
        backupError.textContent = 'Please select a JSON file.';
        backupSuccess.textContent = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.salesData || !data.repairsData) {
                throw new Error('Invalid backup format: Missing salesData or repairsData.');
            }

            // Validate sales data structure
            const requiredSaleFields = ['serialNumber', 'companyName', 'agentName', 'customerName', 'telephone', 'status', 'date'];
            const validSales = data.salesData.every(row => requiredSaleFields.every(field => field in row));
            if (!validSales) {
                throw new Error('Invalid sales data structure.');
            }

            // Validate repairs data structure
            const requiredRepairFields = ['serialNumber', 'companyName', 'issueDescription', 'sendDescription', 'status', 'date'];
            const validRepairs = data.repairsData.every(row => requiredRepairFields.every(field => field in row));
            if (!validRepairs) {
                throw new Error('Invalid repairs data structure.');
            }

            // Check for duplicate serial numbers in imported sales
            const importedSerials = new Set();
            const duplicates = [];
            data.salesData.forEach((row, index) => {
                if (importedSerials.has(row.serialNumber)) {
                    duplicates.push(`Duplicate serial number ${row.serialNumber} at index ${index}.`);
                }
                importedSerials.add(row.serialNumber);
            });

            // Check for conflicts with existing data
            const existingSerials = new Set(salesData.map(row => row.serialNumber));
            const conflicts = data.salesData.filter(row => existingSerials.has(row.serialNumber));
            if (duplicates.length > 0) {
                throw new Error(`Duplicate serial numbers in imported data: ${duplicates.join(' ')}`);
            }
            if (conflicts.length > 0 && !confirm(`The following serial numbers already exist: ${conflicts.map(row => row.serialNumber).join(', ')}. Overwrite existing data?`)) {
                backupError.textContent = 'Restore cancelled due to conflicting serial numbers.';
                backupSuccess.textContent = '';
                return;
            }

            // Merge or overwrite data
            if (conflicts.length > 0) {
                salesData = salesData.filter(row => !importedSerials.has(row.serialNumber)).concat(data.salesData);
            } else {
                salesData = data.salesData;
            }
            repairsData = data.repairsData;

            saveData();
            updateTables();
            updateCompanyFilter();
            backupSuccess.textContent = `Successfully restored ${salesData.length} sales and ${repairsData.length} repairs. Export a new backup after making changes to sync with other browsers.`;
            backupError.textContent = '';
            document.getElementById('restoreForm').reset();
        } catch (error) {
            console.error('Error restoring data:', error);
            backupError.textContent = `Error restoring data: ${error.message}`;
            backupSuccess.textContent = '';
        }
    };
    reader.onerror = function() {
        console.error('Error reading file:', reader.error);
        backupError.textContent = 'Error reading the JSON file. Please try again.';
        backupSuccess.textContent = '';
    };
    reader.readAsText(file);
}
