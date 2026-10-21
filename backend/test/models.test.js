import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Monitor, normalizeUrl } from '../src/models/Monitor.js';
import { CheckResult } from '../src/models/CheckResult.js';
import { Incident } from '../src/models/Incident.js';
import { maskMongoUri, sanitizeErrorMessage } from '../src/config/db.js';

describe('UptimeX Phase 2 Model & Architecture Tests', () => {
  describe('Database Credential Masking', () => {
    it('masks credentials in standard mongodb:// URIs', () => {
      const uri = 'mongodb://app_user:superSecretPassword123@127.0.0.1:27017/uptimex';
      const masked = maskMongoUri(uri);
      assert.equal(masked, 'mongodb://***:***@127.0.0.1:27017/uptimex');
      assert(!masked.includes('superSecretPassword123'));
    });

    it('masks credentials in mongodb+srv:// Atlas URIs', () => {
      const uri = 'mongodb+srv://prod_admin:MyComplexP@ssw0rd@cluster0.abcde.mongodb.net/uptimex?retryWrites=true';
      const masked = maskMongoUri(uri);
      assert.equal(masked, 'mongodb+srv://***:***@cluster0.abcde.mongodb.net/uptimex?retryWrites=true');
      assert(!masked.includes('MyComplexP@ssw0rd'));
    });

    it('sanitizes error messages containing sensitive URIs', () => {
      const errMsg = 'Failed to connect to mongodb://admin:secretPass@cluster0.mongodb.net/db: connection timed out';
      const sanitized = sanitizeErrorMessage(errMsg);
      assert(!sanitized.includes('secretPass'));
      assert(sanitized.includes('mongodb://***:***@cluster0.mongodb.net/db'));
    });
  });

  describe('User Model Schema', () => {
    it('validates required fields: name, email, passwordHash', () => {
      const user = new User({});
      const err = user.validateSync();
      assert(err);
      assert(err.errors.name, 'Name should be required');
      assert(err.errors.email, 'Email should be required');
      assert(err.errors.passwordHash, 'PasswordHash should be required');
    });

    it('normalizes email to lowercase and trimmed string', () => {
      const user = new User({
        name: 'Jane Doe',
        email: '   Jane.Doe@Example.COM  ',
        passwordHash: '$2b$10$dummyHashValue1234567890123456789012',
      });
      assert.equal(user.email, 'jane.doe@example.com');
      const err = user.validateSync();
      assert.equal(err, undefined);
    });

    it('rejects invalid email formats', () => {
      const user = new User({
        name: 'Jane Doe',
        email: 'invalid-email-address',
        passwordHash: 'hashedSecret',
      });
      const err = user.validateSync();
      assert(err && err.errors.email);
    });

    it('excludes passwordHash from toJSON output', () => {
      const user = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        passwordHash: 'secretHash123',
      });
      const json = user.toJSON();
      assert.equal(json.passwordHash, undefined, 'passwordHash must never be serialized');
      assert.equal(json.email, 'jane@example.com');
    });
  });

  describe('Monitor Model Schema & URL Normalization', () => {
    it('normalizes URLs: lowercases host, trims, and strips unnecessary trailing root slash', () => {
      assert.equal(
        normalizeUrl('  HTTPS://API.MyCompany.COM/  '),
        'https://api.mycompany.com'
      );
      assert.equal(
        normalizeUrl('http://example.com/health?check=1'),
        'http://example.com/health?check=1'
      );
    });

    it('validates required fields: name, url', () => {
      const monitor = new Monitor({});
      const err = monitor.validateSync();
      assert(err);
      assert(err.errors.name, 'Name should be required');
      assert(err.errors.url, 'URL should be required');
    });

    it('rejects invalid URL protocols and formats', () => {
      const monitor = new Monitor({
        name: 'Invalid FTP',
        url: 'ftp://files.example.com',
      });
      const err = monitor.validateSync();
      assert(err && err.errors.url);
    });

    it('enforces status enum: pending, up, down, unknown', () => {
      const validStatuses = ['pending', 'up', 'down', 'unknown'];
      for (const status of validStatuses) {
        const monitor = new Monitor({
          name: 'Test Monitor',
          url: 'https://example.com',
          status,
        });
        const err = monitor.validateSync();
        assert.equal(err, undefined, `Status "${status}" should be valid`);
      }

      const invalidMonitor = new Monitor({
        name: 'Test Monitor',
        url: 'https://example.com',
        status: 'arbitrary_fake_status',
      });
      const err = invalidMonitor.validateSync();
      assert(err && err.errors.status, 'Arbitrary status should be rejected');
    });

    it('enforces interval and timeout boundaries', () => {
      const monitor = new Monitor({
        name: 'Boundary Test',
        url: 'https://example.com',
        checkIntervalSeconds: 5, // Below 10 min
        timeoutMs: 500, // Below 1000 min
      });
      const err = monitor.validateSync();
      assert(err && err.errors.checkIntervalSeconds);
      assert(err && err.errors.timeoutMs);
    });
  });

  describe('CheckResult Model Schema & Indexes', () => {
    it('validates required fields: monitor, status', () => {
      const result = new CheckResult({});
      const err = result.validateSync();
      assert(err);
      assert(err.errors.monitor, 'Monitor reference should be required');
      assert(err.errors.status, 'Status should be required');
    });

    it('allows only "up" and "down" as status', () => {
      const dummyId = new mongoose.Types.ObjectId();
      const validUp = new CheckResult({ monitor: dummyId, status: 'up' });
      assert.equal(validUp.validateSync(), undefined);

      const validDown = new CheckResult({ monitor: dummyId, status: 'down' });
      assert.equal(validDown.validateSync(), undefined);

      const invalid = new CheckResult({ monitor: dummyId, status: 'pending' });
      const err = invalid.validateSync();
      assert(err && err.errors.status, 'Status other than up/down must be rejected');
    });

    it('supports nullable telemetry fields: statusCode, responseTimeMs, errorMessage', () => {
      const dummyId = new mongoose.Types.ObjectId();
      const result = new CheckResult({
        monitor: dummyId,
        status: 'up',
        statusCode: null,
        responseTimeMs: null,
        errorMessage: null,
      });
      assert.equal(result.validateSync(), undefined);
    });

    it('rejects negative response times', () => {
      const dummyId = new mongoose.Types.ObjectId();
      const result = new CheckResult({
        monitor: dummyId,
        status: 'up',
        responseTimeMs: -50,
      });
      const err = result.validateSync();
      assert(err && err.errors.responseTimeMs);
    });

    it('defines compound index on { monitor: 1, checkedAt: -1 }', () => {
      const indexes = CheckResult.schema.indexes();
      const hasCompoundIndex = indexes.some(
        ([idx]) => idx.monitor === 1 && idx.checkedAt === -1
      );
      assert(hasCompoundIndex, 'CheckResult must have compound index { monitor: 1, checkedAt: -1 }');
    });
  });

  describe('Incident Model Schema & Partial Unique Index', () => {
    it('validates required fields: monitor, cause, status', () => {
      const incident = new Incident({});
      const err = incident.validateSync();
      assert(err);
      assert(err.errors.monitor, 'Monitor reference should be required');
      assert(err.errors.cause, 'Cause description should be required');
    });

    it('defaults status to "ongoing" and allows "resolved"', () => {
      const dummyId = new mongoose.Types.ObjectId();
      const incident = new Incident({
        monitor: dummyId,
        cause: 'HTTP 502 Bad Gateway',
      });
      assert.equal(incident.status, 'ongoing');

      incident.status = 'resolved';
      incident.resolvedAt = new Date();
      assert.equal(incident.validateSync(), undefined);

      incident.status = 'invalid_incident_status';
      const err = incident.validateSync();
      assert(err && err.errors.status);
    });

    it('defines partial unique index enforcing at most one ongoing incident per monitor', () => {
      const indexes = Incident.schema.indexes();
      const partialIndex = indexes.find(
        ([idx, opts]) =>
          idx.monitor === 1 &&
          opts &&
          opts.unique === true &&
          opts.partialFilterExpression &&
          opts.partialFilterExpression.status === 'ongoing'
      );
      assert(
        partialIndex,
        'Incident schema must define a unique partial index for { status: "ongoing" }'
      );
    });
  });
});
