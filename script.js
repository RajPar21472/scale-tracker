// Simulated CSV data
const initialSales = [
    { serialNumber: "SN001", companyName: "TeaCo", agentName: "John Doe", customerName: "Jane Smith", telephone: "1234567890", status: "Deployed", date: "2025-01-15" },
    { serialNumber: "SN002", companyName: "GreenLeaf", agentName: "Alice Brown", customerName: "Bob Wilson", telephone: "0987654321", status: "Deployed", date: "2025-02-20" },
];

const initialRepairs = [
    { serialNumber: "SN001", companyName: "TeaCo", issueDescription: "Calibration issue", sendDescription: "", status: "Under Repair", date: "2025-03-10" },
];

let salesData = [...initialSales];
let repairsData = [...initialRepairs];

// Load data and initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTables();
    updateCompanyFilter();
    document.getElementById('searchSerial').addEventListener('input', updateTables);
    document.getElementById('filterCompany').addEventListener('change', updateTables);
    document.getElementById('filterStatus').addEventListener('change', updateTables);
    document.getElementById('saleForm').addEventListener('submit', addSale);
    document.getElementById('repairForm').addEventListener('submit', addRepair);
});

function updateTables() {
    const searchSerial = document.getElementById('searchSerial').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;

    // Update Sales Table
    const salesTbody = document.getElementById('salesTableBody');
    salesTbody.innerHTML = '';
    salesData.forEach((row, index) => {
        if ((searchSerial === '' || row.serialNumber.toLowerCase().includes(searchSerial)) &&
            (filterCompany === '' || row.companyName === filterCompany) &&
            (filterStatus === '' || row.status === filterStatus)) {
            const tr = document.createElement('tr');
            tr.className = `status-${row.status.toLowerCase().replace(' ', '-')}`;
            tr.innerHTML = `
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

function addSale(event) {
    event.preventDefault();
    const serialNumber = document.getElementById('serialNumber').value;
    const companyName = document.getElementById('companyName').value;
    const agentName = document.getElementById('agentName').value;
    const customerName = document.getElementById('customerName').value;
    const telephone = document.getElementById('telephone').value;
    const saleError = document.getElementById('saleError');

    if (salesData.some(row => row.serialNumber === serialNumber)) {
        saleError.textContent = 'Serial Number already exists for a sale.';
        return;
    }

    salesData.push({
        serialNumber,
        companyName,
        agentName,
        customerName,
        telephone,
        status: 'Deployed',
        date: new Date().toISOString().split('T')[0]
    });

    document.getElementById('saleForm').reset();
    saleError.textContent = '';
    updateTables();
    updateCompanyFilter();
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

    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

function saveEdit() {
    const index = document.getElementById('editIndex').value;
    const logType = document.getElementById('editLogType').value;

    if (logType === 'sales') {
        salesData[index] = {
            serialNumber: document.getElementById('editSerialNumber').value,
            companyName: document.getElementById('editCompanyName').value,
            agentName: document.getElementById('editAgentName').value,
            customerName: document.getElementById('editCustomerName').value,
            telephone: document.getElementById('editTelephone').value,
            status: document.getElementById('editStatus').value,
            date: document.getElementById('editDate').value
        };
    } else {
        repairsData[index] = {
            serialNumber: document.getElementById('editSerialNumber').value,
            companyName: document.getElementById('editCompanyName').value,
            issueDescription: document.getElementById('editIssueDescription').value,
            sendDescription: document.getElementById('editSendDescription').value,
            status: document.getElementById('editStatus').value,
            date: document.getElementById('editDate').value
        };
    }

    updateTables();
    updateCompanyFilter();
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
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