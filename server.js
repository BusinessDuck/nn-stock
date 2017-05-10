const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: {
    "/api": {
      "target": {
        "host": "marketdata.websol.barchart.com",
        "protocol": 'http',
        "port": 80
      },
      ignorePath: true,
      changeOrigin: true,
      secure: false
    }
  }
}).listen(5000, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:5000');
});
