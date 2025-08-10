const { sql } = require('@vercel/postgres');

module.exports = async (request, response) => {
    try {
        if (request.method === 'POST') {
            const { email, password } = request.body;

            if (!email || !password) {
                return response.status(400).json({ message: 'אימייל וסיסמה נדרשים.' });
            }

            // חפש את המשתמש בבסיס הנתונים
            const { rows } = await sql`
                SELECT * FROM users WHERE email = ${email} AND password = ${password};
            `;

            if (rows.length > 0) {
                // התחברות מוצלחת
                response.status(200).json({ message: 'התחברת בהצלחה!' });
            } else {
                // פרטים שגויים
                response.status(401).json({ message: 'אימייל או סיסמה שגויים.' });
            }

        } else {
            response.status(405).send('Method Not Allowed');
        }
    } catch (error) {
        console.error('שגיאה ב-login API:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};