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

// פונקציונליות לכפתור התנתקות
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        // מחיקת פרטי התחברות (לצורך הדגמה, אין כרגע פרטים שמורים)
        // וניתוב לדף ההתחברות
        window.location.href = 'login.html';
    });
}

// הגנה על פאנל המשתמש
const currentPath = window.location.pathname;

if (currentPath.includes('dashboard.html')) {
    // בצע בדיקת אימות
    async function checkAuthentication() {
        try {
            // קריאה ל-API לבדיקת אימות
            const response = await fetch('/api/check-auth');
            
            if (!response.ok) {
                // אם התשובה לא תקינה, נתב לדף ההתחברות
                window.location.href = 'login.html';
            }
            // אם התשובה תקינה (response.ok), אפשר להמשיך לדף
        } catch (error) {
            console.error('שגיאה בבדיקת אימות:', error);
            // במקרה של שגיאה, נתב לדף ההתחברות כדי למנוע גישה לא מאושרת
            window.location.href = 'login.html';
        }
    }
    checkAuthentication();
}