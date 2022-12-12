const indexedDB = window.indexedDB;

const DataBase = {
	create(userId){
		const dbName = `user_${userId}`;
		const that = this;
		return new Promise((resolve, reject) => {
			this.request = indexedDB.open(dbName, 1);
			this.request.onerror = function(event){
				reject(event);
			};
			this.request.onsuccess = function(event){
				const db = event.target.result;
				that.db = db;
				console.log("user db init success");
				resolve(db);
			};
			this.request.onupgradeneeded = function(event){
				const db = event.target.result;
				console.log("db on upgradeneeded", db);
				if(!db.objectStoreNames.contains("orgs")){
					const orgStore = db.createObjectStore("orgs", { keyPath: "id" });
					orgStore.createIndex("id", "id", { unique: true });
					orgStore.createIndex("name", "name", { unique: false });
					orgStore.createIndex("parentId", "parentId", { unique: false });
				}

				if(!db.objectStoreNames.contains("users")){
					const userStore = db.createObjectStore("users", { keyPath: "id" });
					userStore.createIndex("id", "id", { unique: true });
					userStore.createIndex("userName", "userName", { unique: false });
				}
			};
		});
	},
	addData(storeName, data){
		var transaction = this.db.transaction([storeName], "readwrite");
		var orgStore = transaction.objectStore(storeName);
		// 在所有数据添加完毕后的处理
		transaction.oncomplete = function(event){
			console.log("data add done");
		};

		transaction.onerror = function(event){
			// 不要忘记错误处理！
		};

		data.forEach(function(item){
			var request = orgStore.add(item);
			request.onsuccess = function(event){
				// event.target.result === customer.ssn;
			};
		});
	},
	searchData(storeName, indexName, indexValue){
		return new Promise((resovle, reject) => {
			if(!this.db){
				resovle([]);
				return;
			}
			const result = [];
			const store = this.db.transaction(storeName, "readonly").objectStore(storeName);
			const request = store.index(indexName).openCursor(IDBKeyRange.only(indexValue));
			request.onsuccess = function(e){
				const cursor = e.target.result;
				if(cursor){
					result.push(cursor.value);
					cursor.continue();
				}
				else{
					resovle(result);
				}
			};
			request.onerror = function(e){
				reject(e);
			};
		});
	},
	deleteUserDB(dbName){
		const requestOrg = indexedDB.deleteDatabase("orgs");
		const requestUser = indexedDB.deleteDatabase("users");
	}
};

export default DataBase;
