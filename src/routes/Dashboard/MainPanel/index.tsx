import { Navbar } from "./Navbar";
import { Table } from "./Table";

export function MainPanel() {
  return (
    <div className="w-full flex flex-col">
      <Navbar />
      <Table />
    </div>
  );
}
