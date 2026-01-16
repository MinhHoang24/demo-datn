import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Row,
  Col,
  Divider,
  Upload,
  Image,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../Api/Api";
import ProductDetails from "./ProductDetails";

const EditProduct = ({ product, setModalChild, handleRefresh }) => {
  /* ================= VARIANTS STATE ================= */
  const initialVariants = (product.variants || []).map((v) => ({
    ...v,
    key: Date.now() + Math.random(),
  }));

  const [variants, setVariants] = useState(initialVariants);
  const [variantFiles, setVariantFiles] = useState({});
  const [uploading, setUploading] = useState(false);

  /* ================= HELPERS ================= */
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiService.uploadImage(formData);
    return res.data.url;
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { key: Date.now(), color: "", quantity: 0, sale: 0, image: "" },
    ]);
  };

  const removeVariant = (key) => {
    setVariants(variants.filter((v) => v.key !== key));
    setVariantFiles((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const updateVariant = (key, field, value) => {
    setVariants(
      variants.map((v) =>
        v.key === key ? { ...v, [field]: value } : v
      )
    );
  };

  /* ================= SUBMIT ================= */
  const onFinish = async (values) => {
    try {
      if (!product?._id) throw new Error("Không tìm thấy ID sản phẩm");

      setUploading(true);

      const data = {
        name: values.name,
        category: values.category,
        brand: { name: values.brand?.name || "" },
        price: values.price || 0,
        description:
          typeof values.description === "string"
            ? values.description.split("\n").map((l) => l.trim()).filter(Boolean)
            : [],
        specifications:
          typeof values.specifications === "string"
            ? values.specifications.split("\n").map((l) => l.trim()).filter(Boolean)
            : [],
        variants: [],
      };

      /* ===== Upload & xử lý biến thể ===== */
      for (const variant of variants) {
        let imageUrl = variant.image;

        if (variantFiles[variant.key]) {
          imageUrl = await uploadImageToServer(variantFiles[variant.key]);
        }

        data.variants.push({
          color: variant.color || "default",
          quantity: variant.quantity || 0,
          sale: variant.sale || 0,
          image: imageUrl || "",
        });
      }

      await apiService.updateProduct(product._id, data);
      message.success("Cập nhật sản phẩm thành công!");

      handleRefresh();
      setModalChild(null);
    } catch (err) {
      console.error(err);
      message.error(err.message || "Lỗi khi cập nhật sản phẩm");
    } finally {
      setUploading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div style={{ width: '80vw', margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 10 }}>
        Chỉnh sửa sản phẩm
      </h2>

      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{
          ...product,
          description: product.description?.join("\n"),
          specifications: product.specifications?.join("\n"),
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          {/* ================= LEFT ================= */}
          <Col span={12}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Loại"
              name="category"
              rules={[{ required: true, message: "Nhập loại hàng hóa" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Hãng">
              <Form.Item
                name={["brand", "name"]}
                rules={[{ required: true, message: "Nhập tên hãng" }]}
                noStyle
              >
                <Input />
              </Form.Item>
            </Form.Item>

            <Form.Item
              label="Thông tin"
              name="description"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Thông số"
              name="specifications"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Giá"
              name="price"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(v) =>
                  `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>

          {/* ================= RIGHT – VARIANTS ================= */}
          <Col span={12}>
            <h3>Biến thể</h3>

            {variants.map((v) => (
              <div key={v.key}>
                <Divider dashed />

                <Form.Item label="Màu sắc">
                  <Input
                    value={v.color}
                    onChange={(e) =>
                      updateVariant(v.key, "color", e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item label="Ảnh">
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setVariantFiles((p) => ({ ...p, [v.key]: file }));
                      return false;
                    }}
                  >
                    <Button icon={<PlusOutlined />}>Chọn ảnh mới</Button>
                  </Upload>

                  {v.image && (
                    <Image
                      src={v.image}
                      width={100}
                      height={100}
                      style={{
                        marginTop: 8,
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                      }}
                    />
                  )}

                  {variantFiles[v.key] && (
                    <div style={{ fontSize: 12 }}>
                      📄 {variantFiles[v.key].name}
                    </div>
                  )}
                </Form.Item>

                <Form.Item label="Số lượng">
                  <InputNumber
                    min={0}
                    value={v.quantity}
                    onChange={(val) =>
                      updateVariant(v.key, "quantity", val)
                    }
                  />
                </Form.Item>

                <Form.Item label="Giảm giá (%)">
                  <InputNumber
                    min={0}
                    value={v.sale}
                    onChange={(val) => updateVariant(v.key, "sale", val)}
                  />
                </Form.Item>

                <Button
                  danger
                  type="dashed"
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeVariant(v.key)}
                >
                  Xóa biến thể
                </Button>
              </div>
            ))}

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              style={{ width: "100%", marginTop: 10 }}
              onClick={addVariant}
            >
              Thêm biến thể
            </Button>
          </Col>
        </Row>

        {/* ================= ACTIONS ================= */}
        <Form.Item
          wrapperCol={{ offset: 21, span: 3 }}
          style={{ marginTop: 20 }}
        >
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
            >
              Lưu
            </Button>
            <Button
              onClick={() =>
                setModalChild(
                  <ProductDetails
                    products={product}
                    setModalChild={setModalChild}
                    handleRefresh={handleRefresh}
                  />
                )
              }
            >
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditProduct;