import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./Search.css";
import HeadlessTippy from "@tippyjs/react/headless";
import ItemSearch from "../ItemSearch/ItemSearch";
import apiService from "../../Api/Api";
import unidecode from 'unidecode';


function Search() {
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const inputRef = useRef();

    const removeVietnameseTones = (str) => {
      // Thay thế các ký tự có dấu bằng ký tự không dấu
      return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d") // Thay thế 'đ' bằng 'd'
          .replace(/Đ/g, "D"); // Thay thế 'Đ' bằng 'D'
  };

    // Hàm xóa input
    const handleClear = () => {
        setSearchValue('');
        setSearchResult([]);
        inputRef.current.focus();
    };

    // Ẩn kết quả
    const handleHideResult = () => {
        setShowResult(false);
    };

    // Gọi API để lấy sản phẩm khi từ khóa thay đổi
    useEffect(() => {
      if (!searchValue.trim()) {
          setSearchResult([]);
          setShowResult(false);
          return;
      }
  
      const fetchProducts = async () => {
          setLoading(true);
          try {
              // Gọi API để lấy danh sách sản phẩm
              const response = await apiService.getProducts();
              const products = response.data.formattedProducts || [];
  
              // Lọc sản phẩm dựa trên searchValue
              const filteredResults = products.filter((product) => {
                // Loại bỏ dấu từ tên sản phẩm và từ khóa tìm kiếm
                const name = removeVietnameseTones(product.name.toLowerCase()); // Chuyển tên về chữ thường và loại bỏ dấu
                const search = removeVietnameseTones(searchValue.toLowerCase()); // Chuyển từ khóa tìm kiếm về chữ thường và loại bỏ dấu
            
                // Kiểm tra nếu `name` có chứa `search` dù chỉ một phần ký tự
                return name.includes(search);
            });

              console.log(filteredResults)
  
              // Cập nhật kết quả tìm kiếm
              setSearchResult(filteredResults);
              setShowResult(true);
          } catch (error) {
              console.error("Lỗi khi gọi API:", error);
              setSearchResult([]);
          } finally {
              setLoading(false);
          }
      };
  
      const debounceFetch = setTimeout(fetchProducts, 500); // Debounce 500ms
      return () => clearTimeout(debounceFetch);
  }, [searchValue]);
  

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (!inputValue.startsWith(' ')) {
            setSearchValue(inputValue);
        }
    };

    return (
        <div>
            <HeadlessTippy
                interactive
                placement="bottom"
                visible={showResult && searchResult.length > 0}
                render={(attrs) => (
                    <div
                        tabIndex="-1"
                        {...attrs}
                        className="
                        mt-1
                        w-fit
                        rounded-md
                        bg-white
                        shadow-lg
                        border border-gray-200
                        "
                    >
                        {/* LIST */}
                        <div
                        className="
                            max-h-[500px]
                            overflow-y-auto
                            overflow-x-hidden
                            divide-y divide-gray-100
                        "
                        >
                        {loading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                            Đang tìm kiếm...
                            </div>
                        ) : (
                            searchResult.map((item) => (
                            <ItemSearch
                                key={item._id}
                                id={item._id}
                                name={item.name}
                                image={item.variants?.[0]?.image}
                                sale={item.sale}
                                price={item.price}
                            />
                            ))
                        )}
                        </div>

                        {/* FOOTER khi nhiều hơn 3 kết quả */}
                        {searchResult.length > 5 && (
                        <div className="border-t border-gray-100 px-3 py-2 text-center text-xs text-gray-400">
                            Cuộn để xem thêm
                        </div>
                        )}
                    </div>
                )}
                onClickOutside={handleHideResult}
            >
                <div className="search">
                    <div>
                        <form className="form-y" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="input-y"
                                ref={inputRef}
                                value={searchValue}
                                placeholder="Tìm kiếm..."
                                spellCheck={false}
                                onChange={handleChange}
                                onFocus={() => setShowResult(true)}
                            />
                        </form>
                    </div>
                    <div className="input-btn" style={{ marginLeft: 5 }}>
                        <button
                            className="button-y"
                            type="submit"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} height={40} />
                        </button>
                    </div>
                </div>
            </HeadlessTippy>
        </div>
    );
}

export default Search;