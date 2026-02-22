// Sri Lanka Agro-Ecological Zones
// Sources:
//   - Department of Agriculture, Sri Lanka (https://doa.gov.lk)
//   - FAO Country Profile (https://www.fao.org/faostat/en/#country/38)
//   - Wikipedia: Agriculture in Sri Lanka

export const ZONES = [
    {
        id: 'wet',
        name: 'Wet Zone',
        sinhalaName: 'තෙත් කලාපය',
        emoji: '🌧️',
        rainfall: '> 2,500 mm/year',
        color: '#2ecc71',
        description: 'The south-western region and central highlands. Receives consistent rainfall year-round with no prolonged dry periods.',
        districts: [
            'Colombo',
            'Gampaha',
            'Kalutara',
            'Galle',
            'Matara',
            'Ratnapura',
            'Kegalle',
            'Kandy',
            'Nuwara Eliya',
        ],
    },
    {
        id: 'dry',
        name: 'Dry Zone',
        sinhalaName: 'වියළි කලාපය',
        emoji: '☀️',
        rainfall: '< 1,750 mm/year',
        color: '#e67e22',
        description: 'The northern, eastern, and south-eastern lowlands. Marked by a distinct dry season from May to September.',
        districts: [
            'Anuradhapura',
            'Polonnaruwa',
            'Jaffna',
            'Kilinochchi',
            'Mullaitivu',
            'Mannar',
            'Vavuniya',
            'Puttalam',
            'Hambantota',
            'Trincomalee',
            'Batticaloa',
            'Ampara',
        ],
    },
    {
        id: 'intermediate',
        name: 'Intermediate Zone',
        sinhalaName: 'අතරමැදි කලාපය',
        emoji: '🌤️',
        rainfall: '1,750 – 2,500 mm/year',
        color: '#3498db',
        description: 'A transitional belt between Wet and Dry zones. Shorter dry season, suitable for diverse multi-crop farming.',
        districts: [
            'Kurunegala',
            'Matale',
            'Badulla',
            'Monaragala',
        ],
    },
];

// Helper: find zone by district name
export const getZoneByDistrict = (districtName) => {
    return ZONES.find(zone =>
        zone.districts.some(d => d.toLowerCase() === districtName.toLowerCase())
    );
};

// Helper: get all districts as a flat list
export const getAllDistricts = () => {
    return ZONES.flatMap(zone =>
        zone.districts.map(d => ({ name: d, zoneId: zone.id, zoneName: zone.name }))
    ).sort((a, b) => a.name.localeCompare(b.name));
};
