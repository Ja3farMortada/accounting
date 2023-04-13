app.controller('returnController', function ($scope, returnFactory, customersFactory) {

    let customersSub;
    let recentSub;
    $scope.$on('$viewContentLoaded', () => {
        customersSub = customersFactory.customers.subscribe(res => {
            $scope.customers = res;
        })
        recentSub = returnFactory.recentItems.subscribe(res => {
            $scope.recentItems = res;
            console.log(res);
        })

    })

    // on destroy controller
    $scope.$on('$destroy', () => {
        customersSub.unsubscribe();
        recentSub.unsubscribe();
    })




    const customersModal = new bootstrap.Modal('#customersModal');
    const select_box = document.querySelector('#customer_select');
    let customerModalType;
    $scope.openCustomerModal = type => {
        customerModalType = type;
        $scope.selectedCustomerID = null;
        customersModal.show();
        $('#customersModal').on('shown.bs.modal', () => {
            // use dselect library to enable live search within select
            dselect(select_box, {
                search: true,
                clearable: true
            })
        })
    }

    $scope.submitCustomerModal = () => {
        let index = $scope.customers.findIndex(x => x.customer_ID == $scope.selectedCustomerID);
        $scope.selectedCustomer = $scope.customers[index];
        customersModal.hide();
    }

    // clear selected customer
    $scope.clearSelectedCustomer = () => {
        $scope.selectedCustomer = null;
        $scope.selectedCustomerID = null;
    }


    // open offcanvas archive
    const archiveOffcanvas = new bootstrap.Offcanvas('#archiveOffcanvas');
    $scope.openArchiveOffcanvas = () => {
        archiveOffcanvas.show();
        returnFactory.getRecentItems($scope.selectedCustomerID);
    }
})