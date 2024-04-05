import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDB();  

async function handler(event) { 
    let data = null; 

    // Attempt JSON Parsing
    try {
      data = JSON.parse(event.body);
    } catch (error) {
      console.error("Error parsing JSON payload: ", error);
  
      // Fallback: Try Processing Raw String
      try {
        console.log("Trying to process raw event body");
        data = event; // Attempt to use the entire event object
      } catch (fallbackError) {
        console.error("Error handling raw payload:", fallbackError);
  
        return {
          statusCode: 500, 
          body: JSON.stringify({
            error: "Failed to process payload. Please contact support." 
          })
        };
      } 
    }

    //check payload
    if (!event.body) { 
        return {
          statusCode: 200,
          body: JSON.stringify({
            error: "Payload is missing" 
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
        body: JSON.stringify({
        error: `Missing required parameters: ${missingParams.join(', ')}`,
        bodyReceived: data   
        })
    };
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
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
            body: "Data pushed successfully"
        };
    } catch (error) {
        console.error("Error pushing data to DynamoDB:", error);
        return {
            statusCode: 500,
            body: "Error saving data: "+error
        };
    }
}

export { handler }; 