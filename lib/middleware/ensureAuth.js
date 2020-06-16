const User = require('../models/User');

// this reads the session cookie, verifies it, then sets the req.user to the owner of the session cookie, i.e. the User
module.exports = (req, res, next) => {
  const token = req.cookies.session;
  const user = User.verifyToken(token);
  req.user = user;

  next();
};
