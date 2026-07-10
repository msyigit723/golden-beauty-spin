// Spin result domain types

export interface SpinResult {
  id: string;
  userId: string;
  campaignId: string;
  campaignNameSnapshot: string;
  createdAt: string;
}

export interface SpinResultWithUser extends SpinResult {
  userName: string;
  userSurname: string;
  userPhone: string;
}

export interface SpinResultRow {
  id: string;
  user_id: string;
  campaign_id: string;
  campaign_name_snapshot: string;
  created_at: string;
}

export interface SpinResultJoinedRow extends SpinResultRow {
  users: {
    name: string;
    surname: string;
    phone: string;
  };
}
