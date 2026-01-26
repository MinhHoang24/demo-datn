import { useState } from "react";
import Popular from "../../Components/Popular/Popular.jsx";
import "./Home.css";
import { CATEGORY_LIST } from "../../Constants/Category.ts";
import Loader from "../../Components/Loader/Loader";

function Home() {
  const [loadingCount, setLoadingCount] = useState(0);

  const handleLoadStart = () => {
    setLoadingCount((c) => c + 1);
  };

  const handleLoadEnd = () => {
    setLoadingCount((c) => Math.max(0, c - 1));
  };

  const isLoading = loadingCount > 0;

  return (
    <div className="home relative">
      {/* GLOBAL LOADER */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center">
          <Loader size={60} />
        </div>
      )}

      {CATEGORY_LIST.map((category) => (
        <Popular
          key={category}
          category={category}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
        />
      ))}
    </div>
  );
}

export default Home;