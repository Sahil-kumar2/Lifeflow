const mongoose = require('mongoose');
const { User } = require('../models');

const ensureGeoIndex = async () => {
    try {
        console.log("Checking for geospatial index on the 'users' collection...");
        
        // This command directly tells the database to create the index
        await User.collection.createIndex({ location: "2dsphere" });

        console.log("SUCCESS: Geospatial index is present or was successfully created.");
    } catch (error) {
        console.error("ERROR: Failed to create geospatial index.", error);
        // We will exit the process if the index can't be created, as the app cannot function without it.
        process.exit(1);
    }
};

module.exports = ensureGeoIndex;
