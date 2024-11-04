import * as React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { action, makeObservable, observable } from 'mobx';
import { observer } from "mobx-react-lite";
import styled from '@emotion/styled';
import { makeNoise2D } from "open-simplex-noise";

import * as Store from './store/store';
import { assignToGrid, ColorAlgo, colorAlgos, genNoiseGrid, getColor, NoiseGrid, NoiseGridConfig } from './utilts';
import { TilesGrid } from './tiles-grid';

// @todo UI preview image colorAlgo colors
// @todo test pure color images
// @todo test greyscale images with colorfull images
// @todo try get image colors with percentages (black, green, white, other), image brightness levels with percentages (white, black, grey, other)

function randomRange(a: number, b: number) {
    return a + Math.floor(Math.random() * (b - a));
}

async function loadProjectData(projectName: string): Promise<{images: Store.ApiImagesResponse[]; imageGrids: NoiseGrid[]}> {
    const imagesData = await Store.fetchProjectImages(projectName);
    console.log('imagesData', projectName, imagesData)

    const imageNoiseGrid = (colorAlgo: ColorAlgo) => {
        const gridCols = 10;
        // const gridRows = 5;
        const gridRows = Math.floor(imagesData.length / gridCols);
        const noiseGrid = genNoiseGrid({
            sizeX: gridCols,
            sizeY: gridRows,
            seed: 1,
            freq: .05,
        });
        const gridCells = gridCols * gridRows;

        if (gridCells > imagesData.length) throw new Error(`too few images (${imagesData.length} loaded, ${gridCells} needed)`);

        const images = imagesData.slice(0, gridCells).map(img => {
            // return {imageUrl: img.imagePath, color: Store.Color.fromRGB(...img.vibrantPal.Vibrant)};
            return new Store.Image(projectName, img);
        });
        // console.log('images', images)

        return new NoiseGrid({
            gridSize: { x: gridCols, y: gridRows },
            tileSize: 100,
            border: 10,
            noiseGrid,
            images,
            // colorAlgo: 'vibrant/dark_vibrant',
            colorAlgo: colorAlgo,
            colorProp: 'l',
        });
    };

    return {
        images: imagesData.map(imgData => {
            return imgData;
        }),
        imageGrids: (Object.keys(colorAlgos) as ColorAlgo[]).map(colorAlgo => {
            return imageNoiseGrid(colorAlgo);
        })
    };
}

const Wrapper = styled.div`

`;
const TopBar = styled.div`
    background-color: #eee;
    padding: 1em;
`;

const ContentWrapper = styled.div`
    display: flex;
    /* gap: 1em; */
`;

export const MainView: React.FC<{store: Store.Store}> = observer(({store}) => {
    const [grids, setGrids] = React.useState<NoiseGrid[]>([]);
    const [images, setImages] = React.useState<Store.ApiImagesResponse[]>([]);
    const [projectNames, setProjectNames] = React.useState<string[]>([]);
    const [colorMode, setColorMode] = React.useState<boolean>(false);
    const params = useParams<{ projectId: string }>();

    console.log("params", params)

    React.useEffect(() => {
        (async () => {
            // const projects = [
            //     'flowers',
            //     'test2',
            // ];

            // const res_grids = await Promise.all(projects.map(p => {
            //     return loadProjectData(p);
            // }));

            const projectsData = await Store.fetchProjects();

            setProjectNames(projectsData);

            if (params.projectId) {
                const {imageGrids, images} = await loadProjectData(params.projectId);

                setGrids(imageGrids);
                setImages(images);
            }

        })();
    }, []);

    React.useEffect(() => {
        (async () => {
            if (params.projectId) {
                const { imageGrids, images } = await loadProjectData(params.projectId);

                setGrids(imageGrids);
                setImages(images);
            }

        })();
    }, [params.projectId]);

    const {projectId} = params;
    if (!projectId) return (
        <p>Select project</p>
    )

    return (
        <Wrapper>
            <TopBar style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <button onClick={() => {
                    setColorMode(!colorMode);
                }}>{colorMode ? 'colors' : 'pictures'}</button>
            </TopBar>

            <ContentWrapper>
                <div>
                    <ul>
                        {
                            projectNames.map(projectName => {
                                return (
                                    <li key={projectName}>
                                        <NavLink style={props => props.isActive ? { fontWeight: 'bold' } : {}} to={`/projects/${projectName}`}>{projectName}</NavLink>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div>
                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                        {
                            images.map(image => {
                                return (
                                    <li key={image.path}>
                                        <div style={{display: 'flex'}}>
                                            <img src={Store.getImageUrl(projectId, image.path)} alt="" style={{maxHeight: 100}} />

                                            {
                                                (Object.keys(colorAlgos) as ColorAlgo[]).map(colorAlgo => {
                                                    const toRGBString = ([r, g, b]: [number, number, number]) => {
                                                        return `rgb(${r}, ${g}, ${b})`;
                                                    };
                                                    const color = (() => {
                                                        const parts = colorAlgo.split('/');

                                                        if (parts[0] == 'colorthief') {
                                                            return toRGBString(image.colorthief.color);
                                                        }
                                                        else if (parts[0] == 'colorthief_palette') {
                                                            const index = parseInt(parts[1]) - 1;

                                                            return toRGBString(image.colorthief.palette[index]);
                                                        }
                                                        else if (parts[0] == 'vibrant') {
                                                            const modes = {
                                                                vibrant: 'vibrant',
                                                                muted: 'muted',
                                                                dark_vibrant: 'darkVibrant',
                                                                dark_muted: 'darkMuted',
                                                                light_vibrant: 'lightVibrant',
                                                                light_muted: 'lightMuted',
                                                            }

                                                            const mode = parts[1] as keyof typeof modes;
                                                            // console.log('mode', mode)
                                                            const name = modes[mode] as keyof Store.ApiImagesResponse['vibrant'];

                                                            // console.log(name, image.vibrant[name])
                                                            return image.vibrant[name].hex;
                                                        }
                                                        else {
                                                            throw new Error("");
                                                        }
                                                    })();

                                                    return (
                                                        <div key={colorAlgo} style={{backgroundColor: color, width: 25, height: 100}}></div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div style={{padding: '2em'}}>
                    <div style={{marginTop: '2em'}}>
                        {
                            grids.map((grid, i) => {
                                return (
                                    <div key={i}>
                                        <div style={{marginBottom: '1em'}}>{grid.config.colorAlgo}</div>
                                        <TilesGrid grid={grid} color={colorMode} />
                                        <div style={{height: '2em'}}></div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </ContentWrapper>
        </Wrapper>
    );
});