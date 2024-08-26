const express = require('express');
const app = express();
const port = 3000;
const connectToDB = require('./mongo');
app.use(express.json());
const userRouter = require('./routes/userRouter');
const eventRouter = require('./routes/eventRouter');
const cors = require('cors');
app.use(cors());
connectToDB();
app.get('/', (req, res) => {
    res.send('Hello World');
})

// app.route('/api/user', userRouter);
app.use('/api/user', userRouter);
app.use('/api/event', eventRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})