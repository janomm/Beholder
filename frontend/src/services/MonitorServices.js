import axios from './BaseServices';

const API_URL = process.env.REACT_APP_API_URL;
const MONITORS_URL = `${API_URL}/monitors/`;

export async function getMonitors(page, token) {
    const monitorsUrs = `${MONITORS_URL}?page=${page}`
    const headers = { 'authorization': token }
    const response = await axios.get(monitorsUrs, { headers });
    return response.data;
}

export async function saveMonitor(id, newMonitor, token) {
    const headers = { 'authorization': token }
    let response;
    if (id)
        response = await axios.patch(`${MONITORS_URL}${id}`, newMonitor, { headers });
    else
        response = await axios.post(MONITORS_URL, newMonitor, { headers });

    return response.data;
}

export async function startMonitor(id, token) {
    const headers = { 'authorization': token }
    const response = await axios.post(`${MONITORS_URL}${id}/start`, {}, { headers });
    return response.data;
}

export async function stopMonitor(id, token) {
    const headers = { 'authorization': token }
    const response = await axios.post(`${MONITORS_URL}${id}/stop`, {}, { headers });
    return response.data;
}

export async function deleteMonitor(id, token) {
    const headers = { 'authorization': token }
    const response = await axios.delete(`${MONITORS_URL}${id}`, { headers });
    return response.data;
} 
