var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  axios = require("axios"),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  log = ussd.log,
  http = ussd.http;

exports.funTransfer = async function (
  mobile,
  fromAccount,
  toAccount,
  amount,
  remark,
  currency
) {
  id = new Date().getTime().toString(36) + Math.random().toString(36).slice(10);
  var transferData = {
    RequestId: "USSD" + id,
    TransactionAmount: amount,
    TransferCurrency: "ETB",
    DebtorAccount: fromAccount,
    CreditorAccount: toAccount,
    CreditorAccountCurrency: "ETB",
    DebtorAccountCurrency: "ETB",
    TransactionDescription: remark,
  };
  console.log(transferData);
  try {
    var transferResponse = await http
      .post(intel.fundTransfer, transferData)
      .then(function (response) {
        console.log(response);
        log.info(
          `Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`
        );
        // if(Number(response.data.errorCode) === 0){
        if (
          transferResponse &&
          Number(transferResponse.data.responseCode) === 0
        ) {
          let tnxRecord = response.data.Response.Records;
          return {
            errorCode: response.data.errorCode,
            Records: tnxRecord,
            customerName: "",
            balance: "",
            Currency: "",
          };
        } else if (
          transferResponse &&
          Number(transferResponse.data.responseCode) === 0
        ) {
          return {
            errorCode: response.data.errorCode,
            Records: "",
            customerName: "",
            balance: "",
            Currency: "",
          };
        } else {
        }
        // }else {
        // 	log.info(`Get account by Phone for customer ${mobile} response with errorCode  : ${response.data.errorCode}`  );
        // 	return {'errorCode': response.data.errorCode,'customerName' : null , 'balance' : null}
        // }
      })
      .catch(function (error) {
        log.info(error);
        return {
          errorCode: null,
          Records: null,
          customerName: null,
          balance: "",
          Currency: "",
        };
      });
    return miniStatement;
  } catch (error) {
    return {
      errorCode: null,
      Records: null,
      customerName: null,
      balance: "",
      Currency: "",
    };
  }
};
