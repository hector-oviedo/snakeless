import { DynamoDB } from '@aws-sdk/client-dynamodb'; 

const dynamoDB = new DynamoDB();  
const tableName = process.env.DYNAMODB_TABLE;

async function handler(event) {
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

        return { statusCode: 200, body: JSON.stringify(items) }; 
    } catch (error) {
        console.error("Error retrieving leaderboard:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Could not retrieve leaderboard" }) };
    }
}

export { handler };