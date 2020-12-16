export default class Api {
	constructor(options) {
		this._apiBase = options ? options.endpointUrl || '/' : '/';
	}

	serialize = function (obj) {
		var str = [];
		for (var p in obj)
			if (obj.hasOwnProperty(p)) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
		return str.join("&");
	}

	ajax = (
		url = '', 
		type = 'GET', 
		data = {}, 
		callback = (() => { })
	) => {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = () => {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				callback(xmlhttp.responseText, xmlhttp);
			}
		}
		xmlhttp.open(type, `${window._frontConfig.apiBaseUrl}${url}`, true);
		xmlhttp.send(data);
	}
}