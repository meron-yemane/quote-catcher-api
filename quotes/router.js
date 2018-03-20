const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');

const {Quotes} = require('./model');
const {User} = require('../users/models');

const quotesRouter = express.Router();

quotesRouter.post('/create', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!('quoteString' in req.body)) {
    const message = 'Missing quote in request body';
    return res.status(400).send(message);
  };
  if (req.body.author !== undefined) {
    req.body.author = req.body.author.trim();
  }
  Quotes.create({quoteString: req.body.quoteString.trim(), author: req.body.author || 'Unknown', theme: req.body.theme || ["None"]}, (err, quote) => {
     if (err) {
       return res.status(400);
     }
     User
      .findOneAndUpdate({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub}, { $push: { _quotes: quote } }, (err) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          return res.status(201).json(quote);
        }
      });
  });
});

quotesRouter.post('/addtheme/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!('theme' in req.body)) {
    const message = 'Missing theme in request body';
    return res.status(400).send(message);
  };
  if(!(req.params.id === req.body._id)) {
    const message = ('Request path id must match request body id');
    res.status(400).json({message: 'Request path id must match request body id'});
  };
  Quotes 
    .findById(req.params.id, (err, quote) => {
      if (err) {
        return res.status(400);
      };
      if (quote.theme.includes(req.body.theme)) {
        const message = ('The theme you want to add already exists for this quote');
        return res.json(message);
      };
      if (quote.theme.includes("None")) {
        quote.theme = req.body.theme
      } else {
        quote.theme = quote.theme.concat(req.body.theme);
      }
      quote.save(err => {
        if (err) {
          return res.status(400);
        }
        res.status(201).json(quote);
      });
    });
  User
    .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})

});

quotesRouter.put('/quotealter/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!(req.params.id === req.body._id)) {
    const message = ('Request path id must match request body id');
    res.status(400).json({message: 'Request path id must match request body id'});
  };
  Quotes
  .findByIdAndUpdate({_id: req.params.id}, {$set: {quoteString: req.body.quoteString}}, {new: true}, (err, quote) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(quote);
  });
});

quotesRouter.put('/authoralter/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!(req.params.id === req.body._id)) {
    const message = ('Request path id must match request body id');
    res.status(400).json({message: 'Request path id must match request body id'});
  }; 
  Quotes 
  .findByIdAndUpdate({_id: req.params.id}, {$set: {author: req.body.author}}, {new: true}, (err, quote) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(quote);
  });
});

quotesRouter.put('/demoquotes', passport.authenticate('jwt', {session: false}), (req, res) => {
  let demoResponseQuotes = [{"theme":["Spirituality","Happiness","Loss"],"_id":"5aa6fb1e1b650363a36e4d61","quoteString":"There are as many nights as days, and the one is just as long as the other in the year's course. Even a happy life cannot be without a measure of darkness, and the word \"happy\" would lose its meaning if it were not balanced by sadness.","author":"Carl Jung","__v":0},{"theme":["Fear","Motivation","Adventure","Failure"],"_id":"5aa6fb9d1b650363a36e4d62","quoteString":"Security is mostly a superstition. It does not exist in nature, nor do the children of men as a whole experience it. Avoiding danger is no safer in the long run than outright exposure. Life is either a daring adventure, or nothing.","author":"Helen Keller","__v":0},{"theme":["Happiness"],"_id":"5aa6fc2b1b650363a36e4d63","quoteString":"For happiness, how little suffices for happiness! The least thing precisely, the gentlest thing, the lightest thing, a lizard's rustling, a wisk, an eye glance, a breath-little maketh up the best happiness. Be still.","author":"Friedrich Nietzsche","__v":0},{"theme":["Identity"],"_id":"5aa6fcb91b650363a36e4d64","quoteString":"The most difficult thing for a man to do is to be himself in a world that is constantly trying to change him. Ignore everyone, even those that praise.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Adventure"],"_id":"5aa6fd031b650363a36e4d65","quoteString":"All of life is an experiment. The more you make the better.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Career","Identity","Adventure"],"_id":"5aa6fd9b1b650363a36e4d66","quoteString":"We must let go of the life we have planned, so as to accept the one that is waiting for us.","author":"Joseph Campbell","__v":0},{"theme":["Identity","Spirituality","Adventure"],"_id":"5aa6fe011b650363a36e4d67","quoteString":"Life is without meaning. You bring the meaning to it. The meaning of life is whatever you ascribe it to be. Being alive is the meaning.","author":"Joseph Campbell","__v":0},{"theme":["Relationships","Identity","Happiness"],"_id":"5aa6fe501b650363a36e4d68","quoteString":"Don't change yourself just to make someone happy, unless that person is you.","author":"Unknown","__v":0},{"theme":["Relationships","Happiness"],"_id":"5aa6ff221b650363a36e4d69","quoteString":"Life is not primarily a quest for pleasure, as Frued believed, or a quest for power, as Alfred Adler taught, but a quest for meaning. The greatest task for any person is to find meaning in his or her life, whether it be in work, in love, or in courage during difficult times.","author":"Victor E. Frankl","__v":0},{"theme":["Motivation","Loss","Failure","Happiness"],"_id":"5aa6ffd61b650363a36e4d6a","quoteString":"Forces beyond your control can take away everything you posses except one thing, your freedom to choose how you will respond to the situation. You cannot control what happens to you in life, but you can always control what you will feel and do about what happens to you.","author":"Victor E. Frankl","__v":0},{"theme":["Fear","Discipline","Failure","Motivation"],"_id":"5aa7002a1b650363a36e4d6b","quoteString":"Do the thing you fear and the death of fear is certain.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Spirituality","Discipline","Identity","Fear","Motivation"],"_id":"5aa700911b650363a36e4d6c","quoteString":"The more important a call or action is to our souls evolution, the more resistance we will feel toward pursuing it.","author":"Steven Pressfield","__v":0},{"theme":["Fear","Motivation","Career"],"_id":"5aa700d51b650363a36e4d6d","quoteString":"Taking no risks ensures mediocrity.","author":"Unknown","__v":0},{"theme":["Motivation"],"_id":"5aa701461b650363a36e4d6e","quoteString":"Death should be a reminder that challenges us to make the best possible use of each moment of our lives. Live life as if you were living for the second time an had acted as wrongly the first time as you are about to act now.","author":"Victor E. Frankl","__v":0},{"theme":["Failure"],"_id":"5aa701cd1b650363a36e4d6f","quoteString":"The one thing more important than success is mastering failure. This, is the greatest success of all.","author":"Unknown","__v":0},{"theme":["Failure","Career"],"_id":"5aa7024f1b650363a36e4d70","quoteString":"Failure should be our greatest teacher, not our undertaker. Failure is delay, not defeat. It is a temporary detour, not a dead end. Failure is something we can avoid only by saying nothing, doing nothing, and being nothing.","author":"Unknown","__v":0},{"theme":["Failure","Happiness"],"_id":"5aa702cd1b650363a36e4d71","quoteString":"I've had many troubles in my life, most of which never happened.","author":"Mark Twain","__v":0},{"theme":["Relationships","Happiness"],"_id":"5aa703e81b650363a36e4d72","quoteString":"Living with resentment towards another person is like taking poison and expecting them to get sick. Letting go of resentment is not a gift to the person you resent; It is rather a gift to yourself.","author":"Unknown","__v":0},{"theme":["None"],"_id":"5aa7044e1b650363a36e4d73","quoteString":"Good judgement comes from experience. Experience comes from bad judgment.","author":"Unknown","__v":0},{"theme":["Relationships","Career","Identity"],"_id":"5aa704e11b650363a36e4d74","quoteString":"Everything that happens to you is a reflection of what you believe about yourself. We cannot outperform our level of self-esteem. We cannot draw to ourselves more than we think we are worth.","author":"Unknown","__v":0},{"theme":["Fear","Motivation","Discipline","Happiness","Failure","Adventure"],"_id":"5aa705451b650363a36e4d75","quoteString":"He who is not everyday conquering some fear has not learned the secret of life.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Happiness","Identity"],"_id":"5aa7064f1b650363a36e4d76","quoteString":"My motto has always been 'always merry and bright'. Perhaps that's why I never tire of quoting Rabelais: 'For all you ills I give you laughter'. As I look back at my life which has been full of tragedies, I see it more as a comedy than a tragedy. One of those comedies in which while laughing your guts out you feel your inner heart breaking. What better comedy could there be? The man who takes himself too seriously is doomed.","author":"Henry Miller","__v":0},{"theme":[],"_id":"5aa7073c1b650363a36e4d77","quoteString":"People are frugal in guarding their personal property; but as soon as it comes to squandering time they are most wasteful of the one thing in which it is right to be stingy.","author":"Seneca","__v":0},{"theme":["Identity","Happiness","Failure"],"_id":"5aa707761b650363a36e4d78","quoteString":"The stories that we tell ourselves, whether they be true or false, are always real.","author":"Unknown","__v":0},{"theme":["Failure","Motivation","Discipline"],"_id":"5aa708411b650363a36e4d79","quoteString":"That which gives light must endure burning.","author":"Viktor E. Frankl","__v":0},{"theme":["Relationships","Identity"],"_id":"5aa708af1b650363a36e4d7a","quoteString":"You're a living magnet and you inevitably attract into your life, the people, circumstances, ideas, and resources in harmony with your dominant thoughts.","author":"Brian Tracy","__v":0},{"theme":["Happiness"],"_id":"5aa708de1b650363a36e4d7b","quoteString":"The struggle ends when the gratitude begins.","author":"Unknown","__v":0},{"theme":["Finances"],"_id":"5aa709911b650363a36e4d7c","quoteString":"Money is a good servant but a bad master.","author":"Sir Frances Bacon","__v":0},{"theme":["Motivation","Career"],"_id":"5aa709df1b650363a36e4d7d","quoteString":"The secret of getting ahead is getting started.","author":"Mark Twain","__v":0},{"theme":["Finances"],"_id":"5aa70a2b1b650363a36e4d7e","quoteString":"Riches are not an end of life, but an instrument of life.","author":"Henry Ward Beecher","__v":0},{"theme":["Discipline","Motivation"],"_id":"5aa70a901b650363a36e4d7f","quoteString":"The man on top of the mountain didn't fall there.","author":"Vince Lombardi","__v":0},{"theme":["Finances","Loss"],"_id":"5aa70baf1b650363a36e4d80","quoteString":"Superficially, I think it looks like entrepreneurs have a high tolerance for risk. But one of the most important phrases in my life is \"protect the downside.\"","author":"Richard Branson","__v":0},{"theme":["Identity","Happiness"],"_id":"5aa70c351b650363a36e4d81","quoteString":"Dare to live the dreams you have dreamed for yourself.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Motivation"],"_id":"5aa70c7f1b650363a36e4d82","quoteString":"The only person you should try to be better than is the person you were yesterday.","author":"Unknown","__v":0}];;
  const demoQuotes = [{"theme":["Spirituality","Happiness","Loss"],"quoteString":"There are as many nights as days, and the one is just as long as the other in the year's course. Even a happy life cannot be without a measure of darkness, and the word \"happy\" would lose its meaning if it were not balanced by sadness.","author":"Carl Jung","__v":0},{"theme":["Fear","Motivation","Adventure","Failure"],"quoteString":"Security is mostly a superstition. It does not exist in nature, nor do the children of men as a whole experience it. Avoiding danger is no safer in the long run than outright exposure. Life is either a daring adventure, or nothing.","author":"Helen Keller","__v":0},{"theme":["Happiness"],"quoteString":"For happiness, how little suffices for happiness! The least thing precisely, the gentlest thing, the lightest thing, a lizard's rustling, a wisk, an eye glance, a breath-little maketh up the best happiness. Be still.","author":"Friedrich Nietzsche","__v":0},{"theme":["Identity"],"quoteString":"The most difficult thing for a man to do is to be himself in a world that is constantly trying to change him. Ignore everyone, even those that praise.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Adventure"],"quoteString":"All of life is an experiment. The more you make the better.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Career","Identity","Adventure"],"quoteString":"We must let go of the life we have planned, so as to accept the one that is waiting for us.","author":"Joseph Campbell","__v":0},{"theme":["Identity","Spirituality","Adventure"],"quoteString":"Life is without meaning. You bring the meaning to it. The meaning of life is whatever you ascribe it to be. Being alive is the meaning.","author":"Joseph Campbell","__v":0},{"theme":["Relationships","Identity","Happiness"],"quoteString":"Don't change yourself just to make someone happy, unless that person is you.","__v":0},{"theme":["Relationships","Happiness"],"quoteString":"Life is not primarily a quest for pleasure, as Frued believed, or a quest for power, as Alfred Adler taught, but a quest for meaning. The greatest task for any person is to find meaning in his or her life, whether it be in work, in love, or in courage during difficult times.","author":"Victor E. Frankl","__v":0},{"theme":["Motivation","Loss","Failure","Happiness"],"quoteString":"Forces beyond your control can take away everything you posses except one thing, your freedom to choose how you will respond to the situation. You cannot control what happens to you in life, but you can always control what you will feel and do about what happens to you.","author":"Victor E. Frankl","__v":0},{"theme":["Fear","Discipline","Failure","Motivation"],"quoteString":"Do the thing you fear and the death of fear is certain.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Spirituality","Discipline","Identity","Fear","Motivation"],"quoteString":"The more important a call or action is to our souls evolution, the more resistance we will feel toward pursuing it.","author":"Steven Pressfield","__v":0},{"theme":["Fear","Motivation","Career"],"quoteString":"Taking no risks ensures mediocrity.","__v":0},{"theme":["Motivation"],"quoteString":"Death should be a reminder that challenges us to make the best possible use of each moment of our lives. Live life as if you were living for the second time an had acted as wrongly the first time as you are about to act now.","author":"Victor E. Frankl","__v":0},{"theme":["Failure"],"quoteString":"The one thing more important than success is mastering failure. This, is the greatest success of all.","__v":0},{"theme":["Failure","Career"],"quoteString":"Failure should be our greatest teacher, not our undertaker. Failure is delay, not defeat. It is a temporary detour, not a dead end. Failure is something we can avoid only by saying nothing, doing nothing, and being nothing.","__v":0},{"theme":["Failure","Happiness"],"quoteString":"I've had many troubles in my life, most of which never happened.","author":"Mark Twain","__v":0},{"theme":["Relationships","Happiness"],"quoteString":"Living with resentment towards another person is like taking poison and expecting them to get sick. Letting go of resentment is not a gift to the person you resent; It is rather a gift to yourself.","__v":0},{"quoteString":"Good judgement comes from experience. Experience comes from bad judgment.","__v":0},{"theme":["Relationships","Career","Identity"],"quoteString":"Everything that happens to you is a reflection of what you believe about yourself. We cannot outperform our level of self-esteem. We cannot draw to ourselves more than we think we are worth.","__v":0},{"theme":["Fear","Motivation","Discipline","Happiness","Failure","Adventure"],"quoteString":"He who is not everyday conquering some fear has not learned the secret of life.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Happiness","Identity"],"quoteString":"My motto has always been 'always merry and bright'. Perhaps that's why I never tire of quoting Rabelais: 'For all you ills I give you laughter'. As I look back at my life which has been full of tragedies, I see it more as a comedy than a tragedy. One of those comedies in which while laughing your guts out you feel your inner heart breaking. What better comedy could there be? The man who takes himself too seriously is doomed.","author":"Henry Miller","__v":0},{"theme":[],"quoteString":"People are frugal in guarding their personal property; but as soon as it comes to squandering time they are most wasteful of the one thing in which it is right to be stingy.","author":"Seneca","__v":0},{"theme":["Identity","Happiness","Failure"],"quoteString":"The stories that we tell ourselves, whether they be true or false, are always real.","__v":0},{"theme":["Failure","Motivation","Discipline"],"quoteString":"That which gives light must endure burning.","author":"Viktor E. Frankl","__v":0},{"theme":["Relationships","Identity"],"quoteString":"You're a living magnet and you inevitably attract into your life, the people, circumstances, ideas, and resources in harmony with your dominant thoughts.","author":"Brian Tracy","__v":0},{"theme":["Happiness"],"quoteString":"The struggle ends when the gratitude begins.","__v":0},{"theme":["Finances"],"quoteString":"Money is a good servant but a bad master.","author":"Sir Frances Bacon","__v":0},{"theme":["Motivation","Career"],"quoteString":"The secret of getting ahead is getting started.","author":"Mark Twain","__v":0},{"theme":["Finances"],"quoteString":"Riches are not an end of life, but an instrument of life.","author":"Henry Ward Beecher","__v":0},{"theme":["Discipline","Motivation"],"quoteString":"The man on top of the mountain didn't fall there.","author":"Vince Lombardi","__v":0},{"theme":["Finances","Loss"],"quoteString":"Superficially, I think it looks like entrepreneurs have a high tolerance for risk. But one of the most important phrases in my life is \"protect the downside.\"","author":"Richard Branson","__v":0},{"theme":["Identity","Happiness"],"quoteString":"Dare to live the dreams you have dreamed for yourself.","author":"Ralph Waldo Emerson","__v":0},{"theme":["Motivation"],"quoteString":"The only person you should try to be better than is the person you were yesterday.","__v":0}];
    User
      .findOneAndUpdate(
        { username: 'abc' },
        { $set: { _quotes: [], themes: [] } }
      , (err) => {
        if (err) {
          return res.status(500)
        }
      }).then(() => {
      for (let demoQuote of demoQuotes) {
        Quotes.create({quoteString: demoQuote.quoteString.trim(), author: demoQuote.author || 'Unknown', theme: demoQuote.theme || ["None"]}, (err, quote) => {
         if (err) {
           return res.status(400);
         }
         demoResponseQuotes.push(quote)
         User
          .findOneAndUpdate({username: 'abc'}, { $push: { _quotes: quote } }, (err) => {
            if (err) {
              return res.status(500).json(err);
            } 
          });
        });
      }
    })
    return res.status(200).json(demoResponseQuotes)
}); 

quotesRouter.get('/alldemoquotes', passport.authenticate('jwt', {session: false}), (req, res) => { 
  User     
  .findOne({username: 'abc'})
    .populate('_quotes')     
    .exec((err, user) => {
      if (err) {
        return res.status(500).json(err);       
      }       
      return res.status(200).json(user._quotes);     
    }); 
  });

quotesRouter.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => { 
  User     
  .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})
    .populate('_quotes')     
    .exec((err, user) => {
      if (err) {
        return res.status(500).json(err);       
      }       
      return res.status(200).json(user._quotes);     
    }); 
  });

quotesRouter.post('/searchbyauthor', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (req.body.author !== undefined) {
    req.body.author = req.body.author.trim();
  }
  User
    .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})
    .populate({
      path: '_quotes',
      match: {author: { $regex: req.body.author, $options: 'i' }}
    })
    .exec((err, user) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(user._quotes);
    });
});

quotesRouter.post('/searchbytheme', passport.authenticate('jwt', {session:false}), (req, res) => {
  User
    .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})
    .populate({
      path: '_quotes',
      match: {theme: {$in: [req.body.theme]}}
    })
    .exec((err, user) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(user._quotes);
    });
});

quotesRouter.post('/searchbyquotestring', passport.authenticate('jwt', {session: false}), (req, res) => {
  User 
    .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})
    .populate({
      path: '_quotes',
      match: {$text: {$search: "\"" + req.body.quoteString.trim() + "\""}}
    })
    .exec((err, user) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(user._quotes);
    });
});

quotesRouter.delete('/deletequote/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Quotes 
    .remove( { _id: req.params.id } )
    .exec()
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

quotesRouter.delete('/deletetheme/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!('theme' in req.body)) {
    const message = 'Missing theme in request body';
    return res.status(400).send(message);
  };
  Quotes
    .findById(req.params.id, (err, quote) => {
      if (err) {
        return res.status(400);
      }
      if (!(quote.theme.includes(req.body.theme))) {
        const message = "The theme you are attempting to delete could not be found for this quote."
        return res.status(404).json(message);
      }
      let index = quote.theme.indexOf(req.body.theme);
      if (index !== -1) {
        quote.theme.splice(index, 1);
      }
      quote.save(err => {
        if (err) {
          return res.status(500).json({message: 'Internal server error'});
        }
        return res.status(200).json(quote);
    });
  });
});

module.exports = {quotesRouter};