(function () {
    Vue.component("first-component", {
        template: "#template",
        props: ["id"],
        data: function () {
            return {
                title: "",
                description: "",
                username: "",
                url: "",
                comments: [],
                newComm: "",
                newCommUsername: "",
            };
        },
        mounted: function () {
            this.id = location.hash.slice(1);
            var instanceData = this;
            axios
                .get(`/first-component/${instanceData.id}`)
                .then(function (res) {
                    console.log("HHHEEEYY", res);
                    instanceData.title = res.data.title;
                    instanceData.description = res.data.description;
                    instanceData.username = res.data.username;
                    instanceData.url = res.data.url;
                    instanceData.comments = res.data.comments;
                    instanceData.newComm = res.data.comments.comment;
                    instanceData.newCommUsername = res.data.comments.username;
                    instanceData.comments.reverse();
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        watch: {
            id: function () {
                console.log(
                    "image id changed! this is the watcher reporting..."
                );
                var instanceData = this;
                console.log(instanceData.id);
                axios
                    .get(`/first-component/${instanceData.id}`)
                    .then(function (res) {
                        console.log(res);
                        instanceData.title = res.data.title;
                        instanceData.description = res.data.description;
                        instanceData.username = res.data.username;
                        instanceData.url = res.data.url;
                        instanceData.comments = res.data.comments;
                        instanceData.newComm = res.data.comments.comment;
                        instanceData.newCommUsername =
                            res.data.comments.username;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },
        methods: {
            closemodal: function () {
                console.log("close modal");
                this.$emit("close");
            },
            addcomment: function (e) {
                e.preventDefault();
                var thisOfData = this;
                var newComm = {};
                newComm.comment = this.newComm;
                newComm.username = this.newCommUsername;
                newComm.image_id = this.id;
                axios
                    .post("/addcomment", newComm)
                    .then(function (res) {
                        thisOfData.comments.unshift(res.data[0]);
                        thisOfData.newComm = thisOfData.newCommUsername = "";
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
            over: function () {
                this.isActive = true;
            },
        },
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            id: location.hash.slice(1),
            title: "",
            description: "",
            username: "",
            file: null,
            seen: true,
            isActive: true,
        },
        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function (response) {
                    console.log("response.data", response.data);
                    self.images = response.data; //this in axios change reference
                    // self.images.reverse();
                })
                .catch((err) => {
                    console.log(err);
                });
            window.addEventListener("hashchange", function () {
                console.log(
                    "hash change has fired! Something afgter hash changed"
                );
                console.log(location.hash);
                self.id = location.hash.slice(1);
            });
        },
        methods: {
            handleChange: function (e) {
                console.log("handleChange ran");
                //our event object has acess to the file uploaded
                console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },
            handleClick: function (e) {
                console.log("clicked submit button");
                e.preventDefault(); // prevent refresh from running on submit button click
                console.log("this", this);
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var thisOfData = this;
                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        console.log("resp from Post/upload", resp);
                        thisOfData.title = thisOfData.description = thisOfData.username =
                            "";
                        this.file = null;
                        thisOfData.images.unshift(resp.data[0]);
                    })
                    .catch(function (err) {
                        console.log("err in Post/upload", err);
                    });
            },
            clearFields: function () {
                this.title = this.description = this.username = "";
                this.file = null; // take care
            },
            closemodal: function () {
                console.log("mi triggera?");
                this.id = null;
                location.hash = "";
            },
            more: function (e) {
                e.preventDefault();
                var thisOfData = this;
                var lastId = thisOfData.images[thisOfData.images.length - 1].id;
                axios
                    .get(`/more/${lastId}`)
                    .then(function (res) {
                        if (
                            thisOfData.images[thisOfData.images.length - 1]
                                .id !== 1
                        ) {
                            for (var i = 0; i < res.data.length; i++) {
                                thisOfData.images.push(res.data[i]);
                            }
                        } else {
                            thisOfData.seen = false;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
            over: function () {
                this.isActive = !this.isActive;
            },
        },
    });
})();
