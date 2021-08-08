const express = require("express")
const bodyParser = require("body-parser")
const { urlencoded } = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()



app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://arya-admin:crackias@25@cluster0testing.yxoyi.mongodb.net/todolistDB", { useNewUrlParser: true })

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcom to you To-do list!"
})
const item2 = new Item({
  name: "HIt + to add a new item!"
})
const item3 = new Item({
  name: "<-- hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


app.get("/", (req, res) => {


  Item.find({}, function (err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Success!")
        }
      })
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", items: results})
    }
  })

})

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({ name: listName }, (err, results) => {
      results.items.push(item)
      results.save()
      res.redirect("/" + listName)
    })
  }

});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.cross;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log("success!")
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, (err, results)=>{
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }

})

app.get("/:whateverList", (req, res) => {
  const customName = _.capitalize(req.params.whateverList)

  List.findOne({ name: customName }, (err, results) => {
    if (!err) {
      if (!results) {
        // Creates new list
        const list = new List({
          name: customName,
          items: defaultItems
        })

        list.save()
        res.redirect("/" + customName)
        console.log("No exists")
      } else {
        // Shows existing list
        res.render("list", { listTitle: results.name, items: results.items })
        console.log("exists")
      }
    }
  })

})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 
app.listen(port, function() {
  console.log("Server started succesfully");
});  