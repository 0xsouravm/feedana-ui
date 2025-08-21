// import React, { useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// // import { ed25519 } from '@noble/ed25519';

// const WalletTest = () => {
//   const { connected, publicKey, signMessage } = useWallet();
//   const [message, setMessage] = useState('');
//   const [signature, setSignature] = useState('');
//   const [verificationResult, setVerificationResult] = useState('');
  
//   const handleSignMessage = async () => {
//     if (!connected || !signMessage || !message.trim()) return;
    
//     try {
//       const encodedMessage = new TextEncoder().encode(message);
//       const signedMessage = await signMessage(encodedMessage);
//       const signatureBase64 = Buffer.from(signedMessage).toString('base64');
//       setSignature(signatureBase64);
//       setVerificationResult('');
//     } catch (error) {
//       console.error('Error signing:', error);
//       setSignature('Error: ' + error.message);
//     }
//   };

//   const handleVerifyMessage = async () => {
//     if (!publicKey || !message.trim() || !signature.trim()) return;
    
//     try {
//       const encodedMessage = new TextEncoder().encode(message);
//       const signatureBytes = Buffer.from(signature, 'base64');
//       const publicKeyBytes = publicKey.toBytes();
      
//       const isValid = await ed25519.verify(signatureBytes, encodedMessage, publicKeyBytes);
//       setVerificationResult(isValid ? '✅ Valid signature!' : '❌ Invalid signature!');
//     } catch (error) {
//       setVerificationResult('❌ Verification error: ' + error.message);
//     }
//   };
  
//   return (
//     <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
//       <h1>Wallet Message Signing Test</h1>
//       <p>Wallet Status: {connected ? '✅ Connected' : '❌ Not Connected'}</p>
//       {connected && publicKey && (
//         <p>Public Key: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}</p>
//       )}
      
//       <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
//         <h2>Message Signing</h2>
//         <textarea 
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Enter message to sign..." 
//           style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
//         />
//         <button 
//           onClick={handleSignMessage}
//           style={{ padding: '10px 20px', backgroundColor: connected ? '#0066cc' : '#666', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}
//           disabled={!connected || !message.trim()}
//         >
//           Sign Message
//         </button>
        
//         {signature && (
//           <div style={{ marginTop: '20px' }}>
//             <h3>Signature (Base64):</h3>
//             <textarea 
//               value={signature}
//               readOnly
//               style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
//             />
//             <button 
//               onClick={handleVerifyMessage}
//               style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginTop: '10px' }}
//             >
//               Verify Signature
//             </button>
            
//             {verificationResult && (
//               <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#333', borderRadius: '4px' }}>
//                 {verificationResult}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
      
//       <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
//         <p>Instructions:</p>
//         <ol>
//           <li>Connect your wallet using the header or another wallet connection UI</li>
//           <li>Enter a message to sign</li>
//           <li>Click "Sign Message" to create a signature</li>
//           <li>Click "Verify Signature" to cryptographically verify the signature</li>
//         </ol>
//       </div>
//     </div>
//   );
// };

// export default WalletTest;