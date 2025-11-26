
(function(){
  function safeVal(v){ return (v || '').toString().trim(); }

  function init(){
    if (typeof window.jQuery === 'undefined') {
      console.warn('availableFlights.js: jQuery not found, delaying init');
      return;
    }

    $(document).ready(function(){
      console.log('🛫 availableFlights script loaded');

      const urlParams = new URLSearchParams(window.location.search);
      const searchOrigin = safeVal(urlParams.get('origin'));
      const searchDestination = safeVal(urlParams.get('destination'));
      const searchDate = safeVal(urlParams.get('departure'));
      const passengers = safeVal(urlParams.get('passengers'));

      console.log('🔎 URL search params:', { origin: searchOrigin, destination: searchDestination, departure: searchDate, passengers });

      
      $('.flight-card').each(function(i){
        const cardOrigin = safeVal($(this).data('origin'));
        const cardDestination = safeVal($(this).data('destination'));
        console.log(`✈️ card[${i}] origin='${cardOrigin}' destination='${cardDestination}'`);
      });

      if (searchOrigin && searchDestination) {
        $('#page-text').html(`<br><br>Available flights from ${searchOrigin} to ${searchDestination}`);

        $('.flight-card').each(function() {
          const cardOrigin = safeVal($(this).data('origin'));
          const cardDestination = safeVal($(this).data('destination'));

          const originMatch = cardOrigin.toLowerCase().includes(searchOrigin.toLowerCase());
          const destMatch = cardDestination.toLowerCase().includes(searchDestination.toLowerCase());

          
          const originExact = cardOrigin.toLowerCase() === searchOrigin.toLowerCase();
          const destExact = cardDestination.toLowerCase() === searchDestination.toLowerCase();

          const shouldShow = (originMatch || originExact) && (destMatch || destExact);

          $(this).toggle(shouldShow);
        });
      }

      if ($('.flight-card:visible').length === 0) {
        $('.flights-container').prepend(`
          <div class="alert alert-info" role="alert">
            No flights found for your search criteria. Please try different dates or destinations.
          </div>
        `);
      }

      
      $(document).on('click', '.book-now', function(e) {
        e.preventDefault();

        const button = $(this);
        const card = button.closest('.flight-card');
        const originAttr = button.attr('data-origin') || card.data('origin') || '';
        const destinationAttr = button.attr('data-destination') || card.data('destination') || '';
        const airlineAttr = button.attr('data-airline') || card.find('.flight-details').text().trim() || '';
        const flightNumberAttr = button.attr('data-flight-number') || '';
        const departureAttr = button.attr('data-departure') || card.find('.flight-info p').first().text().replace('Departure: ', '').trim() || '';
        const arrivalAttr = button.attr('data-arrival') || card.find('.flight-info p').last().text().replace('Arrival: ', '').trim() || '';
        const priceAttr = button.attr('data-price') || card.find('.flight-price').text().replace('$', '').trim() || '';

        const params = new URLSearchParams({
          origin: originAttr,
          destination: destinationAttr,
          airline: airlineAttr,
          flightNumber: flightNumberAttr,
          flightDeparture: departureAttr,
          flightArrival: arrivalAttr,
          price: priceAttr
        });

        // Collects the unique identifier for the specific flight selected.
        const flightIdAttr = button.attr('data-flight-id') || card.data('flight-id') || '';
        // Passes the unique flight ID via parameter to the reservation form
        // The reservation form will then use this ID to identify the seat
        // and perform the server-side seat availability check when submitting
        if (flightIdAttr) params.set('flightId', flightIdAttr);

        // Get username from page data attribute
        const username = $('.flights-container').data('username');
        if (username) {
          params.set('user', username);
        }
        if (searchDate) {
          params.set('searchDeparture', searchDate);
        }
        if (passengers) {
          params.set('passengers', passengers);
        }

        window.location.href = `/form?${params.toString()}`;
      });
    });
  }

  if (typeof window.jQuery !== 'undefined') {
    init();
  } else {
    const i = setInterval(function(){
      if (typeof window.jQuery !== 'undefined') { clearInterval(i); init(); }
    }, 50);
  }
})();
