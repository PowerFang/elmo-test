# Elmo Test
Repo for test requirements

## Pre-requisites
### NodeJs
* You must have node 8.10 or later
* To install node, goto the below url
* https://nodejs.org/en/download/
### Aws Cli
* To setup your aws credentials and send the sns notification from the command line, you need to install aws cli
* Instructions can be found at the below url.
* https://docs.aws.amazon.com/cli/latest/userguide/installing.html
### Serverless Framework
* To deploy the stack, you need to make sure you have installed the serverless framework module globally
* Instructions can be found at the below url
* https://serverless.com/framework/docs/providers/aws/guide/installation/

## Installation
* Clone the repository to a local folder
* Go into that folder
* Run "npm install"

### To Run Locally
* Edit the config.yml file, Change the DB_NAME, DB_USER, DB_PASSWORD to connect to relevant mysql server
* Edit the serverless.yml file and change the DB_HOST value to where the mysql server is located
* Make sure the database specified in DB_NAME exists on the DB_HOST
* Invoke the function locally by running:

```serverless invoke local --function snsMessage```

* If you have not deployed using serverless, the uploading the log file will fail as the bucket will not exist, but the rest will work

### To Run Online
* Make sure you have a profile setup in you aws credentials where you want to deploy the test stack, you need that profile name for the next step.  If you don't provide the --aws-profile command, it will use your default aws credentials (which is probably your primary work credentials) - You can read about how to do this at this link:

https://serverless.com/framework/docs/providers/aws/guide/credentials#use-an-existing-aws-profile

* Deploy the stack using the command, replacing the YOUR-PROFILE with your aws credential profile name:

```serverless deploy --aws-profile YOUR-PROFILE```

* While the stack is deploying, make sure you have the AWS CLI installed: https://aws.amazon.com/cli/
* Once the stack is deployed, you need to go an get the sns topic ARN from the console
* You can either trigger the SNS from the console itself or run the below command in AWS CLI:

```aws sns publish --topic-arn YOUR-TOPIC-ARN --message "test" --profile YOUR-PROFILE --region ap-southeast-2```

*Note: Just make sure to substitute YOUR-PROFILE and YOUR-TOPIC-ARN with the relevant values


