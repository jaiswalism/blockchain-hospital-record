import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // We are in the browser and MetaMask is running.
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server OR the user is not running MetaMask.
  const defaultRpc =
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.RPC_URL ||
    'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID';
  const provider = new Web3.providers.HttpProvider(defaultRpc);
  web3 = new Web3(provider);
}

export default web3;
