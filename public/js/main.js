// can you turn the app folder, which contains my frontend of the Online Airline Ticketing System, into a full on CRUD with MVC organization?

// Handle login/register navigation
document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            window.location.href = '/register';
        });
    }
});

// Booking functionality
$(function(){
    // Show booking list when button is clicked
    $("#flightButo").click(function(){
        // Fetch bookings from the server
        fetch('/api/bookings')
            .then(response => response.json())
            .then(bookings => {
                let table = `
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                bookings.forEach(b => {
                    table += `
                        <tr>
                            <td>${b.id}</td>
                            <td>${b.from}</td>
                            <td>${b.to}</td>
                            <td><button class="btn btn-primary view-details" data-id="${b.id}">View Details</button></td>
                        </tr>`;
                });
                table += `</tbody></table>`;
                $("#booking-list").html(table);
                $("#booking-details").hide();
                $("#booking-list").show();

                new bootstrap.Modal(document.getElementById('flightModal')).show();
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
                alert('Error loading bookings. Please try again.');
            });
    });

    // Handle View Details click
    $(document).on("click", ".view-details", function(){
        const id = $(this).data("id");
        
        // Fetch booking details from the server
        fetch(`/api/bookings/${id}`)
            .then(response => response.json())
            .then(booking => {
                $("#details-content").html(`
                    <div class="card p-3">
                        <h5>Reservation #${booking.id}</h5>
                        <p><strong>Passenger:</strong> ${booking.name}</p>
                        <p><strong>Flight Number:</strong> ${booking.flight}</p>
                        <p><strong>Route:</strong> ${booking.from} → ${booking.to}</p>
                        <p><strong>Date:</strong> ${booking.date}</p>
                        <p><strong>Seat:</strong> ${booking.seat}</p>
                        <p><strong>Gate:</strong> ${booking.gate}</p>
                        <p><strong>Boarding Time:</strong> ${booking.time}</p>
                    </div>
                `);

                $("#booking-list").hide();
                $("#booking-details").show();
            })
            .catch(error => {
                console.error('Error fetching booking details:', error);
                alert('Error loading booking details. Please try again.');
            });
    });

    // Go back to list
    $("#backToList").click(function(){
        $("#booking-details").hide();
        $("#booking-list").show();
    });
});
