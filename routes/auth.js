const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn, isAuthenticated } = require("./middlewares");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, password, nickName, regNo, modNo } = req.body;
  try {
    const existUser = await User.findOne({ where: { email } });
    if (existUser) {
      return res.status(200).json({ msg: "이미 존재하는 이메일입니다." });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await User.create({
      email,
      password: hash,
      nickName,
      regNo,
      modNo,
    });
    return res
      .status(200)
      .json({ msg: "회원가입이 완료되었습니다.", data: result });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // 서버 에러
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(200).json({ msg: `${info.message}` });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 세션쿠키를 브라우저로 보냄
      return res.status(200).json({ data: user, msg: "로그인 성공" });
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  req.logout();
  req.session.destroy();
  res.status(200).json({ msg: "로그아웃 성공" });
});

router.post("/token", async (req, res) => {
  try {
    let user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        let token = jwt.sign(
          {
            id: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
            issuer: "CHYOO",
          }
        );
        res.status(200).json({ msg: "토큰 발급 성공", token });
      } else {
        res.status(400).json({ msg: "아이디와 비밀번호를 확인해주세요."});
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ msg: "서버 에러" });
  }
});


router.get('/token/logout', isAuthenticated(), (req, res) => {
    res.status(200).json({ msg: "로그아웃"});W
});

router.get('/kakao', passport.authenticate('kakao'))

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.status(200).json({ msg: "카카오 로그인"})
});

module.exports = router;
