// Ticket Purchase Page

let selectedFlight = null;
let selectedSeat = null;
let seatData = null;
let reservationData = null;

// Load flight details on page load
document.addEventListener('DOMContentLoaded', async () => {
    const flightId = localStorage.getItem('selectedFlightId');
    
    if (!flightId) {
        showAlert('Lütfen önce bir uçuş seçin', 'warning');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    await loadFlightDetails(flightId);
    await loadSeats(flightId);
});

// Load flight details
async function loadFlightDetails(flightId) {
    try {
        const data = await apiRequest(API_ENDPOINTS.ucusDetay(flightId));
        selectedFlight = data.ucus;

        // Display flight summary
        displayFlightSummary();
    } catch (error) {
        console.error('Uçuş detayları yüklenirken hata:', error);
        showAlert('Uçuş bilgileri yüklenirken hata oluştu', 'error');
    }
}

// Display flight summary
function displayFlightSummary() {
    const summaryDiv = document.getElementById('flightSummary');
    const arrival = calculateArrivalTime(selectedFlight.kalkis_tarihi_saati, selectedFlight.tahmini_sure);
    
    summaryDiv.innerHTML = `
        <div class="bg-purple-50 rounded-lg p-4">
            <div class="flex items-center mb-3">
                <i class="fas fa-plane text-purple-600 mr-2"></i>
                <span class="font-bold text-gray-800">${selectedFlight.firma_ad}</span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Uçuş No:</strong> ${selectedFlight.ucus_no}</p>
                <p><strong>Kalkış:</strong> ${selectedFlight.kalkis_sehir} (${selectedFlight.kalkis_iata})</p>
                <p><strong>Varış:</strong> ${selectedFlight.varis_sehir} (${selectedFlight.varis_iata})</p>
                <p><strong>Tarih:</strong> ${formatDate(selectedFlight.kalkis_tarihi_saati)}</p>
                <p><strong>Saat:</strong> ${formatTime(selectedFlight.kalkis_tarihi_saati)} - ${arrival}</p>
            </div>
        </div>
    `;

    updatePriceSummary();
}

// Calculate arrival time
function calculateArrivalTime(departureTime, duration) {
    const departure = new Date(departureTime);
    const arrival = new Date(departure.getTime() + duration * 60000);
    return formatTime(arrival.toISOString());
}

// Load seats
async function loadSeats(flightId) {
    try {
        const data = await apiRequest(API_ENDPOINTS.koltuklar(flightId));
        seatData = data;

        document.getElementById('loadingSeats').classList.add('hidden');
        document.getElementById('seatMapContainer').classList.remove('hidden');

        displaySeatMap(data.koltuklar);
    } catch (error) {
        console.error('Koltuklar yüklenirken hata:', error);
        showAlert('Koltuklar yüklenirken hata oluştu', 'error');
    }
}

// Display seat map
function displaySeatMap(seats) {
    const seatMap = document.getElementById('seatMap');
    
    // Group seats by row
    const seatsByRow = {};
    seats.forEach(seat => {
        const row = seat.koltuk_no.replace(/[A-F]/g, '');
        if (!seatsByRow[row]) {
            seatsByRow[row] = [];
        }
        seatsByRow[row].push(seat);
    });

    // Generate seat rows
    let html = '';
    Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b)).forEach(rowNum => {
        const rowSeats = seatsByRow[rowNum];
        html += `
            <div class="flex items-center justify-center mb-2">
                <span class="text-sm text-gray-500 mr-4 w-8 text-right">${rowNum}</span>
                <div class="flex">
        `;

        ['A', 'B', 'C'].forEach(col => {
            const seat = rowSeats.find(s => s.koltuk_no === `${rowNum}${col}`);
            if (seat) {
                html += createSeatElement(seat);
            }
        });

        html += '<div class="w-8"></div>'; // Aisle

        ['D', 'E', 'F'].forEach(col => {
            const seat = rowSeats.find(s => s.koltuk_no === `${rowNum}${col}`);
            if (seat) {
                html += createSeatElement(seat);
            }
        });

        html += `
                </div>
                <span class="text-sm text-gray-500 ml-4 w-8">${rowNum}</span>
            </div>
        `;
    });

    seatMap.innerHTML = html;
}

// Create seat element
function createSeatElement(seat) {
    const seatClass = seat.dolu ? 'occupied' : 'available';
    const clickHandler = seat.dolu ? '' : `onclick="selectSeat('${seat.koltuk_no}')"`;
    
    return `
        <div class="seat ${seatClass}" 
             ${clickHandler}
             data-seat="${seat.koltuk_no}">
            <div class="flex items-center justify-center h-full text-xs font-bold">
                ${seat.dolu ? '✕' : seat.koltuk_no.slice(-1)}
            </div>
        </div>
    `;
}

// Select seat
function selectSeat(seatNo) {
    // Remove previous selection
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
        seat.classList.add('available');
    });

    // Select new seat
    const seatElement = document.querySelector(`[data-seat="${seatNo}"]`);
    seatElement.classList.remove('available');
    seatElement.classList.add('selected');

    selectedSeat = seatNo;

    // Update UI
    document.getElementById('selectedSeatInfo').classList.remove('hidden');
    document.getElementById('selectedSeatDisplay').textContent = seatNo;
    document.getElementById('nextToPassengerBtn').disabled = false;

    updatePriceSummary();
}

// Update price summary
function updatePriceSummary() {
    const ticketPrice = selectedFlight ? selectedFlight.temel_fiyat : 0;
    const serviceFee = 50;
    const total = ticketPrice + serviceFee;

    document.getElementById('ticketPrice').textContent = formatPrice(ticketPrice);
    document.getElementById('totalPrice').textContent = formatPrice(total);
}

// Navigation functions
function goToPassengerInfo() {
    if (!selectedSeat) {
        showAlert('Lütfen bir koltuk seçin', 'warning');
        return;
    }

    document.getElementById('seatSelectionStep').classList.add('hidden');
    document.getElementById('passengerInfoStep').classList.remove('hidden');

    // Update progress
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step1').classList.add('completed');
    document.getElementById('step2').classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToSeatSelection() {
    document.getElementById('passengerInfoStep').classList.add('hidden');
    document.getElementById('seatSelectionStep').classList.remove('hidden');

    // Update progress
    document.getElementById('step1').classList.add('active');
    document.getElementById('step1').classList.remove('completed');
    document.getElementById('step2').classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPayment() {
    document.getElementById('passengerInfoStep').classList.add('hidden');
    document.getElementById('paymentStep').classList.remove('hidden');

    // Update progress
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2').classList.add('completed');
    document.getElementById('step3').classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToPassengerInfo() {
    document.getElementById('paymentStep').classList.add('hidden');
    document.getElementById('passengerInfoStep').classList.remove('hidden');

    // Update progress
    document.getElementById('step2').classList.add('active');
    document.getElementById('step2').classList.remove('completed');
    document.getElementById('step3').classList.remove('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Passenger form handler
document.addEventListener('DOMContentLoaded', () => {
    const passengerForm = document.getElementById('passengerForm');
    if (passengerForm) {
        passengerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const yolcuAd = document.getElementById('yolcuAd').value;
            const yolcuSoyad = document.getElementById('yolcuSoyad').value;
            const tcKimlik = document.getElementById('tcKimlik').value;

            // TC Kimlik validation
            if (tcKimlik.length !== 11 || !/^\d+$/.test(tcKimlik)) {
                showAlert('TC Kimlik numarası 11 haneli olmalıdır', 'error');
                return;
            }

            // Create reservation
            try {
                const user = getCurrentUser();
                const data = await apiRequest(API_ENDPOINTS.biletRezervasyonu, {
                    method: 'POST',
                    body: JSON.stringify({
                        ucus_id: selectedFlight.ucus_id,
                        kullanici_id: user ? user.kullanici_id : null,
                        koltuk_no: selectedSeat,
                        yolcu_ad: yolcuAd,
                        yolcu_soyad: yolcuSoyad,
                        tc_kimlik: tcKimlik
                    })
                });

                if (data.success) {
                    reservationData = data;
                    goToPayment();
                }
            } catch (error) {
                showAlert(error.message || 'Rezervasyon oluşturulurken hata oluştu', 'error');
            }
        });
    }
});

// Payment form handler
document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!reservationData) {
                showAlert('Rezervasyon bilgisi bulunamadı', 'error');
                return;
            }

            try {
                // Simulate payment processing
                showAlert('Ödeme işleniyor...', 'info');

                // In real app, we would process payment here
                // For now, we'll just confirm the reservation
                
                const data = await apiRequest(API_ENDPOINTS.biletSatinAl, {
                    method: 'POST',
                    body: JSON.stringify({
                        bilet_id: reservationData.bilet_id,
                        odeme_bilgileri: {
                            // Payment details would go here
                        }
                    })
                });

                if (data.success) {
                    showSuccess(reservationData.bilet_id);
                }
            } catch (error) {
                showAlert(error.message || 'Ödeme işlemi sırasında hata oluştu', 'error');
            }
        });
    }
});

// Show success
function showSuccess(biletId) {
    document.getElementById('paymentStep').classList.add('hidden');
    document.getElementById('successStep').classList.remove('hidden');
    document.getElementById('biletNumarasi').textContent = `#${biletId}`;

    // Update progress
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step3').classList.add('completed');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Clear stored data
    localStorage.removeItem('selectedFlightId');
}




