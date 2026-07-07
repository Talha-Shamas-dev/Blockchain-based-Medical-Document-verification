// Mock cache service — real one uses Redis
export default {
  getOrFetch: async (key, ttl, fetchFn) => fetchFn(),
  invalidateRecord: async (recordID) => {},
  invalidatePatient: async (patientID) => {},
  key: { record: (id) => `record:${id}`, patientRecords: (id) => `patient:${id}`, history: (id) => `history:${id}` },
  healthCheck: async () => ({ status: 'ok' }),
  stats: async () => ({ hits: 0, misses: 0 }),
};
