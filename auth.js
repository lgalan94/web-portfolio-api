const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY;

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		isAdmin : user.isAdmin,
		email : user.email
	}

		return jwt.sign(data, secret, {});

}


/* module.exports.verify = (request, response, next) => {
	let token = request.headers.authorization;

	if(token !== undefined) {
		token = token.slice(7, token.length);

		return jwt.verify(token, secret, (error, data) => {
			if(!error) {
				next();
			} else {
				return response.send(false);
			}
		})
	} else {
		return response.send(false)
	}
} */


module.exports.verify = (request, response, next) => {
    let token = request.headers.authorization;

    if(token !== undefined) {
        token = token.slice(7, token.length);

        return jwt.verify(token, secret, (error, data) => {
            if(!error) {
                // 💡 CRITICAL FIX: Attach the decoded data (user info) to the request object
                request.user = data; 
                next();
            } else {
                // Optionally send a 401 Unauthorized status instead of just 'false'
                return response.status(401).send({ message: 'Authorization failed or token expired.' }); 
            }
        })
    } else {
        // No token provided
        return response.status(401).send({ message: 'No authentication token provided.' });
    }
}



module.exports.decode = (token) => {
	token = token.slice(7, token.length);
	return jwt.decode(token, {complete : true}).payload
}