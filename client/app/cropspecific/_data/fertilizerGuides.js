// Sri Lanka Crop Fertilizer Guides by Zone
// Sources:
//   - Department of Agriculture, Sri Lanka (https://doa.gov.lk)
//   - Rice Research & Development Institute (RRDI)
//   - Coconut Research Institute (https://cri.gov.lk)
//   - Tea Research Institute (https://tri.lk)

export const FERTILIZER_GUIDES = {
    rice: {
        title: 'Rice (Paddy) Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost/FYM', quantity: '5-10 t/ha', timing: 'Basal - at land preparation', notes: 'Incorporate well during last ploughing' },
            { name: 'Green Manure (Sesbania)', quantity: 'Grow and incorporate', timing: '2-3 weeks before planting', notes: 'Fix 60-80 kg N/ha. Best for dry zone' },
            { name: 'Straw Incorporation', quantity: 'Previous season crop residue', timing: 'After harvest', notes: 'Adds K and organic matter. Decompose for 3-4 weeks before land prep' },
        ],
        chemical: {
            wet: [
                { stage: 'Basal', timing: 'At planting', urea: '50 kg', tsp: '60 kg', mop: '25 kg', notes: 'Mix with soil before transplanting' },
                { stage: '1st Top Dressing', timing: '2 weeks after planting', urea: '75 kg', tsp: '-', mop: '-', notes: 'Apply when 2-3cm standing water' },
                { stage: '2nd Top Dressing', timing: '5 weeks after planting', urea: '75 kg', tsp: '-', mop: '25 kg', notes: 'Coincides with maximum tillering' },
                { stage: '3rd Top Dressing', timing: 'Panicle initiation', urea: '50 kg', tsp: '-', mop: '25 kg', notes: 'Important for grain development' },
            ],
            dry: [
                { stage: 'Basal', timing: 'At planting', urea: '50 kg', tsp: '55 kg', mop: '30 kg', notes: 'Mix into soil during last puddling' },
                { stage: '1st Top Dressing', timing: '2 weeks after planting', urea: '100 kg', tsp: '-', mop: '-', notes: 'Ensure standing water before application' },
                { stage: '2nd Top Dressing', timing: '5 weeks after planting', urea: '75 kg', tsp: '-', mop: '30 kg', notes: 'At maximum tillering stage' },
                { stage: '3rd Top Dressing', timing: 'Panicle initiation', urea: '50 kg', tsp: '-', mop: '30 kg', notes: 'Boosts grain filling' },
            ],
            intermediate: [
                { stage: 'Basal', timing: 'At planting', urea: '50 kg', tsp: '55 kg', mop: '25 kg', notes: 'Incorporate before transplanting' },
                { stage: '1st Top Dressing', timing: '2 weeks after planting', urea: '75 kg', tsp: '-', mop: '-', notes: 'When field has standing water' },
                { stage: '2nd Top Dressing', timing: '5 weeks after planting', urea: '75 kg', tsp: '-', mop: '25 kg', notes: 'Maximum tillering stage' },
            ],
        },
    },
    tea: {
        title: 'Tea Fertilizer Guide',
        unit: 'per hectare per year',
        organic: [
            { name: 'Compost', quantity: '10 t/ha/year', timing: 'During rainy season', notes: 'Apply around drip circle of bush' },
            { name: 'Mulch (Guatemala grass)', quantity: '6-8 t/ha', timing: 'Twice a year', notes: 'Conserves moisture and adds organic matter' },
        ],
        chemical: {
            wet: [
                { stage: '1st Application', timing: 'March-April', urea: '250 kg', tsp: '90 kg', mop: '110 kg', notes: 'After pruning or start of rains' },
                { stage: '2nd Application', timing: 'July-August', urea: '250 kg', tsp: '-', mop: '110 kg', notes: 'Mid-year application' },
                { stage: '3rd Application', timing: 'October-November', urea: '200 kg', tsp: '-', mop: '80 kg', notes: 'Before NE monsoon rains' },
            ],
        },
    },
    coconut: {
        title: 'Coconut Fertilizer Guide (CRI Adult Palm Mixture)',
        unit: 'per palm per year',
        organic: [
            { name: 'Compost/Cow dung', quantity: '25-50 kg/palm', timing: 'Once a year with rains', notes: 'Apply in a ring 1.5m from trunk' },
            { name: 'Coconut husk burial', quantity: '25-30 husks/palm', timing: 'Once in 3-4 years', notes: 'Bury in trenches between palms. Improves water retention.' },
            { name: 'Gliricidia leaves', quantity: '25 kg/palm', timing: '3-4 times/year', notes: 'Excellent green manure, fixes nitrogen' },
        ],
        chemical: {
            wet: [
                { stage: '1st Application', timing: 'April-May (SW Monsoon)', urea: '500g', tsp: '750g', mop: '1000g', notes: 'Apply in circle 1.5m from trunk, fork in lightly' },
                { stage: '2nd Application', timing: 'Oct-Nov (NE Monsoon)', urea: '500g', tsp: '750g', mop: '1000g', notes: 'Same method. Total: 1kg urea, 1.5kg TSP, 2kg MOP per palm/year' },
            ],
            dry: [
                { stage: '1st Application', timing: 'Oct-Nov (with rains)', urea: '500g', tsp: '750g', mop: '1000g', notes: 'Apply only when soil is moist' },
                { stage: '2nd Application', timing: 'April-May (if rains)', urea: '500g', tsp: '750g', mop: '1000g', notes: 'Skip if prolonged drought' },
            ],
            intermediate: [
                { stage: '1st Application', timing: 'April-May', urea: '500g', tsp: '750g', mop: '1000g', notes: 'With onset of rains' },
                { stage: '2nd Application', timing: 'Oct-Nov', urea: '500g', tsp: '750g', mop: '1000g', notes: 'With NE monsoon rains' },
            ],
        },
    },
    chili: {
        title: 'Chili Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost/FYM', quantity: '10-15 t/ha', timing: 'Basal - at bed preparation', notes: 'Well-decomposed. Mix into top 15cm of soil.' },
            { name: 'Gliricidia leaves', quantity: '10-15 kg/vine × 4 times', timing: 'Every 6-8 weeks', notes: 'Mulch around plants, reduces chemical fertilizer need by 30%' },
        ],
        chemical: {
            dry: [
                { stage: 'Basal', timing: 'At transplanting', urea: '100 kg', tsp: '215 kg', mop: '65 kg', notes: 'Mix into beds before transplanting' },
                { stage: '1st Top Dressing', timing: '3-4 weeks after transplanting', urea: '100 kg', tsp: '-', mop: '65 kg', notes: 'Apply after weeding, irrigate after' },
                { stage: '2nd Top Dressing', timing: '6-8 weeks after transplanting', urea: '100 kg', tsp: '-', mop: '65 kg', notes: 'During flowering/early fruiting' },
            ],
            intermediate: [
                { stage: 'Basal', timing: 'At transplanting', urea: '90 kg', tsp: '200 kg', mop: '60 kg', notes: 'Mix into beds before transplanting' },
                { stage: '1st Top Dressing', timing: '3-4 weeks after transplanting', urea: '90 kg', tsp: '-', mop: '60 kg', notes: 'After weeding' },
                { stage: '2nd Top Dressing', timing: '6-8 weeks after transplanting', urea: '90 kg', tsp: '-', mop: '60 kg', notes: 'During flowering stage' },
            ],
        },
    },
    maize: {
        title: 'Maize Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost/FYM', quantity: '5 t/ha', timing: 'Basal', notes: 'Incorporate during land preparation' },
        ],
        chemical: {
            dry: [
                { stage: 'Basal', timing: 'At sowing', urea: '55 kg', tsp: '100 kg', mop: '50 kg', notes: 'Band-place 5cm away from seed row' },
                { stage: '1st Top Dressing', timing: '3 weeks after emergence', urea: '110 kg', tsp: '-', mop: '-', notes: 'Apply alongside rows, earth up' },
                { stage: '2nd Top Dressing', timing: '6 weeks after emergence', urea: '110 kg', tsp: '-', mop: '50 kg', notes: 'Before tasseling stage' },
            ],
            intermediate: [
                { stage: 'Basal', timing: 'At sowing', urea: '55 kg', tsp: '100 kg', mop: '50 kg', notes: 'Place in furrows beside seed' },
                { stage: '1st Top Dressing', timing: '3 weeks', urea: '100 kg', tsp: '-', mop: '-', notes: 'Side dress along rows' },
                { stage: '2nd Top Dressing', timing: '6 weeks', urea: '100 kg', tsp: '-', mop: '50 kg', notes: 'Before tasseling' },
            ],
        },
    },
    cinnamon: {
        title: 'Cinnamon Fertilizer Guide',
        unit: 'per hectare per year',
        organic: [
            { name: 'Compost/Cow Dung', quantity: '5-10 kg/plant', timing: 'Twice a year (May, Oct)', notes: 'Apply around base of plant' },
            { name: 'Mulch', quantity: 'Thick layer around base', timing: 'Before dry season', notes: 'Use cinnamon leaf litter and other organic mulch' },
        ],
        chemical: {
            wet: [
                { stage: 'Young plants (1-3 years)', timing: 'Twice a year', urea: '60g/plant', tsp: '70g/plant', mop: '45g/plant', notes: 'Apply in a ring 15cm from stem' },
                { stage: 'Mature plants (3+ years)', timing: 'Twice a year', urea: '120g/plant', tsp: '140g/plant', mop: '90g/plant', notes: 'Apply after each harvest' },
            ],
        },
    },
    pepper: {
        title: 'Black Pepper Fertilizer Guide',
        unit: 'per vine per year',
        organic: [
            { name: 'Compost/Cow Dung', quantity: '10 kg/vine', timing: 'Annually, start of rains', notes: 'Apply in basin around vine base' },
        ],
        chemical: {
            wet: [
                { stage: '1st Application', timing: 'May-June', urea: '100g', tsp: '170g', mop: '200g', notes: 'After first rains, mix into soil' },
                { stage: '2nd Application', timing: 'October-November', urea: '100g', tsp: '-', mop: '100g', notes: 'With NE monsoon onset' },
            ],
            intermediate: [
                { stage: '1st Application', timing: 'May-June', urea: '100g', tsp: '170g', mop: '200g', notes: 'With SW monsoon rains' },
                { stage: '2nd Application', timing: 'October', urea: '100g', tsp: '-', mop: '100g', notes: 'With NE monsoon' },
            ],
        },
    },
    rubber: {
        title: 'Rubber Fertilizer Guide',
        unit: 'per tree per year',
        organic: [
            { name: 'Cover crops (Pueraria)', quantity: 'Maintain between rows', timing: 'Continuous', notes: 'Fixes nitrogen naturally. Do not remove.' },
        ],
        chemical: {
            wet: [
                { stage: 'Young trees (1-5 years)', timing: 'Twice yearly (May, Oct)', urea: '150g', tsp: '90g', mop: '60g', notes: 'Apply in circle 60cm from trunk' },
                { stage: 'Mature trees (tapping)', timing: 'Twice yearly', urea: '300g', tsp: '180g', mop: '120g', notes: 'Apply after rain, along drip line' },
            ],
        },
    },
    onion: {
        title: 'Big Onion Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost', quantity: '10-15 t/ha', timing: 'Basal', notes: 'Well-decomposed, applied 2 weeks before planting' },
        ],
        chemical: {
            dry: [
                { stage: 'Basal', timing: 'At transplanting', urea: '100 kg', tsp: '150 kg', mop: '75 kg', notes: 'Mix into beds' },
                { stage: '1st Top Dressing', timing: '2 weeks after transplanting', urea: '75 kg', tsp: '-', mop: '-', notes: 'Side dress along rows' },
                { stage: '2nd Top Dressing', timing: '4 weeks after transplanting', urea: '75 kg', tsp: '-', mop: '75 kg', notes: 'Last nitrogen application. K for bulb quality.' },
            ],
        },
    },
    groundnut: {
        title: 'Groundnut Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost', quantity: '5 t/ha', timing: 'Basal', notes: 'At land preparation' },
            { name: 'Gypsum', quantity: '200 kg/ha', timing: 'At flowering', notes: 'Critical for calcium supply to developing pods' },
        ],
        chemical: {
            dry: [
                { stage: 'Basal', timing: 'At sowing', urea: '25 kg', tsp: '100 kg', mop: '50 kg', notes: 'Low N as groundnut fixes nitrogen. Higher P for root development.' },
            ],
            intermediate: [
                { stage: 'Basal', timing: 'At sowing', urea: '25 kg', tsp: '100 kg', mop: '50 kg', notes: 'Same as dry zone recommendation' },
            ],
        },
    },
    mungbean: {
        title: 'Mung Bean Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost', quantity: '2-3 t/ha', timing: 'Basal', notes: 'Light application sufficient as mung bean fixes nitrogen' },
        ],
        chemical: {
            dry: [
                { stage: 'Basal (only application)', timing: 'At sowing', urea: '50 kg', tsp: '100 kg', mop: '50 kg', notes: 'Single application only. No top dressing needed for this short-duration crop.' },
            ],
        },
    },
    cowpea: {
        title: 'Cowpea Fertilizer Guide',
        unit: 'per hectare',
        organic: [
            { name: 'Compost', quantity: '2-3 t/ha', timing: 'Basal', notes: 'Light application; cowpea fixes its own nitrogen' },
        ],
        chemical: {
            dry: [
                { stage: 'Basal (only application)', timing: 'At sowing', urea: '25 kg', tsp: '80 kg', mop: '40 kg', notes: 'Minimal nitrogen needed. Focus on P and K.' },
            ],
            intermediate: [
                { stage: 'Basal (only application)', timing: 'At sowing', urea: '25 kg', tsp: '80 kg', mop: '40 kg', notes: 'Same recommendation as dry zone' },
            ],
        },
    },
    vegetables: {
        title: 'Vegetables Fertilizer Guide (General)',
        unit: 'per hectare',
        organic: [
            { name: 'Compost/FYM', quantity: '20-30 t/ha', timing: 'At bed preparation', notes: 'Essential for all vegetable cultivation. Mix into top 20cm.' },
            { name: 'Liquid organic fertilizer', quantity: 'Weekly foliar spray', timing: 'During growth', notes: 'Compost tea or bio-fertilizer at 1:10 dilution' },
        ],
        chemical: {
            wet: [
                { stage: 'Basal', timing: 'At planting', urea: '100 kg', tsp: '200 kg', mop: '75 kg', notes: 'Mix into beds before planting' },
                { stage: 'Top Dressing 1', timing: '2 weeks', urea: '75 kg', tsp: '-', mop: '35 kg', notes: 'Side dress along rows' },
                { stage: 'Top Dressing 2', timing: '4 weeks', urea: '75 kg', tsp: '-', mop: '35 kg', notes: 'During active fruiting' },
            ],
            intermediate: [
                { stage: 'Basal', timing: 'At planting', urea: '100 kg', tsp: '200 kg', mop: '75 kg', notes: 'Same as wet zone' },
                { stage: 'Top Dressing 1', timing: '2 weeks', urea: '75 kg', tsp: '-', mop: '35 kg', notes: 'After first weeding' },
                { stage: 'Top Dressing 2', timing: '4 weeks', urea: '75 kg', tsp: '-', mop: '35 kg', notes: 'During fruiting' },
            ],
        },
    },
    cashew: {
        title: 'Cashew Fertilizer Guide',
        unit: 'per tree per year',
        organic: [
            { name: 'Compost', quantity: '10-15 kg/tree', timing: 'Start of rains', notes: 'Apply in basin around tree' },
        ],
        chemical: {
            dry: [
                { stage: 'Young trees (1-3 years)', timing: 'Twice yearly', urea: '200g', tsp: '200g', mop: '100g', notes: 'Apply in 60cm circle from trunk' },
                { stage: 'Bearing trees (3+ years)', timing: 'Twice yearly', urea: '500g', tsp: '375g', mop: '375g', notes: 'Apply along drip line after rain' },
            ],
            intermediate: [
                { stage: 'Young trees (1-3 years)', timing: 'Twice yearly', urea: '200g', tsp: '200g', mop: '100g', notes: 'Same as dry zone' },
                { stage: 'Bearing trees (3+ years)', timing: 'Twice yearly', urea: '500g', tsp: '375g', mop: '375g', notes: 'Apply with rains' },
            ],
        },
    },
    banana: {
        title: 'Banana Fertilizer Guide',
        unit: 'per plant per crop cycle',
        organic: [
            { name: 'Compost/FYM', quantity: '10 kg/plant', timing: 'At planting', notes: 'Mix with soil in planting pit' },
            { name: 'Mulch', quantity: 'Thick layer around base', timing: 'Continuous', notes: 'Use dried banana leaves, rice straw, or other organic matter' },
        ],
        chemical: {
            wet: [
                { stage: 'At Planting', timing: 'Basal', urea: '60g', tsp: '125g', mop: '75g', notes: 'Mix into planting pit soil' },
                { stage: '2 months', timing: '2nd application', urea: '60g', tsp: '-', mop: '75g', notes: 'Ring application 30cm from pseudostem' },
                { stage: '4 months', timing: '3rd application', urea: '60g', tsp: '-', mop: '75g', notes: 'During active vegetative growth' },
                { stage: '6 months', timing: '4th application', urea: '60g', tsp: '-', mop: '100g', notes: 'Pre-flowering. Higher K for fruit quality.' },
            ],
            intermediate: [
                { stage: 'At Planting', timing: 'Basal', urea: '60g', tsp: '125g', mop: '75g', notes: 'In planting pit' },
                { stage: '2 months', timing: '2nd application', urea: '60g', tsp: '-', mop: '75g', notes: 'Around base' },
                { stage: '4 months', timing: '3rd application', urea: '60g', tsp: '-', mop: '75g', notes: 'Active growth phase' },
                { stage: '6 months', timing: '4th application', urea: '60g', tsp: '-', mop: '100g', notes: 'Before flowering' },
            ],
        },
    },
};

// Helper: get fertilizer guide for a crop
export const getFertilizerGuide = (cropId) => {
    return FERTILIZER_GUIDES[cropId] || null;
};

// Helper: get zone-specific chemical fertilizer schedule
export const getZoneFertilizer = (cropId, zoneId) => {
    const guide = FERTILIZER_GUIDES[cropId];
    if (!guide || !guide.chemical) return null;
    // Try exact zone, then fall back to first available zone
    return guide.chemical[zoneId] || guide.chemical[Object.keys(guide.chemical)[0]] || null;
};
