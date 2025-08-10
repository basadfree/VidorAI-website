const { sql } = require('@vercel/postgres');

// פונקציה ליצירת סיסמה אקראית של 8 תווים
const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
};

module.exports = async (request, response) => {
    try {
        if (request.method === 'POST') {
            const { fullName, email } = request.body;

            if (!fullName || !email) {
                return response.status(400).json({ message: 'שם מלא ואימייל נדרשים.' });
            }

            const password = generateRandomPassword();
            const defaultDailyLimit = 5; // מגבלת ברירת מחדל יומית
            const defaultMonthlyLimit = 20; // מגבלת ברירת מחדל חודשית
            const currentDate = new Date().toISOString().slice(0, 10);

            // יצירת טבלת המשתמשים אם אינה קיימת, כולל השדות החדשים
            await sql`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    daily_limit INTEGER DEFAULT ${defaultDailyLimit},
                    monthly_limit INTEGER DEFAULT ${defaultMonthlyLimit},
                    videos_created_today INTEGER DEFAULT 0,
                    videos_created_this_month INTEGER DEFAULT 0,
                    last_login_date DATE DEFAULT ${currentDate}
                );
            `;

            // בדיקה אם המשתמש כבר קיים במערכת
            const { rowCount: existingUserCount } = await sql`
                SELECT id FROM users WHERE email = ${email};
            `;

            if (existingUserCount > 0) {
                return response.status(409).json({ message: 'כתובת האימייל כבר קיימת במערכת.' });
            }

            // הוספת המשתמש החדש לטבלה עם ערכי ברירת מחדל
            await sql`
                INSERT INTO users (name, email, password, daily_limit, monthly_limit, videos_created_today, videos_created_this_month, last_login_date)
                VALUES (${fullName}, ${email}, ${password}, ${defaultDailyLimit}, ${defaultMonthlyLimit}, 0, 0, ${currentDate});
            `;

            console.log(`משתמש חדש נוצר: ${fullName}, ${email}. סיסמה זמנית: ${password}`);

            response.status(200).json({ message: `הבקשה נשלחה בהצלחה! סיסמה זמנית נוצרה עבורך.` });

        } else {
            response.status(405).send('Method Not Allowed');
        }
    } catch (error) {
        console.error('שגיאה ב-access-request:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת. נסו שוב מאוחר יותר.' });
    }
};