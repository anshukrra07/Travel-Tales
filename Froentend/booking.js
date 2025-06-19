function openBookingPopup() {
  const placeName = document.getElementById("place-name").textContent;
  document.getElementById("popup-place-name").textContent = placeName;
  
  // Encode the destination for URLs
  const encodedPlace = encodeURIComponent(placeName);
  

  function generateMMTLink(cityName, checkinDate, checkoutDate) {
  const formattedCheckin = formatDate(checkinDate, 'DDMMYYYY');
  const formattedCheckout = formatDate(checkoutDate, 'DDMMYYYY');
  
  return `https://www.makemytrip.com/hotels/hotels-in-${cityName.toLowerCase().replace(/\s+/g, '-')}/?checkin=${formattedCheckin}&checkout=${formattedCheckout}&city=${encodeURIComponent(cityName)}&country=ANY&searchText=${encodeURIComponent(cityName)}`;
}


  // Set flight booking links
  document.getElementById("flight-mmt").href = `https://www.makemytrip.com/flights/`;
  document.getElementById("flight-cleartrip").href = `https://www.goindigo.in`;
  document.getElementById("flight-yatra").href = `https://www.yatra.com`;
  
  // Set hotel booking links         https://www.makemytrip.com/hotels/hotel-listing/?checkin=06172025&checkout=06182025&locusId=CTTOKY&locusType=city&city=CTTOKY&country=JAP&searchText=Tokyo&roomStayQualifier=2e0e&_uCurrency=INR&reference=hotel&type=city&rsc=1e2e0e
  document.getElementById("hotel-bcom").href = `https://www.booking.com/searchresults.html?ss=${encodedPlace}`;
  document.getElementById("hotel-mmt").href = `https://www.makemytrip.com/hotels/`;
  document.getElementById("hotel-oyo").href = `https://www.oyorooms.com`;
  
  // Set train booking links (using Delhi as default origin)
  document.getElementById("train-irctc").href = `https://www.irctc.co.in/`;
  document.getElementById("train-mmttrain").href = `https://www.makemytrip.com/railways/`;
  
  // Set bus booking links (using Delhi as default origin)
  document.getElementById("bus-redbus").href = `https://www.redbus.in`;
  document.getElementById("bus-zoomcar").href = `https://www.zoomcar.com`;
  
  // Show modal and set default tab
  document.getElementById("booking-popup").style.display = "block";
  switchTab('flights');
}

function closeBookingPopup() {
  document.getElementById("booking-popup").style.display = "none";
}

function switchTab(tabName) {
  // Update active tab button
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
  
  // Update active tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active-tab');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active-tab');
}