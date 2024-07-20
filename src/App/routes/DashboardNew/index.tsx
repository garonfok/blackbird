import { Footer } from "./Footer";
import { Body } from "./Body";
import { Toolbar } from "./Toolbar";

export function DashboardNew() {
  return (
    <div className="h-screen p-[4px] bg-bg.1 flex flex-col">
      <Toolbar />
      <Body />
      <Footer />
    </div>
  );
}
