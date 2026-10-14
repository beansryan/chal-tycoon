export const CONFIG = Object.freeze({version:2,saveKey:'challenger-tycoon-v1',startingCash:1000,dayLength:480,offlineCap:14400,tile:24,gridWidth:15,gridHeight:15,maxCustomers:24,secondCheckoutCost:1200});
export const RESEARCH = Object.freeze([
 {id:'pos',name:'Quick-scan checkout',cost:25,cash:650,unlock:6,description:'Both checkouts process purchases 25% faster. More throughput, more stock pressure.'},
 {id:'bundles',name:'Smarter bundle demos',cost:30,cash:800,unlock:7,description:'Accessory attachment rises from 40% to 65%. Requires nearby stocked Accessories.'},
 {id:'reorder',name:'Supplier standing orders',cost:40,cash:1000,unlock:7,description:'Aisha can order discounted deliveries automatically at your chosen stock threshold.'},
 {id:'routing',name:'Rain-ready dispatch',cost:30,cash:850,unlock:8,description:'Standard supplier deliveries take 20s instead of 35s. Rain still adds 15s.'}
]);
export const PRODUCTS = Object.freeze({
 mobile:{name:'Mobile',fixture:'Phone display',price:249,cost:155,capacity:5,build:450,unlock:1,color:'#79b8ca',icon:'▣',description:'Everyday phones. Your first little department.'},
 computing:{name:'Computing',fixture:'Laptop display',price:649,cost:420,capacity:4,build:1100,unlock:3,color:'#9e91c5',icon:'▰',description:'Bigger baskets, more cash tied up in stock.'},
 accessories:{name:'Accessories',fixture:'Accessory rack',price:39,cost:15,capacity:12,build:600,unlock:4,color:'#e1b56c',icon:'♧',description:'Small baskets, healthy margins. Bundles beside Computing or Gaming.'},
 gaming:{name:'Gaming',fixture:'Gaming station',price:179,cost:100,capacity:6,build:1700,unlock:6,color:'#cb8299',icon:'✥',description:'Gamer traffic. A natural partner for Accessories.'},
 audio:{name:'Audio',fixture:'Listening bar',price:129,cost:72,capacity:6,build:1400,unlock:7,color:'#80b998',icon:'♫',description:'A destination for enthusiasts and casual browsers.'}
});
export const PEOPLE = [
 {name:'Neighbour',quote:'Got stock?',patience:48,color:'#dcb26e',likes:'mobile'},
 {name:'Student',quote:'Need charger also.',patience:38,color:'#87b7cf',likes:'accessories'},
 {name:'Office worker',quote:'Can collect today?',patience:32,color:'#8297b4',likes:'computing'},
 {name:'Gamer',quote:'This one compatible?',patience:42,color:'#ae8ac8',likes:'gaming'},
 {name:'Tech enthusiast',quote:'Wah, nice.',patience:30,color:'#cf8394',likes:'audio'},
 {name:'Weekend parent',quote:'Can check another outlet?',patience:55,color:'#8bad73',likes:'mobile'}
];
export const STAFF = [
 {id:'jamie',name:'Jamie',role:'Cashier',trait:'Patient · steady hands',cost:450,wage:55,description:'Checkout takes 2.4s instead of 5s. Learns with each sale.'},
 {id:'aisha',name:'Aisha',role:'Stockroom',trait:'Organised · tech nerd',cost:650,wage:70,description:'Restocks low displays every 8s, if cash allows. Keeps the shop running while you are away.'},
 {id:'ben',name:'Ben',role:'Sales specialist',trait:'Friendly · gaming fan',cost:800,wage:65,description:'Helps indecisive shoppers. Faster browsing and more patient queues.'}
];
export const EVENTS = [
 {name:'An ordinary day',description:'A steady stream of neighbours. Take it at your own pace.',traffic:1,category:null},
 {name:'Payday weekend',description:'Payday just landed. More shoppers, a little less patience.',traffic:1.45,category:null},
 {name:'School holidays',description:'Keyboards, headsets, and parents asking very good questions.',traffic:1.2,category:'gaming'},
 {name:'Mall atrium fair',description:'The fair downstairs is sending curious browsers your way.',traffic:1.35,category:'accessories'},
 {name:'COMEX season',description:'Everyone is comparing laptops. Have your stock ready.',traffic:1.45,category:'computing'},
 {name:'New phone launch',description:'Got stock? Got stock? Got stock?',traffic:1.5,category:'mobile'}
];
export const GOALS = [
 {id:'first',title:'The first of many',description:'Make your first sale.',metric:'sales',target:1,reward:150},
 {id:'ten',title:'Getting the hang of it',description:'Serve 10 happy customers.',metric:'sales',target:10,reward:350},
 {id:'variety',title:'A little more choice',description:'Open two departments.',metric:'departments',target:2,reward:600},
 {id:'team',title:'Not doing this alone',description:'Hire your first teammate.',metric:'staff',target:1,reward:300},
 {id:'hundred',title:'A familiar face',description:'Complete 100 sales.',metric:'sales',target:100,reward:1200},
 {id:'flagship',title:'The bigger picture',description:'Reach store level 10.',metric:'level',target:10,reward:2500}
];
export const levelFor = xp => Math.min(50,1+Math.floor(Math.sqrt(Math.max(0,xp)/60)));
export const nextXP = level => level*level*60;
export const capacity = fixture => PRODUCTS[fixture.type].capacity + (fixture.level-1)*3;
export const money = value => '$'+Math.round(value).toLocaleString('en-SG');
