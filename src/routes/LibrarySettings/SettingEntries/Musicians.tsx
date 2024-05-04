import { Musician, Piece } from "@/app/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mdiPencil, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { ContentWrapper } from "../components/ContentWrapper";

type DeletingMusician = {
  musician: Musician
  principalComposer: Piece[]
  associatedComposer: Piece[]
  arranger: Piece[]
  orchestrator: Piece[]
  transcriber: Piece[]
  lyricist: Piece[]
  all: Piece[]
}

export function Musicians() {
  const [musicians, setMusicians] = useState<Musician[]>([])
  const [pieces, setPieces] = useState<Piece[]>([])
  const [deletingMusician, setDeletingMusician] = useState<DeletingMusician | null>(null)
  const [confirmingDeleteMusician, setConfirmingDeleteMusician] = useState(false)
  const [autoRemoveMusicians, setAutoRemoveMusicians] = useState<Musician[]>([])

  useEffect(() => {
    fetchMusicians()
    fetchPieces()
  }, [])

  async function fetchMusicians() {
    const musicians: Musician[] = await invoke("musicians_get_all")
    setMusicians(musicians)
  }

  async function fetchPieces() {
    const pieces: Piece[] = await invoke("pieces_get_all")
    setPieces(pieces)
  }

  function handleClickDeleteMusician(musician: Musician) {
    const principalComposer = pieces.filter(piece => piece.composers[0].id === musician.id)
    const associatedComposer = pieces.filter(piece => piece.composers.some(composer => composer.id === musician.id) && piece.composers[0].id !== musician.id)
    const arranger = pieces.filter(piece => piece.arrangers.some(arranger => arranger.id === musician.id))
    const orchestrator = pieces.filter(piece => piece.orchestrators.some(orchestrator => orchestrator.id === musician.id))
    const transcriber = pieces.filter(piece => piece.transcribers.some(transcriber => transcriber.id === musician.id))
    const lyricist = pieces.filter(piece => piece.lyricists.some(lyricist => lyricist.id === musician.id))
    const all = Array.from(new Set([...associatedComposer, ...arranger, ...orchestrator, ...transcriber, ...lyricist]))

    setDeletingMusician({
      musician,
      principalComposer,
      associatedComposer,
      arranger,
      orchestrator,
      transcriber,
      lyricist,
      all
    })

    if (principalComposer.length === 0) setConfirmingDeleteMusician(true)
  }

  async function handleClickConfirmDeleteMusician() {
    const {
      musician,
      principalComposer,
      associatedComposer,
      arranger,
      orchestrator,
      transcriber,
      lyricist
    } = deletingMusician!

    if (principalComposer.length > 0) return // code should never reach this line, failsafe

    associatedComposer.forEach(piece => {
      piece.composers = piece.composers.filter(composer => composer.id !== musician.id)
    })
    arranger.forEach(piece => {
      piece.arrangers = piece.arrangers.filter(arranger => arranger.id !== musician.id)
    })
    orchestrator.forEach(piece => {
      piece.orchestrators = piece.orchestrators.filter(orchestrator => orchestrator.id !== musician.id)
    })
    transcriber.forEach(piece => {
      piece.transcribers = piece.transcribers.filter(transcriber => transcriber.id !== musician.id)
    })
    lyricist.forEach(piece => {
      piece.lyricists = piece.lyricists.filter(lyricist => lyricist.id !== musician.id)
    })

    await Promise.all([
      ...associatedComposer.map(async piece => {
        const { id, title, year_published, path, difficulty, notes } = piece
        await invoke("pieces_update", {
          id,
          title,
          yearPublished: year_published,
          path,
          difficulty,
          notes
        });
      }),
      ...arranger.map(async piece => {
        const { id, title, year_published, path, difficulty, notes } = piece
        await invoke("pieces_update", {
          id,
          title,
          yearPublished: year_published,
          path,
          difficulty,
          notes
        });
      }),
      ...orchestrator.map(async piece => {
        const { id, title, year_published, path, difficulty, notes } = piece
        await invoke("pieces_update", {
          id,
          title,
          yearPublished: year_published,
          path,
          difficulty,
          notes
        });
      }),
      ...transcriber.map(async piece => {
        const { id, title, year_published, path, difficulty, notes } = piece
        await invoke("pieces_update", {
          id,
          title,
          yearPublished: year_published,
          path,
          difficulty,
          notes
        });
      }),
      ...lyricist.map(async piece => {
        const { id, title, year_published, path, difficulty, notes } = piece
        await invoke("pieces_update", {
          id,
          title,
          yearPublished: year_published,
          path,
          difficulty,
          notes
        });
      }),
    ])

    await invoke("musicians_delete", { id: musician.id })
    fetchMusicians()
    setDeletingMusician(null)
  }

  async function handleClickConfirmDeleteMusicians() {
    await Promise.all(autoRemoveMusicians.map(async musician => await invoke("musicians_delete", { id: musician.id })))
    fetchMusicians()
    setAutoRemoveMusicians([])
  }

  function handleClickAutoRemoveMusicians() {
    const islandMusicians: Musician[] = []
    musicians.forEach(musician => {
      if (pieces.some(piece => piece.composers.some(composer => composer.id === musician.id))) return
      if (pieces.some(piece => piece.arrangers.some(arranger => arranger.id === musician.id))) return
      if (pieces.some(piece => piece.orchestrators.some(orchestrator => orchestrator.id === musician.id))) return
      if (pieces.some(piece => piece.transcribers.some(transcriber => transcriber.id === musician.id))) return
      if (pieces.some(piece => piece.lyricists.some(lyricist => lyricist.id === musician.id))) return
      islandMusicians.push(musician)
    })

    if (islandMusicians.length === 0) return

    setAutoRemoveMusicians(islandMusicians)
  }

  return (
    <>
      <ContentWrapper value="musicians" name="Musicians">
        <Table>
          <TableHeader>
            <TableRow className="border-divider.focus">
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {musicians.map((musician) => (
              <TableRow key={musician.id} className="group">
                <TableCell>{musician.first_name}</TableCell>
                <TableCell>{musician.last_name}</TableCell>
                <TableCell className="w-[70px] p-0">
                  <span className="invisible group-hover:visible">
                    <Button variant="main" className="p-1">
                      <Icon path={mdiPencil} size={1} />
                    </Button>
                    <Button variant="main" className="p-1" onClick={() => handleClickDeleteMusician(musician)}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </Button>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className='w-fit' onClick={handleClickAutoRemoveMusicians}>
          Remove all unused musicians
        </Button>
      </ContentWrapper>
      <AlertDialog open={deletingMusician !== null && deletingMusician.principalComposer.length > 0}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unable to delete musician
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-[8px]">
              <span>
                <span className="font-bold">{[deletingMusician?.musician.first_name, deletingMusician?.musician.last_name].join(" ")}</span> is the principal composer of the following pieces:
              </span>
              <Table>
                <TableBody>
                  {deletingMusician?.principalComposer.map(piece => (
                    <TableRow key={piece.id} className="border-none">
                      <TableCell>{piece.title}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button onClick={() => setDeletingMusician(null)}>Okay</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmingDeleteMusician} onOpenChange={setConfirmingDeleteMusician}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this musician?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-[8px]">
              {deletingMusician && deletingMusician.all.length > 0 ?
                (<span>
                  <span className="font-bold">{[deletingMusician?.musician.first_name, deletingMusician?.musician.last_name].join(" ")}</span> will be removed from the following pieces:
                </span>) : (
                  <span>There are no pieces associated with this composer. All pieces will remain unchanged.</span>
                )
              }
              <Table>
                <TableBody>
                  {deletingMusician?.all.map(piece => (
                    <TableRow key={piece.id} className="border-none">
                      <TableCell>{piece.title}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleClickConfirmDeleteMusician}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={autoRemoveMusicians.length > 0}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete these musicians?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-[8px]">
              The following musicians will be deleted:
              <Table>
                <TableBody>
                  {autoRemoveMusicians.map(musician => (
                    <TableRow key={musician.id}>
                      <TableCell>{[musician.first_name, musician.last_name].join(" ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAutoRemoveMusicians([])}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleClickConfirmDeleteMusicians}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
