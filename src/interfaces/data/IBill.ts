import { Category } from "@/handlers/DataParser";
import { Moment } from "moment";

// TODO: add more stats

export default interface IBill {
    name: string,
    date: Moment,
    mostCommonCategory: Category,
    numberOfItems: number,
    totalPrice: number
}