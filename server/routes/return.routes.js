module.exports = (app, db) => {

    app.get('/getRecentItems/:id', async (req, res) => {
        let ID = req.params.id;

        let query = `SELECT M.*,
        DATE(record_datetime) AS record_date,
        S.item_description,
        S.barcode
        FROM invoice_map M
        INNER JOIN stock S ON item_ID_FK = item_ID
        WHERE M.invoice_ID_FK IN (SELECT invoice_ID FROM invoice WHERE customer_ID_FK = ? AND invoice_isCompleted = 1 AND invoice_type <> 'return')
        ORDER BY record_datetime DESC`;
        try {
            let [results] = await db.query(query, ID);
            res.send(results);
        } catch (error) {
            res.status(500).send(error);
        }
    })

    app.post('/checkoutReturn', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let invoice = req.body.invoice;
            let items = req.body.items;
            let orderQuery = `INSERT INTO invoice SET ?`;
            let [result] = await connection.query(orderQuery, invoice);
            
            let invoice_ID = result.insertId;
            let invoice_map = Array.from(items).map(function (item) {
                return [invoice_ID, item.item_ID, invoice.customer_ID_FK, invoice.invoice_type, item.qty, item.currency, item.discount, item.discounted_price, item.exchange_rate, item.euro_rate, item.unit_cost, item.unit_price, item.original_cost, item.original_price]
            });
            let mapQuery = `INSERT INTO invoice_map (invoice_ID_FK, item_ID_FK, customer_ID_FK, record_type, qty, currency, discount, discounted_price, exchange_rate, euro_rate, unit_cost, unit_price, original_cost, original_price) VALUES ?`;
            await connection.query(mapQuery, [invoice_map]);

            let totalDebts = items.reduce((memo, item) => {
                return {
                    totalDollar: (item.qty * item.unit_price)
                }
            }, {
                totalDollar: 0
            });
            let customer_ID = invoice.customer_ID_FK;
            if (customer_ID) {
                let debtQuery = `UPDATE customers SET dollar_debt = (dollar_debt - ${totalDebts.totalDollar}) WHERE customer_ID = ?`;
                await connection.query(debtQuery, customer_ID);
            }

            // update stock quantity
            let queries = '';
            let item_ID = null;
            let quantity = null;
            for (let i = 0; i < items.length; i++) {
                item_ID = items[i]['item_ID'];
                quantity = items[i]['qty'];
                queries += `UPDATE stock SET qty = (qty + ${quantity}) WHERE item_ID = ${item_ID};`;
            }
            await connection.query(queries);

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
};