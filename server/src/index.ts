import app from './app';

const port = Number(process.env.API_PORT || 8787);
const host = process.env.API_HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`Cafe order API listening on http://${host}:${port}`));
