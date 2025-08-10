module.exports = (request, response) => {
    try {
        const cookies = request.headers.cookie;

        if (cookies) {
            const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth='));
            if (authCookie) {
                // המשתמש מחובר
                return response.status(200).json({ authenticated: true });
            }
        }
        
        // אם לא נמצאה עוגייה מתאימה, המשתמש לא מחובר
        return response.status(401).json({ authenticated: false, message: 'לא מורשה' });

    } catch (error) {
        console.error('שגיאה ב-check-auth API:', error);
        return response.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};