import { Ensemble } from "@/app/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mdiTextBoxPlusOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";

interface GroupedEnsembles {
  [key: string]: Ensemble[];
}

export function SelectEnsemble(props: {
  onEnsembleSelect: (ensembleId: number) => void;
}) {
  const { onEnsembleSelect } = props

  const [open, setOpen] = useState(false)
  const [groupedEnsembles, setGroupedEnsembles] = useState<GroupedEnsembles>({});

  useEffect(() => {
    fetchEnsembles();
  }, [])

  async function fetchEnsembles() {
    const ensembles = (await invoke("ensembles_get_all")) as Ensemble[];
    const groupedEnsembles = ensembles.reduce((acc, ensemble) => {
      if (ensemble.category === undefined) {
        acc["Other"] = [...(acc["Other"] || []), ensemble];
        return acc;
      } else {
        acc[ensemble.category] = [
          ...(acc[ensemble.category] || []),
          ensemble,
        ];
        return acc;
      }
    }, {} as GroupedEnsembles);
    setGroupedEnsembles(groupedEnsembles);
  }

  function handleSelect(ensembleId: number) {
    onEnsembleSelect(ensembleId);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1 hover:text-fg.0 transition-default">
        <Icon path={mdiTextBoxPlusOutline} size={1} />
        <span>Load from ensemble template</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Load an ensemble template
          </DialogTitle>
          <DialogDescription>
            This will override the current parts with the selected ensemble's parts.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={Object.keys(groupedEnsembles)[0]}>
          <TabsList>
            {Object.keys(groupedEnsembles).map((category, index) => (
              <TabsTrigger value={category} key={index}>{category}</TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(groupedEnsembles).map((category, index) => (
            <TabsContent key={index} value={category}>
              <Command>
                <CommandInput placeholder="Search for an ensemble" />
                <ScrollArea>
                  <CommandList className="h-60">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {groupedEnsembles[category].map(ensemble => (
                        // <CommandItem key={ensemble.id} onSelect={() => handleSelect(ensemble.id)}>{ensemble.name}</CommandItem>
                        <AlertDialog key={ensemble.id}>
                          <CommandItem>
                            <AlertDialogTrigger>{ensemble.name}
                            </AlertDialogTrigger></CommandItem>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to continue?</AlertDialogTitle>
                              <AlertDialogDescription>This will override any existing parts.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleSelect(ensemble.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </ScrollArea>
              </Command>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
