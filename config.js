exports.DATABASE_URL = process.env.DATABASE_URL ||
                      'mongodb://localhost/quote-catcher';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY;
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-quotecatcher-app';
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||
                        'https://tutor-mavis-16558.netlify.com';