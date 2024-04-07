# Create Origin Access Identity (OAI) for CloudFront, allowing it to securely access content for the S3 bucket
resource "aws_cloudfront_origin_access_identity" "snakeless_oai" {
  comment = "OAI for ${var.project_name}"
}

# Set up a CloudFront distribution to serve content, (like a website, globally with low latency)
resource "aws_cloudfront_distribution" "snakeless_cloudfront" {

  # Specify the S3 bucket as the origin for CloudFront to fetch the content to distribute/render
  origin {
    domain_name = aws_s3_bucket.snakeless_s3.bucket_regional_domain_name
    origin_id   = "${var.project_name}-s3-origin"

    # Use the OAI to restrict direct access to the S3 bucket, ensuring content is only accessible via CloudFront (security)
    s3_origin_config {
      origin_access_identity = "origin-access-identity/cloudfront/${aws_cloudfront_origin_access_identity.snakeless_oai.id}"
    }
  }
  
  # Enable the distribution and IPv6 support for compatibility
  enabled             = true
  is_ipv6_enabled     = true

  comment             = "CloudFront for ${var.project_name}"

  # Define the default file CloudFront should render
  default_root_object = "index.html"

  # Configure the default cache behavior to allow only 'GET' and 'HEAD' requests, optimizing for read-heavy content like static websites (we dont need any other method, because is static HTML)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${var.project_name}-s3-origin"

    # Exclude all headers except 'Origin' from the cache key, to improve cache
    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      # Forward no cookies, as static content we dont need cookies
      cookies {
        forward = "none"
      }
    }

    # Enforce HTTPS by redirecting HTTP requests to HTTPS (security)
    viewer_protocol_policy = "redirect-to-https"

    # Set caching TTLs to control how long content is cached at CloudFront and in browser caches
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Use all CloudFront edge locations (PriceClass_All) to maximize global reach and performance
  price_class = "PriceClass_All"

  # Apply no geographic restrictions, allowing users worldwide to access the content
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Use the default CloudFront SSL/TLS certificate to secure the distribution, simplifying SSL management
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}