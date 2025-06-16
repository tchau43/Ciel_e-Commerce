import {
  Form,
  Input,
  Modal,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  message,
} from "antd";
import { useEffect } from "react";
import { useGetCouponByIdQuery } from "@/services/coupon/getCouponByIdQuery";
import { useUpdateCouponMutation } from "@/services/coupon/updateCouponMutation";
import dayjs from "dayjs";

interface EditCouponProps {
  open: boolean;
  onCancel: () => void;
  couponId: string;
}

const EditCoupon = ({ open, onCancel, couponId }: EditCouponProps) => {
  const [form] = Form.useForm();
  const { data: couponData, isLoading } = useGetCouponByIdQuery(couponId);
  const updateCouponMutation = useUpdateCouponMutation(couponId);

  useEffect(() => {
    if (couponData?.coupon) {
      form.setFieldsValue({
        ...couponData.coupon,
        expiresAt: dayjs(couponData.coupon.expiresAt),
      });
    }
  }, [couponData, form]);

  const handleSubmit = async (values: any) => {
    try {
      await updateCouponMutation.mutateAsync({
        ...values,
        expiresAt: values.expiresAt.toISOString(),
      });
      message.success("Cập nhật mã giảm giá thành công");
      onCancel();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật mã giảm giá");
    }
  };

  const numberParser = (value: string | undefined) => {
    if (!value) return 0;
    return Number(value.replace(/\$\s?|(,*)/g, "").replace("%", "")) || 0;
  };

  return (
    <Modal
      title="Chỉnh sửa mã giảm giá"
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      confirmLoading={updateCouponMutation.isPending}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isLoading}
      >
        <Form.Item
          name="code"
          label="Mã giảm giá"
          rules={[{ required: true, message: "Vui lòng nhập mã giảm giá" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="discountType"
          label="Loại giảm giá"
          rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
        >
          <Select>
            <Select.Option value="PERCENTAGE">Phần trăm</Select.Option>
            <Select.Option value="FIXED_AMOUNT">Số tiền cố định</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discountValue"
          label="Giá trị giảm"
          rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              form.getFieldValue("discountType") === "PERCENTAGE"
                ? `${value}%`
                : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={numberParser as any}
          />
        </Form.Item>

        <Form.Item
          name="minPurchaseAmount"
          label="Đơn hàng tối thiểu"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập giá trị đơn hàng tối thiểu",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={numberParser as any}
          />
        </Form.Item>

        <Form.Item
          name="maxUses"
          label="Số lượt sử dụng tối đa"
          rules={[
            { required: true, message: "Vui lòng nhập số lượt sử dụng tối đa" },
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item
          name="expiresAt"
          label="Ngày hết hạn"
          rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCoupon;
