import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import healthRoutes from './routes/health';
import listRoutes from './routes/list';
import voiceRoutes from './routes/voice';
import productRoutes from './routes/products';
import testMatchRoutes from './routes/testMatch';
import recommendationRoutes from './routes/recommendations';
import substituteRoutes from './routes/substitutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/list', listRoutes);
app.use('/voice', voiceRoutes);
app.use('/products', productRoutes);
app.use('/test/match', testMatchRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/substitutes', substituteRoutes);

// Basic error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
