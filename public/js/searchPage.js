
(function(){
  
  function init() {
    if (typeof window.jQuery === 'undefined') {
      console.warn('searchPage.js: jQuery not found, delaying initialization');
      return;
    }

    $(document).ready(function(){
      console.log('🔍 Search page loaded (external script)');
      console.log('📦 Logo container HTML:', $('.logo-container').html());
      const usernameFromAttr = $('.logo-container').data('username');
      console.log('👤 Username from data attribute:', usernameFromAttr);

      // Load available origins and destinations
      function loadAirportOptions() {
        console.log('📍 Loading airport options...');
        fetch('/flights/origins-destinations')
          .then(response => {
            console.log('📍 Response status:', response.status);
            return response.json();
          })
          .then(data => {
            console.log('📍 Loaded origins:', data.origins);
            console.log('📍 Loaded destinations:', data.destinations);

            // Populate origin datalist
            const originList = $('#originList');
            originList.empty();
            data.origins.forEach(origin => {
              originList.append(`<option value="${origin}">`);
            });

            // Populate destination datalist
            const destinationList = $('#destinationList');
            destinationList.empty();
            data.destinations.forEach(destination => {
              destinationList.append(`<option value="${destination}">`);
            });
          })
          .catch(error => console.error('❌ Error loading airport options:', error));
      }

      // Load on page load
      loadAirportOptions();

      $("#flightForm").on("submit", function(event){
        event.preventDefault();
        console.log('✈️ Flight form submitted');
        
        const origin = $("#origin").val();
        const destination = $("#destination").val();
        const departure = $("#departure").val();
        const returnDate = $("#return").val();
        const passengers = $("#passengers").val();
        
        console.log('📋 Form data:', { origin, destination, departure, returnDate, passengers });
        
        // ✅ CLIENT-SIDE VALIDATION
        const validationErrors = [];

        // Validate origin airport code
        const originValidation = ClientValidation.validateAirportCode(origin);
        if (!originValidation.isValid) validationErrors.push('Origin: ' + originValidation.error);

        // Validate destination airport code
        const destinationValidation = ClientValidation.validateAirportCode(destination);
        if (!destinationValidation.isValid) validationErrors.push('Destination: ' + destinationValidation.error);

        // Check they're different
        if (originValidation.isValid && destinationValidation.isValid &&
            originValidation.sanitized === destinationValidation.sanitized) {
          validationErrors.push('Origin and destination must be different');
        }

        // Validate departure date
        const departureValidation = ClientValidation.validateDate(departure);
        if (!departureValidation.isValid) validationErrors.push('Departure: ' + departureValidation.error);

        // Validate return date (if provided)
        if (returnDate) {
          const returnValidation = ClientValidation.validateDate(returnDate);
          if (!returnValidation.isValid) validationErrors.push('Return: ' + returnValidation.error);
        }

        // Validate passengers
        if (!passengers || isNaN(passengers) || passengers < 1 || passengers > 9) {
          validationErrors.push('Number of passengers must be between 1 and 9');
        }

        if (validationErrors.length > 0) {
          console.log('❌ Validation errors:', validationErrors);
          $("#result").text("Please fix: " + validationErrors.join(", "));
          return;
        }
        
        try {
          const searchParams = new URLSearchParams({
            origin: originValidation.sanitized,
            destination: destinationValidation.sanitized,
            departure: departure,
            return: returnDate,
            passengers: passengers
          });

          const username = $('.logo-container').data('username');
          console.log('👤 Username from data attribute:', username);
          
          if (username) {
            searchParams.set('user', username);
          }

          const redirectUrl = `/flights/avail?${searchParams.toString()}`;
          console.log('🔗 Redirecting to:', redirectUrl);
          
          if (redirectUrl.length > 2000) {
            console.error('❌ URL too long');
            $("#result").text("Search parameters too long");
            return;
          }
          
          console.log('✅ Navigating to:', redirectUrl);
          window.location.href = redirectUrl;
        } catch (error) {
          console.error('❌ Error:', error);
          $("#result").text("Error processing search");
        }
      });
    });
  }

 
  if (typeof window.jQuery !== 'undefined') {
    init();
  } else {
   
    const interval = setInterval(function(){
      if (typeof window.jQuery !== 'undefined') {
        clearInterval(interval);
        init();
      }
    }, 50);
  }
})();
