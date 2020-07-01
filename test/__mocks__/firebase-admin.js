const admin = jest.genMockFromModule('firebase-admin');

admin.initializeApp = jest.fn();

admin.auth = jest.fn(() => {
  return {
    currentUser: {
      getIdToken: jest.fn(refresh => {
        return Promise.resolve('123456789');
      })
    }
  };
});

module.exports = admin;
