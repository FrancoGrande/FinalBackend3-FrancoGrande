import request from 'supertest';
import chai from 'chai';
const expect = chai.expect;

const URL = 'http://localhost:3000';

describe('Adoption Router', () => {
  let createdAdoptionId = null;
  let testUserId = null;
  let testPetId = null;

  // Antes de los tests, crear un usuario y una mascota si es necesario
  before(async () => {
    // Crear usuario de prueba
    const userRes = await request(URL)
      .post('/api/users')
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: `testuser_${Date.now()}@example.com`,
        password: '123456'
      });
    expect(userRes.status).to.equal(201);
    testUserId = userRes.body.payload._id;

    // Crear mascota de prueba
    const petRes = await request(URL)
      .post('/api/pets')
      .send({
        name: 'Firulais',
        specie: 'dog',
        birthDate: '2020-01-01',
        adopted: false
      });
    expect(petRes.status).to.equal(200);
    testPetId = petRes.body.payload._id;
  });

  it('should GET a specific adoption', async () => {
    // Crear una adopción para obtener un ID
    const createRes = await request(URL)
      .post(`/api/adoptions/${testUserId}/${testPetId}`)
      .send({});

    expect(createRes.status).to.equal(200);
    expect(createRes.body.payload).to.be.an('object');
    const adoptionId = createRes.body.payload._id;

    // Obtener la adopción por ID
    const response = await request(URL).get(`/api/adoptions/${adoptionId}`);
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.be.an('object');
    expect(response.body.payload._id).to.equal(adoptionId);
  });

  it('should POST a new adoption', async () => {
    const response = await request(URL)
      .post(`/api/adoptions/${testUserId}/${testPetId}`)
      .send({});

    expect(response.status).to.equal(200);
    expect(response.body.payload).to.be.an('object');
  });

  it('should GET all adoptions', async () => {
    const response = await request(URL).get('/api/adoptions');
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.be.an('array');
  });

  afterEach(async () => {
    // Limpiar el array de mascotas del usuario después de cada test
    await request(URL)
      .put(`/api/users/${testUserId}`)
      .send({ pets: [] });
    // Resetear la propiedad adopted de la mascota después de cada test
    await request(URL)
      .put(`/api/pets/${testPetId}`)
      .send({ adopted: false });
  });
});