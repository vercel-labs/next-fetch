const { withSwrApiEndpoints } = require("next-swr-endpoints");
const { withReactQueryApiEndpoints } = require("next-rq-endpoints");

module.exports = withReactQueryApiEndpoints(withSwrApiEndpoints());
