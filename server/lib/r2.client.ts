import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;
const bucket = process.env.R2_BUCKET || "yuta";
const publicUrl = process.env.R2_URL || "https://pub-19475a64b9ef47b78593af8d0414d4be.r2.dev";

export class R2StorageService {
  private static client: S3Client | null = null;

  private static getClient(): S3Client {
    if (!this.client) {
      if (!accessKeyId || !secretAccessKey || !endpoint) {
        throw new Error("Cloudflare R2 credentials are not fully configured in environment variables");
      }

      this.client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
    return this.client;
  }

  static async uploadFile({
    fileBuffer,
    fileName,
    contentType,
    folder = "uploads",
  }: {
    fileBuffer: Buffer | Uint8Array;
    fileName: string;
    contentType: string;
    folder?: string;
  }) {
    const s3 = this.getClient();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${Date.now()}-${cleanFileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    // Format public URL
    const url = `${publicUrl.replace(/\/+$/, "")}/${key}`;

    return {
      key,
      url,
      bucket,
      contentType,
      size: fileBuffer.length,
    };
  }

  static async deleteFile(key: string) {
    const s3 = this.getClient();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return { success: true };
  }
}
