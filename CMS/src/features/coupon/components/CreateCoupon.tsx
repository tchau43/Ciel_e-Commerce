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
import { useCreateCouponMutation } from "@/services/coupon/createCouponMutation";
import dayjs from "dayjs";

interface CreateCouponProps {
  open: boolean;
  onCancel: () => void;
}

const CreateCoupon = ({ open, onCancel }: CreateCouponProps) => {
  const [form] = Form.useForm();
  const createCouponMutation = useCreateCouponMutation();

  const handleSubmit = async (values: any) => {
    try {
      await createCouponMutation.mutateAsync({
        ...values,
        expiresAt: values.expiresAt.toISOString(),
      });
      message.success("Tạo mã giảm giá thành công");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo mã giảm giá");
    }
  };

  const numberParser = (value: string | undefined) => {
    if (!value) return 0;
    return Number(value.replace(/\$\s?|(,*)/g, "").replace("%", "")) || 0;
  };

  return (
    <Modal
      title="Tạo mã giảm giá mới"
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      confirmLoading={createCouponMutation.isPending}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          initialValue={dayjs().add(30, "days")}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCoupon;
