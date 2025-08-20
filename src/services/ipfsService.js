// Lazy-loaded IPFS service to prevent initialization blocking
let pinataSDK = null;
let initializationPromise = null;

const initializePinata = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Check environment variables first
      const pinataJwt = import.meta.env.VITE_PINATA_JWT || import.meta.env.NEXT_PUBLIC_PINATA_JWT;
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || import.meta.env.NEXT_PUBLIC_GATEWAY_URL;

      if (!pinataJwt || !gatewayUrl) {
        console.warn('IPFS: Environment variables not set');
        return null;
      }

      // Dynamically import Pinata SDK to prevent blocking
      const { PinataSDK } = await import('pinata');
      
      pinataSDK = new PinataSDK({
        pinataJwt: pinataJwt,
        pinataGateway: gatewayUrl
      });

      console.log('IPFS: Pinata SDK initialized successfully');
      return pinataSDK;
    } catch (error) {
      console.error('IPFS: Failed to initialize Pinata SDK:', error);
      return null;
    }
  })();

  return initializationPromise;
};

export const ipfsService = {
  async uploadBoardToIPFS(boardData) {
    try {
      const sdk = await initializePinata();
      if (!sdk) {
        throw new Error('IPFS service not available');
      }

      // Get gateway URL
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || import.meta.env.NEXT_PUBLIC_GATEWAY_URL;

      const jsonContent = JSON.stringify(boardData, null, 2);
      const filename = `board_${boardData.boardId}_${Date.now()}.json`;
      
      const file = new File([jsonContent], filename, { type: 'application/json' });
      const upload = await sdk.upload.public.file(file);
      
      console.log('IPFS: Board uploaded successfully:', upload);
      return {
        success: true,
        cid: upload.cid,
        ipfsHash: upload.IpfsHash,
        url: `https://${gatewayUrl}/ipfs/${upload.cid}`
      };
    } catch (error) {
      console.error('IPFS: Upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getBoardFromIPFS(cid) {
    try {
      const sdk = await initializePinata();
      if (!sdk) {
        throw new Error('IPFS service not available');
      }

      const data = await sdk.gateways.public.get(cid);
      console.log('IPFS: Board retrieved successfully');
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('IPFS: Retrieval failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check if IPFS is available without initializing
  isAvailable() {
    const pinataJwt = import.meta.env.VITE_PINATA_JWT || import.meta.env.NEXT_PUBLIC_PINATA_JWT;
    const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || import.meta.env.NEXT_PUBLIC_GATEWAY_URL;
    return !!(pinataJwt && gatewayUrl);
  }
};