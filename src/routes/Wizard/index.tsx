import { closeWindow } from "@/app/invokers";
import { ByteFile } from "@/app/types";
import { cn, createPiece, formatPartNumbers, updatePiece } from "@/app/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mdiChevronDown,
  mdiFile
} from "@mdi/js";
import Icon from "@mdi/react";
import { emit } from "@tauri-apps/api/event";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router-dom";
import { z } from "zod";
import { Sidebar } from "../../components/Sidebar";
import { CentralPanel } from "./CentralPanel";
import { FilePanel } from "./FilePanel";
import { SelectMusicians } from "./SelectMusicians";
import { SelectTags } from "./SelectTags";
import { pieceFormSchema } from "./types";

export function Wizard() {
  const { piece, files, pieceId } = useLoaderData() as {
    piece?: z.infer<typeof pieceFormSchema>;
    files?: ByteFile[];
    pieceId?: number;
  };

  const pieceForm = useForm<z.infer<typeof pieceFormSchema>>({
    resolver: zodResolver(pieceFormSchema),
    defaultValues: piece || {
      title: undefined,
      yearPublished: undefined,
      difficulty: undefined,
      notes: "",
      tags: [],
      composers: [],
      arrangers: [],
      orchestrators: [],
      transcribers: [],
      lyricists: [],
      parts: [],
      scores: [
        {
          id: -1,
          name: "Full Score",
        },
      ],
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<ByteFile[]>(files || []);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function onSubmitPieceForm(
    submittedPiece: z.infer<typeof pieceFormSchema>,
  ) {
    try {
      if (piece) {
        await updatePiece(submittedPiece, pieceId!);
      } else {
        await createPiece(submittedPiece);
      }
    } catch (error) {
      console.error(error);
    }

    await emit("refresh_dashboard");

    await closeWindow({ windowLabel: "wizard" });
  }

  async function handleClickCancel() {
    await closeWindow({ windowLabel: "wizard" });
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId;

    if (activeContainer !== overContainer) {
      if (activeContainer !== "file-list") return;

      const file = uploadedFiles.find((file) => `f${file.id}` === active.id)!;

      if (overContainer === "part-list") {
        const part = pieceForm
          .getValues("parts")
          .find((part) => `p${part.id}` === over.id)!;
        part.file = file;
        pieceForm.setValue("parts", pieceForm.getValues("parts"));
      } else if (overContainer === "score-list") {
        const score = pieceForm
          .getValues("scores")
          .find((score) => `s${score.id}` === over.id)!;
        score.file = file;
        pieceForm.setValue("scores", pieceForm.getValues("scores"));
      }

      setActiveId(null);
      return;
    }

    const containerType = active.id.toString()[0];

    if (active.id !== over.id) {
      if (containerType === "f") {
        const oldIndex = uploadedFiles.findIndex(
          (file) => `${containerType}${file.id}` === active.id,
        );
        const newIndex = uploadedFiles.findIndex(
          (file) => `${containerType}${file.id}` === over.id,
        );
        const newFiles = arrayMove(uploadedFiles, oldIndex, newIndex);
        setUploadedFiles(newFiles);
      } else if (containerType === "p") {
        const oldIndex = pieceForm
          .getValues("parts")
          .findIndex((part) => `p${part.id}` === active.id);
        const newIndex = pieceForm
          .getValues("parts")
          .findIndex((part) => `p${part.id}` === over.id);
        const newParts = arrayMove(
          pieceForm.getValues("parts"),
          oldIndex,
          newIndex,
        );
        pieceForm.setValue("parts", newParts);
        formatPartNumbers(pieceForm);
      } else if (containerType === "s") {
        const oldIndex = pieceForm
          .getValues("scores")
          .findIndex((score) => `s${score.id}` === active.id);
        const newIndex = pieceForm
          .getValues("scores")
          .findIndex((score) => `s${score.id}` === over.id);
        const newScores = arrayMove(
          pieceForm.getValues("scores"),
          oldIndex,
          newIndex,
        );
        pieceForm.setValue("scores", newScores);
      }
    }

    setActiveId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function DragOverlayItem() {
    if (!activeId) return;

    const prefix = activeId.toString()[0];

    if (prefix === "f") {
      return (
        <div className="w-fit max-w-full flex item-center gap-[4px] p-[4px] bg-float-bg.default border border-divider.default float-shadow rounded-default">
          <Icon path={mdiFile} size={2 / 3} className="shrink-0 self-center" />
          <span className="text-body-small-default text-fg.2 self-center grow truncate">
            {uploadedFiles.find((file) => `f${file.id}` === activeId)!.name}
          </span>
        </div>
      );
    }
    if (prefix === "p") {
      return (
        <div className="w-36 flex item-center gap-[4px] p-[4px] bg-float-bg.default float-shadow rounded-default">
          <span className="text-body-small-default text-fg.2 self-center grow break-all">
            {
              pieceForm
                .getValues("parts")
                .find((part) => `p${part.id}` === activeId)!.name
            }
          </span>
        </div>
      );
    }
    if (prefix === "s") {
      return (
        <div className="w-36 flex item-center gap-[4px] p-[4px] bg-float-bg.default float-shadow rounded-default">
          <span className="text-body-small-default text-fg.2 self-center grow break-all">
            {
              pieceForm
                .getValues("scores")
                .find((score) => `s${score.id}` === activeId)!.name
            }
          </span>
        </div>
      );
    }
  }

  return (
    <Form {...pieceForm}>
      <form
        onSubmit={pieceForm.handleSubmit(onSubmitPieceForm)}
        className="bg-main-bg.default h-screen w-screen flex flex-col"
      >
        <div className="px-[14px] pt-[8px] pb-[4px] flex flex-col gap-[4px] bg-sidebar-bg.default">
          <div className="flex flex-col gap-[4px]">
            <div className="flex gap-[8px]">
              <FormField
                control={pieceForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full space-y-1">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Required"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pieceForm.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1">
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <Select value={field.value ? field.value.toString() : "none"} onValueChange={(val) => field.onChange(val === "none" ? undefined : Number(val))}>
                        <SelectTrigger
                          className={cn(!field.value && "text-fg.2", "w-32")}>
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectSeparator />
                          {Array.from({ length: 6 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Grade {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pieceForm.control}
                name="yearPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1">
                    <FormLabel className="whitespace-nowrap">
                      Year Published
                    </FormLabel>
                    <FormControl>
                      <Input
                        onBeforeInput={(e) => {
                          if (e.data && !/[\d]/.test(e.data)) {
                            e.preventDefault();
                          }
                        }}
                        maxLength={4}
                        className="w-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={pieceForm.control}
              name="composers"
              render={({ field }) => (
                <SelectMusicians
                  required
                  role={field.name}
                  key={field.name}
                  {...field}
                />
              )}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild className="group/popover-trigger">
              <Button
                variant="main"
                type="button"
                className="w-full flex items-center justify-center p-1"
              >
                <Icon path={mdiChevronDown} size={1} className="group-data-[state=open]/popover-trigger:rotate-180 transition-transform" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-[4px] pt-[0px] border-none w-screen bg-sidebar-bg.default">
              <FormField
                control={pieceForm.control}
                name="arrangers"
                render={({ field }) => (
                  <SelectMusicians
                    role={field.name}
                    key={field.name}
                    {...field}
                  />
                )}
              />
              <FormField
                control={pieceForm.control}
                name="orchestrators"
                render={({ field }) => (
                  <SelectMusicians
                    role={field.name}
                    key={field.name}
                    {...field}
                  />
                )}
              />
              <FormField
                control={pieceForm.control}
                name="transcribers"
                render={({ field }) => (
                  <SelectMusicians
                    role={field.name}
                    key={field.name}
                    {...field}
                  />
                )}
              />
              <FormField
                control={pieceForm.control}
                name="lyricists"
                render={({ field }) => (
                  <SelectMusicians
                    role={field.name}
                    key={field.name}
                    {...field}
                  />
                )}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Separator />
        <div className="flex h-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <Sidebar direction="left">
              <FilePanel
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                pieceForm={pieceForm}
              />
            </Sidebar>
            <div className="flex grow">
              <CentralPanel
                pieceForm={pieceForm}
                uploadedFiles={uploadedFiles}
              />
              <DragOverlay>
                <DragOverlayItem />
              </DragOverlay>
            </div>
          </DndContext>
          <Sidebar direction="right">
            <div className="flex flex-col gap-[14px] p-4 h-full ">
              <FormField
                control={pieceForm.control}
                name="tags"
                render={({ field }) => <SelectTags {...field} />}
              />
              <FormField
                control={pieceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-[4px] h-full">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="grow p-1 resize-none h-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Sidebar>
        </div>
        <Separator />
        <div className="p-[14px] flex-row-reverse flex gap-[14px]">
          <Button type="submit" variant="default">
            {piece ? "Save changes" : "Create piece"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="main">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>
                Are you sure you want to cancel?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will lose all unsaved changes.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep working</AlertDialogCancel>
                <Button type="reset" onClick={handleClickCancel}>
                  Yes
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form >
  );
}
