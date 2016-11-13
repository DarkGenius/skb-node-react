import express from 'express';
import cors from 'cors';

let fs = require('fs');
var fetch = require('node-fetch');

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

app.get(/^\/3A\/.*$/, async (req, res) => {
  let result = {};
  let data = await getPCJSON();
  const path = req.path.split("/").slice(2);
  let r;
  if (path.length == 1 && path[0] == '') res.json(data);
  else {
    if (data.hdd && path.length == 1 && path[0] == "volumes"){
      let volume = data.hdd.reduce((prev, curr) => {
        const letter = curr["volume"];
        prev[letter] = ~~prev[letter] + curr["size"];
        return prev;
      }, {});
      Object.keys(volume).forEach((key) => {
        volume[key] += "B";
      });
      data["volumes"] = volume;
    }

    r = path.reduce((prev, curr) => {
      if (prev === undefined) return undefined;
      if (prev.hasOwnProperty(curr) && (prev.constructor()[curr] === undefined)) return prev[curr];
      if (curr == "") return prev;
      return undefined;
    }, data)
    if (r === undefined){
      res.status(404).send("Not Found");
    }
    else {
      result = r;
      res.json(result);
    }
  }
})

// get data for task 3A
let getPCJSON = async () => {
  let pc = {}
  const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';
  const fname = 'pc.json';
  if (!fs.existsSync(fname)) {
    fetch(pcUrl)
    .then(async (res) => {
      pc = await res.json();
      let txt = JSON.stringify(pc);
      fs.writeFileSync(fname, txt);
    })
    .catch(err => {
      console.log('error get pc.json', err);
    });
  }
  else {
    pc = JSON.parse(fs.readFileSync(fname));
    console.log("read data from file");
  }
  return pc
}


app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
