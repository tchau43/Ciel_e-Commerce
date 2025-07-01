export const normalizeLocationName = (name: string): string => {
  if (typeof name !== "string") return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/đ/g, "d")
    .replace(/\s+/g, "") 
    .replace(/^(thanhpho|tp\.?|tinh|quan|q\.?|huyen)\s*/i, "") 
    .trim();
};
