const flightController = require('../controllers/flightController'); 
const Available_Flight = require('../models/Available_Flight');      
const validation = require('../utils/validation');                    

jest.mock('../models/Available_Flight');
jest.mock('../utils/validation');

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    render: jest.fn(),
    redirect: jest.fn(),
  };
}

describe('Admin flight creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should block non-admin users from creating flights', async () => {
    const req = {
      session: {
        user: {
          username: 'normalUser',
          isAdmin: false,
        },
      },
      body: {},
    };
    const res = createMockRes();

    await flightController.createFlight(req, res);

    // from flightController.js where non-admin returns 403 JSON with error message 
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Only administrators can create flights',
      })
    );
  });

  test('should create flight successfully for valid admin data', async () => {
    const req = {
      session: {
        user: {
          username: 'adminUser',
          isAdmin: true,
        },
      },
      body: {
        flightNumber: 'DL123',
        origin: 'MNL',
        destination: 'NRT',
        departure_date: '2025-12-01',
        departure_time: '08:00',
        arrival_date: '2025-12-01',
        arrival_time: '13:00',
        aircraftType: 'Boeing 777',
        seatCapacity: '300',
        airline: 'DLSU Airlines',
        price: '599.99',
      },
    };
    const res = createMockRes();

    // mocks all validation functions to pass as in validation.js 
    validation.validateFlightNumber.mockReturnValue({ isValid: true, sanitized: 'DL123' });
    validation.validateAirportCode = jest.fn()
      .mockReturnValueOnce({ isValid: true, sanitized: 'MNL' })
      .mockReturnValueOnce({ isValid: true, sanitized: 'NRT' });
    validation.validateDateTime = jest.fn().mockReturnValue({ isValid: true });
    validation.validateSeatCapacity.mockReturnValue({ isValid: true, sanitized: 300 });
    validation.validatePrice.mockReturnValue({ isValid: true, sanitized: '599.99' });
    validation.validateTextField.mockReturnValue({ isValid: true, sanitized: 'OK' });

    const saveMock = jest.fn().mockResolvedValue({});

    // mocks Available_Flight constructor to have .save()
    Available_Flight.mockImplementation(function (data) {
      this.data = data;
      this.save = saveMock;
    });

    await flightController.createFlight(req, res);

    expect(saveMock).toHaveBeenCalled();

    // this redirects to /admin/flights with success message in query string 
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/admin/flights')
    );
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('message=Flight')
    );
  });
});
