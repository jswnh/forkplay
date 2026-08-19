import { Hono } from "hono";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";
import { R2StorageService } from "@/server/lib/r2.client";
import { AppError } from "@/server/lib/app-error";

export const uploadRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/upload")
  .post("/", AuthGuard.canActivate, async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"];
    const folder = (body["folder"] as string) || "avatars";

    if (!file || !(file instanceof File)) {
      throw new AppError("A valid file is required in form-data", 400);
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      throw new AppError("File size exceeds 10MB limit", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const result = await R2StorageService.uploadFile({
        fileBuffer: buffer,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        folder,
      });

      return c.json({
        success: true,
        url: result.url,
        key: result.key,
        size: result.size,
      });
    } catch (err: any) {
      console.error("Cloudflare R2 upload error:", err);
      throw new AppError(err.message || "Failed to upload file to Cloudflare R2", 500);
    }
  });
