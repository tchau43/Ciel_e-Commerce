// services/deliveryService.js
// SIMULATED delivery fee calculation based on destination from Hanoi.
// IMPORTANT: Replace with actual shipping provider API calls for production!

const axios = require('axios'); // Keep for potential future API calls
const { formatCurrencyVND } = require('../utils/helper');

// --- Helper function to normalize city/province names (basic example) ---
// You might need a more comprehensive list or library for robust normalization
function normalizeLocationName(name) {
    if (typeof name !== 'string') return '';
    return name
        .toLowerCase()
        // Remove accents (Vietnamese diacritics)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        // Remove common words like 'thanh pho', 'tinh', 'quan', 'huyen' etc.
        .replace(/^(thanh pho|tp\.?|tinh|quan|q\.?|huyen)\s*/, '')
        .trim();
}

/**
 * SIMULATED function to calculate delivery fee based on destination from HANOI.
 * Replace with actual API calls to a Vietnamese delivery provider (GHN, GHTK, ViettelPost etc.).
 *
 * @param {object} shippingAddress - The destination address object { city, state/province, ... }
 * @returns {Promise<number>} The SIMULATED delivery fee in VND.
 */
const getDeliveryFeeService = async (shippingAddress) => {
    const originCity = 'hanoi'; // Your shop's origin
    const destCity = normalizeLocationName(shippingAddress.city);
    // 'state' often represents District (Quận/Huyện) or Province (Tỉnh) in VN addresses
    const destStateOrDistrict = normalizeLocationName(shippingAddress.state);

    console.log(`Calculating SIMULATED delivery fee from ${originCity} to city:'${destCity}', state/district:'${destStateOrDistrict}'`);

    // --- !!! THIS IS SIMULATED LOGIC - REPLACE WITH REAL API !!! ---

    let fee = 45000; // Default fee for distant provinces/cities

    // Tier 1: Inner Hanoi Districts (Example List - NEEDS VERIFICATION & COMPLETENESS)
    const hanoiInnerDistricts = ['hoan kiem', 'ba dinh', 'dong da', 'hai ba trung', 'cau giay', 'thanh xuan', 'tay ho', 'hoang mai', 'long bien', 'ha dong']; // Add more as needed
    if (destCity === 'hanoi' && hanoiInnerDistricts.includes(destStateOrDistrict)) {
        fee = 20000; // Lowest fee for inner city
    }
    // Tier 2: Outer Hanoi Districts (Example List)
    else if (destCity === 'hanoi') {
        fee = 28000; // Slightly higher for outer Hanoi
    }
    // Tier 3: Ho Chi Minh City
    else if (destCity.includes('ho chi minh') || destCity.includes('hcm')) {
        fee = 35000;
    }
    // Tier 4: Da Nang (Major Central Hub)
    else if (destCity.includes('da nang')) {
        fee = 32000;
    }
    // Tier 5: Other Major Provincial Cities (Example List - Add more)
    else if (['hai phong', 'can tho', 'bien hoa', 'nha trang', 'hue', 'vung tau', 'quy nhon'].includes(destCity)) {
        fee = 40000;
    }
    // Tier 6: Default for other provinces/remote areas (already set as default)
    // fee = 45000;

    // --- End Simulated Logic ---

    // --- Example of where a REAL API call would go ---
    /*
    try {
        const API_ENDPOINT = 'URL_OF_DELIVERY_PROVIDER_API'; // e.g., GHN, GHTK API endpoint
        const API_KEY = process.env.DELIVERY_API_KEY; // Store keys securely

        const requestPayload = {
            origin: { city: "Hà Nội", district: "Ba Đình", ... }, // Your fixed origin details
            destination: {
                city: shippingAddress.city,
                district: shippingAddress.state, // Map state to district? Needs clear address structure
                address: shippingAddress.street,
                // ward_code: ... // May need ward code for accuracy
            },
            weight_grams: 500, // Example weight - calculate based on items
            // dimensions, service_type_id, etc. might be needed
        };

        const response = await axios.post(API_ENDPOINT, requestPayload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`, // Or specific header like 'Token'
                'Content-Type': 'application/json'
            }
        });

        // Parse the fee from the API response structure
        // fee = response.data?.data?.total_fee || 0; // Example based on GHN-like structure

    } catch (apiError) {
        console.error("Error calling Delivery API:", apiError.response?.data || apiError.message);
        // Fallback strategy: Return a default fee, zero, or throw error
        // fee = 50000; // Fallback fee
        throw new Error("Could not calculate delivery fee via external API.");
    }
    */
    // --- End Real API call example ---


    console.log(`SIMULATED delivery fee calculated: ${formatCurrencyVND(fee)}`);
    return fee; // Return the calculated (simulated) fee
};

module.exports = { getDeliveryFeeService };