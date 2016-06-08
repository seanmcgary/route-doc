/**
 * Created by seanmcgary on 6/7/16.
 */
'use strict';

const express = require('express');
const DocRoute = require('../');

const app = express();

app.docRoute = DocRoute(app, {
	errorOnDuplicatePath: false
});

function m1(req, res, next){
	console.log('m1');
	next();
}

function m2(req, res, next){
	console.log('m2');
	next();
}

app.docRoute.get({
	path: '/users/:userId',
	query: {
		token: String,
		username: {
			type: String,
			required: false
		},
		someParam: {
			type: function SomeCustomType(){},
			required: true
		}
	}
}, m1, m2);

app.listen(9999, () => {
	console.log('listening');
});

app.docRoute.serveRoutes();