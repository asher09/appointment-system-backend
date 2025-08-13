import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index'; 
import dotenv from 'dotenv';

dotenv.config({path:'.env.test'});

describe('Appointment System E2E Flow', () => {
  let studentA1Token: string;
  let studentA1Id: string;
  let professorP1Token: string;
  let professorP1Id: string;
  let slot1Id: string;
  let slot2Id: string;
  let studentA2Token: string;
  let studentA2Id: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_URL!);
    }
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('StudentA1 registers and logs in', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student A1', email: 'a1@mail.com', password: '123123123', role: 'student' })
      .expect(200);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a1@mail.com', password: '123123123' })
      .expect(200);

    studentA1Token = res.body.token;
    // Decode token to get user id if not returned in body
    // For this codebase, only token is returned, so you may need to fetch user id separately if needed
  });

  it('ProfessorP1 registers and logs in', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Professor P1', email: 'p1@mail.com', password: '123123123', role: 'professor' })
      .expect(200);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'p1@mail.com', password: '123123123' })
      .expect(200);

    professorP1Token = res.body.token;
    // Same note as above for user id
  });

  it('ProfessorP1 creates two available slots', async () => {
    const res1 = await request(app)
      .post('/api/appointments/availability')
      .set('Authorization', `Bearer ${professorP1Token}`)
      .send({ startTime: '2025-08-13T10:00:00Z', endTime: '2025-08-13T10:30:00Z' })
      .expect(201);

    slot1Id = res1.body._id;

    const res2 = await request(app)
      .post('/api/appointments/availability')
      .set('Authorization', `Bearer ${professorP1Token}`)
      .send({ startTime: '2025-08-13T11:00:00Z', endTime: '2025-08-13T11:30:00Z' })
      .expect(201);

    slot2Id = res2.body._id;
  });

  it('StudentA1 views available slots for ProfessorP1', async () => {
    // You need professor's user ID for this route
    // Let's fetch it by querying the User model (or you can hardcode if you know it)
    if (!mongoose.connection.db) {
      throw new Error('database connection is not established');
    }
    const users = await mongoose.connection.db.collection('users').find({ email: 'p1@mail.com' }).toArray();
    professorP1Id = users[0]._id.toString();

    const res = await request(app)
      .get(`/api/appointments/available/${professorP1Id}`)
      .set('Authorization', `Bearer ${studentA1Token}`)
      .expect(201);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('StudentA1 books appointment T1', async () => {
    const res = await request(app)
      .put(`/api/appointments/book/${slot1Id}`)
      .set('Authorization', `Bearer ${studentA1Token}`)
      .expect(200);

    expect(res.body.appointment.status).toBe('booked');
    // Optionally check student field if you fetch studentA1Id
  });

  it('StudentA2 registers, logs in, and books appointment T2', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student A2', email: 'a2@mail.com', password: '123123123', role: 'student' })
      .expect(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a2@mail.com', password: '123123123' })
      .expect(200);

    studentA2Token = loginRes.body.token;

    const bookRes = await request(app)
      .put(`/api/appointments/book/${slot2Id}`)
      .set('Authorization', `Bearer ${studentA2Token}`)
      .expect(200);

    expect(bookRes.body.appointment.status).toBe('booked');
  });

  it('ProfessorP1 cancels appointment with StudentA1', async () => {
    await request(app)
      .put(`/api/appointments/cancel/${slot1Id}`)
      .set('Authorization', `Bearer ${professorP1Token}`)
      .expect(200);
  });

  it('StudentA1 checks their appointments (should be empty)', async () => {
    const res = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${studentA1Token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});