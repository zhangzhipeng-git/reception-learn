var exist = function (board, word) {
    var isFind = false;
    var vector = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    var visit = [];
    for (let i = 0, len = board.length; i < len; i++) {
        visit[i] = [];
    }
    var access = function(i,j) {
        return j > -1 && j < board[0].length && i > -1 && i < board.length;
    }
    var search = function (i, j, pos) {
        if (isFind || pos >= word.length) {
            isFind = true;
            return;
        }
        if (!access(i, j)) {
            return;
        }
        if (word[pos] !== board[i][j]) {
            return;
        }
        if (visit[i][j]) {
            return;
        }
        visit[i][j] = true;
        for (var x = 0; x < 4; x++) {
            search(i + vector[x][1], j + vector[x][0], pos + 1);
        }
        visit[i][j] = false;
    }
    for (var i = 0, ilen = board.length, jlen = board[0].length; i < ilen; i++) {
        for (var j = 0; j < jlen; j++) {
            if (search(i, j, 0))
                return isFind;
        }
    }
    return isFind;
}
// [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]] "SEE"
var map = [
    ["A","B","C","E"],
    ["S","F","C","S"],
    ["A","D","E","E"]
];
var str = "SEE";
console.log(exist(map, str));