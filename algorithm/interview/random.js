function getRandomNum(min, max) {
    if (min > max) { return NaN; }
    if (min === max) {return min; }
    if (parseInt(min) === min && parseInt(max) === max) {
        return ~~(Math.random() * (max - min + 1)) + min;
    }
    var dis = max - min;
    var len = (dis+'').split('.')[1].length;
    return (Math.random() * (max - min + 1/Math.pow(10, len))) + min;
}

function get100Ele() {
    var arr = [];
    while(arr.length < 100) {
        arr.push(getRandomNum(0, 50));
    }
    return arr;
}

function getNoRepeat5Elm(arr) {
    arr = arr.slice();
    var resArr = [];
    var min = 0;
    var max = arr.length - 1;
    while(resArr.length < 5) {
        var index = getRandomNum(min, max);
        var num = arr[index];
        if (resArr.includes(num)) {continue; }
        resArr.push(num);
        arr.splice(index, 1);
        max--;
    }
    return resArr;
}
var res = getNoRepeat5Elm(get100Ele());
console.log(res);
