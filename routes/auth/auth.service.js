const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");

const User = require("../../models/user");
const jwt = require("jsonwebtoken");

/**
 * 회원가입
 */
exports.join = async (req, res, next) => {
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
};

/**
 * local 전략 로그인
 */
exports.login = (req, res, next) => {
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
};

/**
 * local 전략 로그아웃
 */
exports.logout = (req, res) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  req.logout();
  req.session.destroy();
  res.status(200).json({ msg: "로그아웃 성공" });
};

/**
 * jwt 전략, 토큰생성
 */
exports.getToken = async (req, res) => {
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
            id: user.id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
            issuer: "CHYOO",
          }
        );
        res.status(200).json({ msg: "토큰 발급 성공", token });
      } else {
        res.status(400).json({ msg: "아이디와 비밀번호를 확인해주세요." });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "서버 에러" });
  }
};

/**
 * jwt 토큰 삭제
 */
exports.removeToken = (req, res) => {
  res.status(200).json({ msg: "로그아웃" });
};

/**
 * 카카오 페이지에서 로그인 성공하면 kakaoStrategy 전략 실행
 */
exports.kakaoCallback = (req, res) => {
  res.status(200).json({ msg: "카카오 로그인" });
};
