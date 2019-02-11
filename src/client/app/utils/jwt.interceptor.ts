
    import axios from "axios";
    export default class JWTInterceptor {
    constructor() {
        axios.interceptors.request.use((config) => {
            // add authorization header with jwt token if available
            const token = localStorage.getItem('jwt');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));

        axios.interceptors.response.use((response) => {
            console.log(response.headers);
            if (response.headers['x-access-token']) {
                const token = response.headers['x-access-token'];
                localStorage.setItem('jwt', token);
            }
            return response;
        }, (error) => Promise.reject(error));
    }
}