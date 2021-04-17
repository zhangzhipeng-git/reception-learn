
class Game {
    constructor(map) {
        this.map = map;
        this.hasPath = false;
        this.row = this.map.length;
        this.col = this.map[0].length;
        this.vector = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        this.setVisit();
    }
    setVisit() {
        var visit = [];
        for (let i = 0, len = this.row; i < len; i++) {
            visit[i] = [];
        }
        this.visit = visit;
    }
    getPathFromMap(str, x, y) {
        this.pos = 0;
        this.str = str;
        this.path = [];
        this.step(x, y);
        if (!this.hasPath) {
            this.path = null;
        } else {
            console.log('find path:', this.path);
        }
        return this.hasPath;
    }
    step(x, y) {
        // 已经找到了路径
        if (this.pos >= this.str.length) {
            this.hasPath = true;
            return;
        }
        // 出界，可能起点就越界
        if (!this.checkAccess(x, y)) {
            return;
        }
        // 已经经过该点，则标记不可到达该点
        if (this.visit[y][x]) {
            return false;
        }
        if (this.map[y][x] === this.str[this.pos]) { // 通
            var cur = { x, y };
            var pre = this.path[this.path.length - 1];
            var dir = this.getDir(pre, cur);
            this.pos++;
            this.visit[y][x] = true;
            this.path.push(cur);
            var dirCount = 0, noAccessCount = 0;
            for (var i = 0; i < 4; i++) {
                if (!dir[i]) { continue; }
                dirCount++;
                if (this.step(x + this.vector[i][0], y + this.vector[i][1]) !== false) { continue; }
                noAccessCount++;
            }
            // 递归“归来”，还原 visit
            this.visit[y][x] = null;
            // 当前的这个点至少有一个方向是可达的，当前这个点是通的
            if (dirCount !== noAccessCount) {
                return true;
            }
            // 当前的这个节点上/右/下/左都不通
            this.pos--;
            var pre = this.path.pop();
            return this.visit[pre.y][pre.x] = false;
        }
        // 不通
        return this.visit[y][x] = false;
    }

    /**
     * 检查是否在范围内
     * @param {*} x x 坐标
     * @param {*} y y 坐标
     * @returns 
     */
    checkAccess(x, y) {
        return x >= 0 && x <= this.col - 1 && y >= 0 && y <= this.row - 1;
    }
    /**
     * [上，右，下，左]
     * 1-可达，0-不可达
     * @returns 
     */
    getDir(pre, cur) {
        const { x: px, y: py } = pre || {};
        const { x: cx, y: cy } = cur;
        // 是否上、下、左和右可达 0-不可达，1-可达
        const r = px - 1 === cx && py === cy ? 0 : 1;
        const d = py - 1 === cy && px === cx ? 0 : 1;
        const l = cx - 1 === px && py === cy ? 0 : 1;
        const t = cy - 1 === py && px === cx ? 0 : 1;

        // 有两个方向的
        // 左上顶点节点，判断右、下是否可达
        if (cx === cy && cx === 0) {
            return [0, r, d, 0];
        }
        // 左下顶点节点，判断上、右是否可达
        if (cx === 0 && cy === this.row - 1) {
            return [t, r, 0, 0];
        }
        // 右上顶点节点，判断下、左是否可达
        if (cy === 0 && cx === this.col - 1) {
            return [0, 0, d, l];
        }
        // 右下顶点节点，判断上、左是否可达
        if (cx === this.col - 1 && cy === this.row - 1) {
            return [t, 0, 0, l];
        }

        // 有三个方向的
        // 上边界非顶点节点，判断右、下、左是否可达
        if (cy === 0 && cx > 0 && cx < this.col - 1) {
            return [0, r, d, l];
        }
        // 右边界非顶点节点，判断上、下、左是否可达
        if (cx === this.col - 1 && cy > 0 && cy < this.row - 1) {
            return [t, 0, d, l];
        }
        // 下边界非顶点节点，判断上、右、左是否可达
        if (cy === this.row - 1 && cx > 0 && cx < this.col - 1) {
            return [t, r, 0, l];
        }
        // 左边界非顶点节点，判断上、右、下是否可达
        if (cx === 0 && cy > 0 && cy < this.row - 1) {
            return [t, r, d, 0];
        }

        // 有四个方向的
        // 边界范围内节点，判断上、右、下和左是否可达
        return [t, r, d, l];
    }
}

var exist = function (board, word) {
    var mapObj = new Game(board);
    for (let i = 0, len = board.length; i < len; i++) {
        for (let j = 0, len = board[0].length; j < len; j++) {
            if (mapObj.getPathFromMap(word, j, i)) {
                return true;
            };
        }
    }
    return false;
}

exist([
    ["a", "a", "b", "a", "a", "b"],
    ["a", "a", "b", "b", "b", "a"],
    ["a", "a", "a", "a", "b", "a"],
    ["b", "a", "b", "b", "a", "b"],
    ["a", "b", "b", "a", "b", "a"],
    ["b", "a", "a", "a", "a", "b"]
], "bbbaabbbbbab");
