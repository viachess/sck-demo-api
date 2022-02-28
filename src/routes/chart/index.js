const express = require('express');
const router = express.Router();

router.get('/', ( req, res ) => {
	res.status(417).json({
			message: `chart route GET request`
	});
});
module.exports = router;
