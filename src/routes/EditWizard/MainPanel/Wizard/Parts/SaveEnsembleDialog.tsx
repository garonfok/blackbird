import { Ensemble } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { mdiFloppy } from "@mdi/js";
import Icon from "@mdi/react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  category: z.string(),
});

const NONE_VALUE = "6eef6648406c333a4035cd5e60d0bf2ecf2606d7";

export function SaveEnsemble(props: {
  onSubmit: (name: string, category?: string) => void;
}) {
  const { onSubmit } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: NONE_VALUE,
    }
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const ensembles = (await invoke("ensembles_get_all")) as Ensemble[];
    const categories = Array.from(
      new Set(ensembles.map((ensemble) => ensemble.category))
    );
    setCategories(categories);
  }


  function onFormSubmit(values: z.infer<typeof formSchema>) {
    const { name, category } = values;
    const nulledCategory = category === NONE_VALUE ? undefined : category;
    onSubmit(name, nulledCategory);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="link flex gap-1">
        <Icon path={mdiFloppy} size={1} />
        <span>Save current parts as ensemble template</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ensemble Template</DialogTitle>
          <DialogDescription>Save the current instrumentation as an ensemble template for future use.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-[14px]">
            <FormField
              control={form.control}
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
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an instrument category"
                          // Make the value italic if it's None
                          className={cn(field.value === "None" && "italic")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE} className="italic">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      </DialogContent>
    </Dialog>
  )

}
