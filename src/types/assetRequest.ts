export interface AssetRequest {
  id: number;
  asset_name: string;
  description?: string;
  requested_by_name?: string;
  requested_by_email?: string;
  status: 'pending' | 'accepted' | 'under_review' | 'wip' | 'addressed';
  creator_comment?: string;
  created_at?: string;
}
