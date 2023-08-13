export interface PieceDetailed {
  id: number;
  title: string;
  yearPublished?: number;
  path: string;
  difficulty?: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  composers: Musician[];
  tags: Tag[];
}
export interface PieceVague {
  id: number;
  title: string;
  yearPublished?: number;
  path: string;
  difficulty?: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  composers: Musician[];
  arrangers: Musician[];
  orchestrators: Musician[];
  transcribers: Musician[];
  lyricists: Musician[];
  parts: Part[];
  tags: Tag[];
}

export interface Musician {
  id: number;
  first_name: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}
export interface Part {
  id: number;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  piece_id: number;
  instruments: Instrument[];
}

export interface EditPart {
  id: number;
  show: boolean;
  name: string;
  instruments: Instrument[];
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
  name: string;
  bytearray: Uint8Array;
}
