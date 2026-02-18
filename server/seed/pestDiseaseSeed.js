/**
 * Pest & Disease Seed Script - Sri Lankan Agriculture
 * Sources: DOA Sri Lanka (doa.gov.lk), RRDI
 */
require('dotenv').config();
const mongoose = require('mongoose');
const PestDisease = require('../models/PestDisease');

const seedData = [
  {
    name: 'Brown Planthopper',
    type: 'Pest',
    affectedCrops: ['Rice', 'Paddy'],
    symptoms: 'Yellowing of lower leaves progressing to hopper burn - circular patches of dried, brown plants in the field. Plants wilt and die in severe infestations. Honeydew excretion leads to sooty mould on leaf surfaces.',
    treatment: 'Avoid excessive nitrogen fertiliser. Use resistant rice varieties recommended by DOA Sri Lanka (e.g. Bg 379-2). Apply targeted insecticides only when populations exceed the economic threshold (10-15 per hill). Encourage natural predators such as spiders and Cyrtorhinus lividipennis.',
  },
  {
    name: 'Yellow Stem Borer',
    type: 'Pest',
    affectedCrops: ['Rice', 'Paddy'],
    symptoms: 'Dead heart in the vegetative stage - the central shoot turns brown and can be pulled out easily. White ear in the reproductive stage - panicles turn white and bear no grain. Bore holes visible at the stem base with frass inside.',
    treatment: 'Clip and destroy egg masses during transplanting. Harvest at ground level and plough in stubble to destroy overwintering larvae. Use pheromone traps for monitoring. Apply Carbofuran 3G granules in the leaf whorl when damage exceeds 5% dead hearts (DOA recommendation).',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await PestDisease.deleteMany({});
    const inserted = await PestDisease.insertMany(seedData);
    console.log('Seeded ' + inserted.length + ' records');
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}
seed();