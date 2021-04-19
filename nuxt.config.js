const routerBase = process.env.DEPLOY_ENV === 'GH_PAGES' ? {
  router: {
    base: '/AeroDemo/'
  }
} : {
  router: {
    base: '/'
  }
}


export default {
  ...routerBase,

  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
        // Favicons
        {rel: 'icon', href: '/favicons/favicon.svg'},
    ],

    script: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.8.0/p5.min.js",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.8.0/addons/p5.dom.min.js",
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.8.0/addons/p5.sound.min.js",
      },
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [
      '@/assets/scss/style.scss',
  ],
  styleResources: {
      scss: '~/assets/scss/shared/*.scss',
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/plugins.client.js' }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/style-resources',
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.module.rules.push({
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      })
    },
  },
}
