let transactions = [];
let myChart;

fetch("/api/transactions")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  });
}
