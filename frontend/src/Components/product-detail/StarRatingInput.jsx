import React, { useState } from "react";

export default function StarRatingInput({ value = 5, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);

        return (
          <svg
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={active ? "#facc15" : "none"}
            stroke="#facc15"
            className="w-6 h-6 cursor-pointer transition-transform hover:scale-110"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.48 3.499a.75.75 0 011.04 0l2.347 2.392 3.316.482a.75.75 0 01.416 1.279l-2.397 2.337.566 3.302a.75.75 0 01-1.088.791L12 12.347l-2.96 1.556a.75.75 0 01-1.088-.79l.566-3.303-2.397-2.337a.75.75 0 01.416-1.279l3.316-.482 2.347-2.392z"
            />
          </svg>
        );
      })}
    </div>
  );
}