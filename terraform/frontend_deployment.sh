#!/bin/bash

# Update singletone.js with API Gateway details
API_ID=$(terraform output -raw api_gateway_id)
API_REGION=$(terraform output -raw api_gateway_region)
API_STAGE=$(terraform output -raw api_gateway_stage_name)
BUCKET_NAME=$(terraform output -raw s3_bucket_name)

sed -i "s/PLACEHOLDER_ID/${API_ID}/" ../frontend/singletone.js
sed -i "s/PLACEHOLDER_REGION/${API_REGION}/" ../frontend/singletone.js
sed -i "s/PLACEHOLDER_STAGE/${API_STAGE}/" ../frontend/singletone.js

# Upload the frontend directory to S3
aws s3 sync ../frontend/ s3://$BUCKET_NAME/