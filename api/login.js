module.exports = (request, response) => {
    if (request.method === 'POST') {
        const { password } = request.body;

        // הגדר סיסמה פשוטה לאימות (ניתן לשנות בעתיד)
        const CORRECT_PASSWORD = 'your_secret_password';

        if (password === CORRECT_PASSWORD) {
            response.status(200).json({ message: 'התחברות מוצלחת. מנתב לפאנל המשתמש.' });
        } else {
            response.status(401).json({ message: 'סיסמה שגויה. נסו שוב.' });
        }

    } else {
        response.status(405).send('Method Not Allowed');
    }
};