const authController = require('../controllers/loginController'); 
const validation = require('../utils/validation');                
const Profile = require('../models/Profile');                   
const bcrypt = require('bcrypt');                                

// mocks modules in unit tests (from https://jestjs.io/docs/mock-functions)
jest.mock('../models/Profile');
jest.mock('../utils/validation');
jest.mock('bcrypt');

function createMockRes() {
  return {
    render: jest.fn(),   // jestfn creates a mock function
    redirect: jest.fn(),
  };
}

describe('Authentication – login', () => { 
  test('should show error when username or password is missing', async () => {
    // test(name, fn) for a single test case from slides
    const req = {
      body: { username: '', password: '' },
      session: {},
    };
    const res = createMockRes();

    await authController.login(req, res); 

    // instead of expect(val).toBe/toEqual from slides i used toHaveBeenCalledWith from https://jestjs.io/docs/mock-functions because the controller uses res.render() instead of returning a value
    expect(res.render).toHaveBeenCalledWith(
      'loginform',
      expect.objectContaining({ error: 'Username and password are required' })
    );
  });

  test('should redirect to admin if login is successful', async () => {
    const req = {
      body: { username: 'khloe', password: 'validPassword123!' },
      session: {},
    };
    const res = createMockRes();

    // mock validateUsername returns a valid sanitized username
    validation.validateUsername.mockReturnValue({
      isValid: true,
      sanitized: 'khloe',
    });

    // mock Profile.findOne simulates a user in DB
    Profile.findOne = jest.fn().mockReturnValue({
     lean: jest.fn().mockResolvedValue({
        _id: '123',
        username: 'khloe',
        email: 'khloe@example.com',
        fullName: 'Khloe Oseña',
        birthday: new Date('2003-01-01'),
        isAdmin: true,
        isMember: true,
        password: 'hashed-password',
        }),
    });

    // mock bcrypt.compare returns true if password matches
    bcrypt.compare.mockResolvedValue(true);

    await authController.login(req, res);

    // expect session is set
    expect(req.session.user).toEqual(
      expect.objectContaining({
        username: 'khloe',
        email: 'khloe@example.com',
        isAdmin: true,
      })
    );

    // expect redirects to admin dashboard 
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/admin?user=')
    );
  });
});

describe('Authentication – registration validation', () => {
  test('should fail registration validation when passwords do not match', () => {
    const data = {
      fullName: 'Test User',
      username: 'testuser',
      birthday: '2000-01-01',
      email: 'test@example.com',
      password: 'Password123!',
      confPassword: 'NotMatching123!',
    };

    // defines a mock implementation for a function in a mocked module from https://jestjs.io/docs/mock-functions
    validation.validateRegistrationData = jest.fn().mockReturnValue({
      isValid: false,
      errors: ['Passwords do not match'],
    });

    const result = validation.validateRegistrationData(data);

    // expect(val).toBe(value) from slides
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(['Passwords do not match'])
    );
  });
});

