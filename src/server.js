const express = require('express');
const app = express();

const morgan = require('./middlewares/morgan.js');
const cors = require('./middlewares/cors.js');

app.use(cors);

app.use(express.json());
app.use(express.urlencoded({ extended: true, parameterLimit: 500 }));
app.use(morgan);

app.get("/", (req, res) => {
	res.status(418).json({message: `Greetings, citizen of ${ 
        req.hostname	  
	}`});
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`Server runs on port ${PORT}`);
});
