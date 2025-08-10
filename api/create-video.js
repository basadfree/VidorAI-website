const { sql } = require('@vercel/postgres');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

// הגדרת formidable לטפל בקבצים זמניים בתיקיית /tmp
const form = formidable({
    multiples: false,
    uploadDir: '/tmp', // שינוי לשימוש בתיקייה /tmp
    keepExtensions: true,
});

module.exports = async (request, response) => {
    try {
        if (request.method !== 'POST') {
            return response.status(405).send('Method Not Allowed');
        }

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(request, (err, fields, files) => {
                if (err) return reject(err);
                resolve([fields, files]);
            });
        });

        const cookies = request.headers.cookie;
        if (!cookies || !cookies.includes('auth=')) {
            return response.status(401).json({ message: 'לא מורשה: אנא התחבר מחדש.' });
        }
        
        const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='));
        const encodedEmail = authCookie.split('=')[1];
        const email = atob(encodedEmail);

        const videoText = fields.videoText[0];
        const videoDescription = fields.videoDescription[0];
        const musicSelect = fields.musicSelect[0];
        const designSelect = fields.designSelect[0];
        const videoImage = files.videoImage ? files.videoImage[0] : null;

        const { rows } = await sql`
            SELECT daily_limit, monthly_limit, videos_created_today, videos_created_this_month FROM users WHERE email = ${email};
        `;

        if (rows.length === 0) {
            return response.status(404).json({ message: 'המשתמש לא נמצא.' });
        }

        const user = rows[0];

        if (user.videos_created_today >= user.daily_limit) {
            return response.status(403).json({ message: 'הגעת למגבלה היומית ליצירת סרטונים.' });
        }
        if (user.videos_created_this_month >= user.monthly_limit) {
            return response.status(403).json({ message: 'הגעת למגבלה החודשית ליצירת סרטונים.' });
        }

        console.log(`יצירת סרטון עבור: ${email}`);
        console.log(`טקסט: ${videoText}`);
        console.log(`תיאור: ${videoDescription}`);
        console.log(`מוזיקה: ${musicSelect}`);
        console.log(`עיצוב: ${designSelect}`);
        if (videoImage) {
            console.log(`קובץ תמונה שהועלה: ${videoImage.filepath}`);
            fs.unlink(videoImage.filepath, err => {
                if (err) console.error('שגיאה במחיקת קובץ זמני:', err);
            });
        }
        
        await sql`
            UPDATE users SET
            videos_created_today = videos_created_today + 1,
            videos_created_this_month = videos_created_this_month + 1
            WHERE email = ${email};
        `;

        const videoUrl = `https://example.com/videos/video-${Date.now()}.mp4`;

        response.status(200).json({
            message: 'הסרטון נוצר בהצלחה!',
            videoDescription: videoDescription,
            videoUrl: videoUrl
        });

    } catch (error) {
        console.error('שגיאה ב-create-video API:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת. נסו שוב מאוחר יותר.' });
    }
};