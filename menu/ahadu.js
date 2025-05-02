var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, moment = require('moment')
, accountlogic = require("../controllers/account")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http

exports.ahadu =async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local
	menu.state = 'ahadu'
if (msg=== '*')  {
			switch (menu.menu) {
				case 'list':
					menu.state = 'transfer'
					menu.message =lang[local].threeTransferService+ lang[local].back
					break
				case 'source':
								if(menu.permissions.length >1){
									var message =lang[local].sourceAccount
									for (let index = 0; index < menu.permissions.length; index++) {
										let AccountId = menu.permissions[index];
										var number = index+1;
										message += `${number}. ${AccountId} \n`
									}
									message += lang[local].back	
									menu.menu ='list';
									menu.message = message
								}else {
									menu.state ='transfer'
									menu.message = lang[local].twoTransferService+ lang[local].back
								}
				break;
				case 'destination':
								menu.menu = 'source'
								menu.message =lang[local].withInBank + lang[local].destinationAccount + lang[local].back;
				break;
				case 'amount':
								menu.menu = 'destination'
								menu.message =lang[local].withInBank +`${lang[local].from} : ${menu.fromAccount} \n ${menu.isReset}- ${menu.index} \n` + lang[local].amount+ lang[local].back;
				break;
				case 'confrim':
								menu.menu ='amount'
								menu.message =lang[local].withInBank + ` ${lang[local].transferAmount} ${menu.amount} ${lang[local].etb} \n${lang[local].from} : ${menu.fromAccount} \n ${menu.isReset}- ${menu.index} \n  ` + lang[local].remark + lang[local].back;	
				break;
			}
}else if(msg === '9'){
	menu.state = 'service'
	menu.message = lang[local].service;
}else {
	menu.state = 'ahadu'
	menu.prestate = 'list'
	switch (menu.menu) {
		case 'list':
				if(msg > 0 && msg <= menu.permissions.length) {
					menu.menu = 'source'
					let number = msg -1
					menu.fromAccount = menu.permissions[number]
					let balance =await accountlogic.accountDetails(mobile,menu.fromAccount)
					if(balance.data){
						menu.balance =balance.data.AvailableBalance
						menu.message =lang[local].destinationAccount;
					}else {
						menu.action = 'end'
						menu.message =lang[local].systemError 
					}				
				}else {
					var message =lang[local].retry + lang[local].continue 
					let accountList =[]
					for (let index = 0; index < menu.permissions.length; index++) {
						let AccountId = menu.permissions[index];
						var number = index+1;
						message += `${number}. ${AccountId} \n`
					}
					message +=lang[local].back 
					menu.menu ='list';
					menu.message = message
			    }	
		   break;
		case 'source':
			let accountDetail =await accountlogic.accountDetails(mobile,msg)
			if(accountDetail.data){
				if(msg.length === 13 && accountDetail.data.AccountHolderName && menu.fromAccount != msg){
					menu.index = msg.slice(-4);
					menu.toAccount = msg
					menu.menu ='destination'
						menu.isReset = accountDetail.data.AccountHolderName
					menu.message =lang[local].withInBank +`${lang[local].from} : ${menu.fromAccount}  \n ${lang[local].to} ${menu.isReset}- ${menu.index} \n`+ lang[local].amount;
				}else if( menu.fromAccount === msg){
					menu.menu ='source'
					menu.message =lang[local].sameAccount  + lang[local].destinationAccount;
				}else {
					menu.menu ='source'
					menu.message =lang[local].retry + lang[local].destinationAccount;
				}
			}else {
				menu.menu ='source'
				menu.message =lang[local].systemError;
			}
			break;
		case 'destination':
				if(/^\d*\.?\d+$/.test(msg) && Number(msg) < Number(menu.balance) && msg != '0'){
					menu.toAccount = menu.toAccount
					menu.index = menu.toAccount.slice(-4);
					menu.amount = msg;
					menu.menu ='amount'
					menu.message =lang[local].withInBank  + `  ${lang[local].request}  :  ${menu.amount}  ${lang[local].etb}  \n ${lang[local].from}  : ${menu.fromAccount}  \n ${lang[local].to} ${menu.isReset}- ${menu.index} \n ` + lang[local].remark ;
				}else if(Number(msg) > Number(menu.balance)) {
					menu.state = 'ahadu'
					menu.message =lang[local].Insufficient  + ` ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to}  ${menu.toAccount} \n ` + lang[local].amount;
				}else {
					menu.state = 'ahadu'
					menu.message =lang[local].retry + lang[local].withInBank  + ` ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to}  ${menu.toAccount} \n`  + lang[local].amount;
				}

				break;
		case 'amount':
				var toAccount = menu.toAccount
				menu.index = toAccount.slice(-4);
				menu.remark = msg
				menu.menu ='confrim'
				menu.message =` ${lang[local].request} : ${menu.amount} ${lang[local].etb}  \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} ${menu.isReset}- ${menu.index} \n ${lang[local].note} ${menu.remark} \n` +  lang[local].confirm;
				break;		
		case 'confrim':
					if(Number(msg) === 1 && menu.fromAccount != menu.toAccount){
				
						transferResponse = await accountlogic.fundTrasnfer(mobile,menu.amount,menu.fromAccount,menu.toAccount,menu.remark)
				
						
						var toAccount = menu.toAccount
						menu.idex = toAccount.slice(-4);
						menu.remark = msg
						menu.menu ='done'
						console.log(transferResponse)
						if(transferResponse.status === '0'){
							log.info(transferResponse);
							menu.action = "end"
							let date = moment().format("YYYY-MM-DD HH:mm");
							menu.message =` ${lang[local].complete} ${lang[local].etb} ${menu.amount} ${lang[local].debited} ${lang[local].from} ${menu.fromAccount}\n ${lang[local].to} ${menu.isReset} \n ${lang[local].reference}  ${transferResponse.data.referenceNumber} \n ${lang[local].date} ${date} \n ${lang[local].bankingWtihUs}`;
						}else {
							menu.action ='end'
							menu.message =lang[local].transferFailed

						}
					}else if(Number(msg) === 0){
						menu.action ='end'
									menu.message =lang[local].cancel
					}else {
						menu.menu ='confrim'
						menu.message =` ${lang[local].request} : ${menu.amount} ${lang[local].etb}  \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to}  ${menu.isReset}- ${menu.index} \n ${lang[local].note} ${menu.remark} \n ` + lang[local].confirm;
				
					}
				
			break;	
		default:
			break;
	}
}

  return  menu
}

