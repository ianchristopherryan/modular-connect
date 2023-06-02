import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async (event, context) => {
  console.log(JSON.stringify(event));
  const client = new DynamoDBClient();
  const phoneNumber = event.Details.ContactData.SystemEndpoint.Address;

  const params = {
    TableName: 'modular_connect_configurations',
    FilterExpression: 'phoneNumber = :phoneNumber',
    ExpressionAttributeValues: {
      ':phoneNumber': { S: phoneNumber }
    }
  };

  try {
    const command = new ScanCommand(params);
    const response = await client.send(command);

    if (response.Items && response.Items.length > 0) {
      console.log('Found item:', response.Items[0]);
      
      
      
      return {
        "configuration": JSON.stringify(unmarshall(response.Items[0]))
      }
    } else {
      console.log('Item not found.');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving item:', error);
    throw error;
  }
};
