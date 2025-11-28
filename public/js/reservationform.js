$(document).ready(function() {
    let selectedSeat = '';
    let mealOption = 'Standard';
    const mealDropdownToggle = $('#reservationForm .dropdown-toggle');
    const urlParams = new URLSearchParams(window.location.search);
    
    const isModification = $('#reservationForm').data('booking-id') !== undefined;
    const bookingId = $('#reservationForm').data('booking-id');
    
    let flightPrice, origin, destination, airline, departure, arrival;
    
    //Use provided data from handlebars
    if (isModification && window.flightData) {
        //asign values from handlebars to the variables        
        const f = window.flightData;
        flightPrice = parseInt(f.price) || 40; 
        origin = f.origin || 'Unknown Origin'; 
        destination = f.destination || 'Unknown Destination';
        airline = f.airline || 'Unknown Airline';
        departure = f.departure || f.departure_time || 'N/A';
        arrival = f.arrival || f.arrival_time || 'N/A';

        selectedSeat = window.currentSelectedSeat || '';
        mealOption = mealDropdownToggle.text();

        // Pre-select the current seat 
        setTimeout(() => { // Delay first to ensure seat map renders
            $('.grid-square.hover-effect').each(function() {
                const row = $(this).closest('.row').find('.seatAisle').text().trim();
                const col = $(this).parent().children().index(this);
                const letters = ['A', 'B', 'C', '', 'D', 'E', 'F'];
                // Construct seat as row number followed by letter (e.g., 1A)
                const seat = row + letters[col];
                if (seat === selectedSeat) $(this).addClass('selected');
            });
        }, 100);
    } else {
        // new booking via parameters set by search page
        flightPrice = parseInt(urlParams.get('price')) || 40;
        origin = urlParams.get('origin') || 'Unknown Origin';
        destination = urlParams.get('destination') || 'Unknown Destination';
        airline = urlParams.get('airline') || 'Unknown Airline';
        departure = urlParams.get('flightDeparture') || 'N/A';
        arrival = urlParams.get('flightArrival') || 'N/A';
    }

    // Set initial dropdown text for new bookings
    if (!isModification) {
        mealDropdownToggle.text(mealOption);
    }
    
    // Meal select
    $('#reservationForm .dropdown-menu .dropdown-item').click(function(e) {
        e.preventDefault();
        mealOption = $(this).data('value');
        mealDropdownToggle.text(mealOption);
    });

    // Seat select
    $('.grid-square.hover-effect').click(function() {
        $('.grid-square.hover-effect').removeClass('selected');
        $(this).addClass('selected');
        
        const row = $(this).closest('.row').find('.seatAisle').text().trim();
        const col = $(this).parent().children().index(this);
        const letters = ['A', 'B', 'C', '', 'D', 'E', 'F'];
        // Construct selected seat as row number + letter to match validators (e.g., 1A)
        selectedSeat = row + letters[col];
        console.log('Selected seat:', selectedSeat);
    });

    // Selected seat style
    $('<style>')
        .text('.selected { background-color: #198754 !important; color: white; }')
        .appendTo('head');

    // Show summary modal
    $('.submit-btn').click(function(e) {
        e.preventDefault();
        const name = $('#name').val();
        const email = $('#email').val();
        const passportId = $('#passportId').val();
        const extraBaggage = parseInt($('#extraBaggage').val()) || 0;

        // client side validation
        //validates the inputs by sending it to clientValidation.js
        const validationErrors = []; // initialize error array

        // Validate name for new bookings
        if (!isModification) { 
            const nameValidation = ClientValidation.validateFullName(name); 
            if (!nameValidation.isValid) validationErrors.push(nameValidation.error); 

            // Validate email
            const emailValidation = ClientValidation.validateEmail(email);
            if (!emailValidation.isValid) validationErrors.push(emailValidation.error);

            // Validate passport ID
            const passportValidation = ClientValidation.validatePassportId(passportId);
            if (!passportValidation.isValid) validationErrors.push(passportValidation.error);
        }

        // Validate seat selection
        if (!selectedSeat) {
            validationErrors.push('Please select a seat');
        } else {
            const seatValidation = ClientValidation.validateSeat(selectedSeat);
            if (!seatValidation.isValid) validationErrors.push(seatValidation.error);
        }

        // Validate meal option
        const mealValidation = ClientValidation.validateMealOption(mealOption);
        if (!mealValidation.isValid) validationErrors.push(mealValidation.error);

        // Validate extra baggage
        const baggageValidation = ClientValidation.validateExtraBaggage(extraBaggage);
        if (!baggageValidation.isValid) validationErrors.push(baggageValidation.error);

        // Show validation errors
        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
            return;
        }
        // Calculate prices
        const baggagePrice = baggageValidation.sanitized * 60;
        const totalPrice = flightPrice + baggagePrice;
        // Show summary modal
        const summaryText = `
            <strong>Passenger Information:</strong><br>
            Name: ${ClientValidation.validateFullName(name).sanitized || name}<br>
            Email: ${email}<br>
            Passport ID: ${passportId}<br>
            <br>
            <strong>Flight Details:</strong><br>
            ${origin} to ${destination}<br>
            ${airline}<br>
            Departure: ${departure}<br>
            Arrival: ${arrival}<br>
            Selected Seat: ${selectedSeat}<br>
            Meal Option: ${mealOption}<br>
            Extra Baggage: ${baggageValidation.sanitized} ($${baggagePrice})<br>
            <br>
            <strong>Price Breakdown:</strong><br>
            Flight Price: $${flightPrice}<br>
            Extra Baggage: $${baggagePrice}<br>
        `;

        $('#summaryText').html(summaryText);
        $('#totalAmount').text(`$${totalPrice}`);
        $('#cartModal').modal('show');
    });

    // Confirm submit/update
    $(document).on('click', '#confirmBooking', function() {
        const name = $('#name').val();
        const email = $('#email').val();
        const passportId = $('#passportId').val();
        const extraBaggage = parseInt($('#extraBaggage').val()) || 0;
        
        // final client-side validation before submission (all same validations)
        const validationErrors = [];
        
        if (!isModification) {
            const nameValidation = ClientValidation.validateFullName(name);
            if (!nameValidation.isValid) validationErrors.push(nameValidation.error);

            const emailValidation = ClientValidation.validateEmail(email);
            if (!emailValidation.isValid) validationErrors.push(emailValidation.error);

            const passportValidation = ClientValidation.validatePassportId(passportId);
            if (!passportValidation.isValid) validationErrors.push(passportValidation.error);
        }
        
        const seatValidation = ClientValidation.validateSeat(selectedSeat);
        if (!seatValidation.isValid) validationErrors.push(seatValidation.error);

        const mealValidation = ClientValidation.validateMealOption(mealOption);
        if (!mealValidation.isValid) validationErrors.push(mealValidation.error);

        const baggageValidation = ClientValidation.validateExtraBaggage(extraBaggage);
        if (!baggageValidation.isValid) validationErrors.push(baggageValidation.error);

        if (validationErrors.length > 0) {
            alert('Validation errors:\n\n' + validationErrors.join('\n'));
            return;
        }
        
        const baggagePrice = baggageValidation.sanitized * 60;
        const totalPrice = flightPrice + baggagePrice;

        // Get username from global parameters
        const username = urlParams.get('user') || '';
        // final booking data object
        const bookingData = {
            username: username,
            name: !isModification ? ClientValidation.validateFullName(name).sanitized : name,
            email: !isModification ? ClientValidation.validateEmail(email).sanitized : email,
            passportId: !isModification ? ClientValidation.validatePassportId(passportId).sanitized : passportId,
            selectedSeat: ClientValidation.validateSeat(selectedSeat).sanitized,
            mealOption: ClientValidation.validateMealOption(mealOption).sanitized,
            flightId: window.flightData && window.flightData._id,
            extraBaggage: baggageValidation.sanitized,
            origin,
            destination,
            airline,
            flightDeparture: departure,
            flightArrival: arrival,
            flightPrice,
            baggagePrice,
            totalPrice,
            status: 'confirmed'
        };
        
        const url = isModification ? `/bookings/${bookingId}` : '/bookings';
        const method = isModification ? 'PUT' : 'POST';
        
        // Get username from URL params or page data
        const userParam = urlParams.get('user');
        const redirectUrl = userParam ? `/reservations?user=${encodeURIComponent(userParam)}` : '/reservations';

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(bookingData),
            success: function(response) {
                if (response.success) {
                    alert(isModification ? 'Reservation updated successfully!' : 'Booking confirmed successfully!');
                    $('#cartModal').modal('hide');
                    window.location.href = redirectUrl;
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ AJAX Error:', xhr.responseText);
                let errorMessage = `Error ${isModification ? 'updating' : 'submitting'} booking`;
                
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.error || errorMessage;
                } catch (e) {
                    errorMessage = xhr.responseText || error;
                }
                
                alert(errorMessage);
            }
        });
    });
});
