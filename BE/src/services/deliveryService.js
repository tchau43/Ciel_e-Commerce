// services/deliveryService.js
// SIMULATED delivery fee calculation based on destination from Hanoi.
// IMPORTANT: Replace with actual shipping provider API calls for production!

const axios = require('axios'); // Keep for potential future API calls
const { formatCurrencyVND } = require('../utils/helper');

// Hàm chuẩn hóa tên địa điểm: bỏ dấu, bỏ khoảng trống, chuyển về chữ thường
function normalizeLocationName(name) {
    if (typeof name !== 'string') return '';
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
        .replace(/đ/g, "d")
        .replace(/\s+/g, "") // bỏ khoảng trống
        .replace(/^(thanhpho|tp\.?|tinh|quan|q\.?|huyen)\s*/i, '') // bỏ prefix
        .trim();
}

// Cache cho dữ liệu provinces để tránh gọi API nhiều lần
let provincesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 giờ

// Hàm lấy dữ liệu provinces từ API hoặc cache
async function getProvinces() {
    const now = Date.now();
    if (provincesCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
        return provincesCache;
    }

    try {
        const response = await axios.get('https://provinces.open-api.vn/api/?depth=2');
        provincesCache = response.data;
        lastFetchTime = now;
        return provincesCache;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        if (provincesCache) {
            return provincesCache;
        }
        throw error;
    }
}

// Hàm tìm province và district từ tên đã chuẩn hóa
async function findLocationInfo(cityName, districtName) {
    const provinces = await getProvinces();
    const normalizedCity = normalizeLocationName(cityName);
    const normalizedDistrict = normalizeLocationName(districtName);

    const province = provinces.find(p =>
        normalizeLocationName(p.name) === normalizedCity
    );

    if (!province) return null;

    const district = province.districts.find(d =>
        normalizeLocationName(d.name) === normalizedDistrict
    );

    return { province, district };
}

// Các vùng địa lý và phí cơ bản (đã bỏ khoảng trống trong tên)
const REGIONS = {
    NORTH: {
        provinces: ['hanoi', 'haiphong', 'quangninh', 'haiduong', 'hungyen', 'thaibinh', 'hanam', 'namdinh', 'ninhbinh', 'vinhphuc', 'bacninh', 'bacgiang'],
        baseFee: 22000
    },
    CENTRAL: {
        provinces: ['thanhhoa', 'nghean', 'hatinh', 'quangbinh', 'quangtri', 'thuathienhue', 'danang', 'quangnam', 'quangngai', 'binhdinh', 'phuyen', 'khanhhoa'],
        baseFee: 30000
    },
    SOUTH: {
        provinces: ['hochiminh', 'bariavungtau', 'binhduong', 'binhphuoc', 'dongnai', 'tayninh', 'angiang', 'baclieu', 'bentre', 'camau', 'cantho', 'dongthap', 'haugiang', 'kiengiang', 'longan', 'soctrang', 'tiengiang', 'travinh', 'vinhlong'],
        baseFee: 35000
    },
    HIGHLAND: {
        provinces: ['kontum', 'gialai', 'daklak', 'daknong', 'lamdong'],
        baseFee: 40000
    },
    REMOTE: {
        provinces: ['laichau', 'dienbien', 'sonla', 'hoabinh', 'laocai', 'yenbai', 'phutho', 'hagiang', 'tuyenquang', 'caobang', 'backan', 'thainguyen', 'langson'],
        baseFee: 45000
    }
};

/**
 * SIMULATED function to calculate delivery fee based on destination from HANOI.
 * Replace with actual API calls to a Vietnamese delivery provider (GHN, GHTK, ViettelPost etc.).
 *
 * @param {object} shippingAddress - The destination address object { city, state/province, ... }
 * @returns {Promise<number>} The SIMULATED delivery fee in VND.
 */
const getDeliveryFeeService = async (shippingAddress) => {
    try {
        // Tìm thông tin province và district
        const locationInfo = await findLocationInfo(shippingAddress.city, shippingAddress.state);
        if (!locationInfo) {
            console.warn(`Location not found for city: ${shippingAddress.city}, district: ${shippingAddress.state}`);
            return 45000; // Phí mặc định nếu không tìm thấy địa điểm
        }

        const { province } = locationInfo;
        const normalizedProvinceName = normalizeLocationName(province.name);

        // Xác định vùng và phí cơ bản
        let region = null;
        for (const [regionName, regionData] of Object.entries(REGIONS)) {
            if (regionData.provinces.includes(normalizedProvinceName)) {
                region = regionData;
                break;
            }
        }

        if (!region) {
            console.warn(`Region not found for province: ${province.name}`);
            return 45000; // Phí mặc định nếu không tìm thấy vùng
        }

        let fee = region.baseFee;

        // Điều chỉnh phí dựa trên các yếu tố khác
        // 1. Phụ phí cho địa điểm đặc biệt
        if (normalizedProvinceName === 'hanoi') {
            const innerDistricts = ['hoankiem', 'badinh', 'dongda', 'haibatrung', 'caugiay', 'thanhxuan', 'tayho'];
            const normalizedDistrict = normalizeLocationName(shippingAddress.state);
            if (innerDistricts.includes(normalizedDistrict)) {
                fee -= 5000; // Giảm phí cho khu vực nội thành Hà Nội
            }
        }

        // 2. Phụ phí cho đảo và vùng xa
        const islandProvinces = ['phuquoc', 'condao', 'hoangsa', 'truongsa'];
        if (islandProvinces.some(island => normalizedProvinceName.includes(island))) {
            fee += 50000; // Phụ phí cho đảo
        }

        // 3. Điều chỉnh theo mùa (có thể thêm logic theo mùa nếu cần)
        const currentMonth = new Date().getMonth() + 1;
        if ([1, 2, 12].includes(currentMonth)) { // Mùa Tết
            fee += 10000;
        }

        console.log(`Delivery fee calculated for ${province.name}: ${formatCurrencyVND(fee)}`);
        return fee;

    } catch (error) {
        console.error('Error calculating delivery fee:', error);
        return 45000; // Phí mặc định nếu có lỗi
    }
};

module.exports = { getDeliveryFeeService };