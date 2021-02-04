var {merge} = require('webpack-merge');
var base = require('./webpack.config.base');

module.exports = merge(base, {
    mode: 'development'
})