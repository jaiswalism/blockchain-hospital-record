require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledRecord = require('./build/Record.json');

const mnemonic = process.env.DEPLOYER_MNEMONIC;
const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID';

if (!mnemonic || mnemonic.includes('placeholder')) {
    console.error('Please configure DEPLOYER_MNEMONIC in your .env file before deploying.');
    process.exit(1);
}

// Link to network by using HDWalletProvider
const provider = new HDWalletProvider(mnemonic, rpcUrl);

const web3 = new Web3(provider);

const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts derived from the provided mnemonic phrase.');
        }
        console.log('Attempting to deploy from account:', accounts[0]);

        const balance = await web3.eth.getBalance(accounts[0]);
        console.log('Deployer account balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

        // Deploy contract to network
        const result = await new web3.eth.Contract(JSON.parse(compiledRecord.interface))
            .deploy({ data: compiledRecord.bytecode })
            .send({ gas: '5000000', from: accounts[0] });

        // Display the address of the contract 
        console.log('Contract successfully deployed to:', result.options.address);
        console.log('Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env with this address.');
    } catch (error) {
        console.error('An error occurred during deployment:', error.message || error);
    } finally {
        if (provider && provider.engine) {
            provider.engine.stop(); // Ensure the provider session is closed properly
        }
    }
};

deploy();
