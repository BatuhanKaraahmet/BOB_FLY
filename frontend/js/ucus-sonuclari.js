// Flight Results Page

let allFlights = [];
let filteredFlights = [];
let selectedAirlines = [];

// Load flights on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log(' Sayfa yüklendi - Uçuş Sonuçları');
    
    const searchParams = JSON.parse(localStorage.getItem('searchParams'));
    console.log('localStorage\'dan alınan arama parametreleri:', searchParams);
    
    if (!searchParams) {
        console.log('Arama parametresi yok, ana sayfaya yönlendiriliyor...');
        window.location.href = 'index.html';
        return;
    }

    console.log('Arama parametreleri geçerli:', searchParams);
    updateSearchSummary(searchParams);
    console.log('Uçuş araması başlatılıyor...');
    await searchFlights(searchParams);
});

// Update search summary
function updateSearchSummary(params) {
    const summaryText = document.getElementById('summaryText');
    summaryText.innerHTML = `
        <strong>${params.kalkis}</strong> 
        <i class="fas fa-arrow-right mx-2"></i> 
        <strong>${params.varis}</strong> 
        <span class="mx-2">•</span> 
        ${formatDate(params.tarih)}
    `;
}

// Search flights
async function searchFlights(params) {
    try {
        const url = `${API_ENDPOINTS.ucusAra}?kalkis=${params.kalkis}&varis=${params.varis}&tarih=${params.tarih}`;
        const data = await apiRequest(url);

        allFlights = data.ucuslar || [];
        filteredFlights = [...allFlights];

        document.getElementById('loadingSpinner').classList.add('hidden');

        if (allFlights.length === 0) {
            console.log('🔍 Uçuş bulunamadı! Alternatif tarihleri getiriyorum...', params);
            // Alternatif tarihleri göster
            await showAlternativeDates(params);
            document.getElementById('noResults').classList.remove('hidden');
        } else {
            console.log(`${allFlights.length} uçuş bulundu!`);
            populateAirlineFilters();
            displayFlights(filteredFlights);
        }
    } catch (error) {
        console.error('Uçuş arama hatası:', error);
        showAlert('Uçuşlar aranırken hata oluştu', 'error');
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('noResults').classList.remove('hidden');
    }
}

// Show alternative dates
async function showAlternativeDates(params) {
    try {
        const url = `${API_ENDPOINTS.ucusAlternatifTarihler}?kalkis=${params.kalkis}&varis=${params.varis}`;
        console.log('Alternatif tarihler API çağrısı:', url);
        const data = await apiRequest(url);
        console.log('API Yanıtı:', data);

        if (data.alternatif_tarihler && data.alternatif_tarihler.length > 0) {
            console.log(`${data.alternatif_tarihler.length} alternatif tarih bulundu!`);
            const noResultsDiv = document.getElementById('noResults');
            const alternativeDatesHTML = `
                <div class="bg-white rounded-xl shadow-lg p-8 text-center mb-6">
                    <i class="fas fa-plane-slash text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Bu Tarihte Uçuş Bulunamadı</h3>
                    <p class="text-gray-600 mb-6">${formatDate(params.tarih)} tarihinde ${params.kalkis} - ${params.varis} için uçuş bulunmuyor.</p>
                    
                    <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                        <h4 class="text-xl font-bold text-purple-800 mb-4 flex items-center justify-center">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            Bu Rotada Uçuşların Olduğu Tarihler
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${data.alternatif_tarihler.map(tarih => `
                                <div class="bg-white rounded-lg p-4 hover:shadow-md transition cursor-pointer border-2 border-purple-100 hover:border-purple-400" 
                                     onclick="searchNewDate('${tarih.ucus_tarihi}')">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="text-left">
                                            <p class="font-bold text-gray-800">${formatDateLong(tarih.ucus_tarihi)}</p>
                                            <p class="text-sm text-gray-600">${getDayName(tarih.ucus_tarihi)}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-2xl font-bold text-purple-600">${tarih.ucus_sayisi}</p>
                                            <p class="text-xs text-gray-500">uçuş</p>
                                        </div>
                                    </div>
                                    <div class="text-left border-t pt-2 mt-2">
                                        <p class="text-xs text-gray-600 mb-1">
                                            <i class="fas fa-plane-departure mr-1"></i>
                                            ${tarih.firmalar}
                                        </p>
                                        <p class="text-sm font-semibold text-green-600">
                                            <i class="fas fa-tag mr-1"></i>
                                            ${formatPrice(tarih.en_ucuz_fiyat)}'den başlayan fiyatlar
                                        </p>
                                    </div>
                                    <button class="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                                        <i class="fas fa-search mr-2"></i>Bu Tarihi Ara
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            noResultsDiv.innerHTML = alternativeDatesHTML;
        } else {
            console.log('⚠️  Alternatif tarih bulunamadı!');
            // Hiç alternatif tarih yoksa
            document.getElementById('noResults').innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <i class="fas fa-plane-slash text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Uçuş Bulunamadı</h3>
                    <p class="text-gray-600 mb-4">${formatDate(params.tarih)} tarihinde ${params.kalkis} - ${params.varis} için uçuş bulunmuyor.</p>
                    <p class="text-gray-500">Bu rotada yakın zamanda uçuş planlanmamış.</p>
                    <button onclick="window.location.href='index.html'" class="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                        <i class="fas fa-arrow-left mr-2"></i>Yeni Arama Yap
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Alternatif tarih arama hatası:', error);
        console.error('Hata detayı:', error.message);
        // Hata durumunda basit mesaj göster
        document.getElementById('noResults').innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                <i class="fas fa-plane-slash text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Uçuş Bulunamadı</h3>
                <p class="text-gray-600">Lütfen farklı bir tarih veya rota deneyin.</p>
            </div>
        `;
    }
}

// Search new date
function searchNewDate(newDate) {
    console.log('Yeni tarih seçildi:', newDate);
    
    // Date objesine çevir ve YYYY-MM-DD formatına çevir
    const date = new Date(newDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateOnly = `${year}-${month}-${day}`;
    
    console.log('Formatlanmış tarih:', dateOnly);
    console.log('Tarih detayı:', {
        original: newDate,
        parsed: date.toLocaleString('tr-TR'),
        formatted: dateOnly
    });
    
    const searchParams = JSON.parse(localStorage.getItem('searchParams'));
    const oldDate = searchParams.tarih;
    searchParams.tarih = dateOnly;
    localStorage.setItem('searchParams', JSON.stringify(searchParams));
    
    console.log('Tarih değişti:', oldDate, '→', dateOnly);
    console.log('Sayfa yenileniyor ve yeni arama yapılacak...');
    
    window.location.reload();
}

// Format date long (15 Aralık 2025)
function formatDateLong(dateString) {
    const date = new Date(dateString);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Get day name
function getDayName(dateString) {
    const date = new Date(dateString);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
}

// Populate airline filters
function populateAirlineFilters() {
    const airlines = [...new Set(allFlights.map(f => f.firma_ad))];
    const container = document.getElementById('airlineFilters');
    
    container.innerHTML = airlines.map(airline => `
        <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" value="${airline}" onchange="toggleAirlineFilter('${airline}')" class="form-checkbox text-purple-600">
            <span class="text-gray-700">${airline}</span>
        </label>
    `).join('');
}

// Toggle airline filter
function toggleAirlineFilter(airline) {
    const index = selectedAirlines.indexOf(airline);
    if (index > -1) {
        selectedAirlines.splice(index, 1);
    } else {
        selectedAirlines.push(airline);
    }
    applyFilters();
}

// Apply filters
function applyFilters() {
    filteredFlights = [...allFlights];

    // Airline filter
    if (selectedAirlines.length > 0) {
        filteredFlights = filteredFlights.filter(f => selectedAirlines.includes(f.firma_ad));
    }

    // Price range filter
    const minPrice = parseFloat(document.getElementById('minPrice').value);
    const maxPrice = parseFloat(document.getElementById('maxPrice').value);

    if (minPrice) {
        filteredFlights = filteredFlights.filter(f => f.temel_fiyat >= minPrice);
    }
    if (maxPrice) {
        filteredFlights = filteredFlights.filter(f => f.temel_fiyat <= maxPrice);
    }

    // Sort
    const sortBy = document.getElementById('sortBy').value;
    sortFlights(sortBy);

    displayFlights(filteredFlights);
}

// Sort flights
function sortFlights(sortBy) {
    switch (sortBy) {
        case 'price-asc':
            filteredFlights.sort((a, b) => a.temel_fiyat - b.temel_fiyat);
            break;
        case 'price-desc':
            filteredFlights.sort((a, b) => b.temel_fiyat - a.temel_fiyat);
            break;
        case 'time-asc':
            filteredFlights.sort((a, b) => new Date(a.kalkis_tarihi_saati) - new Date(b.kalkis_tarihi_saati));
            break;
        case 'time-desc':
            filteredFlights.sort((a, b) => new Date(b.kalkis_tarihi_saati) - new Date(a.kalkis_tarihi_saati));
            break;
    }
}

// Listen to sort change
document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
});

// Display flights
function displayFlights(flights) {
    const container = document.getElementById('flightsList');
    
    if (flights.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                <i class="fas fa-plane-slash text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Filtre Sonucu Bulunamadı</h3>
                <p class="text-gray-600">Lütfen filtrelerinizi değiştirin.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = flights.map(flight => `
        <div class="bg-white rounded-xl shadow-lg p-6 flight-card transition-all duration-300">
            <div class="flex flex-col lg:flex-row justify-between items-center">
                <div class="flex-1 w-full lg:w-auto">
                    <!-- Airline Logo & Name -->
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-plane text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800">${flight.firma_ad}</h3>
                            <p class="text-sm text-gray-500">${flight.ucus_no}</p>
                        </div>
                    </div>

                    <!-- Flight Route -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-gray-800">${formatTime(flight.kalkis_tarihi_saati)}</p>
                            <p class="text-sm text-gray-600">${flight.kalkis_sehir}</p>
                            <p class="text-xs text-gray-500">${flight.kalkis_iata}</p>
                        </div>

                        <div class="flex-1 mx-4">
                            <div class="relative">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t-2 border-gray-300 border-dashed"></div>
                                </div>
                                <div class="relative flex justify-center">
                                    <span class="bg-white px-3 text-sm text-gray-500">
                                        <i class="fas fa-clock mr-1"></i>${flight.tahmini_sure} dk
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="text-center">
                            <p class="text-2xl font-bold text-gray-800">${calculateArrivalTime(flight.kalkis_tarihi_saati, flight.tahmini_sure)}</p>
                            <p class="text-sm text-gray-600">${flight.varis_sehir}</p>
                            <p class="text-xs text-gray-500">${flight.varis_iata}</p>
                        </div>
                    </div>

                    <!-- Flight Info -->
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                            <i class="fas fa-chair mr-1"></i>
                            ${flight.musait_koltuk} koltuk müsait
                        </div>
                        <div>
                            <i class="fas fa-plane mr-1"></i>
                            ${flight.ucak_model}
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-circle text-xs mr-1 ${getStatusColor(flight.ucus_durumu)}"></i>
                            ${flight.ucus_durumu}
                        </div>
                    </div>
                </div>

                <!-- Price & Action -->
                <div class="mt-4 lg:mt-0 lg:ml-8 text-center lg:text-right">
                    <div class="mb-2">
                        <p class="text-3xl font-bold text-purple-600">${formatPrice(flight.temel_fiyat)}</p>
                        <p class="text-sm text-gray-500">Kişi başı</p>
                    </div>
                    <button onclick="selectFlight(${flight.ucus_id})" class="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-300 w-full lg:w-auto">
                        <i class="fas fa-arrow-right mr-2"></i>Seç
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
        case 'Zamanında':
            return 'text-green-500';
        case 'Gecikti':
            return 'text-yellow-500';
        case 'İptal':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }
}

// Select flight
function selectFlight(ucusId) {
    localStorage.setItem('selectedFlightId', ucusId);
    window.location.href = 'bilet-satin-al.html';
}



