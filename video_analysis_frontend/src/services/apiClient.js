import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;


const apiClientInstance = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor
apiClientInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const get = async (url, params = {}, config = {}) => {
  return apiClientInstance.get(url, { params, ...config }).then((res) => res.data);
};

const post = async (url, body = {}, config = {}) => {
  return apiClientInstance.post(url, body, { ...config }).then((res) => res.data);
};

const postFile = async (url, file, body = {}, config = {}) => {
  const formData = new FormData();

  formData.append("file", file);

  for (const key in body) {
    formData.append(key, body[key]);
  }

  return apiClientInstance
    .post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

const postFiles = async (url, files, body = {}, config = {}) => {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  for (const key in body) {
    formData.append(key, body[key]);
  }

  return apiClientInstance
    .post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

const put = async (url, body = {}, config = {}) => {
  return apiClientInstance.put(url, body, { ...config }).then((res) => res.data);
};

const del = async (url, body = {}, config = {}) => {
  return apiClientInstance
    .request({ method: "delete", url, data: body, ...config })
    .then((res) => res.data);
};

const apiClient = {
  get,
  post,
  put,
  delete: del,
  postFile,
  postFiles,
};

export default apiClient;
