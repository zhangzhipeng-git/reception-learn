(function () { return Promise.resolve().then(function () { return require('./my-async-component'); }); });
Vue.component('example', function(res, rej) {
    return Promise.resolve().then(res, rej);
});