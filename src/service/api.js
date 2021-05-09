const API = 'http://localhost:5555';

const listLogEntries = async() => {
    const response = await fetch(`${API}/api/logs`);
    return response.json();
};

const createLogEntry = async (data) => {
    const response = await fetch(`${API}/api/logs`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

export default {
    listLogEntries,
    createLogEntry
};