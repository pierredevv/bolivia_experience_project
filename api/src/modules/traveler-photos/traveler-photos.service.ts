import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FileUploadService } from "../../common/services/file-upload.service";

@Injectable()
export class TravelerPhotosService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async findAll(page = 1, limit = 20, currentUserId?: string) {
    const skip = (page - 1) * limit;
    const [photos, total] = await Promise.all([
      this.prisma.travelerPhoto.findMany({
        include: {
          user: {
            select: { id: true, name: true, country: true, photoUrl: true },
          },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.travelerPhoto.count(),
    ]);

    return {
      data: await this.attachLikedFlag(photos, currentUserId),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, currentUserId?: string) {
    const photo = await this.prisma.travelerPhoto.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, country: true, photoUrl: true },
        },
        _count: { select: { likes: true } },
      },
    });
    if (!photo) {
      throw new NotFoundException("Foto de viajero no encontrada");
    }
    const withFlag = await this.attachLikedFlag([photo], currentUserId);
    return withFlag[0];
  }

  async create(
    userId: string,
    title: string,
    description: string | undefined,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Se requiere una imagen");
    }
    const url = await this.fileUploadService.uploadFile(file);

    const photo = await this.prisma.travelerPhoto.create({
      data: {
        userId,
        imageUrl: url,
        title,
        description,
      },
      include: {
        user: {
          select: { id: true, name: true, country: true, photoUrl: true },
        },
        _count: { select: { likes: true } },
      },
    });

    return this.attachLikedFlag([photo], userId).then((items) => items[0]);
  }

  async toggleLike(userId: string, photoId: string) {
    await this.ensurePhoto(photoId);

    const existing = await this.prisma.travelerPhotoLike.findUnique({
      where: { photoId_userId: { photoId, userId } },
    });

    if (existing) {
      await this.prisma.travelerPhotoLike.delete({
        where: { id: existing.id },
      });
    } else {
      await this.prisma.travelerPhotoLike.create({
        data: { photoId, userId },
      });
    }

    const likeCount = await this.prisma.travelerPhotoLike.count({
      where: { photoId },
    });

    return { liked: !existing, likeCount };
  }

  async removeLike(userId: string, photoId: string) {
    await this.ensurePhoto(photoId);

    const existing = await this.prisma.travelerPhotoLike.findUnique({
      where: { photoId_userId: { photoId, userId } },
    });
    if (existing) {
      await this.prisma.travelerPhotoLike.delete({
        where: { id: existing.id },
      });
    }

    const likeCount = await this.prisma.travelerPhotoLike.count({
      where: { photoId },
    });

    return { liked: false, likeCount };
  }

  private async ensurePhoto(photoId: string) {
    const photo = await this.prisma.travelerPhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo) {
      throw new NotFoundException("Foto de viajero no encontrada");
    }
  }

  private async attachLikedFlag(photos: any[], currentUserId?: string) {
    if (!currentUserId || photos.length === 0) {
      return photos.map((photo) => this.serialize(photo, false));
    }

    const liked = await this.prisma.travelerPhotoLike.findMany({
      where: {
        userId: currentUserId,
        photoId: { in: photos.map((p) => p.id) },
      },
      select: { photoId: true },
    });
    const likedIds = new Set(liked.map((l) => l.photoId));

    return photos.map((photo) =>
      this.serialize(photo, likedIds.has(photo.id)),
    );
  }

  private serialize(photo: any, likedByUser: boolean) {
    return {
      id: photo.id,
      imageUrl: photo.imageUrl,
      title: photo.title,
      description: photo.description,
      createdAt: photo.createdAt,
      likeCount: photo._count?.likes ?? 0,
      likedByUser,
      author: {
        id: photo.user.id,
        name: photo.user.name,
        country: photo.user.country,
        photoUrl: photo.user.photoUrl,
      },
    };
  }
}
