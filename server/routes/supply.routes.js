module.exports = (app, db) => {

    app.post('/supplyCheckout', async (req, res) => {
        const connection = await db.getConnection();
            try {
                await connection.beginTransaction();
    
                let invoice = req.body.invoice;
                let items = req.body.items;
                let supplyQuery = `INSERT INTO supply_invoice SET ?`;
                let [result] = await connection.query(supplyQuery, invoice);
                
                let invoice_ID = result.insertId;
                let invoice_map = Array.from(items).map(function (item) {
                    return [invoice_ID, item.item_ID, item.qty, item.item_cost, item.currency]
                });
                let mapQuery = `INSERT INTO supply_invoice_map (invoice_ID_FK, item_ID_FK, qty, item_cost, currency) VALUES ?`;
                await connection.query(mapQuery, [invoice_map]);
    
                let totalDebts = items.reduce((memo, item) => {
                    return {
                        total: memo.total + (item.qty * item.item_cost)
                    }
                }, {
                    total: 0
                });
                let supplier_ID = invoice.supplier_ID_FK;
                let debtQuery = `UPDATE suppliers SET dollar_debt = (dollar_debt + ${totalDebts.total}) WHERE supplier_ID = ?`;
                await connection.query(debtQuery, supplier_ID);
    
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
                await connection.rollback();
                connection.release()
                console.log(error);
                res.status(500).send(error);
            }
    })
}