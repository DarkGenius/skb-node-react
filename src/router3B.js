import express from 'express';

let fs = require('fs');
var fetch = require('node-fetch');

let router = express.Router();

let ensureData = async (req, res, next) => {
  let data = await getPetsJSON();
  req.data = data;
  next();
};

router.use(ensureData);

router.use((req, res, next) => {
  if (req.url.indexOf('/populate') > -1){
    req.url = req.url.replace('/populate', '');
    req.populate = true;
    console.log('populate');
  }
  next();
});

router.get('/', (req, res) => {
  res.json(req.data);
});

const result404 = "Not Found";

router.get('/users', (req, res) => {
  let users = req.data.users;
  const queryKeys = Object.keys(req.query);

  const filters = {
    "havepet": (val) => ((user) => (req.data.pets.filter((pet) => pet.userId == user.id && pet.type == val)).length > 0)
  };

  Object.keys(filters).forEach((key) => {
    let index;
    if ((index = queryKeys.map((s) => s.toLowerCase()).indexOf(key)) > -1){
      const paramValue = req.query[queryKeys[index]];
      if (users && users.length){
        users = users.filter(filters[key](paramValue));
      }
    }
  });

  if (req.populate){
    users = users.map((user) => {
      user.pets = req.data.pets.filter((pet) => pet.userId == user.id);
      return user;
    });
  }

  users.sort((a,b) => a.id - b.id);
  res.json(users || []);
});

let getUserByIdOrName = (data, id) => {
  let result = null;
  data = data["users"];
  if (data && data.length){
    const key = (id == +id) ? "id" : "username";
    const user = data.filter((item) => item[key] == id);
    if (user.length){
      return user.shift();
    }
  }

  return result;
}

let getPetById = (data, id) => {
  let result = null;
  data = data["pets"];
  if (data && data.length){
    const pet = data.filter((item) => item["id"] == id);
    if (pet.length){
      return pet.shift();
    }
  }
  return result;
}

router.get('/users/:id', (req, res) => {
  const id = req.params.id;

  const user = getUserByIdOrName(req.data, id);
  if (user){
    if (req.populate){
      user.pets = req.data.pets.filter((pet) => pet.userId == user.id);
    }
    res.json(user);
    return;
  }

  res.status(404).send(result404);
});

router.get('/users/:id/pets', (req, res) => {
  const id = req.params.id;

  const user = getUserByIdOrName(req.data, id);
  if (user){
    const pets = req.data["pets"];
    if (pets && pets.length){
      const userpets = pets.filter((item) => item.userId == user.id);
      if (userpets && userpets.length){
        userpets.sort((a,b) => a.id - b.id);
        res.json(userpets);
        return;
      }
    }
  }

  res.status(404).send(result404);
});

router.get('/pets', (req, res) => {
  let pets = req.data.pets;

  const queryKeys = Object.keys(req.query);

  const filters = {
    "type": (type) => ((pet) => pet.type == type),
    "age_gt": (val) => ((pet) => pet.age > +val),
    "age_lt": (val) => ((pet) => pet.age < +val)
  };

  Object.keys(filters).forEach((key) => {
    let index;
    if ((index = queryKeys.map((s) => s.toLowerCase()).indexOf(key)) > -1){
      const paramValue = req.query[queryKeys[index]];
      if (pets && pets.length){
        pets = pets.filter(filters[key](paramValue));
      }
    }
  });

  if (req.populate){
    pets.forEach((pet) => {
      pet.user = getUserByIdOrName(req.data, pet.userId);
    });
  }

  pets.sort((a,b) => a.id - b.id);
  res.json(pets || []);
});

router.get('/pets/:id', (req, res) => {
  const id = req.params.id;

  if (id == +id){
    const pet = getPetById(req.data, id);
    if (pet){
      if (req.populate)
        pet.user = getUserByIdOrName(req.data, pet.userId);
      res.json(pet);
      return;
    }
  }

  res.status(404).send(result404);
});

// get data for task 3B
let getPetsJSON = async () => {
  let data = {};
  const dataUrl = 'https://gist.githubusercontent.com/isuvorov/55f38b82ce263836dadc0503845db4da/raw/pets.json';
  const fname = 'pets.json';
  if (!fs.existsSync(fname)) {
    await fetch(dataUrl)
    .then(async (res) => {
      data = await res.json();
      let txt = JSON.stringify(data);
      console.log(txt);
      fs.writeFileSync(fname, txt);
    })
    .catch(err => {
      console.log('error get pets.json', err);
    });
  } else {
    data = JSON.parse(fs.readFileSync(fname));
    console.log("read data from file");
  }
  return data;
};

module.exports = router;
