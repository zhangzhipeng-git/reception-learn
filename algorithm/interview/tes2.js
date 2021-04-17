var o = {b: 22};
Object.defineProperty(o, '__xx__', {
    value: 2,
    enumerable: false,
    configurable: true
})
console.log(o['__xx__']);
for(var x in o) {
    console.log(x);
}
delete o.__xx__;
console.log(o.__xx__)