export const DELETE_USER_ACCOUNT =
  "DELETE FROM userAccount WHERE mobile = ${mobile}";

export const SELECT_USER_ACCOUNT =
  "SELECT * FROM userAccount WHERE mobile = ${mobile}";

export const SELECT_USSD_CUSTOMER =
  "SELECT * FROM ussdCustomer WHERE mobile = ${mobile}";

export const INSERT_USSD_CUSTOMER =
  "INSERT INTO ussdCustomer (mobile, customerName, city, status) VALUES (?, ?, ?, ?)";

export const INSERT_USER_ACCOUNT_1 =
  "INSERT INTO userAccount (mobile, accountNumber, customerId, status) VALUES (?, ?, ?, ?)";

export const INSERT_USER_ACCOUNT_2 =
  "INSERT INTO userAccount (mobile, customerName, customerNo, accountNumber, status) VALUES (?, ?, ?, ?, ?)";

export const DELETE_USER_ACCOUNT_BY_NO =
  "DELETE FROM userAccount WHERE mobile = ? AND customerNo = ? AND accountNumber = ?";

export const SELECT_MEMBER = "SELECT * FROM member WHERE mobile = ${mobile}";
export const CREATE_USSD_CUSTOMER_TABLE = `
  CREATE TABLE IF NOT EXISTS ussdCustomer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile VARCHAR(255) NOT NULL UNIQUE,
    customerName VARCHAR(255),
    mpin VARCHAR(255),
    city VARCHAR(255),
    status VARCHAR(255) DEFAULT 'false'
  );
`;

export const CREATE_USER_ACCOUNT_TABLE = `
  CREATE TABLE IF NOT EXISTS userAccount (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile VARCHAR(255) NOT NULL,
    customerNo VARCHAR(255),
    customerName VARCHAR(255),
    accountNumber VARCHAR(255),
    status VARCHAR(255) DEFAULT '0'
  );
`;

export const CREATE_BALANCE_INQUERY_TABLE = `
  CREATE TABLE IF NOT EXISTS balanceInquery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile VARCHAR(255) NOT NULL,
    AccountHolderName VARCHAR(255),
    AvailableBalance VARCHAR(255),
    Currency VARCHAR(255)
  );
`;

export const CREATE_MINISTATEMENT_TABLE = `
  CREATE TABLE IF NOT EXISTS ministatment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile VARCHAR(255) NOT NULL,
    TransactionDate VARCHAR(255),
    TransactionCreditAmount VARCHAR(255),
    TransactionDebitAmount VARCHAR(255)
  );
`;

export const CREATE_MEMBER_TABLE = `
  CREATE TABLE IF NOT EXISTS member (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mobile VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(255)
  );
`;
