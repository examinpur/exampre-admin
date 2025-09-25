import axios from 'axios';

let stateOptions = [];

export const fetchStateOptions = async () => {
  try {
    const response = await axios.get('https://timesavor-server.onrender.com/api/business/getCityState');
    const data = response.data.cityStates;

    stateOptions = data.map(state => ({
      name: state.state,
      regions: state.regions.map(region => ({
        name: region.name,
        subRegions: region.subRegions,
      })),
    }));

    console.log("State options fetched successfully:", stateOptions);
  } catch (error) {
    console.error("Error fetching state options:", error);
  }
};

// Helper function to get all state names
export const getAllStateNames = () => stateOptions.map(state => state.name);

// Helper function to get regions for a specific state
export const getRegionsForState = (stateName) => {
  const state = stateOptions.find(s => s.name === stateName);
  return state ? state.regions.map(region => region.name) : [];
};

// Helper function to get sub-regions for a specific state and region
export const getSubRegionsForStateAndRegion = (stateName, regionName) => {
  const state = stateOptions.find(s => s.name === stateName);
  if (state) {
    const region = state.regions.find(r => r.name === regionName);
    return region && region.subRegions.length > 0 ? region.subRegions : null;
  }
  return null;
};
