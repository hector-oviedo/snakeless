import { DynamoDB } from '@aws-sdk/client-dynamodb'; 

const dynamoDB = new DynamoDB();  
const tableName = process.env.DYNAMODB_TABLE;

async function handler(event) {
    var headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    };
    try {
        const params = {
            TableName: tableName,
            Limit: 50
        };

        const result = await new Promise((resolve, reject) => {
            dynamoDB.scan(params, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        let items = result.Items;

        items.sort((a, b) => b.score - a.score); 

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(items)
        }; 
    } catch (error) {
        console.error("Error retrieving leaderboard:", error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({"success":false, "error": "Could not retrieve leaderboard" })
        };
    }
}

export { handler };