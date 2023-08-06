import { useEffect, useState } from "react";
import { ResizableRight } from "../../components/ResizeableRight";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(512);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1280) {
        setMaxWidth(256);
      } else {
        setMaxWidth(512);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <ResizableRight minWidth={256} width={384} maxWidth={maxWidth}>
      Hi
    </ResizableRight>
  );
}
