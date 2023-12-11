import { Category } from "@/handlers/DataParser";
import { Moment } from "moment";

export default interface IBill {
    date: Moment,
    mostCommonCategory: Category,
    numberOfItems: number,
    totalPrice: number
}