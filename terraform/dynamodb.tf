# Create the DynamoDB table, Set the table to use provisioned throughput, read and write capacity units, define 'ID' as primary key
resource "aws_dynamodb_table" "snakeless_table" {
  name           = "${var.project_name}-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "ID"

  attribute {
    name = "ID"
    type = "S"
  }
}