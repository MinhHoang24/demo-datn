import { useState } from "react";
import {
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Divider,
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
  const [brandImageFile, setBrandImageFile] = useState(null);
  const [brandPreview, setBrandPreview] = useState(null);

  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);

  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");

  const [price, setPrice] = useState(0);
  const [sale, setSale] = useState(0);
  const [quantity, setQuantity] = useState(0);

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

      // Upload ảnh thương hiệu
      let brandImageUrl = "";
      if (brandImageFile) {
        brandImageUrl = await uploadImageToServer(brandImageFile);
      }

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
        sale,
        quantity,
        image: productImageUrl,
        brand: {
          name: brandName,
          image: brandImageUrl,
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
      <Row gutter={16}>
        <Col span={12}>
          <label>Tên sản phẩm</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />

          <label style={{ marginTop: 10 }}>Loại</label>
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

          <label style={{ marginTop: 10 }}>Tên hãng</label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />

          <div className="flex gap-10 my-6">
            <div>
              <label>Ảnh hãng</label>
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => {
                  setBrandImageFile(file);
                  const r = new FileReader();
                  r.onload = () => setBrandPreview(r.result);
                  r.readAsDataURL(file);
                  return false;
                }}
              >
                {brandPreview ? (
                  <img src={brandPreview} style={{ width: "100%" }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div>Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            <div>
              <label>Ảnh sản phẩm (bắt buộc)</label>
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => {
                  setProductImageFile(file);
                  const r = new FileReader();
                  r.onload = () => setProductImagePreview(r.result);
                  r.readAsDataURL(file);
                  return false;
                }}
              >
                {productImagePreview ? (
                  <img src={productImagePreview} style={{ width: "100%" }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div>Upload</div>
                  </div>
                )}
              </Upload>
            </div>
          </div>

          <label>Thông tin sản phẩm</label>
          <Input.TextArea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Thông số kỹ thuật</label>
          <Input.TextArea
            rows={4}
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
          />

          <label>Giá</label>
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            value={price}
            onChange={setPrice}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />

          <label style={{ marginTop: 10 }}>Giảm giá (%)</label>
          <InputNumber min={0} style={{ width: "100%" }} value={sale} onChange={setSale} />

          <label style={{ marginTop: 10 }}>Số lượng</label>
          <InputNumber min={0} style={{ width: "100%" }} value={quantity} onChange={setQuantity} />
        </Col>

        {/* VARIANTS */}
        <Col span={12}>
          <h3 style={{ textAlign: "center" }}>Biến thể (tùy chọn)</h3>

          {variants.map((v) => (
            <div
              key={v.key}
              style={{ padding: 10, border: "1px solid #eee", marginBottom: 10 }}
            >
              <Row gutter={16}>
                <Col span={18}>
                  <label>Màu sắc</label>
                  <Input
                    value={v.color}
                    onChange={(e) => updateVariant(v.key, "color", e.target.value)}
                  />

                  <label>Ảnh</label>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setVariantsFiles((p) => ({ ...p, [v.key]: file }));
                      const r = new FileReader();
                      r.onload = () => updateVariant(v.key, "imageUrl", r.result);
                      r.readAsDataURL(file);
                      return false;
                    }}
                  >
                    {v.imageUrl ? (
                      <img src={v.imageUrl} style={{ width: "100%" }} />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div>Upload</div>
                      </div>
                    )}
                  </Upload>

                  <label>Số lượng</label>
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    value={v.quantity}
                    onChange={(val) => updateVariant(v.key, "quantity", val)}
                  />

                  <label>Giảm giá (%)</label>
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    value={v.sale}
                    onChange={(val) => updateVariant(v.key, "sale", val)}
                  />
                </Col>

                <Col span={4} style={{ display: "flex", alignItems: "center" }}>
                  <Button danger type="primary" onClick={() => removeVariant(v.key)}>
                    <MinusCircleOutlined />
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <Button type="dashed" style={{ width: "100%" }} onClick={addVariant}>
            <PlusOutlined /> Thêm biến thể
          </Button>
        </Col>
      </Row>

      <Row style={{ marginTop: 20, justifyContent: "flex-end" }}>
        <Button onClick={() => setModalChild(null)} style={{ marginRight: 10 }}>
          Hủy
        </Button>
        <Button type="primary" loading={uploading} onClick={onSubmit}>
          Thêm sản phẩm
        </Button>
      </Row>
    </div>
  );
};

export default AddProduct;