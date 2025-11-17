import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as z from 'zod/mini';
import { s3Client } from '../clients/s3Client';
import { env } from '../config/env';
import { bodyParser } from '../utils/bodyParser';
import { lambdaHttpResponse } from '../utils/lambdaHttpResponse';

const schema = z.object({
  filename: z.string().check(
    z.trim(),
    z.minLength(1, '\'filename\' is required'),
  ),
});

export async function handler(event: APIGatewayProxyEventV2) {
  const body = bodyParser(event.body);

  const { success, data, error } = schema.safeParse(body);

  if (!success) {
    return lambdaHttpResponse(400, {
      message: error.issues.map(error => ({
        field: error.path.join('.'),
        error: error.message,
      })),
    });
  }

  const { filename } = data;

  const fileKey = `${Date.now()}_${filename}`;

  const commmand = new PutObjectCommand({
    Bucket: env.FILE_BUCKET_NAME,
    Key: fileKey,
  });

  const preSignedUrl = await getSignedUrl(s3Client, commmand, {
    expiresIn: 60, //1min
  });

  return lambdaHttpResponse(200, {
    message: preSignedUrl,
  });
}
