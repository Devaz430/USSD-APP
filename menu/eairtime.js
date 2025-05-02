var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, accountlogic = require("../controllers/account")
, moment = require('moment')
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http

exports.eairtime =async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local

if (msg=== '*')  {
				switch (menu.menu) {
					// case 'option':
					// 	menu.message =`${lang[local].airtimeMenu} \n`  
					// 	menu.menu = 'list'
					// 	menu.state ='airvendor';
					
					// break;
					case 'mobile':
						menu.state = 'service'
						menu.message = lang[local].service
					break;
					case 'list':
						if(menu.step === 'other'){
							menu.menu = 'mobile'
							menu.message =lang[local].eairtime +`${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].stopupMobile} ${lang[local].back}`;
						}else {
							menu.state = 'service'
							menu.message = lang[local].service
						}
					break;
					case 'select':
						if(menu.permissions.length >1){
							var message = lang[local].selectAccount
							for (let index = 0; index < menu.permissions.length; index++) {
								const acc = menu.permissions[index];
								var number = index+1;
								message += `${number}. ${menu.permissions[index]}\n`
							}
							message += lang[local].back
							menu.message = message
							menu.menu ='list';
							
						}else {
							menu.state ='transfer'
							menu.message =lang[local].oneTransferService+ lang[local].back
						}
						break;
					case 'source':
						if(menu.permissions.length >1){
							menu.message =lang[local].airtimeMenu;
							menu.menu = 'select'
							
						}else {
							menu.message =lang[local].airtimeMenu;
							menu.state = 'telebirr'
							menu.menu = 'select'
						}
						break;
					case 'amount':
						if(menu.permissions.length === 1){
							if(menu.step === 'other'){
								menu.menu = 'mobile'
								menu.message =lang[local].eairtime +`${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].stopupMobile} ${lang[local].back}`;
							}else {
								menu.menu = 'option';
								menu.message = lang[local].eairtimeOption
							}
						}else if( menu.permissions.length > 1){
							var message = lang[local].continue 
							menu.menu = 'list'
							for (let index = 0; index < menu.permissions.length; index++) {
								let AccountId = menu.permissions[index];
								var number = index+1;
								message += `${number}. ${AccountId} \n`
							}
							message += lang[local].back
							menu.message = message
						}
					break;
					case 'source': 
							menu.message =`${lang[local].tdestinationAccount} ${lang[local].back}` 
							menu.menu = 'source'
							menu.step ='other'
					break;
					case 'confirm':
						menu.message =lang[local].eairtime +`${lang[local].fromAccount} ${menu.fromAccount}\n${lang[local].mobileNumber} ${menu.toAccount} \n` +lang[local].topupamount +lang[local].back;
						menu.menu = 'amount'
					break;
				}
}else if(msg == '9'){
	menu.state = 'service'
	menu.message = lang[local].service
}else {
	switch (menu.menu) {
		case 'option':
				if (Number(msg) === 1 ) {
					menu.toAccount = mobile
					if(menu.permissions.length === 1){
						let balance =await accountlogic.accountDetails(mobile,menu.fromAccount)
						if(balance.data){
							menu.balance =balance.data.AvailableBalance
							menu.message =lang[local].eairtime +`${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].mobileNumber} ${menu.toAccount}\n`;
						
						}else {
							menu.action = 'end'
							menu.message =lang[local].systemEror
						}
						menu.menu = 'amount'
						menu.step = 'own'
					}else if( menu.permissions.length > 1){
						var message = lang[local].continue 
						menu.step = 'own'
						menu.menu = 'list'
						for (let index = 0; index < menu.permissions.length; index++) {
							let AccountId = menu.permissions[index] ;
							var number = index+1;
							message += `${number}. ${AccountId} \n`
						}
						message += lang[local].back
						menu.message = message
					}				
				}else if (Number(msg) === 2 ) {
						menu.menu = 'mobile'
						menu.step = 'other'
						menu.message = `${lang[local].eairtime} ${lang[local].stopupMobile} ${lang[local].back}`					
				}else {
					menu.state ='eairtime';
					menu.message = `${lang[local].retry} ${lang[local].eairtimeOption}`
			    }	
		   break;
		case 'list':
				if(msg > 0 && msg <= menu.accounts.length) {
					menu.menu = 'mobile'
					let number = msg -1
					menu.fromAccount = menu.permissions[number]
					let balance =await accountlogic.accountDetails(mobile,menu.fromAccount)
					if(balance.data){
						menu.balance =balance.data.AvailableBalance
						menu.message =lang[local].eairtime +`${lang[local].fromAccount} ${menu.fromAccount}\n${lang[local].stopupMobile} ${lang[local].back}` ;
					}else {
						menu.action = 'end'
						menu.message =lang[local].systemEror
					}			
				}else {
					var message =lang[local].retry + lang[local].continue 
					for (let index = 0; index < menu.permissions.length; index++) {
						let AccountId = menu.permissions[index] ;
						var number = index+1;
						message += `${number}. ${AccountId}\n`
					}
					message += lang[local].back
					menu.message = message
			    }	
		   break;
		case 'mobile':
				if( msg.length ===9 && (msg.substring(0,1) ==='7') ||  msg.length ===9 && (msg.substring(0,1) ==='9') || (msg.length ===10 && (msg.substring(0,2) ==='09')) || (msg.length ===10 && (msg.substring(0,2) ==='07'))  || msg.length ===12 && (msg.substring(0,4) ==='2519') || msg.length ===12 && (msg.substring(0,4) ==='2517') ) {
					menu.toAccount = '251'+ msg.slice(-9)
					let balance =await accountlogic.accountDetails(mobile,menu.fromAccount)
					if(balance.data){
						menu.balance =balance.data.AvailableBalance
						menu.index = menu.fromAccount.slice(-4);
						menu.message =lang[local].eairtime +`${lang[local].fromAccount} ${menu.fromAccount}\n${lang[local].mobileNumber} ${menu.toAccount} \n` +lang[local].topupamount +lang[local].back;
					}else {
						menu.action = 'end'
						menu.message =lang[local].systemEror
					}
					menu.menu = 'amount'
					menu.step = 'other'
									
				}else {
					menu.message = `${lang[local].retry} ${lang[local].eairtime} ${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].stopupMobile} ${lang[local].back}`;
				}
				
			
	   break;
		case 'amount':
			if(/^\d+$/.test(msg) && Number(msg) < Number(menu.balance) && msg != '0' && (Number(msg) >= 1 && Number(msg) < 5000)){
                menu.amount = msg
				menu.menu = 'confirm'
				menu.message =`${lang[local].eairtime} ${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].mobileNumber} ${menu.toAccount}\n ${lang[local].selectedAmount}  ${menu.amount} ${lang[local].etb}\n ${lang[local].confirm}`;
			}else if(Number(msg) > Number(menu.balance)) {
					menu.message = `${lang[local].Insufficient} ${lang[local].eairtime} ${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].mobileNumber}  ${menu.toAccount} \n ${lang[local].topupamount} ${lang[local].back}`;
		    }else {
				menu.message =`${lang[local].retry} ${lang[local].eairtime} ${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].mobileNumber} ${menu.toAccount} \n ${lang[local].topupamount} ${lang[local].back}`;
			}
			break;	
	case 'confirm':
		if(Number(msg) === 1 ){
			let internalFundTransfer = await accountlogic.airtime(menu.fromAccount,menu.amount,menu.toAccount)
			console.log(internalFundTransfer);
			menu.menu ='done'

			if(internalFundTransfer.errorCode === 1){
			  menu.action = "end"
			  let date = moment().format("YYYY-MM-DD");
				menu.message =` ${lang[local].complete} ${lang[local].etb} ${menu.amount} ${lang[local].debited} ${lang[local].from} ${menu.fromAccount} \n ${lang[local].buyAirtime} ${mobile} \n ${lang[local].reference}  ${internalFundTransfer.airtime.message_id} \n ${lang[local].date} ${date}${lang[local].bankingWtihUs}`;
			}else {
				menu.action ='end'
				menu.message =lang[local].transferFailed

			}
		}else if(Number(msg) === 0){
			menu.action ='end'
						menu.message =lang[local].cancel
		}else {
			  menu.menu ='confirm'
          	menu.message =`${lang[local].retry} ${lang[local].eairtime} ${lang[local].fromAccount} ${menu.fromAccount}\n ${lang[local].mobileNumber} ${menu.toAccount} \n ${lang[local].selectedAmount}  ${menu.amount} ${lang[local].etb}\n ${lang[local].confirm}`;
	
		}
			
			break;	
		default:
			break;
	}
}

  return  menu
}

