// My Tickets Page

let allTickets = [];
let currentFilter = 'all';

// Check authentication and load tickets
document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    
    if (!user) {
        document.getElementById('notLoggedIn').classList.remove('hidden');
        return;
    }

    document.getElementById('loadingTickets').classList.remove('hidden');
    await loadUserTickets(user.kullanici_id);
});

// Load user tickets
async function loadUserTickets(userId) {
    try {
        const data = await apiRequest(API_ENDPOINTS.kullaniciBiletler(userId));
        allTickets = data.biletler || [];

        document.getElementById('loadingTickets').classList.add('hidden');

        if (allTickets.length === 0) {
            document.getElementById('noTickets').classList.remove('hidden');
        } else {
            document.getElementById('filterTabs').classList.remove('hidden');
            document.getElementById('ticketsList').classList.remove('hidden');
            displayTickets(allTickets);
        }
    } catch (error) {
        console.error('Biletler yüklenirken hata:', error);
        showAlert('Biletler yüklenirken hata oluştu', 'error');
        document.getElementById('loadingTickets').classList.add('hidden');
        document.getElementById('noTickets').classList.remove('hidden');
    }
}

// Filter tickets
function filterTickets(filter) {
    currentFilter = filter;

    // Update button styles
    document.querySelectorAll('[id^="filter"]').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    // Map filter value to button ID
    let buttonId = 'filterAll';
    if (filter === 'Aktif') buttonId = 'filterAktif';
    else if (filter === 'Kullanıldı') buttonId = 'filterKullanildi';
    else if (filter === 'İptal') buttonId = 'filterIptal';
    
    document.getElementById(buttonId).classList.remove('bg-gray-200', 'text-gray-700');
    document.getElementById(buttonId).classList.add('bg-purple-600', 'text-white');

    // Filter and display
    const filtered = filter === 'all' ? allTickets : allTickets.filter(t => t.bilet_durumu === filter);
    displayTickets(filtered);
}

// Display tickets
function displayTickets(tickets) {
    const container = document.getElementById('ticketsList');

    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                <i class="fas fa-filter text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Bu Filtrede Bilet Bulunamadı</h3>
                <p class="text-gray-600">Başka bir filtre seçerek tekrar deneyin.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tickets.map(ticket => {
        const isPast = new Date(ticket.kalkis_tarihi_saati) < new Date();
        const statusColor = getStatusColor(ticket.bilet_durumu);
        const statusBadge = getStatusBadge(ticket.bilet_durumu);

        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden ticket-card">
                <div class="flex flex-col lg:flex-row">
                    <!-- Left Section -->
                    <div class="flex-1 p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-plane text-purple-600"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-800">${ticket.firma_ad}</h3>
                                    <p class="text-sm text-gray-500">${ticket.ucus_no}</p>
                                </div>
                            </div>
                            <div class="${statusBadge}">
                                ${ticket.bilet_durumu}
                            </div>
                        </div>

                        <!-- Route -->
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <p class="text-2xl font-bold text-gray-800">${formatTime(ticket.kalkis_tarihi_saati)}</p>
                                <p class="text-sm text-gray-600">${ticket.kalkis_sehir}</p>
                                <p class="text-xs text-gray-500">${ticket.kalkis_iata}</p>
                            </div>

                            <div class="flex-1 mx-4">
                                <div class="relative">
                                    <div class="absolute inset-0 flex items-center">
                                        <div class="w-full border-t-2 border-gray-300"></div>
                                    </div>
                                    <div class="relative flex justify-center">
                                        <span class="bg-white px-3 text-sm text-gray-500">
                                            <i class="fas fa-plane-departure"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="text-right">
                                <p class="text-2xl font-bold text-gray-800">${calculateArrivalTime(ticket.kalkis_tarihi_saati, ticket.tahmini_sure)}</p>
                                <p class="text-sm text-gray-600">${ticket.varis_sehir}</p>
                                <p class="text-xs text-gray-500">${ticket.varis_iata}</p>
                            </div>
                        </div>

                        <!-- Ticket Info -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p class="text-gray-500">Tarih</p>
                                <p class="font-medium text-gray-800">${formatDate(ticket.kalkis_tarihi_saati)}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Yolcu</p>
                                <p class="font-medium text-gray-800">${ticket.yolcu_ad} ${ticket.yolcu_soyad}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Koltuk</p>
                                <p class="font-medium text-gray-800">${ticket.koltuk_no}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Fiyat</p>
                                <p class="font-medium text-purple-600">${formatPrice(ticket.fiyat)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Right Section - Actions -->
                    <div class="bg-gray-50 p-6 lg:w-48 flex flex-col justify-center space-y-3">
                        <button onclick="showTicketDetail(${ticket.bilet_id})" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                            <i class="fas fa-eye mr-2"></i>Detay
                        </button>
                        ${ticket.bilet_durumu === 'Aktif' && !isPast ? `
                            <button onclick="confirmCancel(${ticket.bilet_id})" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
                                <i class="fas fa-times-circle mr-2"></i>İptal Et
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Calculate arrival time
function calculateArrivalTime(departureTime, duration) {
    const departure = new Date(departureTime);
    const arrival = new Date(departure.getTime() + duration * 60000);
    return formatTime(arrival.toISOString());
}

// Get status color
function getStatusColor(status) {
    switch (status) {
        case 'Aktif':
            return 'text-green-600';
        case 'Kullanıldı':
            return 'text-blue-600';
        case 'İptal':
            return 'text-red-600';
        default:
            return 'text-gray-600';
    }
}

// Get status badge
function getStatusBadge(status) {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
        case 'Aktif':
            return `${baseClass} bg-green-100 text-green-800`;
        case 'Kullanıldı':
            return `${baseClass} bg-blue-100 text-blue-800`;
        case 'İptal':
            return `${baseClass} bg-red-100 text-red-800`;
        default:
            return `${baseClass} bg-gray-100 text-gray-800`;
    }
}

// Show ticket detail
async function showTicketDetail(biletId) {
    try {
        const data = await apiRequest(API_ENDPOINTS.biletDetay(biletId));
        const ticket = data.bilet;

        const arrival = calculateArrivalTime(ticket.kalkis_tarihi_saati, ticket.tahmini_sure);

        document.getElementById('ticketDetailContent').innerHTML = `
            <div class="space-y-6">
                <!-- Ticket Number -->
                <div class="bg-purple-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-600 mb-1">Bilet Numarası</p>
                    <p class="text-2xl font-bold text-purple-600">#${ticket.bilet_id}</p>
                </div>

                <!-- Flight Info -->
                <div class="border-t pt-6">
                    <h3 class="font-bold text-gray-800 mb-4">Uçuş Bilgileri</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Hava Yolu</span>
                            <span class="font-medium">${ticket.firma_ad}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Uçuş No</span>
                            <span class="font-medium">${ticket.ucus_no}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Kalkış</span>
                            <span class="font-medium">${ticket.kalkis_havalimani} (${ticket.kalkis_iata})</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Varış</span>
                            <span class="font-medium">${ticket.varis_havalimani} (${ticket.varis_iata})</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Tarih</span>
                            <span class="font-medium">${formatDate(ticket.kalkis_tarihi_saati)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Kalkış Saati</span>
                            <span class="font-medium">${formatTime(ticket.kalkis_tarihi_saati)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Varış Saati (Tahmini)</span>
                            <span class="font-medium">${arrival}</span>
                        </div>
                    </div>
                </div>

                <!-- Passenger Info -->
                <div class="border-t pt-6">
                    <h3 class="font-bold text-gray-800 mb-4">Yolcu Bilgileri</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Ad Soyad</span>
                            <span class="font-medium">${ticket.yolcu_ad} ${ticket.yolcu_soyad}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">TC Kimlik</span>
                            <span class="font-medium">${ticket.tc_kimlik}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Koltuk No</span>
                            <span class="font-medium">${ticket.koltuk_no}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Info -->
                <div class="border-t pt-6">
                    <h3 class="font-bold text-gray-800 mb-4">Ödeme Bilgileri</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Bilet Ücreti</span>
                            <span class="font-medium">${formatPrice(ticket.fiyat)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Ödeme Tarihi</span>
                            <span class="font-medium">${formatDateTime(ticket.odeme_tarihi)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Durum</span>
                            <span class="${getStatusColor(ticket.bilet_durumu)} font-medium">${ticket.bilet_durumu}</span>
                        </div>
                    </div>
                </div>

                <!-- QR Code Placeholder -->
                <div class="border-t pt-6">
                    <div class="bg-gray-100 rounded-lg p-8 text-center">
                        <i class="fas fa-qrcode text-6xl text-gray-400 mb-3"></i>
                        <p class="text-sm text-gray-600">Boarding için QR Code</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ticketDetailModal').classList.remove('hidden');
    } catch (error) {
        console.error('Bilet detayı yüklenirken hata:', error);
        showAlert('Bilet detayları yüklenirken hata oluştu', 'error');
    }
}

// Close ticket detail
function closeTicketDetail() {
    document.getElementById('ticketDetailModal').classList.add('hidden');
}

// Confirm cancel
function confirmCancel(biletId) {
    if (confirm('Bu bileti iptal etmek istediğinizden emin misiniz?')) {
        cancelTicket(biletId);
    }
}

// Cancel ticket
async function cancelTicket(biletId) {
    try {
        const data = await apiRequest(API_ENDPOINTS.biletIptal(biletId), {
            method: 'PUT'
        });

        if (data.success) {
            showAlert('Bilet başarıyla iptal edildi', 'success');
            // Reload tickets
            const user = getCurrentUser();
            await loadUserTickets(user.kullanici_id);
        }
    } catch (error) {
        console.error('Bilet iptal hatası:', error);
        showAlert(error.message || 'Bilet iptal edilirken hata oluştu', 'error');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('ticketDetailModal');
    if (e.target === modal) {
        closeTicketDetail();
    }
});




