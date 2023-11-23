const express = require("express")
const router = new express.Router()
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth")
const User = require("../models/user")
const Message = require("../models/message")
const db = require("../db")
const ExpressError = require("../expressError")

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try{
        const allUsers = await User.all()
        return res.json(allUsers);
    } catch(e) {
        return next(e)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
    try{
        const user = await User.get(req.params.username)
        return res.json({user: user})
    } catch(e) {
        return next(e)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
    try{
        const msgs = await User.messagesTo(req.params.username)
        return res.json({messages: msgs})
    } catch(e) {
        return next(e)
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
    try{
        const msgs = await User.messagesFrom(req.params.username)
        return res.json({messages: msgs})
    } catch(e){
        return next(e)
    }
})

module.exports = router