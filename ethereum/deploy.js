const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledRecord = require('./build/Record.json');

//Link to sepolia network by using Infura and providing seed phrase of metamask wallet
const provider = new HDWalletProvider(
    'session donor source coral tuition unlock strike army cover notice goddess filter',
    'https://sepolia.infura.io/v3/996fde9b347e42c0a1a53371ba5213bb'
);

const web3 = new Web3(provider);

const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Attempting to deploy from account', accounts[0]);

         //Deploy contract to sepolia network
        const result = await new web3.eth.Contract(JSON.parse(compiledRecord.interface))
            .deploy({ data: compiledRecord.bytecode })
            .send({ gas: '10000000', from: accounts[0] }); // Adjust gas based on estimate

        //Display the address of the contract 
        console.log('Contract deployed to', result.options.address);
    } catch (error) {
        console.error('An error occurred during deployment:', error);
    } finally {
        provider.engine.stop(); // Ensure the provider session is closed properly
    }
    
    //Always go to record.js after updating solidity code

};

deploy();
