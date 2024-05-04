import { ByteFile } from "@/app/types";
import { formatPartNumbers } from "@/app/utils";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mdiCheck,
  mdiChevronDown,
  mdiFile,
  mdiUnfoldMoreHorizontal,
} from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { emit } from "@tauri-apps/api/event";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router-dom";
import { z } from "zod";
import { CentralPanel } from "./CentralPanel";
import { FilePanel } from "./FilePanel";
import { SelectMusicians } from "./SelectMusicians";
import { SelectTags } from "./SelectTags";
import { pieceFormSchema } from "./types";
import { createPiece, updatePiece } from "./utils";

export function Wizard() {
  const { piece, files, pieceId } = useLoaderData() as { piece?: z.infer<typeof pieceFormSchema>, files?: ByteFile[], pieceId?: number };

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

  const [selectDifficultyOpen, setSelectDifficultyOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ByteFile[]>(files || []);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function onSubmitPieceForm(submittedPiece: z.infer<typeof pieceFormSchema>) {
    try {
      if (piece) {
        await updatePiece(submittedPiece, pieceId!)
      } else {
        await createPiece(submittedPiece)
      }
    } catch (error) {
      console.error(error)
    }

    await emit("refresh_dashboard")

    await invoke("close_window", {
      windowLabel: "wizard",
    });

    console.log("refreshed dashboard")
  }

  async function handleClickCancel() {
    await invoke("close_window", {
      windowLabel: "wizard",
    });
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

    const activeContainer = active.data.current?.sortable?.containerId
    const overContainer = over.data.current?.sortable?.containerId

    if (activeContainer !== overContainer) {

      if (activeContainer !== "file-list") return

      const file = uploadedFiles.find((file) => `f${file.id}` === active.id)!

      if (overContainer === "part-list") {
        const part = pieceForm.getValues("parts").find((part) => `p${part.id}` === over.id)!
        part.file = file
        pieceForm.setValue("parts", pieceForm.getValues("parts"))
      } else if (overContainer === "score-list") {
        const score = pieceForm.getValues("scores").find((score) => `s${score.id}` === over.id)!
        score.file = file
        pieceForm.setValue("scores", pieceForm.getValues("scores"))
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
        const oldIndex = pieceForm.getValues("parts").findIndex(
          (part) => `p${part.id}` === active.id,
        );
        const newIndex = pieceForm.getValues("parts").findIndex(
          (part) => `p${part.id}` === over.id,
        );
        const newParts = arrayMove(
          pieceForm.getValues("parts"),
          oldIndex,
          newIndex,
        );
        pieceForm.setValue("parts", newParts);
        formatPartNumbers(pieceForm);
      } else if (containerType === "s") {
        const oldIndex = pieceForm.getValues("scores").findIndex(
          (score) => `s${score.id}` === active.id,
        );
        const newIndex = pieceForm.getValues("scores").findIndex(
          (score) => `s${score.id}` === over.id,
        );
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
    if (!activeId) return

    const prefix = activeId.toString()[0]

    if (prefix === "f") {
      return (
        <div className="w-36 flex item-center gap-[4px] p-[4px] bg-float-bg.default float-shadow rounded-default">
          <Icon
            path={mdiFile}
            size={0.667}
            className="shrink-0 self-center"
          />
          <span className="text-body-small-default text-fg.2 self-center grow break-all">
            {
              uploadedFiles.find((file) => `f${file.id}` === activeId)!
                .name
            }
          </span>
        </div>
      )
    }
    if (prefix === "p") {
      return (
        <div className="w-36 flex item-center gap-[4px] p-[4px] bg-float-bg.default float-shadow rounded-default">
          <span className="text-body-small-default text-fg.2 self-center grow break-all">
            {
              pieceForm.getValues("parts").find((part) => `p${part.id}` === activeId)!
                .name
            }
          </span>
        </div>
      )
    }
    if (prefix === "s") {
      return (
        <div className="w-36 flex item-center gap-[4px] p-[4px] bg-float-bg.default float-shadow rounded-default">
          <span className="text-body-small-default text-fg.2 self-center grow break-all">
            {
              pieceForm.getValues("scores").find((score) => `s${score.id}` === activeId)!
                .name
            }
          </span>
        </div>
      )
    }
  }

  return (
    <Form {...pieceForm}>
      <form
        onSubmit={pieceForm.handleSubmit(onSubmitPieceForm)}
        className="bg-main-bg.default h-screen w-screen flex flex-col"
      >
        <div className="px-[14px] pt-[14px] pb-[8px] flex flex-col gap-[4px] bg-sidebar-bg.default">
          <div className="flex flex-col gap-[14px]">
            <div className="flex gap-[14px]">
              <FormField
                control={pieceForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-[4px] w-full">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Required"
                        {...field}
                        className="h-fit p-1"
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
                  <FormItem className="flex flex-col gap-[4px]">
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <Popover
                        open={selectDifficultyOpen}
                        onOpenChange={setSelectDifficultyOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="group w-[100px] p-1 text-fg.2 bg-bg.2 h-[24px]"
                          >
                            <span
                              className={cn(
                                "w-full text-left",
                                field.value
                                  ? "text-fg.0"
                                  : "group-hover:text-fg.2",
                              )}
                            >
                              {field.value ? field.value : " Select"}
                            </span>
                            <Icon
                              path={mdiUnfoldMoreHorizontal}
                              size={0.667}
                              className="group-hover:text-fg.0"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Command>
                            <CommandInput />
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    field.onChange(undefined);
                                    setSelectDifficultyOpen(false);
                                  }}
                                  className="flex gap-[8px]"
                                >
                                  <Icon
                                    path={mdiCheck}
                                    size={1}
                                    className={cn(
                                      field.value === undefined
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <span>None</span>
                                </CommandItem>
                                {Array.from({ length: 6 }, (_, i) => i + 1).map(
                                  (difficulty) => (
                                    <CommandItem
                                      key={difficulty}
                                      onSelect={() => {
                                        field.onChange(difficulty);
                                        setSelectDifficultyOpen(false);
                                      }}
                                      className="flex gap-[8px]"
                                    >
                                      <Icon
                                        path={mdiCheck}
                                        size={1}
                                        className={cn(
                                          field.value === difficulty
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <span>{difficulty}</span>
                                    </CommandItem>
                                  ),
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pieceForm.control}
                name="yearPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-[4px]">
                    <FormLabel className="whitespace-nowrap">
                      Year Published
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-fit p-1" />
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
            <PopoverAnchor>
              <PopoverContent className="flex flex-col gap-[8px] pb-[8px] w-screen bg-sidebar-bg.default">
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
                <PopoverTrigger asChild className="group">
                  <Button
                    variant="main"
                    type="button"
                    className="w-full flex items-center justify-center"
                  >
                    <Icon
                      path={mdiChevronDown}
                      size={1}
                      className="group-data-[state=open]:rotate-180"
                    />
                  </Button>
                </PopoverTrigger>
              </PopoverContent>
            </PopoverAnchor>
            <PopoverTrigger asChild className="data-[state=open]:hidden">
              <Button
                variant="main"
                type="button"
                className="w-full flex items-center justify-center"
              >
                <Icon path={mdiChevronDown} size={1} />
              </Button>
            </PopoverTrigger>
          </Popover>
        </div>
        <Separator />
        <ResizablePanelGroup direction="horizontal">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <ResizablePanel defaultSize={30} minSize={15}>
              <FilePanel
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                pieceForm={pieceForm}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel minSize={15}>
              <CentralPanel pieceForm={pieceForm} uploadedFiles={uploadedFiles} />
            </ResizablePanel>
            <DragOverlay>
              <DragOverlayItem />
            </DragOverlay>
          </DndContext>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={30}
            minSize={15}
            className="p-[14px] flex flex-col gap-[14px]"
          >
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
                    <Textarea {...field} className="grow p-1 resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        <Separator />
        <div className="p-[14px] flex-row-reverse flex gap-[14px]">
          <Button type="submit" variant="default" onClick={() => console.log(pieceForm.formState)}>
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
    </Form>
  );
}
