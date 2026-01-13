import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import "./ProductRating.css";

const ProductRating = ({
  rating = 0,
  onChange,          // 👉 nếu có thì cho click
  size = 18,
}) => {
  const [hover, setHover] = useState(0);
  const isInteractive = typeof onChange === "function";

  const displayRating = hover || rating;
  const fullStars = Math.floor(displayRating);
  const halfStar = displayRating - fullStars >= 0.5;

  const stars = [];

  for (let i = 1; i <= 5; i++) {
    let icon = faStar;
    let color = "gray";

    if (i <= fullStars) {
      color = "gold";
    } else if (i === fullStars + 1 && halfStar) {
      icon = faStarHalfAlt;
      color = "gold";
    }

    stars.push(
      <span
        key={i}
        onClick={() => isInteractive && onChange(i)}
        onMouseEnter={() => isInteractive && setHover(i)}
        onMouseLeave={() => isInteractive && setHover(0)}
        style={{
          cursor: isInteractive ? "pointer" : "default",
          fontSize: size,
        }}
      >
        <FontAwesomeIcon icon={icon} color={color} />
      </span>
    );
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default ProductRating;