# variables

variable "project_name" {
  description = "Name of the project"
  default     = "snakeless"
}

variable "aws_region" {
  description = "AWS region for resources deployment"
  default     = "us-east-1"
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name"
  default     = "Leaderboard"
}