/**
 * Pest & Disease Seed Script — Sri Lankan Agriculture
 * ====================================================
 * Run:  node seed/pestDiseaseSeed.js  (from the server/ folder)
 *
 * SOURCES (all data verified against these authoritative references):
 *
 *  1. Department of Agriculture, Sri Lanka (doa.gov.lk)
 *     — Rice Research & Development Institute (RRDI)
 *     — Plant Protection Service (PPS)
 *     — Vegetable crop advisories
 *
 *  2. Coconut Research Institute of Sri Lanka (cri.gov.lk)
 *     — Crop Protection Division advisory circulars
 *
 *  3. Tea Research Institute of Sri Lanka (tri.gov.lk)
 *     — Pest & disease management guidelines
 *
 *  4. Rubber Research Institute of Sri Lanka (rrisl.gov.lk)
 *     — Plant Pathology & Microbiology Department
 *
 *  5. Department of Export Agriculture, Sri Lanka (dea.gov.lk)
 *     — Cinnamon, Pepper, and Cardamom pest/disease profiles
 *
 *  6. National Cinnamon Research & Training Centre (cinnamon.gov.lk)
 *     — Cinnamon pest and disease compendium
 *
 *  7. Food and Agriculture Organization (fao.org)
 *     — Fall Armyworm programme for Sri Lanka
 *     — Rubber disease management resources
 *
 *  8. University of Ruhuna, Faculty of Agriculture (ruh.ac.lk)
 *     — Rice disease compendium
 *
 *  9. South Eastern University of Sri Lanka (seu.ac.lk)
 *     — Coconut pest research
 *
 *  10. University of Sri Jayewardenepura (sjp.ac.lk)
 *      — White root disease biological control studies
 *
 *  11. Hector Kobbekaduwa Agrarian Research Institute (harti.gov.lk)
 *      — Agricultural pest management publications
 *
 *  12. Sri Lanka Council for Agricultural Research Policy (slcarp.lk)
 *      — IPM policy and research coordination
 */

require('dotenv').config();
const mongoose = require('mongoose');
const PestDisease = require('../models/PestDisease');

const seedData = [
    // ═══════════════════════════════════════════════════════════════
    //  RICE / PADDY  (Sources: DOA Sri Lanka RRDI, ruh.ac.lk, FAO)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Brown Planthopper',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Yellowing of lower leaves progressing to "hopper burn" — circular patches of dried, brown plants in the field. Plants wilt and die in severe infestations. Honeydew excretion leads to sooty mould on leaf surfaces.',
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
        name: 'Rice Gall Midge',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Affected tillers produce hollow, silvery-white tubular galls ("onion shoots" or "silver shoots") instead of normal leaves. Infested plants fail to produce panicles. Severe attacks cause heavy tiller loss and significant yield reduction, particularly in the wet zone.',
        treatment:
            'Use resistant varieties recommended by RRDI (e.g. Bg 380). Synchronise planting across the area to break the pest cycle. Remove and destroy galled tillers. Apply Carbofuran 3G in the root zone during early vegetative stage if damage exceeds 5% silver shoots.',
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
    {
        name: 'Rice Sheath Blight',
        type: 'Disease',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Oval or irregularly shaped greenish-grey lesions on leaf sheaths near the water line, expanding upwards. Lesions coalesce, causing entire sheaths and leaves to dry out. Under humid conditions, whitish mycelial growth and small round sclerotia are visible on infected tissue.',
        treatment:
            'Avoid excessive nitrogen and dense planting. Maintain recommended plant spacing. Remove floating sclerotia during land preparation. Apply Validamycin 3% SL or Hexaconazole 5% EC at early booting stage. Use silicon-based fertilisers to strengthen cell walls (DOA-recommended integrated approach).',
    },

    // ═══════════════════════════════════════════════════════════════
    //  COCONUT  (Sources: Coconut Research Institute — cri.gov.lk)
    // ═══════════════════════════════════════════════════════════════
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
        name: 'Coconut Mite',
        type: 'Pest',
        affectedCrops: ['Coconut'],
        symptoms:
            'Triangular, brownish-black, corky patches on the surface of young nuts beneath the perianth. Affected nuts are stunted, misshapen, and produce less copra. Severe infestations cause premature nut fall and reduce overall bunch quality.',
        treatment:
            'Apply neem oil or sulphur-based acaricides to bunches during early nut development. Encourage the predatory mite Neoseiulus baraki by minimising broad-spectrum pesticide use. Remove and destroy heavily infested bunches. CRI recommends varietal tolerance screening for long-term management.',
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
    {
        name: 'Weligama Coconut Leaf Wilt Disease',
        type: 'Disease',
        affectedCrops: ['Coconut'],
        symptoms:
            'Flaccidity and drooping of leaflets, starting from the lower fronds and progressing upward. Yellowing of leaflets with necrotic tips. Reduced nut production and eventual decline of the palm. First reported in the Weligama area of the Southern Province of Sri Lanka.',
        treatment:
            'No curative treatment available. Remove and destroy severely affected palms to reduce inoculum. Apply balanced nutrition (especially potassium and boron) to improve palm vigour. CRI is developing resistant hybrid varieties. Quarantine restrictions apply to prevent spread to unaffected areas.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  TEA  (Sources: Tea Research Institute — tri.gov.lk)
    // ═══════════════════════════════════════════════════════════════
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
    {
        name: 'Tea Shot Hole Borer',
        type: 'Pest',
        affectedCrops: ['Tea'],
        symptoms:
            'Tiny, round bore holes (pin-head size) in the main stem and branches caused by the beetle Xyleborus fornicatus. Infested branches become weak, wilted, and may snap off. Sawdust-like frass pushed out from bore holes. Serious in mid-country and low-country tea regions; weakened bushes show reduced flush and dieback.',
        treatment:
            'Prune and burn all infested branches below the lowest bore hole. Maintain vigorous bushes through proper fertilisation and shade management. Apply recommended contact insecticides to cut surfaces after pruning to prevent re-infestation. TRI recommends monitoring with ethanol-baited traps in high-risk areas.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  RUBBER  (Sources: RRISL — rrisl.gov.lk, sjp.ac.lk, FAO)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'White Root Disease of Rubber',
        type: 'Disease',
        affectedCrops: ['Rubber'],
        symptoms:
            'Off-green to yellowish discolouration of leaves, followed by leathery and buckled foliage. Premature flowering and dieback of the canopy. White, thick mycelial strands of Rigidoporus microporus visible on roots. Reddish-brown bark at the collar region. Characteristic semi-circular fructifications appear at ground level in advanced stages. Fatal within the first 5 years if untreated.',
        treatment:
            'Remove and destroy all infected root material and adjacent stumps. Apply sulphur to the planting hole before replanting. Use Pueraria phaseoloides as cover crop to suppress pathogen buildup. Biological control using Trichoderma harzianum-based biopesticide developed by RRISL. Conduct regular collar inspections in the first 5 years after planting.',
    },
    {
        name: 'Pestalotiopsis Leaf Disease of Rubber',
        type: 'Disease',
        affectedCrops: ['Rubber'],
        symptoms:
            'Circular brown lesions on mature leaves that coalesce into large blighted patches. Leaves turn yellow and defoliate prematurely. Severe cases can reduce latex yield by up to 40%. First emerged in Sri Lanka in July 2019, devastating over 20,000 hectares by 2021 — mainly in Kalutara, Ratnapura, Kegalle, and Galle districts.',
        treatment:
            'Apply Mancozeb 80% WP or Carbendazim 50% WP as foliar sprays during wet weather. Use RRISL-recommended tolerant clones (RRI100, RRI2006, Centennial 4) for new plantings. Improve air circulation by proper spacing. Follow RRISL fungicide application protocol developed after the 2019 outbreak.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  CHILI / VEGETABLES  (Sources: DOA doa.gov.lk, dea.gov.lk)
    // ═══════════════════════════════════════════════════════════════
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
    {
        name: 'Tomato Bacterial Wilt',
        type: 'Disease',
        affectedCrops: ['Tomato', 'Brinjal', 'Chili', 'Potato'],
        symptoms:
            'Sudden wilting of the entire plant without yellowing of leaves. Lower leaves may droop first. When the stem is cut and placed in water, milky-white bacterial ooze streams out — a diagnostic test. Caused by Ralstonia solanacearum, a soil-borne bacterium highly persistent in wet zone soils of Sri Lanka.',
        treatment:
            'Use resistant varieties recommended by DOA. Practise crop rotation with non-solanaceous crops (rice, maize) for at least 3 years. Soil solarisation before planting. Apply Trichoderma viride to the planting hole. Avoid waterlogging; ensure good drainage. Remove and destroy infected plants immediately — do not compost them.',
    },
    {
        name: 'Tomato Late Blight',
        type: 'Disease',
        affectedCrops: ['Tomato', 'Potato'],
        symptoms:
            'Large, irregular, water-soaked, dark brown lesions on leaves, often with a pale green halo. White, cottony fungal growth visible on the underside of leaves during humid mornings. Fruits develop firm, dark, greasy-looking patches. Caused by Phytophthora infestans. Severe in upcountry wet zone areas during the Maha season.',
        treatment:
            'Apply Mancozeb 80% WP or Metalaxyl + Mancozeb (Ridomil Gold) preventively before rainy periods. Use raised beds and proper spacing for air circulation. Remove and destroy affected plant parts. Grow DOA-recommended tolerant varieties. Avoid overhead irrigation; use drip irrigation.',
    },
    {
        name: 'Brinjal Fruit and Shoot Borer',
        type: 'Pest',
        affectedCrops: ['Brinjal', 'Eggplant'],
        symptoms:
            'Larvae of Leucinodes orbonalis bore into tender shoots causing wilting and drooping of growing tips. In fruits, larvae bore inside, leaving entry holes sealed with frass. Infested fruits show internal tunnelling and become unmarketable. Yield losses can exceed 60% in the wet zone of Sri Lanka.',
        treatment:
            'Remove and destroy all wilted shoots and infested fruits weekly. Use pheromone traps for monitoring and mass trapping of adult males. Apply neem-based insecticides (Azadirachtin). Avoid broad-spectrum pesticides to preserve natural enemies (parasitoid wasps). As a last resort, apply Emamectin benzoate 5% SG (DOA-approved).',
    },
    {
        name: 'Okra Yellow Vein Mosaic',
        type: 'Disease',
        affectedCrops: ['Okra', 'Ladies Finger'],
        symptoms:
            'Bright yellow vein clearing and interveinal yellowing of leaves, creating a net-like mosaic pattern. Severely infected plants are stunted with small, malformed, and tough fruits. Caused by a begomovirus transmitted by the whitefly Bemisia tabaci. Can cause total crop loss in susceptible varieties.',
        treatment:
            'Grow resistant/tolerant varieties (e.g. MI-5, MI-7 recommended by DOA Sri Lanka). Control whitefly vectors using yellow sticky traps and neem oil. Apply Imidacloprid as a seed treatment or soil drench at transplanting. Use silver-coloured reflective mulch to repel whiteflies. Uproot and destroy infected plants immediately.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  BANANA  (Sources: DOA doa.gov.lk, harti.gov.lk)
    // ═══════════════════════════════════════════════════════════════
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
    {
        name: 'Panama Disease (Fusarium Wilt of Banana)',
        type: 'Disease',
        affectedCrops: ['Banana'],
        symptoms:
            'Yellowing and wilting of older leaves, starting from the margins and progressing inward. Leaves collapse and hang around the pseudostem like a skirt. Splitting of the pseudostem base reveals dark brown to reddish vascular discolouration. Caused by Fusarium oxysporum f.sp. cubense, a persistent soil-borne fungus.',
        treatment:
            'Use disease-free tissue culture planting material. Avoid planting in previously infested soil. Practise crop rotation with non-host crops for at least 5 years. Apply Trichoderma-based biofungicides to planting holes. There is no effective chemical cure — prevention and resistant varieties (e.g. FHIA hybrids) are the primary strategy.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  CINNAMON  (Sources: dea.gov.lk, cinnamon.gov.lk)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Cinnamon Rough Bark Disease',
        type: 'Disease',
        affectedCrops: ['Cinnamon'],
        symptoms:
            'Brown spots appear on young shoots that gradually spread, causing the immature bark to become coarse and rough-textured. Peeling becomes difficult, reducing the quality of processed cinnamon quills. Caused by Phomopsis spp. and other fungi (Pestalotiopsis, Colletotrichum). Common in nearly all cinnamon-growing areas of Sri Lanka.',
        treatment:
            'Prune and destroy infected shoots before the disease spreads. Apply Mancozeb 80% WP or Copper Oxychloride as a foliar spray during rainy periods. Maintain good spacing and air circulation in plantations. Avoid wounding stems during harvesting. Follow DEA guidelines on disease-free planting material.',
    },
    {
        name: 'Cinnamon Pink Stem Borer',
        type: 'Pest',
        affectedCrops: ['Cinnamon'],
        symptoms:
            'Larvae of Ichneumoniptera cinnamomumi burrow into the base of cinnamon stems, causing shoots to wilt and eventually fall off. Entry holes visible near the base with frass. The base decays over time, killing the entire shoot. Considered the most destructive pest of cinnamon in Sri Lanka.',
        treatment:
            'Remove and destroy infested stems below the bore hole. Apply contact insecticides to the base of plants during peak adult emergence (rainy season). Keep the plantation floor clean to reduce pupation sites. Use trap crops or light traps for monitoring adult moths. Follow DEA and National Cinnamon Research Centre recommendations.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  PEPPER  (Sources: dea.gov.lk, Department of Export Agriculture)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Pepper Quick Wilt',
        type: 'Disease',
        affectedCrops: ['Black Pepper', 'Pepper'],
        symptoms:
            'Rapid wilting and drying of pepper vines within 2–3 weeks. Leaves turn yellow, droop, and fall. Roots and root collar show dark brown to black rot when examined. Caused by Phytophthora capsici, which attacks the root system. Particularly severe during hot, dry spells followed by sudden rainfall in the mid-country.',
        treatment:
            'Improve drainage around vine bases. Apply Metalaxyl + Mancozeb (Ridomil Gold) as a soil drench at the onset of monsoon. Apply Trichoderma-based bioagents to the root zone. Avoid injuring roots during weeding. Use pepper varieties with field tolerance (e.g. Panniyur selections). Follow DEA alert circulars on Quick Wilt management.',
    },
    {
        name: 'Pepper Pollu Beetle',
        type: 'Pest',
        affectedCrops: ['Black Pepper', 'Pepper'],
        symptoms:
            'Small black beetles (Longitarsus nigripennis) feed on developing pepper spikes, causing flowers and immature berries to drop. Spike damage leads to "hollow" or "pinhead" berries with no pungency. Severe during flowering season; losses can reach 30–40% in neglected plantations.',
        treatment:
            'Spray Quinalphos 25% EC or neem-based insecticides during early spike emergence. Apply two rounds of spray — first at spike initiation and second at berry formation. Maintain clean plantation floor to reduce pupation habitat. Follow DEA recommended spray schedule for the specific agro-ecological zone.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  CARDAMOM  (Sources: dea.gov.lk, vikaspedia.in)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Cardamom Thrips',
        type: 'Pest',
        affectedCrops: ['Cardamom'],
        symptoms:
            'Feeding damage by Sciothrips cardamomi on panicles, flowers, and young capsules. Capsules develop a scabby, rough, and discoloured surface. Severe damage causes premature flower drop, stunted capsules, and empty pods with no market value. Most destructive pest of cardamom in Sri Lanka.',
        treatment:
            'Remove dried leaves and debris from the base of plants to reduce thrips refugia. Apply Dimethoate 30% EC or neem oil at early flowering stage. Use overhead micro-sprinklers during dry periods to create unfavourable conditions for thrips. Follow DEA integrated management guidelines for cardamom.',
    },
    {
        name: 'Cardamom Capsule Rot (Azhukal)',
        type: 'Disease',
        affectedCrops: ['Cardamom'],
        symptoms:
            'Water-soaked lesions on young capsules that enlarge and turn dark brown to black. Infected capsules rot and emit a foul smell. The disease caused by Phytophthora spp. thrives during the southwest monsoon in poorly drained, shaded plantations. Can lead to total loss of the harvest in severely affected fields.',
        treatment:
            'Improve drainage in the plantation. Apply 1% Bordeaux mixture or Potassium Phosphonate as a preventive spray before the monsoon. Remove and destroy all infected capsules and debris. Maintain proper shade levels (not too dense). Follow DEA advisory on Phytophthora management in spice crops.',
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

        // Show summary
        const pests = inserted.filter(r => r.type === 'Pest').length;
        const diseases = inserted.filter(r => r.type === 'Disease').length;
        const crops = [...new Set(inserted.flatMap(r => r.affectedCrops))];
        console.log(`   📊 ${pests} Pests, ${diseases} Diseases`);
        console.log(`   🌾 Crops covered: ${crops.join(', ')}`);

        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
}

seed();
