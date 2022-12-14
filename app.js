const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");
const passportConfig = require("./passport");
var swaggerUi = require("swagger-ui-express");

// dotenv는 최대한 위에
dotenv.config();
const routes = require("./routes");

const { sequelize } = require("./models");

const app = express();

// 개발, 배포할 때 포트를 다르게
app.set("port", process.env.PORT || 3001);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database...connect...success");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// router에 가기 전에 작성
// 로그인 후에 그 다음 요청부터 passport session이 실행될 때 deserializeUser가 실행됨
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.use("/", routes);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(require("./config/swaggerDoc"))
);
// 404처리
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} - NOT FOUND`);
  error.status = 404;
  next(error);
});

//error middleware (next를  반드시 써야함)
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res
    .status(err.status || 500)
    .json({ msg: res.locals.message, err: res.locals.error });
});

app.listen(app.get("port"), () => {
  console.log(`
  ##############################
  Server listening on port : ${app.get("port")}
  ##############################
  `);
});
