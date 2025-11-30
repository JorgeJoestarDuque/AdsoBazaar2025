// Gráfico de barras
const barCtx = document.getElementById('barChart').getContext('2d');
new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
    datasets: [{
      label: 'Cantidad',
      data: [12, 19, 7, 14],
      backgroundColor: ['#a30000', '#c94f4f', '#e57373', '#ff9999']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  }
});

// Gráfico circular
const pieCtx = document.getElementById('pieChart').getContext('2d');
new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: ['Categoría 1', 'Categoría 2', 'Categoría 3'],
    datasets: [{
      data: [45, 25, 30],
      backgroundColor: ['#a30000', '#c94f4f', '#ff9999']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }
});
