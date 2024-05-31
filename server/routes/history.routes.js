module.exports = (app, db) => {
  // get sales invoices
  app.get("/getSalesInvoices/:date", async (req, res) => {
    let date = req.params.date;
    let query = `SELECT I.invoice_ID,
        I.invoice_type,
        TIME(I.edited_datetime) AS invoice_time,
        I.total_cost,
        I.total_price,
        I.customer_ID_FK AS customer_ID,
        C.customer_name AS customer_name,
        U.owner AS user, 
        JSON_ARRAYAGG(JSON_OBJECT('record_ID', M.record_ID, 'item_ID_FK', M.item_ID_FK, 'item_description', S.item_description, 'category_name', SC.category_name, 'qty', M.qty, 'currency', M.currency, 'exchange_rate', M.exchange_rate, 'euro_rate', M.euro_rate, 'discount', M.discount, 'discounted_price', M.discounted_price, 'unit_cost', M.unit_cost, 'original_price', M.original_price, 'unit_price', M.unit_price, 'barcode', S.barcode)) invoice_map
        FROM invoice AS I
        INNER JOIN invoice_map AS M ON I.invoice_ID = M.invoice_ID_FK
        INNER JOIN stock AS S ON S.item_ID = M.item_ID_FK
        INNER JOIN users AS U ON I.user_ID_FK = U.user_ID
        INNER JOIN stock_categories SC ON SC.category_ID = S.category_ID_FK
        LEFT JOIN customers AS C ON I.customer_ID_FK = C.customer_ID
        WHERE DATE(edited_datetime) = '${date}'
        AND invoice_status = 1
        GROUP BY I.invoice_ID
        ORDER BY invoice_time DESC`;
    try {
      let [results] = await db.query(query);
      res.send(results);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // get payments
  app.get("/getPaymentsHistory/:date", async (req, res) => {
    let date = req.params.date;
    let query = `SELECT P.*, C.customer_name FROM customers_payments P
        INNER JOIN customers C ON P.customer_ID_FK = C.customer_ID
        WHERE Date(payment_datetime) = '${date}'
        AND P.payment_status = 1
        ORDER BY Time(payment_datetime) DESC`;
    try {
      let [results] = await db.query(query);
      res.send(results);
    } catch (error) {
      res.status(400).send(error);
    }
  });

  // delete invoice
  app.post("/deleteInvoice", async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      let invoice = req.body.data;
      let ID = invoice.invoice_ID;
      let query = `UPDATE invoice SET invoice_status = 0 WHERE invoice_ID = ?`;
      await connection.query(query, ID);
      await connection.query(
        `UPDATE invoice_map SET record_status = 0 WHERE invoice_ID_FK = ?`,
        ID
      );

      if (invoice.invoice_type == "Return" || invoice.invoice_type == "Debt") {
        let operation;
        switch (invoice.invoice_type) {
          case "Return":
            operation = "+";
            break;

          case "Debt":
            operation = "-";
            break;
        }

        let query = `UPDATE customers SET dollar_debt = (dollar_debt ${operation} ${invoice.total_price}) WHERE customer_ID = ?`;
        await connection.query(query, invoice.customer_ID);
      }
      await connection.commit();
      connection.release();
      res.send("");
    } catch (error) {
      console.log(error);
      await connection.rollback();
      connection.release();
      res.status(500).send(error);
    }
  });

  // deletePayment
  app.post("/deletePayment", async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      let payment = req.body;
      let query = `UPDATE customers_payments SET payment_status = 0 WHERE payment_ID = ?`;
      await connection.query(query, payment.payment_ID);

      await connection.query(
        `UPDATE customers SET dollar_debt = (dollar_debt + ?) WHERE customer_ID = ? `,
        [payment.payment_value, payment.customer_ID_FK]
      );
      await connection.commit();
      connection.release();
      res.send("");
    } catch (error) {
      console.log(error);
      await connection.rollback();
      connection.release();
      res.status(500).send(error);
    }
  });
};
