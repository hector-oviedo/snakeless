# Exposes the API Gateway ID
output "api_gateway_id" {
  value = aws_api_gateway_rest_api.snakeless_api.id
  description = "The ID of the API Gateway"
}

# Exposes the API Gateway region
output "api_gateway_region" {
  value = var.aws_region
  description = "The AWS region of the API Gateway"
}

# Exposes the API Gateway stage name
output "api_gateway_stage_name" {
  value = aws_api_gateway_deployment.snakeless_api_deployment.stage_name
  description = "The stage name of the API Gateway deployment"
}

# Exposes the S3 bucket name
output "s3_bucket_name" {
  value = aws_s3_bucket.snakeless_s3.bucket
  description = "The name of the S3 bucket used for the frontend"
}