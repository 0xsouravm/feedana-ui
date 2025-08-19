import { pinata } from './pinataConfig';

export async function addToIPFS(content: string, filename: string) {
  try {
    if (!pinata) {
      throw new Error("Pinata SDK not initialized. Please check environment variables.");
    }
    
    const file = new File([content], filename, { type: "application/json" });
    const upload = await pinata.upload.public.file(file);
    console.log("IPFS Upload successful:", upload);
    return upload; // Return the upload result with CID
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error; // Re-throw error for handling by caller
  }
}
  
export async function retrieveFromIPFS(cid: string) {
  try {
    if (!pinata) {
      throw new Error("Pinata SDK not initialized. Please check environment variables.");
    }
    
    const data = await pinata.gateways.public.get(cid);
    console.log("IPFS Data retrieved:", data);
    return data; // Return the retrieved data
  } catch (error) {
    console.error("Error retrieving from IPFS:", error);
    throw error; // Re-throw error for handling by caller
  }
}

export async function uploadImageToIPFS(imageBlob: Blob, filename: string) {
  try {
    if (!pinata) {
      throw new Error("Pinata SDK not initialized. Please check environment variables.");
    }
    
    // Create a File object from the Blob
    const file = new File([imageBlob], filename, { type: imageBlob.type || 'image/png' });
    
    // Upload to Pinata
    const upload = await pinata.upload.public.file(file);
    
    console.log("Image uploaded to IPFS successfully:", upload);
    return upload
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}