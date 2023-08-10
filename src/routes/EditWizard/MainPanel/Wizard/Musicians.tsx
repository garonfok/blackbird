export function Musicians() {
  return (
    <div className="edit-wizard-panel">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-[8px]">
          Line {i + 1}
        </div>
      ))}
    </div>
  );
}
