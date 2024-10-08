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
    const regex = /^(\d+([,.]\d+)?)$/;

    if (typeof newOrderTemplate.quantityMultiplier === 'string' && regex.test(newOrderTemplate.quantityMultiplier))
        newOrderTemplate.quantityMultiplier = parseFloat(newOrderTemplate.quantityMultiplier.replace(',', '.'));

    if (typeof newOrderTemplate.icebergQtyMultiplier === 'string' && regex.test(newOrderTemplate.icebergQtyMultiplier))
        newOrderTemplate.icebergQtyMultiplier = parseFloat(newOrderTemplate.icebergQtyMultiplier.replace(',', '.'));

    if (typeof newOrderTemplate.limitPriceMultiplier === 'string' && regex.test(newOrderTemplate.limitPriceMultiplier))
        newOrderTemplate.limitPriceMultiplier = parseFloat(newOrderTemplate.limitPriceMultiplier.replace(',', '.'));

    if (typeof newOrderTemplate.stopPriceMultiplier === 'string' && regex.test(newOrderTemplate.stopPriceMultiplier))
        newOrderTemplate.stopPriceMultiplier = parseFloat(newOrderTemplate.stopPriceMultiplier.replace(',', '.'));

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