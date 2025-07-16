// Temporary mock Firebase configuration for development
const mockDb = {
  collection: () => ({
    doc: () => ({
      set: async () => ({ id: 'mock-id' }),
      get: async () => ({ exists: false, data: () => ({}) }),
      update: async () => ({}),
      delete: async () => ({}),
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({
      get: async () => ({ docs: [] }),
    }),
    get: async () => ({ docs: [] }),
  }),
};

const mockAuth = {
  verifyIdToken: async () => ({ uid: 'mock-user-id' }),
  createUser: async () => ({ uid: 'mock-user-id' }),
  updateUser: async () => ({ uid: 'mock-user-id' }),
  deleteUser: async () => ({}),
};

// Export mock objects for development
export const db = mockDb as any;
export const auth = mockAuth as any;

const mockApp = {
  name: 'mock-app',
  options: {},
};

export default mockApp;
