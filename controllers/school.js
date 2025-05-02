const axios = require("axios");
const constants = require("../_util/guzo");
const configs = require("../conf.d");
intel = configs.apiConfig();
const server = require("../ussd"),
  serverConfig = configs.getServerConfig(),
  ussd = server.init(serverConfig),
  model = require("../models/customer");
const headers = {
  "X-API-Key": constants.x_api_key,
  "X-Client-Id": constants.x_client_id,
  Accept: "application/json",
};

/**
 * Fetch list of schools
 */
exports.getSchoolList = async () => {
  try {
    let response = await axios.get(intel.schoolDetail, { headers });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching school list:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null,
    });
    return [];
  }
};

/**
 * Fetch branches of a selected school
 */
exports.getBranches = async (schoolId) => {
  try {
    const response = await axios.get(intel.schoolBranchDetail, {
      headers,
      data: { School_Id: schoolId },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};

/**
 * Fetch payment details for a student
 */
exports.getPaymentDetails = async (schoolId, branchId, admissionId) => {
  try {
    console.log("schoolId", schoolId);
    console.log("branchId", branchId);
    console.log("admissionId", admissionId);
    // schoolId = "79FCE1D7-E78D-4200-CA3E-08DD349F480D";
    // branchId = "53C8D3D9-E88C-422D-BA90-BC15916F0329";
    const response = await axios.post(
      intel.schoolPaymentDetail,
      { schoolId, branchId, admissionId },
      { headers }
    );
    console.log("from payment details 22:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return [];
  }
};

/**
 * Process student fee payment
 */
exports.processPayment = async (paymentData) => {
  try {
    let payload = {
      student_Payment_Id: paymentData.student_Payment_Id,
      Amount: paymentData.amount,
      Discount: paymentData.discountAmount,
      Fine: paymentData.fineAmount,
      OtherPayment: paymentData.otherPaymentAmount,
      TotalAmount: paymentData.totalPaymentAmount,
      ReferenceNumber: `REF-${Date.now()}`,
      Note: "School fee payment",
      DebtorAccount: paymentData.DebtorAccount,
      CreditorAccount: paymentData.creditorAccount,
    };
    console.log("paaayload", payload);
    const response = await axios.post(intel.schoolPaymentTransfer, payload, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error processing payment:",
      error.response?.data || error.message
    );
    return { successCode: 400, message: error.message };
  }
};
