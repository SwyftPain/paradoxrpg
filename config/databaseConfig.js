require('dotenv').config()
var mysql = require("mysql");

config = {
  connectionLimit: 10,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBDB,
};

module.exports = {
  connection: mysql.createPool(config),
};
