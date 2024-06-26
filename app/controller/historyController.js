app.controller(
  "historyController",
  function (
    $scope,
    historyFactory,
    rateFactory,
    euroFactory,
    DateService,
    mainFactory,
    debtsFactory,
    customersFactory
  ) {
    let userSubscription;
    let rateSubscription;
    let euroSubscription;
    $scope.$on("$viewContentLoaded", () => {
      userSubscription = mainFactory.loggedInUser.subscribe(res => {
        $scope.loggedInUser = res;
      });
      rateSubscription = rateFactory.exchangeRate.subscribe(res => {
        $scope.exchangeRate = res;
      });
      euroSubscription = euroFactory.euroRate.subscribe(res => {
        $scope.euroRate = res;
      });

      $scope.salesInvoices = historyFactory.salesInvoices;
    });

    // on destroy controller
    $scope.$on("$destroy", () => {
      userSubscription.unsubscribe();
      rateSubscription.unsubscribe();
      euroSubscription.unsubscribe();
    });

    //tab selection
    $scope.selectedTab = historyFactory.selectedTab;
    $scope.setTab = tab => {
      historyFactory.setTab(tab);
      $scope.selectedTab = historyFactory.selectedTab;
    };

    // watch for invoices change to calculate total
    $scope.$watch(
      "salesInvoices",
      function () {
        $scope.totalSales = historyFactory.totalSales().sale;
        $scope.totalReturn = historyFactory.totalSales().return;
      },
      true
    );

    // payments
    $scope.paymentsHistory = historyFactory.paymentsHistory;
    let totalPayments;
    $scope.$watch(
      "paymentsHistory",
      function () {
        totalPayments = historyFactory.totalPayments();
        $scope.totalPaymentsDollar = totalPayments.totalDollar;
        $scope.totalPaymentsLira = totalPayments.totalLira;
      },
      true
    );

    // define datepicker value
    $scope.datePickerValue = historyFactory.datePickerValue;

    function datepicker() {
      $("#invoiceDatePicker")
        .datepicker({
          dateFormat: "yy-mm-dd",
          onSelect: function () {
            var d = $("#invoiceDatePicker")
              .datepicker({
                dateFormat: "yy-mm-dd",
              })
              .val();
            historyFactory.datePickerValue = d;
            $scope.$digest(($scope.datePickerValue = d));
          },
        })
        .datepicker("setDate", historyFactory.datePickerValue);
    }
    datepicker();

    // set today's date function
    $scope.today = () => {
      historyFactory.datePickerValue = DateService.getDate();
      $scope.datePickerValue = historyFactory.datePickerValue;
      datepicker();
    };

    // watch for datepicker value change and get invoices
    $scope.$watch("datePickerValue", function () {
      $scope.items = null;
      historyFactory.fetchSalesInvoices($scope.datePickerValue);
      historyFactory.fetchPaymentsHistory($scope.datePickerValue);
    });

    // show invoice details
    $scope.showInvoiceDetails = (ID, totalPrice) => {
      $scope.totalPrice = totalPrice;
      let index = $scope.salesInvoices.findIndex(
        index => index.invoice_ID == ID
      );
      $scope.selectedInvoice = $scope.salesInvoices[index];
      $scope.user = $scope.salesInvoices[index]["user"];
      $scope.items = $scope.salesInvoices[index]["invoice_map"];
    };

    // delete invoice
    $scope.deleteInvoice = function () {
      historyFactory.deleteInvoice($scope.selectedInvoice).then(() => {
        $scope.items = null;
        debtsFactory.getCustomerHistory(debtsFactory.selectedCustomer);
        customersFactory.fetchCustomers();
      });
    };

    $scope.deletePayment = function (payment) {
      console.log(payment);
      historyFactory.deletePayment(payment).then(() => {
        debtsFactory.getCustomerHistory(debtsFactory.selectedCustomer);
        customersFactory.fetchCustomers();
      });
    };

    // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Print Invoice %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    $scope.print = async () => {
      let printData = {
        type: $scope.selectedInvoice.invoice_type == "Return" ? "مرتجع" : "",
        date: $scope.datePickerValue,
        invoice: $scope.selectedInvoice.invoice_map,
        name: $scope.selectedInvoice.customer_name || null,
        total: $scope.selectedInvoice.total_price,
      };
      await window.electron.ipcRenderer.invoke("print-invoice", printData);
    };
  }
);
