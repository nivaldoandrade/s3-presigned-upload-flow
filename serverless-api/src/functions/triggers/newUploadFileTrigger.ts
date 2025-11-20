import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Event } from 'aws-lambda';
import { dynamoClient } from '../../clients/dynamoClient';
import { env } from '../../config/env';

export async function handler(event: S3Event) {
  const id = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' '),
  );

  const updateCommand = new UpdateCommand({
    TableName: env.TABLE_NAME,
    Key: {
      id,
    },
    UpdateExpression: 'SET #status = :status REMOVE expireAt',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'COMPLETED',
    },
  });

  await dynamoClient.send(updateCommand);

}
