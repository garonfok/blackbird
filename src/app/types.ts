export interface PieceVague {
  id: number;
  title: string;
  year_published?: number;
  path: string;
  difficulty?: number;
  notes: string;
  created_at: string;
  updated_at: string;
  composers: Musician[];
  tags: Tag[];
}
export interface Piece {
  id: number;
  title: string;
  year_published?: number;
  path: string;
  difficulty?: number;
  notes: string;
  created_at: string;
  updated_at: string;
  composers: Musician[];
  arrangers: Musician[];
  orchestrators: Musician[];
  transcribers: Musician[];
  lyricists: Musician[];
  scores: Score[];
  parts: Part[];
  tags: Tag[];
}

export interface Musician {
  id: number;
  first_name: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: number;
  name: string;
  path?: string;
  created_at: string;
  updated_at: string;
}
export interface Part {
  id: number;
  name: string;
  path?: string;
  created_at: string;
  updated_at: string;
  piece_id: number;
  instruments: Instrument[];
}

export interface EditPiece {
  title: string;
  yearPublished?: number;
  difficulty?: number;
  notes: string;
  tags: Tag[];
  composers: Musician[];
  arrangers: Musician[];
  transcribers: Musician[];
  orchestrators: Musician[];
  lyricists: Musician[];
  parts: EditPart[];
  scores: EditScore[];
}

export interface EditPart {
  id: number;
  renaming: boolean;
  show: boolean;
  name: string;
  instruments: Instrument[];
  file: ByteFile | null;
}

export interface EditScore {
  id: number;
  renaming: boolean;
  name: string;
  file: ByteFile | null;
}
export interface Instrument {
  id: number;
  name: string;
  category?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}
export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface Ensemble {
  id: number;
  name: string;
  category: string;
  created_at: String;
  updated_at: String;
  parts?: Part[];
}

export interface ByteFile {
  id: number;
  name: string;
  bytearray: Uint8Array;
}

export interface Setlist {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
