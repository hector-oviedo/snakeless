import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDB();  

async function handler(event) { 
    const data = event; 

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
            body: "Error saving data"
        };
    }
}

export { handler }; 