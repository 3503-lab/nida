// Günün menüsünü saklamak için
let dailyMenu = {
    date: new Date().toLocaleDateString('tr-TR'),
    items: []
};

// Admin paneli için şifre (gerçek uygulamada daha güvenli bir yöntem kullanılmalı)
const ADMIN_PASSWORD = "1234";

// Kullanıcıları saklamak için
let users = JSON.parse(localStorage.getItem('users')) || {};

// Aktif kullanıcı
let currentUser = null;

// Admin bilgileri
const ADMIN_USER = {
    username: "admin",
    password: "admin123",
    isAdmin: true
};

// Siparişleri saklamak için
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Değerlendirme için global değişkenler
let currentRating = 0;
let ratings = JSON.parse(localStorage.getItem('ratings')) || [];

// Bildirimler için global değişken
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];

// Menü tiplerini saklamak için
const menuTypes = {
    breakfast: 'Kahvaltı',
    lunch: 'Öğle Yemeği',
    dinner: 'Akşam Yemeği'
};

// Menüyü güncelle
function updateMenu(menuItems) {
    dailyMenu.items = menuItems;
    displayMenu();
}

// Menüyü görüntüle
function displayMenu() {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = `
        <h3>Tarih: ${dailyMenu.date}</h3>
        ${dailyMenu.items.map(item => `
            <div class="menu-item">
                <h4>${item}</h4>
            </div>
        `).join('')}
    `;
}

// Ana sayfa fonksiyonları
function showHomeSection() {
    // Tüm bölümleri gizle
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registrationSection').style.display = 'none';
    document.getElementById('monthlyMenuSection').style.display = 'none';
    document.getElementById('ratingSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('orderHistorySection').style.display = 'none';  // Yeni
    document.getElementById('profileSection').style.display = 'none';       // Yeni
    document.getElementById('notificationsSection').style.display = 'none'; // Yeni
    
    // Ana sayfayı göster
    document.getElementById('homeSection').style.display = 'block';
}

function showMonthlyMenu() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('monthlyMenuSection').style.display = 'block';
    loadMonthlyMenu();
}

// Menü sekmelerini göster/gizle
function showMenuTab(menuType) {
    // Tüm sekmeleri gizle
    Object.keys(menuTypes).forEach(type => {
        document.getElementById(`${type}Menu`).style.display = 'none';
    });
    
    // Seçili sekmeyi göster
    document.getElementById(`${menuType}Menu`).style.display = 'block';
    
    // Aktif sekme stilini güncelle
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Menüleri yükle
function loadMonthlyMenu() {
    Object.keys(menuTypes).forEach(type => {
        const menuImage = localStorage.getItem(`monthlyMenu_${type}`);
        const imageElement = document.getElementById(`${type}MenuImage`);
        
        if (menuImage) {
            imageElement.src = menuImage;
        } else {
            imageElement.parentElement.innerHTML = `<p>Henüz ${menuTypes[type].toLowerCase()} menüsü yüklenmemiş.</p>`;
        }
    });
}

// Menü yükleme fonksiyonunu güncelle
function uploadMonthlyMenu(input, menuType) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            localStorage.setItem(`monthlyMenu_${menuType}`, imageData);
            
            // Yüklenen resmi hemen göster
            const imageElement = document.getElementById(`${menuType}MenuImage`);
            if (imageElement) {
                imageElement.src = imageData;
                imageElement.style.display = 'block';
                const parentDiv = imageElement.parentElement;
                const message = parentDiv.querySelector('p');
                if (message) {
                    message.remove();
                }
            }
            
            alert(`${menuTypes[menuType]} menüsü başarıyla yüklendi!`);
            
            // Input'u temizle ki aynı dosyayı tekrar seçebilsin
            input.value = '';
        };
        reader.readAsDataURL(file);
    }
}

// Upload butonlarına tıklama olayı ekle
document.addEventListener('DOMContentLoaded', function() {
    // Mevcut olay dinleyiciler...
    
    // Upload label'larına tıklama olayı ekle
    const uploadLabels = document.querySelectorAll('.upload-label');
    uploadLabels.forEach(label => {
        label.addEventListener('click', function(e) {
            // Label'a bağlı input elementini bul ve tıkla
            const inputId = this.getAttribute('for');
            document.getElementById(inputId).click();
        });
    });
});

// Form gösterme fonksiyonları
function showLoginForm() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('monthlyMenuSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registrationSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
}

function showRegistrationForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registrationSection').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
}

// Giriş fonksiyonunu güncelle
function login() {
    let phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Admin girişi kontrolü
    if (phone === ADMIN_USER.username && password === ADMIN_USER.password) {
        currentUser = ADMIN_USER;
        showAdminPanel();
        return;
    }

    // Telefon numarası kontrolü
    phone = phone.replace(/[^0-9]/g, '');

    if (!phone || !password) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    // Normal kullanıcı girişi
    const user = users[phone];
    if (user && user.password === password) {
        currentUser = user;
        
        // Beni hatırla seçeneği işaretliyse bilgileri kaydet
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({
                phone: phone,
                password: password
            }));
        } else {
            // İşaretli değilse kaydedilmiş bilgileri sil
            localStorage.removeItem('rememberedUser');
        }
        
        showHomeSection();
        alert(`Hoş geldiniz ${user.name} ${user.surname}`);
    } else {
        alert('Telefon numarası veya şifre hatalı!');
    }
}

// Çıkış yapma fonksiyonunu güncelle
function logout() {
    currentUser = null;
    
    // Beni hatırla işaretli değilse formu temizle
    if (!document.getElementById('rememberMe').checked) {
        document.getElementById('loginPhone').value = '';
        document.getElementById('loginPassword').value = '';
        localStorage.removeItem('rememberedUser');
    }
    
    showLoginForm();
}

// Kayıt fonksiyonunu güncelle
function register() {
    const name = document.getElementById('regName').value;
    const surname = document.getElementById('regSurname').value;
    const company = document.getElementById('regCompany').value;
    let phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;

    // Telefon numarası kontrolü
    phone = phone.replace(/[^0-9]/g, ''); // Sadece rakamları al

    // Başında 0 kontrolü
    if (phone.startsWith('0')) {
        alert('Lütfen telefon numaranızı başında 0 olmadan girin!');
        return;
    }
    
    // 5 ile başlama kontrolü
    if (!phone.startsWith('5')) {
        alert('Telefon numarası 5 ile başlamalıdır!');
        return;
    }

    if (phone.length !== 10) {
        alert('Telefon numarası 10 haneli olmalıdır! (Örnek: 5XX XXX XX XX)');
        return;
    }

    if (!name || !surname || !company || !phone || !password || !passwordConfirm) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    if (password !== passwordConfirm) {
        alert('Şifreler eşleşmiyor!');
        return;
    }

    if (users[phone]) {
        alert('Bu telefon numarası zaten kayıtlı!');
        return;
    }

    // Yeni kullanıcıyı kaydet
    const newUser = {
        name,
        surname,
        company,
        phone,
        password,
        registrationDate: new Date().toLocaleDateString('tr-TR')
    };

    users[phone] = newUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    showMainContent();
    alert('Kayıt başarılı! Hoş geldiniz.');
}

// Ana içeriği göster
function showMainContent() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('monthlyMenuSection').style.display = 'none';
    document.getElementById('ratingSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Kullanıcı bilgilerini göster
    document.getElementById('userFullName').textContent = `${currentUser.name} ${currentUser.surname}`;
    document.getElementById('userCompany').textContent = currentUser.company;
}

// Sipariş fonksiyonunu güncelle
function submitOrder() {
    const personCount = document.getElementById('personCount').value;
    const orderNote = document.getElementById('orderNote').value;

    if (!currentUser || personCount < 1) {
        alert('Lütfen kişi sayısını giriniz!');
        return;
    }

    const order = {
        id: Date.now(),
        userId: currentUser.phone,
        userName: `${currentUser.name} ${currentUser.surname}`,
        company: currentUser.company,
        phone: currentUser.phone,
        personCount: personCount,
        note: orderNote,
        date: new Date().toLocaleDateString('tr-TR'),
        time: new Date().toLocaleTimeString('tr-TR'),
        menuDate: dailyMenu.date,
        status: 'Beklemede'
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Bildirim oluştur
    addNotification(currentUser.phone, 'Siparişiniz alındı', `${order.date} tarihli siparişiniz alınmıştır.`);

    alert('Siparişiniz alındı! Size en kısa sürede dönüş yapacağız.');
    document.getElementById('personCount').value = '1';
    document.getElementById('orderNote').value = '';
}

// Admin panelini göster
function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registrationSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    updateOrdersList();
}

// Siparişleri güncelle
function updateOrdersList() {
    const ordersList = document.getElementById('ordersList');
    const todaysOrders = orders.filter(order => order.menuDate === dailyMenu.date);
    const totalPersons = todaysOrders.reduce((sum, order) => sum + parseInt(order.personCount), 0);
    
    // Günlük sipariş istatistikleri
    const dailyStats = {};
    todaysOrders.forEach(order => {
        if (!dailyStats[order.userId]) {
            dailyStats[order.userId] = {
                name: order.userName,
                company: order.company,
                count: 0,
                totalPersons: 0
            };
        }
        dailyStats[order.userId].count++;
        dailyStats[order.userId].totalPersons += parseInt(order.personCount);
    });

    // Aylık sipariş istatistikleri
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.date.split('.').reverse().join('-'));
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
    });

    const monthlyStats = {};
    monthlyOrders.forEach(order => {
        if (!monthlyStats[order.userId]) {
            monthlyStats[order.userId] = {
                name: order.userName,
                company: order.company,
                count: 0,
                totalPersons: 0
            };
        }
        monthlyStats[order.userId].count++;
        monthlyStats[order.userId].totalPersons += parseInt(order.personCount);
    });
    
    // Mevcut siparişler HTML'i
    let ordersHtml = `
        <h3>Bugünün Siparişleri (${dailyMenu.date})</h3>
        <p class="total-count">Toplam Kişi Sayısı: ${totalPersons}</p>
        ${todaysOrders.map(order => `
            <div class="order-item">
                <p><strong>Şirket:</strong> ${order.company}</p>
                <p><strong>İsim:</strong> ${order.userName}</p>
                <p><strong>Telefon:</strong> ${order.phone}</p>
                <p><strong>Kişi Sayısı:</strong> ${order.personCount}</p>
                <p><strong>Saat:</strong> ${order.time}</p>
                <p><strong>Durum:</strong> ${order.status}</p>
                ${order.note ? `<p><strong>Not:</strong> ${order.note}</p>` : ''}
                <button onclick="updateOrderStatus('${order.id}')">Durumu Güncelle</button>
            </div>
        `).join('')}

        <h3>Günlük Sipariş İstatistikleri</h3>
        <div class="stats-container">
            ${Object.values(dailyStats).map(stat => `
                <div class="stat-item">
                    <p><strong>${stat.name}</strong> (${stat.company})</p>
                    <p>Sipariş Sayısı: ${stat.count}</p>
                    <p>Toplam Kişi: ${stat.totalPersons}</p>
                </div>
            `).join('')}
        </div>

        <h3>Aylık Sipariş İstatistikleri</h3>
        <div class="stats-container">
            ${Object.values(monthlyStats).map(stat => `
                <div class="stat-item">
                    <p><strong>${stat.name}</strong> (${stat.company})</p>
                    <p>Sipariş Sayısı: ${stat.count}</p>
                    <p>Toplam Kişi: ${stat.totalPersons}</p>
                </div>
            `).join('')}
        </div>
    `;

    // Değerlendirmeler bölümü
    const averageRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + parseInt(r.rating), 0) / ratings.length).toFixed(1)
        : 0;

    ordersHtml += `
        <h3>Değerlendirmeler</h3>
        <p class="total-count">Ortalama Puan: ${averageRating}/5</p>
        <div class="ratings-list">
            ${ratings.map(rating => `
                <div class="rating-item">
                    <div class="rating-info">
                        <p><strong>Değerlendiren:</strong> ${rating.userName}</p>
                        <p><strong>Şirket:</strong> ${rating.company}</p>
                        <p><strong>Telefon:</strong> ${rating.phone}</p>
                    </div>
                    <div class="rating-stars">
                        ${'★'.repeat(rating.rating)}${'☆'.repeat(5-rating.rating)}
                    </div>
                    <p><strong>Tarih:</strong> ${rating.date} ${rating.time}</p>
                    ${rating.comment ? `<p><strong>Yorum:</strong> ${rating.comment}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;

    ordersList.innerHTML = ordersHtml;
}

// Sipariş durumunu güncelle
function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === parseInt(orderId));
    if (order) {
        const newStatus = order.status === 'Beklemede' ? 'Onaylandı' : 'Beklemede';
        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        updateOrdersList();
    }
}

// Değerlendirme bölümünü göster
function showRating() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('ratingSection').style.display = 'block';
    initializeRating();
}

// Yıldız derecelendirme sistemini başlat
function initializeRating() {
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.getAttribute('data-rating');
            highlightStars(rating);
        });

        star.addEventListener('mouseout', function() {
            highlightStars(currentRating);
        });

        star.addEventListener('click', function() {
            currentRating = this.getAttribute('data-rating');
            document.getElementById('ratingValue').textContent = currentRating;
            highlightStars(currentRating);
        });
    });
}

// Yıldızları vurgula
function highlightStars(rating) {
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => {
        const starRating = star.getAttribute('data-rating');
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas');
            star.classList.add('active');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
            star.classList.remove('active');
        }
    });
}

// Değerlendirmeyi gönder
function submitRating() {
    if (currentRating === 0) {
        alert('Lütfen bir puan seçin!');
        return;
    }

    const comment = document.getElementById('ratingComment').value;
    const rating = {
        rating: currentRating,
        comment: comment,
        userName: `${currentUser.name} ${currentUser.surname}`,
        company: currentUser.company,
        phone: currentUser.phone,
        date: new Date().toLocaleDateString('tr-TR'),
        time: new Date().toLocaleTimeString('tr-TR')
    };

    ratings.push(rating);
    localStorage.setItem('ratings', JSON.stringify(ratings));

    alert('Değerlendirmeniz için teşekkür ederiz!');
    resetRating();
    showHomeSection();
}

// Değerlendirme formunu sıfırla
function resetRating() {
    currentRating = 0;
    document.getElementById('ratingValue').textContent = '0';
    document.getElementById('ratingComment').value = '';
    highlightStars(0);
}

// Sayfa yüklendiğinde giriş formunu göster
window.onload = function() {
    // Örnek menüyü yükle
    updateMenu([
        "Mercimek Çorbası",
        "Izgara Köfte",
        "Pilav",
        "Mevsim Salata",
        "Sütlaç"
    ]);
    
    // Giriş formunu göster
    showLoginForm();
};

// Admin paneli için menü güncelleme fonksiyonu
function adminUpdateMenu() {
    document.getElementById('menuUpdateModal').style.display = 'flex';
}

// Modal'ı kapat
function closeMenuModal() {
    document.getElementById('menuUpdateModal').style.display = 'none';
    // Form alanlarını temizle
    document.getElementById('menuSoup').value = '';
    document.getElementById('menuMain').value = '';
    document.getElementById('menuSide').value = '';
    document.getElementById('menuSalad').value = '';
    document.getElementById('menuDessert').value = '';
}

// Form'dan menüyü güncelle
function updateMenuFromForm() {
    const soup = document.getElementById('menuSoup').value.trim();
    const main = document.getElementById('menuMain').value.trim();
    const side = document.getElementById('menuSide').value.trim();
    const salad = document.getElementById('menuSalad').value.trim();
    const dessert = document.getElementById('menuDessert').value.trim();

    if (!soup || !main || !side) {
        alert('Lütfen en az çorba, ana yemek ve yan yemek girin!');
        return;
    }

    const menuItems = [
        soup,
        main,
        side
    ];

    // Opsiyonel öğeleri ekle
    if (salad) menuItems.push(salad);
    if (dessert) menuItems.push(dessert);

    updateMenu(menuItems);
    closeMenuModal();
    alert('Menü başarıyla güncellendi!');
}

// ESC tuşu ile modal'ı kapatma
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMenuModal();
    }
});

// Modal dışına tıklayınca kapatma
document.addEventListener('click', function(event) {
    const modal = document.getElementById('menuUpdateModal');
    if (event.target === modal) {
        closeMenuModal();
    }
});

// Sayfa gösterme fonksiyonları
function showOrderHistory() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('orderHistorySection').style.display = 'block';
    updateOrderHistory();
}

function showProfile() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
    loadProfileData();
}

function showNotifications() {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('notificationsSection').style.display = 'block';
    updateNotificationsList();
    markNotificationsAsRead();
}

// Sipariş geçmişini güncelle
function updateOrderHistory() {
    const historyList = document.getElementById('orderHistoryList');
    const userOrders = orders.filter(order => order.userId === currentUser.phone)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = userOrders.map(order => `
        <div class="history-item">
            <p><strong>Tarih:</strong> ${order.date} ${order.time}</p>
            <p><strong>Kişi Sayısı:</strong> ${order.personCount}</p>
            <p><strong>Durum:</strong> ${order.status}</p>
            ${order.note ? `<p><strong>Not:</strong> ${order.note}</p>` : ''}
        </div>
    `).join('') || '<p>Henüz sipariş geçmişiniz bulunmamaktadır.</p>';
}

// Profil verilerini yükle
function loadProfileData() {
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editSurname').value = currentUser.surname;
    document.getElementById('editCompany').value = currentUser.company;
    document.getElementById('editPhone').value = currentUser.phone;
}

// Profili güncelle
function updateProfile() {
    const name = document.getElementById('editName').value;
    const surname = document.getElementById('editSurname').value;
    const company = document.getElementById('editCompany').value;

    if (!name || !surname || !company) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    currentUser.name = name;
    currentUser.surname = surname;
    currentUser.company = company;

    users[currentUser.phone] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));

    alert('Profil başarıyla güncellendi!');
    showHomeSection();
}

// Şifre güncelle
function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    if (currentPassword !== currentUser.password) {
        alert('Mevcut şifre hatalı!');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('Yeni şifreler eşleşmiyor!');
        return;
    }

    currentUser.password = newPassword;
    users[currentUser.phone] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));

    alert('Şifreniz başarıyla güncellendi!');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
}

// Bildirim ekle
function addNotification(userId, title, message) {
    const notification = {
        id: Date.now(),
        userId: userId,
        title: title,
        message: message,
        date: new Date().toLocaleDateString('tr-TR'),
        time: new Date().toLocaleTimeString('tr-TR'),
        read: false
    };

    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

// Bildirimleri güncelle
function updateNotificationsList() {
    const notificationsList = document.getElementById('notificationsList');
    const userNotifications = notifications
        .filter(notif => notif.userId === currentUser.phone)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    notificationsList.innerHTML = userNotifications.map(notif => `
        <div class="notification-item ${!notif.read ? 'unread' : ''}">
            <div class="notification-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <span class="time">${notif.date} ${notif.time}</span>
            </div>
        </div>
    `).join('') || '<p>Bildiriminiz bulunmamaktadır.</p>';
}

// Bildirim rozetini güncelle
function updateNotificationBadge() {
    const unreadCount = notifications.filter(
        notif => notif.userId === currentUser?.phone && !notif.read
    ).length;

    const badge = document.getElementById('notificationCount');
    if (unreadCount > 0) {
        badge.style.display = 'inline';
        badge.textContent = unreadCount;
    } else {
        badge.style.display = 'none';
    }
}

// Bildirimleri okundu olarak işaretle
function markNotificationsAsRead() {
    notifications = notifications.map(notif => {
        if (notif.userId === currentUser.phone) {
            notif.read = true;
        }
        return notif;
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

// Login sonrası bildirim rozetini güncelle
const originalLogin = login;
login = function() {
    originalLogin.apply(this, arguments);
    if (currentUser) {
        updateNotificationBadge();
    }
};

// Sayfa yüklendiğinde ilk sekmeyi aktif et
document.addEventListener('DOMContentLoaded', function() {
    showMenuTab('breakfast');
    checkRememberedUser();
    loadMonthlyMenu(); // Menüleri yükle
});

// Kaydedilmiş kullanıcı bilgilerini kontrol et
function checkRememberedUser() {
    const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
    if (rememberedUser) {
        document.getElementById('loginPhone').value = rememberedUser.phone;
        document.getElementById('loginPassword').value = rememberedUser.password;
        document.getElementById('rememberMe').checked = true;
        
        // Otomatik giriş yapmak istiyorsanız bu satırı ekleyin
        // login();
    }
} 