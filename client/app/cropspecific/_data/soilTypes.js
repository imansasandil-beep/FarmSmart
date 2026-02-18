// Sri Lanka Soil Types by Agro-Ecological Zone
// Sources:
//   - Natural Resources Management Center, DOA (https://doa.gov.lk)
//   - Land Use Policy Planning Dept. (https://luppd.gov.lk)
//   - Mapa et al., "Soils of the Wet Zone of Sri Lanka"

export const SOIL_TYPES = {
    wet: [
        {
            id: 'ryp',
            name: 'Red-Yellow Podzolic',
            sinhalaName: 'රතු-කහ පොඩ්සොලික්',
            description: 'The dominant soil type in the wet zone. Deep, well-drained, acidic soils formed under high rainfall. Rich in iron and aluminum oxides.',
            characteristics: ['Deep (>1.5m)', 'Acidic (pH 4.5-5.5)', 'Well-drained', 'Low natural fertility', 'Red to yellowish-brown color'],
            suitableCrops: ['tea', 'rubber', 'cinnamon', 'pepper', 'coconut', 'banana'],
            improvement: [
                'Apply dolomite at 2 t/ha every 3-4 years to correct acidity',
                'Add organic matter (compost, green manure) to improve fertility',
                'Mulch to maintain moisture and reduce erosion',
                'Contour planting on slopes to prevent soil erosion',
            ],
        },
        {
            id: 'bog',
            name: 'Bog and Half-Bog Soils',
            sinhalaName: 'වගුරු පස',
            description: 'Found in low-lying, poorly drained areas of the wet zone. High organic matter content. Used for paddy cultivation.',
            characteristics: ['Poor drainage', 'High organic matter', 'Dark color', 'Acidic', 'Waterlogged conditions'],
            suitableCrops: ['rice'],
            improvement: [
                'Maintain proper water management for paddy',
                'Add lime to correct acidity before field crop cultivation',
                'Install drainage for vegetable cultivation',
            ],
        },
        {
            id: 'lat_wet',
            name: 'Laterite',
            sinhalaName: 'ලැටරයිට්',
            description: 'Hard laterite layers found in parts of the low-country wet zone. Can be limiting for deep-rooted crops.',
            characteristics: ['Hard pan present', 'Iron-rich', 'Poor water retention', 'Acidic', 'Low fertility'],
            suitableCrops: ['coconut', 'cinnamon', 'cashew'],
            improvement: [
                'Break hard pan by deep ploughing',
                'Add organic matter generously',
                'Use larger planting pits for tree crops',
            ],
        },
    ],
    dry: [
        {
            id: 'rbe',
            name: 'Reddish Brown Earth',
            sinhalaName: 'රතු-දුඹුරු පස',
            description: 'The most widespread soil in the dry zone. Relatively fertile, neutral to slightly alkaline pH. Suitable for a wide range of crops under irrigation.',
            characteristics: ['Moderately deep', 'pH 6.0-7.5', 'Good fertility', 'Reddish-brown color', 'Medium texture'],
            suitableCrops: ['rice', 'chili', 'onion', 'maize', 'groundnut', 'mungbean', 'cowpea', 'cashew'],
            improvement: [
                'Maintain organic matter through compost and crop residue incorporation',
                'Avoid excessive tillage to prevent erosion',
                'Irrigate carefully to prevent salinization',
                'Crop rotation with legumes to maintain fertility',
            ],
        },
        {
            id: 'lhg',
            name: 'Low Humic Gley',
            sinhalaName: 'අඩු හියුමික් ග්ලේ',
            description: 'Found in valley bottoms and low-lying areas of the dry zone. Imperfectly drained. Primary soils for irrigated paddy cultivation.',
            characteristics: ['Poor to imperfect drainage', 'Dark gray color', 'Heavy texture', 'High water retention', 'Slightly acidic to neutral pH'],
            suitableCrops: ['rice'],
            improvement: [
                'Ideal for paddy - maintain water management',
                'Add organic matter between seasons',
                'Green manuring with Sesbania before rice planting',
            ],
        },
        {
            id: 'alluvial_dry',
            name: 'Alluvial Soils',
            sinhalaName: 'ඇළුවිය පස',
            description: 'Found along river banks and flood plains in the dry zone. Very fertile, deep, and well-suited for intensive cultivation.',
            characteristics: ['Deep and fertile', 'Variable texture', 'Good water holding capacity', 'Neutral pH', 'Recent deposits'],
            suitableCrops: ['rice', 'vegetables', 'banana', 'chili', 'onion'],
            improvement: [
                'Protect from flooding with bunds',
                'These soils are naturally fertile; maintain with crop rotation',
                'Add organic matter to maintain structure',
            ],
        },
        {
            id: 'sandy_coastal',
            name: 'Sandy Regosols',
            sinhalaName: 'වැලි රෙගොසොල්',
            description: 'Coastal sandy soils found in the northern and eastern dry zone. Poor water and nutrient retention. Common in Jaffna peninsula.',
            characteristics: ['Very sandy', 'Poor water retention', 'Low fertility', 'Alkaline to neutral pH', 'Well-drained'],
            suitableCrops: ['onion', 'groundnut', 'coconut'],
            improvement: [
                'Add heavy doses of organic matter (20+ t/ha compost)',
                'Mulch continuously to conserve moisture',
                'Frequent but light irrigation',
                'Apply fertilizer in split doses to reduce leaching',
            ],
        },
    ],
    intermediate: [
        {
            id: 'rbe_int',
            name: 'Reddish Brown Lateritic',
            sinhalaName: 'රතු-දුඹුරු ලැටරිටික්',
            description: 'Transitional soils between wet zone Red-Yellow Podzolic and dry zone Reddish Brown Earth. Found in Kurunegala, Matale, and parts of Badulla.',
            characteristics: ['Moderately deep', 'pH 5.5-6.5', 'Moderate fertility', 'Well-drained', 'Laterite gravel possible'],
            suitableCrops: ['coconut', 'pepper', 'maize', 'vegetables', 'banana', 'cashew', 'cowpea'],
            improvement: [
                'Apply dolomite at 1 t/ha if acidic',
                'Regular addition of organic matter',
                'Contour farming on slopes',
                'Cover cropping during fallow periods',
            ],
        },
        {
            id: 'immature_brown',
            name: 'Immature Brown Loams',
            sinhalaName: 'නොමේරූ දුඹුරු ලෝම්',
            description: 'Found on hilly terrain in the intermediate zone, especially up-country areas. Suitable for mixed cropping and home gardens.',
            characteristics: ['Variable depth', 'Brown color', 'Loamy texture', 'Moderate fertility', 'Prone to erosion on slopes'],
            suitableCrops: ['vegetables', 'pepper', 'banana', 'tea'],
            improvement: [
                'Essential: soil conservation measures on slopes',
                'Terracing for vegetable cultivation',
                'Mulching and cover crops',
                'Organic matter addition is critical',
            ],
        },
    ],
};

// Helper: get soil types for a zone
export const getSoilsByZone = (zoneId) => {
    return SOIL_TYPES[zoneId] || [];
};

// Helper: get recommended soil type for a crop in a zone
export const getSoilsForCrop = (cropId, zoneId) => {
    const zoneSoils = SOIL_TYPES[zoneId] || [];
    return zoneSoils.filter(soil => soil.suitableCrops.includes(cropId));
};

// Helper: get all soil improvement tips for a zone
export const getSoilImprovementTips = (zoneId) => {
    const zoneSoils = SOIL_TYPES[zoneId] || [];
    return zoneSoils.flatMap(soil =>
        soil.improvement.map(tip => ({ soil: soil.name, tip }))
    );
};
