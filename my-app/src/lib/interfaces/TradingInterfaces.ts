export interface IItem {
    name: string;
    description: string;
    image: string;
    price: number;
    quantity: number;
}

export interface IActionItem {
    to: string; //socket connection
    item: IItem;
    action: "Offer" | "Remove";
}