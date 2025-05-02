var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  lang = require("../conf.d/language.json"),
  serverConfig = configs.getServerConfig(),
  ussd = server.init(serverConfig),
  jsonCache = ussd.jsonCache,
  { v4: uuidv4 } = require("uuid"),
  schoolController = require("../controllers/school"),
  http = ussd.http;

exports.schoolFeeMenu = async (from, msg) => {
  console.log("School Fee Menu", from, msg);
  var menu = await jsonCache.get(from);
  let local = menu.local;

  if (msg === "*") {
    menu.state = "service";
    menu.prestate = "service";
    menu.message = lang[local].service;
  } else {
    switch (menu.menu) {
      // case "selectAccount":
      //   let accountIndex = parseInt(msg) - 1;
      //   if (accountIndex >= 0 && accountIndex < menu.accounts.length) {
      //     menu.selectedAccount = menu.accounts[accountIndex]; // Store selected account
      //     menu.menu = "listSchools"; // Proceed to school selection
      //     menu.message = lang[local].selectSchool;
      //   } else {
      //     menu.message = lang[local].invalidSelection;
      //   }
      //   break;
      case "listSchools":
        let accountIndex = parseInt(msg) - 1;
        if (accountIndex >= 0 && accountIndex < menu.accounts.length) {
          menu.selectedAccount = menu.accounts[accountIndex]; // Store selected account
        } else {
          menu.message = lang[local].invalidSelection;
        }
        console.log("Fetching school details...");
        let schoolResponse = await schoolController.getSchoolList();
        if (schoolResponse.length > 0) {
          menu.schools = schoolResponse;
          menu.menu = "selectSchool";
          let message = lang[local].selectSchool + "\n";
          menu.schools.forEach((school, index) => {
            message += `${index + 1}. ${school.name}\n`;
          });
          menu.message = message;
        } else {
          menu.action = "end";
          menu.message = lang[local].systemError;
        }
        break;

      case "selectSchool":
        let selectedIndex = parseInt(msg) - 1;
        if (selectedIndex >= 0 && selectedIndex < menu.schools.length) {
          menu.selectedSchool = menu.schools[selectedIndex];
          menu.menu = "listBranches";
          let branchResponse = await schoolController.getBranches(
            menu.selectedSchool.id
          );
          if (branchResponse.length > 0) {
            menu.branches = branchResponse;
            let message = lang[local].selectBranch + "\n";
            menu.branches.forEach((branch, index) => {
              message += `${index + 1}. ${branch.name}\n`;
            });
            menu.message = message;
          } else {
            menu.action = "end";
            menu.message = lang[local].noBranches;
          }
        } else {
          menu.message = lang[local].invalidSelection;
        }
        break;

      case "listBranches":
        let branchIndex = parseInt(msg) - 1;
        if (branchIndex >= 0 && branchIndex < menu.branches.length) {
          menu.selectedBranch = menu.branches[branchIndex];
          menu.menu = "enterAdmissionId";
          menu.message = lang[local].enterAdmissionId;
        } else {
          menu.message = lang[local].invalidSelection;
        }
        break;

      case "enterAdmissionId":
        menu.admissionId = msg;
        let paymentDetails = await schoolController.getPaymentDetails(
          menu.selectedSchool.id,
          menu.selectedBranch.id,
          menu.admissionId
        );
        console.log("pamentDetails:", paymentDetails);
        if (paymentDetails.statusCode === 200) {
          menu.paymentDetails = paymentDetails;
          menu.menu = "confirmPayment";
          menu.message = `${lang[local].fName} ${paymentDetails.payments[0].fullName} 
          ${lang[local].feeType} ${paymentDetails.payments[0].feeType} 
          ${lang[local].paymentDetails} ${paymentDetails.payments[0].totalPaymentAmount} ETB.
          ${lang[local].confirmPayment}`;
        } else {
          menu.message = lang[local].noPaymentDetails;
        }
        break;

      case "confirmPayment":
        if (msg === "1") {
          let paymentData = {
            ...menu.paymentDetails.payments[0],
            DebtorAccount: menu.selectedAccount,
          };
          let paymentRes = await schoolController.processPayment(paymentData);
          if (
            paymentRes.successCode === 201 ||
            paymentRes.successCode === 200
          ) {
            menu.action = "end";
            menu.message = "";
            menu.message += lang[local].paymentSuccess + "\n";
            menu.message +=
              lang[local].fName +
              ": " +
              menu.paymentDetails.payments[0].fullName +
              "\n";
            menu.message +=
              lang[local].feeType +
              "" +
              menu.paymentDetails.payments[0].feeType +
              "\n";
            menu.message +=
              lang[local].schoolName + ": " + menu.selectedSchool.name + "\n";
            menu.message +=
              lang[local].paymentAmount +
              "" +
              menu.paymentDetails.payments[0].totalPaymentAmount;
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
