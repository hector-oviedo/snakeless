# Create an IAM role for Lambda execution
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project_name}_lambda_exec_role"

  # Define the trust policy for the role
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Sid = ""
      }
    ]
  })
}

# Attach the AWS-managed basic execution policy to the Lambda execution role (permissions for Lambda functions to write logs to CloudWatch)
resource "aws_iam_role_policy_attachment" "lambda_exec_policy_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Create custom IAM policy for the Lambda function to access the DynamoDB access
resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.project_name}_DynamoDBAccess"
  description = "IAM policy for DynamoDB access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ],
        Resource = [aws_dynamodb_table.snakeless_table.arn]
      }
    ]
  })
}

# Attach the custom DynamoDB access policy to the Lambda execution role
resource "aws_iam_role_policy_attachment" "dynamodb_access_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}