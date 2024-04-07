# Define the REST API in AWS API Gateway with name and description from the variable project_name
resource "aws_api_gateway_rest_api" "snakeless_api" {
  name        = "${var.project_name}_api"
  description = "API for ${var.project_name}"
}

# Create a resource in the API Gateway for the 'submitScore' endpoint
resource "aws_api_gateway_resource" "submit_score_resource" {
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  parent_id   = aws_api_gateway_rest_api.snakeless_api.root_resource_id
  path_part   = "submitScore"
}

# Create a resource for the 'getLeaderboard' endpoint in the API Gateway
resource "aws_api_gateway_resource" "get_leaderboard_resource" {
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  parent_id   = aws_api_gateway_rest_api.snakeless_api.root_resource_id
  path_part   = "getLeaderboard"
}

# Define HTTP POST method for the 'submitScore' resource (allowing unauthenticated access)
resource "aws_api_gateway_method" "submit_score_post" {
  rest_api_id   = aws_api_gateway_rest_api.snakeless_api.id
  resource_id   = aws_api_gateway_resource.submit_score_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

# Define HTTP GET method for the 'getLeaderboard' resource (also without authentication)
resource "aws_api_gateway_method" "get_leaderboard_get" {
  rest_api_id   = aws_api_gateway_rest_api.snakeless_api.id
  resource_id   = aws_api_gateway_resource.get_leaderboard_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# Set up AWS Lambda integration for the 'submitScore' endpoint, enabling the POST method to trigger the Lambda function
resource "aws_api_gateway_integration" "submit_score_lambda" {
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  resource_id = aws_api_gateway_resource.submit_score_resource.id
  http_method = aws_api_gateway_method.submit_score_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.submit_score.invoke_arn
}

# Set up AWS Lambda integration for the 'getLeaderboard' endpoint, allowing the GET method to invoke the Lambda function
resource "aws_api_gateway_integration" "get_leaderboard_lambda" {
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  resource_id = aws_api_gateway_resource.get_leaderboard_resource.id
  http_method = aws_api_gateway_method.get_leaderboard_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_leaderboard.invoke_arn
}

# Establish OPTIONS method for the 'submitScore' resource to handle preflight CORS requests (my god those CORS!)
resource "aws_api_gateway_method" "submit_score_options" {
  rest_api_id   = aws_api_gateway_rest_api.snakeless_api.id
  resource_id   = aws_api_gateway_resource.submit_score_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Implement a mock integration for the OPTIONS method on 'submitScore', returning a 200 status without invoking any backend (CORS, of course)
resource "aws_api_gateway_integration" "submit_score_options_mock" {
  depends_on  = [aws_api_gateway_method.submit_score_options]
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  resource_id = aws_api_gateway_resource.submit_score_resource.id
  http_method = "OPTIONS"
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# Define the response for the OPTIONS method, specifying allowed origins, methods, and headers for... CORS...
resource "aws_api_gateway_method_response" "submit_score_options_response" {
  depends_on  = [aws_api_gateway_method.submit_score_options]
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  resource_id = aws_api_gateway_resource.submit_score_resource.id
  http_method = "OPTIONS"
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

# Set up the integration response for the OPTIONS method, explicitly allowing...... CORS!! requests from any origin
resource "aws_api_gateway_integration_response" "submit_score_options_response" {
  depends_on  = [aws_api_gateway_method_response.submit_score_options_response]
  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  resource_id = aws_api_gateway_resource.submit_score_resource.id
  http_method = "OPTIONS"
  status_code = "200" # Ensure this matches the status code in the method response
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}

# Deploy the API Gateway changes, adding the "depends_on" for integrations and methods before deployment
resource "aws_api_gateway_deployment" "snakeless_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.submit_score_lambda,
    aws_api_gateway_integration.get_leaderboard_lambda,
    aws_api_gateway_integration_response.submit_score_options_response,
    aws_api_gateway_method_response.submit_score_options_response,
    aws_api_gateway_method.submit_score_options
  ]

  rest_api_id = aws_api_gateway_rest_api.snakeless_api.id
  stage_name  = "prod"
}