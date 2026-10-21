import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Mask credentials in a MongoDB connection URI for safe logging.
 * Replaces username:password with ***:*** even if passwords contain special characters.
 */
export const maskMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(
    /(mongodb(?:\+srv)?:\/\/)(?:.*@)?([^/?\s:]+(?::\d+)?)/i,
    (match, protocol, host) => {
      if (match.includes('@')) {
        return `${protocol}***:***@${host}`;
      }
      return `${protocol}${host}`;
    }
  );
};

/**
 * Sanitize error messages to ensure no credentials or sensitive connection strings leak.
 */
export const sanitizeErrorMessage = (message) => {
  if (!message || typeof message !== 'string') return '';
  return maskMongoUri(message);
};

let dbStatus = {
  isConnected: false,
  status: 'disconnected',
  name: null,
  lastError: null,
};

export const connectDB = async () => {
  const uri = env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI is not defined in environment variables.';
    console.error(`[Database Error] ${errorMsg}`);
    dbStatus = {
      isConnected: false,
      status: 'error',
      name: null,
      lastError: errorMsg,
    };
    return false;
  }

  try {
    dbStatus.status = 'connecting';
    const safeUri = maskMongoUri(uri);
    console.log(`[Database] Attempting connection to MongoDB (${safeUri})...`);

    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbStatus = {
      isConnected: true,
      status: 'connected',
      name: connection.connection.name,
      lastError: null,
    };

    console.log(`[Database] MongoDB Connected successfully: Database "${connection.connection.name}"`);
    return true;
  } catch (error) {
    const safeError = sanitizeErrorMessage(error.message);
    dbStatus = {
      isConnected: false,
      status: 'error',
      name: null,
      lastError: safeError,
    };

    console.error('====================================================');
    console.error('[Database Connection Failure]');
    console.error(`Error details: ${safeError}`);
    console.error('Action required: Ensure MongoDB is running locally (e.g. `mongod` or local MongoDB Windows Service)');
    console.error('or configure a valid MONGODB_URI in your `backend/.env` file.');
    console.error('Server will continue running in degraded mode for health endpoints.');
    console.error('====================================================');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  dbStatus.isConnected = false;
  dbStatus.status = 'disconnected';
  console.warn('[Database] MongoDB connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  dbStatus.isConnected = false;
  dbStatus.status = 'error';
  dbStatus.lastError = sanitizeErrorMessage(err.message);
  console.error('[Database] MongoDB runtime error:', sanitizeErrorMessage(err.message));
});

export const getDatabaseStatus = () => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const currentReadyState = mongoose.connection.readyState;

  return {
    isConnected: currentReadyState === 1,
    status: readyStates[currentReadyState] || dbStatus.status,
    databaseName: mongoose.connection.name || dbStatus.name || null,
    readyState: readyStates[currentReadyState] || 'unknown',
    readyStateCode: currentReadyState,
    ...(dbStatus.lastError && { lastError: sanitizeErrorMessage(dbStatus.lastError) }),
  };
};
