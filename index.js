"use strict";

const configs = require("./conf.d"),
  server = require("./ussd"),
  servicemenu = require("./menu/service"),
  accountmenu = require("./menu/account"),
  model = require("./models/customer"),
  // const homemenu = require("./menu/transfer")
  transfermenu = require("./menu/transfer"),
  ownmenu = require("./menu/owntransfer"),
  ahadumenu = require("./menu/ahadu"),
  otherBankmenu = require("./menu/otherBank"),
  telebirrmenu = require("./menu/telebirr"),
  balancemenu = require("./menu/balance"),
  miniemenu = require("./menu/mini"),
  homemenu = require("./menu/dashboard"),
  eairtimemenu = require("./menu/eairtime"),
  sairtimemenu = require("./menu/sairtime"),
  registermenu = require("./menu/register"),
  signupmenu = require("./menu/signup"),
  homeservice = require("./menu/homeservice"),
  resetmenu = require("./menu/resetpin"),
  pinmenu = require("./menu/changePin"),
  paymentmenu = require("./menu/payment"),
  loginmenu = require("./menu/login"),
  settingmenu = require("./menu/accountSettings"),
  airTicketMenu = require("./menu/airTicket"),
  schoolFeeMenu = require("./menu/school"),
  uniCashMenu = require("./menu/uniCashMenu"),
  //API logic
  mpinlogic = require("./controllers/mpin"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  url = require("url"),
  querystring = require("querystring"),
  Logger = require("bunyan"),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http,
  xmlparser = require("express-xml-bodyparser");
appServer.use(xmlparser());

appServer.use((req, res, next) => {
  //  log.info('USSD start !'+req.body.methodcall.params[0].param[0].value[0].struct[0].member[2].value[0].string[0]);
  //   log.info(req.body.methodcall.params[0].param[0].value[0].struct[0].member[4].value[0].string[0])
  next();
});

appServer.get("/", async (req, res) => {
  res.send("USSD APP working");
  console.log("USSD APP working");
});
appServer.post("/", async (req, res) => {
  //var shortcode = "8056";
  // var serviceCode = 8056;

  const body = req.body["cps-message"];
  const transactionID = body.sequence_number[0];
  const transactionTime = body.timestamp[0];
  let msg = body.msg_content[0];
  const serviceCode = body.dest_addr[0];
  const from = body.source_addr[0];
  if (msg == "*8056#") {
    msg = "continue";
  }
  let action = "";
  let data = "";
  let menuBody = "";
  const user = from;
  let session;
  var isActive = true;

  if (isActive) {
    var sessions = {
      local: "en",
      id: from,
      page: null,
      fromAccount: null,
      bank: null,
      amount: null,
      toAccount: null,
      remark: null,
      confrim: null,
      menu: null,
      prestate: "dashboard",
      state: "dashboard",
      pin: null,
      newPin: null,
      confirmPin: null,
      active: null,
      index: null,
      isReset: null,
      step: null,
      balance: null,
      msg: msg,
      action: "request",
      message: null,
      accounts: null,
      permissions: null,
    };
    let serviceType = body.service_type?.[0] || "BR";
    if (msg === "continue") {
      serviceType = "CR"; // Continue session
    } else if (msg === "end") {
      serviceType = "EA"; // End session
    } else if (msg === "abort") {
      serviceType = "AR"; // Abort session
    } else {
      serviceType = "BR"; // Default to Begin Request
    }
    if (msg === "continue") {
      jsonCache.del(from);
      await jsonCache.set(from, sessions);
      session = await jsonCache.get(from);
      console.log("from msg 8056");
    } else {
      session = await jsonCache.get(from);
      console.log("from msg 8056 else");
    }
    log.info("User response is :" + user);
    log.info(user);
    switch (session?.state) {
      case "dashboard":
        var response = await homemenu.dashboard(from, msg);
        break;
      case "register":
        var response = await registermenu.register(from, msg);
        break;
      case "signup":
        var response = await signupmenu.signup(from, msg);
        break;
      case "payment":
        var response = await paymentmenu.payment(from, msg);
        break;
      case "login":
        var response = await loginmenu.login(from, msg);
        break;
      case "changePin":
        var response = await pinmenu.changePin(from, msg);
        break;
      case "accountListForSaving":
        var response = await accountmenu.balanceaccount(from, msg);
        break;
      case "accountListForMiniStatement":
        var response = await accountmenu.miniaccount(from, msg);
        break;
      case "OwnAccount":
        var response = await accountmenu.ownaccount(from, msg);
        break;
      case "otherBank":
        var response = await otherBankmenu.otherBank(from, msg);
        break;
      case "fundTransferToOtherBank":
        var response = await accountmenu.otherBankaccount(from, msg);
        break;
      case "fundTransferToAhaduAccount":
        var response = await accountmenu.ahaduaccount(from, msg);
        break;
      case "fundTransferToTeleBirr":
        var response = await accountmenu.telebirraccount(from, msg);
        break;
      case "airvendor":
        var response = await accountmenu.airtimeVendor(from, msg);
        break;
      case "sairtime":
        var response = await sairtimemenu.sairtime(from, msg);
        break;
      case "eairtime":
        var response = await eairtimemenu.eairtime(from, msg);
        break;
      case "mini":
        var response = await miniemenu.miniStatement(from, msg);
        break;
      case "home":
        var response = await homeservice.homeservice(from, msg);
        break;
      case "reset":
        var response = await resetmenu.resetmpin(from, msg);
        break;
      case "service":
        var response = await servicemenu.services(from, msg);
        break;
      case "saving":
        var response = await balancemenu.saving(from, msg);
        break;
      case "accountSessing":
        var response = await settingmenu.Settings(from, msg);
        break;
      case "transfer":
        var response = await transfermenu.transfer(from, msg);
        break;
      case "own":
        var response = await ownmenu.own(from, msg);
        break;
      case "ahadu":
        var response = await ahadumenu.ahadu(from, msg);
        break;
      case "telebirr":
        var response = await telebirrmenu.telebirr(from, msg);
        break;
      case "airTicket":
        var response = await airTicketMenu.airTicket(from, msg);
        break;

      case "schoolPayment":
        var response = await schoolFeeMenu.schoolFeeMenu(from, msg);
        break;
      case "uniCashPayment":
        var response = await uniCashMenu.uniCashMenu(from, msg);
        break;

      case "owntransfer":
        var response = await ownmenu.owntransfer(from, msg);
        break;

      default:
        var response = {
          action: "end",
          message:
            "Sorry for the trouble, there was a system error. Please try again",
        };
        break;
    }

    log.info(response);
    log.info(
      `${response.id} response ${response.msg} on ${response.state} from previous state ${response.prestate}`
    );
    jsonCache.del(from);
    await jsonCache.set(from, response);
    if (response.action === "end") {
      action = response.action;
    } else {
      action = "request";
    }
    data = `<?xml version="1.0" encoding="utf-8"?>
    <cps-message>
      <sequence_number>${transactionID}</sequence_number>
      <version>32</version>
      <service_type>${action === "end" ? "EF" : "CR"}</service_type>
      <source_addr>${serviceCode}</source_addr>
      <dest_addr>${from}</dest_addr>
      <timestamp>${transactionTime}</timestamp>
      <command_status>0</command_status>
      <data_coding>0</data_coding>
      <msg_len>3</msg_len>
      <msg_content>${response.message}</msg_content>
    </cps-message>`;
    res.status(200).send(data); //${response.message.length}
  } else {
    action = "end";
    menuBody = `Welcome to Ahadu Bank USSD service.\n This ${from} mobile number \n doesn't have a register account.\nInquire with the nearby Ahadu branch. `;
    data = `<?xml version="1.0" encoding="utf-8"?>
    <cps-message>
      <sequence_number>${transactionID}</sequence_number>
      <version>32</version>
      <service_type>EF</service_type>
      <source_addr>${serviceCode}</source_addr>
      <dest_addr>${from}</dest_addr>
      <timestamp>${transactionTime}</timestamp>
      <command_status>0</command_status>
      <data_coding>0</data_coding>
      <msg_len>${menuBody.length}</msg_len>
      <msg_content>${menuBody}</msg_content>
    </cps-message>`;

    res.status(200).send(data);
  }
});

appServer.listen(process.env.PORT || serverConfig.port, () => {
  log.info("Server running at:", serverConfig.port);
  console.log("Server running at:", serverConfig.port);
  // client.connect();
});
