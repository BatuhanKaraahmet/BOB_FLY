// Authentication Functions

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (user) {
        // User is logged in
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            userName.textContent = `${user.ad} ${user.soyad}`;
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}

// Login Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

// Register Modal Functions
function showRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
}

// User Dropdown Toggle
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const data = await apiRequest(API_ENDPOINTS.kullaniciGiris, {
                    method: 'POST',
                    body: JSON.stringify({
                        e_posta: email,
                        sifre: password
                    })
                });

                if (data.success) {
                    setAuthData(data.kullanici, data.token);
                    showAlert('Giriş başarılı! Hoş geldiniz.', 'success');
                    closeLoginModal();
                    checkAuthStatus();
                    
                    // Redirect to biletlerim if on that page
                    if (window.location.pathname.includes('biletlerim.html')) {
                        window.location.reload();
                    }
                }
            } catch (error) {
                showAlert(error.message || 'Giriş yapılırken hata oluştu', 'error');
            }
        });
    }
});

// Register Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const ad = document.getElementById('registerAd').value;
            const soyad = document.getElementById('registerSoyad').value;
            const email = document.getElementById('registerEmail').value;
            const telefon = document.getElementById('registerTelefon').value;
            const password = document.getElementById('registerPassword').value;

            try {
                const data = await apiRequest(API_ENDPOINTS.kullaniciKayit, {
                    method: 'POST',
                    body: JSON.stringify({
                        ad,
                        soyad,
                        e_posta: email,
                        telefon,
                        sifre: password
                    })
                });

                if (data.success) {
                    // Auto-login after registration
                    const loginData = await apiRequest(API_ENDPOINTS.kullaniciGiris, {
                        method: 'POST',
                        body: JSON.stringify({
                            e_posta: email,
                            sifre: password
                        })
                    });

                    setAuthData(loginData.kullanici, loginData.token);
                    showAlert('Kayıt başarılı! Hoş geldiniz.', 'success');
                    closeRegisterModal();
                    checkAuthStatus();
                }
            } catch (error) {
                showAlert(error.message || 'Kayıt olurken hata oluştu', 'error');
            }
        });
    }
});

// Logout Function
function logout() {
    clearAuthData();
    showAlert('Çıkış yapıldı', 'info');
    checkAuthStatus();
    
    // Redirect to home if on protected pages
    if (window.location.pathname.includes('biletlerim.html')) {
        window.location.href = 'index.html';
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (e.target === loginModal) {
        closeLoginModal();
    }
    if (e.target === registerModal) {
        closeRegisterModal();
    }
});



