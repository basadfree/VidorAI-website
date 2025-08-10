module.exports = (request, response) => {
    const cookies = request.headers.cookie;

    if (cookies && cookies.includes('auth=true')) {
        // המשתמש מחובר
        response.status(200).json({ authenticated: true });
    } else {
        // המשתמש לא מחובר
        response.status(401).json({ authenticated: false, message: 'לא מורשה' });
    }
};