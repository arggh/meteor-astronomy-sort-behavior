Package.describe({
  summary: 'Sort behavior for Meteor Astronomy',
  version: '2.2.0',
  name: 'jagi:astronomy-sort-behavior',
  git: 'https://github.com/jagi/meteor-astronomy-sort-behavior.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2.1');

  api.use([
    'ecmascript',
    'es5-shim',
    'jagi:astronomy@2.3.3',
    'underscore'
  ], ['client', 'server']);

  api.mainModule('lib/main.js', ['client', 'server']);
});
