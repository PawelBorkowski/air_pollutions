// import './bootstrap.css';
// import './style.css';

(function(){
  const apiKey = '2Cenl7GpErqiQiTBhjvIGOPcPCWF41rt';
  let lat = 50.062006;
  let lng = 19.940984;
  let notFound;
  let station;
  let values;

  function init(){
    const latInput = document.querySelector('#latInput');
    latInput.value = `${lat}`;
    latInput.addEventListener('change', (event) => lat = +event.target.value);
    const lngInput = document.querySelector('#lngInput');
    lngInput.value = `${lng}`;
    lngInput.addEventListener('change', (event) => lng = +event.target.value);
    const downloadButton = document.querySelector('#downloadButton');
    downloadButton.addEventListener('click', onButtonClick);
    const locationButton = document.querySelector('#locationButton');
    locationButton.addEventListener('click', getLocation);
  }

  function getLocation(){
    navigator.geolocation.getCurrentPosition(success, error);
  }

  function success(data){
    console.log(data);
  }

  function error(){
    console.log('No location');
  }

  function onButtonClick() {
    return getStation().then(data => {
      if(data[0]){
        notFound = false;
        station = data[0];
        getMeasurements().then(airData => {
          values = airData;
          updateDOM();
        });
      } else {
        notFound = true;
        station = null;
        values = null;
        updateDOM();
      }
    });
  }

  function getStation() {
    return fetch(`https://airapi.airly.eu/v2/installations/nearest?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey
      }
    })
    .then(data => data.json());
  }

  function getMeasurements() {
    return fetch(`https://airapi.airly.eu/v2/measurements/installation?installationId=${station.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey
      }
    })
    .then(airData => airData.json())
  }

  function updateDOM(){
    const errorPlaceholder = document.querySelector('#errorPlaceholder');
    const stationPlaceholder = document.querySelector('#station');
    const measurementsPlaceholder = document.querySelector('#measurements');
    if(notFound){
      errorPlaceholder.innerHTML = '<p class="text-danger">Station for this place was not found</p>';
      stationPlaceholder.innerHTML = '';
      measurementsPlaceholder.innerHTML = '';
    } else {
      errorPlaceholder.innerHTML = '';
      stationPlaceholder.innerHTML = `
        <div class="card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">${station.address.city}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${station.elevation} m n.p.m.</h6>
            <p class="card-text">Adres czujnika: ${station.address.street} ${station.address.number},
              ${station.address.city}, ${station.address.country}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" class="card-link" target=_blank>Mapa</a>
          </div>
        </div>
      `;
      measurementsPlaceholder.innerHTML = `
        <ul class="list-group">
          ${values.current.values.reduce((previousValue, currentValue, currentIndex, array) => {
            const row = `<li class="list-group-item d-flex justify-content-between align-items-center">
            ${currentValue.name}
            <span class="${getClass(currentValue.name)}">${currentValue.value}</span>
          </li>`;
            return previousValue + row;
          }, '')}
          
        </ul>
      `;
    }
  }

  function getClass(name) {
    let color = 'badge-primary';
    const standard = values.current.standards.find(standard => standard.pollutant === name);
    if (standard) {
      if (standard.percent >= 100) {
        color = 'badge-danger';
      } else if (standard.percent >= 50) {
        color = 'badge-warning';
      } else {
        color = 'badge-success';
      }
    }
    return 'badge badge-pill ' + color;
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();