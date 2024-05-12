import { Musician } from "@/app/types";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const musicianFormSchema = z.object({
  firstName: z.string().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().optional(),
});

export function EditMusicianDialog(props: {
  defaultMusician?: Musician;
  onConfirm: (firstName: string, lastName?: string, id?: number) => void;
  onClose: Dispatch<SetStateAction<boolean>>;
}) {
  const { defaultMusician, onConfirm, onClose } = props;

  const musicianForm = useForm<z.infer<typeof musicianFormSchema>>({
    resolver: zodResolver(musicianFormSchema),
    defaultValues: {
      firstName: defaultMusician?.first_name || "",
      lastName: defaultMusician?.last_name || "",
    },
  });

  function onSubmitMusicianForm(data: z.infer<typeof musicianFormSchema>) {
    const { firstName, lastName } = data;
    const nulledLastName = lastName?.length === 0 ? undefined : lastName;
    onConfirm(firstName, nulledLastName, defaultMusician?.id);
    musicianForm.reset();
    onClose(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {defaultMusician ? "Edit Musician" : "Add Musician"}
        </DialogTitle>
      </DialogHeader>
      <Form {...musicianForm}>
        <form className="space-y-[14px]">
          <FormField
            control={musicianForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Required" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={musicianForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="link">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={musicianForm.handleSubmit(onSubmitMusicianForm)}>Save</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
