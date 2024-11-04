import * as React from 'react';
import { observer } from "mobx-react-lite";

import * as Store from "./store/store";
import { getColor, NoiseGrid, NoiseGridConfig } from "./utilts";

export const GridTileImage: React.FC<{ grid: NoiseGrid, image: Store.Image; noiseValue: number; color?: boolean; }> = observer(props => {
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
                backgroundImage: `url("${image.imageUrl}")`,
                backgroundPosition: 'center',
                backgroundSize: 'cover'
            })
        }}>
            {/* {image.imageUrl} */}
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