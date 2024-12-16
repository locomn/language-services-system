require('dotenv').config();
const mongoose = require('mongoose');
const ServiceLocation = require('../models/ServiceLocation');

const sampleLocations = [
    // Fairview Locations
    {
        version: 1,
        organizationId: 3,
        organizationName: "Fairview",
        name: "FV Eagan Clinic",
        addressLine1: "3305 Central Park Village Drive",
        city: "Eagan",
        state: "MN",
        zip: "551217707",
        phone: "6514068860",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    {
        version: 1,
        organizationId: 3,
        organizationName: "Fairview",
        name: "Fairview Southdale Hospital",
        addressLine1: "6401 France Ave. S.",
        city: "Edina",
        state: "MN",
        zip: "554352104",
        phone: "9529245000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    {
        version: 1,
        organizationId: 3,
        organizationName: "Fairview",
        name: "Fairview Ridges Hospital",
        addressLine1: "201 E. Nicollet Blvd",
        city: "Burnsville",
        state: "MN",
        zip: "55337",
        phone: "9528922000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    // HealthPartners Locations
    {
        version: 1,
        organizationId: 5,
        organizationName: "HealthPartners",
        name: "HP Como Clinic",
        addressLine1: "2500 Como Ave",
        city: "St Paul",
        state: "MN",
        zip: "55108",
        phone: "9525238700",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    {
        version: 1,
        organizationId: 5,
        organizationName: "HealthPartners",
        name: "HP St Paul Clinic",
        addressLine1: "205 Wabasha Street S",
        city: "St Paul",
        state: "MN",
        zip: "55107",
        phone: "9525238700",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    // Allina Locations
    {
        version: 1,
        organizationId: 1,
        organizationName: "Allina",
        name: "Abbott Northwestern Hospital",
        addressLine1: "800 E 28th St",
        city: "Minneapolis",
        state: "MN",
        zip: "55407",
        phone: "6128635000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    {
        version: 1,
        organizationId: 1,
        organizationName: "Allina",
        name: "United Hospital",
        addressLine1: "333 Smith Ave N",
        city: "St Paul",
        state: "MN",
        zip: "55102",
        phone: "6512417000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    // Children's Hospital Locations
    {
        version: 1,
        organizationId: 8,
        organizationName: "Children's Hospital and Clinics of Minnesota",
        name: "Children's Minnesota Minneapolis",
        addressLine1: "2525 Chicago Avenue S",
        city: "Minneapolis",
        state: "MN",
        zip: "55404",
        phone: "6128138000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    {
        version: 1,
        organizationId: 8,
        organizationName: "Children's Hospital and Clinics of Minnesota",
        name: "Children's Minnesota St. Paul",
        addressLine1: "345 Smith Avenue N",
        city: "St Paul",
        state: "MN",
        zip: "55102",
        phone: "6512207000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    // Park Nicollet Locations
    {
        version: 1,
        organizationId: 20,
        organizationName: "Park Nicollet",
        name: "Methodist Hospital",
        addressLine1: "6500 Excelsior Blvd",
        city: "St Louis Park",
        state: "MN",
        zip: "55426",
        phone: "9529932000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    // North Memorial Locations
    {
        version: 1,
        organizationId: 23,
        organizationName: "North Memorial Health Care",
        name: "North Memorial Medical Center",
        addressLine1: "3300 Oakdale Ave N",
        city: "Robbinsdale",
        state: "MN",
        zip: "55422",
        phone: "7635205000",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    },
    // M Health Fairview Locations
    {
        version: 1,
        organizationId: 2,
        organizationName: "University of Minnesota Physicians",
        name: "M Health Fairview University of Minnesota Medical Center",
        addressLine1: "2450 Riverside Ave",
        city: "Minneapolis",
        state: "MN",
        zip: "55454",
        phone: "6122736600",
        active: true,
        interpretersCanAcceptAppts: true,
        appointmentConfirmation: "MA"
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing locations
        await ServiceLocation.deleteMany({});
        console.log('Cleared existing locations');

        // Insert sample locations
        await ServiceLocation.insertMany(sampleLocations);
        console.log('Sample locations inserted');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
