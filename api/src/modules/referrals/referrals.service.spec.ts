import { Test, TestingModule } from "@nestjs/testing";
import { ReferralsService } from "./referrals.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { BadRequestException, ConflictException } from "@nestjs/common";

describe("ReferralsService", () => {
  let service: ReferralsService;
  let prisma: PrismaService;

  const mockPrisma = {
    referral: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    referralUse: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getReferralCode", () => {
    it("should return existing referral code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({
        userId: "user-1",
        code: "ABC12345",
        referralCount: 3,
        rewardsEarned: 30,
      });

      const result = await service.getReferralCode("user-1");

      expect(result.code).toBe("ABC12345");
      expect(result.referralCount).toBe(3);
      expect(result.shareUrl).toContain("ABC12345");
    });

    it("should create new referral code if none exists", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue(null);
      mockPrisma.referral.create.mockResolvedValue({
        userId: "user-1",
        code: "NEWCODE1",
        referralCount: 0,
        rewardsEarned: 0,
      });

      const result = await service.getReferralCode("user-1");

      expect(result.code).toBe("NEWCODE1");
      expect(result.referralCount).toBe(0);
      expect(mockPrisma.referral.create).toHaveBeenCalled();
    });
  });

  describe("applyReferralCode", () => {
    it("should apply a valid referral code", async () => {
      mockPrisma.referral.findUnique
        .mockResolvedValueOnce({ userId: "referrer-1", code: "VALID123" })
        .mockResolvedValueOnce(null); // no referral for applying user
      mockPrisma.referralUse.findUnique.mockResolvedValue(null);
      mockPrisma.referralUse.create.mockResolvedValue({});
      mockPrisma.referral.update.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.applyReferralCode("user-2", "VALID123");

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledTimes(2);
    });

    it("should throw BadRequestException for invalid code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue(null);

      await expect(
        service.applyReferralCode("user-2", "INVALID"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when using own code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({
        userId: "user-1",
        code: "OWNCODE",
      });

      await expect(
        service.applyReferralCode("user-1", "OWNCODE"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException if user already used a referral code", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({
        userId: "referrer-1",
        code: "CODE1",
      });
      mockPrisma.referralUse.findUnique.mockResolvedValue({
        referredUserId: "user-2",
      });

      await expect(
        service.applyReferralCode("user-2", "CODE1"),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("getReferralStats", () => {
    it("should return referral statistics", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({
        userId: "user-1",
        code: "CODE123",
        referralCount: 5,
        rewardsEarned: 50,
      });
      mockPrisma.referralUse.findMany.mockResolvedValue([
        {
          referredUser: { id: "u2", name: "Juan", createdAt: new Date() },
          createdAt: new Date(),
        },
      ]);

      const result = await service.getReferralStats("user-1");

      expect(result.code).toBe("CODE123");
      expect(result.totalReferrals).toBe(5);
      expect(result.totalRewards).toBe(50);
      expect(result.recentReferrals).toHaveLength(1);
    });
  });
});
