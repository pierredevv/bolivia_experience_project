import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";
import { PrismaService } from "../../prisma/prisma.service";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(FirebaseMessagingService.name);
  private initialized = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private ensureInitialized(): boolean {
    if (this.initialized) return true;
    if (admin.apps.length > 0) {
      this.initialized = true;
      return true;
    }

    const serviceAccountPath = this.config.get<string>(
      "FIREBASE_SERVICE_ACCOUNT_PATH",
    );
    const serviceAccount = this.config.get<string>("FIREBASE_SERVICE_ACCOUNT");
    const projectId = this.config.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = this.config.get<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = this.config.get<string>("FIREBASE_PRIVATE_KEY");

    try {
      if (serviceAccountPath) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
      } else if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
      } else if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      }
      this.initialized = true;
      return true;
    } catch (e) {
      this.logger.warn(
        `Firebase no configurado, push desactivado: ${(e as Error).message}`,
      );
      return false;
    }
  }

  async sendToUser(userId: string, payload: PushPayload) {
    if (!this.ensureInitialized()) return;

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });
    const fcmTokens = tokens.map((t) => t.token).filter((t) => t.length > 0);
    if (fcmTokens.length === 0) return;

    try {
      await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: { priority: "high" },
      });
    } catch (e) {
      this.logger.error(
        `Error enviando notificación push: ${(e as Error).message}`,
      );
    }
  }
}
