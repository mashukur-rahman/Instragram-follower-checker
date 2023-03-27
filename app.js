const fs = require("fs");
const express = require("express");
const multer = require("multer");
const path = require("path")
const ejs = require("ejs")
const AdmZip = require("adm-zip");
const app = express()
 
var foldername=""
app.use(express.static('public'))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path="uploads/"+file.originalname.replace(".zip","")+Date.now()
        foldername=path
        fs.mkdirSync(path);
        cb(null, path);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "") + Date.now();
        cb(null, fileName + fileExt)
    }
 
})
 
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "application/x-zip-compressed") {
            cb(null, true)
        } else {
            cb(null, false)
        }
        // console.log(file)
    }
})
app.set("view engine", "ejs")
app.get("/", function (req, res) {
    res.render("index.ejs")
})
app.get("/success", function(req, res){
    res.render("success", {final:final, resultLink:resultLink})
})
var followersArray = [];
var followingArray = [];
var final=[]
var link1=[]
var link2=[]
resultLink=[]

app.post('/', upload.single("dataFile"), function (req, res) {
 
        const unZipped=new AdmZip(foldername+"/"+req.file.filename);
 

        
        const entry1 = unZipped.getEntries()
            .find( entry => entry.entryName.includes("/followers_and_following/followers_1.json") );
        const jsonString = unZipped.readAsText(entry1)
        var array = JSON.parse(jsonString);
        for (var i = 0; i < array.length; i++) {
            followersArray.push(array[i].string_list_data[0].value)
        }
 
        const entry2 = unZipped.getEntries()
            .find( entry => entry.entryName.includes("/followers_and_following/following.json") );
        const jsonString2 = unZipped.readAsText(entry2);
        var followingObj = JSON.parse(jsonString2);
        for (var j = 0; j < followingObj.relationships_following.length; j++) {
            followingArray.push(followingObj.relationships_following[j].string_list_data[0].value)
        }
        var resultArray = followingArray.filter(val => !followersArray.includes(val));
        for(var k=0; k<resultArray.length; k++){
            final.push(resultArray[k])
        }

        for (var m = 0; m < array.length; m++) {
            link1.push(array[m].string_list_data[0].href)
        }
        for (var n = 0; n < followingObj.relationships_following.length; n++) {
            link2.push(followingObj.relationships_following[n].string_list_data[0].href)
        }
        var finalLink = link2.filter(val => !link1.includes(val));
        for(var o=0; o<finalLink.length; o++){
            resultLink.push(finalLink[o])
        }
        

   res.redirect("success")
 
 
})

 
app.listen(3000, function () { })