const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const SECRET = 'this is a secret phrase';
let token;

const connection = new Sequelize('todo', 'vakho', 'vakho', {
	host: 'localhost',
	dialect: 'postgres',
});

const User = connection.define('user', {
	username: { type: Sequelize.TEXT, allowNull: false, unique: true },
	password: { type: Sequelize.TEXT, allowNull: false },
});

connection.sync();

/* Add user */
router.post('/addUser', (req, res, next) => {
	if (Object.keys(req.body).length > 0) {
		let userList = new User(req.body);

		bcrypt.hash(userList.password, saltRounds, (err, hash) => {
			User.create({ ...req.body, password: hash })
				.then((doc) => {
					res.send(doc);
				})
				.catch((err) => {
					res.send(err);
				});
		});
	} else {
		res.send('please fill in the body');
	}
});

/* Log in */
router.post('/login', (req, res) => {
	let { username, password } = req.body;
	User.findAll({
		where: {
			username,
		},
	})
		.then((user) => {
			if (!user || user.length === 0) {
				res.send('No Users Found');
			} else {
				bcrypt.compare(password, user[0].password, (err, result) => {
					if (result) {
						token = jwt.sign(
							{
								username,
							},
							SECRET,
							{ expiresIn: '1h' }
						);
						res.json({
							token,
						});
					} else {
						res.send('Incorrect password');
					}
				});
			}
		})
		.catch((err) => {
			res.send(err);
		});
});

const checkToken = (req, res, next) => {
	if (req.url.indexOf('/tokens') !== -1) return next();
	if (!token) {
		return next('No token provided');
	}
	jwt.verify(token, SECRET, function (err, decoded) {
		if (err) {
			return next(err);
		}
		req.username = decoded.username;
		next();
	});
};

router.get('/checkToken', checkToken, (req, res) => {
	res.sendStatus(200);
});

module.exports = {
	router: router,
	checkToken: checkToken,
};
