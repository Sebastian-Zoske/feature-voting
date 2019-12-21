const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const { Comment, validateComment, validateFlaggedComment } = require("../models/comment")
const { validateSearch } = require("../models/feature")

// Get all unaccepted comments
router.get("/", async (req, res) => {
    var comments = await Comment.find({ accepted: false, deleted: false }).sort("dateCreated")
    if (comments.length == 0) return res.send("no comments available")

    res.send(comments);
});

// Search for comments by searchString
// NOTE: half written words don't return anything
router.get("/search/", async (req, res) => {
    const { error } = validateSearch(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    var comments = await Comment.find(
        { $text: { $search: req.body.searchString } },
        { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } })
    if (comments.length == 0) return res.send("no results found")

    res.send(comments);
});

// Get comments by featureId
router.get("/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send("FeatureId doesn't fit id schema")

    var comments = await Comment.find({ featureId: req.params.id, deleted: false }).sort("dateCreated")
    if (comments.length == 0) return res.status(404).send("invalid featureId")

    res.send(comments);
});

// Post a new comment to given featureId
router.post("/", async (req, res) => {
    const { error } = validateComment(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const comment = new Comment({
        author: req.cookies['userId'],
        content: req.body.content,
        featureId: req.body.featureId,
        name: req.body.name
    })
    await comment.save()

    res.status(201).send(comment)
})

// Switch comments accepted status by it's id
router.patch("/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send("commentId doesn't fit id schema")

    var comment = await Comment.findOne({ _id: req.params.id, deleted: false })
    if (!comment) return res.status(404).send("commentId not found")

    await Comment.updateOne({ _id: req.params.id }, { "$set": { "accepted": !comment.accepted } })

    comment = await Comment.findById(req.params.id)
    res.status(200).send(comment)
})

// Delete comments by id
router.delete("/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send("commentId doesn't fit id schema")

    var comment = await Comment.findOneAndUpdate({ _id: req.params.id, deleted: false }, { "$set": { "deleted": true } }, { useFindAndModify: false })
    if (!comment) return res.status(404).send("commentId not found")

    res.status(202).send(comment)
})

module.exports = router