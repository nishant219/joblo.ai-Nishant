import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

import connect from './src/config/database.js';
import logger from './src/config/logger.js';

import jobRoutes from './src/routes/jobRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/v1/api/jobs', jobRoutes);
app.use('/v1/api/profiles', profileRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong!'
    });
});

  app.all('*', (req, res, next) => {
    res.status(404).json({
      status: 'error',
      message: `Can't find ${req.originalUrl} on this server!`
    });
});  

const startServer= async()=>{
    try{
        await connect();
        const PORT=process.env.PORT || 3000;
        app.listen(PORT,()=>{
            logger.info(`Server is running on port ${PORT}💥 `);
        });
        console.log(`Server is running on port ${PORT}💥 `);
    }catch(error){
        logger.error(`Error in startServer:`, error?.message);
        process.exit(1);
    }
}  

startServer();

export default app;