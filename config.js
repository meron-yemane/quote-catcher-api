exports.DATABASE_URL = process.env.MONGODB_URI || 
                       global.MONGODB_URI ||
                       'mongodb://localhost/quote-catcher';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'somerandomstring';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-quotecatcher-app';
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||
                        'https://young-eyrie-77920.herokuapp.com/';