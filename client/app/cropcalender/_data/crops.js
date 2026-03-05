// Sri Lanka Crop Data by Agro-Ecological Zone
// Sources:
//   - Department of Agriculture, Sri Lanka (https://doa.gov.lk)
//   - FAO Sri Lanka (https://www.fao.org/faostat/en/#country/38)
//   - Dept. of Census & Statistics (http://www.statistics.gov.lk/Agriculture)

export const CROPS = [
    // === WET ZONE CROPS ===
    {
        id: 'rice_wet',
        name: 'Rice (Paddy)',
        sinhalaName: 'වී / හාල්',
        emoji: '🌾',
        zones: ['wet', 'dry', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [4, 10],  // Apr (Yala), Oct (Maha)
        harvestMonths: [8, 2],     // Aug (Yala), Feb (Maha)
        growthDays: 90,
        tips: 'Main staple crop. Requires standing water during growth. Both Yala and Maha seasons suitable in irrigated areas.',
    },
    {
        id: 'tea',
        name: 'Tea',
        sinhalaName: 'තේ',
        emoji: '🍵',
        zones: ['wet'],
        seasons: ['yala', 'maha'],
        plantingMonths: [5, 10],
        harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Year-round
        growthDays: 365,
        tips: 'Perennial crop. Thrives at high elevations (600-2500m) in the central highlands. Requires consistent rainfall.',
    },
    {
        id: 'rubber',
        name: 'Rubber',
        sinhalaName: 'රබර්',
        emoji: '🌳',
        zones: ['wet'],
        seasons: ['yala', 'maha'],
        plantingMonths: [5, 6],
        harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        growthDays: 2190, // ~6 years to mature
        tips: 'Perennial tree crop suited to low-country wet zone. Needs >2000mm rainfall. Tapping begins at 6 years.',
    },
    {
        id: 'cinnamon',
        name: 'Cinnamon',
        sinhalaName: 'කුරුඳු',
        emoji: '🪵',
        zones: ['wet'],
        seasons: ['yala', 'maha'],
        plantingMonths: [5, 10],
        harvestMonths: [5, 6, 10, 11],
        growthDays: 730, // ~2 years first harvest
        tips: 'Sri Lanka produces the finest true cinnamon (Ceylon Cinnamon). Grows best in sandy loam soils in the southern wet zone.',
    },
    {
        id: 'pepper',
        name: 'Black Pepper',
        sinhalaName: 'ගම්මිරිස්',
        emoji: '🫑',
        zones: ['wet', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [5, 10],
        harvestMonths: [1, 2, 12],
        growthDays: 1095, // 3 years to fruit
        tips: 'Climbing vine crop. Needs shade trees for support. Thrives in mid-country wet and intermediate zones.',
    },
    {
        id: 'coconut',
        name: 'Coconut',
        sinhalaName: 'පොල්',
        emoji: '🥥',
        zones: ['wet', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [5, 10],
        harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        growthDays: 1825, // 5 years to fruit
        tips: 'Major plantation crop in the "Coconut Triangle" (Kurunegala, Puttalam, Gampaha). Produces year-round once mature.',
    },

    // === DRY ZONE CROPS ===
    {
        id: 'chili',
        name: 'Chili',
        sinhalaName: 'මිරිස්',
        emoji: '🌶️',
        zones: ['dry', 'intermediate'],
        seasons: ['maha'],
        plantingMonths: [9, 10],
        harvestMonths: [1, 2, 3],
        growthDays: 120,
        tips: 'Major cash crop in the dry zone. Plant at the start of Maha season. Needs well-drained soil.',
    },
    {
        id: 'onion',
        name: 'Big Onion',
        sinhalaName: 'ලොකු ළූණු',
        emoji: '🧅',
        zones: ['dry'],
        seasons: ['yala'],
        plantingMonths: [4, 5],
        harvestMonths: [7, 8],
        growthDays: 100,
        tips: 'Cultivated mainly in Jaffna and Matale districts. Needs dry conditions for bulb development.',
    },
    {
        id: 'maize',
        name: 'Maize (Corn)',
        sinhalaName: 'බඩ ඉරිඟු',
        emoji: '🌽',
        zones: ['dry', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [4, 10],
        harvestMonths: [7, 1],
        growthDays: 90,
        tips: 'Second most important cereal after rice. Grown as a rainfed crop in the dry and intermediate zones.',
    },
    {
        id: 'groundnut',
        name: 'Groundnut',
        sinhalaName: 'රටකජු',
        emoji: '🥜',
        zones: ['dry', 'intermediate'],
        seasons: ['yala'],
        plantingMonths: [4, 5],
        harvestMonths: [7, 8],
        growthDays: 105,
        tips: 'Important oilseed crop. Grows well in sandy soils of the dry zone. Plant at the beginning of Yala.',
    },
    {
        id: 'mungbean',
        name: 'Mung Bean',
        sinhalaName: 'මුං',
        emoji: '🫘',
        zones: ['dry'],
        seasons: ['yala', 'maha'],
        plantingMonths: [3, 4, 9],
        harvestMonths: [5, 6, 11],
        growthDays: 65,
        tips: 'Short-duration pulse crop. Often cultivated as a rotation crop between rice seasons.',
    },
    {
        id: 'cowpea',
        name: 'Cowpea',
        sinhalaName: 'කව්පි',
        emoji: '🌱',
        zones: ['dry', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [4, 10],
        harvestMonths: [6, 12],
        growthDays: 75,
        tips: 'Drought-tolerant legume. Good for soil nitrogen fixing. Popular in dry zone home gardens.',
    },

    // === INTERMEDIATE ZONE CROPS ===
    {
        id: 'vegetables',
        name: 'Vegetables (Mixed)',
        sinhalaName: 'එළවළු',
        emoji: '🥬',
        zones: ['intermediate', 'wet'],
        seasons: ['yala', 'maha'],
        plantingMonths: [3, 4, 9, 10],
        harvestMonths: [5, 6, 7, 11, 12, 1],
        growthDays: 60,
        tips: 'Beans, tomato, carrot, cabbage, leeks etc. Mid/up-country intermediate zone is ideal for vegetable cultivation.',
    },
    {
        id: 'cashew',
        name: 'Cashew',
        sinhalaName: 'කජු',
        emoji: '🌰',
        zones: ['intermediate', 'dry'],
        seasons: ['yala'],
        plantingMonths: [5, 6],
        harvestMonths: [2, 3, 4],
        growthDays: 1095, // 3 years to fruit
        tips: 'Grows well in dry and intermediate zones. Needs dry weather during flowering for good nut set.',
    },
    {
        id: 'banana',
        name: 'Banana',
        sinhalaName: 'කෙසෙල්',
        emoji: '🍌',
        zones: ['wet', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [4, 5, 10],
        harvestMonths: [1, 2, 3, 7, 8, 9],
        growthDays: 270,
        tips: 'Widely cultivated in home gardens. Multiple varieties grown across wet and intermediate zones.',
    },
];

// Helper: get crops for a specific zone
export const getCropsByZone = (zoneId) => {
    return CROPS.filter(crop => crop.zones.includes(zoneId));
};

// Helper: get crops suitable for current season
export const getCropsBySeason = (seasonId) => {
    return CROPS.filter(crop => crop.seasons.includes(seasonId));
};

// Helper: get crops for a zone + season combo
export const getCropsByZoneAndSeason = (zoneId, seasonId) => {
    return CROPS.filter(
        crop => crop.zones.includes(zoneId) && crop.seasons.includes(seasonId)
    );
};
