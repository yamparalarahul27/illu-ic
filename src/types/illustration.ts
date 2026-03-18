export interface Illustration {
  id: number;
  name: string;
  image: string;
  image_url: string;
  dark_image_url?: string;
}

export interface Comment {
  id: number;
  illustration_id: number;
  user_name: string;
  user_email: string;
  user_team: string;
  text: string;
  timestamp: number;
}
