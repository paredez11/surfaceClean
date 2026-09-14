// front3/src/types/testimonial.ts

export interface Testimonial {
  id: number;
  author_name: string;
  stars: number;
  notables?: string;
  content: string;
  created_at: string;
  updated_at: string;
}
