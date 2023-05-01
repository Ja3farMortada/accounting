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
}