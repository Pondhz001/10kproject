/**
 * Shared types for Muen Kla Pa Khiao (Forest Planting & Tracking Portal)
 */

export interface CareUpdate {
  date: string;
  status: string;
  height: number;
  image: string;
  note: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  phone?: string;
  provider: 'google' | 'line' | 'guest';
  lineUserId?: string;
  pictureUrl?: string;
  createdAt?: string;
}

export interface Tree {
  id: string;
  index: number;
  ownerName: string;
  ownerOrganization?: string;
  ownerPhone: string;
  userId?: string;
  plantedAt: string;
  status: 'Seedling' | 'Growing' | 'Young Tree' | 'Mature';
  height: number; // in cm
  carbonOffset: number; // kg of CO2 absorbed
  careHistory: CareUpdate[];
  slipDetails?: {
    transDate?: string;
    transTime?: string;
    senderName?: string;
    receiverName?: string;
    amount?: number;
    refId?: string;
    sendingBank?: string;
  };
}

export interface Order {
  id: string;
  donorName: string;
  donorOrganization?: string;
  donorPhone: string;
  userId?: string;
  treeCount: number;
  amount: number; // treeCount * 100
  status: 'Pending' | 'Paid' | 'Failed';
  slipVerified: boolean;
  selectedTreeIndexes?: number[];
  treeNames?: string[];
  slipDetails?: {
    transDate?: string;
    transTime?: string;
    senderName?: string;
    receiverName?: string;
    amount?: number;
    refId?: string;
    sendingBank?: string;
  };
  createdAt: string;
}

export interface CampaignStats {
  totalTarget: number; // 10000
  totalPlanted: number;
  totalCO2Offset: number; // sum of carbon offset of all trees
  totalDonors: number;
}
