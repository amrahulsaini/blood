const mysql = require('mysql2/promise');

async function checkAge() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blood_donation'
  });

  try {
    // Check table structure
    console.log('\n=== TABLE STRUCTURE ===');
    const [columns] = await connection.execute('DESCRIBE blood_requests');
    console.log('Columns in blood_requests table:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    // Check if age column exists
    const hasAge = columns.some(col => col.Field === 'age');
    console.log(`\nAge column exists: ${hasAge ? 'YES ✓' : 'NO ✗'}`);

    if (!hasAge) {
      console.log('\n⚠️  You need to run this SQL command:');
      console.log('ALTER TABLE blood_requests ADD COLUMN age INT NOT NULL DEFAULT 0 AFTER blood_group;');
    }

    // Check actual data
    console.log('\n=== SAMPLE DATA ===');
    const [rows] = await connection.execute(
      'SELECT id, patient_name, blood_group' + (hasAge ? ', age' : '') + ' FROM blood_requests ORDER BY created_at DESC LIMIT 3'
    );
    console.log('Recent blood requests:');
    console.table(rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAge();
