module.exports = (app, db) => {

    app.get('/getRecentItems/:id', async (req, res) => {
        let ID = req.params.id;

        let query = `SELECT M.*, DATE(record_datetime) AS record_date, S.item_description FROM invoice_map M
        INNER JOIN stock S ON item_ID_FK = item_ID
        WHERE customer_ID_FK = ? ORDER BY record_datetime DESC`;
        try {
            let [results] = await db.query(query, ID);
            res.send(results);
        } catch (error) {
            res.status(500).send(error);
        }
    })
};