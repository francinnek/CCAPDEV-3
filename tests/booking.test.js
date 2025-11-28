const validation = require('../utils/validation');          
const Booking = require('../models/Booking');               
const Available_Flight = require('../models/Available_Flight'); 

jest.mock('../models/Booking');
jest.mock('../models/Available_Flight');
jest.mock('../utils/validation');

// re-implements a simpler ver of the booking creation logic from server.js as a testable func
// the logic here is copied from app.post in bookings in server.js
async function createBookingHandler(req, res) {
  try {
    const { flightId, selectedSeat } = req.body;

    if (!flightId) {
      return res.status(400).json({ error: 'Missing flightId' });
    }

    const flightIdValidation = validation.validateMongoId(String(flightId));
    if (!flightIdValidation.isValid) {
      return res.status(400).json({ error: 'Invalid flightId' });
    }

    const seatValidation = validation.validateSeat(String(selectedSeat || ''));
    if (!seatValidation.isValid) {
      return res.status(400).json({ error: seatValidation.error });
    }

    const flightUpdate = await Available_Flight.findOneAndUpdate(
      { _id: flightId, bookedSeats: { $ne: seatValidation.sanitized } },
      { $push: { bookedSeats: seatValidation.sanitized } },
      { new: true }
    );

    if (!flightUpdate) {
      const flightExists = await Available_Flight.exists({ _id: flightId });
      if (!flightExists) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      return res.status(409).json({
        error: 'Selected seat is already booked. Please choose a different seat.',
      });
    }

    req.body.username = req.session.user?.username || req.body.username;
    req.body.selectedSeat = seatValidation.sanitized;

    const booking = new Booking(req.body);
    await booking.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// simpler ver of the cancellation logic from app.post in reservations/:id/cancel in server.js
async function cancelReservationHandler(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).send('Reservation not found');
    }

    booking.status = 'cancelled';
    await booking.save();

    try {
      if (booking.flightId && booking.selectedSeat) {
        await Available_Flight.updateOne(
          { _id: booking.flightId },
          { $pull: { bookedSeats: booking.selectedSeat } }
        );
      }
    } catch (e) {
    }

    res.redirect('/reservations');
  } catch (err) {
    res.status(500).send('Error cancelling reservation');
  }
}

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    redirect: jest.fn(),
  };
}

describe('Reservation creation (POST /bookings)', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // resets all mocked functions before each test so that the tests don’t affect each other 
  });

  test('should reject booking when flightId is missing', async () => {
    const req = {
      body: { selectedSeat: '12A' },
      session: { user: { username: 'khloe' } },
    };
    const res = createMockRes();

    await createBookingHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing flightId' });
  });

  test('should create booking successfully for valid data', async () => {
    const req = {
      body: { flightId: '123', selectedSeat: '12A', origin: 'MNL', destination: 'NRT' },
      session: { user: { username: 'khloe' } },
    };
    const res = createMockRes();

    validation.validateMongoId.mockReturnValue({ isValid: true, sanitized: '123' });
    validation.validateSeat.mockReturnValue({ isValid: true, sanitized: '12A' });

    Available_Flight.findOneAndUpdate.mockResolvedValue({ _id: '123' });

    Available_Flight.exists.mockResolvedValue(true);

    const saveMock = jest.fn().mockResolvedValue({});
    Booking.mockImplementation(function (data) {
      this.data = data;
      this.save = saveMock;
    });

    await createBookingHandler(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(req.body.username).toBe('khloe');
    expect(req.body.selectedSeat).toBe('12A');
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});

describe('Reservation cancellation (POST /reservations/:id/cancel)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 404 when booking is not found', async () => {
    const req = { params: { id: 'nonexistent' } };
    const res = createMockRes();

    Booking.findById.mockResolvedValue(null);

    await cancelReservationHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Reservation not found');
  });

  test('should cancel booking and redirect to /reservations', async () => {
    const saveMock = jest.fn().mockResolvedValue({});
    const bookingDoc = {
      status: 'confirmed',
      flightId: 'flight123',
      selectedSeat: '12A',
      save: saveMock,
    };

    Booking.findById.mockResolvedValue(bookingDoc);
    Available_Flight.updateOne.mockResolvedValue({});

    const req = { params: { id: 'booking123' } };
    const res = createMockRes();

    await cancelReservationHandler(req, res);

    expect(bookingDoc.status).toBe('cancelled');
    expect(saveMock).toHaveBeenCalled();
    expect(Available_Flight.updateOne).toHaveBeenCalledWith(
      { _id: 'flight123' },
      { $pull: { bookedSeats: '12A' } }
    );
    expect(res.redirect).toHaveBeenCalledWith('/reservations');
  });
});
