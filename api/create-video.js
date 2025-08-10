const { sql } = require('@vercel/postgres');

module.exports = async (request, response) => {
    try {
        if (request.method === 'POST') {
            const { videoText, videoDescription } = request.body;
            
            // בודק את העוגייה כדי לוודא שהמשתמש מחובר
            const cookies = request.headers.cookie;
            if (!cookies || !cookies.includes('auth=')) {
                return response.status(401).json({ message: 'לא מורשה: אנא התחבר מחדש.' });
            }
            
            // מפענח את המייל מהעוגייה
            const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='));
            const encodedEmail = authCookie.split('=')[1];
            const email = atob(encodedEmail);

            // חפש את פרטי המשתמש בבסיס הנתונים
            const { rows } = await sql`
                SELECT daily_limit, monthly_limit, videos_created_today, videos_created_this_month FROM users WHERE email = ${email};
            `;

            if (rows.length === 0) {
                return response.status(404).json({ message: 'המשתמש לא נמצא.' });
            }

            const user = rows[0];

            // בדיקת המגבלות
            if (user.videos_created_today >= user.daily_limit) {
                return response.status(403).json({ message: 'הגעת למגבלה היומית ליצירת סרטונים.' });
            }
            if (user.videos_created_this_month >= user.monthly_limit) {
                return response.status(403).json({ message: 'הגעת למגבלה החודשית ליצירת סרטונים.' });
            }

            // עדכון מונה הסרטונים בבסיס הנתונים
            await sql`
                UPDATE users SET
                videos_created_today = videos_created_today + 1,
                videos_created_this_month = videos_created_this_month + 1
                WHERE email = ${email};
            `;

            // סימולציה של יצירת סרטון
            const videoUrl = `https://example.com/videos/video-${Date.now()}.mp4`;

            // החזרת תשובה חיובית עם פרטי הסרטון
            response.status(200).json({
                message: 'הסרטון נוצר בהצלחה!',
                videoDescription: videoDescription,
                videoUrl: videoUrl
            });

        } else {
            response.status(405).send('Method Not Allowed');
        }
    } catch (error) {
        console.error('שגיאה ב-create-video API:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת. נסו שוב מאוחר יותר.' });
    }
};