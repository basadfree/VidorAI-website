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

// פונקציה לשליפת והצגת היסטוריית הסרטונים
async function fetchVideos() {
    const videosList = document.getElementById('videosList');
    if (!videosList) return;
    
    videosList.innerHTML = '<p>טוען היסטוריית סרטונים...</p>';

    try {
        const response = await fetch('/api/get-videos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            videosList.innerHTML = ''; // מנקה את ההודעה "טוען"
            if (result.videos.length > 0) {
                result.videos.forEach(video => {
                    const newVideoElement = document.createElement('div');
                    newVideoElement.classList.add('video-item');
                    newVideoElement.innerHTML = `
                        <h3>${video.video_description}</h3>
                        <p>נוצר בתאריך: ${new Date(video.created_at).toLocaleDateString()}</p>
                        <a href="${video.video_url}" target="_blank" class="video-link">צפה בסרטון</a>
                    `;
                    videosList.appendChild(newVideoElement);
                });
            } else {
                videosList.innerHTML = '<p>אין סרטונים עדיין.</p>';
            }
        } else {
            videosList.innerHTML = `<p style="color:red;">שגיאה בטעינת הסרטונים: ${result.message}</p>`;
        }

    } catch (error) {
        console.error('שגיאה בטעינת הסרטונים:', error);
        videosList.innerHTML = '<p style="color:red;">שגיאה בחיבור לשרת. נסו שוב מאוחר יותר.</p>';
    }
}

// קורא לפונקציה בעת טעינת הדף כדי להציג את ההיסטוריה
document.addEventListener('DOMContentLoaded', fetchVideos);

// פונקציה לבדיקת סטטוס העבודה ב-Runpod
async function checkJobStatus(jobId) {
    try {
        const response = await fetch(`/api/get-job-status?jobId=${jobId}`);
        const result = await response.json();
        
        if (response.ok) {
            // אם המודל מחזיר "COMPLETED", ניקח את הקישור לסרטון ונציג אותו
            if (result.status === 'COMPLETED') {
                const videoUrl = result.result.video_url; // תלוי במבנה המידע שהמודל מחזיר
                // כעת, ניתן להציג את הקישור לסרטון שהתקבל בפאנל המשתמש
                alert(`הסרטון נוצר בהצלחה! ניתן לצפות בו בקישור: ${videoUrl}`);
                // ריענון היסטוריית הסרטונים
                fetchVideos();
            } else if (result.status === 'FAILED') {
                alert('יצירת הסרטון נכשלה.');
            } else {
                // אם הסטטוס עדיין לא "COMPLETED", נמשיך לבדוק
                setTimeout(() => checkJobStatus(jobId), 5000); // בדיקה כל 5 שניות
            }
        } else {
            alert(`שגיאה בבדיקת סטטוס העבודה: ${result.message}`);
        }
    } catch (error) {
        console.error('שגיאה בבדיקת סטטוס העבודה:', error);
        alert('שגיאה בחיבור לשרת. נסו שוב מאוחר יותר.');
    }
}

// פונקציה לעיבוד טופס יצירת הסרטון
const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const messageDiv = document.getElementById('messageDiv');
    messageDiv.textContent = "יוצר סרטון... זה עשוי לקחת מספר דקות.";
    messageDiv.classList.remove('success', 'error');
    messageDiv.classList.add('loading');

    try {
        const response = await fetch('/api/create-video', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.textContent = "הבקשה נשלחה בהצלחה ל-AI! ממתין לסרטון...";
            // התחלת בדיקת הסטטוס של העבודה שהתקבלה
            checkJobStatus(result.jobId);
        } else {
            messageDiv.textContent = `שגיאה: ${result.message}`;
            messageDiv.classList.remove('loading');
            messageDiv.classList.add('error');
        }
    } catch (error) {
        messageDiv.textContent = 'שגיאה בחיבור לשרת. נסו שוב מאוחר יותר.';
        messageDiv.classList.remove('loading');
        messageDiv.classList.add('error');
    }
};

const createVideoForm = document.getElementById('createVideoForm');
if (createVideoForm) {
    createVideoForm.addEventListener('submit', handleSubmit);
}