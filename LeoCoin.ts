import * as CryptoJS from 'crypto-js';
import {broadcastLatest} from './user2user';

class block {
    public index: number;
    public data: string;
    public hash: string;
    public previousHash: string;
    public timestamp: number;

    constructor(index: number, hash:string, previousHash:string,timestamp: number ,data: string )
    {
        this.data = data;
        this.hash = hash;
        this.previousHash = previousHash;
        this.index = index;
        this.timestamp = timestamp;
    }
}


const genesisBlock: block = new block(
    0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', null, 1465154705, 'my genesis block!!'
);
let blockChain: block[] = [genesisBlock];


const calculateHash = (index: number, data: string, previousHash:string, timestamp: number): string => 
        CryptoJS.SHA256(index+data+previousHash+timestamp).toString();
        


const generateNewBlock = (blockData: string) => {
    const previousBlock = getPreviousBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, blockData, previousBlock.hash, nextTimestamp);
    const nextPreviousHash: string = previousBlock.hash;
    const newBlock = new block(nextIndex, nextHash, nextPreviousHash, nextTimestamp, blockData);
    return newBlock;
}

const getPreviousBlock = ():block => blockChain[blockChain.length-1]


const isValidNewBlock = (previousBlock: block, newBlock: block) => {
    if (previousBlock.index + 1 !== newBlock.index)
    {
        console.log('the index is invalid');
        return false;
    }
    if (previousBlock.hash !== newBlock.previousHash)
    {
        console.log('the previous and new hash are invalid');
        return false;
    }
    if (calculateHashForBlock(newBlock) !== newBlock.previousHash)
    {
        console.log('the calculated hash: ' + calculateHashForBlock(newBlock) + ' is different from ' + newBlock.hash);
        return false;
    }
    return true;
}

const isValidBlockStructure = (block: block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string';
};

const isValidChain = (blockChainToCheck: block[]) => {
    const isValidGenesis = (blockTocheck: block): boolean => {
        return JSON.stringify(blockTocheck) === JSON.stringify(genesisBlock);
    }
    if (!isValidGenesis(blockChainToCheck[0]))
        {
            return false;
        }
    for (let i=1 ; i<blockChainToCheck.length; i++)
    {
        if (!isValidNewBlock(blockChainToCheck[i], blockChainToCheck[i - 1])) {
            return false;
        }
    }
    return true;
}

const calculateHashForBlock = (block: block): string =>
    calculateHash(block.index, block.data, block.previousHash ,block.timestamp);

const replaceChain = (newBlocks: block[]) => {
    if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockChain = newBlocks;
        broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
};

const getBlockchain = ():block[] => blockChain
//
const addBlockToChain = (block: block) => {
    if (isValidBlockStructure(block) && isValidNewBlock(block,getPreviousBlock()))
    {
        blockChain.push(block);
        return true;
    }
        
}

export {addBlockToChain, getBlockchain, block, getPreviousBlock, isValidBlockStructure, replaceChain, generateNewBlock};