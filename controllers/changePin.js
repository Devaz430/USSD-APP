var exports = module.exports = {}
const configs = require("../conf.d")
, server = require("./../ussd")
, db = require("../_util/user")
, serverConfig = configs.getServerConfig()
, intel = configs.apiConfig()
, ussd = server.init(serverConfig)
, appServer =ussd.app
, jsonCache =ussd.jsonCache
, log =ussd.log
, http =ussd.http



exports.changePin= async function(mobile,msg){
	var session= await jsonCache.get(mobile)
        let query =`SELECT id, mobile,status FROM customer where mobile=${mobile}`
	let member = await new Promise((resolve,reject)=>{
		db.get(query,[],(err,rows)=>{
				 if(err)reject(err)
				  resolve(rows)
		})
		})
		log.info(member)
		switch (session.menu) {
			case 'current':
								if(msg.length  ===4 && Number(member.status) === Number(msg)) {
									session.menu = 'setpin'
									session.message =`Enter your 4-digit new PIN`;
								}else {
									session.menu = 'current'
									session.message = `PIN code is incorrect.\n`+`Enter your current 4-digit PIN code`
					}	
				break;
				case 'setpin':
								var last = mobile.slice(-4);
								if(msg.length  !==4 &&  Number(msg) !== Number(last)) {
									session.menu = 'setpin'
									session.message =`PIN code must be 4 digit \n`+`Please enter your 4-digit new PIN.`;
								}else if(msg === '0000' && msg.length  ===4){
									session.menu = 'setpin'
                                                                session.message =`You are using week PIN code! \n`+`Please enter your 4-digit new PIN.`;
								}else if(msg.length  ===4 &&  (Number(msg) === Number(last))) {
									session.menu = 'setpin'
									session.message =`Your mobile number's last four digits cannot be used. \n`+`Please enter your 4-digit new PIN`;
								}else if(msg.length  ===4 &&  /^[0-9]+$/.test(msg) && (Number(msg) != Number(last))) {
									session.newPin = msg
									session.menu = 'verify'
									session.message =`Kindly verify your 4-digit PIN code.`;
								}else {
									session.menu = 'setpin'
									session.message =`Only 4 digit allowed \n`+`Please enter your 4-digit new PIN`;
								}
							 
					break;
				case 'verify':
								if (session.newPin ===null) {
									var last = mobile.slice(-4);
									if(msg.length  !==4 &&  Number(msg) !== Number(last)) {
										session.menu = 'verify'
										session.message =`PIN code must be 4 digit \n`+`Please enter your 4-digit PIN code.`;
									}else if(msg.length  ===4 &&  (Number(msg) === Number(last))) {
										session.menu = 'verify'
										session.message =`Your mobile number's last four digits cannot be used. \n`+`Please enter your 4-digit PIN code`;
									}else if(msg.length  ===4 &&  /^[0-9]+$/.test(msg) && (Number(msg) != Number(last))) {
										session.newPin = msg
										session.menu = 'verify'
										session.message =`Kindly verify your 4-digit PIN code.`;
									}else {
										session.menu = 'verify'
										session.message =`Only 4 digit allowed \n`+`Please enter your 4-digit PIN code`;
									}
								}else if(session.newPin !=null) {
										if(Number(session.newPin )=== Number(msg)) {
											session.menu = 'verify'
											session.confirm = msg
											let query2 =`update customer set status=${msg} where mobile=${mobile}`
											db.run(query2)
											session.action ="end"
											session.message =`Your PIN code has been successfully \n changed. To login, please call again.`;
										}else{
											session.menu = 'verify'
											session.message =`PIN code is incorrect.\n`+`Please verify the PIN code`;
										}
								} 
				break;
			default:
				session.action ='end'
				session.message =`Invalid input,please retry`;
				break;
		}
	return session
}



exports.pinReset =async function(mobile,msg){
	     const stateSession  = await jsonCache.get(mobile)
	     const user = await UserService.finduserById(mobile);
	     if (Number(user.pin) === Number(msg) && stateSession.active){
	       var state = 'reset'
	       var message =`Enter your 4-digit new PIN`;
	       var pin = null;
	       var newPin = null;
	       var confirmPin = null;
	       var active = null;
	       var isReset = true;
	       const news =await SessionService.updateSession(mobile,{'active' : null});
	     }else if (Number(user.pin) === Number(msg) && stateSession.active){
	       var state = 'reset'
	       var message =`The new PIN code cannot be the same as the state PIN.`+`Enter your 4-digit new PIN`;
	       const news =await SessionService.updateSession(mobile,{'active' : null});
	     }else if(stateSession.newPin ===null && !stateSession.active) {
	       var last = mobile.slice(-4);
	       if(msg.length  !==4 &&  Number(msg) !== Number(last)) {
	             var state = 'reset'
	             var message =`PIN code must be 4 digit \n`+`Enter your 4 digit new PIN code`;
	       }else if(msg.length  ===4 &&  (Number(msg) === Number(last))) {
	             var state = 'reset'
	       var message =`Last 4 digit of your number not allowed \n`+`Enter your 4digit new PIN code`;
	       }else if(msg.length  ===4 &&  /^[0-9]+$/.test(msg) && (Number(msg) != Number(last))) {
	             var state = 'reset'
	       var message =`Confirm your 4-digit new PIN code`;
	       var pin = null;
	       var newPin = msg;
	       var confirmPin = null;
	       var active = null;
	       var isReset = true;
	       const news =await SessionService.updateSession(mobile,{'newPin' : msg});
	       }else {
	             var state = 'reset'
	             var message =`Only 4 digit allowed \n`+`Enter your 4digit new PIN code`;
	       }
	     }else if(stateSession.newPin !=null) {
	                      if(Number(stateSession.newPin )=== Number(msg)) {
	                             var state = 'dashboard'
	                             var message =`Your PIN code has been set successfully.Please enter your 4-digit PIN to Login,`  ;
	                             const news =await UserService.updateUser(mobile,{'pin' : msg,'isRegistered' :true});
	                       }else{
	                             var state = 'register'
	                             var message =`Your new PIN does not match.\n`+`please verify the new PIN code .`;
	                       }
	     }else if (user && !user.isRegistered &&  Number(msg) === 1) {
	       var state ='register';
	       // var message =`Choose a service to proceed: \n1. Send Money \n2. Check savings \n3. View Mini-statement \n4. Change PIN`;
	       var message = `Enter 4-digit PIN code`
	     }else if (user && !user.isRegistered && Number(msg) === 0) {
	       var state ='*';
	       var message ='This is creazy ';
	     }else {
	       var state ='reset';
	       var message = `PIN code is incorrect.\n`+`Enter your state 4-digit PIN code`
	     }
    return {state : state ,message : message,pin : pin,newPin : newPin,confirmPin : confirmPin,active : active,isReset: isReset}
  }	
