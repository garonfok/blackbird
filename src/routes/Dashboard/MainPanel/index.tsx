import { ResizablePanel } from "@/components/ui/resizable";
import { Navbar } from "./Navbar";
import { Table } from "./Table";

export function MainPanel() {
  return (
    <ResizablePanel className="w-full flex flex-col bg-main-bg.default">
      <Navbar />
      <Table />
    </ResizablePanel>
  );
}
