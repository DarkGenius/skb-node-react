import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.json({
    hello: 'JS World',
  });
});

app.get('/2B', (req, res) => {
    let fullname = req.query.fullname;
    let result = 'Invalid fullname';
    if (fullname) {
      // const re = /\p{Lu}\p{Ll}*/g;
      // let data = [];
      // let r;
      // while (r = re.exec(fullname)) {
      //   data.push(r[0]);
      // }
      //fullname = fullname.replace(/\//g, ' ');
      console.log(`fullname=${fullname}`);
      let data = fullname.split(' ')
        .filter((v) => v.trim().length > 0)
        .map((v) => v[0].toLocaleUpperCase() + v.substr(1).toLocaleLowerCase());
      console.log(JSON.stringify(data));

      if ((data.length > 0) && (data.length < 4)) {
        const testval = data.map((v) => {
          let test = v.split('').reduce((p, c, i) => {
            return p +  +!(c.match(/.*[\d_\/].*/) == null);
          }, 0);
          console.log(`val=${v}, test=${test}`);
          return test;
        }).reduce((p, c)=>p + c, 0);
        console.log(`testval=${testval}`);
        if (testval == 0) {
          const lastname = data.pop();
          result = lastname + ' ' + data.map((val) => val[0] + '.').join(' ');
        }
      }

    }

    res.send(result.trim());
  });

app.get('/2C', (req, res) => {
    let result = 'Invalid username';
    let username = req.query.username;

    if (username) {
      console.log(`username=${username}`);
      const re = /^((https?:)?\/\/)?([^\/]*\/)?@?([^\s\?\/]+)([\?\/].*)?$/;
      const m = username.match(re);
      console.log(m);
      if (m[4]) result = `@${m[4]}`;
    }

    res.send(result);
  });

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
