export const ReviewStatus = {
  PUBLISHED: 'PUBLISHED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  HIDDEN: 'HIDDEN',
  DELETED: 'DELETED',
} as const;

export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];
