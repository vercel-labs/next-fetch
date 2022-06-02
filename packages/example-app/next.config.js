// /**
//  * @param {import('next').NextConfig} given
//  * @returns {import('next').NextConfig}
//  */
// function withSwrApiEndpoints(given = {}) {
//   return {
//     ...given,
//     webpack(config, context) {
//       config.module.rules.unshift({
//         test: /\.api\./,
//         issuerLayer: "api",
//         use: [
//           require.resolve("next-swr-endpoints/dist/swr-server-endpoint-loader"),
//           context.defaultLoaders.babel,
//         ],
//       });
//       config.module.rules.unshift({
//         test: /\.api\./,
//         use: [
//           require.resolve("next-swr-endpoints/dist/swr-client-endpoint-loader"),
//           context.defaultLoaders.babel,
//         ],
//       });
//       return given.webpack ? given.webpack(config, context) : config;
//     },
//     pageExtensions: (
//       given.pageExtensions ?? ["js", "jsx", "ts", "tsx"]
//     ).flatMap((value) => {
//       return [value, `api.${value}`];
//     }),
//   };
// }

// const config = withSwrApiEndpoints();
// module.exports = config;

const { withSwrApiEndpoints } = require("next-swr-endpoints");

module.exports = withSwrApiEndpoints();
