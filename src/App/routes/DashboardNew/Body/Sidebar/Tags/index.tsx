import { setTags } from "@/App/routes/Dashboard/reducers/tagsSlice";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { tagsAdd, tagsGetAll } from "@/invokers/db/tags";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretDown, Plus } from "@phosphor-icons/react";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TagItem } from "./TagItem";

const tagFormSchema = z.object({
  name: z.string().min(1),
});

export function Tags() {
  const tagForm = useForm<z.infer<typeof tagFormSchema>>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const newTagRef = useRef<HTMLFormElement>(null);
  const newTagButtonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);

  useEffect(() => {
    fetchTags();

    function handleClickOutside(e: globalThis.MouseEvent) {
      if (
        newTagRef.current &&
        !newTagRef.current.contains(e.target as Node) &&
        newTagButtonRef.current &&
        !newTagButtonRef.current.contains(e.target as Node)
      ) {
        setIsNewTagOpen(false);
        tagForm.reset();
      }
    }
    document.addEventListener("mouseup", handleClickOutside);
    return () => document.removeEventListener("mouseup", handleClickOutside);
  }, []);

  async function fetchTags() {
    const tags = await tagsGetAll();
    dispatch(setTags({ tags }));
  }

  async function onSubmitTagForm(data: z.infer<typeof tagFormSchema>) {
    const { name } = data;
    setIsNewTagOpen(false);
    tagForm.reset();
    await tagsAdd({ name });
    await fetchTags();
    console.log("HI");
  }

  function handleClickNewTag(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsNewTagOpen(true);
    setIsOpen(true);
  }

  return (
    <Collapsible
      className="flex flex-col gap-[4px]"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <span className="flex items-center gap-[4px]">
        <CollapsibleTrigger className="w-full group">
          <Button
            variant="sidebarCollapsible"
            className="w-full flex gap-[4px]"
          >
            <CaretDown
              className="-rotate-90 group-data-[state=open]:rotate-0 transition-transform"
              weight="fill"
            />
            <span>Tags</span>
          </Button>
        </CollapsibleTrigger>
        <Button
          ref={newTagButtonRef}
          variant="sidebarButton"
          className="p-[2px] justify-center"
          onClick={handleClickNewTag}
        >
          <Plus size={16} weight="bold" />
        </Button>
      </span>
      <CollapsibleContent className="flex flex-col gap-[2px]">
        {isNewTagOpen && (
          <Form {...tagForm}>
            <form
              ref={newTagRef}
              onSubmit={tagForm.handleSubmit(onSubmitTagForm)}
              className="flex gap-[2px]"
            >
              <FormField
                control={tagForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" variant="default" className="leading-3">
                Create
              </Button>
            </form>
          </Form>
        )}
        {tags.map((tag) => (
          <TagItem key={tag.id} tag={tag} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
