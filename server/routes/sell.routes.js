module.exports = (app, db) => {


    // get incomplete invoices
    app.get('/getIncompleteInvoices', async (req, res) => {
        let query = `SELECT I.invoice_ID, I.invoice_type, TIME(I.invoice_datetime) AS invoice_time, I.total_cost, I.total_price, C.customer_name AS customer_name, U.owner AS user, 
        JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'item_description', S.item_description, 'qty', M.qty, 'currency', M.currency, 'exchange_rate', M.exchange_rate, 'euro_rate', M.euro_rate, 'unit_cost', M.unit_cost, 'original_price', M.original_price, 'unit_price', M.unit_price)) invoice_map FROM invoice AS I
        INNER JOIN invoice_map AS M ON I.invoice_ID = M.invoice_ID_FK
        INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
        INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
        LEFT JOIN customers AS C ON I.customer_ID_FK = C.customer_ID
        WHERE invoice_isCompleted = 0
        AND invoice_status = 1
        GROUP BY I.invoice_ID
        ORDER BY invoice_time DESC`
        try {
            let [results] = await db.query(query);
            res.send(results);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.post('/getBarcode', async (req, res) => {
        let barcode = req.body.data;
        try {
            let [
                [result]
            ] = await db.query(`SELECT * FROM stock WHERE barcode = ? AND item_status = 1`, barcode);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    // checkout
    app.post('/checkout', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            let invoice = req.body.invoice;
            invoice.invoice_isCompleted = true;
            let items = req.body.items;
            const [result] = await connection.query(`INSERT INTO invoice SET ?`, [invoice]);
            let invoice_ID = result.insertId;
            let invoice_map = Array.from(items).map(function (item) {
                return [invoice_ID, item.item_ID, invoice.invoice_type, item.qty, item.currency, item.exchange_rate, item.euro_rate, item.unit_cost, item.original_cost, item.original_price, item.unit_price]
            });

            await connection.query(`INSERT INTO invoice_map (invoice_ID_FK, item_ID_FK, record_type, qty, currency, exchange_rate, euro_rate, unit_cost, original_cost, original_price, unit_price) VALUES ?`, [invoice_map]);

            await connection.commit();
            connection.release();
            res.send('');

        } catch (error) {
            await connection.rollback();
            connection.release()
            res.status(500).send(error);
        }
    })

    // checkout with customer
    app.post('/checkoutDebt', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let invoice = req.body.invoice;
            let items = req.body.items;
            let orderQuery = `INSERT INTO invoice SET ?`;
            let [result] = await connection.query(orderQuery, invoice);
            
            let invoice_ID = result.insertId;
            let invoice_map = Array.from(items).map(function (item) {
                return [invoice_ID, item.item_ID, invoice.customer_ID_FK, invoice.invoice_type, item.qty, item.currency, item.exchange_rate, item.euro_rate, item.unit_cost, item.unit_price, item.original_cost, item.original_price]
            });
            let mapQuery = `INSERT INTO invoice_map (invoice_ID_FK, item_ID_FK, customer_ID_FK, record_type, qty, currency, exchange_rate, euro_rate, unit_cost, unit_price, original_cost, original_price) VALUES ?`;
            await connection.query(mapQuery, [invoice_map]);

            let totalDebts = items.reduce((memo, item) => {
                return {
                    totalLira: item.currency == 'lira' ? memo.totalLira + (item.qty * item.original_price) : memo.totalLira,
                    totalDollar: item.currency == 'dollar' ? memo.totalDollar + (item.qty * item.original_price) : memo.totalDollar,
                    totalEuro: item.currency == 'euro' ? memo.totalEuro + (item.qty * item.original_price) : memo.totalEuro
                }
            }, {
                totalLira: 0,
                totalDollar: 0,
                totalEuro: 0
            });
            let customer_ID = invoice.customer_ID_FK;
            let debtQuery = `UPDATE customers SET dollar_debt = (dollar_debt + ${totalDebts.totalDollar}), lira_debt = (lira_debt + ${totalDebts.totalLira}), euro_debt = (euro_debt + ${totalDebts.totalEuro}) WHERE customer_ID = ?`;
            await connection.query(debtQuery, customer_ID);

            await connection.commit();
            connection.release();
            res.send(`${result.insertId}`);
        } catch (error) {
            console.log(error);
            await connection.rollback();
            connection.release()
            res.status(500).send(error);
        }
    })



    app.post('/checkoutCustomer', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let invoice = req.body.invoice;
            let items = req.body.items;

            let orderQuery = `INSERT INTO invoice SET ?`;
            let [result] = await connection.query(orderQuery, invoice);
            
            let invoice_ID = result.insertId;
            let invoice_map = Array.from(items).map(function (item) {
                return [invoice_ID, item.item_ID, invoice.customer_ID_FK, invoice.invoice_type, item.qty, item.currency, item.exchange_rate, item.euro_rate, item.unit_cost, item.original_price, item.unit_price]
            });
            let mapQuery = `INSERT INTO invoice_map (invoice_ID_FK, customer_ID_FK, item_ID_FK, record_type, qty, currency, exchange_rate, euro_rate, unit_cost, original_price, unit_price) VALUES ?`;
            await connection.query(mapQuery, [invoice_map]);

            await connection.commit();
            connection.release();
            res.send('');

        } catch (error) {
            await connection.rollback();
            connection.release()
            res.status(500).send(error);
        }
    })


}