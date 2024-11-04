import { makeNoise2D } from "open-simplex-noise";
import * as Store from "./store/store";

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

export type ColorAlgo = 'colorthief/color' |
    'colorthief_palette/1' | 'colorthief_palette/2' | 'colorthief_palette/3' | 'colorthief_palette/4' | 'colorthief_palette/5' | 'colorthief_palette/6' |
    'vibrant/vibrant' | 'vibrant/muted' | 'vibrant/dark_vibrant' | 'vibrant/dark_muted' | 'vibrant/light_vibrant' | 'vibrant/light_muted'

type ColorProp = 'r' | 'g' | 'b' | 'h' | 's' | 'l';

export const colorAlgos: { [key in ColorAlgo]: (img: Store.Image) => Store.Color } = {
    'colorthief/color': img => img.colorthief.color,
    'colorthief_palette/1': img => img.colorthief.palette[0],
    'colorthief_palette/2': img => img.colorthief.palette[1],
    'colorthief_palette/3': img => img.colorthief.palette[2],
    'colorthief_palette/4': img => img.colorthief.palette[3],
    'colorthief_palette/5': img => img.colorthief.palette[4],
    'colorthief_palette/6': img => img.colorthief.palette[5],
    'vibrant/vibrant': img => img.vibrant.vibrant,
    'vibrant/muted': img => img.vibrant.muted,
    'vibrant/dark_vibrant': img => img.vibrant.darkVibrant,
    'vibrant/dark_muted': img => img.vibrant.darkMuted,
    'vibrant/light_vibrant': img => img.vibrant.lightVibrant,
    'vibrant/light_muted': img => img.vibrant.lightMuted,
}

export interface NoiseGridConfig {
    gridSize: { x: number; y: number };
    tileSize: number;
    border?: number;
    noiseGrid: number[][];
    images: Store.Image[];
    // colorAlgo: keyof Store.ApiImagesResponse['vibrant'];
    colorAlgo: ColorAlgo;
    colorProp: ColorProp;
}

export function getColor(config: NoiseGridConfig, image: Store.Image): Store.Color {
    return colorAlgos[config.colorAlgo](image);
}

export class NoiseGrid {
    readonly imagesGrid: Store.Image[][];

    constructor(readonly config: NoiseGridConfig) {
        this.imagesGrid = assignToGrid({
            grid: config.noiseGrid,
            list: config.images,
            // sortBy: img => img.vibrant[config.colorMode].r,
            sortBy: img => getColor(config, img)[config.colorProp],
        }).grid;
    }
}