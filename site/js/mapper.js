
var systemsByRegionURL = 'http://localhost:5000/systemdetails/region/' 

async function fetchSystemsByRegionId(region_id) {
    try {
        const response = await fetch(systemsByRegionURL + region_id);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}