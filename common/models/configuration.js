'use strict';

const crypto = require('crypto');

module.exports = function(Configuration) {
  Configuration.beforeRemote('create', async (context, user, next) => {
    context.args.data.date = Date.now();
    if (!context.args.data.hash) {
      context.args.data.hash = crypto
        .createHash('md5')
        .update(context.args.data.data)
        .digest('hex');
    }

    const {version, name, hash} = context.args.data;

    const sameVersion = await Configuration.findOne({where: {name, version}});
    if (sameVersion) throw new Error(`Version ${version} already exists`);

    const latestVersion = await Configuration.findOne({
      where: {name, version: {gte: version}},
    });
    if (latestVersion)
      throw new Error(`Version ${version} is not > ${latestVersion.version}`);

    const noDiff = await Configuration.findOne({where: {name, hash}});
    if (noDiff) throw new Error('Configuration has not been updated (no diff)');

    return;
  });
};
