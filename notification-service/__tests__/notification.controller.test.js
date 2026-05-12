jest.mock('../src/config/db', () => ({
  ref: jest.fn()
}));

const db = require('../src/config/db');
const controller = require('../src/controllers/controller');

describe('Notification Controller Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });


  // TEST 1
  test('Debe crear notificacion correctamente', async () => {

    const set = jest.fn().mockResolvedValue();

    const push = jest.fn(() => ({
      key: 'notif123',
      set
    }));

    db.ref.mockReturnValue({
      push
    });

    const req = {
      body: {
        userId: '1',
        userName: 'Juan',
        groupName: 'Backend',
        invitationId: 'inv1'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await controller.sendNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });


  // TEST 2
  test('Debe manejar errores al crear notificacion', async () => {

    const push = jest.fn(() => ({
      key: 'notif123',
      set: jest.fn().mockRejectedValue(
        new Error('Firebase error')
      )
    }));

    db.ref.mockReturnValue({
      push
    });

    const req = {
      body: {}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await controller.sendNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });


  // TEST 3
  test('Debe listar notificaciones', async () => {

    const once = jest.fn().mockResolvedValue({
      exists: () => true,
      val: () => ({
        a: {
          id: '1',
          message: 'Hola'
        }
      })
    });

    db.ref.mockReturnValue({
      once
    });

    const req = {
      params: {
        userId: '1'
      }
    };

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await controller.listMyNotifications(req, res);

    expect(res.json).toHaveBeenCalled();
  });


  // TEST 4
  test('Debe retornar lista vacia', async () => {

    const once = jest.fn().mockResolvedValue({
      exists: () => false
    });

    db.ref.mockReturnValue({
      once
    });

    const req = {
      params: {
        userId: '1'
      }
    };

    const res = {
      json: jest.fn()
    };

    await controller.listMyNotifications(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });


  // TEST 5
  test('Debe manejar error listando notificaciones', async () => {

    const once = jest.fn().mockRejectedValue(
      new Error('Firebase error')
    );

    db.ref.mockReturnValue({
      once
    });

    const req = {
      params: {
        userId: '1'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await controller.listMyNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});