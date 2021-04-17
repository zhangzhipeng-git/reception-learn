console.log('index.js')
import('./test.js').then(() => {
    console.log('test.js is loaded');
});
