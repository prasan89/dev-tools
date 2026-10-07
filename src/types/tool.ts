export type ToolCategory =
  | 'json'
  | 'encoding'
  | 'developer'
  | 'data-code'
  | 'utilities';

export interface Tool {
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  longDescription?: string;
  icon: string;
  keywords: string[];
  relatedTools?: string[];
  seo?: {
    title?: string;
    description?: string;
  };
  popular?: boolean;
  new?: boolean;
  comingSoon?: boolean;
}

export interface Category {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}
