import { useState } from "react";
import {
  Input,
  InputNumber,
  Button,
  Col,
  Upload,
  Select,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../Api/Api";
import { CATEGORY, CATEGORY_TITLES } from "../../Constants/Category.ts";

const AddProduct = ({ setModalChild, handleRefresh }) => {
  // PRODUCT INFO
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brandName, setBrandName] = useState("");

  const [productImageFile, setProductImageFile] = useState(null);

  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");

  const [price, setPrice] = useState(0);

  // VARIANTS
  const [variants, setVariants] = useState([]);
  const [variantsFiles, setVariantsFiles] = useState({});

  const [uploading, setUploading] = useState(false);

  const addVariant = () => {
    setVariants([
      ...variants,
      { key: Date.now(), color: "", quantity: 0, sale: 0, imageUrl: "" },
    ]);
  };

  const removeVariant = (key) => {
    setVariants(variants.filter((v) => v.key !== key));
    setVariantsFiles((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const updateVariant = (key, field, value) => {
    setVariants(
      variants.map((v) => (v.key === key ? { ...v, [field]: value } : v))
    );
  };

  // Upload helper
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiService.uploadImage(formData);
    return res.data.url;
  };

  const onSubmit = async () => {
    try {
      if (!name || !category || !brandName || !productImageFile) {
        return message.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      }

      setUploading(true);

      // Upload ảnh sản phẩm chính
      let productImageUrl = "";
      if (productImageFile) {
        productImageUrl = await uploadImageToServer(productImageFile);
      }

      // Upload ảnh biến thể
      const variantsProcessed = [];
      for (const variant of variants) {
        let imageUrl = variant.imageUrl;
        if (variantsFiles[variant.key]) {
          imageUrl = await uploadImageToServer(variantsFiles[variant.key]);
        }

        variantsProcessed.push({
          color: variant.color,
          sale: variant.sale || 0,
          quantity: variant.quantity || 0,
          image: imageUrl,
        });
      }

      const payload = {
        name,
        category,
        price,
        image: productImageUrl,
        brand: {
          name: brandName,
        },
        description: description
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l !== ""),
        specifications: specifications
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l !== ""),
        variants: variantsProcessed,
      };

      console.log("Sending product:", payload);

      await apiService.createProduct(payload);
      message.success("Thêm sản phẩm thành công!");

      handleRefresh();
      setModalChild(null);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi thêm sản phẩm!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-[70vw] h-[80vh] p-5 overflow-y-auto">
      <h2 className="text-center mb-5">Thêm Sản Phẩm</h2>

      {/* PRODUCT INFO */}
      <div className="flex gap-5">
        <Col span={12} className="flex flex-col gap-5">
          {/* TEN SAN PHAM */}
          <div>
            <label>Tên sản phẩm <span className="text-red-500">*</span></label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {/* LOAI */}
          <div>
            <label>Loại <span className="text-red-500">*</span></label>
            <Select
              style={{ width: "100%" }}
              value={category}
              onChange={setCategory}
              placeholder="Chọn loại hàng hóa"
            >
              {Object.values(CATEGORY).map((key) => (
                <Select.Option key={key} value={key}>
                  {CATEGORY_TITLES[key]}
                </Select.Option>
              ))}
            </Select>
          </div>
          {/* HANG */}
          <div>
            <label>Tên hãng <span className="text-red-500">*</span></label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          {/* ANH HANG */}
          <div>
            <label>Ảnh sản phẩm <span className="text-red-500">*</span></label>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                setProductImageFile(file);
                return false;
              }}
            >
              <Button icon={<PlusOutlined />}>Chọn ảnh sản phẩm</Button>
            </Upload>

            {productImageFile && (
              <p className="mt-2 text-sm text-gray-600">
                📄 {productImageFile.name}
              </p>
            )}
          </div>
          {/* THONG TIN SAN PHAM */}
          <div>
            <label>Thông tin sản phẩm <span className="text-red-500">*</span></label>
            <Input.TextArea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {/* THONG SO KY THUAT */}
          <div>
            <label>Thông số kỹ thuật <span className="text-red-500">*</span></label>
            <Input.TextArea
              rows={4}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
            />
          </div>
          {/*GIA */}
          <div>
            <label>Giá <span className="text-red-500">*</span></label>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              value={price}
              onChange={setPrice}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </div>        
        </Col>

        {/* VARIANTS */}
        <Col span={12}>
          <h3 style={{ textAlign: "center" }}>Biến thể</h3>

          {variants.map((v) => (
            <div
              key={v.key}
            >
              <div className="flex justify-between">
                <Col span={18} className="flex flex-col gap-6 mb-5">
                  <div>
                    <label>Màu sắc</label>
                    <Input
                      value={v.color}
                      onChange={(e) => updateVariant(v.key, "color", e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Ảnh</label>
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) => {
                        setVariantsFiles((p) => ({ ...p, [v.key]: file }));
                        return false;
                      }}
                    >
                      <Button size="small" icon={<PlusOutlined />}>
                        Chọn ảnh
                      </Button>
                    </Upload>
                    {variantsFiles[v.key] && (
                      <p className="mt-1 text-xs text-gray-600">
                        📄 {variantsFiles[v.key].name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label>Số lượng</label>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      value={v.quantity}
                      onChange={(val) => updateVariant(v.key, "quantity", val)}
                    />
                  </div>
                  
                  <div>
                    <label>Giảm giá (%)</label>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      value={v.sale}
                      onChange={(val) => updateVariant(v.key, "sale", val)}
                    />
                  </div>
                </Col>

                <Col span={4} style={{ display: "flex", alignItems: "center" }}>
                  <Button danger type="primary" onClick={() => removeVariant(v.key)}>
                    <MinusCircleOutlined />
                  </Button>
                </Col>
              </div>
            </div>
          ))}

          <Button type="dashed" style={{ width: "100%" }} onClick={addVariant}>
            <PlusOutlined /> Thêm biến thể
          </Button>
        </Col>
      </div>

      <div className="flex justify-end gap-4 pt-5">
        <Button onClick={() => setModalChild(null)}>
          Hủy
        </Button>
        <Button type="primary" loading={uploading} onClick={onSubmit}>
          Thêm sản phẩm
        </Button>
      </div>
      
    </div>
  );
};

export default AddProduct;