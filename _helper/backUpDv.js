// const sqlite3 = require('sqlite3').verbose();
// const mysql = require('mysql2/promise');

// (async function migrate() {
//   // SQLite connection
//   const sqliteDb = new sqlite3.Database('C:/projects/ahadu_ussd/ahadu.dbcopy.bac'); // Ensure correct path

//   // MySQL connection
//   const mysqlDb = await mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Root@123',
//     database: 'onesms',
//   });

//   // Function to fetch data from SQLite
//   function fetchDataFromSQLite(query) {
//     return new Promise((resolve, reject) => {
//       sqliteDb.all(query, [], (err, rows) => {
//         if (err) return reject(err);
//         resolve(rows);
//       });
//     });
//   }

//   // Function to insert data into MySQL
//   async function insertDataToMySQL(tableName, rows) {
//     if (rows.length === 0) return;

//     const keys = Object.keys(rows[0]);
//     const placeholders = keys.map(() => '?').join(', ');
//     const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

//     const values = rows.map(row => Object.values(row));

//     try {
//       await mysqlDb.query('START TRANSACTION');
//       for (const value of values) {
//         await mysqlDb.query(sql, value);
//       }
//       await mysqlDb.query('COMMIT');
//     } catch (err) {
//       await mysqlDb.query('ROLLBACK');
//       throw err;
//     }
//   }

//   try {
//     // List tables to confirm the database structure
//     const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table';";
//     const tables = await fetchDataFromSQLite(tablesQuery);
//     console.log('Tables in SQLite database:', tables);

//     const sqliteQuery = 'SELECT * FROM userAccount'; // Your query
//     const rows = await fetchDataFromSQLite(sqliteQuery);
//     console.log(`Fetched ${rows.length} rows from SQLite`);

//     // Uncomment the following to insert data into MySQL
//      await insertDataToMySQL('userAccount', rows);

//     console.log('Migration completed successfully!');
//   } catch (err) {
//     console.error('Error during migration:', err);
//   } finally {
//     sqliteDb.close();
//     await mysqlDb.end();
//   }
// })();
// CREATE TABLE IF NOT EXISTS userAccount (
//     id INT PRIMARY KEY,
//     mobile VARCHAR(255) NOT NULL,
//     customerNo VARCHAR(255),
//     customerName VARCHAR(255),
//     accountNumber VARCHAR(255),
//     status VARCHAR(255) DEFAULT '0'
// );

// const sqlite3 = require('sqlite3').verbose();
// const mysql = require('mysql2/promise');

// // Batch size (number of rows per batch)
// const BATCH_SIZE = 1000;

// (async function migrate() {
//   // SQLite connection
//   const sqliteDb = new sqlite3.Database('C:/projects/ahadu_ussd/ahadu.dbcopy.bac'); // Ensure correct path

//   // MySQL connection
//   const mysqlDb = await mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Root@123',
//     database: 'onesms',
//   });

//   // Function to fetch data from SQLite with limit and offset
//   function fetchDataFromSQLite(query, limit, offset) {
//     return new Promise((resolve, reject) => {
//       sqliteDb.all(query + ` LIMIT ${limit} OFFSET ${offset}`, [], (err, rows) => {
//         if (err) return reject(err);
//         resolve(rows);
//       });
//     });
//   }

//   // Function to insert a batch of data into MySQL
//   async function insertDataToMySQL(tableName, rows) {
//     if (rows.length === 0) return;

//     const keys = Object.keys(rows[0]);
//     const placeholders = keys.map(() => '?').join(', ');
//     const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

//     const values = rows.map(row => Object.values(row));

//     try {
//       await mysqlDb.query('START TRANSACTION');
//       for (const value of values) {
//         await mysqlDb.query(sql, value);
//       }
//       await mysqlDb.query('COMMIT');
//     } catch (err) {
//       await mysqlDb.query('ROLLBACK');
//       throw err;
//     }
//   }

//   try {
//     // List tables in SQLite database
//     const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table';";
//     const tables = await fetchDataFromSQLite(tablesQuery);
//     console.log('Tables in SQLite database:', tables);

//     // Loop through each table
//     for (const table of tables) {
//       const tableName = table.name;

//       console.log(`Migrating data for table: ${tableName}`);

//       // First, get the total number of rows in the SQLite table
//       const countQuery = `SELECT COUNT(*) AS count FROM ${tableName}`;
//       const countRows = await fetchDataFromSQLite(countQuery);
//       const totalRows = countRows[0].count;
//       console.log(`Total rows in ${tableName}: ${totalRows}`);

//       // Process the rows in batches
//       for (let offset = 0; offset < totalRows; offset += BATCH_SIZE) {
//         const rows = await fetchDataFromSQLite(`SELECT * FROM ${tableName}`, BATCH_SIZE, offset);
//         console.log(`Fetched ${rows.length} rows from SQLite for table: ${tableName} (Offset: ${offset})`);

//         // Insert the fetched batch into MySQL
//         await insertDataToMySQL(tableName, rows);
//         console.log(`Inserted ${rows.length} rows into MySQL table: ${tableName} (Offset: ${offset})`);
//       }
//     }

//     console.log('Migration completed successfully!');
//   } catch (err) {
//     console.error('Error during migration:', err);
//   } finally {
//     sqliteDb.close();
//     await mysqlDb.end();
//   }
// })();

const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');

(async function migrate() {
  // SQLite connection
  const sqliteDb = new sqlite3.Database('C:/projects/ahadu_ussd/ahadu.dbcopy.bac'); 

  // MySQL connection
  const mysqlDb = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@123',
    database: 'onesms',
  });

  // Function to fetch table schemas from SQLite
  async function getSQLiteTableSchema(tableName) {
    return new Promise((resolve, reject) => {
      sqliteDb.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`, [], (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.sql : null);
      });
    });
  }

  // Function to convert SQLite schema to MySQL schema
  function convertSQLiteToMySQL(createTableSQL) {
    // Basic conversions for data types
    let mysqlSQL = createTableSQL
      .replace(/\bTEXT\b/g, 'VARCHAR(255)')
      .replace(/\bINTEGER\b/g, 'INT')
      .replace(/\bAUTOINCREMENT\b/g, 'AUTO_INCREMENT')
      .replace(/\bBOOLEAN\b/g, 'TINYINT(1)')
      .replace(/DEFAULT 0/g, "DEFAULT '0'")
      .replace(/'0'/g, "'0'") // Ensure that default values are properly quoted for string types
      .replace(/INTEGER PRIMARY KEY/g, 'INT PRIMARY KEY AUTO_INCREMENT'); // If using integer primary keys

    // Ensure `CREATE TABLE IF NOT EXISTS`
    mysqlSQL = mysqlSQL.replace(/^CREATE TABLE/, 'CREATE TABLE IF NOT EXISTS');

    return mysqlSQL;
  }

  // Function to create the table in MySQL if it doesn't exist
  async function createTableInMySQL(tableName, createTableSQL) {
    const mysqlSQL = convertSQLiteToMySQL(createTableSQL);
    try {
      await mysqlDb.query(mysqlSQL);
      console.log(`Table ${tableName} created or already exists in MySQL.`);
    } catch (err) {
      console.error(`Error creating table ${tableName}:`, err);
    }
  }

  // Function to fetch data from SQLite
  function fetchDataFromSQLite(query) {
    return new Promise((resolve, reject) => {
      sqliteDb.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Function to insert data into MySQL
  async function insertDataToMySQL(tableName, rows) {
    if (rows.length === 0) return;

    const keys = Object.keys(rows[0]);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

    const values = rows.map(row => Object.values(row));

    try {
      await mysqlDb.query('START TRANSACTION');
      for (const value of values) {
        await mysqlDb.query(sql, value);
      }
      await mysqlDb.query('COMMIT');
    } catch (err) {
      await mysqlDb.query('ROLLBACK');
      throw err;
    }
  }

  try {
    // List tables in SQLite database
    const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table';";
    const tables = await fetchDataFromSQLite(tablesQuery);
    console.log('Tables in SQLite database:', tables);

    // Loop through each table
    for (const table of tables) {
      const tableName = table.name;

      console.log(`Migrating data for table: ${tableName}`);

      // Step 1: Get the schema of the SQLite table
      const sqliteTableSchema = await getSQLiteTableSchema(tableName);
      if (sqliteTableSchema) {
        // Step 2: Create the table in MySQL if it doesn't exist
        await createTableInMySQL(tableName, sqliteTableSchema);

        // Step 3: Fetch data from SQLite and insert it into MySQL
        const rows = await fetchDataFromSQLite(`SELECT * FROM ${tableName}`);
        console.log(`Fetched ${rows.length} rows from SQLite for table: ${tableName}`);

        // Insert the fetched data into MySQL
        await insertDataToMySQL(tableName, rows);
        console.log(`Inserted ${rows.length} rows into MySQL table: ${tableName}`);
      } else {
        console.log(`Table ${tableName} does not exist in SQLite.`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    sqliteDb.close();
    await mysqlDb.end();
  }
})();
// check for last update and update the mysql db
// reschedule backup

// Goes to dahsboard
// if new welcome.notregister -> registerAction -> myAccount -> homeservice