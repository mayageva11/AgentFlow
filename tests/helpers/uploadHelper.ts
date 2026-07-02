import { APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { UploadResponse } from '../../src/server/types';

async function readFileBuffer(filePath: string): Promise<Buffer> {
  const stream = fs.createReadStream(filePath);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

export async function uploadFile(
  request: APIRequestContext,
  filePath: string
): Promise<UploadResponse> {
  const buffer = await readFileBuffer(filePath);
  const response = await request.post('/api/upload', {
    multipart: {
      file: {
        name: path.basename(filePath),
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer,
      },
    },
  });
  return response.json();
}
