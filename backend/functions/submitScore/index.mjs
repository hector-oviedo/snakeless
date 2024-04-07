import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDB();  

async function handler(event) {
    var headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    };

    let data = null; 

    // Attempt JSON Parsing
    try {
      data = JSON.parse(event.body);

      //for internal testing on AWS console use this
      //data = event;

    } catch (error) {
      console.error("Error parsing JSON payload: ", error);
      return {
        statusCode: 500, 
        headers: headers,
        body: JSON.stringify({
            "success": false,
            "error": "Failed to process payload. Please contact support." 
        })
      };
    }

    // Validation: Specific Error Messages
    const missingParams = [];
    if (!data.nickname) missingParams.push('nickname');
    if (!data.score) missingParams.push('score');
    if (!data.difficulty) missingParams.push('difficulty');
    if (!data.date) missingParams.push('date');

    if (missingParams.length > 0) {
    return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({
            "success":false,
            "error": `Missing required parameters: ${missingParams.join(', ')}`,
            "bodyReceived": data
        })
    };
    }
    
    const timestamp = new Date().getTime();
    const randomValue = Math.floor(Math.random() * 1000);
    const ID = `${timestamp}-${randomValue}`;

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            'ID': { S: ID },
            'nickname': { S: data.nickname }, 
            'score': { S: String(data.score) },
            'difficulty': { S: data.difficulty },
            'date': { S: data.date }
        }
    };
    try {
        await new Promise((resolve, reject) => {
            dynamoDB.putItem(params, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                "success":true,
                "message":"Data pushed successfully"
            })
        };
    } catch (error) {
        console.error("Error pushing data to DynamoDB:", error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                "success":false,
                "message":"Error saving data: " + error
            })
        };
    }
}

export { handler }; 