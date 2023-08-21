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
import { useAppDispatch } from "../../app/hooks";
import { Setlist, Tag } from "../../app/types";
import { EditTagModal } from "../../components/EditTagModal";
import { ResizableLeft } from "../../components/ResizeableLeft";
import { pushTag } from "./filterSlice";

export function LeftPanel() {
  const [isTagsOpen, setTagsOpen] = useState(false);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchTags();
    fetchSetlists();
  }, []);

  async function fetchTags() {
    const tags = (await invoke("tags_get_all")) as Tag[];
    setTags(tags);
  }

  async function fetchSetlists() {
    const setlists = (await invoke("setlists_get_all")) as Setlist[];
    setSetlists(setlists);
  }

  async function handleConfirmCreateTag(name: string, color: string) {
    await invoke("tags_add", { name, color });
    await fetchTags();

    setIsEditTagModalOpen(false);
  }

  function handleContextMenuTags(event: React.MouseEvent) {
    event.preventDefault();
  }

  async function handleClickPushTag(tag: Tag) {
    dispatch(pushTag(tag));
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
            <button className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default">
              <Icon path={mdiBookshelf} size={1} />
              <span>All pieces</span>
            </button>
            <button className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default">
              <Icon path={mdiPlus} size={1} />
              <span>Create setlist</span>
            </button>
            {setlists.map((setlist) => (
              <button
                key={setlist.id}
                className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default"
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
                    <button>
                      <Icon
                        path={mdiDotsHorizontal}
                        size={1}
                        className=" hover:text-fg.default transition-all shrink-0"
                      />
                    </button>
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
      <EditTagModal
        isOpen={isEditTagModalOpen}
        closeModal={() => setIsEditTagModalOpen(false)}
        onConfirm={handleConfirmCreateTag}
      />
    </>
  );
}
