const dbHelper = require('./dbHelper');
const db = require('./db');
const s3Helper = require('./s3Helper');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function connect(){
  return db.connect();
}

async function receivedMessage(event, context, callback){
  console.log('starting receivedMessage');
  try {
    //initialize the test data
    await dbHelper.initializeDatabase();
    // Create user_temp table
    await createUserTempTable();
    // Populate the user_temp table
    await populateUserTempTable();
    // upload log to S3
    await createLogFile('success','receivedMessage completed Successfully');
    console.log('receivedMessage completed Successfully')
  } catch (error) {
    console.log(error);
    console.log('receivedMessage had errors')
    // upload log file to S3 log
    await createLogFile('error', error);
  }
  callback(null,event);
}

async function createLogFile(status,message){
  console.log('createLogFile');
  return createLogFile(status, message);
}

async function createLogFile(status,message){
  console.log('putObject');
  console.log(process.env.LOG_BUCKET_NAME);
  console.log(`${Date.now()}-log-${status}.json`);
  console.log(`{"result":"${message}"}`);
  return s3.putObject({
    Bucket: process.env.LOG_BUCKET_NAME,
    Key: `${Date.now()}-log-${status}.json`,
    Body: `{"result":"${message}"}`
  }).promise()
    .then(val => {
      console.log('DONE putObject');
      return val;
    }).catch(error => {
      console.log('Log File Failed To Be Uploaded To S3');
      console.log(error);
      throw error;
    });
}


async function populateUserTempTable(){
  // get combined query data
  let records = await getUserAndProfileRecords();
  // get fields of user_temp table
  let fields = await getUserTempFields();
  // map query data to combined record
  let combinedRecords = await mapRecordsToCombinedRecords(records, fields);
  // insert combined records to user_temp table
  let result = await insertRecordsIntoUserTemp(combinedRecords, fields);
  return result;
}

async function mapRecordsToCombinedRecords(records, fields){
  let combinedRecords = [];
  let rec = [];
  records.forEach(record => {
    // Check if user has already got an initial record, if so, use that one, else initialize a new one
    if(combinedRecords[record.uid]){
      rec = combinedRecords[record.uid];
    } else {
      rec = initializeRecord(fields);
    }
    // Set the static fields to the record values
    rec['id'] = record.uid;
    rec['first_name'] = record.first_name;
    rec['last_name'] = record.last_name;
    // Its possible that no user_profile record exists and hence name will be null
    if(record.name){
      // Set the dynamic profile name field to the user_profile id
      rec[`profile_${record.name}`] = record.id;
    }
    combinedRecords[record.uid] = rec;
  })
  return combinedRecords;
}

/**
 * Because there are dynamic fields in the user_temp table, this makes sure that the records all have the
 * same field structure so that the insert becomes easier.
 * @param {*} fields
 */
async function initializeRecord(fields){
  let rec = [];
  fields.forEach(field => {
    rec[field] = 'null';
  });
  return rec;
}

async function insertRecordsIntoUserTemp(combinedRecords, fields){
  let fieldSql = await getUserTempFieldSql(fields);
  let valueSql = await getUserTempValuesSql(combinedRecords, fields);
  let sql = `insert into user_temp (${fieldSql}) values ${valueSql}`;
  return connect().then(connection => {
    let result = connection.query(sql);
    connection.end();
    return result;
  }).then(result => {
    return result;
  }).catch(error => {
    console.log(error);
    throw error;
  })
}

async function getUserTempFieldSql(fields){
  let fieldSql = '';
  let comma = '';
  fields.forEach(field => {
    fieldSql += `${comma}${field}`;
    comma = ',';
  })
  return fieldSql;
}

async function getUserTempValuesSql(combinedRecords, fields){
  let valueSql = '';
  let recordSql = '';
  let valueComma = '';
  let comma = '';
  combinedRecords.forEach(record => {
    recordSql = '';
    comma = '';
    let value = '';
    fields.forEach(field => {
      if(record[field]){
        value = record[field];
      } else {
        value = 'null';
      }
      recordSql += `${comma}'${value}'`;
      comma = ',';
    })
    valueSql += `${valueComma}(${recordSql})`;
    valueComma = ',';
  })
  return valueSql;
}

async function getUserAndProfileRecords(){
  return connect().then(function(connection){
    let result = connection.query("select u.id as uid, u.first_name, u.last_name, up.* from user u left join user_profile up on (u.id = up.user_id)");
    connection.end();
    return result;
  }).then(function(records){
    return records;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

async function getUserTempFields(){
  return connect().then(function(connection){
    let result = connection.query("show columns from user_temp");
    connection.end();
    return result;
  }).then(function(records){
    let fields = [];
    records.forEach(record => {
      fields.push(record.Field);
    })
    return fields;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}


async function createUserTempTable(){
  // Get the SQL for building the user_temp table
  let userTempTableSql = await generateUserTempTableSql();
  return connect().then(function(connection){
    let result = connection.query(userTempTableSql);
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
 * Creates the sql for the user_temp table by getting the distinct 'name' from user_profile
 */
async function generateUserTempTableSql(){
  return connect().then(function(connection){
    // Get the distinct name's from user_profile to generate the columns for user_temp
    let result = connection.query("select distinct name from user_profile");
    connection.end();
    return result;
  }).then(function(rows){
    let userTempDynamicSql = '';
    rows.forEach(record => {
      // Build the dynamic sql using the name field's properties + prefix requirement
      userTempDynamicSql += `profile_${record.name} varchar(32) DEFAULT NULL,`;
    });
    // Combine the dynamic query with the static query for the table
    let userTempTableSql = `create table if not exists user_temp (id int(11) NOT NULL,first_name varchar(255) DEFAULT NULL, last_name varchar(255) DEFAULT NULL,${userTempDynamicSql} PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8;`
    return userTempTableSql;
  }).catch(function(error){
    console.log(error);
    throw error;
  })
}

module.exports = {
  receivedMessage
}
