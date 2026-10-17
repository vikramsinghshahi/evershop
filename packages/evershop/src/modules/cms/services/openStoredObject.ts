import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getAzureContainerClient } from './storage/azure/azureClient.js';
import { buildKey } from './storage/buildKey.js';
import { getGcsBucket } from './storage/gcs/gcsClient.js';
import { getS3Client } from './storage/s3/s3Client.js';
import { getFileStorageProvider } from './storage/storageConfig.js';

export interface StoredObject {
  stream: Readable;
  contentType?: string;
}

function toReadable(body: unknown): Readable | null {
  if (!body) {
    return null;
  }
  if (body instanceof Readable) {
    return body;
  }
  if (typeof (body as { pipe?: unknown }).pipe === 'function') {
    return Readable.from(body as AsyncIterable<Uint8Array>);
  }
  return null;
}

function isMissing(error: unknown): boolean {
  const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    err?.name === 'NoSuchKey' ||
    err?.name === 'NotFound' ||
    err?.$metadata?.httpStatusCode === 404
  );
}

/** True when the active cloud bucket already has this key. Local storage returns false. */
export async function storedObjectExists(objectPath: string): Promise<boolean> {
  const key = buildKey(objectPath);
  if (!key || getFileStorageProvider() === 'local') {
    return false;
  }
  const provider = getFileStorageProvider();
  if (provider === 's3') {
    const { client, config } = await getS3Client();
    try {
      await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
      return true;
    } catch (error) {
      if (isMissing(error)) {
        return false;
      }
      throw error;
    }
  }
  if (provider === 'gcs') {
    const { bucket } = await getGcsBucket();
    const [exists] = await bucket.file(key).exists();
    return exists;
  }
  if (provider === 'azure') {
    const { containerClient } = await getAzureContainerClient();
    return containerClient.getBlobClient(key).exists();
  }
  return false;
}

/**
 * Open an object written by `uploadFile` under the active cloud provider.
 * Local storage returns null — callers read `media/` themselves.
 */
export async function openStoredObject(objectPath: string): Promise<StoredObject | null> {
  const key = buildKey(objectPath);
  if (!key) {
    return null;
  }
  const provider = getFileStorageProvider();
  if (provider === 's3') {
    const { client, config } = await getS3Client();
    try {
      const out = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
      const stream = toReadable(out.Body);
      return stream ? { stream, contentType: out.ContentType } : null;
    } catch (error) {
      if (isMissing(error)) {
        return null;
      }
      throw error;
    }
  }
  if (provider === 'gcs') {
    const { bucket } = await getGcsBucket();
    const file = bucket.file(key);
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }
    const [meta] = await file.getMetadata();
    return { stream: file.createReadStream(), contentType: meta.contentType };
  }
  if (provider === 'azure') {
    const { containerClient } = await getAzureContainerClient();
    const blob = containerClient.getBlobClient(key);
    if (!(await blob.exists())) {
      return null;
    }
    const downloaded = await blob.download();
    const stream = toReadable(downloaded.readableStreamBody);
    return stream ? { stream, contentType: downloaded.contentType } : null;
  }
  return null;
}
