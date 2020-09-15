const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
// const { Client } = require('pg');

/* WITHOUT SEQUELIZE - EXAMPLE */
/* const client = new Client({
	user: 'vakho',
	password: 'vakho',
	host: 'localhost',
	port: 5432,
	database: 'todo',
});
client.connect(); */

const connection = new Sequelize('todo', 'vakho', 'vakho', {
	host: 'localhost',
	dialect: 'postgres',
});

const TodoItem = connection.define('todoitem', {
	value: { type: Sequelize.TEXT, allowNull: false },
	checked: { type: Sequelize.BOOLEAN, allowNull: false },
	username: { type: Sequelize.STRING, allowNull: true },
});

connection.sync();

/* Show items */
router.get('/:username', (req, res, next) => {
	// let { username } = req.params;
	TodoItem.findAll({
		where: {
			username: req.params.username,
		},
		order: [['createdAt', 'ASC']],
	})
		.then((response) => res.send(response))
		.catch((err) => console.log(err));
});

/* Add new item */
router.post('/add', (req, res) => {
	if (Object.keys(req.body).length > 0) {
		TodoItem.create(req.body)
			.then((doc) => {
				res.send(doc);
			})
			.catch((err) => {
				res.send(err);
			});
	} else {
		res.send('please fill in the body');
	}
});

/* Edit item */
router.put('/edit/:todoid', (req, res) => {
	let { value, checked } = req.body;
	TodoItem.update(
		{ value, checked },
		{
			where: {
				id: req.params.todoid,
			},
		}
	)
		.then(() => {
			res.send('Updated successfully');
		})
		.catch((err) => {
			res.send(err);
		});
});

/* Select all */
router.put('/selectAll', (req, res) => {
	TodoItem.update(
		{ checked: true },
		{
			where: {
				checked: false,
			},
		}
	)
		.then(() => {
			res.send('All items are selected');
		})
		.catch((err) => {
			res.send(err);
		});
});

/* Unselect all */
router.put('/unSelectAll', (req, res) => {
	TodoItem.update(
		{ checked: false },
		{
			where: {
				checked: true,
			},
		}
	)
		.then(() => {
			res.send('All items are unselected');
		})
		.catch((err) => {
			res.send(err);
		});
});

/* Delete item */
router.delete('/delete/:id', (req, res) => {
	let { id } = req.params;
	TodoItem.destroy({
		where: {
			id,
		},
	})
		.then((doc) => {
			res.json(doc);
		})
		.catch((err) => {
			res.send(err);
		});
});

/* Delete selected */
router.delete('/deleteSelected', (req, res) => {
	TodoItem.destroy({
		where: {
			checked: true,
		},
	})
		.then((doc) => {
			res.json(doc);
		})
		.catch((err) => {
			res.send(err);
		});
});

module.exports = router;
