let db;
let budgetVersion;

// Create New dB request
const request = indexedDB.open("BudgetDB", budgetVersion || 21);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.newVersion;

  console.log(`DB updated from ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Ya messed up! ${e.target.errorCode}`);
};

function checkDataBase() {
  console.log("Check DB invoked");

  // Open transaction on BudgetStore DB
  let transaction = db.transaction(["BudgetStore"], "readwrite");

  // Access BudgetStore Object
  const store = transaction.objectStore("BudgetStore");

  // Get All Records from Store And To Set A Variable
  const getAll = store.getAll();

  // If Request Was Successful
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["BudgetStore"], "readwrite");

            const currentStore = transaction.objectStore("BudgetStore");

            currentStore.clear();
            console.log("Clearing store!");
          }
        })
        .catch((err) => {
          res.json(err);
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;

  if (navigator.onLine) {
    console.log("Backend online!");
    checkDataBase();
  }
};

const saveRecord = (record) => {
  console.log("Save record invoked");
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  const store = transaction.objectStore("BudgetStore");

  store.add(record);
};

window.addEventListener("online", checkDataBase);
