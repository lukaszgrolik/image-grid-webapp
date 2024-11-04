import * as React from 'react';
import { observer } from "mobx-react-lite";

import { NoiseGrid } from "./utilts";
import { GridTileImage } from "./grid-tile-image";

export const TilesGrid: React.FC<{ grid: NoiseGrid, color?: boolean }> = observer(props => {
    const { grid } = props;
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