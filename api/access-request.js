module.exports = (request, response) => {
    if (request.method === 'POST') {
        const { fullName, email } = request.body;

        // הדפסת הנתונים שהתקבלו כדי שנוכל לראות אותם ב-Vercel Logs
        console.log('Received access request:', { fullName, email });

        // בשלב זה, אנחנו פשוט מחזירים הודעת הצלחה.
        // בהמשך נוכל להוסיף כאן לוגיקה לשמירת הנתונים במסד נתונים,
        // שליחת אימייל או קריאה ל-API של RunPod.
        response.status(200).json({ message: 'הבקשה נשלחה בהצלחה! נחזור אליכם בהקדם.' });

    } else {
        response.status(405).send('Method Not Allowed');
    }
};