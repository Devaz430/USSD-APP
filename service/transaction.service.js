const db = require ('../models');

class TransactionServices {

  static async  getAll(id) {
    const tnx = await db.Transaction.findAll({where : {userId : id}});
    if (!tnx) return false;
    return tnx;
}
  static async finduserById(id) {
    try {
      const user = await db.User.findByPk(id);
      if (!user) return null;
      return user;
    } catch (error) {
      return undefined;
    }
  }
  static async updateBalance(amount, id) {
    try {
      const user = await db.User.update(
       { amount},
        { id: { id }}
      );
      return user;
    } catch (error) {
      return error;
    }
  }
  static async changePin(pin, id) {
    try {
      const user = await db.User.update(
       { pin},
        { where: { id:id }}
      );
      return user;
    } catch (error) {
      return error;
    }
  }

}
module.exports = TransactionServices;
