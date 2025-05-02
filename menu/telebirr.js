var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  lang = require("../conf.d/language.json"),
  accountlogic = require("../controllers/account"),
  moment = require("moment"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  jsonCache = ussd.jsonCache,
  log = ussd.log,
  http = ussd.http;

exports.telebirr = async function (mobile, msg) {
  var menu = await jsonCache.get(mobile);
  let local = menu.local;
  console.log("Inside telebirr");
  menu.state = "telebirr";
  var data = {
    AccountId: msg,
  };
  console.log({ tele: data });
  const response = await http
    .post(intel.accDetail, data)
    .then(function (response) {
      log.info(response);
      console.log("resonse telebirr", response);
      return response;
    })
    .catch(function (error) {
      log.info(error);
      onsole.log("Inside telebirr catch");
      return null;
    });

  if (msg === "*") {
    switch (menu.menu) {
      case "list":
        menu.state = "transfer";
        menu.message = lang[local].threeTransferService + lang[local].back;
        break;
      case "amount":
        menu.menu = "list";
        if (menu.permissions.length > 1) {
          var message = lang[local].sourceAccount;
          for (let index = 0; index < menu.permissions.length; index++) {
            let AccountId = menu.permissions[index];
            var number = index + 1;
            message += `${number}.   ${AccountId} \n`;
          }
          message += lang[local].back;
          menu.menu = "list";
          menu.message = message;
        } else {
          menu.state = "transfer";
          menu.message = lang[local].twoTransferService + lang[local].back;
        }
        break;
      case "remark":
        menu.menu = "amount";
        menu.message =
          lang[local].ownTeleBirr +
          ` ${lang[local].from} : ${menu.fromAccount}   \n  ${lang[local].to} : ${menu.isReset}(${mobile})\n ` +
          lang[local].amount +
          lang[local].back;
        break;
      case "confrim":
        menu.menu = "remark";
        menu.message =
          lang[local].ownTeleBirr +
          `${lang[local].transferAmount}  ${menu.amount}  ${lang[local].etb} \n  ${lang[local].from} :${menu.fromAccount} \n  ${lang[local].to} :${menu.isReset}(${menu.toAccount})\n` +
          lang[local].remark +
          lang[local].back;
        break;
    }
  } else if (msg == "9") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else {
    menu.state = "telebirr";
    menu.prestate = "list";
    switch (menu.menu) {
      case "list":
        if (msg > 0 && msg <= menu.permissions.length) {
          menu.menu = "amount";
          let number = msg - 1;
          menu.fromAccount = menu.permissions[number];
          console.log("from telebirr menu");
          let balance = await accountlogic.accountDetails(
            mobile,
            menu.fromAccount
          );
          if (balance.data) {
            menu.balance = balance.data.AvailableBalance;
            menu.message = lang[local].destinationAccount;
          } else {
            menu.action = "end";
            menu.message = lang[local].systemEror;
          }
          //telebirr
          telebirrEnquiry = await accountlogic.teleBirrEnquiry(mobile, "Test");
          console.log("telebirrEnquiry", telebirrEnquiry);
          //console.log("****************" + telebirrEnquiry.data.IdentityStatus);
          if (
            telebirrEnquiry.status === "0" &&
            (telebirrEnquiry.data.IdentityStatus === "00" ||
              telebirrEnquiry.data.IdentityStatus === "02" ||
              telebirrEnquiry.data.IdentityStatus === "03")
          ) {
            menu.isReset =
              telebirrEnquiry.data.KYCField[27].KYCValue +
              " " +
              telebirrEnquiry.data.KYCField[28].KYCValue +
              " " +
              telebirrEnquiry.data.KYCField[29].KYCValue;
            menu.message =
              lang[local].ownTeleBirr +
              `${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.isReset}(${mobile})\n` +
              lang[local].amount;
          } else {
            menu.message = "";
            if (telebirrEnquiry.data.IdentityStatus === "04") {
              menu.message = lang[local].accountSuspend;
            } else if (telebirrEnquiry.data.IdentityStatus === "05") {
              menu.message = lang[local].accountFrozen;
            } else if (telebirrEnquiry.data.IdentityStatus === "06") {
              menu.message = lang[local].accountClosed;
            } else if (telebirrEnquiry.data.IdentityStatus === "07") {
              menu.message = lang[local].accountCapped;
            } else if (telebirrEnquiry.data.IdentityStatus === "08") {
              menu.message = lang[local].accountDormant;
            }
            menu.action = "end";
          }
          //telebirr
        } else {
          var message = lang[local].retry + lang[local].continue;
          for (let index = 0; index < menu.permissions.length; index++) {
            let AccountId = menu.permissions[index];
            var number = index + 1;
            message += `${number}.  ${AccountId}  \n`;
          }
          message += lang[local].back;
          menu.menu = "list";
          menu.message = message;
        }
        break;
      case "amount":
        if (
          /^\d*\.?\d+$/.test(msg) &&
          Number(msg) < Number(menu.balance) &&
          msg != "0"
        ) {
          menu.amount = msg;
          menu.toAccount = mobile;
          menu.menu = "remark";
          menu.message =
            lang[local].ownTeleBirr +
            ` ${lang[local].transferAmount} : ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${menu.isReset}(${menu.toAccount}) \n ` +
            lang[local].remark;
        } else if (Number(msg) > Number(menu.balance)) {
          menu.message =
            lang[local].Insufficient +
            lang[local].ownTeleBirr +
            ` ${lang[local].from} : ${menu.fromAccount}   \n  ${lang[local].to} : ${menu.isReset}(${mobile}) \n` +
            lang[local].amount;
        } else {
          menu.menu = "amount";
          menu.message =
            lang[local].retry +
            `${lang[local].from} : ${menu.fromAccount}   \n ${lang[local].to} :${menu.isReset}(${mobile})\n ` +
            lang[local].amount;
        }
        break;
      case "remark":
        menu.remark = msg;
        menu.menu = "confrim";
        menu.message =
          `${lang[local].transferAmount} : ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} :${menu.isReset}(${mobile})\n ${lang[local].note} : ${menu.remark} \n ` +
          lang[local].confirm;
        break;
      case "confrim":
        if (Number(msg) === 1) {
          var toAccount = menu.toAccount;
          menu.idex = toAccount.slice(-4);
          menu.menu = "confrim";
          transferResponse = await accountlogic.teleBirrTrasnfer(
            mobile,
            menu.amount,
            menu.fromAccount,
            menu.remark
          );

          if (transferResponse.status === "0") {
            menu.action = "end";
            let date = moment().format("YYYY-MM-DD HH:mm");
            menu.message = ` ${lang[local].complete} ${lang[local].etb} ${menu.amount} ${lang[local].debited} ${lang[local].from} ${menu.fromAccount} \n ${lang[local].to} ${mobile} \n ${lang[local].reference}  ${transferResponse.data.Header.OriginatorConversationID} \n ${lang[local].date} ${date}${lang[local].bankingWtihUs}`;
          } else {
            menu.action = "end";
            menu.message = lang[local].transferFailed;
          }
        } else if (Number(msg) === 0) {
          menu.action = "end";
          menu.message = lang[local].cancel;
        } else {
          menu.menu = "confrim";
          menu.message =
            ` ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ${lang[local].to} : ${mobile} \n ${lang[local].note} : ${menu.remark} \n ` +
            lang[local].confirm;
        }

        break;
      default:
        break;
    }
  }

  return menu;
};
