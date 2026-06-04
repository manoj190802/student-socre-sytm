'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function StudentScoreSystem() {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);

  // Form Fields State
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [tamil, setTamil] = useState('');
  const [english, setEnglish] = useState('');
  const [maths, setMaths] = useState('');
  const [science, setScience] = useState('');
  const [socialscience, setSocialScience] = useState('');

  // Modal State
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // File Input Ref
  const fileInputRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const localStudents = localStorage.getItem('students');
    if (localStudents) {
      try {
        setStudents(JSON.parse(localStudents));
      } catch (e) {
        console.error('Error parsing students', e);
      }
    }
    const localDeleted = localStorage.getItem('deletedStudents');
    if (localDeleted) {
      try {
        setDeletedStudents(JSON.parse(localDeleted));
      } catch (e) {
        console.error('Error parsing deletedStudents', e);
      }
    }
  }, []);

  // Save to localStorage when state changes
  const saveStudents = (newStudents) => {
    setStudents(newStudents);
    localStorage.setItem('students', JSON.stringify(newStudents));
  };

  const saveDeletedStudents = (newDeleted) => {
    setDeletedStudents(newDeleted);
    localStorage.setItem('deletedStudents', JSON.stringify(newDeleted));
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getSubjectScoreClass = (score) => {
    if (score >= 90) return 'subject-score excellent';
    if (score >= 75) return 'subject-score good';
    if (score >= 50) return 'subject-score average';
    return 'subject-score poor';
  };

  const addStudent = () => {
    const trimmedRoll = rollNo.trim();
    const trimmedName = name.trim();
    const tScore = parseFloat(tamil);
    const eScore = parseFloat(english);
    const mScore = parseFloat(maths);
    const sScore = parseFloat(science);
    const ssScore = parseFloat(socialscience);

    if (!trimmedRoll) {
      alert('Please enter Roll Number');
      return;
    }

    if (students.some(s => s.rollNo && s.rollNo.toLowerCase() === trimmedRoll.toLowerCase())) {
      alert('Roll Number already exists!');
      return;
    }

    if (!trimmedName) {
      alert('Please enter student name');
      return;
    }

    if (isNaN(tScore) || isNaN(eScore) || isNaN(mScore) || isNaN(sScore) || isNaN(ssScore)) {
      alert('Please enter scores for all subjects (0-100)');
      return;
    }

    if (tScore < 0 || tScore > 100 || eScore < 0 || eScore > 100 ||
        mScore < 0 || mScore > 100 || sScore < 0 || sScore > 100 ||
        ssScore < 0 || ssScore > 100) {
      alert('Scores must be between 0-100');
      return;
    }

    const average = (tScore + eScore + mScore + sScore + ssScore) / 5;

    const newStudent = {
      id: Date.now().toString(),
      rollNo: trimmedRoll,
      name: trimmedName,
      tamil: tScore,
      english: eScore,
      maths: mScore,
      science: sScore,
      socialscience: ssScore,
      average
    };

    const updatedStudents = [...students, newStudent];
    saveStudents(updatedStudents);

    // Reset Form
    setRollNo('');
    setName('');
    setTamil('');
    setEnglish('');
    setMaths('');
    setScience('');
    setSocialScience('');
  };

  const deleteStudent = (id) => {
    const studentToDelete = students.find(s => s.id === id);
    if (studentToDelete) {
      const updatedDeleted = [...deletedStudents, studentToDelete];
      saveDeletedStudents(updatedDeleted);
    }
    const updatedStudents = students.filter(s => s.id !== id);
    saveStudents(updatedStudents);
  };

  const clearAllData = () => {
    if (students.length === 0) {
      alert('No data to clear!');
      return;
    }

    if (confirm('Are you sure you want to delete all student data? This cannot be undone.')) {
      saveStudents([]);
      alert('All data cleared!');
    }
  };


  const exportAsCSV = () => {
    if (students.length === 0) {
      alert('No data to export!');
      return;
    }

    let csv = 'Rank,Roll No,Name,Tamil,English,Maths,Science,Social Science,Total Score,Average,Grade\n';

    const sorted = [...students].sort((a, b) => b.average - a.average);
    sorted.forEach((student, index) => {
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
  };

  const importData = () => {
    fileInputRef.current.click();
  };

  const handleFileImport = (event) => {
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

        saveStudents(importedData);
        alert('Data imported successfully!');
        fileInputRef.current.value = '';
      } catch (error) {
        alert('Error reading file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const recoverStudent = (id) => {
    const studentToRecover = deletedStudents.find(s => s.id === id);
    if (studentToRecover) {
      const updatedStudents = [...students, studentToRecover];
      saveStudents(updatedStudents);

      const updatedDeleted = deletedStudents.filter(s => s.id !== id);
      saveDeletedStudents(updatedDeleted);
      alert(`${studentToRecover.name} recovered successfully!`);
    }
  };

  const permanentlyDelete = (id) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      const updatedDeleted = deletedStudents.filter(s => s.id !== id);
      saveDeletedStudents(updatedDeleted);
      alert('Student permanently deleted!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addStudent();
    }
  };

  // Stats Calculations
  const sortedStudents = [...students].sort((a, b) => b.average - a.average);
  const averages = students.map(s => s.average);
  const overallAverage = averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
  const highest = averages.length > 0 ? Math.max(...averages) : 0;
  const lowest = averages.length > 0 ? Math.min(...averages) : 0;

  return (
    <div className="container">
      <header>
        <h1>📚 Student Score System</h1>
        <p>Manage student scores across 5 subjects</p>
      </header>

      <div className="content">
        <div className="form-section">
          <div className="form-group">
            <input
              type="text"
              id="rollNo"
              placeholder="Roll No"
              style={{ maxWidth: '150px' }}
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
            <input
              type="text"
              id="studentName"
              placeholder="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="subjects-row">
            <div className="form-group">
              <label htmlFor="tamil">Tamil:</label>
              <input
                type="number"
                id="tamil"
                placeholder="Score"
                min="0"
                max="100"
                value={tamil}
                onChange={(e) => setTamil(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="english">English:</label>
              <input
                type="number"
                id="english"
                placeholder="Score"
                min="0"
                max="100"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="maths">Maths:</label>
              <input
                type="number"
                id="maths"
                placeholder="Score"
                min="0"
                max="100"
                value={maths}
                onChange={(e) => setMaths(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="science">Science:</label>
              <input
                type="number"
                id="science"
                placeholder="Score"
                min="0"
                max="100"
                value={science}
                onChange={(e) => setScience(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="socialscience">Social Science:</label>
              <input
                type="number"
                id="socialscience"
                placeholder="Score"
                min="0"
                max="100"
                value={socialscience}
                onChange={(e) => setSocialScience(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          <div className="form-group">
            <button onClick={addStudent}>Add Student</button>
            <button onClick={exportAsCSV} style={{ background: '#ff9800' }}>Export CSV</button>
            <button onClick={importData} style={{ background: '#2196f3' }}>Import Data</button>
            <button onClick={() => setShowDeletedModal(true)} style={{ background: '#9c27b0' }}>🗑️ Recover Deleted</button>
            <button onClick={clearAllData} style={{ background: '#d32f2f' }}>Clear All</button>
            <input
              type="file"
              id="fileInput"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileImport}
            />
          </div>
        </div>

        <div id="tableContainer">
          {sortedStudents.length === 0 ? (
            <div className="empty-message">No students added yet. Add a student to get started!</div>
          ) : (
            <div className="table-wrapper">
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
                  {sortedStudents.map((student, index) => {
                    const grade = getGrade(student.average);
                    const totalScore = student.tamil + student.english + student.maths + student.science + student.socialscience;
                    return (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td><strong>{student.rollNo || '-'}</strong></td>
                        <td>{student.name}</td>
                        <td><span className={getSubjectScoreClass(student.tamil)}>{student.tamil}</span></td>
                        <td><span className={getSubjectScoreClass(student.english)}>{student.english}</span></td>
                        <td><span className={getSubjectScoreClass(student.maths)}>{student.maths}</span></td>
                        <td><span className={getSubjectScoreClass(student.science)}>{student.science}</span></td>
                        <td><span className={getSubjectScoreClass(student.socialscience)}>{student.socialscience}</span></td>
                        <td><strong style={{ color: '#667eea', fontSize: '1.1rem' }}>{totalScore}/500</strong></td>
                        <td><strong>{student.average.toFixed(2)}</strong></td>
                        <td><span className={`grade grade-${grade.toLowerCase()}`}>{grade}</span></td>
                        <td>
                          <button className="delete-btn" onClick={() => deleteStudent(student.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div id="statsContainer">
            <div className="stats">
              <div className="stat-card">
                <h3>Total Students</h3>
                <div className="value">{students.length}</div>
              </div>
              <div className="stat-card">
                <h3>Class Average</h3>
                <div className="value">{overallAverage.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <h3>Highest Average</h3>
                <div className="value">{highest.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <h3>Lowest Average</h3>
                <div className="value">{lowest.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deleted Data Modal */}
      {showDeletedModal && (
        <div className="modal" style={{ display: 'block' }} onClick={() => setShowDeletedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Recovered Data</h2>
              <button className="close-btn" onClick={() => setShowDeletedModal(false)}>&times;</button>
            </div>
            <div id="deletedList">
              {deletedStudents.length === 0 ? (
                <div className="empty-trash">🗑️ No deleted data to recover</div>
              ) : (
                deletedStudents.map((student) => {
                  const totalScore = student.tamil + student.english + student.maths + student.science + student.socialscience;
                  const grade = getGrade(student.average);
                  return (
                    <div className="deleted-item" key={student.id}>
                      <p><strong>{student.name} {student.rollNo ? `(Roll No: ${student.rollNo})` : ''}</strong></p>
                      <p>Total Score: {totalScore}/500 | Average: {student.average.toFixed(2)} | Grade: {grade}</p>
                      <div className="deleted-item-actions">
                        <button className="recover-btn" onClick={() => recoverStudent(student.id)}>✓ Recover</button>
                        <button className="permanent-delete-btn" onClick={() => permanentlyDelete(student.id)}>✕ Delete Permanently</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
