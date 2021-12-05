import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action, makeObservable, observable } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import { makeNoise2D } from "open-simplex-noise";

import * as Store from './store/store';
import { assignToGrid, genNoiseGrid } from './utilts';

function randomRange(a: number, b: number) {
    return a + Math.floor(Math.random() * (b - a));
}

interface NoiseGridConfig {
    gridSize: { x: number; y: number };
    tileSize: number;
    noiseGrid: number[][];
    images: Store.Image[];
    colorMode: keyof Store.ApiImagesResponse['vibrantPalette'];
}

class NoiseGrid {
    readonly imagesGrid: Store.Image[][];

    constructor(readonly config: NoiseGridConfig) {
        this.imagesGrid = assignToGrid({
            grid: config.noiseGrid,
            list: config.images,
            sortBy: img => img.vibrantPalette[config.colorMode].r,
        }).grid;
    }

}

const GridTileImage: React.FC<{ grid: NoiseGrid, image: Store.Image; noiseValue: number; color?: boolean; }> = observer(props => {
    const { grid, image, noiseValue, color } = props;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            // objectFit: 'cover',
            // objectPosition: 'center',
            ...(color ? {
                backgroundColor: image.vibrantPalette[grid.config.colorMode].cssHsl(),
            } : {
                backgroundImage: `url(${image.imageUrl})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover'
            })
        }}>
            {/* {noiseValue.toFixed(3)} */}
            {/* <img
                style={{
                    width: '100%',
                }}
                src={}
            /> */}
        </div>
    );
});

const TilesGrid: React.FC<{ grid: NoiseGrid, color?: boolean }> = observer(props => {
    const {grid} = props;

    return (
        <div style={{ position: 'relative', height: grid.config.gridSize.y * grid.config.tileSize }}>
            {
                new Array(grid.config.gridSize.y).fill(undefined).map((_, y) => {
                    return (
                        <div key={y}>
                            {
                                new Array(grid.config.gridSize.x).fill(undefined).map((_, x) => {
                                    const { tileSize } = grid.config;
                                    const image = grid.imagesGrid[y][x];
                                    const noiseValue = grid.config.noiseGrid[y][x];

                                    return (
                                        <div key={x}>
                                            <div style={{
                                                width: tileSize,
                                                height: tileSize,
                                                position: 'absolute',
                                                left: tileSize * x,
                                                top: tileSize * y,
                                            }}>
                                                <GridTileImage grid={grid} image={image} noiseValue={noiseValue} color={props.color} />
                                            </div>
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
    const [imageNoiseGrid, setImageNoiseGrid] = React.useState<NoiseGrid | null>(null);

    React.useEffect(() => {
        (async () => {
            const imagesData = await Store.fetchImages();
            console.log('imagesData', imagesData)

            const imageNoiseGrid = (() => {
                const noiseGrid = genNoiseGrid({
                    sizeX: 10,
                    sizeY: 5,
                    seed: 1,
                    freq: .05,
                });
                const gridCols = 10;
                const gridRows = 5;
                const gridCells = gridCols * gridRows;

                if (gridCells > imagesData.length) throw new Error(`too few images (${imagesData.length} loaded, ${gridCells} needed)`);

                const images = imagesData.slice(0, gridCells).map(img => {
                    // return {imageUrl: img.imagePath, color: Store.Color.fromRGB(...img.vibrantPal.Vibrant)};
                    return new Store.Image(img);
                });
                // console.log('images', images)

                return new NoiseGrid({
                    gridSize: { x: 10, y: 5 },
                    tileSize: 100,
                    noiseGrid,
                    images,
                    colorMode: 'Vibrant',
                });
            })();

            setImageNoiseGrid(imageNoiseGrid);
        })();
    }, []);

    return (
        <Wrapper>
            <div>images</div>
            {
                imageNoiseGrid
                &&
                <div>
                    <TilesGrid grid={imageNoiseGrid} />
                    <TilesGrid grid={imageNoiseGrid} color={true} />
                </div>
            }
        </Wrapper>
    );
});