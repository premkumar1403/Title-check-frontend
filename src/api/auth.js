import axios from 'axios'

const API=import.meta.env.VITE_REACT_APP_LOCAL_URI;


const authAxios = axios.create({
  baseURL: API,
  withCredentials:true
}); 

export default authAxios;