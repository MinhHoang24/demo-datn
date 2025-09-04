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
  message,
  Upload,
  Select,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import apiService from "../../Api/Api";

const AddProduct = ({ setModalChild, handleRefresh }) => {
  const [variants, setVariants] = useState([]);
  const [productImagePreview, setProductImagePreview] = useState(null); // preview ảnh hãng
  const [brandImageFile, setBrandImageFile] = useState(null); // file ảnh hãng
  const [uploading, setUploading] = useState(false); // trạng thái loading khi submit

  const [variantsFiles, setVariantsFiles] = useState({}); // lưu file ảnh biến thể theo key

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { key: Date.now(), color: "", quantity: "", sale: 0, imageUrl: "" },
    ]);
  };

  const removeVariant = (key) => {
    setVariants(variants.filter((variant) => variant.key !== key));
    // Xóa file ảnh tương ứng
    setVariantsFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
  };

  const handleVariantChange = (key, field, value) => {
    setVariants(
      variants.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant
      )
    );
  };

  // Hàm upload 1 file ảnh lên server, trả về url ảnh
  const uploadImageToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiService.uploadImage(formData);
      console.log("Upload thành công:", response.data.url);


      return response.data.url; // URL ảnh trên server
    } catch (error) {
      console.error("Upload ảnh thất bại", error);
      if (error.response) {
        console.error("Response lỗi:", error.response);
      } else if (error.request) {
        console.error("Lỗi khi gửi request:", error.request);
      } else {
        console.error("Lỗi không xác định:", error.message);
      }
      
      // Thông báo lỗi cho người dùng
      message.error("Upload ảnh thất bại, vui lòng thử lại!");
      throw new Error("Upload ảnh thất bại");
    }
  };

  const onFinish = async (values) => {
    try {
      setUploading(true);

      // Upload ảnh hãng nếu có
      let brandImageUrl = values.brand?.image || "";
      if (brandImageFile) {
        brandImageUrl = await uploadImageToServer(brandImageFile);
      }

      // Upload ảnh từng biến thể nếu có file mới
      const variantsProcessed = [];
      for (const variant of variants) {
        let imageUrl = variant.imageUrl || "";
        if (variantsFiles[variant.key]) {
          imageUrl = await uploadImageToServer(variantsFiles[variant.key]);
        }
        variantsProcessed.push({
          color: variant.color || "default",
          quantity: variant.quantity || 0,
          sale: variant.sale || 0,
          image: imageUrl,
        });
      }

      const data = {
        name: values.name || "",
        category: values.category || "",
        brand: {
          name: values.brand?.name || "",
          image: brandImageUrl,
        },
        description: values.description ? values.description.split("\n") : [],
        specifications: values.specifications
          ? values.specifications.split("\n")
          : [],
        price: values.price || 0,
        variants: variantsProcessed,
      };

      console.log("Dữ liệu gửi lên server:", data);

      await apiService.createProduct(data);
      message.success("Sản phẩm được thêm thành công!");
      handleRefresh();
      setModalChild(null);
    } catch (e) {
      console.error("Đã xảy ra lỗi khi thêm sản phẩm:", e);
      if (e.response) {
        console.error("Response lỗi:", e.response);
      } else if (e.request) {
        console.error("Lỗi khi gửi request:", e.request);
      } else {
        console.error("Lỗi không xác định:", e.message);
      }
      message.error(e.message || "Đã xảy ra lỗi khi thêm sản phẩm");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ width: 1200 }}>
      <h2
        style={{
          marginTop: 0,
          marginBottom: 10,
          textAlign: "center",
          fontSize: "24px",
        }}
      >
        Thêm Sản Phẩm
      </h2>

      <Form
        name="themSanPham"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Loại"
              name="category"
              rules={[{ required: true, message: "Hãy chọn loại hàng hóa!" }]}
            >
              <Select placeholder="Chọn loại hàng hóa">
                <Select.Option value="Điện thoại">Điện thoại</Select.Option>
                <Select.Option value="Laptop">Laptop</Select.Option>
                <Select.Option value="Phụ kiện">Phụ kiện</Select.Option>
                <Select.Option value="Chuột">Chuột</Select.Option>
                <Select.Option value="Ti vi">Ti vi</Select.Option>
                <Select.Option value="Bàn Phím">Bàn Phím</Select.Option>
                <Select.Option value="Tai Nghe">Tai Nghe</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="NSX"
              name={["brand", "name"]}
              required
              rules={[
                {
                  required: true,
                  message: "Hãy nhập tên hãng sản xuất!",
                },
              ]}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ảnh"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => {
                  setBrandImageFile(file);
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => setProductImagePreview(reader.result);
                  return false; // chặn upload tự động
                }}
              >
                {productImagePreview ? (
                  <img
                    src={productImagePreview}
                    alt="brand"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                    }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="Thông tin"
              name="description"
              rules={[
                { required: true, message: "Hãy nhập thông tin sản phẩm!" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              label="Thông số"
              name="specifications"
              rules={[
                { required: true, message: "Hãy nhập thông số sản phẩm!" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              label="Giá"
              name="price"
              wrapperCol={{ span: 12 }}
              rules={[{ required: true, message: "Hãy nhập giá sản phẩm!" }]}
            >
              <InputNumber
                min={0}
                addonAfter="VNĐ"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ paddingLeft: 10 }}>
            <h3 style={{ margin: 0, textAlign: "center" }}>Biến thể</h3>
            {variants.map((variant) => (
              <div key={variant.key} style={{ marginBottom: 8 }}>
                <Divider style={{ margin: 10 }} />
                <Row>
                  <Col span={17}>
                    <Form.Item
                      label="Màu sắc"
                      required
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 17 }}
                    >
                      <Input
                        placeholder="Màu sắc"
                        value={variant.color}
                        onChange={(e) =>
                          handleVariantChange(variant.key, "color", e.target.value)
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      label="Ảnh"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 17 }}
                    >
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          setVariantsFiles((prev) => ({
                            ...prev,
                            [variant.key]: file,
                          }));
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = () =>
                            handleVariantChange(variant.key, "imageUrl", reader.result);
                          return false; // chặn upload tự động
                        }}
                      >
                        {variant.imageUrl ? (
                          <img
                            src={variant.imageUrl}
                            alt="variant"
                            style={{ width: "100%" }}
                          />
                        ) : (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      label="Số lượng"
                      labelCol={{ span: 6 }}
                      rules={[{ required: true, message: "Hãy nhập số lượng!" }]}
                    >
                      <InputNumber
                        min={0}
                        value={variant.quantity}
                        onChange={(value) =>
                          handleVariantChange(variant.key, "quantity", value)
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      label="Giảm giá"
                      labelCol={{ span: 6 }}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={0}
                        addonAfter="%"
                        value={variant.sale}
                        onChange={(value) =>
                          handleVariantChange(variant.key, "sale", value)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      type="dashed"
                      onClick={() => removeVariant(variant.key)}
                      icon={<MinusCircleOutlined />}
                    />
                  </Col>
                </Row>
              </div>
            ))}

            <Button
              type="dashed"
              onClick={addVariant}
              icon={<PlusOutlined />}
              style={{ width: "100%", marginBottom: 20 }}
            >
              Thêm biến thể
            </Button>
          </Col>
        </Row>

        <Form.Item
          wrapperCol={{
            offset: 21,
            span: 3,
          }}
          style={{ marginBottom: 0 }}
        >
          <Space>
            <Button type="primary" htmlType="submit" loading={uploading}>
              OK
            </Button>
            <Button type="default" onClick={() => setModalChild(null)} disabled={uploading}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;