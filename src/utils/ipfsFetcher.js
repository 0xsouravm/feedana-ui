// Utility for fetching board data from IPFS using CID
export const ipfsFetcher = {
  // Get IPFS gateway URL from environment
  getGatewayUrl() {
    const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || import.meta.env.NEXT_PUBLIC_GATEWAY_URL;
    if (!gatewayUrl) {
      console.warn('Gateway URL not found in environment variables, IPFS features disabled');
      return null;
    }
    return `https://${gatewayUrl}/ipfs`;
  },

  // Fetch board data from IPFS using CID
  async fetchBoardData(cid) {
    try {
      if (!cid || cid === 'local-only') {
        console.log('No IPFS CID provided or local-only board:', cid);
        return null;
      }

      const gatewayUrl = this.getGatewayUrl();
      if (!gatewayUrl) {
        throw new Error('IPFS gateway URL not configured');
      }

      const url = `${gatewayUrl}/${cid}`;
      console.log('Fetching board data from IPFS:', url);

      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`IPFS fetch failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const boardData = await response.json();
      console.log('Successfully fetched board data from IPFS:', boardData);
      
      return boardData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('IPFS fetch timeout for CID:', cid);
      } else {
        console.warn('IPFS fetch error for CID:', cid, error.message);
      }
      return null; // Return null instead of throwing to handle gracefully
    }
  },

  // Fetch multiple boards from IPFS
  async fetchMultipleBoardData(cids) {
    try {
      if (!Array.isArray(cids) || cids.length === 0) {
        return [];
      }

      console.log(`Fetching ${cids.length} boards from IPFS...`);
      
      // Fetch all boards in parallel but limit concurrency
      const BATCH_SIZE = 5; // Process 5 at a time to avoid overwhelming the gateway
      const results = [];
      
      for (let i = 0; i < cids.length; i += BATCH_SIZE) {
        const batch = cids.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (cid) => {
          const data = await this.fetchBoardData(cid);
          return { cid, data };
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      console.log(`Successfully fetched ${results.filter(r => r.data).length} of ${cids.length} boards from IPFS`);
      return results;
    } catch (error) {
      console.error('Error fetching multiple boards from IPFS:', error);
      return [];
    }
  },

  // Check if IPFS service is available
  isAvailable() {
    return Boolean(this.getGatewayUrl());
  }
};

export default ipfsFetcher;