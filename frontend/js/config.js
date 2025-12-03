// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
const API_ENDPOINTS = {
    // Uçuş endpoints
    ucusAra: `${API_BASE_URL}/ucuslar/ara`,
    ucusAlternatifTarihler: `${API_BASE_URL}/ucuslar/ara/alternatif-tarihler`,
    ucusDetay: (ucus_id) => `${API_BASE_URL}/ucuslar/${ucus_id}`,
    koltuklar: (ucus_id) => `${API_BASE_URL}/ucuslar/${ucus_id}/koltuklar`,
    
    // Bilet endpoints
    biletRezervasyonu: `${API_BASE_URL}/biletler/rezervasyon`,
    biletSatinAl: `${API_BASE_URL}/biletler/satin-al`,
    biletIptal: (bilet_id) => `${API_BASE_URL}/biletler/iptal/${bilet_id}`,
    kullaniciBiletler: (kullanici_id) => `${API_BASE_URL}/biletler/kullanici/${kullanici_id}`,
    biletDetay: (bilet_id) => `${API_BASE_URL}/biletler/${bilet_id}`,
    
    // Kullanıcı endpoints
    kullaniciKayit: `${API_BASE_URL}/kullanicilar/kayit`,
    kullaniciGiris: `${API_BASE_URL}/kullanicilar/giris`,
    kullaniciProfil: (kullanici_id) => `${API_BASE_URL}/kullanicilar/${kullanici_id}`,
    kullaniciGuncelle: (kullanici_id) => `${API_BASE_URL}/kullanicilar/${kullanici_id}`,
    
    // Havalimanı endpoints
    havalimanlar: `${API_BASE_URL}/havalimanlar`,
};

// Local Storage Keys
const STORAGE_KEYS = {
    user: 'bobfly_user',
    token: 'bobfly_token',
};

// Utility Functions
function getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.token);
}

function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.user);
    return userStr ? JSON.parse(userStr) : null;
}

function setAuthData(user, token) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.token, token);
}

function clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
}

// API Helper Functions
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Bir hata oluştu');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Alert Helper
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 
                    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    alertDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    alertDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Date Formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTime(dateString) {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

// Price Formatting
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}



