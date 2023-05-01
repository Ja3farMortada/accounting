app.directive('suppliersSettings', function (suppliersFactory, mainFactory) {
    return {
        restrict: 'E',
        templateUrl: '_directives/templates/suppliersSettings.html',
        scope: {

        },
        link: function (scope) {

            suppliersFactory.suppliers.subscribe(res => {
                scope.suppliers = res;
            })

            let userSubscription;
            userSubscription = mainFactory.loggedInUser.subscribe(res => {
                scope.loggedInUser = res;
            })

            // let offCanvasEl = document.getElementById('offcanvasBottom')
            const offCanvas = new bootstrap.Offcanvas(document.getElementById('supplierOffCanvas'));

            $('#supplierOffCanvas').on('shown.bs.offcanvas', event => {
                $('#nameInput').trigger('focus');
            })

            let modalType;
            scope.openOffCanvas = (type, data) => {
                if (type == 'edit') {
                    modalType = 'edit'
                    scope.modalData = {};
                    angular.copy(data, scope.modalData);
                    offCanvas.show();
                } else {
                    modalType = 'add'
                    scope.modalData = {};
                    offCanvas.show();
                }
            }

            // submit offCanvas
            scope.submit = () => {
                switch (modalType) {
                    case 'add':
                        suppliersFactory.addSupplier(scope.modalData).then(response => {
                            if (response) {
                                scope.modalData = {
                                    supplier_name: null,
                                    supplier_phone: null,
                                    supplier_address: null,
                                    dollar_debt: null,
                                    supplier_notes: null
                                }
                                $('#nameInput').trigger('focus')
                            }
                        })
                        break;
                    case 'edit':
                        suppliersFactory.updateSupplier(scope.modalData).then(response => {
                            if (response) {
                                offCanvas.hide()
                            }
                        })

                        break;
                }
            }

            // Delete service
            scope.deleteSupplier = data => {
                suppliersFactory.deleteSupplier(data);
            }
        }
    }
});