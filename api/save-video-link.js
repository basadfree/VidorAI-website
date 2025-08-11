const { sql } = require('@vercel/postgres');

module.exports = async (request, response) => {
    try {
        if (request.method !== 'POST') {
            return response.status(405).send('Method Not Allowed');
        }

        const { jobId, videoUrl } = request.body;

        if (!jobId || !videoUrl) {
            return response.status(400).json({ message: 'Job ID או קישור לסרטון חסרים.' });
        }

        // איתור הסרטון לפי ה-jobId ועדכון הקישור
        await sql`
            UPDATE videos SET video_url = ${videoUrl} WHERE runpod_job_id = ${jobId};
        `;

        response.status(200).json({ message: 'הקישור לסרטון נשמר בהצלחה.' });

    } catch (error) {
        console.error('שגיאה ב-save-video-link API:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};