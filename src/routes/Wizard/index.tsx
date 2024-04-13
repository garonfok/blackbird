import { ByteFile, byteFileSchema, instrumentSchema, musicianSchema, tagSchema } from "@/app/types";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, UniqueIdentifier, closestCenter, defaultDropAnimationSideEffects, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { zodResolver } from "@hookform/resolvers/zod";
import { mdiCheck, mdiChevronDown, mdiUnfoldMoreHorizontal } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DragItem } from "./DragItem";
import { FilePanel } from "./FilePanel";
import { SelectMusicians } from "./SelectMusicians";
import { SelectTags } from "./SelectTags";

const pieceFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  yearPublished: z.coerce.number().positive().int().min(1, {
    message: "Year cannot be less than 1",
  }).max(9999, {
    message: "Year cannot be greater than 9999",
  }).optional(),
  difficulty: z.number({
    invalid_type_error: "Difficulty must be a number",
  }).int().min(1).max(6).optional(),
  notes: z.string().optional(),
  tags: tagSchema.array(),
  composers: musicianSchema.array().min(1, {
    message: "At least one composer is required",
  }),
  arrangers: musicianSchema.array(),
  orchestrators: musicianSchema.array(),
  transcribers: musicianSchema.array(),
  lyricists: musicianSchema.array(),
  parts: z.object({
    id: z.string(),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    instruments: instrumentSchema.array(),
    file: byteFileSchema,
  }).array(),
  scores: z.object({
    id: z.string(),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    file: byteFileSchema,
  }).array()
})

export function Wizard() {

  const pieceForm = useForm<z.infer<typeof pieceFormSchema>>({
    resolver: zodResolver(pieceFormSchema),
    defaultValues: {
      title: undefined,
      yearPublished: undefined,
      difficulty: undefined,
      notes: undefined,
      tags: [],
      composers: [],
      arrangers: [],
      orchestrators: [],
      transcribers: [],
      lyricists: [],
      parts: [],
      scores: [],
    },
  });

  const [selectDifficultyOpen, setSelectDifficultyOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ByteFile[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function onSubmitPieceForm(data: z.infer<typeof pieceFormSchema>) {
    console.log(data);
  }

  async function handleClickCancel() {
    await invoke("close_window", {
      windowLabel: "wizard",
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || !active) return;

    if (active.id !== over.id) {
      setUploadedFiles(files => {
        const oldIndex = files.findIndex(file => file.id === active.id);
        const newIndex = files.findIndex(file => file.id === over.id);
        return arrayMove(files, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        }
      }
    })
  }

  return (
    <Form {...pieceForm}>
      <form onSubmit={pieceForm.handleSubmit(onSubmitPieceForm)} className="bg-main-bg.default h-screen w-screen flex flex-col">
        <Collapsible>
          <div className="px-[14px] pt-[14px] pb-[4px] flex flex-col gap-[14px] bg-sidebar-bg.default">
            <div className="flex gap-[14px]">
              <FormField
                control={pieceForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-[4px] w-full">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Required" {...field} className="h-fit p-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                control={pieceForm.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-[4px]">
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <Popover open={selectDifficultyOpen} onOpenChange={setSelectDifficultyOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className='group w-[100px] p-1 text-fg.2 bg-bg.2 h-[24px]'>
                            <span className={cn("w-full text-left", field.value ? "text-fg.0" : "group-hover:text-fg.2")}>
                              {field.value ? field.value : " Select"}
                            </span>
                            <Icon path={mdiUnfoldMoreHorizontal} size={0.667} className="group-hover:text-fg.0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Command>
                            <CommandInput />
                            <CommandList>
                              <CommandEmpty>
                                No results found.
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem onSelect={() => {
                                  field.onChange(undefined);
                                  setSelectDifficultyOpen(false);
                                }}
                                  className="flex gap-[8px]"
                                >
                                  <Icon path={mdiCheck} size={1} className={cn(field.value === undefined ? "opacity-100" : "opacity-0")} />
                                  <span>None</span>
                                </CommandItem>
                                {Array.from({ length: 6 }, (_, i) => i + 1).map((difficulty) => (
                                  <CommandItem
                                    key={difficulty}
                                    onSelect={() => {
                                      field.onChange(difficulty);
                                      setSelectDifficultyOpen(false);
                                    }}
                                    className="flex gap-[8px]"
                                  >
                                    <Icon path={mdiCheck} size={1} className={cn(field.value === difficulty ? "opacity-100" : "opacity-0")} />
                                    <span>{difficulty}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField
                control={pieceForm.control}
                name="yearPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-[4px]">
                    <FormLabel className="whitespace-nowrap">Year Published</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-fit p-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <FormField
              control={pieceForm.control}
              name="composers"
              render={({ field }) => (
                <SelectMusicians required role={field.name} key={field.name} {...field} />
              )} />
            <CollapsibleContent className="flex flex-col gap-[8px]">
              <FormField
                control={pieceForm.control}
                name="arrangers"
                render={({ field }) => (
                  <SelectMusicians role={field.name} key={field.name} {...field} />
                )} />
              <FormField
                control={pieceForm.control}
                name="orchestrators"
                render={({ field }) => (
                  <SelectMusicians role={field.name} key={field.name} {...field} />
                )} />
              <FormField
                control={pieceForm.control}
                name="transcribers"
                render={({ field }) => (
                  <SelectMusicians role={field.name} key={field.name} {...field} />
                )} />
              <FormField
                control={pieceForm.control}
                name="lyricists"
                render={({ field }) => (
                  <SelectMusicians role={field.name} key={field.name} {...field} />
                )} />
            </CollapsibleContent>
            <CollapsibleTrigger asChild className="group">
              <Button variant="main" type="button" className="w-full flex items-center justify-center">
                <Icon path={mdiChevronDown} size={1} className="group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </Collapsible>
        <Separator />
        <ResizablePanelGroup direction="horizontal">

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <ResizablePanel defaultSize={30} minSize={15}>
              <FilePanel uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel minSize={15}>

            </ResizablePanel>
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeId ? <DragItem file={uploadedFiles.find(file => file.id === activeId)!} /> : null}
            </DragOverlay>
          </DndContext>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} minSize={15} className="p-[14px] flex flex-col gap-[14px]">
            <FormField
              control={pieceForm.control}
              name="tags"
              render={({ field }) => (
                <SelectTags {...field} />
              )} />
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
              )} />
          </ResizablePanel>
        </ResizablePanelGroup>
        <Separator />
        <div className="p-[14px] flex-row-reverse flex gap-[14px]">
          <Button type="submit" variant="default">Create Piece</Button>
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
                <AlertDialogCancel>
                  Keep working
                </AlertDialogCancel>
                <Button type="reset" onClick={handleClickCancel}>Yes</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
