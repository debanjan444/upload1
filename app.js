//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', false);

const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-debanjan:debanjan123@cluster1.5hvtlug.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome to your todo list"
});
const item2 = new Item({
  name:"hit + to add a new item"
});
const item3 = new Item({
  name:"<-- hit this to delete an item"
});
const defaultItems = [item1,item2,item3];
// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log("error found");
//   }else{
//     console.log("successfully inserted all the fruits");
//   }
// });

const listSchema = {
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,items){
  if(items.length === 0){

    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log("error found");
      }else{
        console.log("successfully inserted all the DB");
      }
      res.redirect("/");
    });

    }else{
        res.render("list", {listTitle: "Today", newListItems: items});
    }
  });


});






app.post("/", function(req, res){

  const itemName = req.body.newItem;
const listName = req.body.list;
  const newItem = new Item({ name:itemName });
if(listName === "Today"){
  newItem.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(newItem);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});

app.get("/:usertyped",function(req,res){
const userTyped = _.capitalize(req.params.usertyped);
// const list = new List({
//   name: userTyped,
//   items: defaultItems
// });
// list.save();
List.findOne({name:userTyped},function(err,newlist){
  if(!err){
    if(newlist){
      res.render("list", {listTitle: newlist.name, newListItems: newlist.items});
    }else{
      const list = new List({
        name: userTyped,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+userTyped);
    }

  }
});




})
app.post("/delete",function(req,res){
const  checkedItemId = req.body.checkbox;
const listName = req.body.listName;
if (listName === "Today") {
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  });
}


});

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
