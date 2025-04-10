import { Account } from "../../../shared/models/Account.js";
import { Database } from "./Database.js";

// test Database class
// node .\src\db\database.test.js
(async () => {

    const db = new Database();

    let conn;
    try {
        conn = await db.connect();
        const res = await db.query("SELECT username from account");
        console.log('query:', res);

        // duplicate error.code: 'ER_DUP_ENTRY', when run again
        const addAccount = await db.account.add(new Account({
            username: 'john_doe',
            password: 'password123',
            email: 'johndoe@example.com',
            last_ip: '127.0.0.1',
        }));
        console.log('add account:', addAccount)

        const account = await db.account.login('john_doe', 'password123');
        console.log('account login:', account)

    } catch (err) {
        console.log(err);
    } finally {
        if (conn) conn.end();
    }

    db.close();

})();
