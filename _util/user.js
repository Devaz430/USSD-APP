

var sqlite3 = require('sqlite3');
const { resolve } = require('url');
 var db = new sqlite3.Database('ahadu.db');
   db.serialize( async function()  {
  // Create a table
   db.run("CREATE TABLE IF NOT EXISTS ussdCustomer (id INTEGER PRIMARY KEY, mobile TEXT  NOT NULL UNIQUE,customerName TEXT,mpin TEXT,city TEXT, status TEXT DEFAULT false)");
   db.run("CREATE TABLE IF NOT EXISTS userAccount (id INTEGER PRIMARY KEY, mobile TEXT  NOT NULL,customerNo TEXT,customerName TEXT ,accountNumber TEXT, status TEXT DEFAULT 0)");
   db.run("CREATE TABLE IF NOT EXISTS balanceInquery (id INTEGER PRIMARY KEY, mobile TEXT  NOT NULL ,AccountHolderName TEXT, AvailableBalance TEXT, Currency TEXT)");
   db.run("CREATE TABLE IF NOT EXISTS ministatment (id INTEGER PRIMARY KEY, mobile TEXT  NOT NULL ,TransactionDate TEXT, TransactionCreditAmount TEXT, TransactionDebitAmount TEXT)");
   db.run("CREATE TABLE IF NOT EXISTS member (id INTEGER PRIMARY KEY, mobile TEXT  NOT NULL UNIQUE, status TEXT)");
  



       try {
      let query2 = `SELECT * FROM userAccount`;
      let member = await new Promise((resolve,reject) =>{
                db.all(query2,[],(err,rows)=> {
                  if(err) reject(err)
                    resolve(rows)
                })
      })
     
    } catch (error) {
     
    }
   


 });
module.exports = db;
