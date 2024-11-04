import { action, computed, makeObservable, observable } from "mobx";

type RGB = [number, number, number];
export type VibrantColorObj = {
    hex: string;
    rgb: RGB;
    hsl: RGB;
}

export interface ApiImagesResponse {
    path: string;
    colorthief: {
        color: RGB;
        palette: RGB[];
    };
    vibrant: {
        vibrant: VibrantColorObj;
        muted: VibrantColorObj;
        darkVibrant: VibrantColorObj;
        darkMuted: VibrantColorObj;
        lightVibrant: VibrantColorObj;
        lightMuted: VibrantColorObj;
    };
}

export async function fetchProjects() {
    const data = await (await fetch(`http://localhost:3110/projects`)).json();

    return data as string[];
}

export async function fetchProjectImages(projectName: string) {
    const data = await (await fetch(`http://localhost:3110/projects/${projectName}/images`)).json();

    return data as ApiImagesResponse[];
}

export class Store {
    readonly images: Image[] = [];
}

interface Rgb2hslResult {
    h: number;
    s: number;
    l: number;
}

function rgb2hsl(r: number, g: number, b: number): Rgb2hslResult {
    // let rr, gg, bb, h, s;
    const rabs = r / 255;
    const gabs = g / 255;
    const babs = b / 255;

    const l = Math.max(rabs, gabs, babs);
    const diff = l - Math.min(rabs, gabs, babs);
    const diffc = (c: number) => (l - c) / 6 / diff + 1 / 2;
    // const percentRoundFn = (num: number) => Math.round(num * 100) / 100;

    let h: number = 0;
    let s: number = 0;

    if (diff == 0) {
        h = 0;
        s = 0;
    }
    else {
        s = diff / l;
        const rr = diffc(rabs);
        const gg = diffc(gabs);
        const bb = diffc(babs);

        if (rabs === l) {
            h = bb - gg;
        }
        else if (gabs === l) {
            h = (1 / 3) + rr - bb;
        }
        else if (babs === l) {
            h = (2 / 3) + gg - rr;
        }

        if (h < 0) {
            h += 1;
        }
        else if (h > 1) {
            h -= 1;
        }
    }

    return {
        h: Math.round(h * 360),
        // s: percentRoundFn(s * 100),
        s: s,
        // l: percentRoundFn(v * 100)
        l: l
    };
}

export class Color {
    static fromRGB(r: number, g: number, b: number) {
        const c = new Color();

        c.setRGB(r, g, b);

        const { h, s, l } = rgb2hsl(r, g, b);
        c.setHSL(h, s, l);

        return c;
    }

    static fromHSL(h: number, s: number, l: number) {
        const c = new Color();

        c.setHSL(h, s, l);

        // const {r, g, b} = hsl2rgb(h, s, l);
        // c.setRGB(r, g, b);

        return c;
    }

    // hsl: Rgb2hslResult = {h: 0, s: 0, l: 0};
    h = 0;
    s = 0;
    l = 0;

    r = 0;
    g = 0;
    b = 0;

    private setHSL(h: number, s: number, l: number) {
        this.h = h;
        this.s = s;
        this.l = l;
    }

    private setRGB(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    cssHsl(): string {
        return `hsl(${this.h}, ${this.s * 100}%, ${this.l * 100}%)`;
    }
}

export function getImageUrl(projectName: string, imagePath: string) {
    return `http://localhost:3110/assets/${projectName}${imagePath}`;
}

export class Image {
    readonly imagePath: string;
    readonly colorthief: {
        color: Color;
        palette: Color[];
    };
    readonly vibrant: {
        [K in keyof ApiImagesResponse['vibrant']]: Color;
    };

    constructor(private readonly projectName: string, body: ApiImagesResponse) {
        this.imagePath = body.path;
        this.colorthief = {
            color: Color.fromRGB(...body.colorthief.color),
            palette: body.colorthief.palette.map(c => Color.fromRGB(...c))
        };

        const vibrantEntries = Object.entries(body.vibrant).map(([mode, c]) => [mode, Color.fromRGB(...c.rgb)]);
        this.vibrant = Object.fromEntries(vibrantEntries);
    }

    get imageUrl() {
        return getImageUrl(this.projectName, this.imagePath);
    }
}