$(document).ready(function() {
    let selectedSeat = '';
    let selectedMeal = 'Standard';
    const urlParams = new URLSearchParams(window.location.search);
    const flightPrice = parseInt(urlParams.get('price')) || 40;
    const origin = urlParams.get('origin');
    const destination = urlParams.get('destination');
    const airline = urlParams.get('airline');
    const departure = urlParams.get('flightDeparture');
    const arrival = urlParams.get('flightArrival');
    
    $('.dropdown-item').click(function(e) {
        e.preventDefault();
        selectedMeal = $(this).data('value');
        $('.dropdown-toggle').text(selectedMeal);
    });

    $('.grid-square.hover-effect').click(function() {
        $('.grid-square.hover-effect').removeClass('selected');
        $(this).addClass('selected');
        
        const row = $(this).closest('.row').find('.seatAisle').text().trim();
        const col = $(this).parent().children().index(this);
        const letters = ['A', 'B', 'C', '', 'D', 'E', 'F'];
        selectedSeat = letters[col] + row;
    });

    $('<style>')
        .text('.selected { background-color: #198754 !important; color: white; }')
        .appendTo('head');

    $('.submit-btn').click(function(e) {
        e.preventDefault();
        const name = $('#name').val();
        const email = $('#email').val();
        const passportId = $('#passportId').val();
        const extraBaggage = parseInt($('#extraBaggage').val()) || 0;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!name || !email || !passportId || !selectedSeat) {
            alert('Please fill in all required fields and select a seat.');
            return;
        }

        if (!emailRegex.test(email)) {
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
            Meal Option: ${selectedMeal}<br>
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
});