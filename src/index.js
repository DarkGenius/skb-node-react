import express from 'express';
import cors from 'cors';

let fs = require('fs');
var fetch = require('node-fetch');

var router3B = require('./router3B');

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

app.get('/2D', (req, res) => {
  let result = "Invalid color";
  let color = req.query.color;
  const re = [
    /^#?([0-9a-f]{6})$/, // color = 123abc
    /^#?([0-9a-f]{3})$/, // color = fff
    /^rgb\(\s*([0-9]{1,3})\s*\,\s*([0-9]{1,3})\s*\,\s*([0-9]{1,3})\s*\)$/, // color = rgb()
    /^hsl\(\s*([0-9]{1,3})\s*\,\s*([0-9]{1,3})\%\s*\,\s*([0-9]{1,3})\%\s*\)$/, // color = hsl()
  ];

  let hsl2rgb = (h,s,l) => {
    console.log(`(h,s,l)=${h}, ${s}, ${l}`);
    s = s / 100;
    l = l / 100;
    const c = (1 - Math.abs(2*l - 1))*s; //C = (1 - |2L - 1|) × S
    const x = c * (1 - Math.abs((h/60) % 2 - 1)); //X = C × (1 - |(H / 60°) mod 2 - 1|)
    const m = l - (c/2); // L - C/2
    console.log(`(c,x,m)=${c}, ${x}, ${m}`);
    let r1, g1, b1;
    if (h >=0 && h < 60)
      [r1, g1, b1] = [c, x, 0];
    else if (h >=60 && h < 120)
      [r1, g1, b1] = [x, c, 0];
    else if (h >=120 && h < 180)
      [r1, g1, b1] = [0, c, x];
    else if (h >=180 && h < 240)
      [r1, g1, b1] = [0, x, c];
    else if (h >=240 && h < 300)
      [r1, g1, b1] = [x, 0, c];
    else if (h >=300 && h < 360)
      [r1, g1, b1] = [c, 0, x];
    console.log('rgb=', [r1, g1, b1].map(v => Math.round((v+m)*255)));
    return [r1, g1, b1].map(v => Math.round((v+m)*255));
  }

  let trans = [
    (t) =>`#${t[1]}`,
    (t) => `#${t[1].split("").map((x) => x+x).join("")}`,
    (t) => `#${[+t[1],+t[2],+t[3]].map((v) => {
      const h = ~~(v/16);
      const l = v % 16;
      console.log(`v=${v} h=${h} l=${l}`)
      return h.toString(16) + l.toString(16);
    }).join("")}`,
    (t) => trans[2]([null].concat(hsl2rgb(t[1], t[2], t[3])))
  ];

  let validators = [
    null,
    null,
    (t) => [+t[1],+t[2],+t[3]].reduce((prev, curr) => prev && (curr>=0 && curr <=255), true),
    (t) => [[+t[1], 0, 360],[+t[2], 0, 101],[+t[3], 0, 101]].reduce((prev, curr) => prev && (curr[0]>=curr[1] && curr[0] < curr[2]), true)
  ]
  console.log(`color=${color}`)
  if (color){
    color = color.toLowerCase().trim().replace(/%20/g, ' ')
    let t;

    for (let i=0, l = re.length; i<l; i++){
      let t = color.match(re[i]);
      if (t && (!validators[i] || validators[i](t))) {
        result = trans[i](t);
        break;
      }
    }

  }

  res.send(result);
});

let func;

app.get('/2X', (req, res) => {
    let i = +req.query.i;

    let dict = {
      0: 1,
      1: 18,
      2: 243,
      3: 3240,
      4: 43254,
      5: 577368,
      6: 7706988,
      7: 102876480,
      8: 1373243544,
      9: 18330699168,
      10: 244686773808,
      11: 3266193870720,
      12: 43598688377184,
      13: 581975750199168,
      14: 7768485393179328,
      15: 103697388221736960,
      16: 1384201395738071424,
      17: 18476969736848122368,
      18: 246639261965462754048
    }

    let interpolate = (dict) => {
      const x = Object.keys(dict);
      const n = x.length;
      let terms = []
      for (let i=0; i<n; i++){
        let f = (t) => 1;
        for (let j=0; j<n; j++){
          if (j == i) continue;
          const g = f.bind({});
          f = (t) => g(t)*(t-x[j])/(x[i]-x[j]);
        }
        terms.push((t) => dict[x[i]]*f(t));
      }
      return terms.reduce((acc, curr, i) => {
        const g = acc.bind({});
        return (t) => g(t) + curr(t);
      } , (t) => 0);
    };

    if (!func) func = interpolate(dict);

    res.send(""+func(i));

  });

app.use('/3B', router3B);

app.get('/3C/:metric?', (req, res) => {
  const fname = "pokemons.json";
  const metric = req.params.metric || "default";
  let limit = +req.query.limit || 20;
  let offset = +req.query.offset || 0;

  console.log(`metric=${metric}\nlimit=${limit}\noffset=${offset}`);

  const defSort = (a,b) => {
    if (a.name > b.name) return 1;
    else if (a.name < b.name) return -1;
    else return 0;
  };

  const makeSort = (func, desc=false) => (a,b) => {
   let result = (func(a)-func(b)) * (desc ? 1 : -1);
   if (result == 0) result = defSort(a, b);
   return result;
  }


  const sorts = {
    "default": defSort,
    "fat": makeSort((pokemon) => (pokemon.weight / pokemon.height)),
    "angular": makeSort((pokemon) => (pokemon.weight / pokemon.height), true),
    "heavy": makeSort((pokemon) => pokemon.weight),
    "light": makeSort((pokemon) => pokemon.weight, true),
    "huge": makeSort((pokemon) => pokemon.height),
    "micro": makeSort((pokemon) => pokemon.height, true)
  };

  let data = JSON.parse(fs.readFileSync(fname));

  data.sort(sorts[metric]);
  console.log(data[0]);
  data = data.map((pokemon) => pokemon.name);

  res.json(data.slice(offset, offset+limit));
})

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
