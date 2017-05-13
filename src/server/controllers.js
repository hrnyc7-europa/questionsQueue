const Question = require('./db/db-schema');
const User = require('./db/user');
const Cohort = require('./db/cohort.js');
const rp = require('request-promise');

//TOWN HALL / COHORT --------------------->

exports.getCohort = (req, res) => {
  console.log('th cookie', req.cookies)
  Cohort.oneCohort((err, Cohort) => {
    if(err) res.status(500).send(err);
    else res.status(200).send(Cohort);
    console.log('Cohort get', Cohort)
  }, req.cookies.cohort)
}

exports.getAllCohorts = (req, res) => {
  Cohort.Cohort.find({}, (err, cohorts) => {
    if (err) res.status(404).send(err);
    else res.status(200).send(cohorts)
  })
}

exports.deleteCohort = (req,res) => {
  console.log('delete req.body', req.body);
  User.remove({cohort: req.body.cohort}, err => {
    if (err) console.log(err);
  });
  Cohort.Cohort.findOneAndRemove({cohort: req.body.cohort}, (err, cohort) => {
    if (err) res.status(404).send(err);
    else res.status(202).send()
  })
}

exports.createCohort = (req, res) => {
  Cohort.Cohort.create(req.body, (err, newCohort) => {
    if (err) res.status(404).send(err);
    else res.status(200).send(newCohort)
  })
}

exports.nextTownHall = (req, res) => {
  Cohort.oneCohort((err, Cohort)=>{
    if(err) res.status(500).send(err);
    else {
      Cohort.townHall++;
      Cohort.startDate = new Date();
      Cohort.save(err => {
        if(err) throw(err);
      });
      console.log('updated Cohort', Cohort)
    }
  }, req.cookies.cohort)
}

// USERS-------------------------->
exports.getUsers = (req, res) => {
  User.find({}, (err, users) => {
    if (err) res.status(404).send(err);
    else res.status(200).send(users);
  });
};

// USER PROFILE -------------------------->

exports.getCurrentUser = (req, res) => {
  User.find({username: req.params.username}, (err, users) => {
    if (err) res.status(404).send(err);
    // array looks like [ { user } ]
    else res.status(200).send(users[0]);
  });
};

exports.updateCurrentUser = (req, res) => {
  // id = req.body.user._id;
  console.log('UPDATE USER!!!!!', req.body, typeof req.body)
  User.findByIdAndUpdate(req.body._id, req.body, (err, user) => {
    if (err) res.status(404).send(err);
    else res.status(200).send(user);
  });
};

// ACCEPTS ARRAY, send obj with users property of array of users
exports.postUsers = (req, res) => {
  let [accepted, denied] = [0,0]
  let flag = false;
  console.log(req.body);
  req.body.users.forEach((user, idx) => {
    User.findOne({username:user.username}, (err, foundUser) => {
      if(foundUser !== null) denied++;
      let newUser = new User(user)
      console.log('gn', newUser.givenName===null)
      if(newUser.givenName == null){
        console.log('just before rp')
        rp.get({
          uri:'https://api.github.com/users/'+newUser.username,
          headers:{
            'User-Agent':'Questions-Queue-App'
          }
        })
        .then(data => {
          useData=JSON.parse(data)
          if(useData.name) newUser.givenName = useData.name;
          accepted++
          newUser.save((err, user) => {
            if (err) {
              accepted--
              denied++
              res.status(500);
              console.log(err);
            } else {
              console.log('user created', user)
            }
          })
        })
        .catch(err => {
          denied++
          console.log('github error')
        })
      } else {
        accepted++
        newUser.save((err, user) => {
          if (err) {
            accepted--
            denied++
            res.status(500);
            console.log(err);
          } else {
            console.log('user created', user)
          }
        })
      }
      if(idx === req.body.users.length-1) flag = true;
    })
    .then(()=> {
      if(!flag) return;
      console.log('right before res send', accepted, denied)
      res.json([accepted, denied])
    })
  })
}

exports.deleteUser = (req,res) => {
  User.findByIdAndRemove(req.body)
  .then(() => res.status(202).send());
}

// QUESTIONS-------------------------------->
exports.getQuestions = (req, res) => {
  Question.find({}, (err, questions) => {
    if (err) res.status(404).send(err);
    else {
      res.status(200).send(questions);
    }
  });
};

exports.postQuestion = (req, res) => {
  console.log(req.body);

  const newQuestion = new Question({
    questionText: req.body.text,
    codeSnippet: req.body.code,
    votes: 0,
    answered: false,
    tags: req.body.tags,
    username: req.body.username,
    townHall: req.body.townHall,
    cohort: req.body.cohort,
    createdAt: req.body.createdAt,
    answer: req.body.answer
  });
  newQuestion.markModified('tags');
  newQuestion.save((err, question) => {
    if (err) res.status(500).send(err);
    else res.status(200).send(question);
  });
};

exports.updateQuestion = (req, res) => {
  const id = req.body._id;
  Question.findByIdAndUpdate(id, req.body, { new: true }, (err, data) => {
    if (err) res.status(500).send(err);
    res.send(data);
  });
};

exports.deleteQuestion = (req, res) => {
  Question.findByIdAndRemove(req.body)
  .then(() => res.status(202).send());
};
