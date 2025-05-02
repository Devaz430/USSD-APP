var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, model = require("../models/customer")
, lang = require("../conf.d/language.json")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http

exports.signup = async function(mobile,msg){
	var menu= await jsonCache.get(mobile)
	let local =menu.local
		switch (menu.menu) {
				case 'name':	let regName = /^[a-zA-Z]+ [a-zA-Z]+$/;				
								if(regName.test(msg) ){
									menu.menu = 'city'
									menu.customerName = msg
									menu.message =lang[local].city ;
								}else {
									menu.menu ='name'
									menu.message =lang[local].invalidName +lang[local].fullName ;
								}
					break;
					case 'city':
								if(/^[A-Za-z_ ]*$/.test(msg)) {
									let customerRecord = await model.registerCustomer(mobile,menu.customerName,msg)
										log.info(`information about a non-membered customer is saved for the customer mobile: ${mobile} \n  with data : `+JSON.stringify(customerRecord));
										if(customerRecord){
											menu.menu = 'success'
											menu.action = 'end'
											menu.message = lang[local].hello+ ` ${menu.customerName} \n`+lang[local].signupSuccessfull
										}else {
											menu.action = 'end'
											menu.message =lang[local].invalidData
										}
								}else {
									menu.menu = 'city'
									menu.message = lang[local].retry+ lang[local].city
								}
					break;
		}
	return menu
}

