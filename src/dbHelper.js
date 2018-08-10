const db = require('./db');

async function connect(){
  return db.connect();
}

async function initializeDatabase(){
  // I am clearing the data each time the lambda is run so that you can test the
  // behaviour with different datasets you may want to test.
  // I still honour the requirement that the user_temp table is only created if it doesn't
  // exist in the query itself.
  await dropTable('user_temp');
  await dropTable('user_profile');
  await dropTable('user');
  await createUserTable();
  await createUserProfileTable();
  // Change the data in the below function to add additional user records
  await populateUserData();
  // Change the data in the below function to add additional user_profile records
  await populateUserProfileData();
}

/**
 * Populates the user table with an initial set of data
 */
async function populateUserData(){
  return connect().then(function(connection){
    var users = [
      // id, first_name, last_name
      [5,'Mick','Baskers'],
      [10,'Dave','Bob'],
      [20,'Tom','Banana']
    ];
    let sql = `insert into user (id, first_name, last_name) values ?`;
    let result = connection.query(sql,[users]);
    connection.end();
    return result;
  }).then(function(result){
    return result;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

/**
 * Populates the user_profile table with an initial set of data
 */
async function populateUserProfileData(){
  return connect().then(function(connection){
    var userProfiles = [
      // id, name, data, user_id
      [111,'sports','hockey',5],
      [222,'job','developer',5],
      [333,'kids','2',5],
      [444,'job','captain',10],
      [555,'transport','plane',10]
    ];
    let sql = `insert into user_profile (id, name, data, user_id) values ?`;
    let result = connection.query(sql,[userProfiles]);
    connection.end();
    return result;
  }).then(function(result){
    return result;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

/**
 * Will drop a table if it exists
 * @param {*} tableName
 */
async function dropTable(tableName){
  return connect().then(function(connection){
    let result = connection.query(`drop table if exists ${tableName};`);
    connection.end();
    return result;
  }).then(function(result){
    return result;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

/**
 * Creates the base user table
 */
async function createUserTable(){
  return connect().then(function(connection){
    let sql = `CREATE TABLE user (
      id int(11) NOT NULL AUTO_INCREMENT,
      first_name varchar(255) DEFAULT NULL,
      last_name varchar(255) DEFAULT NULL,
      PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
    let result = connection.query(sql);
    connection.end();
    return result;
  }).then(function(result){
    return result;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

/**
 * Creates the base user_profile table
 */
async function createUserProfileTable(){
  return connect().then(function(connection){
    let sql = `CREATE TABLE user_profile (
      id int(11) NOT NULL,
      name varchar(32) DEFAULT NULL,
      data text,
      user_id int(11) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY user_id (user_id),
      CONSTRAINT user_profile_foreign_key FOREIGN KEY (user_id) REFERENCES user (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
    let result = connection.query(sql);
    connection.end();
    return result;
  }).then(function(result){
    return result;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

module.exports = {
  initializeDatabase
}
