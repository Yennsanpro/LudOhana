const UserModel = require("../models/user.model")

const bcrypt = require("bcrypt") // Encrypted password
const jwt = require("jsonwebtoken") // created token

const signup = async (req, res) => {
  //function user can signup
  try {
    const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT))
    req.body.password = bcrypt.hashSync(req.body.password, salt)

    req.body.role = "user"
    const user = await UserModel.create(req.body)

    const token = jwt.sign(
      // token created
      { email: user.email },

      process.env.JWT_SECRET //secret word
      //{ expiresIn: '7d' } //solo se pone al terminar la aplicación
    )

    res.status(200).json({ token: token, message: "Account created" })
  } catch (error) {
    console.log(error)
    res.status(500).send("Error Signing up")
  }
}

const login = async (req, res) => {
  // function User can login

  try {
    const user = await UserModel.findOne({
      where: {
        email: req.body.email,
      },
    })

    if (!user) return res.status(500).send("Email password incorrect")
    if (!bcrypt.compareSync(req.body.password, user.password))
      return res.status(500).send("Password incorrect")

    const token = jwt.sign(
      //Token created
      { email: user.email }, //Identified user unique

      process.env.JWT_SECRET
    )
    return res.status(200).json({ token: token })
  } catch (error) {
    console.log(error)
    res.status(500).send("Error login up")
  }
}
async function getUser(req, res) {
  try {
    // We used res.locals.user because user need to be logged and this action protect endpoint to receive any data
    const user = await res.locals.user
    if (user) {
      return res.status(200).json(user)
    } else {
      return res.status(404).send("User not found")
    }
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function updateUser(req, res) {
  try {
    const [userExist, user] = await UserModel.update(req.body, {
      returning: true,
      where: {
        id: res.locals.user.id,
      },
    })
    if (userExist !== 0) {
      return res.status(200).json({ message: "User updated", user: user })
    } else {
      return res.status(404).send("User not found")
    }
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

async function deleteUser(req, res) {
  try {
    const user = await UserModel.destroy({
      where: {
        id: res.locals.user.id,
      },
    })
    if (user) {
      return res.status(200).json("User deleted")
    } else {
      return res.status(404).send("User not found")
    }
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

module.exports = {
  signup,
  login,
  getUser,
  updateUser,
  deleteUser,
}
