jest.mock('../src/config/db', () => ({
  ref: jest.fn()
}));

const db = require('../src/config/db');
const service = require('../src/services/service');

describe('Study Service Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST 1
  test('Debe crear grupo correctamente', async () => {

    const push = jest.fn(() => ({
      key: 'group123'
    }));

    const update = jest.fn().mockResolvedValue();

    db.ref.mockImplementation((path) => {

      if (path === 'groups') {
        return { push };
      }

      return { update };
    });

    const result = await service.createGroup(
      {
        name: 'Grupo Test'
      },
      7
    );

    expect(result.id).toBe('group123');
    expect(result.created_by).toBe(7);
    expect(update).toHaveBeenCalled();
  });


  // TEST 2
  test('Debe retornar grupos vacios', async () => {

    const once = jest.fn().mockResolvedValue({
      exists: () => false
    });

    db.ref.mockReturnValue({
      once
    });

    const result = await service.getMyGroups(5);

    expect(result).toEqual([]);
  });


  // TEST 3
  test('Debe crear sesion correctamente', async () => {

    const set = jest.fn().mockResolvedValue();

    const push = jest.fn(() => ({
      key: 'session123',
      set
    }));

    db.ref.mockReturnValue({
      push
    });

    const result = await service.createSession(
      'group1',
      {
        topic: 'Arquitectura'
      }
    );

    expect(result.id).toBe('session123');
    expect(set).toHaveBeenCalled();
  });




});