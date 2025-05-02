var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  model = require("./../models/customer"),
  lang = require("../conf.d/language.json"),
  intelectBalance = require("../controllers/balance"),
  accountlogic = require("../controllers/account"),
  minilogic = require("../controllers/miniStatment"),
  moment = require("moment"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.airtimeVendor = async function (mobile, msg) {
  let menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "service";
    menu.prestate = "dashboard";
    menu.message = lang[local].service;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (Number(msg) === 1) {
    menu.state = "eairtime";
    menu.menu = "option";
    menu.message = lang[local].eairtimeOption;
  } else if (Number(msg) === 2) {
    menu.state = "sairtime";
    menu.menu = "mobile";
    menu.step = "other";
    menu.message = `${lang[local].sairtime} ${lang[local].stopupMobile} ${lang[local].back}`;
  } else {
    menu.message = `${lang[local].retry} ${lang[local].airtimeMenu} \n`;
  }
  return menu;
};
exports.balanceaccount = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "service";
    menu.prestate = "accountListForSaving";
    menu.message = lang[local].service;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (msg > 0 && msg <= menu.accounts.length) {
    menu.state = "saving";
    menu.menu = "list";
    menu.index = 1;
    menu.fromAccount = menu.accounts[msg - 1];
    let accountDetail = await accountlogic.accountDetails(
      mobile,
      menu.fromAccount
    );
    if (accountDetail.data) {
      menu.state = "saving";
      menu.menu = "saving";
      menu.index = 1;
      menu.message =
        ` \n${accountDetail.data.AccountHolderName}\n` +
        `${lang[local].balance}  ${accountDetail.data.AvailableBalance} ${lang[local].etb} \n` +
        lang[local].back;
    } else {
      menu.action = "end";
      menu.message = lang[local].systemError;
    }
  } else if (msg > menu.accounts.length || !Number.isInteger(msg)) {
    menu.state = "accountListForSaving";
    var message =
      `Incorrect entry, Please retry \n` + "Please select  Source account: \n";
    for (let index = 0; index < menu.accounts.length; index++) {
      const acc = menu.accounts[index];
      var number = index + 1;
      message += `${number}.  ETB - ${acc}  \n`;
    }
    message += "*. back";
    menu.message = message;
  } else {
    menu.state = "accountListForSaving";
    menu.message = `Incorrect entry, Please retry \n`;
  }
  menu.index = msg - 1;
  return menu;
};
exports.miniaccount = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "service";
    menu.prestate = "accountListForMiniStatement";
    menu.message = `Select a service to procced:  \n1. Balance Inquiry \n2. Fund Transfer \n3. Payment  \n4. Mini Statement \n5. Change PIN`;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (msg > 0 && msg <= menu.accounts.length) {
    menu.state = "mini";
    menu.menu = "list";
    menu.fromAccount = menu.accounts[msg - 1];
    let miniSInquery = await minilogic.miniStatmentInquery(
      mobile,
      menu.fromAccount
    );

    if (miniSInquery.errorCode === 0) {
      menu.state = "mini";
      menu.menu = "mini";
      menu.index = 1;
      let message = lang[local].miniStatment;
      for (let index = 0; index < miniSInquery.Records.length; index++) {
        var number = index + 1;
        log.info(miniSInquery.Records[index]);
        var action = miniSInquery.Records[index].TransactionDebitAmount;
        if (miniSInquery.Records[index].TransactionCreditAmount != 0) {
          var amount = miniSInquery.Records[index].TransactionCreditAmount;
          action = lang[local].credit;
        } else {
          action = lang[local].debit;
          var amount = miniSInquery.Records[index].TransactionDebitAmount;
        }
        let date = miniSInquery.Records[index].TransactionDate;
        message += `${number}. ${date.substr(0, 5)} ${amount} ${action} \n`;
      }
      message += lang[local].back;
      menu.message = message;
    } else {
      menu.action = "end";
      menu.message = lang[local].systemError;
    }
  } else {
    var message = lang[local].retry + lang[local].continue;
    let accountList = [];
    for (let index = 0; index < menu.accounts.length; index++) {
      let AccountId = menu.accounts[index];
      var number = index + 1;
      message += `${number}.   ${AccountId}\n`;
    }
    log.info(accountList);
    message += "*. back";
    menu.state = "accountListForMiniStatement";
    menu.prestate = "service";
    menu.message = message;
  }
  return menu;
};
exports.ownaccount = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "transfer";
    menu.message = lang[local].threeTransferService + lang[local].back;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (msg > 0 && msg <= menu.permissions.length) {
    menu.state = "own";
    menu.menu = "source";
    menu.fromAccount = menu.permissions[msg + 1];
    let balance = await accountlogic.accountDetails(mobile, menu.fromAccount);
    if (balance.data) {
      menu.balance = balance.data.AvailableBalance;
      menu.message = lang[local].destinationAccount;
    } else {
      menu.action = "end";
      menu.message = lang[local].systemError;
    }
    let accountDetail = await accountlogic.accountDetails(
      mobile,
      menu.fromAccount
    );
    if (accountDetail.data) {
      menu.balance = accountDetail.data.AvailableBalance;
      menu.message = lang[local].withInBank + lang[local].destinationAccount;
    } else {
      menu.balance = accountDetail.data.AvailableBalance;
      menu.message = lang[local].systemError;
    }
  } else {
    var message = lang[local].retry + lang[local].continue;
    for (let index = 0; index < menu.permissions.length; index++) {
      let AccountId = menu.permissions[index];
      var number = index + 1;
      message += `${number}. ${AccountId} \n`;
    }
    message += "*. back";
    menu.state = "OwnAccount";
    menu.message = message;
  }

  return message;
};
exports.ahaduaccount = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "transfer";
    menu.message = lang[local].threeTransferService + lang[local].back;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (msg > 0 && msg <= menu.permissions.length) {
    menu.state = "ahadu";
    menu.menu = "source";
    menu.fromAccount = menu.permissions[msg + 1];
    let accountDetail = await accountlogic.accountDetails(
      mobile,
      menu.fromAccount
    );
    if (accountDetail.data) {
      menu.balance = accountDetail.data.AvailableBalance;
      menu.message = lang[local].withInBank + lang[local].destinationAccount;
    } else {
      menu.balance = accountDetail.data.AvailableBalance;
      menu.message = lang[local].systemError;
    }
  } else {
    var message = lang[local].retry + lang[local].sourceAccount;
    for (let index = 0; index < menu.permissions.length; index++) {
      let AccountId = menu.permissions[index];
      var number = index + 1;
      message += `${number}. ${AccountId} \n`;
    }
    message += "*. back";
    menu.state = "fundTransferToAhaduAccount";
    menu.message = message;
  }

  return message;
};
exports.telebirraccount = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "transfer";
    menu.message = lang[local].threeTransferService + lang[local].back;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (msg > 0 && msg <= menu.permissions.length) {
    var number = msg - 1;
    menu.fromAccount = menu.permissions[number];
    menu.menu = "amount";
    menu.state = "telebirr";
    menu.message =
      lang[local].ownTeleBirr +
      ` \n ${lang[local].request} ${lang[local].from} ${menu.fromAccount}   \n ${lang[local].to}  ${mobile} ${lang[local].phoneNumber} \n ` +
      lang[local].amount;
  } else {
    menu.state = "fundTransferToTeleBirr";
    var message = lang[local].retry + lang[local].sourceAccount;
    for (let index = 0; index < menu.permissions.length; index++) {
      const acc = menu.permissions[index];
      var number = index + 1;
      message += `${number}. ${acc}  \n`;
    }
    message += lang[local].back;
    menu.message = message;
  }
  menu.index = msg - 1;

  return menu;
};
exports.otherBankaccount = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  if (msg === "*") {
    menu.state = "transfer";
    menu.message = lang[local].threeTransferService + lang[local].back;
  } else if (msg === "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else if (msg > 0 && msg <= menu.permissions.length) {
    var number = msg - 1;
    menu.fromAccount = menu.permissions[number];
    // menu.fromAccount= menu.accounts[0]
    let balance = await accountlogic.accountDetails(mobile, menu.fromAccount);
    if (balance.data) {
      menu.balance = balance.data.AvailableBalance;
      menu.message = lang[local].destinationAccount;
    } else {
      menu.action = "end";
      menu.message = lang[local].systemError;
    }
    menu.state = "otherBank";
    menu.menu = "bank1";
    menu.page = 1;
    let message = lang[local].destinationBank;
    message += `1. ${lang[local].cbe} \n`;
    message += `2.${lang[local].awash} \n`;
    message += `3. ${lang[local].dashen} \n`;
    message += `4. ${lang[local].boa} \n`;
    message += `5. ${lang[local].wegagen} \n`;
    message += lang[local].back;
    message += lang[local].back;
    menu.message = message;
  } else {
    menu.state = "fundTransferToOtherBank";
    var message = lang[local].retry + lang[local].sourceAccount;
    for (let index = 0; index < menu.permissions.length; index++) {
      const acc = menu.permissions[index];
      var number = index + 1;
      message += `${number}. ${acc}  \n`;
    }
    message += lang[local].back;
    menu.message = message;
  }
  menu.index = msg - 1;

  return menu;
};
