import { Navbar } from "./Navbar";
import { Table } from "./Table";

export function MainPanel() {
  return (
    <div className="flex flex-col bg-main-bg.default h-full grow">
      <Navbar />
      <Table />
    </div>
  );
}
