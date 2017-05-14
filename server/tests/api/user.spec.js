import supertest from 'supertest';
import { expect } from 'chai';
import database from '../../models';
import app from '../../../server';
import SpecHelper from '../helpers/SpecHelper';
import SeedHelper from '../helpers/SeedHelper';

const client = supertest.agent(app);
const regularUser = SpecHelper.generateRandomUser(2);
let regularUserToken;
let adminUserToken;
let regularUserId;

describe('Users:', () => {
  // Clear and populate the database first
  beforeEach((done) => {
    SeedHelper.populateRoleTable()
    database.User.create(regularUser)
    .then((user) => {
      // fetch regular user token and id for further tests
      // database.User.create(regularUser)
      // client.post('/users')
      // .send(regularUser)
      // .then((user) => {
        // set regular user token and id for other tests below
        // regularUserToken = user.token;
        // console.log('user ===>> ./', regularUserToken);
        // // console.log(response, 'Resonse');
        // console.log(regularUserToken, 'Response Token');
        regularUserId = user.id;
      // });
    });
    done();
  });

  // afterEach((done) => {
  //   // database.sequelize.sync({ force: true })
  //   .then(() => {
  //     done();
  //   });
  // });

  describe('Create User', () => {
    const newRegularUser = SpecHelper.generateRandomUser(2);
    it(`should return http code 201
      if a Regular User is successfully created`, (done) => {
      client.post('/users')
      .send(newRegularUser)
      .end((error, response) => {
        expect(response.status).to.equal(201);
        done();
      });
    });

    it(`should return a 401 status code if User ID is specified
    in new User to be created`,
    (done) => {
      const invalidNewUser = SpecHelper.generateRandomUser();
      invalidNewUser.id = 1;
      client.post('/users')
      .send(invalidNewUser)
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });

    it('should NOT allow Users with Duplicate Email address to be created',
    (done) => {
      client.post('/users')
      .send(newRegularUser)
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });

    it('should NOT allow an Admin User to be created',
    (done) => {
      const newAdminUser = SpecHelper.generateRandomUser(1);
      client.post('/users')
      .send(newAdminUser)
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
    });

    it('should NOT allow Users with invalid Role type to be created',
    (done) => {
      const invalidRoleUser = SpecHelper.generateRandomUser('super-admin');
      client.post('/users')
      .send(invalidRoleUser)
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });

    it('should return a TOKEN if a Regular User is successfully created',
    (done) => {
      client.post('/users')
      .send(SpecHelper.generateRandomUser(2))
      .end((error, response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('token');
        done();
      });
    });

    it('should return public details of the created Regular User',
    (done) => {
      client.post('/users')
      .send(SpecHelper.generateRandomUser(2))
      .end((error, response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('firstName');
        expect(response.body).to.have.property('lastName');
        expect(response.body).to.have.property('email');
        expect(response.body).to.have.property('id');
        done();
      });
    });

    it('should NOT create a User if Required fields/attributes are missing',
    (done) => {
      const invalidUser = {};
      client.post('/users')
      .send(invalidUser)
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });

    it(`should make a User role be regular by default if no roleId
      is supplied`, (done) => {
      client.post('/users')
      .send(SpecHelper.generateRandomUser())
      .end((error, response) => {
        expect(response.status).to.equal(201);
        done();
      });
    });

    it(`should retrun a 400 status code if the User specify a an invalid
    Role type`, (done) => {
      client.post('/users')
      .send(SpecHelper.generateRandomUser(10))
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });
  });

  describe('Login', () => {
    it('should allow login for only CORRECT details of an Admin', (done) => {
      database.User.create(SpecHelper.validAdminUser);
      client.post('/users/login')
      .send({
        email: SpecHelper.validAdminUser.email,
        password: SpecHelper.validAdminUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });

    it('should return a TOKEN if Admin Login is successful', (done) => {
      client.post('/users/login')
      .send({
        email: SpecHelper.validAdminUser.email,
        password: SpecHelper.validAdminUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('token');
        // set the admin user token for other tests
        adminUserToken = response.body.token;
        done();
      });
    });

    it('should NOT return a TOKEN if Admin Login FAILS', (done) => {
      client.post('/users/login')
      .send({
        email: SpecHelper.validAdminUser.email,
        password: 'wrongpassword'
      })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        expect(response.body).to.not.have.property('token');
        done();
      });
    });

    it('should return a TOKEN if Regular User Login is successful', (done) => {
      database.User.create(SpecHelper.validRegularUser);
      client.post('/users/login')
      .send({
        email: SpecHelper.validRegularUser.email,
        password: SpecHelper.validRegularUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('token');
        done();
      });
    });

    it(`should ensure payload of returned token does not contain
    sensitivedata of the User(for security reasons, only the user id
    should be exposed if necessary)`,
    (done) => {
      client.post('/users/login')
      .send({
        email: SpecHelper.validRegularUser.email,
        password: SpecHelper.validRegularUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        const tokenPayload = response.body.token.split('.')[1];
        const decodedToken = JSON.parse(
          new Buffer(tokenPayload, 'base64').toString()
        );
        expect(decodedToken).to.have.property('userId');
        expect(decodedToken).to.not.have.property('roleId');
        done();
      });
    });

    it('should NOT return a TOKEN if Regular User Login FAILS', (done) => {
      client.post('/users/login')
      .send({
        email: SpecHelper.validRegularUser.email,
        password: 'wrongpassword'
      })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        expect(response.body).to.not.have.property('token');
        done();
      });
    });

    it('should NOT allow login for a User that does NOT exist',
    (done) => {
      const nonRegisteredUser = SpecHelper.generateRandomUser(2);
      client.post('/users/login')
      .send({
        email: nonRegisteredUser.email,
        password: nonRegisteredUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(404);
        done();
      });
    });

    it('should NOT allow login if email is not provided',
    (done) => {
      client.post('/users/login')
      .send({
        password: SpecHelper.validRegularUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });

    it('should NOT allow login if password is not provided',
    (done) => {
      client.post('/users/login')
      .send({
        email: SpecHelper.validRegularUser.email
      })
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });
  });

  describe('Get Users', () => {
    // it('should allow NON-Admin with a valid token access to list of users',
    // (done) => {
    //   console.log('regularUserToken.. ===>>', regularUser);
    //   client.get('/users')
    //   .set({ 'x-access-token': regularUserToken })
    //   .end((error, response) => {
    //     expect(response.status).to.equal(200);
    //     expect(response.body).to.be.instanceof(Object);
    //     done();
    //   });
    // });

    it('should Allow an Admin User access to list of Users', (done) => {
      client.get('/users')
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.instanceOf(Object);
        done();
      });
    });

    it('should Not Allow Un-Authorized access to list of Users', (done) => {
      client.get('/users')
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });
  });

  describe('Get User', () => {
    // it('should allow NON-Admin  User with valid token fetch another User',
    // (done) => {
    //   client.get(`/users/${regularUserId + 1}`)
    //   .set({ 'x-access-token': regularUserToken })
    //   .end((error, response) => {
    //     expect(response.status).to.equal(200);
    //     expect(response.body).to.be.instanceOf(Object);
    //     done();
    //   });
    // });

    // it('should Allow an Admin User with valid token fetch another User',
    // (done) => {
    //   console.log('tomis admin', adminUserToken);
    //   client.get(`/users/${regularUserId}`)
    //   .set({ 'x-access-token': adminUserToken })
    //   .end((error, response) => {
    //     expect(response.status).to.equal(200);
    //     expect(response.body).to.be.instanceOf(Object);
    //     done();
    //   });
    // });

    it(`should return a 400 status code when an authenticated user
    passes an invalid user id when trying to fetch a user`,
    (done) => {
      client.get('/users/xxx')
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal('Bad Request');
        done();
      });
    });

    it('should Not Allow Un-Authorized fetch of a User', (done) => {
      client.get('/users/1')
      .end((error, response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.equal('Authentication Token Required');
        done();
      });
    });

    it(`should NOT return a User if User with specified id doesn't
    exist`, (done) => {
      client.get('/users/10000')
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(404);
        expect(response.body.message).to.equal('Resource(s) Not Found');
        done();
      });
    });

    it('should allow specifying offset when fetching Users', (done) => {
      const searchOffset = 3;
      client.get(`/users/?offset=${searchOffset}`)
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.instanceof(Object);
        done();
      });
    });

    it(`should handle invalid offsets specified when fetching Users
    and return a 400 status code`,
    (done) => {
      const invalidSearchOffset = -1;
      client.get(`/users/?offset=${invalidSearchOffset}`)
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal('Invalid Offset');
        done();
      });
    });
  });

  describe('Update User', () => {
    it('should NOT allow a User update another User profile', (done) => {
      client.put(`/users/${regularUserId + 1}`)
      .set({ 'x-access-token': ç })
      .send({ password: 'new password' })
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
    });

    // it(`should NOT Allow a User with a Valid token Update his password with a
    // password that is less than the minimum password length`,
    // (done) => {
    //   const shortPassword = '123';
    //   client.put(`/users/${regularUserId}`)
    //   .send({
    //     password: shortPassword
    //   })
    //   .set({ 'x-access-token': regularUserToken })
    //   .end((error, response) => {
    //     expect(response.status).to.equal(400);
    //     done();
    //   });
    // });

    // it(`should NOT Allow a User with a Valid token Update his password with a
    // password that is more than the maximum password length`,
    // (done) => {
    //   const longPassword = `sdfcgvbhnmdzghjbnmdfcghjndghjndmcxfghgggbjknmdcghjn
    //   gggmdcghvjn dsghvbjndsfghvbjdncsghbjdsghvbjdghvbjdc`;
    //   client.put(`/users/${regularUserId}`)
    //   .send({
    //     password: longPassword
    //   })
    //   .set({ 'x-access-token': regularUserToken })
    //   .end((error, response) => {
    //     expect(response.status).to.equal(400);
    //     done();
    //   });
    // });

    it('should Allow a User Update his password if a valid Token is provided',
    (done) => {
      // add the new password to the regular userObject
      regularUser.newPassword = 'new password';
      client.put(`/users/${regularUserId}`)
      .send({
        password: regularUser.newPassword
      })
      .set({ 'x-access-token': regularUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });

    it(`should return a 403 status code indication it does NOT
    allow a regular User Update to an Admin User`,
    (done) => {
      client.put(`/users/${regularUserId}`)
      .send({
        roleId: 1
      })
      .set({ 'x-access-token': regularUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
    });

    it(`should return a 403 status code indication it does NOT
    allow update of a User ID`,
    (done) => {
      client.put(`/users/${regularUserId}`)
      .send({
        id: 4
      })
      .set({ 'x-access-token': regularUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(400);
        done();
      });
    });

    it('should Allow a User Login with the updated password',
    (done) => {
      client.post('/users/login')
      .send({
        email: regularUser.email,
        password: regularUser.newPassword
      })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });

    it('should NOT Allow a User Login with the old password',
    (done) => {
      client.post('/users/login')
      .send({
        email: regularUser.email,
        password: regularUser.password
      })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it(`should Allow an Admin with a valid token update a regular
    User password`,
    (done) => {
      // add the admin set password to the regular user Object
      regularUser.adminSetPassword = 'admin set password';
      client.put(`/users/${regularUserId}`)
      .send({
        password: regularUser.adminSetPassword
      })
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });

    it(`should return a 404 response when an Admin tries to update
    a user that does NOT exist`,
    (done) => {
      // add the admin set password to the regular user Object
      regularUser.adminSetPassword = 'admin set password';
      client.put(`/users/${1000}`)
      .send({
        password: regularUser.adminSetPassword
      })
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(404);
        done();
      });
    });

    it(`should NOT allow a User Login with the old password already
    updated by an Admin`,
    (done) => {
      client.post('/users/login')
      .send({
        email: regularUser.email,
        password: regularUser.newPassword
      })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it('should Allow a User Login with the new password updated by an Admin',
    (done) => {
      client.post('/users/login')
      .send({
        email: regularUser.email,
        password: regularUser.adminSetPassword
      })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        // update the user token as a new token is always
        // generated on every login
        regularUserToken = response.body.token;
        done();
      });
    });

    it('should NOT allow a User update his profile without a valid Token',
    (done) => {
      client.put(`/users/${regularUserId}`)
      .set({ 'x-access-token': 'invalidToken' })
      .send({ firstName: 'newMan' })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });
  });

  describe('Logout', () => {
    const newRegularUser = SpecHelper.generateRandomUser(2);
    before((done) => {
      client.post('/users')
      .send(newRegularUser)
      .end((error, response) => {
        newRegularUser.token = response.body.token;
        newRegularUser.id = response.body.id;
        done();
      });
    });

    it('should Fail to Logout an Admin User with an invalid token',
    (done) => {
      client.post('/users/logout')
      .set({ 'x-access-token': 'invalidtoken' })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it('should Successfully Logout an Admin User with a valid token',
    (done) => {
      client.post('/users/logout')
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });

    it('should Fail to Logout an Admin User with an Expired token',
    (done) => {
      client.post('/users/logout')
      .set({ 'x-access-token': adminUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it('should Fail to Logout a Regular User with an invalid token',
    (done) => {
      client.post('/users/logout')
      .set({ 'x-access-token': 'invalidtoken' })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it('should Successfully Logout a Regular User with a valid token',
    (done) => {
      client.post('/users/logout')
      .set({ 'x-access-token': newRegularUser.token })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });
  });

  describe('Delete User', () => {
    const currentAdminUser = Object.assign({}, SpecHelper.validAdminUser);
    before((done) => {
      client.post('/users/login')
      .send(currentAdminUser)
      .end((error, response) => {
        currentAdminUser.token = response.body.token;
        currentAdminUser.id = response.body.id;
        done();
      });
    });

    it(`should NOT allow a Non-Admin User with a valid token delete
    another User`,
    (done) => {
      client.delete(`/users/${regularUserId + 1}`)
      .set({ 'x-access-token': regularUserToken })
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
    });

    it('should NOT allow a User with an invalid Token delete another User',
    (done) => {
      client.delete(`/users/${regularUserId + 1}`)
      .set({ 'x-access-token': 'invalidToken' })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it('should allow an Admin user with Valid Token delete another User',
    (done) => {
      client.delete(`/users/${regularUserId}`)
      .set({ 'x-access-token': currentAdminUser.token })
      .end((error, response) => {
        expect(response.status).to.equal(200);
        done();
      });
    });

    it('should NOT allow an Admin user with invalid Token delete another User',
    (done) => {
      client.delete(`/users/${regularUserId}`)
      .set({ 'x-access-token': 'invalid token' })
      .end((error, response) => {
        expect(response.status).to.equal(401);
        done();
      });
    });

    it(`should NOT allow an Admin user with valid Token delete a User that does
    not exist`, (done) => {
      client.delete(`/users/${regularUserId + 10000}`)
      .set({ 'x-access-token': currentAdminUser.token })
      .end((error, response) => {
        expect(response.status).to.equal(404);
        done();
      });
    });

    it('should not allow deletion of admin User', (done) => {
      client.delete(`/users/${1}`)
      .set({ 'x-access-token': currentAdminUser.token })
      .end((error, response) => {
        expect(response.status).to.equal(403);
        done();
      });
    });
  });
});
