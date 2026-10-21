import mongoose from 'mongoose';

const checkResultSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitor',
      required: [true, 'Monitor reference is required'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Check status is required'],
      enum: {
        values: ['up', 'down'],
        message: 'Check status must be either "up" or "down"',
      },
    },
    statusCode: {
      type: Number,
      default: null,
      min: [100, 'HTTP status code must be at least 100'],
      max: [599, 'HTTP status code cannot exceed 599'],
    },
    responseTimeMs: {
      type: Number,
      default: null,
      min: [0, 'Response time cannot be negative'],
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, 'Error message cannot exceed 1000 characters'],
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    // Retain timestamps disabled if checkedAt is explicitly provided, or keep createdAt
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for retrieving a monitor's newest check results efficiently
checkResultSchema.index({ monitor: 1, checkedAt: -1 });

// Time-based index for retention cleanup and global timeline queries
checkResultSchema.index({ checkedAt: -1 });

// Prevent accidental model recompilation errors during development/hot reload
export const CheckResult =
  mongoose.models.CheckResult || mongoose.model('CheckResult', checkResultSchema);
