import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export async function getSymbols(token) {
    const symbolsUrl = `${API_URL}/symbols`;
    const headers = {
        'authorization': token
    }
    const response = await axios.get(symbolsUrl, { headers });
    return response.data;
}

export async function getSymbol(symbol, token) {
    const symbolUrl = `${API_URL}/symbols/${symbol}`;
    const headers = {
        'authorization': token
    }
    const response = await axios.get(symbolUrl, { headers });
    return response.data;
}

export async function updateSymbol(symbol, token) {
    const symbolUrl = `${API_URL}/symbols/${symbol.symbol}`;
    const headers = {
        'authorization': token
    }
    const response = await axios.patch(symbolUrl, symbol, { headers });
    return response.data;
}

export async function syncSymbols(token) {
    const symbolsUrl = `${API_URL}/symbols/sync`;
    const headers = {
        'authorization': token
    }
    const response = await axios.post(symbolsUrl, {}, { headers });
    return response.data;
}
