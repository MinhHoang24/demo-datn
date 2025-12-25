import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function ProductGallery({
  variants,
  selectedIndex,
  onChangeIndex,
}) {
  return (
    <div>
      {/* MAIN IMAGE */}
      <div className="relative h-[420px] border rounded-lg flex items-center justify-center">
        <img
          src={variants[selectedIndex].image}
          alt=""
          className="w-full h-full object-contain"
        />

        {selectedIndex > 0 && (
          <button
            onClick={() => onChangeIndex(selectedIndex - 1)}
            className="absolute left-2 bg-white p-2 rounded-full shadow"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        {selectedIndex < variants.length - 1 && (
          <button
            onClick={() => onChangeIndex(selectedIndex + 1)}
            className="absolute right-2 bg-white p-2 rounded-full shadow"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 mt-4">
        {variants.map((v, i) => (
          <div
            key={i}
            onClick={() => onChangeIndex(i)}
            className={`w-16 h-16 border rounded cursor-pointer ${
              i === selectedIndex ? "border-red-500" : ""
            }`}
          >
            <img
              src={v.image}
              alt={v.color}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}