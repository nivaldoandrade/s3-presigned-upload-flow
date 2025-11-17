import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as z from 'zod/mini';
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

  return lambdaHttpResponse(200, {
    message: fileKey,
  });
}
