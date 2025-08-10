const { sql } = require('@vercel/postgres');

module.exports = async (request, response) => {
    try {
        const cookies = request.headers.cookie;
        if (!cookies || !cookies.includes('auth=')) {
            return response.status(401).json({ message: 'לא מורשה: אנא התחבר מחדש.' });
        }
        
        const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='));
        const encodedEmail = authCookie.split('=')[1];
        const email = atob(encodedEmail);

        // שליפת כל הסרטונים מהטבלה עבור המשתמש המחובר, ממוינים מהחדש לישן
        const { rows } = await sql`
            SELECT id, video_description, video_url, created_at 
            FROM videos 
            WHERE user_email = ${email}
            ORDER BY created_at DESC;
        `;

        response.status(200).json({ videos: rows });

    } catch (error) {
        console.error('שגיאה ב-get-videos API:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};