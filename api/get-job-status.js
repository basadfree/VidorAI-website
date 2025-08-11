module.exports = async (request, response) => {
    try {
        const { jobId } = request.query;

        if (!jobId) {
            return response.status(400).json({ message: 'Job ID חסר.' });
        }

        const runpodResponse = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT.split('/')[4]}/status/${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`
            }
        });

        if (!runpodResponse.ok) {
            throw new Error('שגיאה בקבלת סטטוס העבודה מ-Runpod.');
        }

        const runpodResult = await runpodResponse.json();
        const jobStatus = runpodResult.status;

        response.status(200).json({ status: jobStatus, result: runpodResult.output });

    } catch (error) {
        console.error('שגיאה ב-get-job-status API:', error);
        response.status(500).json({ message: 'אירעה שגיאה בשרת.' });
    }
};