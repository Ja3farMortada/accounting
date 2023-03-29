module.exports = (app, db) => {

    app.get('/getCustomerHistory/:id', async (req, res) => {
        let id = req.params.id;
        let query = `SELECT
        I.invoice_type AS type,
        I.invoice_ID,
        DATE(edited_datetime) AS date,
        TIME(edited_datetime) AS time,
        I.total_cost AS value,
        I.total_price AS actual_value,
        I.invoice_isCompleted AS status,
        'dollar' AS currency,
        JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'item_description', S.item_description, 'qty', 	M.qty, 'currency', M.currency, 'exchange_rate', M.exchange_rate, 'euro_rate', M.euro_rate, 'unit_cost', M.unit_cost, 	'original_price', M.original_price, 'discounted_price', M.discounted_price, 'unit_price', M.unit_price)) invoice_map

        FROM invoice AS I
        INNER JOIN invoice_map AS M ON I.invoice_ID = M.invoice_ID_FK
        INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
        INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
        WHERE I.customer_ID_FK = ?        
        GROUP BY I.invoice_ID

        UNION
         
        SELECT
        'Payment',
        P.payment_ID,
        DATE(P.payment_datetime),
        TIME(P.payment_datetime),
        P.payment_value,
        P.actual_payment_value,
        P.payment_account,
        P.payment_currency,
        null

        FROM customers_payments P
        WHERE P.customer_ID_FK = ?

        ORDER BY date DESC, time DESC`;

        try {
            let [results] = await db.query(query, [id, id]);
            res.send(results);
        } catch (error) {
            res.status(400).send(error);
        }
    })

    // add payment
    app.post('/addPayment', async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            let data = req.body;
            let query = `INSERT INTO customers_payments SET ?`;
            await connection.query(query, data);

            let payment_value = data.payment_value;
            let customer_ID = data.customer_ID_FK;
            let payment_account = data.payment_account;
            let query2;
            switch (payment_account) {
                case 'lira':
                    query2 = `UPDATE customers SET lira_debt = ( lira_debt - ${payment_value}) WHERE customer_ID = ?`;
                    break;
                case 'dollar':
                    query2 = `UPDATE customers SET dollar_debt = ( dollar_debt - ${payment_value} ) WHERE customer_ID = ?`;
                    break;
                case 'euro':
                    query2 = `UPDATE customers SET euro_debt = ( euro_debt - ${payment_value} ) WHERE customer_ID = ?`;
                    break;
            }
            await connection.query(query2, customer_ID);

            let [
                [result]
            ] = await connection.query(`SELECT * FROM customers WHERE customer_ID = ${customer_ID}`);

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