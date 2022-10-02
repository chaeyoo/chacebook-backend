const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ msg: "로그인 필요" });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ msg: "로그인한 상태입니다." });
  }
};

exports.isAuthenticated = (req, res, next) => {       
  return passport.authenticate('jwt', {session : false});
};
