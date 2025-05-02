const { Router } = require('express');
const bodyParser =require('body-parser');
const menu =require('../menu');
const url = require('url');
const querystring = require('querystring');
const UserService = require("../services/user.service");
const routes = app => {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	const router = Router();
	app.get('/home', (req, res) => {
		let parsedUrl = url.parse((req.url));

		let parsedQs = querystring.parse(parsedUrl.query);
		var msg=parsedQs.msg
		var from = parsedQs.from;
		var servicecode=parsedQs.to;
		var ussd_service_op=parsedQs.ussd_service_op;
		var id=parsedQs.ts;
		var dcs=parsedQs.dcs;
		let args = {
			phoneNumber: from,
			sessionId: '251913712347',
			serviceCode: '*896#',
			text: msg
		};
		var hearder = {
			'Content-Type': 'text/plain' ,
			// 'X-Kannel-Coding': 2,
			'X-Kannel-Meta-Data': '?smpp?ussd_service_op=2'
		}
		res.set(hearder)
		// menu(req).run(args, ussdResult => {
		// 	res.send(ussdResult);
		// });

		const user = await UserService.findUserByPhone(phoneNumber);
		console.log(user)
		if (user) {
		  res.send(
			`Welcome back ${user.firstName} ${user.lastName} on the Vivi savings:` +
			  "\nEnter your 4-digit PIN to continue:"
		  );
		}else  if (user === 'new') {
		  res.send(
			`Welcome to Ahadu Bank USSD Service` +
			  "\nPlease enter your 4-digit PIN to continue:"
		  );
		}else {
		  res.send(
			`Welcome to Ahadu Bank USSD service` +   `\n+251913712347 mobile number is not registered ` +"\n0. Register" + "\n99. Exit"
		  );
	

	return router;
		  
};
	})
}
module.exports = routes;
