const axios = require("axios");
const constants = require("../_util/guzo");
const configs = require("../conf.d");
intel = configs.apiConfig();
const server = require("../ussd"),
  serverConfig = configs.getServerConfig(),
  ussd = server.init(serverConfig),
  model = require("../models/customer");
const UNICASH_CREDENTIALS = {
  username: "maker", // Replace with actual
  password: "password",
};

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
});

module.exports = {
  authorize: async () => {
    try {
      const res = await axios.post(intel.uniCashAuth, UNICASH_CREDENTIALS);
      return { token: res.data.token };
    } catch (err) {
      console.error("UniCash auth failed:", err.message);
      return {};
    }
  },

  searchEnterprise: async (token, schoolId) => {
    try {
      console.log("headers", token, schoolId);
      const res = await axios.post(
        intel.searchEnterpriseByCode,
        {
          enterpriseCode: schoolId,
        },
        {
          headers: headers(token),
        }
      );
      return res.data; // Expected { name: "School Name", ... }
    } catch (err) {
      console.error("School search error:", err.message);
      return null;
    }
  },

  searchStudent: async (token, schoolId, studentId) => {
    try {
      const res = await axios.post(
        intel.searchStudent,
        {
          parameter: studentId,
          enterpriseCode: schoolId,
        },
        {
          headers: headers(token),
        }
      );
      return res.data; // Expected { fullName: "Student Name", ... }
    } catch (err) {
      console.error("Student search error:", err.message);
      return null;
    }
  },

  searchPayment: async (token, schoolId, studentId) => {
    try {
      const res = await axios.post(
        intel.searchBill,
        {
          parameter: studentId,
          enterpriseCode: schoolId,
        },
        {
          headers: headers(token),
        }
      );
      return res.data; // Expected { amount: 500, ... }
    } catch (err) {
      console.error("Payment search error:", err.message);
      return null;
    }
  },
  fundTransfer: async (amount, fromAccount, toAccount) => {
    try {
      id =
        new Date().getTime().toString(36) +
        Math.random().toString(36).slice(10);
      const res = await axios.post(intel.fundTransfer, {
        RequestId: "USSD" + id,
        TransactionAmount: amount,
        TransferCurrency: "ETB",
        DebtorAccount: toAccount,
        CreditorAccount: fromAccount,
        CreditorAccountCurrency: "ETB",
        DebtorAccountCurrency: "ETB",
        TransactionDescription: "School Payment",
      });
      return res.data; // Expected { amount: 500, ... }
    } catch (err) {
      console.error("Payment transfer error:", err.message);
      return null;
    }
  },

  settlePayment: async (token, billID, amount, transactionId) => {
    try {
      const res = await axios.post(
        intel.settleBill,
        {
          billId: billID,
          transactionID: transactionId,
          totalAmount: amount,
        },
        {
          headers: headers(token),
        }
      );
      console.log(res.data);
      return res.data;
      // Expected { success: true }
    } catch (err) {
      console.error("Settle payment error:", err.message);
      return null;
    }
  },
};
