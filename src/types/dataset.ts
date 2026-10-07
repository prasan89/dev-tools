export type DatasetCategory =
  | 'geographic'
  | 'reference'
  | 'configuration'
  | 'testing'
  | 'api-mocks'
  | 'technology'
  | 'ecommerce'
  | 'finance'
  | 'social'
  | 'education'
  | 'entertainment'
  | 'science'
  | 'utilities';

export interface DatasetField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  description?: string;
}

export interface DatasetMeta {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: DatasetCategory;
  tags: string[];
  fields: DatasetField[];
  recordCount: number;
  fileSizeBytes: number;
  license: string;
  source: string;
  seoTitle: string;
  seoDescription: string;
  popular?: boolean;
  relatedDatasets?: string[];
  relatedTools?: string[];
}

export interface Dataset extends DatasetMeta {
  data: unknown[];
}
