const yargs = require('yargs');
const request = require('request');
const fs = require('fs');

yargs
  .command(
    'login',
    'user authentication',
    yargs => {
      yargs
        .option('username', {
          alias: 'u',
          default: false,
        })
        .option('password', {
          alias: 'p',
          default: false,
        });
    },
    argv => {
      const {username, password} = argv;
      request.post(
        'http://localhost:3000/api/Configurators/login',
        {form: {username, password}},
        function(error, response, body) {
          if (error) return console.error('Login failed KO');
          const {id} = JSON.parse(body);
          if (error) return console.error('User unknown KO');
          fs.writeFileSync('.token', id);
          console.log('Login success OK');
        }
      );
    }
  )
  .command(
    'set',
    'new configuration creation',
    yargs => {
      yargs
        .option('name', {
          alias: 'n',
          default: false,
        })
        .option('revision', {
          alias: 'r',
          default: '0.0.1',
        })
        .option('file', {
          alias: 'f',
          default: false,
        });
    },
    argv => {
      const {name, revision, file} = argv;
      const token = fs.readFileSync('.token', 'utf8');
      if (!token) return console.error('Authentication required');
      const data = fs.readFileSync(file, 'utf8');
      request.post(
        `http://localhost:3000/api/Configurations?access_token=${token}`,
        {form: {version: revision, name, data}},
        function(error, response, body) {
          if (error) return console.error(error);
          const parsed = JSON.parse(body || {});
          if (parsed.error) return console.error(`${parsed.error.message} KO`);
          console.log('Configuration created OK');
        }
      );
    }
  )
  .command(
    'get',
    'configuration download and deployment',
    yargs => {
      yargs
        .option('name', {
          alias: 'n',
          default: false,
        })
        .option('revision', {
          alias: 'r',
          default: '0.0.1',
        })
        .option('stdout', {
          alias: 'f',
          default: false,
        });
    },
    argv => {
      const {name, revision, stdout} = argv;
      const token = fs.readFileSync('.token', 'utf8');
      if (!token) return console.error('Authentication required');
      const filter = encodeURIComponent(
        JSON.stringify({where: {name, version: revision}})
      );
      request.get(
        `http://localhost:3000/api/Configurations?filter=${filter}&access_token=${token}`,
        function(error, response, body) {
          if (error) return console.error(error);
          const parsed = JSON.parse(body || {});
          if (parsed.error) return console.error(`${parsed.error.message} KO`);
          fs.writeFileSync(stdout, parsed[0].data);
          console.log(`Version ${revision} written OK`);
        }
      );
    }
  ).argv;
