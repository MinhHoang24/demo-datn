import { useState } from "react";

export default function ProductTabs({ description, specifications }) {
  const [tab, setTab] = useState("info");

  const data = tab === "info" ? description : specifications;

  return (
    <div className="mt-10 bg-white p-6 rounded shadow">
      <div className="flex gap-6 border-b mb-4">
        <button
          onClick={() => setTab("info")}
          className={tab === "info" ? "font-bold border-b-2 border-red-600" : ""}
        >
          Thông tin sản phẩm
        </button>
        <button
          onClick={() => setTab("specs")}
          className={tab === "specs" ? "font-bold border-b-2 border-red-600" : ""}
        >
          Thông số kỹ thuật
        </button>
      </div>

      <div className="space-y-2">
        {data.map((item, i) => (
          <p key={i}>{item}</p>
        ))}
      </div>
    </div>
  );
}