var exports = (module.exports = {});
const configs = require("../conf.d"),
  server = require("./../ussd"),
  JSEncrypt = require("./Encryption.js"),
  serverConfig = configs.getServerConfig(),
  intel = configs.apiConfig(),
  tokenconfig = configs.getTokenConfig,
  moment = require("moment"),
  userDataConfig = configs.getUserDataConfig,
  axios = require("axios"),
  ussd = server.init(serverConfig),
  appServer = ussd.app,
  log = ussd.log,
  http = ussd.http;

function encryptPassowrd(pinCode) {
  try {
    var salt =
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA32rpoAO6Obi/4kydkyqHTd5Co5vfXatm/hTBlUVy66hlHpINiyHWcQUlRpPka0YLB4oEReccCzfJT37+CJ6riJ48wefEslNf2wNFuuBMbykSk4dp6XF+RvbL2Lo6aGhr+ZvSKRDx63OgCp2tarFbbo6WEXQx1HTGTl0A3i8mX02VlHpZMK9m3xSg5XYnEpRUMuGUHJQuhafrRAybPkoAQBrH88Y27os2F+M1cp8OYWUeEo+SRlkVSaWPgauZ6IXwmX5lL6J2dQHQZowHqy6IiYk0bCXsHHCcYBLHeW25wlCqKvstUN/Fud1B/IYBp845rh8bGOZEz4oXjpCm1S09oQIDAQAB";

    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(salt);
    var enc = encrypt.encrypt(pinCode);
    log.info(`encirpted text ${enc}`);
    console.log("meeeeeee", enc);
    return enc;
  } catch (error) {
    log.info(error);
    return false;
  }
}

async function getToken() {
  try {
    var tokenData = {
      grant_type: "password",
      client_secret: "asdfSFS34wfsdfsdfSDSD32dfsddDDerQSNCK34SOWEK5354fdgdf4",
      client_id: "131804060198305",
      username: "SYSADMIN2",
      password: "SYSADMIN2",
      scope: "openid offline_access",
    };

    let tokenkey = await axios
      .post(intel.tokenURL, tokenData, {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      })
      .then(function (response) {
        if (response.data.access_token) {
          log.info(response.data.access_token);
          return response.data.access_token;
        } else {
          log.info(response);
          return false;
        }
      })
      .catch(function (error) {
        log.info(error);
        return true;
      });

    return tokenkey;
  } catch (error) {
    tokenkey = false;
    log.error(`getToken API ERROR start ####################  ${mobile}`);
    log.error(error);
    log.error(`getToken API ERROR end  ####################  ${mobile}`);
    return false;
  }
  return tokenkey;
}

exports.setMPin = async function (mobile, pinCode, customerId) {
  let deviceId = " " + mobile;
  let token = await getToken();

  // log.info(`token key is  : ${token}`);
  let encrption = await encryptPassowrd(pinCode);
  // log.info(` encrption key is ${encrption}`);
  log.info(token);
  if (token && encrption) {
    var userData = {
      usrTicket: token,
      deviceId: deviceId,
      deviceType: "ussd",
      deviceOS: "IOS",
      custId: customerId,
      mobileNo: mobile,
      userId: customerId,
      mPin: encrption,
      ipAddress: "10.20.0.21",
    };
    log.info(userDataConfig);
    console.log("##############################");
    console.log(userData);
    console.log(userDataConfig);
    log.info(userData);
    let mpin = await axios
      .post(intel.setMPin, userData, {
        headers: { "content-type": "application/json" },
      })
      .then(function (response) {
        log.info(response);
        if (response.data.responseCode === 0) {
          log.info(response.data);
          return response.data;
        } else {
          log.info(`set MPIN response start ************* ${mobile}`);
          log.info(response.data);
          log.info(`set MPIN response end   **************`);
          return {
            status: true,
            prevStatus: null,
            responseMsg: null,
            responseCode: null,
            sessionValReq: null,
          };
        }
      })
      .catch(function (error) {
        // log.info(error);

        log.error(`set MPIN ERROR start ####################  ${mobile}`);
        log.error(error);
        log.info(`set MPIN ERROR end  ####################  ${mobile}`);
        return {
          status: false,
          prevStatus: null,
          responseMsg: null,
          responseCode: null,
          sessionValReq: null,
        };
      });

    return mpin;
  } else {
    return {
      status: false,
      prevStatus: null,
      responseMsg: null,
      responseCode: null,
      sessionValReq: null,
    };
  }
};

exports.verifyMPin = async function (mobile, customerId, pinCode) {
  let deviceId = "611AHADUUSSD" + mobile;
  console.log("device ID", deviceId);
  let token = await getToken();
  console.log("Heeellloooo", token);
  let encrption = await encryptPassowrd(pinCode);
  // let encrption =
  //("Oug/3N+uflGFzG0t5kBiMT0aLUiHQ3DrnKud1ZGlmc3q8e+LePTZUl00a1GM10Hx7jfClN9S8y8EJeqBgykx03+VD/zJ30R0185t9lXGgjnehx4hAZ96hstF+30JyAaKSx9/dLsltUKJcjD4w994v9hgoaabvW8X1UnTRnR30U6YMd6TzTk7zj3Gvp1/cI7r9POhNnNPkaIWLnQP/phTKVVDps4twjjd/VpFrz1CjgXo/pOMRqXsFcsuvnS8ERP/i7QbgeJjwcZnChQPHHS5u2l3cQgOSKyj+On9yDOO+4XI95vpPWujuK/ezx1ayRTtpmlpJqwD4x7pbGTpFDtN9g==");
  if (token && encrption) {
    var userData = {
      usrTicket: token,
      deviceId: deviceId,
      deviceType: "ussd",
      deviceOS: "IOS",
      custId: customerId,
      mobileNo: mobile,
      userId: customerId,
      mPin: encrption,
      ipAddress: "10.20.0.21",
    };
    log.debug(`set MPIN payload for ${mobile}  are:`);
    log.debug(userData);
    log.info(userData);
    console.log("Verfify MPIN ######");
    console.log(userData);
    let mpin = await axios
      .post(intel.verifyMPin, userData, {
        headers: { "content-type": "application/json" },
      })
      .then(function (response) {
        log.debug(`set MPIN response for ${mobile}  are:`);
        log.debug(response);
        if (response.data.responseCode === 0) {
          log.info(
            `set MPIN successfull for mobile number ${mobile} and response are  ${response.data.responseCode}`
          );
          log.debug(
            `************* START set MPIN successful response for mobile number ${mobile}*************`
          );
          log.debug(response.data);
          log.debug(
            `************* END set MPIN successful response for mobile number ${mobile}*************`
          );
          log.info(response.data);
          return response.data;
        } else {
          log.error(
            `set MPIN response wtih error start ************* ${mobile}`
          );
          log.info(response.data);
          log.info(`set MPIN response end   **************`);
          return {
            status: true,
            prevStatus: null,
            responseMsg: null,
            responseCode: null,
            sessionValReq: null,
          };
        }
      })
      .catch(function (error) {
        log.error(
          `#################### START set MPIN ERROR for mobile number ${mobile}####################`
        );

        log.error(
          `#################### END set MPIN ERROR for mobile number ${mobile}####################`
        );

        return {
          status: false,
          prevStatus: null,
          responseMsg: null,
          responseCode: null,
          sessionValReq: null,
        };
      });

    return mpin;
  } else {
    return {
      status: false,
      prevStatus: null,
      responseMsg: null,
      responseCode: null,
      sessionValReq: null,
    };
  }
};

exports.changeMPin = async function (mobile, currentPin, newPIn, customerId) {
  let deviceId = "611AHADUUSSD" + mobile;
  let token = await getToken();
  let oldPin = await encryptPassowrd(currentPin);
  let pin = await encryptPassowrd(newPIn);
  if (token && oldPin && pin) {
    var userData = {
      usrTicket: token,
      deviceId: deviceId,
      deviceType: "ussd",
      deviceOS: "IOS",
      custId: customerId,
      mobileNo: mobile,
      userId: customerId,
      mPin: pin,
      oldMPin: oldPin,
      ipAddress: "10.20.0.21",
    };
    log.debug(`set MPIN payload for ${mobile}  are:`);
    log.debug(userData);
    let mpin = await axios
      .post(intel.changeMPin, userData, {
        headers: { "content-type": "application/json" },
      })
      .then(function (response) {
        log.debug(`set MPIN response for ${mobile}  are:`);
        log.debug(response);
        if (response.data.responseCode === 0) {
          log.info(
            `set MPIN successfull for mobile number ${mobile} and response are  ${response.data.responseCode}`
          );
          log.debug(
            `************* START set MPIN successful response for mobile number ${mobile}*************`
          );
          log.debug(response.data);
          log.debug(
            `************* END set MPIN successful response for mobile number ${mobile}*************`
          );
          log.info(response.data);
          return response.data;
        } else {
          log.error(
            `set MPIN response wtih error start ************* ${mobile}`
          );
          log.info(response.data);
          log.info(`set MPIN response end   **************`);
          return {
            status: true,
            prevStatus: null,
            responseMsg: null,
            responseCode: null,
            sessionValReq: null,
          };
        }
      })
      .catch(function (error) {
        log.error(
          `#################### START set MPIN ERROR for mobile number ${mobile}####################`
        );

        log.error(
          `#################### END set MPIN ERROR for mobile number ${mobile}####################`
        );

        return {
          status: false,
          prevStatus: null,
          responseMsg: null,
          responseCode: null,
          sessionValReq: null,
        };
      });
    return mpin;
  } else {
    return {
      status: false,
      prevStatus: null,
      responseMsg: null,
      responseCode: null,
      sessionValReq: null,
    };
  }
};
exports.resetMPin = async function (mobile, newPIn, customerId) {
  let deviceId = "611AHADUUSSD" + mobile;
  let token = await getToken();
  //let token = true;
  let pin = await encryptPassowrd(newPIn);
  console.log("PIN", pin);
  if (token && pin) {
    var userData = {
      usrTicket: token,
      deviceId: deviceId,
      deviceType: "ussd",
      deviceOS: "IOS",
      custId: customerId,
      mobileNo: mobile,
      userId: customerId,
      mPin: pin,
      ipAddress: "10.20.0.21",
    };
    log.debug(`set MPIN payload for ${mobile}  are:`);
    log.debug(userData);
    let mpin = await axios
      .post(intel.resetMPin, userData, {
        headers: { "content-type": "application/json" },
      })
      .then(function (response) {
        console.log(response);
        log.debug(`set MPIN response for ${mobile}  are:`);
        log.info(response);
        if (response.data.responseCode === 0) {
          log.info(
            `set MPIN successfull for mobile number ${mobile} and response are  ${response.data.responseCode}`
          );
          log.debug(
            `************* START set MPIN successful response for mobile number ${mobile}*************`
          );
          log.debug(response.data);
          log.debug(
            `************* END set MPIN successful response for mobile number ${mobile}*************`
          );
          log.info(response.data);
          return response.data;
        } else {
          log.error(
            `set MPIN response wtih error start ************* ${mobile}`
          );
          log.info(response.data);
          log.info(`set MPIN response end   **************`);
          return {
            status: true,
            prevStatus: null,
            responseMsg: null,
            responseCode: null,
            sessionValReq: null,
          };
        }
      })
      .catch(function (error) {
        log.error(
          `#################### START set MPIN ERROR for mobile number ${mobile}####################`
        );

        log.error(
          `#################### END set MPIN ERROR for mobile number ${mobile}####################`
        );

        return {
          status: false,
          prevStatus: null,
          responseMsg: null,
          responseCode: null,
          sessionValReq: null,
        };
      });
    return mpin;
  } else {
    return {
      status: false,
      prevStatus: null,
      responseMsg: null,
      responseCode: null,
      sessionValReq: null,
    };
  }
};

exports.addUser = async function (mobile, customerName, customeId) {
  let oneYear = moment().add(1, "years").calendar();
  let oneYearFormat = moment(oneYear).format("YYYY-MM-DD");
  let [first, ...second] = customerName.split(" ");
  let firstName = first;
  let lastName = second[0];
  let email = firstName + "@ahadubank.com";

  let token = await getToken();
  log.info(`token for addUser ` + token);
  if (token) {
    var userData = {
      ticket: token,
      userId: customeId,
      nickName: customeId,
      firstName: firstName,
      lastName: lastName,
      emailAddress: email,
      mobileNumber: mobile,
      groupName: "ARMIMPLGROUP",
      entityList: "Bank",
      authType: 1,
      userType: 3,
      mailIdFlag: 1,
      expiryDate: oneYearFormat,
    };
    log.info(userData);
    let user = await axios
      .post(intel.addUser, userData, {
        headers: { "content-type": "application/json" },
      })
      .then(function (response) {
        log.info(response);
        if (response.data.responseCode === 0) {
          log.info(response.data);
          return response.data;
        } else {
          log.info(`set MPIN response start ************* ${mobile}`);
          log.info(response.data);
          log.info(`set MPIN response end   **************`);
          return {
            status: true,
            prevStatus: null,
            responseMsg: null,
            responseCode: null,
            sessionValReq: null,
          };
        }
      })
      .catch(function (error) {
        // log.info(error);
        log.error(`set MPIN ERROR start ####################  ${mobile}`);
        log.error(error);
        log.info(`set MPIN ERROR end  ####################  ${mobile}`);
        return {
          status: false,
          prevStatus: null,
          responseMsg: null,
          responseCode: null,
          sessionValReq: null,
        };
      });

    return user;
  } else {
    return {
      status: false,
      prevStatus: null,
      responseMsg: null,
      responseCode: null,
      sessionValReq: null,
    };
  }
};
