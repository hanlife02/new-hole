export interface Hole {
  id: number;
  pid: number;
  text: string;
  type: 'text' | 'image';
  created_at: string;
  updated_at: string;
  reply: number;
  likenum: number;
  image_response?: string;
  extra?: any;
}

export interface Comment {
  cid: number;
  pid: number;
  text: string;
  created_at: string;
  name: string;
  replied_to_cid?: number;
  quote?: any;
  extra?: any;
}

export interface LatestPid {
  id: number;
  pid: number;
  updated_at: string;
}

export interface HoleWithComments extends Hole {
  comments: Comment[];
}

export interface HotHoleFilters {
  timeRange: '24h' | '3d' | '7d';
  sortBy: 'star' | 'reply' | 'both';
  threshold: number;
}