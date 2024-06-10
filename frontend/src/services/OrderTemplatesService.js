import axios from './BaseServices';

const API_URL = process.env.REACT_APP_API_URL;
const ORDER_TEMPLATES_URL = `${API_URL}/ordertemplates/`;

export async function getOrderTemplates(symbol, page, token) {
    const orderTemplatesUrl = `${ORDER_TEMPLATES_URL}${symbol}?page=${page}`;
    const headers = { 'authorization': token }
    const response = await axios.get(orderTemplatesUrl, { headers });
    return response.data; // { count, rows }
}

export async function saveOrderTemplate(id, newOrderTemplate, token) {
    const headers = { 'authorization': token }
    let response;
    if (id)
        response = await axios.patch(`${ORDER_TEMPLATES_URL}${id}`, newOrderTemplate, { headers });
    else
        response = await axios.post(ORDER_TEMPLATES_URL, newOrderTemplate, { headers });

    return response.data;
}

export async function deleteOrderTemplate(id, token) {
    const headers = { 'authorization': token }
    const response = await axios.delete(`${ORDER_TEMPLATES_URL}${id}`, { headers });
    return response.data;
}