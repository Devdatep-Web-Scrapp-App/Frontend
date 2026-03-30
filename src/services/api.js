const BASE = 'http://localhost:8000'

function getToken() {
    return localStorage.getItem('sp_token')
}

async function request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' }
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    })

    if (res.status === 401) {
        localStorage.removeItem('sp_token')
        localStorage.removeItem('sp_auth')
        window.location.href = '/login'
        return
    }

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Error desconocido')
    return data
}

// Auth
export const authAPI = {
    login: (email, password) => {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        return fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString(),
        }).then(async res => {
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Error desconocido')
            return data
        })
    },
    register: (email, password, full_name) => request('POST', '/auth/register', { email, password, full_name }),
}

// Settings
export const settingsAPI = {
    connectInstagram: (username) => request('PUT', '/settings/connect-instagram', { username }),
    disconnectInstagram: ()         => request('PUT', '/settings/disconnect-instagram'),
    connectTiktok:    (username) => request('PUT', '/settings/connect-tiktok',    { username }),
    updateProfile:    (full_name) => request('PUT', '/settings/update-profile',    { full_name }),
    changePassword:   (current_password, new_password) => request('PUT', '/settings/change-password', { current_password, new_password }),
}

// Scraper
export const scraperAPI = {
    setupInstagram: () => request('POST', '/scraper/setup-instagram'),
    runInstagram:   () => request('POST', '/scraper/run-instagram'),
    statusInstagram: () => request('GET',  '/scraper/status-instagram'),
}

// Stats
export const statsAPI = {
    igFollowers: () => request('GET', '/stats/instagram/followers'),
    igLost:      () => request('GET', '/stats/instagram/lost'),
    history:     () => request('GET', '/stats/history'),
}