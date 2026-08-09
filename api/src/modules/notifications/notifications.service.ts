import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseMessagingService } from "./firebase-messaging.service";

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private firebaseMessaging: FirebaseMessagingService,
  ) {}

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: "All notifications marked as read" };
  }

  async remove(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async create(
    userId: string,
    data: { title: string; body: string; type: string; data?: string },
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async notify(
    userId: string,
    data: { title: string; body: string; type: string; data?: string },
  ) {
    const notification = await this.create(userId, data);

    let pushData: Record<string, string> | undefined;
    if (data.data) {
      try {
        const raw = JSON.parse(data.data) as Record<string, unknown>;
        pushData = Object.fromEntries(
          Object.entries(raw).map(([key, value]) => [key, String(value)]),
        );
      } catch {
        pushData = undefined;
      }
    }

    await this.firebaseMessaging.sendToUser(userId, {
      title: data.title,
      body: data.body,
      data: pushData,
    });

    return notification;
  }

  async registerToken(userId: string, token: string, platform = "flutter") {
    const existing = await this.prisma.deviceToken.findUnique({
      where: { token },
    });

    if (existing) {
      if (existing.userId === userId) return existing;
      return this.prisma.deviceToken.update({
        where: { id: existing.id },
        data: { userId, platform },
      });
    }

    return this.prisma.deviceToken.create({
      data: { userId, token, platform },
    });
  }

  async unregisterToken(userId: string, token: string) {
    await this.prisma.deviceToken.deleteMany({ where: { userId, token } });
    return { message: "Token removed" };
  }
}
