export type Category = 'tea'|'snacks'|'bengali'|'mains'|'desserts'|'cold';
export type Customization = { id:string; label:string; options:{id:string;label:string;delta:number}[] };
export type MenuItem = { id:string; bn:string; en:string; category:Category; description:string; price:number; image:string; tags:string[]; time:number; veg:boolean; bestseller?:boolean; featured?:boolean; ingredients:string[]; allergens?:string; customizations?:Customization[] };
export type CartItem = { key:string; itemId:string; quantity:number; customizations:Record<string,string>; unitPrice:number };
export type Order = { id:string; items:CartItem[]; mode:'dinein'|'takeaway'|'delivery'; details:Record<string,string>; totals:Totals; createdAt:number; source?:'demo'|'server' };
export type Totals = { subtotal:number; packaging:number; delivery:number; discount:number; total:number };
