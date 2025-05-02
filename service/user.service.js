const db = require ('../models');

class UserServices {
  static async finduserById(id) {
    try {
      const user = await db.User.findByPk(id);
      if (!user) return null;
      return user;
    } catch (error) {
      return undefined;
    }
  }
  static async  updateUser(id, data) {
    const user = await this.getUserById(id);
    Object.assign(user, data);
    await user.save();

    return user;
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
  static async  getUserById(id) {
    const user = await db.User.findByPk(id);
    if (!user) return false;
    return user;
}

}
module.exports = UserServices;
