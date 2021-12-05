import { makeNoise2D } from "open-simplex-noise";

interface GenNoiseGridOpts {
    sizeX: number;
    sizeY: number;
    seed: number;
    freq: number;
}

export function genNoiseGrid(opts: GenNoiseGridOpts): number[][] {
    const noise2D = makeNoise2D(opts.seed);

    return new Array(opts.sizeY).fill(undefined).map((_, y) => {
        return new Array(opts.sizeX).fill(undefined).map((_, x) => {
            const val = noise2D(x * opts.freq, y * opts.freq);

            return (val + 1) / 2;
        });
    });
}

interface AssignToGridOpts<T> {
    grid: number[][];
    list: T[];
    sortBy: (listItem: T) => number;
}

interface AssignToGridResult<T> {
    list: {
        value: T;
        x: number;
        y: number;
    }[];
    grid: T[][];
}

export function assignToGrid<T>(opts: AssignToGridOpts<T>): AssignToGridResult<T> {
    const gridRows = opts.grid.length;
    const gridCols = opts.grid[0].length;
    const gridItems = gridRows * gridCols;

    if (gridRows * gridCols != opts.list.length) throw new Error(`number of grid items must be the same as number of list items (given: ${gridItems} grid items, ${opts.list.length} list items)`);

    const gridExtended = opts.grid.map((row, y) => {
        return row.map((col, x) => {
            return { value: col, x, y };
        });
    });
    const gridFlatSorted = gridExtended.flat().sort((a, b) => a.value - b.value);
    const listSorted = opts.list.slice().sort((a, b) => opts.sortBy(a) - opts.sortBy(b));

    const resList = new Array(opts.list.length);
    const resGrid = new Array(gridRows).fill(undefined).map(() => new Array(gridCols));

    for (let i = 0; i < gridFlatSorted.length; i++) {
        const cell = gridFlatSorted[i];
        const listItem = listSorted[i];

        resList[i] = { value: listItem, x: cell.x, y: cell.y };
        resGrid[cell.y][cell.x] = listItem;
    }

    return {
        list: resList,
        grid: resGrid,
    };
}