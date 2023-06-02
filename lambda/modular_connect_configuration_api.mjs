import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const configurationsTableName = "modular_connect_configurations";
const moduleDescriptorTableName = "modular_connect_modules";

export const handler = async (event, context) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));
  
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "GET /modules":
        body = await dynamo.send(
          new ScanCommand({ TableName: moduleDescriptorTableName })
        );
        body = body.Items;
        break;
      case "DELETE /configurations/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: configurationsTableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /configurations/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: configurationsTableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        body = body.Item;
        break;
      case "GET /configurations":
        body = await dynamo.send(
          new ScanCommand({ TableName: configurationsTableName })
        );
        body = body.Items;
        break;
      case "POST /configurations":
        let requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: configurationsTableName,
            Item: {
              id: requestJSON.id,
              phoneNumber: requestJSON.phoneNumber,
              modules: requestJSON.modules,
              name: requestJSON.name,
            },
          })
        );
        body = `Put item ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
