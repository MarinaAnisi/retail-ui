const baseConfig = require('./base.config');
const { commonSections, versionsSection, ROOT_DIR } = require('../helpers');

const config = Object.assign({}, baseConfig, {
  styleguideDir: ROOT_DIR,
  components: [],
  sections: [...commonSections, versionsSection],
  styleguideComponents: {
    PathlineRenderer: require.resolve('../components/Pathline/PathlineRenderer.tsx'),
  },
});

module.exports = config;