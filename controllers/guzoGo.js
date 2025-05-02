const { json } = require("express");
const constants = require("../_util/guzo");
const configs = require("../conf.d");
intel = configs.apiConfig();
const server = require("../ussd"),
  serverConfig = configs.getServerConfig(),
  ussd = server.init(serverConfig),
  model = require("../models/customer");
axios = require("axios");

http = ussd.http;
exports.checkPNR = async (pnr) => {
  // get PNR
  let data = {
    pnr: pnr,
  };

  let headers = {
    secret_key: constants.secret_key,
    customer_id: constants.customer_id,
    "Content-Type": "application/json",
  };

  // Check if the pnr is valid
  if (!pnr) {
    throw new Error("PNR is required");
  }

  // Configure the Axios request properly
  let config = {
    method: "post",
    url: intel.checkPNR,
    headers: headers,
    data: data, // Use 'data' instead of 'body'
  };

  try {
    let response = await axios(config);

    if (response.status == 200) {
      return response.data;
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error during the API request:", error);
    // Handle the error accordingly or rethrow if needed
    throw error;
  }
};

exports.payGuzo = async (transactionID, amount, debitorAccount) => {
  //get PNR
  let data = {
    request_id: transactionID,
    amount: amount,
    debitorAccount: debitorAccount,
  };
  let headers = {
    secret_key: constants.secret_key,
    customer_id: constants.customer_id,
    "Content-Type": "application/json",
  };
  let config = {
    method: "post",
    url: intel.payGuzo,
    headers: headers,
    data: data,
  };
  try {
    let response = await axios(config);
    console.log({ data });
    if (response.status == 200) {
      return response;
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error during the API request:", error);
    // Handle the error accordingly or rethrow if needed
    throw error;
  }
  // send the pnr to the api
  //check response
};
exports.verifyPayment = async (
  pnr,
  customer_phone,

  transactionID
) => {
  let customerRecord = await model.customerInformation(customer_phone);
  let customerName;
  console.log({ name: customerRecord });
  if (customerRecord.data.length > 0) {
    // Accessing the customerName property
    customerName = customerRecord.data[0].customerName;
    console.log("Customer Name: ", customerName);
  } else {
    console.log("No customer found.");
  }
  let data = {
    pnr: pnr,
    depositor_name: customerName,
    depositor_phone: customer_phone,
    tin_number: "",
    company_name: "",
    request_id: transactionID,
  };
  console.log({ data });
  let headers = {
    secret_key: constants.secret_key,
    customer_id: constants.customer_id,
    "Content-Type": "application/json",
  };
  let config = {
    method: "post",
    url: intel.verifyPaymentGuzo,
    headers: headers,
    data: data,
  };
  try {
    let response = await axios(config);
    console.log({ response });
    if (response.status == 200) {
      return response.data;
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error during the API request:", error);
    // Handle the error accordingly or rethrow if needed
    throw error;
  }

  // send the pnr to the api
  //check response
};
