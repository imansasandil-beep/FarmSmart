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

// Monthly tips per zone
// Each month has general advice + zone-specific tips
export const MONTHLY_TIPS = [
    {
        month: 1, // January
        name: 'January',
        sinhalaName: 'α╢»α╖öα╢╗α╖öα╢¡α╖ö / α╢▒α╖Çα╢╕α╖è',
        general: 'Maha season crops are in growth stage. Monitor for pests and diseases.',
        tips: {
            wet: 'Continue harvesting tea. Monitor paddy fields for water levels. Apply fertilizer for rubber plantations.',
            dry: 'Rice fields are in growing stage. Apply top dressing fertilizer. Watch for brown planthopper in paddy.',
            intermediate: 'Harvest vegetables from Maha planting. Continue monitoring chili crops for pest damage.',
        },
    },
    {
        month: 2, // February
        name: 'February',
        sinhalaName: 'α╢▒α╖Çα╢╕α╖è / α╢╕α╖Éα╢»α╖Æα╢▒α╖è',
        general: 'Maha harvest begins. Start planning for Yala season land preparation.',
        tips: {
            wet: 'Harvest Maha paddy. Begin cinnamon peeling season. Prepare nurseries for Yala planting.',
            dry: 'Harvest Maha rice crops. Start collecting and storing seeds for Yala. Begin land preparation if soil moisture allows.',
            intermediate: 'Harvest maize and pulses. Plan Yala crop rotation. Begin preparing vegetable beds.',
        },
    },
    {
        month: 3, // March
        name: 'March',
        sinhalaName: 'α╢╕α╖Éα╢»α╖Æα╢▒α╖è / α╢╢α╢Üα╖è',
        general: 'Inter-season period. Focus on land preparation for Yala season.',
        tips: {
            wet: 'Prepare paddy fields for Yala sowing. Prune and maintain tea bushes. Plant cover crops in rubber plantations.',
            dry: 'Critical land preparation period. Repair irrigation channels. Apply organic matter to fields.',
            intermediate: 'Begin planting short-season vegetables (mung bean, cowpea). Prepare fields for Yala maize.',
        },
    },
    {
        month: 4, // April
        name: 'April',
        sinhalaName: 'α╢╢α╢Üα╖è / α╖Çα╖Öα╖âα╢Üα╖è',
        general: 'Yala season begins! Southwest monsoon rains start. Begin sowing.',
        tips: {
            wet: 'Start Yala paddy sowing. Plant pepper vines. Apply first fertilizer dose to tea.',
            dry: 'Begin planting rice in irrigated areas. Sow groundnut and maize. Prepare chena lands.',
            intermediate: 'Plant maize, cowpea, and vegetables. Good time for coconut planting with early rains.',
        },
    },
    {
        month: 5, // May
        name: 'May',
        sinhalaName: 'α╖Çα╖Öα╖âα╢Üα╖è / α╢┤α╖£α╖âα╖£α╢▒α╖è',
        general: 'Peak of Southwest monsoon. Heavy rains in the wet zone.',
        tips: {
            wet: 'Ensure paddy field drainage during heavy rains. Good month for planting cinnamon and rubber seedlings.',
            dry: 'Complete Yala planting. Apply fertilizer to paddy. Start onion cultivation in Jaffna.',
            intermediate: 'Monitor crops for fungal diseases due to increasing humidity. Apply preventive sprays.',
        },
    },
    {
        month: 6, // June
        name: 'June',
        sinhalaName: 'α╢┤α╖£α╖âα╖£α╢▒α╖è / α╢çα╖âα╖à',
        general: 'Yala crops are in active growth. Weed management is critical.',
        tips: {
            wet: 'Weed control in paddy and tea plantations. Monitor rubber for leaf disease.',
            dry: 'Apply second fertilizer dose to paddy. Irrigate fields during dry spells. Weed management in maize.',
            intermediate: 'Harvest early vegetables. Maintain crop cover to prevent soil erosion from rains.',
        },
    },
    {
