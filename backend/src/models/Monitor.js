import mongoose from 'mongoose';

const ALLOWED_STATUSES = ['pending', 'up', 'down', 'unknown'];

/**
 * Normalizes HTTP/HTTPS URLs by trimming, lowercasing protocol and hostname,
 * and stripping unnecessary trailing root slashes.
 */
export const normalizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return trimmed;
    }
    parsed.hostname = parsed.hostname.toLowerCase();
    let normalized = parsed.origin;
    if (parsed.pathname && parsed.pathname !== '/') {
      normalized += parsed.pathname;
    }
    if (parsed.search) {
      normalized += parsed.search;
    }
    if (parsed.hash) {
      normalized += parsed.hash;
    }
    return normalized;
  } catch {
    return trimmed;
  }
};

const monitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Monitor name is required'],
      trim: true,
      minlength: [1, 'Monitor name must not be empty'],
      maxlength: [100, 'Monitor name cannot exceed 100 characters'],
    },
    url: {
      type: String,
      required: [true, 'Target URL is required'],
      trim: true,
      set: normalizeUrl,
      validate: {
        validator: function (value) {
          try {
            const parsed = new URL(value);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid HTTP or HTTPS URL`,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      // User reference is linked for ownership; authentication enforcement in Phase 3
    },
    checkIntervalSeconds: {
      type: Number,
      default: 60,
      min: [10, 'Check interval must be at least 10 seconds'],
      max: [86400, 'Check interval cannot exceed 86400 seconds (24 hours)'],
    },
    timeoutMs: {
      type: Number,
      default: 10000,
      min: [1000, 'Timeout must be at least 1000ms'],
      max: [60000, 'Timeout cannot exceed 60000ms (60 seconds)'],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: 'Status must be one of: pending, up, down, unknown',
      },
      default: 'pending',
      index: true,
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    lastStatusChangeAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias `interval` for backward compatibility with Phase 1 frontend
monitorSchema.virtual('interval')
  .get(function () {
    return this.checkIntervalSeconds;
  })
  .set(function (value) {
    this.checkIntervalSeconds = value;
  });

// Compound indexes for user monitor lookups and status queries
monitorSchema.index({ user: 1, createdAt: -1 });
monitorSchema.index({ isActive: 1, status: 1 });

// Prevent accidental model recompilation errors during development/hot reload
export const Monitor = mongoose.models.Monitor || mongoose.model('Monitor', monitorSchema);
