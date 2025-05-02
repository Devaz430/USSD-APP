var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, lang = require("../conf.d/language.json")
, minilogic = require("../controllers/miniStatment")
, moment = require('moment')
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http

exports.miniStatement= async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local
	if(msg === '*'){
		if(menu.accounts.length ===1){
			menu.state = 'service'
			menu.message = lang[local].service
		}else {
			var message =lang[local].continue 
			let accountList =[]
			for (let index = 0; index < menu.accounts.length; index++) {
				let AccountId = menu.accounts[index];
				var number = index+1;
				message += `${number}. ${AccountId}\n`
			}
			message += '*. back'
			menu.state ='accountListForMiniStatement';
			menu.message = message
		}
    }else if(msg == '9'){
		menu.state = 'service'
		menu.message = lang[local].service
	}else {
		switch (menu.menu) {
			case 'mini':
				let miniSInquery = await minilogic.miniStatmentInquery(mobile,menu.fromAccount)
							if(miniSInquery.errorCode ===0){
								menu.state = 'mini'
								menu.menu = 'mini'
								menu.index = 1;
								let message =lang[local].miniStatment
								for (let index = 0; index < miniSInquery.Records.length; index++) {
										var number = index+1;
										var action = miniSInquery.Records[index].TransactionDebitAmount;
										if(miniSInquery.Records[index].TransactionCreditAmount != 0){
										var amount = miniSInquery.Records[index].TransactionCreditAmount
												action =  lang[local].credit
										}else {
												action =  lang[local].debit
										var amount = miniSInquery.Records[index].TransactionDebitAmount
										}
										let date = miniSInquery.Records[index].TransactionDate
										message += `${number}.  ${date.substr(0,5)} ${amount} ${action} \n`
								}
								message +=lang[local].back
								menu.message = message
							}else {
								menu.action = 'end'
								menu.message = lang[local].systemError
							}
				break;
			case 'list':
				if(msg >0 && msg < menu.accounts.length){
					let miniSInquery = await minilogic.miniStatmentInquery(mobile,menu.accounts[msg-1])
						if(miniSInquery.errorCode ===0){
							menu.state = 'mini'
							menu.menu = 'mini'
							menu.index = 1;
								let message =lang[local].miniStatment
								for (let index = 0; index < miniSInquery.Records.length; index++) {
										var number = index+1;
										var action = miniSInquery.Records[index].TransactionDebitAmount;
										if(miniSInquery.Records[index].TransactionCreditAmount != 0){
										var amount = miniSInquery.Records[index].TransactionCreditAmount
												action ='Cr'
										}else {
												action = 'D'
										var amount = miniSInquery.Records[index].TransactionDebitAmount
										}
										let date = miniSInquery.Records[index].TransactionDate
										message += `${number}.  ${date.substr(0,5)} ${amount} ${action} \n`
								}
								message +=lang[local].back
								menu.message = message
						}else {
							menu.action = 'end'
							menu.message = lang[local].systemError
						}
				}else {
					var message =lang[local].continue 
			let accountList =[]
			for (let index = 0; index < menu.accounts.length; index++) {
				let AccountId = menu.accounts[index];
				var lastSeven = AccountId.slice(-8);
				var number = index+1;
				message += `${number}. ${AccountId} \n`
			}
				}
					break;
		}
	}
	
	return menu
} 


