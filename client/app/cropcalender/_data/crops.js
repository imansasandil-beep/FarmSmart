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
        sinhalaName: 'α╖Çα╖ô / α╖äα╖Åα╢╜α╖è',
        emoji: '≡ƒî╛',
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
        sinhalaName: 'α╢¡α╖Ü',
        emoji: '≡ƒì╡',
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
        sinhalaName: 'α╢╗α╢╢α╢╗α╖è',
        emoji: '≡ƒî│',
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
        sinhalaName: 'α╢Üα╖öα╢╗α╖öα╢│α╖ö',
        emoji: '≡ƒ¬╡',
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
        sinhalaName: 'α╢£α╢╕α╖èα╢╕α╖Æα╢╗α╖Æα╖âα╖è',
        emoji: '≡ƒ½æ',
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
        sinhalaName: 'α╢┤α╖£α╢╜α╖è',
        emoji: '≡ƒÑÑ',
        zones: ['wet', 'intermediate'],
        seasons: ['yala', 'maha'],
        plantingMonths: [5, 10],
        harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        growthDays: 1825, // 5 years to fruit
        tips: 'Major plantation crop in the "Coconut Triangle" (Kurunegala, Puttalam, Gampaha). Produces year-round once mature.',
    },

