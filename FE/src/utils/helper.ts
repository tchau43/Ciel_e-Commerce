/**
 * Chuẩn hóa tên địa điểm: bỏ dấu, bỏ khoảng trống, chuyển về chữ thường
 */
export const normalizeLocationName = (name: string): string => {
  if (typeof name !== "string") return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/\s+/g, "") // bỏ khoảng trống
    .replace(/^(thanhpho|tp\.?|tinh|quan|q\.?|huyen)\s*/i, "") // bỏ prefix
    .trim();
};
