import { Menu } from "@headlessui/react";
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
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Setlist, Tag } from "../../../app/types";
import { EditTagModal } from "../../../components/EditTagModal";
import { Modal } from "../../../components/Modal";
import { ResizableLeft } from "../../../components/ResizeableLeft";
import { pushTag, removeTag } from "../reducers/filterSlice";
import { setTags } from "../reducers/tagsSlice";
import { CreateSetlistModal } from "./CreateSetlistModal";
import { clearSetlist, setSetlist } from "../reducers/setlistSlice";

export function LeftPanel() {
  const [isCreateSetlistModalOpen, setIsCreateSetlistModalOpen] =
    useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag>();
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isConfirmDeleteTagModalOpen, setIsConfirmDeleteTagModalOpen] =
    useState(false);

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);

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
    setSetlists(setlists);
  }

  async function handleConfirmCreateSetlist(name: string) {
    await invoke("setlists_add", { name });
    setIsCreateSetlistModalOpen(false);
    await fetchSetlists();
  }

  async function handleConfirmCreateTag(name: string, color: string) {
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

  async function handleClickDeleteTag(tag: Tag) {
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
    setIsConfirmDeleteTagModalOpen(false);
  }

  function handleCloseEditTagModal() {
    setIsEditTagModalOpen(false);
    setTimeout(() => setSelectedTag(undefined), 150);
  }

  return (
    <>
      <ResizableLeft width={256} minWidth={160} maxWidth={256}>
        <div className="flex flex-col h-full gap-[14px]">
          <Link
            to="/edit-wizard"
            className="w-full bg-brand.default py-[8px] rounded-[4px] flex justify-center"
          >
            New piece
          </Link>
          <hr className="text-fg.subtle" />
          <div className="flex flex-col gap-[14px] overflow-y-auto max-h-[50%] scrollbar-default">
            <button
              onClick={() => dispatch(clearSetlist())}
              className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default"
            >
              <Icon path={mdiBookshelf} size={1} />
              <span>All pieces</span>
            </button>
            <button
              onClick={() => setIsCreateSetlistModalOpen(true)}
              className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default"
            >
              <Icon path={mdiPlus} size={1} />
              <span>Create setlist</span>
            </button>
            {setlists.map((setlist) => (
              <button
                key={setlist.id}
                className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default"
                onClick={() => dispatch(setSetlist({ setlist }))}
              >
                <Icon path={mdiBookOpenOutline} size={1} className="shrink-0" />
                <span className="truncate">{setlist.name}</span>
              </button>
            ))}
          </div>
          <hr className="text-fg.subtle" />
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
                    "transition-all",
                    isTagsOpen && "rotate-180"
                  )}
                />
                <span>Tags</span>
              </button>
              <button onClick={() => setIsEditTagModalOpen(true)}>
                <Icon
                  path={mdiPlus}
                  size={1}
                  className="text-fg.muted hover:text-fg.default"
                />
              </button>
            </span>
            {isTagsOpen && (
              <div className="ml-[14px] overflow-y-auto flex flex-col gap-[8px] scrollbar-default">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-[4px] w-full text-fg.muted"
                  >
                    <button
                      className="flex gap-[14px] w-full hover:text-fg.default truncate transition-all"
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
                    <Menu>
                      <div className="relative">
                        <Menu.Button className="outline-none flex items-center">
                          <Icon
                            path={mdiDotsHorizontal}
                            size={1}
                            className=" hover:text-fg.default transition-all shrink-0"
                          />
                        </Menu.Button>
                        <Menu.Items className="mt-[14px] fixed flex flex-col w-[192px] p-[4px] rounded-[4px] bg-bg.emphasis shadow-float outline-none z-10">
                          <Menu.Item
                            as="button"
                            onClick={() => handleClickEditTag(tag)}
                            className="context-menu-item"
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            as="button"
                            onClick={() => handleClickDeleteTag(tag)}
                            className="context-menu-item"
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Items>
                      </div>
                    </Menu>
                  </div>
                ))}
              </div>
            )}
          </div>
          <hr className="text-fg.subtle" />
          <Link
            to="/settings"
            className="flex gap-[14px] items-center text-fg.muted hover:text-fg.default"
          >
            <Icon path={mdiCog} size={1} />
            <span>Settings</span>
          </Link>
        </div>
      </ResizableLeft>
      <CreateSetlistModal
        closeModal={() => setIsCreateSetlistModalOpen(false)}
        isOpen={isCreateSetlistModalOpen}
        onConfirm={handleConfirmCreateSetlist}
      />
      <EditTagModal
        defaultTag={selectedTag}
        isOpen={isEditTagModalOpen}
        closeModal={handleCloseEditTagModal}
        onConfirm={handleConfirmCreateTag}
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
