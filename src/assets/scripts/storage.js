window.indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;

// referencias de algun objeto window.IDB*:
window.IDBTransaction =
  window.IDBTransaction ||
  window.webkitIDBTransaction ||
  window.msIDBTransaction;
window.IDBKeyRange =
  window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  // window.alert('This browser doesn\'t support IndexedDB');
  console.log("This browser doesn't support IndexedDB");
}

const dbName = "countries";

var db;

var request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
  // Handler error.
  console.log("Database error: " + event.target.errorCode);
};

request.onsuccess = function (event) {
  db = request.result;
  console.log("Success Database");
};

request.onupgradeneeded = function (event) {
  var db = event.target.result;
  var objectStore = db.createObjectStore("countries");
  let oldVersion = event.oldVersion;
  let newVersion = event.newVersion || db.version;
  console.log("DB updated from version", oldVersion, "to", newVersion);

  console.log("upgrade", db);
  if (!db.objectStoreNames.contains("countries")) {
    objectStore = db.createObjectStore("countries", {
      keyPath: "id",
    });
  }
};
