const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(glb|gltf)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                name: 'assets/[name].[hash].[ext]'
              }
            }
          ]
        }
      ]
    }
  }
})