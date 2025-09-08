let cars = [];
let currentMetric = 'power_kw';
let selectedCar = null;

// Load car data
fetch('cars.json')
  .then(response => response.json())
  .then(data => {
    cars = data;
    populateYears();
  });

// Populate year dropdown
function populateYears() {
  const years = [...new Set(cars.map(c => c.year))].sort((a, b) => b - a);
  const yearSelect = document.getElementById('year-select');
  yearSelect.innerHTML = '<option value="">Select Year</option>';
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
  yearSelect.disabled = false;
}

// Event: Year selected → populate brands
document.getElementById('year-select').addEventListener('change', function () {
  const year = this.value;
  if (!year) {
    document.getElementById('brand-select').disabled = true;
    document.getElementById('model-select').disabled = true;
    return;
  }

  const brands = [...new Set(cars.filter(c => c.year == year).map(c => c.brand))].sort();
  const brandSelect = document.getElementById('brand-select');
  brandSelect.innerHTML = '<option value="">Select Brand</option>';
  brands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
  brandSelect.disabled = false;
  document.getElementById('model-select').disabled = true;
});

// Event: Brand selected → populate models
document.getElementById('brand-select').addEventListener('change', function () {
  const year = document.getElementById('year-select').value;
  const brand = this.value;
  if (!brand) {
    document.getElementById('model-select').disabled = true;
    return;
  }

  const models = cars
    .filter(c => c.year == year && c.brand == brand)
    .map(c => c.model)
    .sort();

  const modelSelect = document.getElementById('model-select');
  modelSelect.innerHTML = '<option value="">Select Model</option>';
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
  modelSelect.disabled = false;
});

// Event: Model selected → show car & comparisons
document.getElementById('model-select').addEventListener('change', function () {
  const year = document.getElementById('year-select').value;
  const brand = document.getElementById('brand-select').value;
  const model = this.value;

  if (!model) return;

  selectedCar = cars.find(c => c.year == year && c.brand == brand && c.model == model);

  // Display selected car
  document.getElementById('car-name').textContent = `${selectedCar.year} ${selectedCar.brand} ${selectedCar.model}`;
  document.getElementById('power').textContent = selectedCar.power_kw;
  document.getElementById('torque').textContent = selectedCar.torque_nm;
  document.getElementById('selected-car').classList.remove('hidden');

  // Update comparisons
  updateComparison();
});

// Toggle metric
document.getElementById('toggle-kw').addEventListener('click', function () {
  setActiveMetric('power_kw', 'Power');
});

document.getElementById('toggle-nm').addEventListener('click', function () {
  setActiveMetric('torque_nm', 'Torque');
});

function setActiveMetric(metric, label) {
  currentMetric = metric;
  document.querySelectorAll('.toggle button').forEach(btn => btn.classList.remove('active'));
  if (metric === 'power_kw') {
    document.getElementById('toggle-kw').classList.add('active');
  } else {
    document.getElementById('toggle-nm').classList.add('active');
  }
  document.getElementById('metric-label').textContent = label;
  document.getElementById('metric-label-2').textContent = label;
  if (selectedCar) updateComparison();
}

// Update comparison boxes
function updateComparison() {
  const year = selectedCar.year;
  const value = selectedCar[currentMetric];

  const sameYearCars = cars.filter(c => c.year === year);

  let lowerCars = sameYearCars.filter(c => c[currentMetric] < value);
  let higherCars = sameYearCars.filter(c => c[currentMetric] > value);

  // Sort: strongest lower first, weakest higher first
  lowerCars.sort((a, b) => b[currentMetric] - a[currentMetric]);
  higherCars.sort((a, b) => a[currentMetric] - b[currentMetric]);

  // Render
  renderList('lower-list', lowerCars);
  renderList('higher-list', higherCars);
}

function renderList(elementId, carList) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = '';

  if (carList.length === 0) {
    const li = document.createElement('li');
    li.textContent = `No cars found.`;
    ul.appendChild(li);
    return;
  }

  carList.forEach(car => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${car.brand} ${car.model}</strong> — ${car[currentMetric]} ${currentMetric === 'power_kw' ? 'kW' : 'Nm'}`;
    ul.appendChild(li);
  });
}