export type TFileSpaceSelectionType =
  | "image"
  | "video"
  | "audio"
  | "doc"
  | "archive"
  | "presentation"
  | "spreadsheet"
  | "all";

export interface IFileItem {
  /** COMMON FIELD */
  id: string;
  /** COMMON FIELD */
  name: string;
  /** COMMON FIELD */
  owner: string;
  /** COMMON FIELD */
  created_at: string;

  /** DIRECTORIES ONLY */
  parent_id?: string | null;
  files_count?: number;
  /** DIRECTORIES ONLY */
  directories_count?: number;
  /** DIRECTORIES ONLY */
  total_size?: number;
  /** DIRECTORIES ONLY */
  breadcrumb?: string | null;
  /** DIRECTORIES ONLY */
  contents?: IFileItem[];

  /** FILES ONLY */
  content_type?: string;
  /** FILES ONLY */
  file_format?: string;
  /** FILES ONLY */
  size?: number;
  /** FILES ONLY */
  thumbnail?: string | null;
  /** FILES ONLY */
  gridfs_file_id?: string;
  /** FILES ONLY */
  directory_id?: string | null;
  /** FILES ONLY */
  has_thumbnail?: boolean;
  /** FILES ONLY */
  thumbnail_url?: string | null;
  /** FILES ONLY */
  thumbnail_data?: string | null;
}

export interface IFileSpaceInfo {
  used_space_mb: number;
  free_space_mb: number;
  total_space_mb: number;
  used_space_percentage: number;
  content: IFileItem[];
}
