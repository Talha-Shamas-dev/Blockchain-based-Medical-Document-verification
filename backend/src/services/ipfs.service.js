// Mock IPFS — replace with real Pinata logic
export default {
  upload: async (buffer, filename) => {
    const hash = 'Qm' + Math.random().toString(36).slice(2, 10);
    return { ipfsCID: hash, fileHash: buffer.toString('hex').slice(0, 16), encryptedSize: buffer.length };
  },
  gatewayUrl: (cid) => `https://ipfs.io/ipfs/${cid}`,
  healthCheck: async () => ({ status: 'ok' }),
};
