const AWS = require('aws-sdk');
const s3 = new AWS.S3();

/**
 * Upload a basic log file to S3
 */
async function createLogFile(status,message){
  return s3.putObject({
    Bucket: process.env.LOG_BUCKET_NAME,
    Key: `${Date.now()}-log-${status}.json`,
    Body: `{"result":"${message}"}`
  }).promise()
    .then(val => {
      return val;
    }).catch(error => {
      console.log('Log File Failed To Be Uploaded To S3');
      console.log(error);
      throw error;
    });
}

module.exports = {
  createLogFile
}
