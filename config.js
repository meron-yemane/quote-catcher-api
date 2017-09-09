exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/quote-catcher';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = 'somerandomstring';
exports.JWT_EXPIRY = process.env.JWT_SECRET || '7d';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-quotecatcher-app';
