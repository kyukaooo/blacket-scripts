// just hold down left shift and click on a blook to sell all dupes
let pressedKeys = {};
window.onkeyup = function(e) { delete pressedKeys[e.keyCode] }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

const oSelectBlook = blacket.selectBlook
blacket.selectBlook = function(blook) {
    blacket.blooks.selected = blook
    if (pressedKeys[16])
        blacket.sellBlook(blacket.user.blooks[blook] - 1)
    oSelectBlook(blook)
}
