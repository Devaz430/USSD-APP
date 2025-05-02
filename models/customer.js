var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("../ussd")
, db = require("../_util/user")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, log =ussd.log
, http =ussd.http

exports.deleteCustomerMobile= async function(mobile){

    try {
        let status;
        let query = `delete FROM userAccount where mobile=${mobile}`;
        let customerRecord = await new Promise((resolve,reject) =>{
                  db.all(query,[],(err,rows)=> {
                    if(err) reject(err)
                    console.log(rows);
                      resolve(rows)
                  })
                 
        })
        return  {"data": 'Record Deleted sucessfully!',"status" : status}
      } catch (error) {
        return  {"data": null,"status" : status}
       
      }
} 
exports.customerInformation= async function(mobile){
    let status;

    try {
        let query = `SELECT * FROM userAccount where mobile=${mobile}`;
        let customerRecord = await new Promise((resolve,reject) =>{
                  db.all(query,[],(err,rows)=> {
                    if(err) reject(err)
                    console.log(rows);
                      resolve(rows)
                  })
                 
        })
        if(customerRecord.length >= 1){
            status = 0
        }else {
            status = null
        }
        return  {"data": customerRecord,"status" : status}
      } catch (error) {
        return  {"data": null,"status" : status}
       
      }
} 
exports.userAccount= async function(mobile){

    try {
        let status;
        let query = `SELECT * FROM ussdCustomer where mobile=${mobile}`;
        let customerRecord = await new Promise((resolve,reject) =>{
                  db.get(query,[],(err,rows)=> {
                    if(err) reject(err)
                    console.log(rows);
                      resolve(rows)
                  })
                 
        })
        if(customerRecord){
            status = 0
        }else {
            status = null
        }
        return  {"data": customerRecord ,"status" : status }
      } catch (error) {
        console.log(error);
        return  {"data": null,"status" : status}
       
      }
} 
exports.registerCustomer= async function(mobile,customerName,city){
	try {
        let status = 'NOACCOUNT'
            let record =db.run("INSERT INTO ussdCustomer (mobile, customerName,city,status) VALUES (?,?,?,?)",[mobile, customerName, city,status],function(err, row) {
                                if(err) { 
                                return null
                                }else{
                                    return row
                                }
                        })
                        return {'record' : record,"status" : record.status}
	}catch(e) {
        console.log(e);
        return {'record' : null,"status" : null}
    }
	
}
exports.getRegisterCustomer= async function(mobile){

    try {
        let status;
        let query = `SELECT * FROM ussdCustomer where mobile=${mobile}`;
        let customerRecord = await new Promise((resolve,reject) =>{
                  db.all(query,[],(err,rows)=> {
                    if(err) reject(err)
                      resolve(rows)
                  })
                 
        })
        if(customerRecord.length >= 1){
            status = 0
        }else {
            status = null
        }
        return  {"data": customerRecord,"status" : status}
      } catch (error) {
        return  {"data": null,"status" : error}
       
      }
} 
exports.registerAccount= async function(mobile,accountNumber,customerId,status){
	try {
            let record =db.run("INSERT INTO userAccount (mobile, accountNumber,customerId,status) VALUES (?,?,?)",[mobile, accountNumber,customerId,status],function(err, row) {
                                if(err) { 
                                return null
                                }else{
                                    return row
                                }
                        })
                        return {'record' : record,"status" : record.status}
	}catch(e) {
        console.log(e);
        return {'record' : null,"status" : null}
    }
	
} 
exports.getCustomerAccount= async function(mobile){
    let acc= '122345'
        let query =`SELECT * FROM userAccount where mobile=${mobile}`
       try {
        let customer = await new Promise((resolve,reject) =>{
                    db.all(query,[],(err,rows)=> {
                        console.log(err);
                    if(err) reject(err)
                    console.log(rows);
                        resolve(rows)
                    })
        })
        return customer
    } catch (error) {
        console.log(error);
        return null
      
    }
}

exports.linkAccount= async function(mobile,customerName,customerId,accountNumber){

    let status = 1
    let query ="INSERT INTO userAccount (mobile,customerName,customerNo,accountNumber,status) VALUES (?,?,?,?,?)"
   try {
        let record = await new Promise((resolve,reject) =>{
                    db.run(query,[mobile,customerName,customerId, accountNumber,status],(err,rows)=> {
                        console.log(err);
                    if(err) reject(err)
                    console.log(rows);
                        resolve(true)
                    })
        })
       if(record){
        return {'record' : record,"status" : 0}
       }else {
        return {'record' : record,"status" : null}
       }
    } catch (error) {
        console.log(error);
        return {'record' : null,"status" : null}
    
    }
     
 }
 exports.deLinkAccount= async function(mobile,customerNo,accountNumber){
    let query ="DELETE  from userAccount WHERE  mobile =? and customerNo =? and accountNumber = ?"
   try {
        let record = await new Promise((resolve,reject) =>{
                    db.run(query,[mobile,customerNo,accountNumber],(err)=> {
                        console.log(err);
                    if(err) reject(err)
                        resolve(true)
                    })
        })
          if(record){
            return {'record' : record,"status" : 0}
           }else {
            return {'record' : record,"status" : null}
           }
    } catch (error) {
        console.log(error);
        return {'record' : null,"status" : null}
    
    }
     
 }

exports.getLinkedAccount= async function(mobile){
    let acc= '122345'
        let query =`SELECT * FROM userAccount where mobile=${mobile}`
       try {
        let customer = await new Promise((resolve,reject) =>{
                    db.all(query,[],(err,rows)=> {
                        console.log(err);
                    if(err) reject(err)
                    console.log(rows);
                        resolve(rows)
                    })
        })
        if(customer.length >=1){
            return  {"data": customer,"status" : 0}
        }else {
            return  {"data": customer,"status" : null}
        }
       
    } catch (error) {
        console.log(error);
        return {"data": null,"status" : null}
      
    }
}
exports.getMemberAccount= async function(mobile){
        let query =`SELECT * FROM member where mobile=${mobile}`
       try {
        let customer = await new Promise((resolve,reject) =>{
                    db.all(query,[],(err,rows)=> {
                        console.log(err);
                    if(err) reject(err)
                    console.log(rows);
                        resolve(rows)
                    })
        })
        if(customer.length >=1){
            return  {"data": customer,"status" : 0}
        }else {
            return  {"data": customer,"status" : null}
        }
    } catch (error) {
        console.log(error);
        return {"data": null,"status" : null}
      
    }
}

