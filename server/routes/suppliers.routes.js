module.exports = (app, db) => {

    // get suppliers
    app.get('/getSuppliers', async (req, res) => {
        let query = `SELECT * FROM suppliers WHERE supplier_status = 1`;
        try {
            let [results] = await db.query(query);
            res.send(results);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // // add new supplier
    app.post('/addSupplier', async (req, res) => {
        let data = req.body;
        let query = `INSERT INTO suppliers SET ?`;
        try {
            let [supplier] = await db.query(query, data);
            let [[result]] = await db.query(`SELECT * FROM suppliers WHERE supplier_ID = ${supplier.insertId}`);
            res.send(result)
        } catch (error) {
            res.status(500).send(error);
        }
    })

    // // update supplier data
    app.post('/updateSupplier', async (req, res) => {
        let data = req.body;
        let query = `UPDATE suppliers SET ? WHERE supplier_ID = ?`;
        try {
            await db.query(query, [data, data.supplier_ID]);
            let [[result]] = await db.query(`SELECT * FROM suppliers WHERE supplier_ID = ${data.supplier_ID}`)
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    // // delete supplier
    app.post('/deleteSupplier', async (req, res) => {
        let data = req.body;
        let query = `UPDATE suppliers SET supplier_status = 0 WHERE supplier_ID = ?`;
        try {
            await db.query(query, data.supplier_ID);
            res.send('deleted')
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.get('/getSupplierHistory/:id', async (req, res) => {
        let id = req.params.id;
        let query = `SELECT
        I.invoice_type AS type,
        I.record_ID,
        DATE(invoice_datetime) AS date,
        TIME(invoice_datetime) AS time,
        I.total_cost AS value,
        I.total_cost AS actual_value,
        'dollar' AS currency,
        JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'item_description', S.item_description, 'qty', 	M.qty, 'currency', M.currency, 'item_cost', M.item_cost))
        invoice_map

        FROM supply_invoice AS I
        INNER JOIN supply_invoice_map AS M ON I.record_ID = M.invoice_ID_FK
        INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
        INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
        WHERE I.supplier_ID_FK = ?        
        GROUP BY I.record_ID

        UNION
         
        SELECT
        'Payment',
        P.payment_ID,
        DATE(P.payment_datetime),
        TIME(P.payment_datetime),
        P.payment_value,
        P.actual_payment_value,
        P.payment_account,
        P.payment_currency

        FROM suppliers_payments P
        WHERE P.supplier_ID_FK = ?

        ORDER BY date DESC, time DESC`;

        try {
            let [results] = await db.query(query, [id, id]);
            res.send(results);
        } catch (error) {
            res.status(400).send(error);
        }
    })

    // add payment
    app.post('/addSupplierPayment', async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            let data = req.body;
            let query = `INSERT INTO suppliers_payments SET ?`;
            await connection.query(query, data);

            let payment_value = data.payment_value;
            let supplier_ID = data.supplier_ID_FK;
            let payment_account = data.payment_account;
            let query2;
            switch (payment_account) {
                case 'lira':
                    query2 = `UPDATE suppliers SET lira_debt = ( lira_debt - ${payment_value}) WHERE supplier_ID = ?`;
                    break;
                case 'dollar':
                    query2 = `UPDATE suppliers SET dollar_debt = ( dollar_debt - ${payment_value} ) WHERE supplier_ID = ?`;
                    break;
                case 'euro':
                    query2 = `UPDATE suppliers SET euro_debt = ( euro_debt - ${payment_value} ) WHERE supplier_ID = ?`;
                    break;
            }
            await connection.query(query2, supplier_ID);

            let [
                [result]
            ] = await connection.query(`SELECT * FROM suppliers WHERE supplier_ID = ${supplier_ID}`);

            await connection.commit();
            connection.release();
            res.send(result)

        } catch (error) {
            await connection.rollback();
            connection.release()
            res.status(500).send(error);
        }
    })
}