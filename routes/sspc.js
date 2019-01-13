const dgram = require('dgram')
import { createWriteStream } from "fs";
const zfill = require('zfill');
import { websocketPort } from '../etc/config.json';

let stream = null;
let udpServer = null;

const io = require('socket.io').listen(websocketPort);
io.set('log level', 1)

const createFile = (user, channels) => {
    const fileName = `logs/${new Date().toLocaleString()}_${user}.txt`;
    const stream = createWriteStream(fileName, { flags: 'a+' });
    stream.once('open', (fd) => {
        channels.forEach(channel => {
            stream.write(`Channel ${channel}\t`)
        });
        stream.write('\n')
    });
    return stream
}
module.exports = (app) => {
    app.post('/openConnection', (req, res) => {
        if (stream) stream.close();
        if (udpServer) udpServer.close();
        stream = createFile(req.cookies.user, req.body['channels'])
        res.cookie('filename', stream.path, { path: '/' })
        udpServer = dgram.createSocket("udp4")
        udpServer.on("error", (err) => {
            udpServer.close()
        })

        io.sockets.on('connection', socket => {
            udpServer.on("message", (msg, rinfo) => {
                let arr = []
                req.body['channels'].forEach(channel => {
                    arr.push(msg.slice(24 + channel * 4, 27 + channel * 4).readIntLE(0, 3))
                });
                socket.json.send({ "coords": Array.from(arr, elem => { return elem }) })
                stream.write(`${arr.join('\t')}\n`);
            })
        })

        udpServer.on('close', () => {
            console.log('Client UDP socket closed : BYE!')
        });
        udpServer.on("listening", () => {
            const address = udpServer.address()
            console.log(`Server listening on ${address.address}:${address.port}`)
        })
        try {
            udpServer.bind(1519, '127.0.0.1')
        }
        catch (err) {
            udpServer.close()
            res.status(500).json({ "status": "Невозможно подключиться к серверу" })
        }
    });


    app.get('/get', (req, res) => {
        const { PythonShell } = require('python-shell')
        PythonShell.run('./scripts/getData.py',null, function (err, data) {
            if (err) console.log(err)
            const correctedData = data[0].split("'").join('"').split("False").join('false').split("True").join("true")
            res.status(200).json(correctedData)
        });

    })

    app.post('/send', (req, res) => {
        const options = {
            args: JSON.stringify(req.body)
        }
        const { PythonShell } = require('python-shell')
        PythonShell.run('./scripts/sendData.py', options, function (err, data) {
            if (err) res.status(500).json({ 'status': 'error' })
            res.status(200).json({ 'status': 'success' })
        });
    });

    app.get('/logout', (req, res) => {
        if (stream) stream.close();
        if (udpServer) udpServer.close();
        res.clearCookie('user', { path: '/' });
        res.clearCookie('filename', { path: '/' });
        res.status(200).json({ "status": "success" });
    });
}