var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, accountlogic = require("../controllers/account")
, serverConfig = configs.getServerConfig()
, model = require("../models/customer")
, moment = require('moment')
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http

exports.own =async function(mobile,msg){
  var menu= await jsonCache.get(mobile)
  let local =menu.local
  menu.state = 'own'
	const response   = await http.get(intel.accByPhone+mobile)
.then(function (response) {
	return response;
})
.catch(function (error) {
  log.info(error);
  return null;
});

const accounts = response.data.accountDetails
if (msg=== '*') {
                          switch (menu.menu) {
                            case 'list':
                              menu.state = 'transfer'
                              menu.message =lang[local].threeTransferService+ lang[local].back
                              break
                            case 'source':
                                                let accList = await accountlogic.accountList(mobile)
                                                if(accList.errorCode ==='0'){
                                                  menu.accounts = accList.accounts;
                                                  menu.permissions = accList.permissions;
                                                }
                                                menu.menu ='list';
                                                menu.prestate = 'transfer'
                                                var message =lang[local].sourceAccount
                                                let userAccount =[]
                                                for (let index = 0; index < menu.permissions.length; index++) {
                                                  let acc = menu.permissions[index];
                                                  userAccount.push(acc)
                                                  var number = index+1;
                                                  message += `${number}. ${acc} \n`
                                                }
                                                message += lang[local].back
                                                menu.message = message
                              break;
                              case 'destination':
                                                menu.menu = 'source'
                                                var message = lang[local].selectDestination 
                                                for (let index = 0; index < menu.permissions.length; index++) {
                                                  let acc = menu.permissions[index];
                                                  var number = index+1;
                                                    message += `${number}. ${acc} \n`
                                                
                                                }
                                                message += lang[local].back
                                                menu.message = message
                                break;
                              case 'amount':
                                                menu.menu ='destination'
                                                menu.message =lang[local].ownTransfer + ` ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.toAccount} \n `  + lang[local].amount +  lang[local].back
                              break;
                              case 'remark':
                                                menu.menu = 'amount'
                                                menu.message =lang[local].ownTransfer + `${lang[local].transferAmount} ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} ${menu.toAccount} \n `  + lang[local].remark +  lang[local].back
                              break;
                          }
}else if(msg == '9'){
      menu.state = 'service'
      menu.message = lang[local].service
      let accList = await accountlogic.accountList(mobile)
      if(accList.errorCode ==='0'){
        menu.accounts = accList.accounts;
        menu.permissions = accList.permissions;
      }
}else{
  switch (menu.menu) {
    case 'list':
     
          if(msg > 0 && msg <= menu.permissions.length) {
              var number = msg-1;
              menu.fromAccount = menu.permissions[number]
		//new 
               let accountDetail =await accountlogic.accountDetails(mobile,menu.fromAccount)
                        if(accountDetail.data){
                                menu.balance =accountDetail.data.AvailableBalance
                        }
              menu.menu = 'source'
              let accounts  = new Set(menu.accounts)
                  accounts.delete(menu.fromAccount)
                  let dAccounts =[...accounts];
                  menu.accounts = dAccounts
              let message = lang[local].selectDestination
              for (let index = 0; index < menu.accounts.length; index++) {
                let AccountId = menu.accounts[index];
                var number = index+1;
                message += `${number}. ${AccountId} \n`
              }
              message +=lang[local].back
              menu.message = message
          }else {
              var message = lang[local].retry +  lang[local].sourceAccount 
              for (let index = 0; index < menu.permissions.length; index++) {
                let acc = menu.permissions[index];
                var number = index+1;
                  message += `${number}.  ${acc}  \n`
              
              }
              message += lang[local].back
              menu.message = message
          }
      break;
      case 'source':
          if(msg > 0 && msg <=  menu.accounts.length) {
              var number = msg-1;
              menu.toAccount = menu.accounts[number]
              menu.menu = 'destination'
              menu.prestate ='fundTransferToOwnAccount'
              menu.message =lang[local].ownTransfer +  ` ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.toAccount} \n`  + lang[local].amount + lang[local].back
          }else {
              var message = lang[local].retry +  lang[local].continue 
              for (let index = 0; index < menu.accounts.length; index++) {
                let acc = menu.accounts[index];
                var number = index+1;
                  message += `${number}. ${acc} \n`
              
              }
              message += lang[local].back
              menu.message = message
          }
      break;
      case 'destination':
        if(/^\d*\.?\d+$/.test(msg) && Number(msg) < Number(menu.balance) && msg != '0'){
          menu.amount = msg
          menu.menu = 'amount'
          menu.message = lang[local].ownTransfer +  `${lang[local].transferAmount} ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.toAccount} \n ` + lang[local].remark + lang[local].back 
          }else if(Number(msg) > Number(menu.balance)) {
            menu.message =lang[local].Insufficient  + ` ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.toAccount} \n ` + lang[local].amount;
          }else  {
                      menu.prestate ='own'	
                      menu.menu = 'destination'
                      menu.message =lang[local].retry +  lang[local].ownTransfer + ` ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.toAccount} \n ` + lang[local].amount + lang[local].back 
          }
    break;
    case 'amount':
      menu.menu = 'remark'
      menu.remark = msg
      menu.message = lang[local].ownTransfer +`${lang[local].request} : ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.toAccount} \n ${lang[local].note} ${menu.remark} \n ` + lang[local].confirm 

  break;
  case 'remark':
    if(Number(msg) === 1 && menu.fromAccount != menu.toAccount){
				
      transferResponse = await accountlogic.fundTrasnfer(mobile,menu.amount,menu.fromAccount,menu.toAccount,menu.remark)
  
      
      var toAccount = menu.toAccount
      lastFour = toAccount.slice(-4);
      menu.remark = msg
      menu.menu ='done'

      if(transferResponse.status === '0'){
        console.log(transferResponse);
        menu.action = "end"
	 let date = moment().format("YYYY-MM-DD");
        menu.message =lang[local].transferDone  + transferResponse.data.referenceNumber +'\n' +lang[local].date + date+ lang[local].bankingWtihUs;
      }else {
        menu.action ='end'
        menu.message =lang[local].transferFailed

      }
    }else if(Number(msg) === 0){
      menu.action ='end'
            menu.message =lang[local].cancel
    }else {
                      menu.menu ='confrim'
                      menu.message = lang[local].retry + ` ${lang[local].request} : ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.isReset}- ${lastFour} \n ${lang[local].note} ${menu.remark} \n ` + lang[local].confirm
    
            }
break;
  }
}
	
  return  menu
}

