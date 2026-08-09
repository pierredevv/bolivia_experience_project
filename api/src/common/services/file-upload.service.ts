import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class FileUploadService {
  private uploadDir: string;
  private useGCS: boolean;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), "uploads");
    this.useGCS = !!this.configService.get("GCS_BUCKET");

    if (!this.useGCS) {
      this.ensureUploadDir();
    }
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getMulterConfig(): multer.Options {
    const storage = this.useGCS
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (_req, _file, cb) => {
            cb(null, this.uploadDir);
          },
          filename: (_req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        });

    return {
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              "Solo se permiten archivos JPEG, PNG, WebP o GIF",
            ),
          );
        }
      },
    };
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (this.useGCS) {
      return this.uploadToGCS(file);
    }
    return this.uploadToLocal(file);
  }

  private async uploadToLocal(file: Express.Multer.File): Promise<string> {
    // File is already saved by multer disk storage
    return `/uploads/${file.filename}`;
  }

  private async uploadToGCS(file: Express.Multer.File): Promise<string> {
    // Placeholder for GCS upload - implement when GCS is configured
    // const { Storage } = require('@google-cloud/storage');
    // const storage = new Storage();
    // const bucket = storage.bucket(this.configService.get('GCS_BUCKET'));
    // const blob = bucket.file(`places/${Date.now()}-${file.originalname}`);
    // const blobStream = blob.createWriteStream({ resumable: false });
    // blobStream.end(file.buffer);
    // return `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    // For now, fallback to local storage
    return this.uploadToLocal(file);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (filePath.startsWith("/uploads/")) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}
