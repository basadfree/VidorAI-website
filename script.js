document.addEventListener('DOMContentLoaded', () => {
    // הסתרת הבאנר בעת גלילה
    const banner = document.querySelector('.banner');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            banner.style.transform = 'translateY(-100%)';
        } else {
            banner.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
    });

    // אפקטי טעינה הדרגתית על אלמנטים
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (
            rect.top < window.innerHeight &&
            rect.bottom > 0
        ) {
            section.classList.add('visible');
        } else {
            observer.observe(section);
        }
    });

    // פונקציונליות לשאלות נפוצות (FAQ)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.answer');
            const arrow = item.querySelector('.arrow');
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });

    // פונקציונליות חדשה לשליחת טופס בקשת הגישה
    const accessForm = document.getElementById('accessForm');
    if (accessForm) {
        accessForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const statusMessage = document.getElementById('statusMessage');

            try {
                const response = await fetch('/api/access-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fullName, email }),
                });

                const result = await response.json();
                
                if (response.ok) {
                    statusMessage.textContent = result.message;
                    statusMessage.style.color = '#155724';
                    statusMessage.style.backgroundColor = '#d4edda';
                    statusMessage.style.padding = '10px';
                    accessForm.reset();
                } else {
                    statusMessage.textContent = result.message || 'אירעה שגיאה. נסו שוב מאוחר יותר.';
                    statusMessage.style.color = '#721c24';
                    statusMessage.style.backgroundColor = '#f8d7da';
                    statusMessage.style.padding = '10px';
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                statusMessage.textContent = 'שגיאה בחיבור לשרת. בדקו את החיבור לרשת.';
                statusMessage.style.color = '#721c24';
                statusMessage.style.backgroundColor = '#f8d7da';
                statusMessage.style.padding = '10px';
            }
        });
    }
});

// פונקציונליות לשליחת טופס ההתחברות
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const statusMessage = document.getElementById('statusMessage');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            
            if (response.ok) {
                // התחברות מוצלחת
                statusMessage.textContent = result.message;
                statusMessage.style.color = '#155724';
                statusMessage.style.backgroundColor = '#d4edda';
                statusMessage.style.padding = '10px';
                // ננתב את המשתמש לפאנל המשתמש
                window.location.href = 'dashboard.html';
            } else {
                // פרטים שגויים
                statusMessage.textContent = result.message || 'שגיאה: אימייל או סיסמה לא נכונים.';
                statusMessage.style.color = '#721c24';
                statusMessage.style.backgroundColor = '#f8d7da';
                statusMessage.style.padding = '10px';
            }

        } catch (error) {
            console.error('Error during login:', error);
            statusMessage.textContent = 'שגיאה בחיבור לשרת. בדקו את החיבור לרשת.';
            statusMessage.style.color = '#721c24';
            statusMessage.style.backgroundColor = '#f8d7da';
            statusMessage.style.padding = '10px';
        }
    });
}

// הגנה על פאנל המשתמש
const currentPath = window.location.pathname;

if (currentPath.includes('dashboard.html')) {
    // בצע בדיקת אימות
    async function checkAuthentication() {
        try {
            // קריאה ל-API לבדיקת אימות
            const response = await fetch('/api/check-auth', {
                method: 'GET',
                credentials: 'include', // שינוי זה מוודא שהדפדפן שולח את העוגיות
            });
            
            if (response.status === 401) {
                // אם התשובה היא "לא מורשה", נתב לדף ההתחברות
                window.location.href = 'login.html';
            }
            // אם התשובה תקינה (response.ok), אפשר להמשיך לדף
        } catch (error) {
            console.error('שגיאה בבדיקת אימות:', error);
            // במקרה של שגיאה, נתב לדף ההתחברות
            window.location.href = 'login.html';
        }
    }
    checkAuthentication();
}

// פונקציונליות לכפתור התנתקות
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        // מוחק את העוגייה על ידי הגדרת תאריך תפוגה בעבר
        document.cookie = 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        // וניתוב לדף ההתחברות
        window.location.href = 'login.html';
    });
}

// פונקציונליות ליצירת סרטון
const createVideoForm = document.getElementById('createVideoForm');
if (createVideoForm) {
    createVideoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const videoText = document.getElementById('videoText').value;
        const videoImage = document.getElementById('videoImage').files[0];
        const videoDescription = document.getElementById('videoDescription').value;
        const musicSelect = document.getElementById('musicSelect').value;
        const designSelect = document.getElementById('designSelect').value;

        const statusMessage = document.getElementById('videoStatusMessage');
        const videosList = document.getElementById('videosList');

        statusMessage.textContent = 'יוצר סרטון... זה עשוי לקחת מספר דקות.';
        statusMessage.style.color = '#31708f';
        statusMessage.style.backgroundColor = '#d9edf7';
        statusMessage.style.padding = '10px';

        // שימוש ב-FormData כדי לשלוח טקסט וגם קובץ תמונה
        const formData = new FormData();
        formData.append('videoText', videoText);
        if (videoImage) {
            formData.append('videoImage', videoImage);
        }
        formData.append('videoDescription', videoDescription);
        formData.append('musicSelect', musicSelect);
        formData.append('designSelect', designSelect);

        try {
            const response = await fetch('/api/create-video', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                statusMessage.textContent = 'הסרטון נוצר בהצלחה!';
                statusMessage.style.color = '#155724';
                statusMessage.style.backgroundColor = '#d4edda';

                const newVideoElement = document.createElement('div');
                newVideoElement.innerHTML = `
                    <h3>${result.videoDescription}</h3>
                    <p>קובץ הסרטון: <a href="${result.videoUrl}" target="_blank">לחץ לצפייה</a></p>
                `;
                videosList.appendChild(newVideoElement);

            } else {
                statusMessage.textContent = result.message || 'שגיאה ביצירת הסרטון.';
                statusMessage.style.color = '#721c24';
                statusMessage.style.backgroundColor = '#f8d7da';
            }

        } catch (error) {
            console.error('שגיאה ביצירת הסרטון:', error);
            statusMessage.textContent = 'שגיאה בחיבור לשרת. נסו שוב מאוחר יותר.';
            statusMessage.style.color = '#721c24';
            statusMessage.style.backgroundColor = '#f8d7da';
        }
    });
}