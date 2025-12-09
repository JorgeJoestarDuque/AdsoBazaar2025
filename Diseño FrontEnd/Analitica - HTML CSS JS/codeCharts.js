// Analytics charts backed by API data
// Expects canvas elements with ids `barChart` and `pieChart` in the page.
// Also expects filters: filterFechas, filterProducto, filterCategoria, refreshAnalytics (button).

const API_BASE = 'http://localhost:10000/api';

let productsCache = [];
let lotesCache = [];
let barChart, pieChart;

function setupEventListeners() {
  // Attach change listeners to filter selects
  const filterProducto = document.getElementById('filterProducto');
  const filterLote = document.getElementById('filterLote');
  const filterCategoria = document.getElementById('filterCategoria');
  const refreshBtn = document.getElementById('refreshAnalytics');

  if (filterProducto) filterProducto.addEventListener('change', applyFilter);
  if (filterLote) filterLote.addEventListener('change', applyFilter);
  if (filterCategoria) filterCategoria.addEventListener('change', applyFilter);
  if (refreshBtn) refreshBtn.addEventListener('click', loadAndRender);
}

async function fetchProductos() {
  try {
    const res = await fetch(`${API_BASE}/producto`);
    if (!res.ok) throw new Error('Error fetching productos: ' + res.status);
    const data = await res.json();
    // normalize: ensure cantidad is number
    return (data || []).map(p => ({ ...p, cantidad: Number(p.cantidad || p.cant || 0) }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchLotes() {
  try {
    const res = await fetch(`${API_BASE}/lote`);
    if (!res.ok) throw new Error('Error fetching lotes: ' + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function buildCharts() {
  const barCtxEl = document.getElementById('barChart');
  const pieCtxEl = document.getElementById('pieChart');
  if (!barCtxEl || !pieCtxEl) {
    console.warn('Chart canvases not found (ids: barChart, pieChart).');
    return;
  }

  const barCtx = barCtxEl.getContext('2d');
  const pieCtx = pieCtxEl.getContext('2d');

  barChart = new Chart(barCtx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Cantidad', data: [], backgroundColor: [] }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

function getColorPalette(n) {
  const palette = ['#a30000', '#c94f4f', '#e57373', '#ff9999', '#b34d00', '#f1a07a', '#d63031', '#8e44ad'];
  const out = [];
  for (let i = 0; i < n; i++) out.push(palette[i % palette.length]);
  return out;
}

function renderCharts(filteredProducts) {
  if (!barChart || !pieChart) return;

  const labels = filteredProducts.map(p => p.nombre || `Producto ${p.idProducto || ''}`);
  const data = filteredProducts.map(p => Number(p.cantidad || 0));
  const colors = getColorPalette(labels.length);

  // Update bar
  barChart.data.labels = labels;
  barChart.data.datasets[0].data = data;
  barChart.data.datasets[0].backgroundColor = colors;
  barChart.update();

  // Update pie (show top 8 or all)
  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = data;
  pieChart.data.datasets[0].backgroundColor = colors;
  pieChart.update();
}

function applyFilter() {
  const filterProducto = document.getElementById('filterProducto');
  const filterLote = document.getElementById('filterLote');
  const filterCategoria = document.getElementById('filterCategoria');

  const productoVal = filterProducto ? filterProducto.value : 'all';
  const loteVal = filterLote ? filterLote.value : 'all';
  const categoriaVal = filterCategoria ? filterCategoria.value : 'all';

  const filtered = productsCache.filter(p => {
    if (productoVal !== 'all' && String(p.idProducto) !== String(productoVal)) return false;
    if (loteVal !== 'all' && String(p.Id_Lote) !== String(loteVal)) return false;
    if (categoriaVal !== 'all' && String(p.Tipo) !== String(categoriaVal)) return false;
    return true;
  });

  renderCharts(filtered);
  renderTable(filtered);
}

function renderTable(filteredProducts) {
  const tbody = document.getElementById('tablebody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  filteredProducts.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.nombre || 'N/A'}</td>
      <td>${p.cantidad || 0}</td>
      <td>${p.Id_Lote || 'N/A'}</td>
      <td>${'$ ' + (p.precioVenta || '0')}</td>
    `;
    tbody.appendChild(row);
  });
}

async function populateFilters() {
  lotesCache = await fetchLotes();
  productsCache = await fetchProductos();

  // Populate filterProducto with unique product ids
  const filterProducto = document.getElementById('filterProducto');
  if (filterProducto) {
    filterProducto.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());
    const ids = Array.from(new Set(productsCache.map(p => p.idProducto).filter(x => x != null && x !== '')));
    ids.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.text = `Producto ${id}`;
      filterProducto.appendChild(opt);
    });
  }

  // Populate filterLote with unique lote ids
  const filterLote = document.getElementById('filterLote');
  if (filterLote) {
    filterLote.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());
    const ids = Array.from(new Set(productsCache.map(p => p.Id_Lote).filter(x => x != null && x !== '')));
    ids.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.text = `Lote ${id}`;
      filterLote.appendChild(opt);
    });
  }

  // Populate filterCategoria with unique Tipo (category)
  const filterCategoria = document.getElementById('filterCategoria');
  if (filterCategoria) {
    filterCategoria.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());
    const tipos = Array.from(new Set(productsCache.map(p => p.Tipo).filter(x => x != null && x !== '')));
    tipos.forEach(tipo => {
      const opt = document.createElement('option');
      opt.value = tipo;
      opt.text = `Tipo: ${tipo}`;
      filterCategoria.appendChild(opt);
    });
  }
}

async function loadAndRender() {
  // load fresh data and render
  productsCache = await fetchProductos();
  await populateFilters();
  applyFilter();
}

// init
buildCharts();
setupEventListeners();
loadAndRender();

