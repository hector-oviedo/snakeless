# Define submit_score lambda function, specifying name, handler, runtime, and IAM role
resource "aws_lambda_function" "submit_score" {
  function_name = "${var.project_name}_submit_score"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn

  # Set an env variable for the Lambda to store the DynamoDB table name
  environment {
    variables = { 
      DYNAMODB_TABLE = aws_dynamodb_table.snakeless_table.name
    }
  }

  # Path to the zip file containing the function's code (index.mjs for nodejs20.x)
  filename = "../backend/functions/submitScore/index.zip"
}

# Grant API Gateway permission to invoke 'submit_score', enable respond to HTTP requests
resource "aws_lambda_permission" "submit_score_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_score.function_name
  principal     = "apigateway.amazonaws.com"

  # The ARN for the API Gateway stage that will be invoking this function
  source_arn = "${aws_api_gateway_rest_api.snakeless_api.execution_arn}/*/*/submitScore"
}

# Define get_leaderboard lambda function, specifying name, handler, runtime, and IAM role
resource "aws_lambda_function" "get_leaderboard" {
  function_name = "${var.project_name}_get_leaderboard"
  handler       = "index.handler"
  runtime       = "nodejs20.x" # Updated to Node.js 20.x
  role          = aws_iam_role.lambda_exec_role.arn

  # Set an env variable for the Lambda to store the DynamoDB table name
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.snakeless_table.name
    }
  }

  # Path to the zip file containing the function's code (index.mjs for nodejs20.x)
  filename = "../backend/functions/getLeaderboard/index.zip"
}

# Grant API Gateway permission to invoke 'get_leaderboard', enable respond to HTTP requests
resource "aws_lambda_permission" "get_leaderboard_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_leaderboard.function_name
  principal     = "apigateway.amazonaws.com"

  # The ARN for the API Gateway stage that will be invoking this function
  source_arn = "${aws_api_gateway_rest_api.snakeless_api.execution_arn}/*/*/getLeaderboard"
}