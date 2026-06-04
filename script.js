const subjects = ['Tamil', 'English', 'Maths', 'Science', 'Social Science'];
let students = JSON.parse(localStorage.getItem('students')) || [];
let deletedStudents = JSON.parse(localStorage.getItem('deletedStudents')) || [];

function displayStudents() {
    const tableContainer = document.getElementById('tableContainer');

    if (students.length === 0) {
        tableContainer.innerHTML = '<div class="empty-message">No students added yet. Add a student to get started!</div>';
        document.getElementById('statsContainer').innerHTML = '';
        return;
    }

    students.sort((a, b) => b.average - a.average);

    let tableHTML = `
        <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Tamil</th>
                    <th>English</th>
                    <th>Maths</th>
                    <th>Science</th>
                    <th>Social Science</th>
                    <th>Total Score</th>
                    <th>Average</th>
                    <th>Grade</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    students.forEach((student, index) => {
        const grade = getGrade(student.average);
        const totalScore = student.tamil + student.english + student.maths + student.science + student.socialscience;
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${student.rollNo || '-'}</strong></td>
                <td>${student.name}</td>
                <td><span class="subject-score">${student.tamil}</span></td>
                <td><span class="subject-score">${student.english}</span></td>
                <td><span class="subject-score">${student.maths}</span></td>
                <td><span class="subject-score">${student.science}</span></td>
                <td><span class="subject-score">${student.socialscience}</span></td>
                <td><strong style="color: #667eea; font-size: 1.1rem;">${totalScore}/500</strong></td>
                <td><strong>${student.average.toFixed(2)}</strong></td>
                <td><span class="grade grade-${grade.toLowerCase()}">${grade}</span></td>
                <td><button class="delete-btn" onclick="deleteStudent('${student.id}')">Delete</button></td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table></div>';
    tableContainer.innerHTML = tableHTML;

    displayStats();
}

function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

function displayStats() {
    const statsContainer = document.getElementById('statsContainer');
    const averages = students.map(s => s.average);
    const overallAverage = averages.reduce((a, b) => a + b, 0) / averages.length;
    const highest = Math.max(...averages);
    const lowest = Math.min(...averages);

    statsContainer.innerHTML = `
        <div class="stats">
            <div class="stat-card">
                <h3>Total Students</h3>
                <div class="value">${students.length}</div>
            </div>
            <div class="stat-card">
                <h3>Class Average</h3>
                <div class="value">${overallAverage.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Highest Average</h3>
                <div class="value">${highest.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Lowest Average</h3>
                <div class="value">${lowest.toFixed(2)}</div>
            </div>
        </div>
    `;
}

function addStudent() {
    const rollNo = document.getElementById('rollNo').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const tamil = parseFloat(document.getElementById('tamil').value);
    const english = parseFloat(document.getElementById('english').value);
    const maths = parseFloat(document.getElementById('maths').value);
    const science = parseFloat(document.getElementById('science').value);
    const socialscience = parseFloat(document.getElementById('socialscience').value);

    if (!rollNo) {
        alert('Please enter Roll Number');
        return;
    }

    if (students.some(s => s.rollNo && s.rollNo.toLowerCase() === rollNo.toLowerCase())) {
        alert('Roll Number already exists!');
        return;
    }

    if (!name) {
        alert('Please enter student name');
        return;
    }

    if (isNaN(tamil) || isNaN(english) || isNaN(maths) || isNaN(science) || isNaN(socialscience)) {
        alert('Please enter scores for all subjects (0-100)');
        return;
    }

    if (tamil < 0 || tamil > 100 || english < 0 || english > 100 ||
        maths < 0 || maths > 100 || science < 0 || science > 100 ||
        socialscience < 0 || socialscience > 100) {
        alert('Scores must be between 0-100');
        return;
    }

    const average = (tamil + english + maths + science + socialscience) / 5;

    const student = {
        id: Date.now().toString(),
        rollNo,
        name,
        tamil,
        english,
        maths,
        science,
        socialscience,
        average
    };

    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));

    document.getElementById('rollNo').value = '';
    document.getElementById('studentName').value = '';
    document.getElementById('tamil').value = '';
    document.getElementById('english').value = '';
    document.getElementById('maths').value = '';
    document.getElementById('science').value = '';
    document.getElementById('socialscience').value = '';

    displayStudents();
}

function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        deletedStudents.push(student);
        localStorage.setItem('deletedStudents', JSON.stringify(deletedStudents));
    }
    students = students.filter(s => s.id !== id);
    localStorage.setItem('students', JSON.stringify(students));
    displayStudents();
}

function exportAsCSV() {
    if (students.length === 0) {
        alert('No data to export!');
        return;
    }

    let csv = 'Rank,Roll No,Name,Tamil,English,Maths,Science,Social Science,Total Score,Average,Grade\n';

    students.forEach((student, index) => {
        const grade = getGrade(student.average);
        const totalScore = student.tamil + student.english + student.maths + student.science + student.socialscience;
        csv += `${index + 1},"${student.rollNo || '-'}","${student.name}",${student.tamil},${student.english},${student.maths},${student.science},${student.socialscience},${totalScore},${student.average.toFixed(2)},${grade}\n`;
    });

    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('fileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            if (!Array.isArray(importedData)) {
                alert('Invalid file format. Please select a valid JSON file.');
                return;
            }

            students = importedData;
            localStorage.setItem('students', JSON.stringify(students));
            displayStudents();
            alert('Data imported successfully!');
            document.getElementById('fileInput').value = '';
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (students.length === 0) {
        alert('No data to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete all student data? This cannot be undone.')) {
        students = [];
        localStorage.removeItem('students');
        displayStudents();
        alert('All data cleared!');
    }
}

function showDeletedData() {
    const modal = document.getElementById('deletedModal');
    const deletedList = document.getElementById('deletedList');

    if (deletedStudents.length === 0) {
        deletedList.innerHTML = '<div class="empty-trash">🗑️ No deleted data to recover</div>';
    } else {
        let html = '';
        deletedStudents.forEach(student => {
            const totalScore = student.tamil + student.english + student.maths + student.science + student.socialscience;
            const grade = getGrade(student.average);
            html += `
                <div class="deleted-item">
                    <p><strong>${student.name} ${student.rollNo ? `(Roll No: ${student.rollNo})` : ''}</strong></p>
                    <p>Total Score: ${totalScore}/500 | Average: ${student.average.toFixed(2)} | Grade: ${grade}</p>
                    <div class="deleted-item-actions">
                        <button class="recover-btn" onclick="recoverStudent('${student.id}')">✓ Recover</button>
                        <button class="permanent-delete-btn" onclick="permanentlyDelete('${student.id}')">✕ Delete Permanently</button>
                    </div>
                </div>
            `;
        });
        deletedList.innerHTML = html;
    }
    modal.style.display = 'block';
}

function closeDeletedModal() {
    document.getElementById('deletedModal').style.display = 'none';
}

function recoverStudent(id) {
    const student = deletedStudents.find(s => s.id === id);
    if (student) {
        students.push(student);
        localStorage.setItem('students', JSON.stringify(students));
        deletedStudents = deletedStudents.filter(s => s.id !== id);
        localStorage.setItem('deletedStudents', JSON.stringify(deletedStudents));
        displayStudents();
        showDeletedData();
        alert(`${student.name} recovered successfully!`);
    }
}

function permanentlyDelete(id) {
    if (confirm('Are you sure? This cannot be undone.')) {
        deletedStudents = deletedStudents.filter(s => s.id !== id);
        localStorage.setItem('deletedStudents', JSON.stringify(deletedStudents));
        showDeletedData();
        alert('Student permanently deleted!');
    }
}

window.onclick = (event) => {
    const modal = document.getElementById('deletedModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Expose functions to window scope for HTML inline handlers
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
window.exportAsCSV = exportAsCSV;
window.importData = importData;
window.handleFileImport = handleFileImport;
window.clearAllData = clearAllData;
window.showDeletedData = showDeletedData;
window.closeDeletedModal = closeDeletedModal;
window.recoverStudent = recoverStudent;
window.permanentlyDelete = permanentlyDelete;

// Display students on page load
displayStudents();

// Allow Enter key to add student
document.getElementById('socialscience').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addStudent();
});
