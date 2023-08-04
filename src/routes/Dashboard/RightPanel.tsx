import { ResizableRight } from "../../components/ResizeableRight";

export function RightPanel() {
  return (
    <ResizableRight width={256} minWidth={192} maxWidth={384}>
      Hi
    </ResizableRight>
  );
}
