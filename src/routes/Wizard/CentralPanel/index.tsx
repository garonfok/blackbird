import { ByteFile } from "@/app/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema } from "../types";
import { Parts } from "./Parts";
import { Scores } from "./Scores";

export function CentralPanel(props: {
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>
  uploadedFiles: ByteFile[]
}) {
  const { pieceForm, uploadedFiles } = props;

  return (
    <div className="h-full w-full p-[14px]">
      <Tabs defaultValue="parts" className="gap-[14px] flex flex-col h-full">
        <TabsList className='w-fit'>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
        </TabsList>
        <TabsContent value="parts" className="h-full">
          <Parts pieceForm={pieceForm} uploadedFiles={uploadedFiles} />
        </TabsContent>
        <TabsContent value="scores" className="h-full">
          <Scores pieceForm={pieceForm} uploadedFiles={uploadedFiles} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
