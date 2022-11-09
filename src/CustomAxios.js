import axios from 'axios';

const api = axios.create({
    headers: {
        Authorization: `Bearer ${sessionStorage.getItem("_JWT_TOKEN")}`,
    }
});
export default api;