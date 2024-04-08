# Snakeless: Project for IU University

## Module: Cloud Programming

## Description
Snakeless is a project that includes a simple frontend with two backend Lambda functions and a basic DynamoDB table setup. Despite its apparent simplicity, the Terraform infrastructure illustrates the complexity and expandability of such a structure, especially in a game-like context with backend methods and a database. This documentation will first outline the project functionalities before going into the coding of Infrastructure as Code (IaC) and Terraform, detailing every file and process involved.

### Frontend
The frontend is a straightforward serverless CDN serving a static HTML content. This approach, utilizing vanilla JavaScript and HTML, avoids the complexities of application services, the content then is hosted on a S3 storage and delivered via CloudFront as a CDN. The frontend also includes/calls public CDN libraries such as jQuery 3.7.1, Font Awesome 6.5.1, Bootstrap 5.3.3, and Phaser 3.80.1. The game inside the frontend (developed with Phaser) features three difficulty levels. When the user finish the game, it posts the score to an API endpoint and subsequently fetches a leaderboard, including the best players scores.

#### Frontend Structure inside `frontend` directory
- `index.html`: Main entry point.
- `error.html`: Error page.
- `singletone.js`: Stores API endpoint information, *a key file*.
- `css/style.css`: Contains all website styles.
- `src/game.js`: Core game functionality, and includes the API call to submit scores.
- `src/main.js`: Handles APP navigation, sections, and leaderboard fetching, also global variables.

### Backend inside `backend/functions`
The backend consists of two Lambda functions in Node.js 20.x, requiring DynamoDB for storage. Permissions required are: to `submitScore` write access to the DynamoDB table and to `getLeaderboard`  read access to the DynamoDB table.

#### `submitScore` Function
A POST Lambda function accepting a JSON payload with `nickname`, `score`, `difficulty`, and `date`. It returns a success status, with error details if success is false.

#### `getLeaderboard` Function
A GET function that returns the top 50 scores in an array. Errors return a status false and additional information.

#### Lambda Security Note
Both functions currently accept requests from all origins, which poses a security concern that will be addressed in the Terraform section.

### IaC & Terraform
The `terraform` directory has the project's entire IaC setup. Inside each file of terraform you will find a comment over each block of definition, that will allow you to understand what each block does.

#### Terraform Requirements
- Terraform version 1.7.5
- HashiCorp AWS provider version 5.44.0
- AWS CLI version 2.15.33

#### Terraform Structure
- `main.tf`
- `variables.tf`
- `dynamodb.tf`
- `s3.tf`
- `cloudfront.tf`
- `iam.tf`
- `lambda.tf`
- `apigateway.tf`
- `outputs.tf`
- `frontend_deployment.sh`<- (Experimental) Bash script for modify the singletone.js and upload the frontend to the S3.

#### Pipeline
The lack of a CI/CD pipeline means certain manual steps, here we have 2 different solutions:

## Solution 1

#### BASH Script: `terraform/frontend_deployment.sh`
This script automates the process of updating the `frontend/singletone.js` configuration file and deploys the frontend to the S3 bucket created once the `terraform apply` exposed the required outputs.

### Prerequisites:
The script is a Bash script, which means it requires a Unix-like environment to run. This can be Linux, Git Bash, or Windows Subsystem for Linux (WSL) on Windows systems.
Ensure the script is executable by running `chmod +x frontend_deployment.sh` in your terminal.
Ensure Terraform has been successfully applied and the expected outputs are visible.
Ensure the AWS CLI is configured with the necessary permissions to perform operations on S3.

### What the BASH Script do

* It Updates `frontend/singletone.js`: Dynamically replacing placeholders in the `frontend/singletone.js` file with actual values for the API Gateway (ID, AWS region, and deployment stage) obtained from Terraform outputs.

* It Deploys the Frontend to S3: Synchronizes the contents of the `frontend` directory to the specified S3 bucket.

### IMPORTANT NOTE
Do not manually modify `frontend/singletone.js` if you intend to use this script for deployment. Manual changes might be overwrite the next time the script is executed, or might cause the script to malfunction (due to the PLACEHOLDER_ strings). Have in count also once you used the script, your local copy of the singletone.js will contain important information about your API Gateway (ID, region, stage).

### Usage:
After successfully applying your Terraform configuration (`terraform apply`) and verifying the outputs, run the script from your terminal within the project `terraform` directory:

`./frontend_deployment.sh`

This will update your singletone.js with the latest configuration based on Terraform outputs and synchronize your frontend assets with the specified S3 bucket.

## Solution 2

Manually modify the `frontend/singletone.js` file setting up the variables window.API_ID, window.API_REGION, window.API_STAGE with your API Gateway data.
Upload manually the `frontend` files into the S3 bucket created.

### Known Issues

#### Security
The current setup exposes a security risk, particularly with the `submitScore` function, which could be exploited to submit scores from outside the app (cloudfront) source. A potential solution could be restricting origin access and implementing rate timing limiting, but this requires additional frontend logic and was out of scope (i think?) for this project.

## Challenges in IaC Development

#### This section will highlight challenges encountered during development, describing the complexity and learning curve associated with IaC from my personal experience.

Developing this infrastructure was an extensive proccess that required a lot of research, including forums (Stack Overflow), assistance from AI tools (Gemini, ChatGPT), reading the official documentation (terraform and AWS), and video tutorials, despite these resources, there were moments when they seemed insufficient. Initially, I hadn't anticipated the complexity involved in setting up what seemed like a "straightforward" project. The idea was to showcase my capability to create a full cloud structure involving frontend, backend, and database components. But the reality was far my assumption. The manual setup on the AWS console was indeed straightforward: I created the S3 bucket, uploaded the frontend files, configured the CloudFront with its origin policies and behaviors, setted up the DynamoDB, and both Lambda functions, with "relative" ease. Everything worked eventually, including the IAM roles and API Gateway integrations.

## The Terraform Challenge
The challenge began when I attempted to translate this manual AWS console UI setup into a Terraform blueprint... The process was anything but easy. The first issue was simply as just as uploading the Lambda functions and dealing with specific AWS provider versions. For instance, I encountered errors when trying to use Node.js 20.x, as the error messages suggested support only up to version 14.x. This issue required me to explicitly set the provider version in `main.tf`. Each step that was previously a simple click became a formidable challenge. Configuring permissions, roles, API Gateway: ESPECIALLY Api Gateway, setting up CORS policies turned the project into a tedious endeavor. The iterative process of `terraform apply`, `destroy`, and `plan` again, was not just a command sequence but a test of patience, with each cycle taking up to 10 minutes and teasing my endurance.

# CORS!
Configuring the API Gateway (`apigateway.tf`). A task simple and straightforward in the AWS console, became a complex "Swiss watch" in Terraform. I fixed one thing, another exploded. The frontend served via CloudFront, encountered CORS errors when attempting to communicate with the API Gateway. This problem forced me to apply a solution I'm generally not "happy" to implement: Directly modifying the Lambda functions to include CORS headers in the code. A step "outside" of the best practices, intertwining infrastructure configuration with application logic, but was necessary under the circumstances.

#### Reflections on Perseverance
There were moments I considered abandoning this "ambitious" project in favor of something simpler, something that wouldn't test my limits quite as much, i could say with a simple S3 static storage with a CloudFront would be enough. However, the drive to push through, to learn and overcome these issues, kept me going. The experience taught me not just about Terraform and AWS but about the importance of perseverance in the face of challenges.

