app.factory('euroFactory', function ($http, NotificationService) {
    // define URL
    const url = `http://localhost:3000`;

    var model = {};
    model.euroRate = new BehaviorSubject({});


    const getEuroRate = function () {
        $http.get(`${url}/getEuroRate`).then(function (response) {
            model.euroRate.next(response.data)
        }, function (error) {
            NotificationService.showError(error);
        });
    };
    getEuroRate();

    model.updateEuroRate = data => {
        $http.post(`${url}/updateEuroRate`, data).then(response => {
            model.euroRate.next(response.data)
            NotificationService.showSuccess();
        }, error => {
            NotificationService.showError(error);
        });
    };

    return model;
});