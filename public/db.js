let db;
let budgetVersion;

// Create New dB request
const request = indexedDB.open("budgetDB", budgetVersion || 21);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.newVersion;

  console.log(`DB updated from ${oldVersion} to ${newVersion}`);

  db = e.target.result;
};
