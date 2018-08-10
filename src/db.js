const mysql = require('promise-mysql');

/**
 * Simple connection to DB using envrionment variables from serverless.yml
 */
async function connect(){
  var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }).catch(function(error){
    console.log(error);
    throw error;
  });
  return connection;
}

module.exports = {
  connect
}
