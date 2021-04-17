var exist = function (board, word) {
    var vector = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    var visit = [];
    for (let i = 0, len = board.length; i < len; i++) {
        visit[i] = [];
    }
    var access = function(i,j) {
        return j > -1 && j < board[0].length && i > -1 && i < board.length;
    }
    var search = function (i, j, pos) {
        if (pos >= word.length) {
            return true;
        }
        if (!access(i, j) || word[pos] !== board[i][j] || visit[i][j]) {
            return;
        }
        visit[i][j] = true;
        for (var x = 0; x < 4; x++) {
            if (search(i + vector[x][1], j + vector[x][0], pos + 1)) { // 存在一条路径通了
                return true;
            };
        }
        visit[i][j] = false;
    }
    for (var i = 0, ilen = board.length, jlen = board[0].length; i < ilen; i++) {
        for (var j = 0; j < jlen; j++) {
            if (search(i, j, 0))
                return true;
        }
    }
    return false;
}
// [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]] "SEE"
var map = [
    ["A","B","C","E"],
    ["S","E","E","S"],
    ["A","D","X","E"]
];
var str = "SEE";
console.log(exist(map, str));