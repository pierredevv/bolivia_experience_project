export interface User {
  id: string
  email: string
  name: string
  photoUrl?: string
  country?: string
  language: string
  role: 'admin' | 'empresa' | 'usuario'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
  slug: string
  description?: string
  displayOrder: number
  isActive: boolean
  _count?: {
    places: number
  }
}

export interface Place {
  id: string
  name: string
  description?: string
  descriptionEn?: string
  address: string
  phone?: string
  website?: string
  instagram?: string
  latitude: number
  longitude: number
  ratingAvg: number
  ratingCount: number
  categoryId: string
  ownerId?: string
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: Category
  owner?: User
  photos?: PlacePhoto[]
  hours?: PlaceHour[]
  reviews?: Review[]
  _count?: {
    reviews: number
    favorites: number
  }
}

export interface PlacePhoto {
  id: string
  placeId: string
  url: string
  altText?: string
  displayOrder: number
}

export interface PlaceHour {
  id: string
  placeId: string
  dayOfWeek: number
  openTime?: string
  closeTime?: string
  isClosed: boolean
}

export interface Review {
  id: string
  userId: string
  placeId: string
  rating: number
  comment?: string
  photos: string[]
  visitDate?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  user?: User
  place?: Place
  replies?: ReviewReply[]
}

export interface ReviewReply {
  id: string
  reviewId: string
  userId: string
  comment: string
  createdAt: string
  user?: User
}

export interface Event {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  dateStart: string
  dateEnd?: string
  location?: string
  latitude?: number
  longitude?: number
  photoUrl?: string
  category?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Promotion {
  id: string
  placeId: string
  title: string
  titleEn?: string
  description?: string
  descriptionEn?: string
  photoUrl?: string
  discountPercentage?: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  place?: Place
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}
