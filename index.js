const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

app.use(express.static("public"));

app.use(express.json());

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get("/images", (req, res) => {
    db.getImage()
        .then((response) => {
            //console.log(response);
            res.json(response.rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("file: ", req.file);
    console.log("req.body", req.body);
    let title = req.body.title;
    let description = req.body.description;
    let username = req.body.username;
    let url = `https://s3.amazonaws.com/imageboard-bucket/${req.file.filename}`;
    if (req.file) {
        db.uploadImage(url, username, title, description)
            .then((val) => {
                console.log("LOOK", val);
                res.json(val.rows);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.json({ success: false });
    }
});

app.get("/first-component/:id", (req, res) => {
    console.log("HALLO", req.params);
    Promise.all([db.showImage(req.params.id), db.getComments(req.params.id)])
        .then((resObj) => {
            console.log(resObj);
            let imageResponse = resObj[0].rows[0];
            imageResponse.comments = resObj[1].rows;
            res.json(imageResponse);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/addcomment", (req, res) => {
    console.log(req.body);
    db.postComment(req.body.image_id, req.body.comment, req.body.username)
        .then((resp) => {
            console.log(resp);
            res.json(resp.rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/more/:id", (req, res) => {
    db.more(req.params.id)
        .then((val) => {
            res.json(val.rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.listen(8080, () => console.log("imageboard server running"));
