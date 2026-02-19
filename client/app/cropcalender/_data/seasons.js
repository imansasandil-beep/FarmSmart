// Sri Lanka Cropping Seasons & Monthly Agricultural Advice
// Sources:
//   - Dept. of Census & Statistics (http://www.statistics.gov.lk/Agriculture)
//   - FAO - GIEWS Country Brief Sri Lanka
//   - Ministry of Agriculture (https://agrimin.gov.lk)

export const SEASONS = {
    yala: {
        id: 'yala',
        name: 'Yala Season',
        sinhalaName: 'α╢║α╢╜ α╢Üα╢▒α╖èα╢▒α╢║',
        emoji: 'ΓÿÇ∩╕Å',
        monsoon: 'Southwest Monsoon',
        startMonth: 4,  // April
        endMonth: 8,    // August
        color: '#f39c12',
        description: 'Minor cultivation season driven by the Southwest Monsoon. Shorter but intense rainfall, mainly in the south-west.',
    },
    maha: {
        id: 'maha',
        name: 'Maha Season',
        sinhalaName: 'α╢╕α╖ä α╢Üα╢▒α╖èα╢▒α╢║',
        emoji: '≡ƒîº∩╕Å',
        monsoon: 'Northeast Monsoon',
        startMonth: 10, // October
        endMonth: 2,    // February (next year)
        color: '#2980b9',
        description: 'Major cultivation season driven by the Northeast Monsoon. Heavier and more continuous rainfall across the island.',
    },
};

