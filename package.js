Package.describe({
  summary: 'Sort behavior for Meteor Astronomy',
  version: '2.0.0',
  name: 'jagi:astronomy-sort-behavior',
  git: 'https://github.com/jagi/meteor-astronomy-sort-behavior.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');

  api.use([
    'ecmascript',
    'es5-shim',
    'jagi:astronomy@2.0.0',
    'underscore'
  ], ['client', 'server']);

  api.mainModule('lib/main.js', ['client', 'server']);
});
