import axios from "axios"

const {VITE_ENV,VITE_LOCAL_URL,VITE_WEB_URL} = import.meta.env
// console.log(VITE_ENV)

const BASE_URL = VITE_ENV==="local"?`${VITE_LOCAL_URL}/api/auth`:`${VITE_WEB_URL}/api/auth`



export const signup = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during signup:', error.response?.data || error.message);
    throw error;
  }
};


export const login = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, credentials, {
    withCredentials:true
    });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    throw error;
  }
};


export const verifyUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user/verif`,{
      headers: {
        'Authorization': `Bearer ${localStorage?.getItem("token")}`
    },
      withCredentials:true
    });
    return response.data;
    
  } catch (error) {
    console.error('Error during user verification:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/user/logout`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        withCredentials: true  // Moved inside the main options object
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error during logout:', error.response?.data || error.message);
    throw error;
  }
};
