/**
 * Pest & Disease Seed Script — Sri Lankan Agriculture
 * ====================================================
 * Run:  node seed/pestDiseaseSeed.js  (from the server/ folder)
 *
 * SOURCES:
 *  1. Department of Agriculture, Sri Lanka (doa.gov.lk) — Rice Research & Development Institute (RRDI)
 *  2. Coconut Research Institute of Sri Lanka (cri.gov.lk)
 *  3. Tea Research Institute of Sri Lanka (tri.gov.lk)
 *  4. Food and Agriculture Organization (FAO) — Fall Armyworm programme for Sri Lanka
 *  5. University of Ruhuna, Faculty of Agriculture — Rice disease compendium (ruh.ac.lk)
 *  6. South Eastern University of Sri Lanka — Coconut pest research (seu.ac.lk)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const PestDisease = require('../models/PestDisease');

const seedData = [
    // ───────────────────────── RICE / PADDY ─────────────────────────
    {
        name: 'Brown Planthopper',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Yellowing of lower leaves progressing to a "hopper burn" — circular patches of dried, brown plants in the field. Plants wilt and die in severe infestations. Honey-dew excretion leads to sooty mould on leaf surfaces.',
        treatment:
            'Avoid excessive nitrogen fertiliser. Use resistant rice varieties recommended by DOA Sri Lanka (e.g. Bg 379-2). Apply targeted insecticides only when populations exceed the economic threshold (10–15 per hill). Encourage natural predators such as spiders and Cyrtorhinus lividipennis.',
    },
    {
        name: 'Yellow Stem Borer',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            '"Dead heart" in the vegetative stage — the central shoot turns brown and can be pulled out easily. "White ear" in the reproductive stage — panicles turn white and bear no grain. Bore holes visible at the stem base with frass inside.',
        treatment:
            'Clip and destroy egg masses during transplanting. Harvest at ground level and plough in stubble to destroy overwintering larvae. Use pheromone traps for monitoring. Apply Carbofuran 3G granules in the leaf whorl when damage exceeds 5% dead hearts (DOA recommendation).',
    },
    {
        name: 'Fall Armyworm',
        type: 'Pest',
        affectedCrops: ['Maize', 'Rice', 'Sorghum', 'Millet'],
        symptoms:
            'Irregular holes and ragged feeding damage on leaves, often with visible frass (sawdust-like excrement). Young larvae scrape the leaf surface creating translucent "window-panes". Severe attacks destroy the growing point of maize (dead heart). Larvae identifiable by an inverted Y-mark on the head.',
        treatment:
            'Early detection using pheromone traps and the FAO FAMEWS mobile app. Apply Bacillus thuringiensis (Bt) or Spodoptera-specific NPV for biological control. As a last resort, use Emamectin benzoate 5% SG (DOA-approved). Practise crop rotation with non-host crops, deep tillage after harvest, and avoid staggered planting.',
    },
    {
        name: 'Rice Blast',
        type: 'Disease',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Diamond-shaped or spindle-shaped lesions on leaves, initially small and water-soaked, later turning grey-white with dark brown borders. Neck blast causes the panicle neck to turn brown-black and break, leading to empty or partially filled grains.',
        treatment:
            'Use blast-resistant varieties (e.g. Bg 360, At 362 recommended by RRDI). Avoid excessive nitrogen. Maintain proper plant spacing. Apply fungicides such as Tricyclazole 75% WP or Isoprothiolane as a preventive spray at booting stage when weather is conducive (cool, humid conditions).',
    },
    {
        name: 'Bacterial Leaf Blight',
        type: 'Disease',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Water-soaked lesions starting at leaf tips and margins, progressing into long, yellowish-white streaks with wavy edges. Severely infected leaves dry out and turn greyish-white. Bacterial ooze (milky droplets) may be visible on leaf surfaces in early morning.',
        treatment:
            'Grow resistant varieties recommended by DOA Sri Lanka. Avoid excessive nitrogen fertiliser. Ensure balanced potassium nutrition. Drain fields during early infection. No highly effective chemical control exists — prevention through resistant varieties and field sanitation is the primary strategy.',
    },

    // ───────────────────── COCONUT ─────────────────────
    {
        name: 'Coconut Rhinoceros Beetle',
        type: 'Pest',
        affectedCrops: ['Coconut'],
        symptoms:
            'V-shaped cuts and bore holes in unopened fronds; when fronds unfurl they show characteristic wedge-shaped damage. Bore holes in the crown emit chewed fibre. Young palms may die; mature palms show reduced yield and become susceptible to secondary attacks by Red Palm Weevil.',
        treatment:
            'Remove and destroy decaying coconut logs and organic matter that serve as breeding sites. Apply Carbofuran 3% granules or Carbosulfan 10% insecticide to leaf axils (CRI recommendation). Use pheromone traps to mass-trap adults. Biological control with the Oryctes virus (OrNV) and the fungus Metarhizium anisopliae is effective.',
    },
    {
        name: 'Red Palm Weevil',
        type: 'Pest',
        affectedCrops: ['Coconut'],
        symptoms:
            'Wilting and drying of inner whorl leaves. Oozing of brown, foul-smelling fluid from bore holes in the trunk. Crunching sound audible from feeding grubs inside the stem. Crown may topple in advanced infestations. Mostly affects young palms (3–15 years).',
        treatment:
            'Prevent wounds on palm trunks; coat all cut surfaces with coal tar. Use pheromone traps (Ferrolure) for monitoring and mass trapping (CRI advisory). Treat infested palms with trunk injection of Monocrotophos 60% SL diluted at 5 ml per litre. Remove and burn severely infested palms to prevent spread.',
    },
    {
        name: 'Coconut Bud Rot',
        type: 'Disease',
        affectedCrops: ['Coconut'],
        symptoms:
            'Yellowing and wilting of the youngest (spear) leaf, which easily pulls out. The growing bud becomes soft, emits a foul odour, and turns into a decayed mass. Surrounding leaves progressively droop and fall. The disease is often fatal if not treated early.',
        treatment:
            'Remove and burn all infected tissue. Apply Bordeaux paste to the cut surface after removing diseased bud. Improve drainage around palms. Preventive spraying with copper-based fungicides (Bordeaux mixture) during wet seasons. Avoid mechanical injury to the crown area (CRI advisory).',
    },

    // ───────────────────── TEA ─────────────────────
    {
        name: 'Tea Blister Blight',
        type: 'Disease',
        affectedCrops: ['Tea'],
        symptoms:
            'Small, translucent, light-coloured spots on young leaves that enlarge into blister-like swellings. The underside of blisters develops a velvety white coating of fungal spores (Exobasidium vexans). Affected leaves curl and become distorted. Severe attacks damage new flush, reducing yield and quality.',
        treatment:
            'Pluck affected shoots promptly to reduce spore load. Apply copper-based fungicides (e.g. Copper Oxychloride) or systemic fungicides such as Hexaconazole at 7–10 day intervals during wet weather. Maintain good drainage and air circulation through proper pruning. Use TRI-recommended resistant cultivars where available.',
    },
    {
        name: 'Tea Mosquito Bug',
        type: 'Pest',
        affectedCrops: ['Tea'],
        symptoms:
            'Dark brown to black necrotic spots on young leaves and tender shoots caused by feeding punctures of Helopeltis theivora. Affected shoots dry out and become brittle. Severe infestations cause "die-back" of shoots and heavy crop loss, especially during dry spells in the low-country tea regions of Sri Lanka.',
        treatment:
            'Prune to maintain a healthy bush frame; avoid shade tree neglect. Apply recommended insecticides such as Thiamethoxam or Imidacloprid only when pest density exceeds the economic threshold. Encourage natural enemies (predatory bugs and spiders). Follow TRI advisory circulars on spray schedules for the specific elevation zone.',
    },

    // ───────────────────── CHILI / VEGETABLES ─────────────────────
    {
        name: 'Chili Anthracnose',
        type: 'Disease',
        affectedCrops: ['Chili', 'Capsicum', 'Bell Pepper'],
        symptoms:
            'Sunken, circular, dark lesions on ripe and mature green fruits, often with concentric rings. Lesions may coalesce causing extensive fruit rot. Under humid conditions, salmon-pink spore masses appear in the centre of lesions. Caused by Colletotrichum capsici and C. gloeosporioides.',
        treatment:
            'Use certified disease-free seed. Treat seeds with Thiram or Captan before sowing. Apply Mancozeb 80% WP or Carbendazim 50% WP at flowering and fruiting stages. Practise crop rotation (minimum 2 years). Remove and destroy infected fruit debris. Avoid overhead irrigation.',
    },
    {
        name: 'Chili Leaf Curl Complex',
        type: 'Disease',
        affectedCrops: ['Chili', 'Capsicum'],
        symptoms:
            'Upward curling and puckering of leaves with thickened, leathery texture. Stunted plant growth with shortened internodes giving a bushy appearance. Caused by a begomovirus transmitted by the whitefly Bemisia tabaci. Yield losses can be 50–70% in severe outbreaks in the dry zone of Sri Lanka.',
        treatment:
            'Control the whitefly vector with yellow sticky traps and neem-based insecticides. Apply systemic insecticides (Imidacloprid) to seedlings before transplanting. Use reflective mulch to repel whiteflies. Remove and destroy infected plants immediately. Grow tolerant varieties where available (DOA recommendations).',
    },

    // ───────────────────── BANANA ─────────────────────
    {
        name: 'Banana Bunchy Top Virus',
        type: 'Disease',
        affectedCrops: ['Banana'],
        symptoms:
            'Dark green "dot-dash" streaks along the leaf midrib and petiole veins (Morse-code pattern). Leaves become progressively narrower, shorter, and erect with wavy, chlorotic margins, giving a "bunchy top" rosette appearance. Infected plants rarely produce fruit. Spread by the banana aphid (Pentalonia nigronervosa).',
        treatment:
            'Use only virus-free planting material from certified tissue culture labs. Rogue and destroy infected plants immediately by injecting with herbicide (Glyphosate) before uprooting to kill the aphid vector. Control banana aphids with Imidacloprid. Maintain a 10 m quarantine zone around affected areas.',
    },
    {
        name: 'Banana Weevil Borer',
        type: 'Pest',
        affectedCrops: ['Banana', 'Plantain'],
        symptoms:
            'Tunnelling in the corm by larvae (Cosmopolites sordidus) causing weakened root anchorage — plants topple easily in wind ("snapping"). Reduced bunch weight and delayed maturity. Entry holes visible at the base of the pseudostem with dark frass. Infested corms show extensive brownish tunnels when cut open.',
        treatment:
            'Use clean, pest-free planting material; pare corms and dip in Chlorpyrifos solution before planting. Place pseudostem disc traps (split-trap method) in the field to attract and collect adult weevils. Apply Beauveria bassiana (biological control) to the soil around the base. Practise crop rotation and field sanitation.',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await PestDisease.deleteMany({});
        console.log('🗑️  Cleared existing PestDisease records');

        // Insert seed data
        const inserted = await PestDisease.insertMany(seedData);
        console.log(`🌱 Seeded ${inserted.length} pest/disease records successfully!`);

        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
}

seed();
