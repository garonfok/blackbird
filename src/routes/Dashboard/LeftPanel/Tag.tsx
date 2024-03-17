import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

export function TagForm(props: {
  tagForm: UseFormReturn<{
    name: string;
    color: string;
  }, any, undefined>
}) {
  const { tagForm } = props;
  return (
    <>
      <FormField
        control={tagForm.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
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
          </FormItem>
        )}
      />
    </>
  )
}
