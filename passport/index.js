const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const jwtStrategy = require("./jwtStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.email); // session에 user의 id만 저장, id만 있어도 사용자 정보 가져올 수 있음
  });

  // 사용자 정보를 복구해서 씀
  passport.deserializeUser((id, done) => {
    User.findOne({ where: { email: id } })
      .then((user) => done(null, user)) // req.user, req.isAuthenticated() 함수 사용 가능
      .catch((err) => done(err));
  });

  local();
  // kakao();
  jwtStrategy();
};
