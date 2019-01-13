import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import { serverPort } from './etc/config.json';


const app = express()
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));
app.use(cookieParser("secret"));

require('./routes/auth')(app);
require('./routes/sspc')(app);

const server = app.listen(serverPort, () => {    
    console.log(`Server up and listening on http://localhost:${serverPort}`)
})
app.get('/', (req, res) => {  
    if (!req.cookies.user) {
        res.redirect(301, '/auth')
    } 
    res.render('index')
});

