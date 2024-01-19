let extra_delay = 0; // in ms
let max_delay = Object.values(blacket.rarities).map(x => x.wait).reduce((curr, prev) => curr > prev ? curr : prev) + extra_delay;

let openPack = async (pack) => {
    return new Promise((resolve, reject) => {
        blacket.requests.post("/worker2/open", {
            pack
        }, (data) => {
            if (data.error) reject();
            resolve(data.blook);
        });
    });
};

let main = async (pack, amount) => {
    const attainedBlooks = [];
    while (true) {
        if (attainedBlooks.length >= amount) break;
        try {
            const attainedBlook = await openPack(pack);
            blacket.user.tokens -= blacket.packs[pack].price;
            const delay = blacket.rarities[blacket.blooks[attainedBlook].rarity].wait + extra_delay;
            console.log(`%cOpened `,`%c${attainedBlook}`, 'font-size: 4em', `color: ${blacket.rarities[blacket.blooks[attainedBlook].rarity].color}; font-size: 4em`);
            attainedBlooks.push(attainedBlook);
            await new Promise((r, _) => setTimeout(r, delay));
        } catch (err) {
            console.log(err);
            await new Promise((r, _) => setTimeout(r, max_delay));
        }
    }
    console.log(`%cFinished opening ${amount} packs!`, 'font-size: 4em');
};

let packs = Object.keys(blacket.packs);
let pack;

do {
    // i have to do some interesting checks to get the user experience i want
    if (((pack && !packs.includes(pack)) || pack === "") && !window.confirm("Invalid pack, would you like to try again?")) break;
    pack = window.prompt("Enter a pack (case-sensitive)");
    if (pack === null) break;
} while(!pack || !packs.includes(pack));

let amount;
let max_packs = Math.floor(blacket.user.tokens / blacket.packs[pack].price);

do {
    if (amount && (amount < 1 || amount > max_packs) && !window.confirm("Invalid amount, would you like to try again?")) break;
    amount = parseInt(window.prompt(`Enter a number of packs to open (Max: ${max_packs})`));
    if (amount === null) break;
} while(!amount || amount < 1 || amount > max_packs);

main(pack, amount);