// Note: to run tests with ES modules and Jest, ensure Babel is set up correctly.
// npm install --save-dev @babel/preset-env
module.exports = {
	presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
};
