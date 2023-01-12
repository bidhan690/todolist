//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://heygarmi654:66agNK9dSQ8AU7f@cluster0.3qjkyhr.mongodb.net/todolistDB', {useNewUrlParser: true});
const itemsSchema = {
  name: String,
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to Todo list',
});
const item2 = new Item({
  name: 'Hit the + button to add new ',
});
const item3 = new Item({
  name: '<-- Hit this to delete an item',
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  list: [itemsSchema],
};
const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully saved default items to db');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', {listTitle: 'Today', newListItems: foundItems});
    }
  });
});

app.get('/:customUrl', (req, res) => {
  const customLinks = _.capitalize(req.params.customUrl);
  List.findOne({name: customLinks}, (err, foundLists) => {
    if (!err) {
      if (!foundLists) {
        //Insert New
        const list = new List({
          name: customLinks,
          list: defaultItem,
        });
        list.save();
        res.redirect('/' + customLinks);
      } else {
        //If exits
        res.render('list', {listTitle: foundLists.name, newListItems: foundLists.list});
      }
    }
  });
});

app.post('/', function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    res.redirect('/' + listName);
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, (err) => {
    if (!err) {
      console.log('succ');
      res.redirect('/');
    }
  });
});

app.get('/about', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});

module.exports = app;