import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  clearYearPublishedMax,
  clearYearPublishedMin,
  setYearPublishedMax,
  setYearPublishedMin,
} from "../../../../../reducers/filterSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const yearParser = z
  .string()
  .transform((val) => (val.length > 0 ? parseInt(val) : undefined))
  .optional();

const yearFormSchema = z.object({
  minimum: yearParser,
  maximum: yearParser,
});

export function Year() {
  const filter = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof yearFormSchema>>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      minimum: filter.yearPublishedMin,
      maximum: filter.yearPublishedMax,
    },
  });

  function onSubmit(values: z.infer<typeof yearFormSchema>) {
    const { minimum, maximum } = values;

    if (minimum && maximum && minimum > maximum) {
      dispatch(setYearPublishedMin(maximum));
      dispatch(setYearPublishedMax(minimum));
    } else {
      if (minimum) {
        dispatch(setYearPublishedMin(minimum));
      } else {
        dispatch(clearYearPublishedMin());
      }

      if (maximum) {
        dispatch(setYearPublishedMax(maximum));
      } else {
        dispatch(clearYearPublishedMax());
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-[8px]"
      >
        <FormField
          control={form.control}
          name="minimum"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-[8px] items-center justify-between">
                <FormLabel className="text-fg.2 text-sm">From</FormLabel>
                <FormControl>
                  <Input
                    className="w-32"
                    placeholder="Year"
                    onKeyDown={(e) => {
                      if (!/[\d]|Backspace/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={4}
                    {...field}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maximum"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-[8px] items-center justify-between">
                <FormLabel className="text-fg.2 text-sm">To</FormLabel>
                <FormControl>
                  <Input
                    className="w-32"
                    placeholder="Year"
                    onKeyDown={(e) => {
                      if (!/[\d]|Backspace/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={4}
                    {...field}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        <Button variant="default" className="p-1 text-sm" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
