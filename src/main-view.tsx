import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action, makeObservable, observable } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import { makeNoise2D } from "open-simplex-noise";

import * as Store from './store/store';



function randomRange(a: number, b: number) {
    return a + Math.floor(Math.random() * (b - a));
}

abstract class Tile {
    // abstract get color(): string;
}

class ColorTile extends Tile {
    readonly h: number;
    readonly s: number;
    readonly l: number;

    constructor(opts: {h: number, s: number, l: number}) {
        super();

        this.h = opts.h;
        this.s = opts.s;
        this.l = opts.l;
    }

    get color() {
        return `hsl(${this.h}, ${this.s * 100}%, ${this.l * 100}%)`;
    }
}

class ImageTile extends Tile {
    // constructor() {

    // }

    // get color() {

    // }
}

const config = {
    gridSize: { x: 10, y: 5 },
    tileSize: 100,
};

const colors = new Array(config.gridSize.x * config.gridSize.y).fill(undefined).map(() => {
    // return `hsl(${randomRange(0, 360)}, 50%, 50%)`;
    return Store.Color.fromHSL(randomRange(0, 360), .5, .5);
});

const noise2D = makeNoise2D(1);

const freq = .1;
const valuesGrid = new Array(config.gridSize.x).fill(undefined).map((_, x) => {
    return new Array(config.gridSize.y).fill(undefined).map((_, y) => {
        const val = (noise2D(x * freq, y * freq) + 1) / 2;
        return {id: `${x}x${y}`, value: val};
    });
});
const valuesFlatSorted = valuesGrid.flat().sort((a, b) => a.value - b.value);

const colorsSorted = colors.slice().sort((a, b) => a.h - b.h);
const colorsByValue = Object.fromEntries(valuesFlatSorted.map((val, i) => {
    return [val.id, colorsSorted[i]];
}));

const TilesGrid = observer(() => {
    return (
        <div style={{ position: 'relative', height: config.gridSize.y * config.tileSize }}>
            {
                new Array(config.gridSize.y).fill(undefined).map((_, y) => {
                    return (
                        <div key={y}>
                            {
                                new Array(config.gridSize.x).fill(undefined).map((_, x) => {
                                    const { tileSize } = config;
                                    const value = valuesGrid[x][y];
                                    const color = colorsByValue[value.id];

                                    return (
                                        <div key={x}>
                                            <div style={{
                                                // backgroundColor: `hsl(${randomRange(0, 360)}, 50%, 50%)`,
                                                backgroundColor: `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`,
                                                width: tileSize,
                                                height: tileSize,
                                                position: 'absolute',
                                                left: tileSize * x,
                                                top: tileSize * y,
                                            }}>{value.value.toFixed(3)}</div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    );
                })
            }
        </div>
    );
})

const Wrapper = styled.div`

`;

export const MainView: React.FC<{store: Store.Store}> = observer(({store}) => {
    React.useEffect(() => {
        (async () => {
            const imagesData = await Store.fetchImages();
            console.log('imagesData', imagesData)
        })();
    }, []);

    return (
        <Wrapper>
            <div>images</div>
            <TilesGrid />

            <div>colors</div>
            <TilesGrid />
        </Wrapper>
    );
});