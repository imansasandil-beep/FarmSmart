// Sri Lanka Crop Pest & Disease Data
// Sources:
//   - Department of Agriculture, Sri Lanka (https://doa.gov.lk)
//   - Plant Protection Service, DOA
//   - CABI PlantwisePlus Knowledge Bank
//   - Rice Research & Development Institute (RRDI)

export const PEST_DISEASE_DATA = {
    rice: {
        pests: [
            { name: 'Brown Planthopper (BPH)', sinhalaName: 'දුඹුරු පැල මකුණා', symptoms: 'Yellowing and drying of plants ("hopper burn"). Honeydew secretion on leaves.', affectedParts: 'Stem base, tillers', control: ['Use resistant varieties (Bg 379, At 362)', 'Avoid excess nitrogen fertilizer', 'Encourage natural enemies (spiders, dragonflies)', 'Spray Buprofezin or Pymetrozine as last resort'] },
            { name: 'Stem Borer', sinhalaName: 'කඳ මැදියා', symptoms: 'Dead hearts in vegetative stage. White heads (empty panicles) in reproductive stage.', affectedParts: 'Stem', control: ['Remove and destroy stubble after harvest', 'Light traps to attract and kill moths', 'Apply Chlorantraniliprole granules at 2 and 5 weeks', 'Release Trichogramma egg parasitoids'] },
            { name: 'Rice Bug', sinhalaName: 'වී මලදුව', symptoms: 'Discolored, partially filled or empty grains. Foul odor in field.', affectedParts: 'Developing grains', control: ['Keep field and bunds weed-free', 'Harvest at proper maturity', 'Spray Malathion if severe'] },
        ],
        diseases: [
            { name: 'Blast Disease', sinhalaName: 'බ්ලාස්ට් රෝගය', cause: 'Fungus (Magnaporthe oryzae)', symptoms: 'Diamond-shaped spots on leaves. Neck rot causes panicle breakage.', conditions: 'Cool nights, high humidity, excess N fertilizer', control: ['Use resistant varieties', 'Avoid excess nitrogen', 'Spray Tricyclazole or Isoprothiolane preventively', 'Ensure proper spacing for air circulation'] },
            { name: 'Bacterial Leaf Blight', sinhalaName: 'බැක්ටීරියා පත්‍ර පිළිස්සීම', cause: 'Xanthomonas oryzae', symptoms: 'Wavy yellow-white lesions from leaf tips. Leaves dry up.', conditions: 'Warm humid weather, wounds from storms', control: ['Use certified clean seed', 'Avoid excess nitrogen', 'Apply copper-based bactericides', 'Drain and dry fields if severe'] },
            { name: 'Sheath Blight', sinhalaName: 'කොපු දිලීර රෝගය', cause: 'Rhizoctonia solani', symptoms: 'Irregularly shaped gray-green lesions on leaf sheaths.', conditions: 'Dense planting, excess nitrogen, high humidity', control: ['Reduce planting density', 'Balance nitrogen application', 'Spray Hexaconazole or Propiconazole'] },
        ],
        prevention: ['Use certified seed from DOA', 'Maintain recommended spacing', 'Balance NPK fertilizer application', 'Practice crop rotation where possible', 'Clean cultivation - remove stubble and weeds'],
    },
    tea: {
        pests: [
            { name: 'Tea Tortrix', sinhalaName: 'තේ ටෝට්‍රික්ස්', symptoms: 'Leaves rolled and webbed together. Caterpillars feed inside rolled leaves.', affectedParts: 'Young leaves, buds', control: ['Maintain good plucking practices', 'Biological control with parasitoid wasps', 'Apply Bacillus thuringiensis (Bt) spray', 'Light traps for adult moths'] },
            { name: 'Shot Hole Borer', sinhalaName: 'සිදුරු කරන මැදියා', symptoms: 'Small round holes in stems. Sawdust-like frass near holes. Branch dieback.', affectedParts: 'Stems, branches', control: ['Prune and destroy affected branches', 'Apply Chlorpyrifos to holes', 'Maintain bush vigor through proper fertilization'] },
        ],
        diseases: [
            { name: 'Blister Blight', sinhalaName: 'බිබිලි රෝගය', cause: 'Fungus (Exobasidium vexans)', symptoms: 'Translucent pale spots on young leaves that develop into white blisters.', conditions: 'Cool wet weather, misty conditions at high elevations', control: ['Spray Copper Hydroxide preventively', 'Pluck regularly to remove infected leaves', 'Ensure proper bush spacing for air flow'] },
            { name: 'Root Disease', sinhalaName: 'මූල රෝගය', cause: 'Various fungi (Poria, Fomes)', symptoms: 'Gradual yellowing and death of bush. White fungal growth on roots.', conditions: 'Poor drainage, old tea lands', control: ['Remove and destroy affected bushes and roots', 'Treat soil with Trichoderma', 'Improve drainage', 'Do not replant in infected spots for 2 years'] },
        ],
        prevention: ['Regular plucking removes susceptible young tissue', 'Maintain shade trees for microclimate', 'Proper drainage to prevent root diseases', 'Balanced nutrition for bush vigor'],
    },
    coconut: {
        pests: [
            { name: 'Rhinoceros Beetle', sinhalaName: 'ගේන්දගොයි කුරුමිණියා', symptoms: 'V-shaped cuts on young leaves. Bore holes in crown. Reduced frond production.', affectedParts: 'Crown, growing point', control: ['Remove and destroy decaying coconut logs (breeding sites)', 'Apply Metarhizium anisopliae biological agent to compost heaps', 'Pheromone traps', 'Hook out beetles from bore holes'] },
            { name: 'Coconut Mite', sinhalaName: 'පොල් මයිටා', symptoms: 'Triangular brown scars on nut surface. Reduced nut size and copra quality.', affectedParts: 'Developing nuts', control: ['Spray Sulphur (wettable) on bunches', 'Release predatory mites', 'Remove heavily infested bunches'] },
            { name: 'Red Weevil', sinhalaName: 'රතු කුරුමිණියා', symptoms: 'Crown wilting, fermented smell from trunk. Eventually palm death.', affectedParts: 'Trunk, crown', control: ['Prevent wounds on trunk', 'Pheromone traps', 'Inject Chlorpyrifos into trunk if early detection', 'Remove and destroy dead palms'] },
        ],
        diseases: [
            { name: 'Leaf Blight', sinhalaName: 'පත්‍ර පිළිස්සීම', cause: 'Pestalotiopsis palmarum', symptoms: 'Gray leaf spots with dark margins. Progressive drying of leaflets.', conditions: 'Nutritional deficiency, drought stress', control: ['Improve palm nutrition with balanced fertilizer', 'Apply Mancozeb spray', 'Remove severely affected leaves'] },
        ],
        prevention: ['Maintain palm nutrition with CRI-recommended fertilizer', 'Remove dead palms and decaying logs', 'Regular inspection of crown area', 'Keep palm base clean and mulched'],
    },
    chili: {
        pests: [
            { name: 'Thrips', sinhalaName: 'තුරිප්ස්', symptoms: 'Leaf curl and upward rolling. Silver streaks on leaves. Stunted growth.', affectedParts: 'Leaves, flowers', control: ['Use yellow and blue sticky traps', 'Spray Neem seed extract (5%)', 'Apply Thiamethoxam seed treatment', 'Use windbreaks (maize/finger millet border rows)'] },
            { name: 'Mites', sinhalaName: 'මයිටා', symptoms: 'Downward curling of leaves (distinguishes from thrips). Thickened, leathery leaves.', affectedParts: 'Leaves', control: ['Spray water at high pressure', 'Apply Sulphur 80 WP', 'Remove and destroy heavily infested plants'] },
            { name: 'Fruit Borer', sinhalaName: 'ගෙඩි මැදියා', symptoms: 'Holes in fruits with frass inside. Premature fruit drop.', affectedParts: 'Fruits', control: ['Collect and destroy fallen infected fruits', 'Pheromone traps for adult moths', 'Spray Chlorantraniliprole at fruit set'] },
        ],
        diseases: [
            { name: 'Leaf Curl Complex (LCC)', sinhalaName: 'පත්‍ර රෝල් සංකීර්ණය', cause: 'Combined effect of thrips, mites and begomovirus (transmitted by whitefly)', symptoms: 'Severe upward curling, yellowing, and stunting. Drastically reduced yield.', conditions: 'Hot dry weather, Yala season, excessive monoculture', control: ['Use tolerant varieties (KA-2, Varaniya)', 'Treat seeds with Thiamethoxam/Imidacloprid', 'Plant nursery in March, transplant early April', 'Use mulching and windbreaks'] },
            { name: 'Anthracnose (Die-back)', sinhalaName: 'ඇන්ත්‍රක්නෝස්', cause: 'Colletotrichum spp.', symptoms: 'Dark sunken spots on fruits. Branch tips die back. Premature fruit drop.', conditions: 'Warm humid conditions, rain during fruiting', control: ['Use disease-free seeds', 'Spray Mancozeb + Carbendazim preventively', 'Remove infected plant parts', 'Improve air circulation'] },
        ],
        prevention: ['Crop rotation (avoid Solanaceae for 2-3 seasons)', 'Use disease-free certified seed', 'Maintain proper spacing (60×45cm)', 'Mulch with straw or white polythene', 'Install windbreaks around field'],
    },
    cinnamon: {
        pests: [
            { name: 'Cinnamon Butterfly', sinhalaName: 'කුරුඳු සමනලයා', symptoms: 'larvae feed on young leaves and shoot tips, causing defoliation.', affectedParts: 'Young leaves, shoots', control: ['Hand-pick larvae and egg masses', 'Encourage natural predators (birds, parasitoid wasps)', 'Spray Bt (Bacillus thuringiensis) for severe infestations'] },
        ],
        diseases: [
            { name: 'Rough Bark Disease', sinhalaName: 'රළු පොතු රෝගය', cause: 'Phytophthora cinnamomi', symptoms: 'Bark becomes rough, cracked. Reduced bark quality for peeling. Cankers on stem.', conditions: 'Waterlogged soils, poor drainage', control: ['Ensure good drainage', 'Remove and burn affected stems', 'Apply copper-based fungicides', 'Avoid over-watering'] },
            { name: 'Leaf Spot', sinhalaName: 'පත්‍ර ලප රෝගය', cause: 'Colletotrichum spp.', symptoms: 'Brown spots on leaves, premature leaf drop.', conditions: 'High humidity, dense planting', control: ['Maintain proper spacing', 'Spray Mancozeb preventively', 'Remove fallen infected leaves'] },
        ],
        prevention: ['Maintain proper spacing for air circulation', 'Ensure good soil drainage', 'Apply balanced fertilizer for plant vigor', 'Regular inspection and removal of infected parts'],
    },
    maize: {
        pests: [
            { name: 'Fall Armyworm', sinhalaName: 'සේනා පණුවා', symptoms: 'Irregular leaf feeding. Larvae bore into whorls. Severe defoliation. Frass in whorls.', affectedParts: 'Leaves, whorls, ears', control: ['Early detection through scouting', 'Release Trichogramma egg parasitoids', 'Spray Spinosad or Chlorantraniliprole', 'Use pheromone traps for monitoring'] },
            { name: 'Stem Borer', sinhalaName: 'කඳ මැදියා', symptoms: 'Dead hearts in young plants. Exit holes in stems. Stem breakage.', affectedParts: 'Stems', control: ['Destroy crop residues after harvest', 'Apply Carbofuran granules to whorls at 3 weeks', 'Release Trichogramma wasps'] },
        ],
        diseases: [
            { name: 'Downy Mildew', sinhalaName: 'පහළ පිටි පුස්', cause: 'Peronosclerospora sorghi', symptoms: 'White downy growth on leaf undersides. Narrow stripped leaves. No ear formation.', conditions: 'Cool mornings, high humidity', control: ['Use resistant varieties', 'Metalaxyl seed treatment', 'Remove infected plants early'] },
        ],
        prevention: ['Use DOA-recommended varieties', 'Timely planting at start of rains', 'Scout fields twice weekly for fall armyworm', 'Destroy crop residues after harvest'],
    },
    pepper: {
        pests: [
            { name: 'Pepper Berry Borer', sinhalaName: 'ගම්මිරිස් ගෙඩි මැදියා', symptoms: 'Small holes in berries. Premature berry dropping. Hollow berries.', affectedParts: 'Developing and mature berries', control: ['Collect and destroy fallen berries', 'Spray Quinalphos during berry development', 'Maintain field hygiene'] },
        ],
        diseases: [
            { name: 'Quick Wilt (Phytophthora Foot Rot)', sinhalaName: 'ඉක්මන් මැළවීම', cause: 'Phytophthora capsici', symptoms: 'Sudden wilting and death. Black lesions at stem base. Root rot.', conditions: 'Waterlogged soils, poor drainage, monsoon season', control: ['Ensure excellent drainage around vines', 'Apply Metalaxyl + Mancozeb drench', 'Remove and destroy infected vines', 'Trichoderma application to soil'] },
            { name: 'Slow Decline Pollu Disease', sinhalaName: 'සෙමින් මැළවීම', cause: 'Root-knot nematodes + fungi', symptoms: 'Gradual yellowing, leaf shedding, reduced fruiting over years.', conditions: 'Poor soil management, nematode infestation', control: ['Application of neem cake to soil', 'Apply Trichoderma bio-agent', 'Maintain proper nutrition and mulching'] },
        ],
        prevention: ['Plant on well-drained slopes', 'Avoid waterlogging at vine base', 'Apply Trichoderma + neem cake annually', 'Maintain organic mulch cover'],
    },
    rubber: {
        pests: [
            { name: 'Bark-Feeding Caterpillar', sinhalaName: 'පොතු කන කීඩැල්ලා', symptoms: 'Bark damage on trunk below tapping panel. Reduced latex flow.', affectedParts: 'Trunk bark', control: ['Hand pick larvae', 'Apply Chlorpyrifos to affected areas', 'Clean up tree bases'] },
        ],
        diseases: [
            { name: 'Abnormal Leaf Fall', sinhalaName: 'අසාමාන්‍ය පත්‍ර වැටීම', cause: 'Phytophthora spp.', symptoms: 'Premature, massive leaf fall during rainy season. Reduces latex yield by 30-40%.', conditions: 'Heavy rain, cool temperatures', control: ['Aerial application of copper fungicides during outbreaks', 'Maintain tree nutrition', 'Report to Rubber Development Department'] },
            { name: 'White Root Disease', sinhalaName: 'සුදු මුල් රෝගය', cause: 'Rigidoporus microporus', symptoms: 'Crown yellowing, leaf fall. White fungal threads on roots. Tree death.', conditions: 'Old rubber lands, infected root stumps', control: ['Remove and destroy infected stumps', 'Soil drenching with Tridemorph', 'Isolate infected trees with trenches'] },
        ],
        prevention: ['Proper clone selection for area', 'Maintain tree vigor through nutrition', 'Remove old stumps when replanting', 'Regular inspection of tapping panels and roots'],
    },
    onion: {
        pests: [
            { name: 'Onion Thrips', sinhalaName: 'ළූණු තුරිප්ස්', symptoms: 'Silver-white streaks on leaves. Leaf curling and drying. Reduced bulb size.', affectedParts: 'Leaves', control: ['Apply Neem oil spray', 'Use blue sticky traps', 'Overhead irrigation to wash off thrips', 'Spray Fipronil if severe'] },
        ],
        diseases: [
            { name: 'Purple Blotch', sinhalaName: 'වම්බටු පැහැ රෝගය', cause: 'Alternaria porri', symptoms: 'Purple-brown elliptical lesions on leaves. Progressive leaf drying from tips.', conditions: 'Warm humid conditions, excessive overhead irrigation', control: ['Spray Mancozeb + Carbendazim at 7-day intervals', 'Avoid overhead watering', 'Ensure proper spacing', 'Crop rotation with non-allium crops'] },
        ],
        prevention: ['Use quality seed/sets from DOA', 'Crop rotation (avoid planting onion/garlic in same field for 3 years)', 'Proper spacing for air circulation', 'Balanced fertilizer application'],
    },
    groundnut: {
        pests: [
            { name: 'Groundnut Leaf Miner', sinhalaName: 'රටකජු පත්‍ර මැදියා', symptoms: 'Whitish blotch mines on leaf surface. Heavy mines cause defoliation.', affectedParts: 'Leaves', control: ['Remove alternate host weeds', 'Apply Neem extract', 'Spray Monocrotophos if severe'] },
        ],
        diseases: [
            { name: 'Tikka Disease (Leaf Spot)', sinhalaName: 'ටික්කා රෝගය', cause: 'Cercospora spp.', symptoms: 'Circular dark brown spots on leaves. Premature defoliation.', conditions: 'Warm humid weather', control: ['Use resistant varieties', 'Spray Chlorothalonil or Mancozeb at 15-day intervals', 'Seed treatment with Carbendazim'] },
        ],
        prevention: ['Seed treatment before planting', 'Crop rotation with cereals', 'Maintain field hygiene', 'Apply gypsum for calcium supply and disease reduction'],
    },
    mungbean: {
        pests: [
            { name: 'Bean Fly (Stem Fly)', sinhalaName: 'කඳ මැස්සා', symptoms: 'Stem swelling at base. Yellowing and wilting. Poor establishment.', affectedParts: 'Stem base', control: ['Seed treatment with Thiamethoxam', 'Plant at proper depth', 'Maintain good plant vigor'] },
            { name: 'Pod Borer', sinhalaName: 'කරල් මැදියා', symptoms: 'Holes in pods. Partially eaten seeds. Frass in pods.', affectedParts: 'Pods, seeds', control: ['Spray Neem seed extract', 'Apply Bt spray', 'Harvest promptly when mature'] },
        ],
        diseases: [
            { name: 'Yellow Mosaic Virus', sinhalaName: 'කහ මොසේක් වෛරසය', cause: 'Mungbean Yellow Mosaic Virus (transmitted by whitefly)', symptoms: 'Bright yellow patches on leaves. Stunted growth. Few or no pods.', conditions: 'Hot weather, high whitefly populations', control: ['Use resistant varieties', 'Control whitefly with Neem oil', 'Remove infected plants early', 'Use yellow sticky traps'] },
        ],
        prevention: ['Use DOA-recommended varieties', 'Timely sowing at start of rains', 'Seed treatment with insecticide + fungicide', 'Avoid continuous mung bean/cowpea cropping'],
    },
    cowpea: {
        pests: [
            { name: 'Aphids', sinhalaName: 'මකුණන්', symptoms: 'Colonies on shoot tips and flower buds. Leaf curling. Honeydew and sooty mold.', affectedParts: 'Shoots, flowers, pods', control: ['Spray water at high pressure', 'Apply Neem oil', 'Encourage natural enemies (ladybirds, hoverflies)', 'Spray Dimethoate if severe'] },
            { name: 'Pod Borer', sinhalaName: 'කරල් මැදියා', symptoms: 'Holes in pods. Damage to developing seeds.', affectedParts: 'Pods', control: ['Hand-pick larvae', 'Spray Bt (Bacillus thuringiensis)', 'Harvest promptly'] },
        ],
        diseases: [
            { name: 'Cowpea Mosaic', sinhalaName: 'කව්පි මොසේක්', cause: 'Cowpea Aphid-borne Mosaic Virus', symptoms: 'Mosaic pattern on leaves. Leaf distortion. Stunted growth.', conditions: 'Aphid presence, warm conditions', control: ['Use virus-free seed', 'Control aphid vectors', 'Remove infected plants', 'Use tolerant varieties'] },
        ],
        prevention: ['Use clean certified seed', 'Crop rotation', 'Control aphid vectors early', 'Maintain field sanitation'],
    },
    vegetables: {
        pests: [
            { name: 'Diamondback Moth', sinhalaName: 'දියමන්ති පිට සලබයා', symptoms: 'Small holes and window-paning on leaves of cabbages and other brassicas.', affectedParts: 'Leaves (brassicas)', control: ['Use pheromone traps', 'Spray Bt (Bacillus thuringiensis)', 'Intercropping with tomato or onion', 'Net houses for high-value crops'] },
            { name: 'Fruit Fly', sinhalaName: 'ගෙඩි මැස්සා', symptoms: 'Sting marks on fruits. Larvae inside fruits causing rot. Premature fruit drop.', affectedParts: 'Fruits (tomato, bitter gourd, cucurbits)', control: ['Use bait traps (Methyl Eugenol + insecticide)', 'Collect and destroy fallen fruits', 'Use bag covering for individual fruits', 'Spray Spinosad for severe cases'] },
        ],
        diseases: [
            { name: 'Bacterial Wilt', sinhalaName: 'බැක්ටීරියා මැළවීම', cause: 'Ralstonia solanacearum', symptoms: 'Sudden permanent wilting. Brown vascular discoloration in stem cross-section.', conditions: 'Warm wet soils, pH > 6.0', control: ['Use resistant varieties', 'Soil amendment with Trichoderma', 'Crop rotation with non-solanaceous crops', 'Lime soil to pH 6.5-7.0 can reduce incidence'] },
            { name: 'Damping Off', sinhalaName: 'බිස් බසිනවා', cause: 'Pythium, Rhizoctonia spp.', symptoms: 'Seedlings collapse at soil line. Poor emergence. Thin, water-soaked stems.', conditions: 'Overwatering, poor drainage, dense sowing', control: ['Use sterilized nursery media', 'Avoid overwatering', 'Apply Trichoderma to soil', 'Treat seeds with Captan'] },
        ],
        prevention: ['Practice crop rotation (3-year cycle)', 'Use raised beds for good drainage', 'Maintain field hygiene', 'Balanced fertilizer to maintain plant vigor', 'Use IPM approach: cultural, biological, then chemical'],
    },
    cashew: {
        pests: [
            { name: 'Tea Mosquito Bug', sinhalaName: 'තේ මදුරු කීටයා', symptoms: 'Brown necrotic spots on young shoots, leaves, and developing nuts. Sunken lesions on apples.', affectedParts: 'Shoots, leaves, nuts, apples', control: ['Spray Carbaryl or Lambda-Cyhalothrin during flushing and flowering', 'Maintain tree hygiene', 'Prune affected branches'] },
        ],
        diseases: [
            { name: 'Anthracnose', sinhalaName: 'ඇන්ත්‍රක්නෝස්', cause: 'Colletotrichum gloeosporioides', symptoms: 'Dark spots on leaves, inflorescence, and developing nuts. Blossom blight. Nut rot.', conditions: 'Wet weather during flowering period', control: ['Spray Mancozeb or Carbendazim during flowering', 'Prune dead branches to improve air flow', 'Avoid planting in waterlogged areas'] },
        ],
        prevention: ['Prune trees annually to open canopy', 'Maintain tree nutrition', 'Spray preventively during flushing and flowering periods', 'Remove and destroy infected plant material'],
    },
    banana: {
        pests: [
            { name: 'Banana Weevil', sinhalaName: 'කෙසෙල් කුරුමිණියා', symptoms: 'Tunnels in corm causing weakening and toppling. Reduced bunch weight.', affectedParts: 'Corm, pseudostem base', control: ['Use clean planting material (paring and hot water treatment)', 'Apply Chlorpyrifos to planting pit', 'Use pseudostem traps to attract and kill weevils', 'Remove old corms after harvest'] },
            { name: 'Nematodes', sinhalaName: 'නෙමටෝඩා', symptoms: 'Root lesions, poor root system, reduced vigor. Toppling of fruit-bearing plants.', affectedParts: 'Roots', control: ['Use tissue culture plants for clean start', 'Apply Carbofuran granules to planting pit', 'Incorporate neem cake into soil', 'Crop rotation if severe'] },
        ],
        diseases: [
            { name: 'Panama Disease (Fusarium Wilt)', sinhalaName: 'පැනමා රෝගය', cause: 'Fusarium oxysporum f.sp. cubense', symptoms: 'Yellowing and wilting of older leaves first. Pseudostem splitting. Brown vascular discoloration.', conditions: 'Infested soil, waterlogging, acidic pH', control: ['Use resistant varieties', 'Avoid planting in infested land', 'Apply lime to raise soil pH', 'There is NO chemical cure - prevention is key'] },
            { name: 'Sigatoka Leaf Spot', sinhalaName: 'සිගටෝකා පත්‍ර ලප', cause: 'Mycosphaerella spp.', symptoms: 'Yellow streaks that develop into brown-black spots. Premature leaf death reduces fruit quality.', conditions: 'Warm humid weather, dense planting', control: ['Remove affected leaves', 'Spray Propiconazole or Mancozeb', 'Maintain proper spacing', 'Improve air circulation by desuckering'] },
        ],
        prevention: ['Use disease-free planting material (tissue culture preferred)', 'Practice good field sanitation', 'Remove old pseudostems after harvest', 'Maintain proper spacing', 'Avoid waterlogged areas for planting'],
    },
};

// Helper: get pest and disease data for a crop
export const getPestDiseaseData = (cropId) => {
    return PEST_DISEASE_DATA[cropId] || null;
};

// Helper: get only pest list for a crop
export const getPests = (cropId) => {
    const data = PEST_DISEASE_DATA[cropId];
    return data ? data.pests : [];
};

// Helper: get only disease list for a crop
export const getDiseases = (cropId) => {
    const data = PEST_DISEASE_DATA[cropId];
    return data ? data.diseases : [];
};

// Helper: get prevention tips for a crop
export const getPreventionTips = (cropId) => {
    const data = PEST_DISEASE_DATA[cropId];
    return data ? data.prevention : [];
};
