const db = require ('../models');

class SessionServices {
  static async createSession(data) {
    try {
      const session = new db.Session(data);
      await session.save();
    } catch (error) {
       console.log(error);;
    }
  }
  static async getSession(id) {
    try {
      const session = await db.Session.findByPk(id);
      if (!session) return null;
      return session;
    } catch (error) {
      return undefined;
    }
  }

  static async  updateSession(id, data) {
    const session = await this.getSessionById(id);
    Object.assign(session, data);
    await session.save();

    return session;
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
  static async  getSessionById(id) {
    const session = await db.Session.findByPk(id);
    if (!session) return false;
    return session;
}

static async destroy(id) {
  const session = await this.getSessionById(id);
  if(session){
    await session.destroy();
  }
}

}
module.exports = SessionServices;
