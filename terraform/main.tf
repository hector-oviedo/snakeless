# Specify the Terraform version and AWS provider requirements.
terraform {
  required_version = "1.7.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.44.0"
    }
  }
}

# Configure the AWS provider with a region.
provider "aws" {
  region  = var.aws_region
}