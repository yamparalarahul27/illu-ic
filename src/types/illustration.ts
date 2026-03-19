import { AssetStatus } from '@/lib/permissions';

export interface Illustration {
  id: number;
  name: string;
  image: string;
  image_url: string;
  dark_image_url?: string;
  status?: AssetStatus;
  name_tag?: string;
  created_at?: string;
}

export interface Comment {
  id: number;
  illustration_id: number;
  user_name: string;
  user_email: string;
  user_team: string;
  text: string;
  timestamp: number;
  parent_id?: number | null;
  resolved?: boolean;
}
