// Backend Student Import Script
// Run this script to import all students into the database

const studentsToImport = [
    { name: "Aleksandr Chwesik", barcode: "Aleksandr Chwesik" },
    { name: "Brooke Cotton", barcode: "Brooke Cotton" },
    { name: "Maxx McCarthy", barcode: "Maxx McCarthy" },
    { name: "Ella Puister", barcode: "Ella Puister" },
    { name: "Brianna Tyczka", barcode: "Brianna Tyczka" },
    { name: "Sarah Wolf", barcode: "Sarah Wolf" },
    { name: "Morgan Enser", barcode: "Morgan Enser" },
    { name: "Michael Johnson", barcode: "Michael Johnson" },
    { name: "Campbell Jones", barcode: "Campbell Jones" },
    { name: "Brayden Khork", barcode: "Brayden Khork" },
    { name: "Jessica Okoniewski", barcode: "Jessica Okoniewski" },
    { name: "Elena Rivera", barcode: "Elena Rivera" },
    { name: "Kaitlyn Watson", barcode: "Kaitlyn Watson" },
    { name: "Hailee Erny", barcode: "Hailee Erny" },
    { name: "Sara Garrett", barcode: "Sara Garrett" },
    { name: "Aubrey Hayes", barcode: "Aubrey Hayes" },
    { name: "Jack Kolarich", barcode: "Jack Kolarich" },
    { name: "Jayla Romeo", barcode: "Jayla Romeo" },
    { name: "Jade Sivertson", barcode: "Jade Sivertson" }
];

// Load existing students from localStorage
let existingStudents = JSON.parse(localStorage.getItem('students') || '[]');

let addedCount = 0;
let skippedCount = 0;

studentsToImport.forEach(student => {
    // Check if student already exists
    if (existingStudents.some(s => s.barcode === student.barcode)) {
        console.log(`⏭️  Skipped: ${student.name} (already exists)`);
        skippedCount++;
    } else {
        // Add new student
        existingStudents.push({
            name: student.name,
            barcode: student.barcode,
            email: '',
            photo: null,
            addedDate: new Date().toISOString()
        });
        console.log(`✅ Added: ${student.name}`);
        addedCount++;
    }
});

// Save back to localStorage
localStorage.setItem('students', JSON.stringify(existingStudents));

console.log('\n=== IMPORT COMPLETE ===');
console.log(`✅ Students added: ${addedCount}`);
console.log(`⏭️  Students skipped: ${skippedCount}`);
console.log(`📊 Total students in database: ${existingStudents.length}`);
console.log('\nRefresh the page to see the updated student list!');
