import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Instrument, Musician } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect, OptionType } from "@/components/ui/multiselect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { resetFilter, setFilterExclTag } from "@/routes/Dashboard/reducers/filterSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { mdiEraser } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  yearPublishedMin: z.coerce.number().min(0).max(9999).optional(),
  yearPublishedMax: z.coerce.number().min(0).max(9999).optional(),
  difficultyMin: z.union([z.literal("None"), z.coerce.number().min(1).max(6)]).optional(),
  difficultyMax: z.union([z.literal("None"), z.coerce.number().min(1).max(6)]).optional(),
  instruments: z.array(z.number()),
  composers: z.array(z.number()),
  arrangers: z.array(z.number()),
  orchestrators: z.array(z.number()),
  transcribers: z.array(z.number()),
  lyricists: z.array(z.number()),
})

export function AdvancedFilters(props: { onOpenChange: Dispatch<SetStateAction<boolean>> }) {
  const { onOpenChange } = props;
  const [instruments, setInstruments] = useState<OptionType[]>([]);
  const [musicians, setMusicians] = useState<OptionType[]>([]);

  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);

  useEffect(() => {
    fetchInstruments();
    fetchMusicians();
  }, [])

  useEffect(() => {
    form.setValue("yearPublishedMin", filter.yearPublishedMin);
    form.setValue("yearPublishedMax", filter.yearPublishedMax);
    form.setValue("difficultyMin", filter.difficultyMin === undefined ? "None" : filter.difficultyMin);
    form.setValue("difficultyMax", filter.difficultyMax === undefined ? "None" : filter.difficultyMax);
    form.setValue("instruments", filter.instruments.map((instrument) => instrument.id));
    form.setValue("composers", filter.composers.map((composer) => composer.id));
    form.setValue("arrangers", filter.arrangers.map((arranger) => arranger.id));
    form.setValue("orchestrators", filter.orchestrators.map((orchestrator) => orchestrator.id));
    form.setValue("transcribers", filter.transcribers.map((transcriber) => transcriber.id));
    form.setValue("lyricists", filter.lyricists.map((lyricist) => lyricist.id));
  }, [filter])

  async function fetchInstruments() {
    const fetchedInstruments = (await invoke("instruments_get_all")) as Instrument[];
    fetchedInstruments.sort((a, b) => a.name.localeCompare(b.name));
    setInstruments(fetchedInstruments.map((instrument) => ({ value: instrument.id, label: instrument.name })));
  }

  async function fetchMusicians() {
    const musicians = (await invoke("musicians_get_all")) as Musician[];
    musicians.sort((a, b) => {
      const aLastName = a.last_name ?? "";
      const bLastName = b.last_name ?? "";
      const lastNameComparison = aLastName.localeCompare(bLastName);
      if (lastNameComparison !== 0) return lastNameComparison;
      return a.first_name.localeCompare(b.first_name);
    });

    setMusicians(musicians.map((musician => ({ value: musician.id, label: musician.last_name ? `${musician.first_name} ${musician.last_name}` : musician.first_name }))));
  }

  function handleClickClearFilters() {
    form.reset();
    dispatch(resetFilter());
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearPublishedMin: undefined,
      yearPublishedMax: undefined,
      difficultyMin: undefined,
      difficultyMax: undefined,
      instruments: [],
      composers: [],
      arrangers: [],
      orchestrators: [],
      transcribers: [],
      lyricists: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {

    // swap min and max if min is greater than max
    if (values.yearPublishedMin !== undefined && values.yearPublishedMax !== undefined && values.yearPublishedMin > values.yearPublishedMax) {
      [values.yearPublishedMin, values.yearPublishedMax] = [values.yearPublishedMax, values.yearPublishedMin];
    }
    form.setValue("yearPublishedMin", values.yearPublishedMin);
    form.setValue("yearPublishedMax", values.yearPublishedMax);

    // swap min and max if min is greater than max
    if (values.difficultyMin !== undefined && values.difficultyMax !== undefined && values.difficultyMin > values.difficultyMax) {
      [values.difficultyMin, values.difficultyMax] = [values.difficultyMax, values.difficultyMin];
    }
    form.setValue("difficultyMin", values.difficultyMin);
    form.setValue("difficultyMax", values.difficultyMax);
    form.setValue("instruments", values.instruments);
    form.setValue("composers", values.composers);
    form.setValue("arrangers", values.arrangers);
    form.setValue("orchestrators", values.orchestrators);
    form.setValue("transcribers", values.transcribers);
    form.setValue("lyricists", values.lyricists);

    const allInstruments = await invoke("instruments_get_all") as Instrument[];
    const allMusicians = await invoke("musicians_get_all") as Musician[];

    const foundInstruments = allInstruments.filter((instrument) => values.instruments.includes(instrument.id));
    const foundComposers = allMusicians.filter((musician) => values.composers.includes(musician.id));
    const foundArrangers = allMusicians.filter((musician) => values.arrangers.includes(musician.id));
    const foundOrchestrators = allMusicians.filter((musician) => values.orchestrators.includes(musician.id));
    const foundTranscribers = allMusicians.filter((musician) => values.transcribers.includes(musician.id));
    const foundLyricists = allMusicians.filter((musician) => values.lyricists.includes(musician.id));

    dispatch(
      setFilterExclTag({
        yearPublishedMin: values.yearPublishedMin,
        yearPublishedMax: values.yearPublishedMax,
        difficultyMin: values.difficultyMin === "None" ? undefined : values.difficultyMin,
        difficultyMax: values.difficultyMax === "None" ? undefined : values.difficultyMax,
        instruments: foundInstruments,
        composers: foundComposers,
        arrangers: foundArrangers,
        orchestrators: foundOrchestrators,
        transcribers: foundTranscribers,
        lyricists: foundLyricists,
      })
    );
    onOpenChange(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[14px]">
        <ScrollArea>
          <div className="max-h-72">
            <div className="flex gap-[14px]">
              <FormField
                control={form.control}
                name="yearPublishedMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mininum Year Published</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearPublishedMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Year Published</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-[14px]">
              <FormField
                control={form.control}
                name="difficultyMin"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Minimum Difficulty</FormLabel>
                    <Select onValueChange={
                      (value) => field.onChange(value === "None" ? undefined : parseInt(value))
                    } defaultValue={"None"} {...field} value={typeof field.value === "number" ? field.value.toString() : field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"None"}>None</SelectItem>
                        {Array.from({ length: 6 }, (_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FormMessage />
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficultyMax"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Maximum Difficulty</FormLabel>
                    <Select onValueChange={
                      (value) => field.onChange(value === "None" ? undefined : parseInt(value))
                    } defaultValue={"None"} {...field} value={typeof field.value === "number" ? field.value.toString() : field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"None"}>None</SelectItem>
                        {Array.from({ length: 6 }, (_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FormMessage />
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField control={form.control} name="instruments" render={({ field }) => (
              <FormItem>
                <FormLabel>Instruments</FormLabel>
                <MultiSelect options={instruments} selected={field.value} searchPlaceholder="Search for an instrument" selectPlaceholder="Select instruments" {...field} />
              </FormItem>
            )} />
            <FormField control={form.control} name="composers" render={({ field }) => (
              <FormItem>
                <FormLabel>Composers</FormLabel>
                <MultiSelect options={musicians} selected={field.value} searchPlaceholder="Search for a composer" selectPlaceholder="Select composers" {...field} />
              </FormItem>
            )} />
            <FormField control={form.control} name="arrangers" render={({ field }) => (
              <FormItem>
                <FormLabel>Arrangers</FormLabel>
                <MultiSelect options={musicians} selected={field.value} searchPlaceholder="Search for an arranger" selectPlaceholder="Select arrangers" {...field} />
              </FormItem>
            )} />
            <FormField control={form.control} name="orchestrators" render={({ field }) => (
              <FormItem>
                <FormLabel>Orchestrators</FormLabel>
                <MultiSelect options={musicians} selected={field.value} searchPlaceholder="Search for an orchestrator" selectPlaceholder="Select orchestrators" {...field} />
              </FormItem>
            )} />
            <FormField control={form.control} name="transcribers" render={({ field }) => (
              <FormItem>
                <FormLabel>Transcribers</FormLabel>
                <MultiSelect options={musicians} selected={field.value} searchPlaceholder="Search for a transcriber" selectPlaceholder="Select transcribers" {...field} />
              </FormItem>
            )} />
            <FormField control={form.control} name="lyricists" render={({ field }) => (
              <FormItem>
                <FormLabel>Lyricists</FormLabel>
                <MultiSelect options={musicians} selected={field.value} searchPlaceholder="Search for a lyricist" selectPlaceholder="Select lyricists" {...field} />
              </FormItem>
            )} />
          </div>
        </ScrollArea>
        <Separator />
        <div className="flex gap-[14px]">
          <Button type="submit">
            Apply filters
          </Button>
          <button
            onClick={handleClickClearFilters}
            type="submit"
            className="link"
          >
            <Icon path={mdiEraser} size={1} className="shrink-0" />
          </button>
        </div>
      </form>
    </Form>
  );
}
