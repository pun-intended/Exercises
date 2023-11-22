/** User class for message.ly */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require('bcrypt')


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({username, password, first_name, last_name, phone}) {
    
    try{
    const results = await db.query(`
        INSERT INTO users (username, password, first_name, lastName, phone)
        VALUES ($1, $2, $3, $4, %5)
        RETURNING username, password, first_name, last_name, phone`
        [username, password, first_name, last_name, phone])

    } catch (e) {
      if (e.code === "23505"){
        return next(new ExpressError("Username already in use", 400))
      }
    }
      return results.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const results = await db.query(`
    SELECT username, password
    FROM users
    WHERE username = $1`
    [username])

    const user = results.row[0]

    if(user){
      if (await bcrypt.compare(password, user.password)){
        return true
      }
    } 
    return false
    

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const results = await db.query(`
      UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1`
        [username])

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users
    `)
    return results.rows
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const results = await db.query(`
        SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`
        [username])

      if (!results.rows[0]){
        return new ExpressError(`No user found with username ${username}`)
      }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(`
      SELECT 
        m.id,
        t.username,
        t.first_name,
        t.last_name,
        t.phone,
        m.body,
        m.sent_at,
        m.read_at
      FROM messages as m
        JOIN users AS t ON m.to_username = t.username
      WHERE m.from_username = $1
    `
      [username])

    if(!results.rows[0]){
      return new ExpressError(`No user found with username ${username}`)
    }
    
    const messages = results.rows.map( (r) => {
      return { 
        id: r.id,
        to_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at
      }
    })

    return messages
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const results = await db.query(`
      SELECT 
        m.id,
        f.username,
        f.first_name,
        f.last_name,
        f.phone,
        m.body,
        m.sent_at,
        m.read_at
      FROM messages as m
        JOIN users AS f ON m.from_username = f.username
      WHERE m.to_username = $1
    `
    [username])

    if(!results.rows[0]){
      return new ExpressError(`No user found with username ${username}`)
    }

    const messages = results.rows.map( (r) => {
      return { 
        id: r.id,
        from_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at
      }
    })

    return messages

  }
}


module.exports = User;