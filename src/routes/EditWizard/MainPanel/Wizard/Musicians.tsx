import { SelectMusicians } from "./components/SelectMusician";

export function Musicians() {
  return (
    <div className="edit-wizard-panel">
      <SelectMusicians role="arranger" />
      <SelectMusicians role="transcriber" />
      <SelectMusicians role="orchestrator" />
      <SelectMusicians role="lyricist" />
    </div>
  );
}
