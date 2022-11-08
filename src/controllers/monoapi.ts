
import axios from 'axios'

const BASE_API_URL = 'https://api.withmono.com'


const bankUrl = `${BASE_API_URL}/v1/institutions`;

export const getAllBanksNG = async () => {
  try {
    const response = await axios.get(bankUrl);
  
  return response;
  } catch (error) {
return(error)
  }
};
