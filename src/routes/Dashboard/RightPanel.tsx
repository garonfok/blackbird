import { useEffect, useState } from "react";
import { ResizableRight } from "../../components/ResizeableRight";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(384);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1024) {
        setMaxWidth(256);
      } else {
        setMaxWidth(384);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <ResizableRight width={256} minWidth={192} maxWidth={maxWidth}>
      Hi
    </ResizableRight>
  );
}
