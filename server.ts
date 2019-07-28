import * as  bodyParser from 'body-parser';
import * as express from 'express';
import { block, getBlockchain, generateNewBlock} from './LeoCoin';
import {connectToPeers, initP2PServer, getSockets} from './user2user'


const httpPort: number = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort: number = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = (httpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    });
    app.post('/mineBlock', (req, res) => {
        const newBlock: block = generateNewBlock(req.body.data);
        res.send(newBlock);
    });
    app.get('/peers', (req, res) => {
        res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(httpPort, () => {
        console.log('Listening http on port: ' + httpPort);
    });


}

initHttpServer(httpPort);
initP2PServer(p2pPort);