let img = new Image();
img.src = './logo.jpg'; // 这样是在根目录下找,而不是在打包目录下找
document.body.appendChild(img);

// import logo from './logo.jpg';
// console.log(logo);
// img.src=logo;   