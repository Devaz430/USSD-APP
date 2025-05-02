var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  lang = require("../conf.d/language.json"),
  serverConfig = configs.getServerConfig(),
  ussd = server.init(serverConfig),
  jsonCache = ussd.jsonCache,
  { v4: uuidv4 } = require("uuid"),
  accountlogic = require("../controllers/account"),
  guzoGo = require("../controllers/guzoGo"),
  http = ussd.http;
exports.airTicket = async (from, msg) => {
  console.log(" Air Ticket", from, msg);
  //send pnr
  //check the account
  //confirm payment
  // send payment req
  // verify payment
  // send success message

  var menu = await jsonCache.get(from);
  let local = menu.local;
  // menu.state = "service";
  let amount;
  let debitorAccount;
  let transactionID = uuidv4().split("-")[0];

  if (msg === "*") {
    console.log("here *", msg);
    menu.state = "service";
    menu.message = lang[local].service;
  } else {
    switch (menu.menu) {
      case "confirm":
        console.log("confirm", msg);
        menu.menu = "confirm";

        if (Number(msg) === 1) {
          // menu.menu = "payGuzo";
          debitorAccount = "0000011110101";
          let accountDetail = await accountlogic.accountDetails(
            from,
            menu.fromAccount
          );
          if (accountDetail.data) {
            menu.balance = accountDetail.data.AvailableBalance;
          }
          if (menu.balance < menu.amount) {
            menu.message = lang[local].insufficientBallance;
          } else {
            let paymentRes = await guzoGo.payGuzo(
              transactionID,
              menu.amount,
              debitorAccount
            );
            if (paymentRes.status == 400) {
              menu.action = "end";

              menu.message = lang[local].guzoAlreadyPayed;
              console.log({ guzoGoSuccess: menu.message });
            } else if (paymentRes.status == 200) {
              menu.action = "end";

              menu.message = lang[local].guzoGoSuccess;
            }
          }
        } else {
          menu.action = "end";
          menu.message = lang[local].transferFailed;
        }
        break;
      case "list":
        console.log("list", msg);

        if (msg > 0 && msg <= menu.permissions.length) {
          let number = msg - 1;
          menu.fromAccount = menu.permissions[number];
          menu.menu = "confirm";
          menu.message =
            `${lang[local].transferAmount} : ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ` +
            lang[local].confirm;
        } else {
          var message = lang[local].retry + lang[local].continue;
          let accountList = [];
          for (let index = 0; index < menu.permissions.length; index++) {
            let AccountId = menu.permissions[index];
            var number = index + 1;
            message += `${number}. ${AccountId} \n`;
          }
          // message += lang[local].back;
          menu.menu = "list";
          menu.message = message;
        }
        break;
      case "checkPNR":
        console.log("checkPNR", msg);
        if (menu.permissions.length === 0) {
          menu.action = "end";
          menu.message = lang[local].notAllowed;
        } else if (menu.permissions.length >= 1) {
          let response = await guzoGo.checkPNR(msg);

          if (response.status == 200) {
            let amount = response.data.totalPrice.toString().match(/\d+/);
            console.log({ amount });
            if (amount.length > 0) {
              amount = amount[0];
              menu.amount == amount;
            } else {
              console.log("no amount");
            }
            menu.amount = amount;

            // if (response.data.payment_status == "paid") {
            //   menu.menu = "checkPNR"; // Stay in checkPNR state
            //   menu.message = lang[local].pnrPaid;
            // }
            // Handle multiple permissions and go to the list
            // else
            if (menu.permissions.length > 1) {
              menu.menu = "list";
              var message = lang[local].sourceAccount;
              for (let index = 0; index < menu.permissions.length; index++) {
                let AccountId = menu.permissions[index];
                var number = index + 1;
                message += `${number}. ${AccountId} \n`;
              }
              // message += lang[local].back;
              menu.amount = amount;
              menu.message = message;
            }
            // Otherwise, handle confirmation state for single permission
            else {
              menu.fromAccount = menu.permissions[0]; // Use the first permission
              menu.menu = "confirm"; // Transition to confirmation
              menu.message =
                `${lang[local].transferAmount} : ${menu.amount} ${lang[local].etb} \n ${lang[local].from} : ${menu.fromAccount} \n ` +
                lang[local].confirm;
            }
          } else if (response.status == 404) {
            // menu.message = `${lang[local].pnrNotFound} \n` + lang[local].back;
            menu.message = `${lang[local].pnrNotFound} \n`;
            menu.menu = "checkPNR";
            console.log("404");
          } else if (response.status == 400) {
            // menu.message = `${lang[local].invalidPNR} \n` + lang[local].back;
            menu.message = `${lang[local].invalidPNR} \n`;
            menu.menu = "checkPNR";
            console.log("400");
          } else {
            menu.action = "end";
            menu.message = lang[local].systemError;
          }
        }
        break;
      case "payGuzo":
        console.log("payGuzo", msg);

        debitorAccount = "0000011110101";
        let accountDetail = await accountlogic.accountDetails(
          from,
          menu.fromAccount
        );
        if (accountDetail.data) {
          menu.balance = accountDetail.data.AvailableBalance;
        }
        if (menu.balance < menu.amount) {
          menu.message = lang[local].insufficientBallance;
        } else {
          let paymentRes = await guzoGo.payGuzo(
            transactionID,
            menu.amount,
            debitorAccount
          );
          if (paymentRes.status == 400) {
            menu.action = "end";

            menu.message = lang[local].guzoAlreadyPayed;
            console.log({ guzoGoSuccess: menu.message });
          } else if (paymentRes.status == 200) {
            menu.action = "end";

            menu.message = lang[local].guzoGoSuccess;
          }
        }

        // if (paymentRes.status == 200) {
        //   let verifyPaymentRes = await guzoGo.verifyPayment(
        //     msg,
        //     from,
        //     transactionID
        //   );
        // }
        // console.log({ verifyPaymentRes });

        break;
      case "guzoGoSuccess":
        menu.action = "end";

        menu.message = lang[local].guzoAlreadyPayed;
        console.log({ guzoGoSuccess: menu.message });
        break;
      default:
        break;
    }

    return menu;
  }
};
