import { piecesGetAll } from "@/invokers/db/pieces";
import { Piece } from "@/types";
import { useEffect, useState } from "react";

export function Footer() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    fetchPieces();
  }, []);

  async function fetchPieces() {
    const payload = await piecesGetAll();
    setPieces(payload);
  }

  return (
    <div className="flex text-fg.2 text-xs p-[2px]">
      {pieces.length} piece{pieces.length > 1 && "s"}
    </div>
  );
}
