export type SocialPost = {
  id: number;
  platform: string;
  postUrl: string;
  embedHtml: string | null;
  title: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  pinned: boolean;
  sortOrder: number;
  createdAt: Date;
};
