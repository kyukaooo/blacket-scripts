let extra_delay = 0; // in ms
let max_delay = Object.values(blacket.rarities).map(x => x.wait).reduce((curr, prev) => curr > prev ? curr : prev) + extra_delay;
const rarityOrder = Object.entries(blacket.rarities).sort((a, b) => a[1].exp - b[1].exp).map(x => x[0]);

// colour shifting programmatically https://stackoverflow.com/a/13542669
const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

let openPack = async (pack) => {
    return new Promise((resolve, reject) => {
        blacket.requests.post("/worker3/open", {
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
            const color = blacket.rarities[blacket.blooks[attainedBlook].rarity].color;
            console.log(`%c ${attainedBlook ?? "Invalid Blook"} %s`, `color:#fff;font-size:2vw;text-shadow:0 0 .5vw rgba(255,255,255,.4),-.15vw -.15vw 0 #fff;font-family:Titan One;background:-webkit-linear-gradient(45deg,${color},${pSBC(0.5, color)});-webkit-background-clip:text;-moz-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent`, `%c(${attainedBlooks.length+1}/${amount})`, 'font-size:.5vw');
            attainedBlooks.push(attainedBlook);
            await new Promise((r, _) => setTimeout(r, delay));
        } catch (err) {
            console.log(err);
            await new Promise((r, _) => setTimeout(r, max_delay));
        }
    }
    console.log(`%c`, 'font-size: 4em')
    console.log(`%c${amount} pack results below:`, 'font-size: 4em');
    const blookCounts = attainedBlooks.reduce((acc, blook) => { acc[blook] = (acc[blook] || 0) + 1; return acc; }, {});
    const orderedBlooks = Object.keys(blookCounts).sort((a, b) => rarityOrder.indexOf(blacket.blooks[b].rarity) - rarityOrder.indexOf(blacket.blooks[a].rarity));
    orderedBlooks.forEach((blook) => {
        const count = blookCounts[blook];
        const color = blacket.rarities[blacket.blooks[blook].rarity].color;
        console.log(`%c ${blook} %sx`, `color:#fff;font-size:2vw;text-shadow:0 0 .5vw rgba(255,255,255,.4),-.15vw -.15vw 0 #fff;font-family:Titan One;background:-webkit-linear-gradient(45deg,${color},${pSBC(0.5, color)});-webkit-background-clip:text;-moz-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent`, count)
    });
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

if (pack && amount) main(pack, amount);
