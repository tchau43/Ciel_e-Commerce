const axios = require('axios');
const { formatCurrencyVND } = require('../utils/helper');

function normalizeLocationName(name) {
    if (typeof name !== 'string') return '';
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "")
        .replace(/^(thanhpho|tp\.?|tinh|quan|q\.?|huyen)\s*/i, '')
        .trim();
}

let provincesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

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

const getDeliveryFeeService = async (shippingAddress) => {
    try {
        const locationInfo = await findLocationInfo(shippingAddress.city, shippingAddress.state);
        if (!locationInfo) {
            console.warn(`Location not found for city: ${shippingAddress.city}, district: ${shippingAddress.state}`);
            return 45000;
        }

        const { province } = locationInfo;
        const normalizedProvinceName = normalizeLocationName(province.name);

        let region = null;
        for (const [regionName, regionData] of Object.entries(REGIONS)) {
            if (regionData.provinces.includes(normalizedProvinceName)) {
                region = regionData;
                break;
            }
        }

        if (!region) {
            console.warn(`Region not found for province: ${province.name}`);
            return 45000;
        }

        let fee = region.baseFee;

        if (normalizedProvinceName === 'hanoi') {
            const innerDistricts = ['hoankiem', 'badinh', 'dongda', 'haibatrung', 'caugiay', 'thanhxuan', 'tayho'];
            const normalizedDistrict = normalizeLocationName(shippingAddress.state);
            if (innerDistricts.includes(normalizedDistrict)) {
                fee -= 5000;
            }
        }

        const islandProvinces = ['phuquoc', 'condao', 'hoangsa', 'truongsa'];
        if (islandProvinces.some(island => normalizedProvinceName.includes(island))) {
            fee += 50000;
        }

        const currentMonth = new Date().getMonth() + 1;
        if ([1, 2, 12].includes(currentMonth)) {
            fee += 10000;
        }

        console.log(`Delivery fee calculated for ${province.name}: ${formatCurrencyVND(fee)}`);
        return fee;

    } catch (error) {
        console.error('Error calculating delivery fee:', error);
        return 45000;
    }
};

module.exports = { getDeliveryFeeService };