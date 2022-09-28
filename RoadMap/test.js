var start = { x: 10, y: 10 };
var end = { x: 20, y: 30 };
var coor = [start, end];
addNewPoint(1);
function addNewPoint(index) {
  var divider = index + 1;
  var ary = [];
  var initialX = end.x - start.x;
  var initialY = end.y - start.y;
  var gx = initialX / divider;
  var gy = initialY / divider;
  for (let i = 1; i <= index; i++) {
    ary.push({
      x: i * gx + start.x,
      y: i * gy + start.y,
    });
  }
  coor.splice(1, 0, ...ary);
}
addCoor({ x: 20, y: 10 });
function addCoor(cor = { x: 0, y: 0 }) {
  if (!loop(true)) {
    loop(false);
  }
  function loop(opt = true) {
    let is = false;
    for (let i = 0; i < coor.length; ) {
      var find = opt ? "x" : "y";
      var x = coor[i][find];
      var nextx = coor[i + 1][find];
      if (cor[find] == x) {
        console.log(i);
        coor.splice(i + 1, 0, cor);
        is = true;
        break;
      }
      if (cor[find] > x && cor[find] <= nextx) {
        console.log(i);
        coor.splice(i + 1, 0, cor);
        is = true;
        break;
      }
      if (i != coor.length - 2) i++;
      else break;
    }
    return is;
  }
}
console.log(coor);
