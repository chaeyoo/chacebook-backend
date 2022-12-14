const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        let user = await User.findOne({
          where: {
            id: payload.id,
          },
        });
        console.log(user);
        if (!user) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      }
    )
  );
};
