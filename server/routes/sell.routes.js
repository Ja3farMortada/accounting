module.exports = (app, db) => {


    // get incomplete invoices
    app.get('/getIncompleteInvoices', async (req, res) => {
        let query = `SELECT I.invoice_ID, I.customer_ID_FK AS customer_ID, I.invoice_type, DATE(I.invoice_datetime) AS invoice_date, TIME(I.invoice_datetime) AS invoice_time, I.edited_datetime AS edited_datetime, I.total_cost, I.total_price, C.customer_name AS customer_name, U.owner AS user, 
        JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'barcode', S.barcode, 'item_description', S.item_description, 'qty', M.qty, 'currency', M.currency, 'exchange_rate', M.exchange_rate, 'euro_rate', M.euro_rate, 'discount', M.discount, 'unit_cost', M.unit_cost, 'original_cost', M.original_cost, 'original_price', M.original_price, 'discounted_price', M.discounted_price, 'unit_price', M.unit_price)) invoice_map FROM invoice AS I
        INNER JOIN invoice_map AS M ON I.invoice_ID = M.invoice_ID_FK
        INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
        INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
        INNER JOIN customers AS C ON I.customer_ID_FK = C.customer_ID
        WHERE invoice_isCompleted = 0
        AND invoice_status = 1
        GROUP BY I.invoice_ID
        ORDER BY edited_datetime DESC`
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
                return [invoice_ID, item.item_ID, invoice.invoice_type, item.qty, item.currency, item.discount, item.discounted_price, item.exchange_rate, item.euro_rate, item.unit_cost, item.original_cost, item.original_price, item.unit_price]
            });

            await connection.query(`INSERT INTO invoice_map (invoice_ID_FK, item_ID_FK, record_type, qty, currency, discount, discounted_price, exchange_rate, euro_rate, unit_cost, original_cost, original_price, unit_price) VALUES ?`, [invoice_map]);

            // update stock quantity
            let queries = '';
            let item_ID = null;
            let quantity = null;
            for (let i = 0; i < items.length; i++) {
                item_ID = items[i]['item_ID'];
                quantity = items[i]['qty'];
                queries += `UPDATE stock SET qty = (qty - ${quantity}) WHERE item_ID = ${item_ID};`;
            }
            await connection.query(queries);

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
            let debtQuery = `UPDATE customers SET dollar_debt = (dollar_debt + ${totalDebts.totalDollar}) WHERE customer_ID = ?`;
            await connection.query(debtQuery, customer_ID);

            // update stock quantity
            let queries = '';
            let item_ID = null;
            let quantity = null;
            for (let i = 0; i < items.length; i++) {
                item_ID = items[i]['item_ID'];
                quantity = items[i]['qty'];
                queries += `UPDATE stock SET qty = (qty - ${quantity}) WHERE item_ID = ${item_ID};`;
            }
            await connection.query(queries);

            await connection.commit();
            connection.release();
            res.send(`${result.insertId}`);
        } catch (error) {
            await connection.rollback();
            connection.release()
            res.status(500).send(error);
        }
    })


    // confirmEditInvoice
    app.post('/confirmEditInvoice', async (req, res) => {

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            let invoice = req.body.invoice;
            let oldInvoice = req.body.oldInvoice;
            let items = req.body.items;

            // update invoice
            let invoiceQuery = `UPDATE invoice SET ? WHERE invoice_ID = ?`;
            await connection.query(invoiceQuery, [invoice, invoice.invoice_ID]);
            
            // delete invoice map items
            let invoice_ID = invoice.invoice_ID;
            await connection.query(`DELETE FROM invoice_map WHERE invoice_ID_FK = ?`, invoice_ID);

            // update stock qty after deletion
            let oldInvoiceMap = oldInvoice.invoice_map;
            let queries = '';
            let item_ID = null;
            let quantity = null;
            for (let i = 0; i < oldInvoiceMap.length; i++) {
                item_ID = oldInvoiceMap[i]['item_ID'] || oldInvoiceMap[i]['item_ID_FK'];
                quantity = oldInvoiceMap[i]['qty'];
                queries += `UPDATE stock SET qty = (qty + ${quantity}) WHERE item_ID = ${item_ID};`;
            }
            await connection.query(queries);

            // map query
            let invoice_map = Array.from(items).map(function (item) {
                return [invoice_ID, item.item_ID || item.item_ID_FK, invoice.customer_ID_FK, invoice.invoice_type, item.qty, item.currency, item.discount, item.discounted_price, item.exchange_rate, item.euro_rate, item.unit_cost, item.unit_price, item.original_cost, item.original_price]
            });
            let mapQuery = `INSERT INTO invoice_map (invoice_ID_FK, item_ID_FK, customer_ID_FK, record_type, qty, currency, discount, discounted_price, exchange_rate, euro_rate, unit_cost, unit_price, original_cost, original_price) VALUES ?`;
            await connection.query(mapQuery, [invoice_map]);

            // update customer debt
            let customer_ID = invoice.customer_ID_FK;
            let debtQuery = `UPDATE customers SET dollar_debt = ((dollar_debt - ${oldInvoice.total_price}) + ${invoice.total_price}) WHERE customer_ID = ?`;
            await connection.query(debtQuery, customer_ID);

            // update stock qty
            queries = '';
            item_ID = null;
            quantity = null;
            for (let i = 0; i < items.length; i++) {
                item_ID = items[i]['item_ID'] || items[i]['item_ID_FK'];
                quantity = items[i]['qty'];
                queries += `UPDATE stock SET qty = (qty - ${quantity}) WHERE item_ID = ${item_ID};`;
            }
            await connection.query(queries);

            // commit before selecting again
            await connection.commit();

            let [[response]] = await db.query(`SELECT I.invoice_ID, I.customer_ID_FK AS customer_ID, I.invoice_type, DATE(I.invoice_datetime) AS invoice_date, TIME(I.invoice_datetime) AS invoice_time, I.edited_datetime AS edited_datetime, I.total_cost, I.total_price, C.customer_name AS customer_name, U.owner AS user, 
            JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'barcode', S.barcode, 'item_description', S.item_description, 'qty', M.qty, 'currency', M.currency, 'discount', M.discount, 'exchange_rate', M.exchange_rate, 'euro_rate', M.euro_rate, 'unit_cost', M.unit_cost, 'original_cost', M.original_cost, 'original_price', M.original_price, 'discounted_price', M.discounted_price, 'unit_price', M.unit_price)) invoice_map FROM invoice AS I
            INNER JOIN invoice_map AS M ON I.invoice_ID = M.invoice_ID_FK
            INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
            INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
            LEFT JOIN customers AS C ON I.customer_ID_FK = C.customer_ID
            WHERE invoice_ID = ?`, invoice.invoice_ID); 


            connection.release();

            res.send(response)
        } catch (error) {
            await connection.rollback();
            connection.release()
            res.status(500).send(error);
        }
    })


    // complete invoice
    app.post('/completeInvoice', async (req, res) => {
        let invoice_ID = req.body[0].invoice_ID;
        let edited_datetime = req.body[1];
        let query = `UPDATE invoice SET invoice_isCompleted = 1, edited_datetime = ? WHERE invoice_ID = ?`;
        try {
            await db.query(query, [edited_datetime, invoice_ID]);
            res.send('success');
        } catch (error) {
            res.status(500).send(error);
        }
    })


    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Search invoice logic %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    app.get('/searchInvoice/:id', async (req, res) => {
        let ID = req.params.id;
        let query = `SELECT I.invoice_ID, I.customer_ID_FK AS customer_ID, I.invoice_type, DATE(I.invoice_datetime) AS invoice_date, TIME(I.invoice_datetime) AS invoice_time, I.edited_datetime AS edited_datetime, I.total_cost, I.total_price, C.customer_name AS customer_name, U.owner AS user, 
        JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'barcode', S.barcode, 'item_description', S.item_description, 'qty', M.qty, 'currency', M.currency, 'discount', M.discount, 'exchange_rate', M.exchange_rate, 'euro_rate', M.euro_rate, 'unit_cost', M.unit_cost, 'original_cost', M.original_cost, 'original_price', M.original_price, 'discounted_price', M.discounted_price, 'unit_price', M.unit_price)) invoice_map FROM invoice AS I
        INNER JOIN invoice_map AS M ON I.invoice_ID = M.invoice_ID_FK
        INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
        INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
        INNER JOIN customers AS C ON I.customer_ID_FK = C.customer_ID
        WHERE invoice_status = 1
        AND invoice_ID = ?
        GROUP BY I.invoice_ID`
        try {
            let [[result]] = await db.query(query, ID);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    })

}