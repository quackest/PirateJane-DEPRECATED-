const mysql = require('mysql');
const config = require('../config');
var pool = mysql.createPool({
connectionLimit : 10,
host: config.host,
user: config.user,
database:  config.database,
password:  config.password
});
module.exports = pool;
