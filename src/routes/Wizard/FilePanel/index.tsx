import { ByteFile } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { mdiClose, mdiFile, mdiUploadMultipleOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { open } from "@tauri-apps/api/dialog";
import { Event, listen } from "@tauri-apps/api/event";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SortableItem } from "./SortableItem";

export function FilePanel(props: {
  uploadedFiles: ByteFile[];
  setUploadedFiles: Dispatch<SetStateAction<ByteFile[]>>
}) {

  const { uploadedFiles, setUploadedFiles } = props;

  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [uploadingFilesCount, setUploadingFilesCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinishedUploading, setIsFinishedUploading] = useState(false);

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", handleDrop);

    return (() => { unlisten })
  }, [])

  async function handleDrop(event: Event<string[]>) {
    const { payload: files } = event;

    await uploadFiles(files);
  }

  async function handleClickUpload() {
    const files = await open({
      filters: [
        { name: "PDF", extensions: ["pdf"] },
      ],
      multiple: true,
    });

    if (!files) return;

    uploadFiles(files as string[]);
  }

  async function uploadFiles(files: string[]) {
    setIsUploading(true);
    setUploadingFilesCount(files.length);
    setUploadedFilesCount(0);
    setIsFinishedUploading(false);

    const completedUploads: ByteFile[] = []

    const uploadPromises = files.map(async (file) => {
      if (!file.endsWith(".pdf")) return;

      const buffer = await readBinaryFile(file);
      const data: ByteFile = {
        id: Math.max(...completedUploads.map(file => file.id), ...uploadedFiles.map(file => file.id), 0) + 1,
        name: file.split("/").pop() || "",
        bytearray: buffer
      };

      setUploadedFilesCount((count) => count + 1);

      completedUploads.push(data);
    })

    await Promise.all(uploadPromises);
    setUploadedFiles([...uploadedFiles, ...completedUploads]);

    toast({
      title: "Finished uploading."
    });
    setIsFinishedUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 5000);
  }

  function handleClickRemoveFile(index: number) {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  }

  return (
    <div className="h-full w-full p-[14px] flex flex-col gap-[14px]">
      {isUploading ? (
        <div className="flex flex-col gap-[8px]">
          <Progress
            value={uploadedFilesCount / uploadingFilesCount * 100}
          />
          {isFinishedUploading ? <span>Finished uploading</span> : <span>Uploaded {uploadedFilesCount} of {uploadingFilesCount}</span>}
        </div>
      ) : (
        <span className="flex gap-[8px] justify-between items-center">
          <Label>Uploaded Files</Label>
          <Button onClick={handleClickUpload} type="button" variant="main" className="p-1">
            <Icon path={mdiUploadMultipleOutline} size={1} />
          </Button>
        </span >
      )}
      <SortableContext id="file-list" items={uploadedFiles} strategy={verticalListSortingStrategy}>
        <div
          className="bg-sidebar-bg.default rounded-default p-[4px] flex flex-col h-full"
        >
          <ScrollArea className="h-0 grow">
            <div className="flex flex-col gap-[4px]">
              {uploadedFiles.map((file, index) => (
                <SortableItem key={file.id} id={file.id}>
                  <>
                    <Icon path={mdiFile} size={0.667} className="shrink-0 self-center" />
                    <span className="text-body-small-default text-fg.2 self-center grow break-all">
                      {file.name}
                    </span>
                    <Button type="button" variant="main" className="p-1 h-fit" onClick={() => handleClickRemoveFile(index)}>
                      <Icon path={mdiClose} size={0.667} className="shrink-0" />
                    </Button>
                  </>
                </SortableItem>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SortableContext>
    </div >
  )
}
