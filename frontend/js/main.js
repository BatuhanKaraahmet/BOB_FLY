// Main JavaScript for Index Page

// Load airports on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAirports();
    setMinDate();
});

// Swap airports (from <-> to)
function swapAirports() {
    const kalkis = document.getElementById('kalkis');
    const varis = document.getElementById('varis');
    
    const temp = kalkis.value;
    kalkis.value = varis.value;
    varis.value = temp;
    
    // Add animation effect
    kalkis.classList.add('scale-105');
    varis.classList.add('scale-105');
    setTimeout(() => {
        kalkis.classList.remove('scale-105');
        varis.classList.remove('scale-105');
    }, 300);
}

// Quick search from popular routes
function quickSearch(from, to) {
    document.getElementById('kalkis').value = from;
    document.getElementById('varis').value = to;
    
    // Scroll to search form
    const searchForm = document.getElementById('searchForm');
    searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight the form
    const searchCard = searchForm.closest('.search-card');
    searchCard.classList.add('ring-4', 'ring-purple-300');
    setTimeout(() => {
        searchCard.classList.remove('ring-4', 'ring-purple-300');
    }, 2000);
}

// Load airports from API
async function loadAirports() {
    try {
        const data = await apiRequest(API_ENDPOINTS.havalimanlar);
        
        const kalkisSelect = document.getElementById('kalkis');
        const varisSelect = document.getElementById('varis');

        data.havalimanlar.forEach(airport => {
            const option1 = document.createElement('option');
            option1.value = airport.iata_kodu;
            option1.textContent = `${airport.sehir} (${airport.iata_kodu}) - ${airport.ad}`;
            kalkisSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = airport.iata_kodu;
            option2.textContent = `${airport.sehir} (${airport.iata_kodu}) - ${airport.ad}`;
            varisSelect.appendChild(option2);
        });
    } catch (error) {
        console.error('Havalimanları yüklenirken hata:', error);
        showAlert('Havalimanları yüklenirken hata oluştu', 'error');
    }
}

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const tarihInput = document.getElementById('tarih');
    
    if (tarihInput) {
        tarihInput.min = today;
        tarihInput.value = today;
    }
}

// Search Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const kalkis = document.getElementById('kalkis').value;
            const varis = document.getElementById('varis').value;
            const tarih = document.getElementById('tarih').value;

            // Validation
            if (kalkis === varis) {
                showAlert('Kalkış ve varış havalimanları aynı olamaz', 'warning');
                return;
            }

            // Store search params and redirect to results page
            const searchParams = {
                kalkis,
                varis,
                tarih
            };
            
            localStorage.setItem('searchParams', JSON.stringify(searchParams));
            
            // Show loading message
            const submitBtn = searchForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Aranıyor...';
            submitBtn.disabled = true;
            
            // Redirect after short delay for better UX
            setTimeout(() => {
                window.location.href = 'ucus-sonuclari.html';
            }, 500);
        });
    }
});
