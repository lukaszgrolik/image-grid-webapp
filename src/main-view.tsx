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

type ColorAlgo = 'colorthief/color' |
    'colorthief_palette/1' | 'colorthief_palette/2' | 'colorthief_palette/3' | 'colorthief_palette/4' | 'colorthief_palette/5' | 'colorthief_palette/6' |
    'vibrant/vibrant' | 'vibrant/muted' | 'vibrant/dark_vibrant' | 'vibrant/dark_muted' | 'vibrant/light_vibrant' | 'vibrant/light_muted'

type ColorProp = 'r' | 'g' | 'b' | 'h' | 's' | 'l';

const colorAlgos: {[key in ColorAlgo]: (img: Store.Image) => Store.Color} = {
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

interface NoiseGridConfig {
    gridSize: { x: number; y: number };
    tileSize: number;
    border?: number;
    noiseGrid: number[][];
    images: Store.Image[];
    // colorAlgo: keyof Store.ApiImagesResponse['vibrant'];
    colorAlgo: ColorAlgo;
    colorProp: ColorProp;
}

function getColor(config: NoiseGridConfig, image: Store.Image): Store.Color {
    return colorAlgos[config.colorAlgo](image);
}

class NoiseGrid {
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
                backgroundColor: getColor(grid.config, image).cssHsl(),
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
    const border = grid.config.border || 0;
    const gridHeight = grid.config.gridSize.y * grid.config.tileSize + border * (grid.config.gridSize.y - 1);

    return (
        <div style={{ position: 'relative', height: gridHeight }}>
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
                                                left: tileSize * x + border * x,
                                                top: tileSize * y + border * y,
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

async function loadProjectData(projectName: string) {
    const imagesData = await Store.fetchProjectImages(projectName);
    console.log('imagesData', projectName, imagesData)

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
            return new Store.Image(projectName, img);
        });
        // console.log('images', images)

        return new NoiseGrid({
            gridSize: { x: 10, y: 5 },
            tileSize: 100,
            border: 10,
            noiseGrid,
            images,
            colorAlgo: 'vibrant/dark_vibrant',
            colorProp: 'l',
        });
    })();

    return imageNoiseGrid;
}

const Wrapper = styled.div`

`;

export const MainView: React.FC<{store: Store.Store}> = observer(({store}) => {
    const [grids, setGrids] = React.useState<NoiseGrid[]>([]);

    React.useEffect(() => {
        (async () => {
            const projects = [
                'flowers',
                'test2',
            ];

            const res_grids = await Promise.all(projects.map(p => {
                return loadProjectData(p);
            }));

            setGrids(res_grids);
        })();
    }, []);

    return (
        <Wrapper>
            {
                grids.map((grid, i) => {
                    return (
                        <div key={i}>
                            <TilesGrid grid={grid} />
                            <div style={{height: 10}}></div>

                            <TilesGrid grid={grid} color={true} />
                            <div style={{ height: 10 }}></div>
                        </div>
                    );
                })
            }
        </Wrapper>
    );
});