const spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getImage = () => {
    return db.query(`
    SELECT * FROM images
    ORDER BY id DESC
    LIMIT 8
    `);
};

module.exports.uploadImage = (url, username, title, description) => {
    return db.query(
        `
    INSERT INTO images (url, username, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id, url, username, title, description`,
        [url, username, title, description]
    );
};

module.exports.showImage = (id) => {
    return db.query(
        `
    SELECT * FROM images
    WHERE id = $1`,
        [id]
    );
};

module.exports.getComments = (id) => {
    return db.query(
        `
    SELECT * FROM comments
    WHERE image_id = $1`,
        [id]
    );
};

module.exports.postComment = (image_id, comment, username) => {
    return db.query(
        `
    INSERT INTO comments (image_id ,comment, username)
    VALUES ($1, $2, $3)
    RETURNING image_id ,comment, username`,
        [image_id, comment, username]
    );
};

module.exports.more = (lastId) => {
    return db.query(
        `
    SELECT *, (
        SELECT id FROM images
        ORDER BY id DESC
        LIMIT 1) AS "lowestId"
    FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 8`,
        [lastId]
    );
};
