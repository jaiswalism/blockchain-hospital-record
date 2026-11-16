const Web3 = require('web3');
const compiledRecord = require('./build/Record.json');
const fs = require('fs');
const path = require('path');

// Connect to local Ganache instance (default port 8545 or 7545)
const rpcUrl = process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

const deployLocal = async () => {
    try {
        console.log(`Connecting to local Ethereum node at ${rpcUrl}...`);
        const accounts = await web3.eth.getAccounts();
        
        if (!accounts || accounts.length === 0) {
            console.error('\x1b[31mError: No accounts found on local node. Is Ganache running on ' + rpcUrl + '?\x1b[0m');
            console.log('To start a local test node, run: npx ganache-cli -p 8545');
            process.exit(1);
        }

        console.log('Deploying from local account[0]:', accounts[0]);
        const balance = await web3.eth.getBalance(accounts[0]);
        console.log('Account Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

        const result = await new web3.eth.Contract(JSON.parse(compiledRecord.interface))
            .deploy({ data: compiledRecord.bytecode })
            .send({ gas: '6000000', from: accounts[0] });

        const deployedAddress = result.options.address;
        console.log('\n\x1b[32m✔ Contract successfully deployed to local network!\x1b[0m');
        console.log('\x1b[36mContract Address:\x1b[0m', deployedAddress);

        // Automatically update .env file with the new address
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
                envContent = envContent.replace(
                    /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
                    `NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`
                );
            } else {
                envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}\n`;
            }
            fs.writeFileSync(envPath, envContent);
            console.log(`\x1b[32m✔ Updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env with ${deployedAddress}\x1b[0m`);
        }

        console.log('\nNext steps:');
        console.log('1. Make sure your MetaMask network is set to Localhost (RPC: ' + rpcUrl + ', Chain ID: 1337).');
        console.log('2. Import one of Ganache\'s private keys into MetaMask.');
        console.log('3. Restart your dev server: npm run dev\n');

    } catch (err) {
        console.error('\x1b[31mDeployment failed:\x1b[0m', err.message || err);
    }
};

deployLocal();
