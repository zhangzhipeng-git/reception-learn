/** 默认配置 */
const config = {
    SIZE: 30, // 方块宽高
    ROW: 20, // 画布行数
    COL: 20, // 画布列数
    GAP: 5, // 方格和边界 或 方格和方格之间的间隙
    SNAKE: [[0, 0], [1, 0], [2, 0]], // 🐍
    DIR: 'ArrowDown' // 初始移动方向
};
/** 贪吃蛇 */
class Game {
    constructor(config) {
        Object.assign(this, config);
    }
    /**
     * 启动游戏
     */
    start() {
        this.init();
        this.registEvent();
        this.scheduler = fn => setTimeout(fn, 600);
        this.timer = this.scheduler(this.startRender.bind(this));
    }
    /**
     * 启动动画渲染
     */
    startRender() {
        if (this.isOver) {return;}
        this.render(this.DIR);
        this.timer = this.scheduler(this.startRender.bind(this));
    }
    /**
     * 动画渲染（清除画布，边界判断，🐍前进，渲染食物，吃食物，渲染食物，渲染🐍）
     * @param {*} dir 移动方向
     */
    render(dir) {
        // 按键与当前移动方向相反则返回
        if (this.DIR === 'ArrowUp' && dir === 'ArrowDown') { return; }
        if (this.DIR === 'ArrowDown' && dir === 'ArrowUp') { return; }
        if (this.DIR === 'ArrowLeft' && dir === 'ArrowRight') { return; }
        if (this.DIR === 'ArrowRight' && dir === 'ArrowLeft') { return; }
        // 🐍头
        const head = this.SNAKE[0];
        if (!this.checkBoundary(dir, head)) {
            this.over();
            return;
        }
        // 新建一个🐍头
        const newHead = [head[0], head[1]];
        const last = this.SNAKE[this.SNAKE.length - 1];
        const preLast = [last[0], last[1]];
        if (this.DIR !== dir) { this.DIR = dir; }
        // 新🐍头根据方向移动
        switch (dir) {
            case 'ArrowUp': --newHead[1]; break;
            case 'ArrowDown': ++newHead[1]; break;
            case 'ArrowLeft': --newHead[0]; break;
            case 'ArrowRight': ++newHead[0]; break;
            default: return;
        }
        // 清空画布
        this.clearCanvas();
        // 渲染食物
        this.renderFoot();
        // 🐍身前进
        for (let i = this.SNAKE.length - 1; i > 0; i--) {
            this.SNAKE[i] = this.SNAKE[i - 1];
        }
        // 重设🐍头
        this.SNAKE[0] = newHead;
        // 吃到一个食物，🐍身后退，食物变🐍头
        this.eatFood(preLast);
        // 渲染🐍
        this.renderSnake();
    }
    /**
     * 清除画布
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIHGT);
    }
    /**
     * 吃食物，将食物推入🐍，变为🐍头
     * @param {*} preLast 移动之前的🐍的尾巴
     */
    eatFood(preLast) {
        // 没有食物返回
        if (!this.food) { return; }
        const [fx, fy] = this.food;
        const [sx, sy] = this.SNAKE[0];
        if (sx !== fx || sy !== fy) { return; }
        const len = this.SNAKE.length;
        for (let i = 0; i < len - 1; i++) {
            this.SNAKE[i] = this.SNAKE[i + 1];
        }
        this.SNAKE[len - 1] = preLast;
        this.SNAKE.unshift([fx, fy]);
        // 清除食物
        const [cx, cy] = this.getRenderPoint(this.food);
        this.food = null;
        this.ctx.clearRect(cx, cy, this.SIZE, this.SIZE);
        // 新生成并渲染一个食物
        this.renderFoot();
        this.score = (this.score || 0) + 10;
        console.clear();
        console.log('分数：', this.score);
    }
    /**
     * 获取真正的渲染坐标（包含方块之间的间隙）
     * @param {*} item 坐标
     */
    getRenderPoint(item) {
        const [x, y] = item;
        return [x * this.SIZE + (x + 1) * this.GAP, y * this.SIZE + (y + 1) * this.GAP];
    }
    /**
     * 注册事件
     */
    registEvent() {
        this.event = (e) => this.render(e.key);
        window.addEventListener('keydown', this.event);
    }
    /**
     * 结束游戏
     */
    over() {
        window.removeEventListener('keydown', this.event);
        this.isOver = true;
        clearTimeout(this.timer);
        alert('游戏结束，分数：' + (this.score || 0));
    }
    /**
     * 渲染食物
     */
    renderFoot() {
        if (!this.food) { this.createFood(); }
        const [x, y] = this.getRenderPoint(this.food);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, this.SIZE, this.SIZE);
    }
    /**
     * 生成食物（不能和🐍身重合）
     */
    createFood() {
        const x = ~~(Math.random() * this.COL);
        const y = ~~(Math.random() * this.ROW);
        const cross = this.SNAKE.some((item) =>
            x === item[0] && y === item[1]
        );
        if (cross) { this.createFood(); }
        return this.food = [x, y];
    }
    /**
     * 检查🐍是否越界（这里没有判断🐍头和🐍身重合）
     * @param {*} dir 🐍的移动方向
     * @param {*} head 🐍头
     */
    checkBoundary(dir, head) {
        const [x, y] = head;
        switch (dir) {
            case 'ArrowUp': return y > 0;
            case 'ArrowLeft': return x > 0;
            case 'ArrowDown': return y < this.ROW - 1;
            case 'ArrowRight': return x < this.COL - 1;
            default: break;
        }
        return true;
    }
    /**
     * 渲染🐍
     */
    renderSnake() {
        for (let i = 0, len = this.SNAKE.length; i < len; i++) {
            const cur = this.SNAKE[i];
            const [x1, y1] = cur;
            const [sx, sy] = this.getRenderPoint(cur);
            this.ctx.fillStyle = i === 0 ? 'orange' : 'white';
            this.ctx.fillRect(sx, sy, this.SIZE, this.SIZE);
            // 填充或清除间隙
            if (i >= len - 1) { continue; }
            const nex = this.SNAKE[i + 1];
            const [x2, y2] = nex;
            let gx, gy, w, h;
            if (y1 === y2) {
                gx = x2 > x1 ? sx + this.SIZE : sx - this.GAP;
                gy = sy;
                w = this.GAP;
                h = this.SIZE;
            } else if (x1 === x2) {
                gx = sx;
                gy = y2 > y1 ? sy + this.SIZE : sy - this.GAP;
                w = this.SIZE;
                h = this.GAP;
            }
            this.ctx.fillRect(gx, gy, w, h);
        }
    }
    /**
     * 初始化参数
     */
    init() {
        const canvas = document.getElementById('snake');
        this.ctx = canvas.getContext('2d');
        // 设置画布宽高
        const w = this.SIZE * this.COL + this.GAP * (this.COL + 1);
        const h = this.SIZE * this.ROW + this.GAP * (this.ROW + 1);
        canvas.style.backgroundColor = '#000';
        this.WIDTH = canvas.width = w;
        this.HEIHGT = canvas.height = h;
        this.food = null;
    }
}
new Game(config).start();