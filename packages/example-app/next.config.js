const { withSwrApiEndpoints } = require("@next-fetch/swr");
const { withReactQueryApiEndpoints } = require("@next-fetch/react-query");

module.exports = withReactQueryApiEndpoints(withSwrApiEndpoints());
