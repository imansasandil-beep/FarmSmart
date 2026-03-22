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
        name: 'Brown Planthopper / දුඹුරු පැළ කීඩෑවා',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Yellowing of lower leaves progressing to "hopper burn" — circular patches of dried, brown plants in the field. Plants wilt and die in severe infestations. Honeydew excretion leads to sooty mould on leaf surfaces. / පහළ කොළ කහ පැහැයට හැරී "හොපර් බර්න්" (දුඹුරු පැහැති වියළි පුල්ලි) ඇතිවේ. දරුණු හානිවලදී පැළ මැරී යයි. මී පැණි වැනි ශ්‍රාවය නිසා කොළ මත කලු පැහැති පුස් වර්ධනය වේ.',
        treatment:
            'Avoid excessive nitrogen fertiliser. Use resistant rice varieties recommended by DOA Sri Lanka (e.g. Bg 379-2). Apply targeted insecticides only when populations exceed the economic threshold (10–15 per hill). Encourage natural predators such as spiders and Cyrtorhinus lividipennis. / නයිට්‍රජන් පොහොර වැඩිපුර යෙදීමෙන් වළකින්න. නිර්දේශිත ඔරොත්තු දෙන වී ප්‍රභේද භාවිතා කරන්න. ආර්ථික හානි මට්ටම ඉක්මවා ගියහොත් පමණක් කෘමිනාශක යොදන්න. ස්වාභාවික විලෝපිකයන් ආරක්ෂා කරන්න.',
    },
    {
        name: 'Yellow Stem Borer / කහ කඳ විදිනවා',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            '"Dead heart" in the vegetative stage — the central shoot turns brown and can be pulled out easily. "White ear" in the reproductive stage — panicles turn white and bear no grain. Bore holes visible at the stem base with frass inside. / වර්ධක අවධියේදී මධ්‍යම කුරුව වියළී යාම (Dead heart) සහ ගොයම් අවධියේදී සුදු පැහැ කරල් ඇතිවීම (White ear). කඳේ පාදයේ සිදුරු ඇතිවේ.',
        treatment:
            'Clip and destroy egg masses during transplanting. Harvest at ground level and plough in stubble to destroy overwintering larvae. Use pheromone traps for monitoring. Apply Carbofuran 3G granules in the leaf whorl when damage exceeds 5% dead hearts (DOA recommendation). / පැළ සිටුවීමේදී බිත්තර කැටිති ඉවත් කර විනාශ කරන්න. බිම් මට්ටමින් අස්වනු නෙළන්න. පෙරමෝන උගුල් භාවිතා කරන්න.',
    },
    {
        name: 'Rice Gall Midge / ගොයම් ගෝල් මැස්සා',
        type: 'Pest',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Affected tillers produce hollow, silvery-white tubular galls ("onion shoots" or "silver shoots") instead of normal leaves. Infested plants fail to produce panicles. Severe attacks cause heavy tiller loss and significant yield reduction, particularly in the wet zone. / සාමාන්‍ය කොළ වෙනුවට රිදී පැහැති නළ හැඩැති ව්‍යුහයන් (ලූනු කොළ මෙන්) ඇතිවේ. පැළවලට කරල් සෑදිය නොහැක.',
        treatment:
            'Use resistant varieties recommended by RRDI (e.g. Bg 380). Synchronise planting across the area to break the pest cycle. Remove and destroy galled tillers. Apply Carbofuran 3G in the root zone during early vegetative stage if damage exceeds 5% silver shoots. / රෝගයට ඔරොත්තු දෙන ප්‍රභේද භාවිතා කරන්න. එකවර වගා කිරීමෙන් කෘමි චක්‍රය බිඳ දමන්න.',
    },
    {
        name: 'Fall Armyworm / සේනා දළඹුවා',
        type: 'Pest',
        affectedCrops: ['Maize', 'Rice', 'Sorghum', 'Millet'],
        symptoms:
            'Irregular holes and ragged feeding damage on leaves, often with visible frass (sawdust-like excrement). Young larvae scrape the leaf surface creating translucent "window-panes". Severe attacks destroy the growing point of maize (dead heart). Larvae identifiable by an inverted Y-mark on the head. / කොළ වල අක්‍රමවත් සිදුරු ඇතිවීම සහ විශාල වශයෙන් පත්‍ර අනුභව කිරීම.',
        treatment:
            'Early detection using pheromone traps and the FAO FAMEWS mobile app. Apply Bacillus thuringiensis (Bt) or Spodoptera-specific NPV for biological control. As a last resort, use Emamectin benzoate 5% SG (DOA-approved). Practise crop rotation with non-host crops, deep tillage after harvest, and avoid staggered planting. / පෙරමෝන උගුල් මගින් කල්තියා හඳුනාගන්න. Bt වැනි ජෛව පාලන ක්‍රම හෝ නිර්දේශිත කෘමිනාශක භාවිතා කරන්න.',
    },
    {
        name: 'Rice Blast / කොළ පාළුව',
        type: 'Disease',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Diamond-shaped or spindle-shaped lesions on leaves, initially small and water-soaked, later turning grey-white with dark brown borders. Neck blast causes the panicle neck to turn brown-black and break, leading to empty or partially filled grains. / කොළ මත දියමන්ති හැඩැති රෝග ලක්ෂණ ඇතිවී පසුව මැද අළු පැහැ වන අතර පිටතින් දුඹුරු වළල්ලක් සෑදේ.',
        treatment:
            'Use blast-resistant varieties (e.g. Bg 360, At 362 recommended by RRDI). Avoid excessive nitrogen. Maintain proper plant spacing. Apply fungicides such as Tricyclazole 75% WP or Isoprothiolane as a preventive spray at booting stage when weather is conducive (cool, humid conditions). / රෝගයට ඔරොත්තු දෙන ප්‍රභේද භාවිතා කරන්න. නයිට්‍රජන් පොහොර දීම අවම කරන්න. නිර්දේශිත දිලීර නාශක යොදන්න.',
    },
    {
        name: 'Bacterial Leaf Blight / බැක්ටීරියා කොළ අංගමාරය',
        type: 'Disease',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Water-soaked lesions starting at leaf tips and margins, progressing into long, yellowish-white streaks with wavy edges. Severely infected leaves dry out and turn greyish-white. Bacterial ooze (milky droplets) may be visible on leaf surfaces in early morning. / කොළ අගින් සහ දාරවලින් ආරම්භ වී දිගු කහ පැහැති ඉරි සෑදේ.',
        treatment:
            'Grow resistant varieties recommended by DOA Sri Lanka. Avoid excessive nitrogen fertiliser. Ensure balanced potassium nutrition. Drain fields during early infection. No highly effective chemical control exists — prevention through resistant varieties and field sanitation is the primary strategy. / ප්‍රතිරෝධී ප්‍රභේද වගා කරන්න. නයිට්‍රජන් පොහොර අඩුවෙන් හා පොටෑසියම් අවශ්‍ය පමණට යොදන්න.',
    },
    {
        name: 'Rice Sheath Blight / කොපු දිරායාම',
        type: 'Disease',
        affectedCrops: ['Rice', 'Paddy'],
        symptoms:
            'Oval or irregularly shaped greenish-grey lesions on leaf sheaths near the water line, expanding upwards. Lesions coalesce, causing entire sheaths and leaves to dry out. Under humid conditions, whitish mycelial growth and small round sclerotia are visible on infected tissue. / ජල මට්ටම ආසන්නයේ පිහිටි පත්‍ර කොපු වල අවලංගු හැඩැති අළු හෝ කොළ පැහැති ලප ඇතිවේ.',
        treatment:
            'Avoid excessive nitrogen and dense planting. Maintain recommended plant spacing. Remove floating sclerotia during land preparation. Apply Validamycin 3% SL or Hexaconazole 5% EC at early booting stage. Use silicon-based fertilisers to strengthen cell walls (DOA-recommended integrated approach). / නිසි පරතරයකින් පැළ සිටුවන්න. නයිට්‍රජන් වැඩියෙන් නොදෙන්න. වලංගු දිලීර නාශක යෙදීම.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  COCONUT  (Sources: Coconut Research Institute — cri.gov.lk)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Coconut Rhinoceros Beetle / කුරුමිණියා',
        type: 'Pest',
        affectedCrops: ['Coconut'],
        symptoms:
            'V-shaped cuts and bore holes in unopened fronds; when fronds unfurl they show characteristic wedge-shaped damage. Bore holes in the crown emit chewed fibre. Young palms may die; mature palms show reduced yield and become susceptible to secondary attacks by Red Palm Weevil. / දිග හැරෙමින් පවතින ගොබයේ "V" හැඩයේ කැපුම් දක්නට ලැබේ. කඳේ සිදුරු ඇතිවේ.',
        treatment:
            'Remove and destroy decaying coconut logs and organic matter that serve as breeding sites. Apply Carbofuran 3% granules or Carbosulfan 10% insecticide to leaf axils (CRI recommendation). Use pheromone traps to mass-trap adults. Biological control with the Oryctes virus (OrNV) and the fungus Metarhizium anisopliae is effective. / දිරාගිය කඳන් සහ කාබනික ද්‍රව්‍ය විනාශ කරන්න. කෘමිනාශක සහ පෙරමෝන උගුල් යොදාගන්න.',
    },
    {
        name: 'Red Palm Weevil / රතු කුරුමිණියා',
        type: 'Pest',
        affectedCrops: ['Coconut'],
        symptoms:
            'Wilting and drying of inner whorl leaves. Oozing of brown, foul-smelling fluid from bore holes in the trunk. Crunching sound audible from feeding grubs inside the stem. Crown may topple in advanced infestations. Mostly affects young palms (3–15 years). / කඳේ ඇති කරන සිදුරු වලින් දුඹුරු පැහැති දුගඳැති දියරයක් වහනය වීම සහ ගොබය මැලවී යාම දැකිය හැක.',
        treatment:
            'Prevent wounds on palm trunks; coat all cut surfaces with coal tar. Use pheromone traps (Ferrolure) for monitoring and mass trapping (CRI advisory). Treat infested palms with trunk injection of Monocrotophos 60% SL diluted at 5 ml per litre. Remove and burn severely infested palms to prevent spread. / කඳේ තුවාල වීම් වළක්වා ගන්න. පෙරමෝන උගුල් යොදාගන්න. බලපෑමට ලක් වූ ශාක විනාශ කරන්න.',
    },
    {
        name: 'Coconut Mite / පොල් මයිටාවා',
        type: 'Pest',
        affectedCrops: ['Coconut'],
        symptoms:
            'Triangular, brownish-black, corky patches on the surface of young nuts beneath the perianth. Affected nuts are stunted, misshapen, and produce less copra. Severe infestations cause premature nut fall and reduce overall bunch quality. / ළපටි ගෙඩි මත ත්‍රිකෝණාකාර, දුඹුරු පැහැති, රළු පුල්ලි ඇතිවේ. ගෙඩි විකෘති වී අකාලයේ වැටීම සිදුවේ.',
        treatment:
            'Apply neem oil or sulphur-based acaricides to bunches during early nut development. Encourage the predatory mite Neoseiulus baraki by minimising broad-spectrum pesticide use. Remove and destroy heavily infested bunches. CRI recommends varietal tolerance screening for long-term management. / කොහොඹ තෙල් හෝ සල්ෆර් අඩංගු මයිටා නාශකයක් යොදන්න. දැඩි ලෙස හානි වූ පොදු ඉවත් කරන්න.',
    },
    {
        name: 'Coconut Bud Rot / ගොබය කුණුවීම',
        type: 'Disease',
        affectedCrops: ['Coconut'],
        symptoms:
            'Yellowing and wilting of the youngest (spear) leaf, which easily pulls out. The growing bud becomes soft, emits a foul odour, and turns into a decayed mass. Surrounding leaves progressively droop and fall. The disease is often fatal if not treated early. / ළාතම කරටිය කහ පැහැ වී මැලවී පහසුවෙන් ගැලවී එයි. වර්ධනය වන ගොබය මෘදුවී කුණු වූ දුර්ගන්ධයක් නිකුත් කරයි.',
        treatment:
            'Remove and burn all infected tissue. Apply Bordeaux paste to the cut surface after removing diseased bud. Improve drainage around palms. Preventive spraying with copper-based fungicides (Bordeaux mixture) during wet seasons. Avoid mechanical injury to the crown area (CRI advisory). / ආසාදිත සියලුම කොටස් ඉවත් කර පිළිස්සීම. ಬෝඩෝ මිශ්‍රණය යොදන්න. ජලවහනය සකස් කරන්න.',
    },
    {
        name: 'Weligama Coconut Leaf Wilt Disease / වැලිගම පොල් කොළ මැලවීමේ රෝගය',
        type: 'Disease',
        affectedCrops: ['Coconut'],
        symptoms:
            'Flaccidity and drooping of leaflets, starting from the lower fronds and progressing upward. Yellowing of leaflets with necrotic tips. Reduced nut production and eventual decline of the palm. First reported in the Weligama area of the Southern Province of Sri Lanka. / පහළ අතු වලින් ආරම්භ වී ඉහළට පැතිරෙන කොළ මැලවී කඩාහැලීම. කොළ කහ පැහැ වීම සහ අස්වැන්න අඩුවීම දැකිය හැක.',
        treatment:
            'No curative treatment available. Remove and destroy severely affected palms to reduce inoculum. Apply balanced nutrition (especially potassium and boron) to improve palm vigour. CRI is developing resistant hybrid varieties. Quarantine restrictions apply to prevent spread to unaffected areas. / ස්ථීර පිළියමක් නැත. දැඩි ලෙස හානි වූ ගස් ඉවත් කර විනාශ කරන්න. සමබර පෝෂණයක් අඛණ්ඩව ලබාදෙන්න.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  TEA  (Sources: Tea Research Institute — tri.gov.lk)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Tea Blister Blight / තේ කොළ බිබිලි රෝගය',
        type: 'Disease',
        affectedCrops: ['Tea'],
        symptoms:
            'Small, translucent, light-coloured spots on young leaves that enlarge into blister-like swellings. The underside of blisters develops a velvety white coating of fungal spores (Exobasidium vexans). Affected leaves curl and become distorted. Severe attacks damage new flush, reducing yield and quality. / තරුණ පත්‍ර මත කුඩා, පාරභාසක, ලා පැහැති ලප ඇතිවී ඒවා බිබිලි මෙන් විශාල වේ. බිබිලි වල යට පැත්තේ දිලීර බීජාණු සහිත සුදු පැහැති තුනී පටලයක් ඇතිවේ. දැඩි හානි වලදී නව දළු විනාශ වී අස්වැන්න අඩුවේ.',
        treatment:
            'Pluck affected shoots promptly to reduce spore load. Apply copper-based fungicides (e.g. Copper Oxychloride) or systemic fungicides such as Hexaconazole at 7–10 day intervals during wet weather. Maintain good drainage and air circulation through proper pruning. Use TRI-recommended resistant cultivars where available. / ආසාදිත දළු කඩා ඉවත් කරන්න. තෙතමනය සහිත කාලගුණයකදී තඹ අඩංගු දිලීර නාශක හෝ නිර්දේශිත පද්ධතිමය දිලීර නාශක යොදන්න. නිසි ලෙස කප්පාදුකර හොඳ වාතාශ්‍රයක් පවත්වා ගන්න.',
    },
    {
        name: 'Tea Mosquito Bug / තේ මදුරු කෘමියා',
        type: 'Pest',
        affectedCrops: ['Tea'],
        symptoms:
            'Dark brown to black necrotic spots on young leaves and tender shoots caused by feeding punctures of Helopeltis theivora. Affected shoots dry out and become brittle. Severe infestations cause "die-back" of shoots and heavy crop loss, especially during dry spells in the low-country tea regions of Sri Lanka. / තරුණ පත්‍ර සහ දළු වල තද දුඹුරු හෝ කළු පැහැති පුල්ලි ඇතිවේ. හානියට ලක්වූ දළු වියළී පහසුවෙන් කැඩී යයි. වියළි කාලගුණයේදී දැඩි හානි දැකිය හැක.',
        treatment:
            'Prune to maintain a healthy bush frame; avoid shade tree neglect. Apply recommended insecticides such as Thiamethoxam or Imidacloprid only when pest density exceeds the economic threshold. Encourage natural enemies (predatory bugs and spiders). Follow TRI advisory circulars on spray schedules for the specific elevation zone. / සෞඛ්‍ය සම්පන්න පඳුරක් පවත්වා ගැනීම සඳහා කප්පාදු කරන්න. කෘමි ගහනය ආර්ථික හානි මට්ටම ඉක්මවා ගියහොත් පමණක් නිර්දේශිත කෘමිනාශක යොදන්න.',
    },
    {
        name: 'Tea Shot Hole Borer / තේ කඳ විදින කුරුමිණියා',
        type: 'Pest',
        affectedCrops: ['Tea'],
        symptoms:
            'Tiny, round bore holes (pin-head size) in the main stem and branches caused by the beetle Xyleborus fornicatus. Infested branches become weak, wilted, and may snap off. Sawdust-like frass pushed out from bore holes. Serious in mid-country and low-country tea regions; weakened bushes show reduced flush and dieback. / ප්‍රධාන කඳේ සහ අතු වල කුඩා රවුම් සිදුරු ඇතිවේ. හානියට ලක්වූ අතු දුර්වල වී මැලවී පහසුවෙන් කැඩී යාමට පුළුවන. සිදුරු වලින් ලී කුඩු වැනි ද්‍රව්‍යයක් පිටතට පැමිණේ.',
        treatment:
            'Prune and burn all infested branches below the lowest bore hole. Maintain vigorous bushes through proper fertilisation and shade management. Apply recommended contact insecticides to cut surfaces after pruning to prevent re-infestation. TRI recommends monitoring with ethanol-baited traps in high-risk areas. / කප්පාදු කර හානියට ලක්වූ සියලුම අතු පුළුස්සා දමන්න. නිසි පොහොර සහ සෙවන කළමනාකරණයෙන් ශක්තිමත් පඳුරු පවත්වා ගන්න. පෙරමෝන උගුල් භාවිතයෙන් නිරීක්ෂණය කරන්න.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  RUBBER  (Sources: RRISL — rrisl.gov.lk, sjp.ac.lk, FAO)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'White Root Disease of Rubber / රබර් සුදු මුල් රෝගය',
        type: 'Disease',
        affectedCrops: ['Rubber'],
        symptoms:
            'Off-green to yellowish discolouration of leaves, followed by leathery and buckled foliage. Premature flowering and dieback of the canopy. White, thick mycelial strands of Rigidoporus microporus visible on roots. Reddish-brown bark at the collar region. Characteristic semi-circular fructifications appear at ground level in advanced stages. Fatal within the first 5 years if untreated. / පත්‍ර කහ පැහැයට හැරී ඝන වී කඩා හැලේ. අකාලයේ මල් හටගැනීම සහ වියන වියළී යාම සිදුවේ. මුල් මත ඝන සුදු පැහැති දිලීර ජාලාවන් දැකිය හැක. රෝගය උත්සන්න වී ශාකය මිය යයි.',
        treatment:
            'Remove and destroy all infected root material and adjacent stumps. Apply sulphur to the planting hole before replanting. Use Pueraria phaseoloides as cover crop to suppress pathogen buildup. Biological control using Trichoderma harzianum-based biopesticide developed by RRISL. Conduct regular collar inspections in the first 5 years after planting. / ආසාදිත සියලුම මුල් සහ කොටස් ඉවත් කර විනාශ කරන්න. නැවත වගා කිරීමට පෙර වළට සල්ෆර් යොදන්න. ට්‍රයිකොඩර්මා (Trichoderma) වැවිලි ජෛව පාලන ක්‍රම භාවිතා කරන්න.',
    },
    {
        name: 'Pestalotiopsis Leaf Disease of Rubber / පෙස්ටලෝටියොප්සිස් රබර් කොළ රෝගය',
        type: 'Disease',
        affectedCrops: ['Rubber'],
        symptoms:
            'Circular brown lesions on mature leaves that coalesce into large blighted patches. Leaves turn yellow and defoliate prematurely. Severe cases can reduce latex yield by up to 40%. First emerged in Sri Lanka in July 2019, devastating over 20,000 hectares by 2021 — mainly in Kalutara, Ratnapura, Kegalle, and Galle districts. / මේරූ පත්‍ර මත රවුම් දුඹුරු පැහැති ලප ඇතිවී ඒවා විශාල වී පත්‍ර විනාශ වේ. කොළ කහ පැහැ වී අකාලයේ හැලී යාම නිසා කිරි අස්වැන්න 40% කින් පමණ අඩු විය හැක.',
        treatment:
            'Apply Mancozeb 80% WP or Carbendazim 50% WP as foliar sprays during wet weather. Use RRISL-recommended tolerant clones (RRI100, RRI2006, Centennial 4) for new plantings. Improve air circulation by proper spacing. Follow RRISL fungicide application protocol developed after the 2019 outbreak. / තෙත් කාලගුණික තත්ත්වයන් යටතේ නිර්දේශිත දිලීර නාශක පත්‍ර මත ඉසින්න. නව වගාවන් සඳහා රෝගයට ඔරොත්තු දෙන ක්ලෝන (clones) භාවිතා කරන්න.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  CHILI / VEGETABLES  (Sources: DOA doa.gov.lk, dea.gov.lk)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Chili Anthracnose / මිරිස් ඇන්ත්‍රැක්නෝස් රෝගය',
        type: 'Disease',
        affectedCrops: ['Chili', 'Capsicum', 'Bell Pepper'],
        symptoms:
            'Sunken, circular, dark lesions on ripe and mature green fruits, often with concentric rings. Lesions may coalesce causing extensive fruit rot. Under humid conditions, salmon-pink spore masses appear in the centre of lesions. Caused by Colletotrichum capsici and C. gloeosporioides. / ඉදුණු සහ මේරූ අමු කරල් මත රවුම්, ගිලුණු, තද දුඹුරු පැහැති ලප ඇතිවේ. ලප විශාල වී කරල් කුණුවීම සිදුවේ. තෙත් කාලගුණයේදී ලප මධ්‍යයේ රෝස පැහැති බීජාණු ගොනු දැකිය හැක.',
        treatment:
            'Use certified disease-free seed. Treat seeds with Thiram or Captan before sowing. Apply Mancozeb 80% WP or Carbendazim 50% WP at flowering and fruiting stages. Practise crop rotation (minimum 2 years). Remove and destroy infected fruit debris. Avoid overhead irrigation. / සහතික කළ නිරෝගී බීජ භාවිතා කරන්න. මල් හටගන්නා සහ කරල් සෑදෙන අවධියේදී නිර්දේශිත දිලීර නාශක යොදන්න. ආසාදිත කරල් අස්කර විනාශ කරන්න.',
    },
    {
        name: 'Chili Leaf Curl Complex / මිරිස් කොළ කොඩවීමේ රෝගය',
        type: 'Disease',
        affectedCrops: ['Chili', 'Capsicum'],
        symptoms:
            'Upward curling and puckering of leaves with thickened, leathery texture. Stunted plant growth with shortened internodes giving a bushy appearance. Caused by a begomovirus transmitted by the whitefly Bemisia tabaci. Yield losses can be 50–70% in severe outbreaks in the dry zone of Sri Lanka. / පත්‍ර ඉහළට හැරී ඇකිලී ගොස් ඝන වේ. ශාකයේ වර්ධනය බාල වී පඳුරක් මෙන් දිස්වේ. සුදු මැස්සා මගින් බෝවන වෛරසයක් නිසා මෙය ඇතිවේ.',
        treatment:
            'Control the whitefly vector with yellow sticky traps and neem-based insecticides. Apply systemic insecticides (Imidacloprid) to seedlings before transplanting. Use reflective mulch to repel whiteflies. Remove and destroy infected plants immediately. Grow tolerant varieties where available (DOA recommendations). / කහ පැහැති ඇලෙන සුළු උගුල් සහ කොහොඹ ආශ්‍රිත කෘමිනාශක මගින් සුදු මැස්සන් පාලනය කරන්න. ආසාදිත ශාක වහාම ගලවා විනාශ කරන්න.',
    },
    {
        name: 'Tomato Bacterial Wilt / තක්කාලි බැක්ටීරියා මැලවීමේ රෝගය',
        type: 'Disease',
        affectedCrops: ['Tomato', 'Brinjal', 'Chili', 'Potato'],
        symptoms:
            'Sudden wilting of the entire plant without yellowing of leaves. Lower leaves may droop first. When the stem is cut and placed in water, milky-white bacterial ooze streams out — a diagnostic test. Caused by Ralstonia solanacearum, a soil-borne bacterium highly persistent in wet zone soils of Sri Lanka. / කොළ කහ පැහැ ගැන්වීමකින් තොරව හදිසියේම මුළු ශාකයම මැලවී යාම සිදුවේ. කඳ කපා ජලයේ දැමූ විට සුදු පැහැති බැක්ටීරියා ශ්‍රාවයක් පිටවේ. පසෙහි ජීවත්වන බැක්ටීරියාවක් මගින් මෙය ඇතිවේ.',
        treatment:
            'Use resistant varieties recommended by DOA. Practise crop rotation with non-solanaceous crops (rice, maize) for at least 3 years. Soil solarisation before planting. Apply Trichoderma viride to the planting hole. Avoid waterlogging; ensure good drainage. Remove and destroy infected plants immediately — do not compost them. / රෝගයට ඔරොත්තු දෙන ප්‍රභේද වගා කරන්න. අවම වශයෙන් වසර 3 ක බෝග මාරුවක් කරන්න. ජලය බැසයාම ක්‍රමවත් කරන්න. ආසාදිත ශාක විනාශ කරන්න.',
    },
    {
        name: 'Tomato Late Blight / තක්කාලි ප්‍රමාද අංගමාරය',
        type: 'Disease',
        affectedCrops: ['Tomato', 'Potato'],
        symptoms:
            'Large, irregular, water-soaked, dark brown lesions on leaves, often with a pale green halo. White, cottony fungal growth visible on the underside of leaves during humid mornings. Fruits develop firm, dark, greasy-looking patches. Caused by Phytophthora infestans. Severe in upcountry wet zone areas during the Maha season. / කොළ මත විශාල, අක්‍රමවත්, තද දුඹුරු පැහැති ජලකාමී ලප ඇතිවේ. තෙතමනය සහිත උදෑසනක කොළ යට සුදු පුස් දැකිය හැක. ගෙඩි මත අඳුරු පෙනුමක් ඇති ලප සෑදේ.',
        treatment:
            'Apply Mancozeb 80% WP or Metalaxyl + Mancozeb (Ridomil Gold) preventively before rainy periods. Use raised beds and proper spacing for air circulation. Remove and destroy affected plant parts. Grow DOA-recommended tolerant varieties. Avoid overhead irrigation; use drip irrigation. / වැසි කාලයට පෙර මාන්කොසෙබ් වැනි දිලීර නාශකයක් යොදන්න. හොඳ වාතාශ්‍රයක් සඳහා නිසි පරතරය තබන්න. ඉහළින් ජලය යෙදීමෙන් වළකින්න.',
    },
    {
        name: 'Brinjal Fruit and Shoot Borer / වම්බටු කරල් සහ දළු විදින දළඹුවා',
        type: 'Pest',
        affectedCrops: ['Brinjal', 'Eggplant'],
        symptoms:
            'Larvae of Leucinodes orbonalis bore into tender shoots causing wilting and drooping of growing tips. In fruits, larvae bore inside, leaving entry holes sealed with frass. Infested fruits show internal tunnelling and become unmarketable. Yield losses can exceed 60% in the wet zone of Sri Lanka. / දළඹුවන් ළපටි දළු තුළට විදීම නිසා දළු මැලවී කඩා වැටේ. කරල් ඇතුළට විද අනුභව කිරීම නිසා කරල් පරිභෝජනයට නුසුදුසු වේ. සිදුරු අසල මළපහ දැකිය හැක.',
        treatment:
            'Remove and destroy all wilted shoots and infested fruits weekly. Use pheromone traps for monitoring and mass trapping of adult males. Apply neem-based insecticides (Azadirachtin). Avoid broad-spectrum pesticides to preserve natural enemies (parasitoid wasps). As a last resort, apply Emamectin benzoate 5% SG (DOA-approved). / මැලවී ගිය දළු සහ හානි වූ කරල් සතිපතා ඉවත් කර විනාශ කරන්න. පෙරමෝන උගුල් සහ කොහොඹ ආශ්‍රිත කෘමිනාශක භාවිතා කරන්න.',
    },
    {
        name: 'Okra Yellow Vein Mosaic / බණ්ඩක්කා කහ නහර මොසෙයික් රෝගය',
        type: 'Disease',
        affectedCrops: ['Okra', 'Ladies Finger'],
        symptoms:
            'Bright yellow vein clearing and interveinal yellowing of leaves, creating a net-like mosaic pattern. Severely infected plants are stunted with small, malformed, and tough fruits. Caused by a begomovirus transmitted by the whitefly Bemisia tabaci. Can cause total crop loss in susceptible varieties. / කොළ වල නහර කහ පැහැ වී දැල් වැනි රටාවක් ඇතිවේ. ශාකයේ වර්ධනය බාල වී කරල් කුඩා, විකෘති සහ දෘඩ වේ. මෙය සුදු මැස්සා මගින් බෝවන රෝගයකි.',
        treatment:
            'Grow resistant/tolerant varieties (e.g. MI-5, MI-7 recommended by DOA Sri Lanka). Control whitefly vectors using yellow sticky traps and neem oil. Apply Imidacloprid as a seed treatment or soil drench at transplanting. Use silver-coloured reflective mulch to repel whiteflies. Uproot and destroy infected plants immediately. / රෝගයට ඔරොත්තු දෙන ප්‍රභේද වගා කරන්න. කහ පැහැති උගුල් සහ කොහොඹ තෙල් මගින් සුදු මැස්සන් පාලනය කරන්න. ආසාදිත ශාක ගලවා විනාශ කරන්න.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  BANANA  (Sources: DOA doa.gov.lk, harti.gov.lk)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Banana Bunchy Top Virus / කෙසෙල් පරඬැල් රෝගය',
        type: 'Disease',
        affectedCrops: ['Banana'],
        symptoms:
            'Dark green "dot-dash" streaks along the leaf midrib and petiole veins (Morse-code pattern). Leaves become progressively narrower, shorter, and erect with wavy, chlorotic margins, giving a "bunchy top" rosette appearance. Infected plants rarely produce fruit. Spread by the banana aphid (Pentalonia nigronervosa). / කොළ නාරටි වල තද කොළ පැහැති තිත් සහ ඉරි දැකිය හැක. කොළ කුඩා වී, එකට එක් වී කොඩවී ඉහළට විහිදී "මිටියක්" මෙන් දිස්වේ. කුඩිත්තන් මගින් රෝගය පැතිරේ.',
        treatment:
            'Use only virus-free planting material from certified tissue culture labs. Rogue and destroy infected plants immediately by injecting with herbicide (Glyphosate) before uprooting to kill the aphid vector. Control banana aphids with Imidacloprid. Maintain a 10 m quarantine zone around affected areas. / පටක රෝපිත නිරෝගී පැළ භාවිතා කරන්න. ආසාදිත ගස් වහාම ගලවා විනාශ කරන්න. කුඩිත්තන් මර්ධනයට කෘමිනාශක යොදන්න.',
    },
    {
        name: 'Banana Weevil Borer / කෙසෙල් කඳ විදින කුරුමිණියා',
        type: 'Pest',
        affectedCrops: ['Banana', 'Plantain'],
        symptoms:
            'Tunnelling in the corm by larvae (Cosmopolites sordidus) causing weakened root anchorage — plants topple easily in wind ("snapping"). Reduced bunch weight and delayed maturity. Entry holes visible at the base of the pseudostem with dark frass. Infested corms show extensive brownish tunnels when cut open. / දළඹුවන් විසින් කෙසෙල් අලයේ සිදුරු සාදා අනුභව කිරීම නිසා ගස දුර්වල වී සුළඟට පහසුවෙන් කඩා වැටේ. කඳේ පාදමේ සිදුරු සහ මළපහ දැකිය හැක. අස්වැන්න අඩුවේ.',
        treatment:
            'Use clean, pest-free planting material; pare corms and dip in Chlorpyrifos solution before planting. Place pseudostem disc traps (split-trap method) in the field to attract and collect adult weevils. Apply Beauveria bassiana (biological control) to the soil around the base. Practise crop rotation and field sanitation. / පිරිසිදු නිරෝගී මොරෙයියන් භාවිතා කරන්න. කෙසෙල් කඳන් කපා උගුල් ලෙස තබා කුරුමිණියන් අල්ලා විනාශ කරන්න. වගා භූමිය පිරිසිදුව තබා ගන්න.',
    },
    {
        name: 'Panama Disease (Fusarium Wilt of Banana) / පැනමා රෝගය (කෙසෙල් මැලවීමේ රෝගය)',
        type: 'Disease',
        affectedCrops: ['Banana'],
        symptoms:
            'Yellowing and wilting of older leaves, starting from the margins and progressing inward. Leaves collapse and hang around the pseudostem like a skirt. Splitting of the pseudostem base reveals dark brown to reddish vascular discolouration. Caused by Fusarium oxysporum f.sp. cubense, a persistent soil-borne fungus. / පරණ කොළ සහ වාටිය කහ පැහැ වී මැලවී යයි. කොළ පහළට කඩා හැලී කඳ වටා සායක් මෙන් එල්ලී පවතී. කඳ මැද දුඹුරු හෝ රතු පැහැති පැල්ලම් දැකිය හැක. පසෙන් බෝවන දිලීරයකි.',
        treatment:
            'Use disease-free tissue culture planting material. Avoid planting in previously infested soil. Practise crop rotation with non-host crops for at least 5 years. Apply Trichoderma-based biofungicides to planting holes. There is no effective chemical cure — prevention and resistant varieties (e.g. FHIA hybrids) are the primary strategy. / පටක රෝපිත නිරෝගී පැළ භාවිතා කරන්න. රෝගය පැවති පසෙහි නැවත වගා කිරීමෙන් වළකින්න. ට්‍රයිකොඩර්මා (Trichoderma) ජෛව දිලීර නාශක යොදන්න.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  CINNAMON  (Sources: dea.gov.lk, cinnamon.gov.lk)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Cinnamon Rough Bark Disease / කුරුඳු රළු පොත්ත රෝගය',
        type: 'Disease',
        affectedCrops: ['Cinnamon'],
        symptoms:
            'Brown spots appear on young shoots that gradually spread, causing the immature bark to become coarse and rough-textured. Peeling becomes difficult, reducing the quality of processed cinnamon quills. Caused by Phomopsis spp. and other fungi (Pestalotiopsis, Colletotrichum). Common in nearly all cinnamon-growing areas of Sri Lanka. / තරුණ දළු මත දුඹුරු ලප ඇතිවී ඒවා ක්‍රමයෙන් පැතිරී ළපටි පොත්ත රළු වේ. මේ නිසා පොත්ත ගැලවීමට අපහසු වන අතර කුරුඳු කූරුවල ගුණාත්මකභාවය අඩුවේ. දිලීර මගින් මෙය ඇතිවේ.',
        treatment:
            'Prune and destroy infected shoots before the disease spreads. Apply Mancozeb 80% WP or Copper Oxychloride as a foliar spray during rainy periods. Maintain good spacing and air circulation in plantations. Avoid wounding stems during harvesting. Follow DEA guidelines on disease-free planting material. / රෝගය පැතිරීමට පෙර ආසාදිත දළු කපා විනාශ කරන්න. වැසි කාලයේදී දිලීර නාශකයක් ඉසින්න. අස්වනු නෙළීමේදී කඳ තුවාල වීමෙන් වළකින්න.',
    },
    {
        name: 'Cinnamon Pink Stem Borer / කුරුඳු රෝස කඳ විදින දළඹුවා',
        type: 'Pest',
        affectedCrops: ['Cinnamon'],
        symptoms:
            'Larvae of Ichneumoniptera cinnamomumi burrow into the base of cinnamon stems, causing shoots to wilt and eventually fall off. Entry holes visible near the base with frass. The base decays over time, killing the entire shoot. Considered the most destructive pest of cinnamon in Sri Lanka. / දළඹුවන් කුරුඳු කඳේ පාදමට විදීම නිසා දළු මැලවී කඩා වැටේ. පාදම අසල සිදුරු හා මළපහ දැකිය හැක. කඳේ පාදම දිරාපත් වී මුළු ශාකයම මිය යාමට පුළුවන.',
        treatment:
            'Remove and destroy infested stems below the bore hole. Apply contact insecticides to the base of plants during peak adult emergence (rainy season). Keep the plantation floor clean to reduce pupation sites. Use trap crops or light traps for monitoring adult moths. Follow DEA and National Cinnamon Research Centre recommendations. / කඳ විද ඇති ස්ථානයට පහළින් කඳ කපා විනාශ කරන්න. වැසි කාලයේදී කෘමිනාශකයක් කඳේ පාදමට යොදන්න. වගා භූමිය පිරිසිදුව තබා ගන්න.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  PEPPER  (Sources: dea.gov.lk, Department of Export Agriculture)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Pepper Quick Wilt / ගම්මිරිස් ඉක්මන් මැලවීමේ රෝගය',
        type: 'Disease',
        affectedCrops: ['Black Pepper', 'Pepper'],
        symptoms:
            'Rapid wilting and drying of pepper vines within 2–3 weeks. Leaves turn yellow, droop, and fall. Roots and root collar show dark brown to black rot when examined. Caused by Phytophthora capsici, which attacks the root system. Particularly severe during hot, dry spells followed by sudden rainfall in the mid-country. / සති 2-3 ක් ඇතුළත ගම්මිරිස් වැල වේගයෙන් මැලවී වියළී යයි. කොළ කහ පැහැ වී කඩා හැලේ. මුල් සහ කඳේ පාදම දුඹුරු හෝ කළු පැහැ වී කුණුවීමක් දැකිය හැක.',
        treatment:
            'Improve drainage around vine bases. Apply Metalaxyl + Mancozeb (Ridomil Gold) as a soil drench at the onset of monsoon. Apply Trichoderma-based bioagents to the root zone. Avoid injuring roots during weeding. Use pepper varieties with field tolerance (e.g. Panniyur selections). Follow DEA alert circulars on Quick Wilt management. / ශාකය අවට ජලය බැසයාම ක්‍රමවත් කරන්න. වැසි කාලය ආරම්භයේදී නිර්දේශිත දිලීර නාශක පසට යොදන්න. වල් නෙළීමේදී මුල් වලට හානි වීමෙන් වළකින්න.',
    },
    {
        name: 'Pepper Pollu Beetle / ගම්මිරිස් පොල්ලු කුරුමිණියා',
        type: 'Pest',
        affectedCrops: ['Black Pepper', 'Pepper'],
        symptoms:
            'Small black beetles (Longitarsus nigripennis) feed on developing pepper spikes, causing flowers and immature berries to drop. Spike damage leads to "hollow" or "pinhead" berries with no pungency. Severe during flowering season; losses can reach 30–40% in neglected plantations. / කුඩා කළු පැහැති කුරුමිණියන් වර්ධනය වන ගම්මිරිස් කරල් විදීම නිසා මල් සහ ගැට හැලී යයි. මෙහිදී හිස් හෝ කුඩා බෙරි හටගන්නා අතර ඒවායේ සැර ගතියක් නොමැත.',
        treatment:
            'Spray Quinalphos 25% EC or neem-based insecticides during early spike emergence. Apply two rounds of spray — first at spike initiation and second at berry formation. Maintain clean plantation floor to reduce pupation habitat. Follow DEA recommended spray schedule for the specific agro-ecological zone. / කරල් හටගන්නා මුල් අවධියේදී ක්විනල්ෆොස් හෝ කොහොඹ ආශ්‍රිත කෘමිනාශක ඉසින්න. කෘමිනාශක වට දෙකක් පමණ යෙදිය යුතුය.',
    },

    // ═══════════════════════════════════════════════════════════════
    //  CARDAMOM  (Sources: dea.gov.lk, vikaspedia.in)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Cardamom Thrips / එනසාල් පැළ මැක්කා',
        type: 'Pest',
        affectedCrops: ['Cardamom'],
        symptoms:
            'Feeding damage by Sciothrips cardamomi on panicles, flowers, and young capsules. Capsules develop a scabby, rough, and discoloured surface. Severe damage causes premature flower drop, stunted capsules, and empty pods with no market value. Most destructive pest of cardamom in Sri Lanka. / පැළ මැක්කන් විසින් මල් සහ ළපටි කරල් වලට හානි කිරීම නිසා කරල් මතුපිට රළු, කොරපොතු සහිත වී විකෘති වේ. මල් අකාලයේ හැලී යාම සහ හිස් කරල් හටගැනීම සිදුවේ.',
        treatment:
            'Remove dried leaves and debris from the base of plants to reduce thrips refugia. Apply Dimethoate 30% EC or neem oil at early flowering stage. Use overhead micro-sprinklers during dry periods to create unfavourable conditions for thrips. Follow DEA integrated management guidelines for cardamom. / ශාක පාමුල ඇති වියළි කොළ සහ කුණු ඉවත් කරන්න. මල් පිපෙන මුල් අවධියේදී නිර්දේශිත කෘමිනාශක හෝ කොහොඹ තෙල් යොදන්න. වියළි කාලයේදී ජලය ඉසින්න.',
    },
    {
        name: 'Cardamom Capsule Rot (Azhukal) / එනසාල් කරල් කුණුවීමේ රෝගය',
        type: 'Disease',
        affectedCrops: ['Cardamom'],
        symptoms:
            'Water-soaked lesions on young capsules that enlarge and turn dark brown to black. Infected capsules rot and emit a foul smell. The disease caused by Phytophthora spp. thrives during the southwest monsoon in poorly drained, shaded plantations. Can lead to total loss of the harvest in severely affected fields. / තරුණ කරල් මත ජලකාමී ලප ඇතිවී ඒවා විශාල වී තද දුඹුරු හෝ කළු පැහැයට හැරේ. ආසාදිත කරල් කුණු වී දුගඳක් හමයි. තෙත් සහ අධික සෙවන සහිත ස්ථානවල මෙය බහුලව දක්නට ලැබේ.',
        treatment:
            'Improve drainage in the plantation. Apply 1% Bordeaux mixture or Potassium Phosphonate as a preventive spray before the monsoon. Remove and destroy all infected capsules and debris. Maintain proper shade levels (not too dense). Follow DEA advisory on Phytophthora management in spice crops. / වගාවේ ජලවහනය දියුණු කරන්න. මෝසම් වැසි වලට පෙර 1% බෝඩෝ මිශ්‍රණයක් වැනි දිලීර නාශකයක් ඉසින්න. ආසාදිත කරල් ඉවත් කර විනාශ කරන්න.',
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
