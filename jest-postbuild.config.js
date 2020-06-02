const { join } = require('path');

module.exports = {
  ...require('./jest.config'),
  moduleNameMapper: {
    ['^type-shift$']: join(__dirname, './lib')
  }
}