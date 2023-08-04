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
  createdAt: Date;
  updatedAt: Date;
}
export interface Part {
  id: number;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  piece_id: number;
}
export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
