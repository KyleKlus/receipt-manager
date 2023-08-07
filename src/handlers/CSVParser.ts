export enum Category {
    Activities,
    Cleaning,
    Cosmetics,
    Dates,
    Food,
    Household,
    Hygiene,
    Hardware,
    Misc,
    Pet,
    Sport,
    Travel
}

const DEFAULT_CATEGORY: Category = Category.Food;


function _listToMatrix(list: string[], elementsPerSubArray: number) {
    const matrix: string[][] = [];
    let k = -1;

    for (let i = 0; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}