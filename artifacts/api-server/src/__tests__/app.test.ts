import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('App Endpoints', () => {
  it('should return 503 for health route when DB is not connected', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
  });
});
