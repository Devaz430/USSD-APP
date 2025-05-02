var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  lang = require("../conf.d/language.json"),
  serverConfig = configs.getServerConfig(),
  ussd = server.init(serverConfig),
  jsonCache = ussd.jsonCache,
  unicashController = require("../controllers/uniCash"),
  http = ussd.http;

exports.uniCashMenu = async (from, msg) => {
  console.log("UniCash Menu", from, msg);
  var menu = await jsonCache.get(from);
  let local = menu.local;

  if (msg === "*") {
    menu.state = "service";
    menu.message = lang[local].service;
  } else {
    switch (menu.menu) {
      case "startUnicash":
        let accountIndex = parseInt(msg) - 1;
        if (accountIndex >= 0 && accountIndex < menu.accounts.length) {
          menu.fromAccount = menu.accounts[accountIndex]; // Store selected account
        } else {
          menu.message = lang[local].invalidSelection;
        }
        const authResult = await unicashController.authorize();
        if (authResult.token) {
          menu.token = authResult.token;
          menu.menu = "enterSchoolId";
          menu.message = lang[local].enterSchoolId;
        } else {
          menu.action = "end";
          menu.message = lang[local].authFailed;
        }
        break;

      case "enterSchoolId":
        menu.schoolId = msg;
        const school = await unicashController.searchEnterprise(
          menu.token,
          menu.schoolId
        );
        if (school) {
          menu.schoolName = school.enterprises[0].name;
          menu.toAccount = school.enterprises[0].bankAccount;
          menu.menu = "enterStudentId";
          menu.message = `${lang[local].schoolName} ${school.enterprises[0].name}\n${lang[local].enterStudentId}`;
        } else {
          menu.message = lang[local].schoolNotFound;
        }
        break;

      case "enterStudentId":
        menu.studentId = msg;
        const student = await unicashController.searchStudent(
          menu.token,
          menu.schoolId,
          menu.studentId
        );
        if (student) {
          menu.studentName = student.studentList[0].fullName;
          const payment = await unicashController.searchPayment(
            menu.token,
            menu.schoolId,
            menu.studentId
          );

          if (payment && payment.status === "SUCCESS") {
            menu.paymentAmount = payment.bills[0].amount;
            menu.menu = "confirmUnicashPayment";
            menu.billID = payment.bills[0].billID;
            menu.message = `${lang[local].fName}: ${menu.studentName}\n${lang[local].schoolName}: ${menu.schoolName}\n${lang[local].paymentAmount}: ${menu.paymentAmount} ETB\n${lang[local].confirmPayment}`;
          } else {
            menu.message = `${lang[local].fName}: ${menu.studentName}\n${lang[local].schoolName}: ${menu.schoolName}\n${lang[local].noPaymentDetails}`;
          }
        } else {
          menu.message = lang[local].studentNotFound;
        }
        break;

      case "confirmUnicashPayment":
        if (msg === "1") {
          const fundTransfer = await unicashController.fundTransfer(
            menu.paymentAmount,
            menu.fromAccount,
            menu.toAccount
          );
          if (fundTransfer && fundTransfer.responseCode === 0) {
            menu.transactionId = fundTransfer.referenceNumber;
            const settleRes = await unicashController.settlePayment(
              menu.token,
              menu.billID,
              menu.paymentAmount,
              menu.transactionId
            );
            // if (true) {
            //   menu.transactionId = "USSD1234567800999342";
            //   const settleRes = await unicashController.settlePayment(
            //     menu.token,
            //     menu.billID,
            //     menu.paymentAmount,
            //     menu.transactionId
            //   );

            if (settleRes && settleRes.status === "SUCCESS") {
              menu.action = "end";
              menu.message = lang[local].paymentSuccess;
            } else {
              menu.message = lang[local].paymentFailed;
            }
          } else {
            menu.message = lang[local].paymentFailed;
          }
        } else {
          menu.action = "end";
          menu.message = lang[local].cancelled;
        }
        break;
    }
  }

  await jsonCache.set(from, menu);
  return menu;
};
