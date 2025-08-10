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

            // יצירת טבלת המשתמשים אם אינה קיימת
            await sql`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                );
            `;

            // בדיקה אם המשתמש כבר קיים במערכת
            const { rowCount: existingUserCount } = await sql`
                SELECT id FROM users WHERE email = ${email};
            `;

            if (existingUserCount > 0) {
                return response.status(409).json({ message: 'כתובת האימייל כבר קיימת במערכת.' });
            }

            // הוספת המשתמש החדש לטבלה
            await sql`
    INSERT INTO users (name, email, password)
    VALUES (${fullName}, ${email}, ${password});
            `;
            
            // לשם בדיקה בלבד, נרשום את הסיסמה ביומנים
            // בשלב הבא, נחבר שירות שליחת אימיילים
            console.log(`משתמש חדש נוצר: ${fullName}, ${email}. סיסמה זמנית: ${password}`);

            response.status(200).json({ message: `הבקשה נשלחה בהצלחה! סיסמה זמנית נוצרה עבורך.`, password });

        } else {
            response.status(405).send('Method Not Allowed');
        }
    } catch (error) {
        console.error('שגיאה ב-access-request:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת. נסו שוב מאוחר יותר.' });
    }
};