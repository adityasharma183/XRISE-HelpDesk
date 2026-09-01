import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { UserModel, TicketModel, TicketMessageModel, TicketEventModel } from '../src/models/index.js';

let mongoServer: MongoMemoryServer | null = null;

export let testAdmin: any;
export let testAgent1: any;
export let testAgent2: any;
export let testAgent3: any;
export let testInactiveUser: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await UserModel.deleteMany({});
    await TicketModel.deleteMany({});
    await TicketMessageModel.deleteMany({});
    await TicketEventModel.deleteMany({});

    testAdmin = await UserModel.create({
      name: 'Admin User',
      email: 'admin@xriseai.com',
      passwordHash: await bcrypt.hash('admin@123', 8),
      role: 'ADMIN',
      isActive: true,
    });

    testAgent1 = await UserModel.create({
      name: 'Aarav Sharma',
      email: 'agent1@xriseai.com',
      passwordHash: await bcrypt.hash('agent1@123', 8),
      role: 'AGENT',
      isActive: true,
    });

    testAgent2 = await UserModel.create({
      name: 'Ananya Patel',
      email: 'agent2@xriseai.com',
      passwordHash: await bcrypt.hash('agent2@123', 8),
      role: 'AGENT',
      isActive: true,
    });

    testAgent3 = await UserModel.create({
      name: 'Rohan Verma',
      email: 'agent3@xriseai.com',
      passwordHash: await bcrypt.hash('agent3@123', 8),
      role: 'AGENT',
      isActive: true,
    });

    testInactiveUser = await UserModel.create({
      name: 'Inactive Agent',
      email: 'inactive@xriseai.com',
      passwordHash: await bcrypt.hash('inactive@123', 8),
      role: 'AGENT',
      isActive: false,
    });
  }
});
