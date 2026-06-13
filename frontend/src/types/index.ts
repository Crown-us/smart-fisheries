export type UserRole = 'ADMIN' | 'FARMER' | 'CONSUMER';

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

export type PondStatus = 'ACTIVE' | 'INACTIVE';
export type PondStockStatus = 'ACTIVE' | 'HARVESTED';

export interface FishSpecies {
  id: number;
  name: string;
  scientificName?: string;
  optimalPhMin?: number;
  optimalPhMax?: number;
  optimalTempMin?: number;
  optimalTempMax?: number;
  optimalDoMin?: number;
  optimalDoMax?: number;
  optimalSalinityMin?: number;
  optimalSalinityMax?: number;
  optimalAmmoniaMax?: number;
}

export interface Pond {
  id: number;
  farmerId: number;
  farmerName: string;
  name: string;
  location?: string;
  length: number;
  width: number;
  depth: number;
  waterSource?: string;
  status: PondStatus;
  createdAt: string;
}

export interface PondStock {
  id: number;
  pondId: number;
  pondName: string;
  fishSpeciesId: number;
  fishSpeciesName: string;
  initialQuantity: number;
  currentQuantity: number;
  initialWeightG: number;
  currentWeightG: number;
  stockedAt: string;
  harvestedAt?: string;
  status: PondStockStatus;
  createdAt: string;
}

export interface WaterQualityRecord {
  id: number;
  pondId: number;
  pondName: string;
  ph: number;
  temperature: number;
  dissolvedOxygen: number;
  salinity: number;
  ammonia: number;
  notes?: string;
  recordedById?: number;
  recordedByName?: string;
  recordedAt: string;
  createdAt: string;
}

export type NotificationType = 'ALERT' | 'REMINDER' | 'INFO';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface FeedType {
  id: number;
  name: string;
  manufacturer?: string;
  proteinPercentage?: number;
  fatPercentage?: number;
  notes?: string;
}

export interface FeedingSchedule {
  id: number;
  pondId: number;
  feedTypeId: number;
  feedTypeName: string;
  timeOfDay: string;
  quantityKg: number;
  isActive: boolean;
}

export interface FeedingRecord {
  id: number;
  pondStockId: number;
  feedTypeId: number;
  feedTypeName: string;
  quantityKg: number;
  fedAt: string;
  recordedById?: number;
  recordedByName?: string;
  createdAt: string;
}

export interface FcrRecord {
  id: number;
  pondStockId: number;
  calculationDate: string;
  totalFeedGivenKg: number;
  totalBiomassGainKg: number;
  fcrValue: number;
}

export interface FcrReport {
  pondStockId: number;
  fishSpeciesName: string;
  initialQuantity: number;
  currentQuantity: number;
  initialWeightKg: number;
  currentWeightKg: number;
  totalBiomassGainKg: number;
  totalFeedGivenKg: number;
  currentFcr: number;
  calculationDate: string;
}

export type ProductUnit = 'KG' | 'PCS';
export type ProductCategory = 'FRESH_FISH' | 'FROZEN_FISH' | 'PROCESSED' | 'FEED' | 'EQUIPMENT';
export type ProductModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductImage {
  id: number;
  imageUrl: string;
  primary: boolean;
}

export interface Product {
  id: number;
  farmerId: number;
  farmerName: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  unit: ProductUnit;
  category: ProductCategory;
  moderated: boolean;
  moderationStatus: ProductModerationStatus;
  images: ProductImage[];
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
}

export interface Order {
  id: number;
  consumerId: number;
  consumerName: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
}

export interface DigitalCertification {
  id: number;
  farmerId: number;
  farmerName: string;
  title: string;
  description?: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId?: number;
  reviewerName?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
