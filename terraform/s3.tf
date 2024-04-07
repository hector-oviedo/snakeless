# Create the S3 bucket
resource "aws_s3_bucket" "snakeless_s3" {
  bucket = "${var.project_name}-s3"
}

# Define policy, granting read access to the CloudFront OAI (Origin Access Identity)
resource "aws_s3_bucket_policy" "snakeless_s3_policy" {
  bucket = aws_s3_bucket.snakeless_s3.id

  # This setup restricts direct access to the S3 bucket content (only the associated CloudFront can access reading with the policy 's3:GetObject')
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${aws_cloudfront_origin_access_identity.snakeless_oai.id}"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.snakeless_s3.bucket}/*"
    }
  ]
}
POLICY
}