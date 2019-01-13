import fs from 'fs';
import _ from 'lodash';
const dgram = require('dgram')

let stream = null;
let udpServer = null



module.exports = (app) => {
    app.get('/auth', (req, res) => {
        if (req.cookies.user) {
            res.redirect('/');
        }
        res.render('auth');
    });

    app.post('/login', (req, res) => {
        fs.readFile('./etc/config.json', 'utf-8', (err, data) => {
            if (err)
                throw err;
            let json_data = JSON.parse(data);
            if (_.findLastIndex(json_data["users"], (o) => {
                return o.username == req.body.username && o.password == req.body.password
            }) != -1) {
                res.cookie('user', req.body['username'], {
                    path: '/',
                });     
                res.status(200).json({"status": "Authorization success!"})           
                
            } else {
                res.status(401).json({ "status": "Неверное имя пользователя или пароль" });
            }
        })
    });   

    
}