import { PinataSDK } from "pinata"

// Check if environment variables are available (React uses REACT_APP_ prefix)
const pinataJwt = process.env.REACT_APP_PINATA_JWT;
const gatewayUrl = process.env.REACT_APP_GATEWAY_URL;

if (!pinataJwt || !gatewayUrl) {
  console.warn('Pinata environment variables not set. IPFS functionality will not work.');
  console.warn('Make sure you have REACT_APP_PINATA_JWT and REACT_APP_GATEWAY_URL in your .env file');
}

export const pinata = pinataJwt && gatewayUrl ? new PinataSDK({
  pinataJwt: pinataJwt,
  pinataGateway: gatewayUrl
}) : null;

console.log('Pinata JWT available:', !!pinataJwt);
console.log('Gateway URL available:', !!gatewayUrl);