import 'mocha';
import * as should from 'should';

import { assignToGrid, genNoiseGrid } from '../src/utilts';

describe('genNoiseGrid', () => {
    it('returns valid result', () => {
        const res = genNoiseGrid({
            sizeX: 5,
            sizeY: 5,
            seed: 1,
            freq: 1,
        });

        should(res.length).equal(5);

        res.forEach(y => {
            should(y.length).equal(5);
        });
    });

    it('generates values from 0 to 1')
});

describe('assignToGrid', () => {
    it('assigns numbers', () => {
        const res = assignToGrid({
            grid: [
                [1, 2],
                [3, 4],
            ],
            list: [10, 50, 100, 200],
            sortBy: x => x,
        });

        should(res.list).deepEqual([
            {value: 10, x: 0, y: 0},
            {value: 50, x: 1, y: 0},
            {value: 100, x: 0, y: 1},
            {value: 200, x: 1, y: 1},
        ]);
        should(res.grid).deepEqual([
            [10, 50],
            [100, 200]
        ]);
    });

    it('assigns sorted objects for sorted grid', () => {
        const res = assignToGrid({
            grid: [
                [1, 2],
                [3, 4],
            ],
            list: [{val: 10}, {val: 50}, {val: 100}, {val: 200}],
            sortBy: x => x.val,
        });

        should(res.list).deepEqual([
            { value: {val: 10}, x: 0, y: 0 },
            { value: {val: 50}, x: 1, y: 0 },
            { value: {val: 100}, x: 0, y: 1 },
            { value: {val: 200}, x: 1, y: 1 },
        ]);
        should(res.grid).deepEqual([
            [{ val: 10 }, { val: 50 }],
            [{ val: 100 }, { val: 200 }]
        ]);
    });

    it('assigns unsorted objects for unsorted grid', () => {
        const res = assignToGrid({
            grid: [
                [1, 3],
                [4, 2],
            ],
            list: [200, 100, 50, 10],
            sortBy: x => x,
        });

        should(res.list).deepEqual([
            { value: 10, x: 0, y: 0 },
            { value: 50, x: 1, y: 1 },
            { value: 100, x: 1, y: 0 },
            { value: 200, x: 0, y: 1 },
        ]);
        should(res.grid).deepEqual([
            [10, 100],
            [200, 50]
        ]);
    });
});