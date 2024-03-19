import { Tag } from "@/app/types";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
});

export function EditTagDialog(props: {
  defaultTag?: Tag;
  onConfirm: (name: string, color: string) => void;
  onClose: Dispatch<SetStateAction<boolean>>;
}) {
  const { defaultTag, onConfirm, onClose } = props;

  const tagForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultTag?.name || "",
      color: defaultTag?.color || "#000000",
    },
  });

  function onSubmitForm(data: z.infer<typeof formSchema>) {
    const { name, color } = data;
    onConfirm(name, color);
    tagForm.reset();
    onClose(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {defaultTag ? "Edit Tag" : "Create Tag"}
        </DialogTitle>
      </DialogHeader>
      <Form {...tagForm}>
        <form onSubmit={tagForm.handleSubmit(onSubmitForm)} className="space-y-[14px]">
          <FormField
            control={tagForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Required" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={tagForm.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="link">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
