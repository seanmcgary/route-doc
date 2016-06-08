/**
 * Created by seanmcgary on 6/7/16.
 */
'use strict';

const _ = require('lodash');

function jsonifyBlob(blob, whitelistFields = []){
	return _.reduce(blob, (blob, val, key) => {
		let newVal;

		if(!whitelistFields.length || (whitelistFields.length && _.includes(whitelistFields, key))) {
			if (_.isPlainObject(val) && val.type) {
				newVal = jsonifyBlob(val, ['type']);
			} else {
				if (_.isFunction(val) && val.name) {
					newVal = val.name;
				} else if (val && val.toString) {
					newVal = val.toString();
				} else {
					newVal = _.cloneDeep(val);
				}
			}
		} else {
			newVal = _.cloneDeep(val);
		}

		blob[key] = newVal;
		return blob;
	}, {});
}

class DocRoute {
	constructor(server, config = {}){
		this.server = server;
		this.config = _.defaults(config, {
			errorOnDuplicatePath: true,
			warnOnDuplicatePath: true
		});

		this.routes = {};
	}

	_handleRoute(method = 'get', data = {}, ...args){
		let path;
		if(_.isString(data)){
			path = data;
			data = { path }
		} else if(_.isPlainObject(data)){
			path = data.path;
		} else {
			throw new Error('path not provided');
		}

		data = _.defaults(data, {
			params: {},
			query: {},
			headers: {}
		});
		data.method = method;


		this._insertRoute(data);
		this.server[method](path, ...args);

	}

	_insertRoute(data = {}){
		const { path, method } = data;

		if(!this.routes[path]){
			this.routes[path] = {};
		}

		if(this.routes[path][method]){
			if(this.config.errorOnDuplicatePath){
				throw new Error('duplicate path')
			} else if(this.config.warnOnDuplicatePath){
				console.warn(`duplicate path "${method} - ${path}"`);
			}
		}

		this.routes[path][method] = data;
	}

	_jsonifyRoutes(){
		return _.reduce(this.routes, (routes, pathDefs, path) => {
			routes[path] = _.reduce(pathDefs, (def, val, key) => {
				def[key] = _.merge(val, {
					query: jsonifyBlob(val.query),
					headers: jsonifyBlob(val.headers),
					params: jsonifyBlob(val.params)
				});
				return def;

			}, {});
			return routes;
		}, {});
	}

	get(data = {}, ...args){
		return this._handleRoute('get', data, ...args);
	}

	post(data = {}, ...args){
		return this._handleRoute('post', data, ...args);
	}

	put(data = {}, ...args){
		return this._handleRoute('put', data, ...args);
	}

	patch(data = {}, ...args){
		return this._handleRoute('patch', data, ...args);
	}

	delete(data = {}, ...args){
		return this._handleRoute('del', data, ...args);
	}

	del(data = {}, ...args){
		return this._handleRoute('del', data, ...args);
	}

	serveRoutes(path = '/routes.json', ...args){
		this.server.get(path, ...args, (req, res) => {

			res.json(this._jsonifyRoutes());
		});
	}
}

function Create(){
	return new DocRoute(...arguments);
}

module.exports = Create;