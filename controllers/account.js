var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("../ussd"),
  moment = require("moment"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  axios = require("axios"),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  log = ussd.log,
  http = ussd.http;

exports.accountList = async function (mobile) {
  console.log("Calling API:", intel.accByPhone + mobile);

  const IntellectAPI = http.create({
    baseURL: intel.accByPhone + mobile,
    timeout: 20000,
  });
  try {
    var isActive = await IntellectAPI.get()
      .then(function (response) {
        if (Number(response.data.errorCode) === 0) {
          if (response.data.accountDetails) {
            let accounts = [];
            let userAccounts = response.data.accountDetails;
            log.info(userAccounts);
            for (let index = 0; index < userAccounts.length; index++) {
              const acc = userAccounts[index].accountNumber;
              accounts.push(acc);
            }
            let permissions = [];
            for (let index = 0; index < userAccounts.length; index++) {
              const acc = userAccounts[index].accountNumber;
              if (userAccounts[index].sms_opern === "1") {
                permissions.push(acc);
              }
            }
            return {
              errorCode: response.data.errorCode,
              accounts: accounts,
              permissions: permissions,
            };
          } else
            return {
              errorCode: response.data.errorCode,
              accounts: [],
              permissions: null,
            };
        } else {
          return { errorCode: "2", accounts: null, permissions: null };
        }
      })
      .catch(function (error) {
        // log.info(error);
        return { errorCode: null, accounts: null, permissions: null };
      });
    return isActive;
  } catch (error) {
    return { errorCode: null, accounts: null, permissions: null };
  }
};
exports.dob = async function (accountNo) {
  let data = JSON.stringify({
    account_number: accountNo,
  });
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://10.1.10.15/ahb_no_of/ussdGetDOB",
    headers: {
      secret_key: "AUbfMiAyGkajI2",
      customer_id: "ONETAP",
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    var customerDetail = await axios(config)
      .then(function (response) {
        if (response.status === 200 && response.data.BIRTH_DATE) {
          return { errorCode: "1", limit: response.data };
        } else return { errorCode: "0", limit: null };
      })
      .catch(function (error) {
        return { errorCode: "2", limit: null };
      });
    return customerDetail;
  } catch (error) {
    return { errorCode: null, limit: null };
  }
};
exports.airtime = async function (fromAccount, amount, toAccount) {
  id =
    new Date().getTime().toString(10).toUpperCase() +
    Math.random().toString(10).toUpperCase();
  let mobile = "251" + toAccount.slice(-9);
  let data = JSON.stringify({
    debitAc: fromAccount,
    amount: amount,
    mobile: mobile,
    RequestId: id.substring(0, 10),
    RequestTime: Math.floor(Date.now() / 1000).toString(),
    ChannelID: "USSD",
  });
  console.log(data);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://10.1.11.38:7034/olive/publisher/QuantumTopup",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    var airTimeResponse = await axios(config)
      .then(function (response) {
        console.log(response);
        if (
          response.status === 200 &&
          response.data.status_desc === "Success"
        ) {
          return { errorCode: 1, airtime: response.data };
        } else return { errorCode: 0, airtime: null };
      })
      .catch(function (error) {
        console.log(error);
        return { errorCode: 2, airtime: null };
      });
    return airTimeResponse;
  } catch (error) {
    return { errorCode: null, airtime: null };
  }
};
exports.accountDetails = async function (mobile, accountNumber) {
  try {
    let data = {
      AccountId: accountNumber,
    };
    let response = await http
      .post(intel.accDetail, data)
      .then(function (response) {
        if (response.data.Response) {
          return {
            status: response.data.Response.TxnStatus,
            data: response.data.Response,
          };
        } else {
          log.info(response.data.Response);
          return { status: 1, data: null };
        }
      })
      .catch(function (error) {
        log.info(error);
        return { status: 0, data: null };
      });
    return response;
  } catch (error) {
    log.info(error);
    return { status: 0, data: null };
  }
};
exports.fundTrasnfer = async function (
  mobile,
  amount,
  fromAccount,
  toAccount,
  remark
) {
  try {
    id =
      new Date().getTime().toString(36).toUpperCase() +
      Math.random().toString(36).toUpperCase().slice(9);
    var transferData = {
      RequestId: id,
      TransactionAmount: amount,
      TransferCurrency: "ETB",
      DebtorAccount: fromAccount,
      CreditorAccount: toAccount,
      CreditorAccountCurrency: "ETB",
      DebtorAccountCurrency: "ETB",
      TransactionDescription: remark,
    };
    log.info(transferData);
    let response = await http
      .post(intel.fundTransfer, transferData)
      .then(function (response) {
        console.log(response);
        console.log(response.data);
        if (response.data.responseCode) {
          return { status: response.data.responseCode, data: response.data };
        } else {
          log.info("**************************************");
          log.info(response);
          log.info(response.data);
          return { status: null, data: null };
        }
      })
      .catch(function (error) {
        log.info(error);
        return { status: null, data: null };
      });
    return response;
  } catch (error) {
    log.info(error);
    return { status: null, data: null };
  }
};
exports.linkAccount = async function (mobile, accountNumber) {
  try {
    let data = {
      mobileNo: mobile,
      AccountNum: accountNumber,
    };
    log.info();
    console.log({ data });
    let response = await http
      .post(intel.GetCustomerId, data)
      .then(function (response) {
        log.info(response.data.data);
        if (response.data) {
          console.log("from register menu", response.data);
          return { status: response.data.responsecode, data: response.data };
        } else {
          return { status: null, data: null };
        }
      })
      .catch(function (error) {
        log.info(error);
        console.log("from register menu error", error);
        return { status: null, data: null };
      });
    return response;
  } catch (error) {
    log.info(error);
    return { status: null, data: null };
  }
};
exports.teleBirrTrasnfer = async function (
  mobile,
  amount,
  fromAccount,
  remark
) {
  try {
    id =
      new Date().getTime().toString(36).toUpperCase() +
      Math.random().toString(36).toUpperCase().slice(9);
    let currentTime = moment();
    var transferData = {
      OriginatorConversationID: id,
      Timestamp: moment(currentTime, "YYYYMMDDhhmmss").format("YYYYMMDDhhmmss"),
      sourceAccount: fromAccount,
      ReceiverParty: {
        IdentifierType: "1",
        Identifier: mobile,
      },
      Amount: amount,
      Currency: "ETB",
      Remark: remark,
    };
    log.info(transferData);
    let response = await http
      .post(intel.teleBirr, transferData)
      .then(function (response) {
        log.info(response.data.Response);
        if (response.data.Response.Body.ResponseCode === "0") {
          return {
            status: response.data.Response.Body.ResponseCode,
            data: response.data.Response,
          };
        } else {
          return { status: response.data.ResponseCode, data: null };
        }
      })
      .catch(function (error) {
        log.info(error);
        return { status: null, data: null };
      });
    return response;
  } catch (error) {
    log.info(error);
    return { status: null, data: null };
  }
};
exports.teleBirrEnquiry = async function (mobile, remark) {
  try {
    id =
      new Date().getTime().toString(36).toUpperCase() +
      Math.random().toString(36).toUpperCase().slice(9);
    let currentTime = moment();

    var transferData = {
      OriginatorConversationID: id,
      Timestamp: moment(currentTime, "YYYYMMDDhhmmss").format("YYYYMMDDhhmmss"),
      ReceiverParty: {
        IdentifierType: "1",
        Identifier: mobile,
      },
      Remark: remark,
    };
    log.info(transferData);
    console.log("transferData", transferData);
    let response = await http
      .post(intel.teleBirrEnquiry, transferData)
      .then(function (response) {
        log.info(response.data.Response);
        if (response.data.ResultCode === "0") {
          return { status: response.data.ResultCode, data: response.data };
        } else {
          return { status: response.data.ResultCode, data: null };
        }
      })
      .catch(function (error) {
        log.info(error);
        return { status: null, data: null };
      });
    return response;
  } catch (error) {
    log.info(error);
    return { status: null, data: null };
  }
};
exports.UtilityPay = async function (
  mobile,
  amount,
  fromAccount,
  remark,
  utilityType
) {
  try {
    id =
      new Date().getTime().toString(36).toUpperCase() +
      Math.random().toString(36).toUpperCase().slice(9);
    var UtilityPayData = {
      UtilityTypecd: utilityType,
      SourceAccount: fromAccount,
      Amount: amount,
      Currency: "ETB",
      Remarks: remark,
      RequestId: id,
    };
    let response = await http
      .post(intel.UtilityPay, UtilityPayData)
      .then(function (response) {
        if (response.data.responseCode === 0) {
          return { status: response.data.responseCode, data: response.data };
        } else {
          log.info(response.data);
          return {
            status: response.data.responseCode,
            data: response.data.Response,
          };
        }
      })
      .catch(function (error) {
        log.info(error);
        return { status: null, data: null };
      });
    return response;
  } catch (error) {
    log.info(error);
    return { status: null, data: null };
  }
};
