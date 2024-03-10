import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Setlist, Tag } from "@/app/types";
import { EditTagModal } from "@/components/EditTagModal";
import { Modal } from "@/components/Modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import {
  mdiBookOpenOutline,
  mdiBookshelf,
  mdiChevronDown,
  mdiCog,
  mdiDotsHorizontal,
  mdiPlus,
  mdiTag,
} from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pushTag, removeTag } from "../reducers/filterSlice";
import { clearSetlist, setSetlist } from "../reducers/setlistSlice";
import { setSetlists } from "../reducers/setlistsSlice";
import { setTags } from "../reducers/tagsSlice";
import { EditSetlistModal } from "./EditSetlistModal";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function LeftPanel() {
  const [isEditSetlistModalOpen, setIsEditSetlistModalOpen] = useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist>();
  const [isConfirmDeleteSetlistModalOpen, setIsConfirmDeleteSetlistModalOpen] =
    useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag>();
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isConfirmDeleteTagModalOpen, setIsConfirmDeleteTagModalOpen] =
    useState(false);

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);
  const setlist = useAppSelector((state) => state.setlist);
  const setlists = useAppSelector((state) => state.setlists);

  useEffect(() => {
    fetchTags();
    fetchSetlists();
  }, []);

  async function fetchTags() {
    const tags = (await invoke("tags_get_all")) as Tag[];
    dispatch(setTags({ tags }));
  }

  async function fetchSetlists() {
    const setlists = (await invoke("setlists_get_all")) as Setlist[];
    dispatch(setSetlists({ setlists }));
  }

  async function handleConfirmEditSetlist(name: string) {
    if (selectedSetlist) {
      await invoke("setlists_update", { id: selectedSetlist.id, name });
      dispatch(setSetlist({ setlist: { ...selectedSetlist, name } }));
    } else {
      await invoke("setlists_add", { name });
    }
    setIsEditSetlistModalOpen(false);
    await fetchSetlists();
  }

  function handleClickEditSetlist(setlist: Setlist) {
    setSelectedSetlist(setlist);
    setIsEditSetlistModalOpen(true);
  }

  function handleClickDeleteSetlist(setlist: Setlist) {
    setSelectedSetlist(setlist);
    setIsConfirmDeleteSetlistModalOpen(true);
  }

  function handleCancelDeleteSetlist() {
    setIsConfirmDeleteSetlistModalOpen(false);
    setSelectedSetlist(undefined);
  }

  async function handleConfirmDeleteSetlist() {
    await invoke("setlists_delete", { id: selectedSetlist!.id });
    dispatch(clearSetlist());
    setIsConfirmDeleteSetlistModalOpen(false);
    setSelectedSetlist(undefined);
    await fetchSetlists();
  }

  function handleCloseEditSetlistModal() {
    setIsEditSetlistModalOpen(false);
    setTimeout(() => setSelectedSetlist(undefined), 150);
  }

  async function handleConfirmEditTag(name: string, color: string) {
    if (selectedTag) {
      await invoke("tags_update", { id: selectedTag.id, name, color });
    } else {
      await invoke("tags_add", { name, color });
    }
    await fetchTags();

    setIsEditTagModalOpen(false);
  }

  function handleContextMenuTags(event: React.MouseEvent) {
    event.preventDefault();
  }

  async function handleClickPushTag(tag: Tag) {
    dispatch(pushTag(tag));
  }

  function handleClickEditTag(tag: Tag) {
    setSelectedTag(tag);
    setIsEditTagModalOpen(true);
  }

  function handleClickDeleteTag(tag: Tag) {
    setSelectedTag(tag);
    setIsConfirmDeleteTagModalOpen(true);
  }

  async function handleConfirmDeleteTag() {
    await invoke("tags_delete", { id: selectedTag!.id });
    dispatch(removeTag(selectedTag!.id));
    setSelectedTag(undefined);
    setIsConfirmDeleteTagModalOpen(false);
    await fetchTags();
  }

  function handleCancelDeleteTag() {
    setIsConfirmDeleteTagModalOpen(false);
    setSelectedTag(undefined);
  }

  function handleCloseEditTagModal() {
    setIsEditTagModalOpen(false);
    setTimeout(() => setSelectedTag(undefined), 150);
  }

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="p-[14px] flex flex-col h-full gap-[14px]">
          <Button variant="primary" size="default" asChild>
            <Link to="/edit-wizard">
              New piece
            </Link>
          </Button>
          <div className="flex flex-col gap-[14px] overflow-y-auto max-h-[50%] scrollbar-default">
            <button
              onClick={() => dispatch(clearSetlist())}
              className={classNames(
                "flex items-center gap-[14px] w-full hover:text-fg.0 transition-default",
                !setlist.setlist ? "text-fg.0" : "text-fg.1"
              )}
            >
              <Icon path={mdiBookshelf} size={1} />
              <span>All pieces</span>
            </button>
            <button
              onClick={() => setIsEditSetlistModalOpen(true)}
              className="flex items-center gap-[14px] w-full link"
            >
              <Icon path={mdiPlus} size={1} />
              <span>Create setlist</span>
            </button>
            {setlists.map((sl) => (
              <div key={sl.id} className="flex gap-[4px] w-full">
                <button
                  className={classNames(
                    "flex items-center gap-[14px] w-full hover:text-fg.0 truncate transition-default",
                    setlist.setlist?.id === sl.id ? "text-fg.0" : "text-fg.1"
                  )}
                  onClick={() => dispatch(setSetlist({ setlist: sl }))}
                >
                  <Icon
                    path={mdiBookOpenOutline}
                    size={1}
                    className="shrink-0"
                  />
                  <span className="truncate w-full text-left">{sl.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="link">
                      <Icon path={mdiDotsHorizontal} size={1} className="link" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleClickEditSetlist(sl)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleClickDeleteSetlist(sl)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
          <Separator />
          <div
            onContextMenu={handleContextMenuTags}
            className="flex flex-col gap-[14px] h-0 flex-grow"
          >
            <span className="flex gap-[14px]">
              <button
                className="flex gap-[14px] items-center w-full"
                onClick={() => setTagsOpen(!isTagsOpen)}
              >
                <Icon
                  path={mdiChevronDown}
                  size={1}
                  className={classNames(
                    "transition-default",
                    isTagsOpen && "rotate-180"
                  )}
                />
                <span>Tags</span>
              </button>
              <button onClick={() => setIsEditTagModalOpen(true)}>
                <Icon path={mdiPlus} size={1} className="link" />
              </button>
            </span>
            {isTagsOpen && (
              <div className="ml-[14px] overflow-y-auto flex flex-col gap-[8px] scrollbar-default">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-[4px] w-full text-fg.1"
                  >
                    <button
                      className="flex gap-[14px] w-full link truncate"
                      onClick={() => handleClickPushTag(tag)}
                    >
                      <Icon
                        path={mdiTag}
                        className="shrink-0"
                        size={1}
                        color={tag.color}
                      />
                      <div className="w-full truncate text-left">
                        {tag.name}
                      </div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="link">
                          <Icon path={mdiDotsHorizontal} size={1} className="link" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleClickEditTag(tag)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClickDeleteTag(tag)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Separator />
          <Link
            to="/settings"
            className="flex gap-[14px] items-center link"
          >
            <Icon path={mdiCog} size={1} />
            <span>Settings</span>
          </Link>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <EditSetlistModal
        defaultName={selectedSetlist?.name}
        closeModal={handleCloseEditSetlistModal}
        isOpen={isEditSetlistModalOpen}
        onConfirm={handleConfirmEditSetlist}
      />
      <Modal
        closeModal={handleCancelDeleteSetlist}
        isOpen={isConfirmDeleteSetlistModalOpen}
        onConfirm={handleConfirmDeleteSetlist}
        cancelText="Cancel"
        title="Are you sure you want to delete this setlist?"
        confirmText="Delete"
      >
        This cannot be undone!
      </Modal>
      <EditTagModal
        defaultTag={selectedTag}
        isOpen={isEditTagModalOpen}
        closeModal={handleCloseEditTagModal}
        onConfirm={handleConfirmEditTag}
      />
      <Modal
        closeModal={handleCancelDeleteTag}
        isOpen={isConfirmDeleteTagModalOpen}
        onConfirm={handleConfirmDeleteTag}
        cancelText="Cancel"
        title="Are you sure you want to delete this tag?"
        confirmText="Delete"
      >
        This cannot be undone!
      </Modal>
    </>
  );
}
