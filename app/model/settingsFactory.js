app.factory('settingsFactory', function () {


    var model = {};
    model.tabSelected = 'Account';

    //tab selection
    model.selectTab = function (tab) {
        if (this.tabSelected != tab) {
            switch (tab) {
                case 'Account':
                    this.tabSelected = 'Account';
                    break;

                case 'General':
                    this.tabSelected = 'General';
                    break;

                case 'Stock':
                    this.tabSelected = 'Stock';
                    break;

                case 'Customers':
                    this.tabSelected = 'Customers';
                    break;

                case 'Suppliers':
                    this.tabSelected = 'Suppliers';
                    break;
            };
        }
    };


    return model;
});