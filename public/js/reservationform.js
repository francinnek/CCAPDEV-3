$(document).ready(function() {
    let selectedSeat = '';
    let mealOption = 'Standard';
    const mealDropdownToggle = $('#reservationForm .dropdown-toggle');
    const urlParams = new URLSearchParams(window.location.search);
    
    const isModification = $('#reservationForm').data('booking-id') !== undefined;
    const bookingId = $('#reservationForm').data('booking-id');
    
    let flightPrice, origin, destination, airline, departure, arrival;
    
    if (isModification && window.flightData) {
        // ✅ Use data injected by Handlebars
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
        setTimeout(() => {
            $('.grid-square.hover-effect').each(function() {
                const row = $(this).closest('.row').find('.seatAisle').text().trim();
                const col = $(this).parent().children().index(this);
                const letters = ['A', 'B', 'C', '', 'D', 'E', 'F'];
                const seat = letters[col] + row;
                if (seat === selectedSeat) $(this).addClass('selected');
            });
        }, 100);
    } else {
        // New booking via URL params
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
        selectedSeat = letters[col] + row;
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
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if ((!isModification && (!name || !email || !passportId)) || !selectedSeat) {
            alert('Please fill in all required fields and select a seat.');
            return;
        }

        if (!isModification && !emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const baggagePrice = extraBaggage * 60;
        const totalPrice = flightPrice + baggagePrice;
        const summaryText = `
            <strong>Passenger Information:</strong><br>
            Name: ${name}<br>
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
            Extra Baggage: ${extraBaggage} ($${baggagePrice})<br>
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
        
        const baggagePrice = extraBaggage * 60;
        const totalPrice = flightPrice + baggagePrice;

        // Get username from URL params
        const username = urlParams.get('user') || '';

        const bookingData = {
            username: username,
            name,
            email,
            passportId,
            selectedSeat,
            mealOption,
            extraBaggage,
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
