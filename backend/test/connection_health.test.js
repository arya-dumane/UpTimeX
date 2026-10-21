import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User, Monitor, CheckResult, Incident } from '../src/models/index.js';
import { connectDB, getDatabaseStatus, maskMongoUri, sanitizeErrorMessage } from '../src/config/db.js';
import { getHealth } from '../src/controllers/healthController.js';

describe('Phase 2 In-Depth Runtime & Reference Verifications', () => {
  describe('Model Cross-References and Index Definitions', () => {
    it('verifies CheckResult references Monitor correctly', () => {
      const monitorPath = CheckResult.schema.path('monitor');
      assert.equal(monitorPath.options.ref, 'Monitor');
      assert.equal(monitorPath.instance, 'ObjectId');
      assert.equal(monitorPath.isRequired, true);
    });

    it('verifies Incident references Monitor correctly', () => {
      const monitorPath = Incident.schema.path('monitor');
      assert.equal(monitorPath.options.ref, 'Monitor');
      assert.equal(monitorPath.instance, 'ObjectId');
      assert.equal(monitorPath.isRequired, true);
    });

    it('verifies Monitor references User correctly', () => {
      const userPath = Monitor.schema.path('user');
      assert.equal(userPath.options.ref, 'User');
      assert.equal(userPath.instance, 'ObjectId');
    });

    it('verifies Monitor has ownership index { user: 1, createdAt: -1 }', () => {
      const indexes = Monitor.schema.indexes();
      const hasOwnershipIndex = indexes.some(
        ([idx]) => idx.user === 1 && idx.createdAt === -1
      );
      assert(hasOwnershipIndex, 'Monitor must have index on { user: 1, createdAt: -1 }');
    });

    it('verifies CheckResult has chronological check index { monitor: 1, checkedAt: -1 }', () => {
      const indexes = CheckResult.schema.indexes();
      const hasHistoryIndex = indexes.some(
        ([idx]) => idx.monitor === 1 && idx.checkedAt === -1
      );
      assert(hasHistoryIndex, 'CheckResult must have compound index { monitor: 1, checkedAt: -1 }');
    });

    it('verifies User email has unique: true', () => {
      const emailPath = User.schema.path('email');
      assert.equal(emailPath.options.unique, true);
      assert.equal(emailPath.options.lowercase, true);
      assert.equal(emailPath.options.trim, true);
      assert.equal(emailPath.isRequired, true);
    });
  });

  describe('Connection Handling & Health Endpoint Simulation', () => {
    it('handles connection failure clearly when target is unreachable', async () => {
      // Create a separate test connection instance to test unreachable host
      const testConn = new mongoose.Mongoose();
      let failedClearly = false;
      let errorCaptured = '';

      try {
        await testConn.connect('mongodb://127.0.0.1:27999/unreachable_test_db', {
          serverSelectionTimeoutMS: 1000,
        });
      } catch (err) {
        failedClearly = true;
        errorCaptured = err.message;
      }

      assert.equal(failedClearly, true, 'Unreachable connection must throw/fail clearly');
      assert(errorCaptured.length > 0);
      assert.equal(testConn.connection.readyState, 0, 'ReadyState must be 0 (disconnected)');
      await testConn.disconnect();
    });

    it('health endpoint accurately formats database connection details and never exposes credentials', () => {
      let responsePayload = null;
      let statusCode = null;

      const mockReq = {};
      const mockRes = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          responsePayload = data;
          return this;
        },
      };

      getHealth(mockReq, mockRes);

      assert.equal(statusCode, 200);
      assert(responsePayload && responsePayload.success === true);
      assert(responsePayload.data);
      assert(responsePayload.data.service === 'uptimex-api');
      assert(responsePayload.data.database);
      assert(typeof responsePayload.data.database.status === 'string');
      assert(typeof responsePayload.data.database.connected === 'boolean');
      assert(typeof responsePayload.data.database.readyState === 'string');

      // Ensure no raw URI or credentials in the payload
      const jsonStr = JSON.stringify(responsePayload);
      assert(!jsonStr.includes('mongodb://'));
      assert(!jsonStr.includes('password'));
    });
  });
});
