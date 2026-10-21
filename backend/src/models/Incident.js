import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monitor',
      required: [true, 'Monitor reference is required'],
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: [true, 'Incident start timestamp is required'],
    },
    resolvedAt: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return value >= this.startedAt;
        },
        message: 'Resolution timestamp cannot be earlier than start timestamp',
      },
    },
    cause: {
      type: String,
      required: [true, 'Incident cause description is required'],
      trim: true,
      minlength: [3, 'Cause must be at least 3 characters'],
      maxlength: [500, 'Cause cannot exceed 500 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ongoing', 'resolved'],
        message: 'Incident status must be either "ongoing" or "resolved"',
      },
      default: 'ongoing',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Enforce AT MOST ONE 'ongoing' incident per monitor at database level.
 * Prevents race conditions and duplicate open incident creation.
 */
incidentSchema.index(
  { monitor: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'ongoing' },
    name: 'unique_ongoing_incident_per_monitor',
  }
);

// Incident timeline queries for a monitor
incidentSchema.index({ monitor: 1, startedAt: -1 });

/**
 * Helper static to retrieve the currently ongoing incident for a monitor.
 */
incidentSchema.statics.findOngoing = function (monitorId) {
  return this.findOne({ monitor: monitorId, status: 'ongoing' });
};

/**
 * Helper static to resolve the currently active incident for a monitor.
 */
incidentSchema.statics.resolveActive = async function (monitorId, resolvedAt = new Date()) {
  return this.findOneAndUpdate(
    { monitor: monitorId, status: 'ongoing' },
    { $set: { status: 'resolved', resolvedAt } },
    { new: true }
  );
};

// Prevent accidental model recompilation errors during development/hot reload
export const Incident =
  mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
