import App from './app';

const port = 4001;
const app = new App(port);

app.listen()
    .then(() => console.log(`Server running on port ${port}`))
    .catch(() => console.log('Failed to initialize the app'));
