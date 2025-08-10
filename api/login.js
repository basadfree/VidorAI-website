const { sql } = require('@vercel/postgres');

module.exports = async (request, response) => {
    try {
        if (request.method === 'POST') {
            const { email, password } = request.body;

            if (!email || !password) {
                return response.status(400).json({ message: 'אימייל וסיסמה נדרשים.' });
            }

            const { rows } = await sql`
                SELECT * FROM users WHERE email = ${email} AND password = ${password};
            `;

            if (rows.length > 0) {
                const user = rows[0];
                const lastLoginDate = new Date(user.last_login_date);
                const currentDate = new Date();

                const isNewDay = currentDate.getDate() !== lastLoginDate.getDate() || currentDate.getMonth() !== lastLoginDate.getMonth() || currentDate.getFullYear() !== lastLoginDate.getFullYear();
                const isNewMonth = currentDate.getMonth() !== lastLoginDate.getMonth() || currentDate.getFullYear() !== lastLoginDate.getFullYear();

                let updateQuery = '';
                const queryParams = [];

                if (isNewDay) {
                    updateQuery += 'videos_created_today = 0, last_login_date = CURRENT_DATE';
                }

                if (isNewMonth) {
                    if (updateQuery.length > 0) updateQuery += ', ';
                    updateQuery += 'videos_created_this_month = 0';
                }
                
                if (updateQuery.length > 0) {
                    await sql`
                        UPDATE users SET ${sql.raw(updateQuery)} WHERE email = ${email};
                    `;
                }

                // הגדרת עוגייה עם המייל המקודד
                const encodedEmail = btoa(email);
                response.setHeader('Set-Cookie', `auth=${encodedEmail}; Path=/; Max-Age=3600; HttpOnly`);
                return response.status(200).json({ message: 'התחברת בהצלחה!' });
            } else {
                return response.status(401).json({ message: 'אימייל או סיסמה שגויים.' });
            }

        } else {
            response.status(405).send('Method Not Allowed');
        }
    } catch (error) {
        console.error('שגיאה ב-login API:', error);
        return response.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};