export type ObjectKind='flower'|'foliage'|'vessel'|'candle'|'plate'|'glass'|'napkin'|'paper'|'sign'|'arch'|'drape'|'plinth'|'favor'|'light';
export type CatalogItem={id:string;name:string;kind:ObjectKind;category:string;color:string;width:number;depth:number;height:number;estimate:number;unit:string;pack:number;minutes:number;material:string;note:string;season?:string};
const rows:[string,string,ObjectKind,string,string,number,number,number,number,string,number,number,string,string][]=[
['garden-rose','Garden rose','flower','Flowers','#d7a79a',11,11,28,3.2,'stems',12,1.5,'fresh','Confirm cultivar, head size and opening time with your grower.'],
['spray-rose','Spray rose','flower','Flowers','#eee0cd',8,8,24,2.2,'stems',10,1.5,'fresh','One stem can carry several smaller blooms.'],
['hydrangea','Hydrangea','flower','Flowers','#eee8d8',20,20,24,4.5,'stems',5,2,'fresh','Allow hydration time and confirm conditioning instructions.'],
['ranunculus','Ranunculus','flower','Flowers','#d8ad83',7,7,25,2.5,'stems',10,1.5,'fresh','Fragile stems: trial the mechanics before a full batch.'],
['lisianthus','Lisianthus','flower','Flowers','#eee5d8',8,8,29,2.4,'stems',10,1.5,'fresh','Use the actual flower head size for your trial.'],
['peony','Peony','flower','Flowers','#dcb4b5',15,15,30,6,'stems',5,2,'fresh','Season and opening time vary; agree a substitute.'],
['dahlia','Dahlia','flower','Flowers','#bf8264',14,14,30,4,'stems',5,2,'fresh','Heads bruise easily; transport upright.'],
['carnation','Carnation','flower','Flowers','#d9c5b6',8,8,25,1.1,'stems',25,1,'fresh','An adaptable alternative; check color in natural light.'],
['silk-rose','Silk rose','flower','Flowers','#e2c4b5',11,11,28,2.6,'stems',6,1,'silk','Reusable stems; confirm visible finish and scale.'],
['eucalyptus','Eucalyptus','foliage','Greenery','#7b8f70',24,18,33,1.4,'stems',10,1,'fresh','Follow supplier conditioning advice.'],
['ruscus','Italian ruscus','foliage','Greenery','#53704d',18,14,37,1.4,'stems',10,1,'fresh','Trim to preserve guest sightlines.'],
['olive','Olive branch','foliage','Greenery','#718167',22,18,38,1.8,'stems',10,1,'fresh','Use a trial to check branch spread.'],
['compote','Compote vessel','vessel','Vessels','#bdac8d',23,23,16,12,'pieces',1,2,'ceramic','Check water-tightness and internal mechanics.'],
['bud-vase','Bud vase','vessel','Vessels','#d2d6cd',8,8,20,4,'pieces',6,1,'glass','Confirm neck opening and stability.'],
['cylinder-vase','Cylinder vase','vessel','Vessels','#d5ddd1',12,12,24,7,'pieces',6,1,'glass','Confirm actual diameter before ordering.'],
['taper','Taper candle & holder','candle','Lighting','#f5e8ca',9,9,32,5,'sets',6,1,'wax','Check venue flame, drip and holder rules.'],
['votive','Votive candle','candle','Lighting','#e7d4b1',7,7,8,2.5,'pieces',12,.5,'wax','Check venue candle-cover requirements.'],
['hurricane','Covered candle','candle','Lighting','#ece2cc',13,13,26,9,'pieces',4,1,'wax','Use the manufacturer’s clearance instructions.'],
['dinner-plate','Dinner plate','plate','Tableware','#f3f0e8',27,27,2,1.5,'pieces',12,.5,'ceramic','Measure the actual rental plate.'],
['charger','Charger plate','plate','Tableware','#b79764',33,33,2,2,'pieces',12,.5,'metal','Allow clearance from neighboring settings.'],
['goblet','Water goblet','glass','Tableware','#d7dfcd',9,9,17,1.4,'pieces',12,.5,'glass','Include enough clearance to lift the glass.'],
['wine-glass','Wine glass','glass','Tableware','#edf0e7',8,8,22,1.5,'pieces',12,.5,'glass','Confirm rental stock and breakage terms.'],
['linen-napkin','Linen napkin','napkin','Linen','#aab29b',11,24,1,1.5,'pieces',10,1,'linen','Dimensions describe the folded napkin.'],
['menu','Menu','paper','Paper','#f3eee1',12.7,17.8,.05,.8,'pieces',25,.5,'paper','Attach a professional design preview and print PDF.'],
['place-card','Place card','paper','Paper','#f1ece0',9,5,.05,.4,'pieces',25,.5,'paper','Check names and final guest assignments.'],
['table-number','Table number','sign','Paper','#eee6d4',10,.3,15,2,'pieces',1,.5,'paper','Check readability across the table.'],
['welcome-sign','Welcome sign','sign','Signs','#e8ddca',45.7,.6,61,30,'pieces',1,20,'board','Artwork is created with your design provider.'],
['acrylic-sign','Acrylic sign','sign','Signs','#e0ddce',45.7,.5,61,35,'pieces',1,25,'acrylic','Confirm stand, weight and transport protection.'],
['arch','Ceremony arch','arch','Decor','#ac9975',200,60,230,120,'pieces',1,40,'metal','Follow the manufacturer’s load, ballast and installation instructions.'],
['drape','Draped fabric','drape','Decor','#e8dfca',100,20,230,25,'panels',1,15,'fabric','Confirm venue attachment and flame-retardant requirements.'],
['plinth','Display plinth','plinth','Decor','#d9d4c7',40,40,90,35,'pieces',1,5,'wood','Check load rating and stability with the supplier.'],
['favor-box','Favor box','favor','Favors','#ded0b7',8,8,10,1.8,'pieces',25,3,'paper','Plan one trial, then batch filling and assembly.'],
['uplight','LED uplight','light','Lighting','#5d6557',18,18,23,20,'pieces',1,5,'LED','Record power, battery runtime and venue placement rules.']
];
export const STUDIO_CATALOG:CatalogItem[]=rows.map(([id,name,kind,category,color,width,depth,height,estimate,unit,pack,minutes,material,note])=>({id,name,kind,category,color,width,depth,height,estimate,unit,pack,minutes,material,note}));
export const catalogItem=(id:string)=>STUDIO_CATALOG.find(c=>c.id===id);
export const PALETTES=[{name:'Garden linen',colors:['#f2ebdf','#d7a79a','#ded1b9','#9aaa88']},{name:'Rose evening',colors:['#eee5db','#bc858a','#e1c7bb','#7c8b72']},{name:'Butter & olive',colors:['#f4eddb','#e4c785','#e2d1af','#7d8b63']},{name:'Modern ivory',colors:['#f1eee7','#e4dece','#c9c1b4','#88937d']}];
export const DESIGN_PROVIDERS=[{id:'canva',name:'Canva',mode:'Editable designs & exports',description:'A broad professional template library. Customize in Canva, then bring the actual artwork into Studio.',stationery:'https://www.canva.com/templates/s/wedding/',website:'https://www.canva.com/create/wedding-websites/'},{id:'minted',name:'Minted',mode:'Coordinated suites',description:'Artist-designed wedding stationery with matching wedding websites. Keep your selected suite together.',stationery:'https://www.minted.com/wedding-invitations',website:'https://www.minted.com/category/wedding/wedding-websites'},{id:'joy',name:'Joy',mode:'Invitations & websites',description:'Build your wedding website and choose coordinated invitations with Joy.',stationery:'https://withjoy.com/wedding-invitations/',website:'https://withjoy.com/wedding-website/'},{id:'bliss-bone',name:'Bliss & Bone',mode:'Design-led websites & paper',description:'Explore wedding websites and stationery with a distinctive visual style.',stationery:'https://blissandbone.com/',website:'https://blissandbone.com/wedding-website'}];
