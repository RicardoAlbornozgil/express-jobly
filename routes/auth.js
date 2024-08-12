"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/** POST /auth/token: { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/token", async function (req, res, next) {
  try {
    // Validate request body against userAuthSchema
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errors = validator.errors.map(e => e.stack);
      throw new BadRequestError(`Invalid input: ${errors.join(", ")}`);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);

    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register: { username, password, firstName, lastName, email } => { token }
 *
 * Registers a new user and returns JWT token.
 *
 * Authorization required: none
 */
router.post("/register", async function (req, res, next) {
  try {
    // Validate request body against userRegisterSchema
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errors = validator.errors.map(e => e.stack);
      throw new BadRequestError(`Invalid input: ${errors.join(", ")}`);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);

    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
