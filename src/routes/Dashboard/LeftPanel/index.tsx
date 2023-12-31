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
import { clearSetlist, setSetlist } from "../reducers/setlistSlice";
import { setTags } from "../reducers/tagsSlice";
import { EditSetlistModal } from "./EditSetlistModal";
import { setSetlists } from "../reducers/setlistsSlice";

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
              className={classNames(
                "flex items-center gap-[14px] w-full hover:text-fg.default transition-all",
                !setlist.setlist ? "text-fg.default" : "text-fg.muted"
              )}
            >
              <Icon path={mdiBookshelf} size={1} />
              <span>All pieces</span>
            </button>
            <button
              onClick={() => setIsEditSetlistModalOpen(true)}
              className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default"
            >
              <Icon path={mdiPlus} size={1} />
              <span>Create setlist</span>
            </button>
            {setlists.map((sl) => (
              <div key={sl.id} className="flex gap-[4px] w-full">
                <button
                  className={classNames(
                    "flex items-center gap-[14px] w-full hover:text-fg.default truncate transition-all",
                    setlist.setlist?.id === sl.id
                      ? "text-fg.default"
                      : "text-fg.muted"
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
                <Menu as="div" className="relative">
                  <Menu.Button className="text-fg.muted hover:text-fg.default flex items-center transition-all">
                    <Icon path={mdiDotsHorizontal} size={1} />
                  </Menu.Button>
                  <Menu.Items className="mt-[14px] fixed flex flex-col w-[192px] p-[4px] rounded-[4px] bg-bg.emphasis shadow-float outline-none z-10">
                    <Menu.Item
                      as="button"
                      onClick={() => handleClickEditSetlist(sl)}
                      className="context-menu-item"
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      as="button"
                      onClick={() => handleClickDeleteSetlist(sl)}
                      className="context-menu-item"
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
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
                    <Menu as="div" className="relative">
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
