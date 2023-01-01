/* eslint-disable prettier/prettier */
const swaggerJSDoc = require("swagger-jsdoc");

var swaggerDefinition = {
  info: {
    title: "chacebook-post-server",
    version: "1.0.0",
    description: "chacebook-post-server API DOCs",
  },
  host: "localhost:3001", // base-url
  basePath: "/", // base path
};

var options = {
  swaggerDefinition: swaggerDefinition,
  apis: [__dirname + "/../routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
