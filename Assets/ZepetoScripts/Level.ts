export interface LevelData{
    level: number,
    requireScore: number,
    accumulateScore: number,
}

export const ExpTable: LevelData[] = [
    { level: 2, requireScore: 2, accumulateScore: 2,},
    { level: 3, requireScore: 2, accumulateScore: 4,},
    { level: 4, requireScore: 2, accumulateScore: 6,},
    { level: 5, requireScore: 2, accumulateScore: 8,},
    { level: 6, requireScore: 2, accumulateScore: 10,},
    { level: 7, requireScore: 3, accumulateScore: 13,},
    { level: 8, requireScore: 3, accumulateScore: 16,},
    { level: 9, requireScore: 3, accumulateScore: 19,},
    { level: 10, requireScore: 3, accumulateScore: 22,},
    { level: 11, requireScore: 3, accumulateScore: 25,},
    { level: 12, requireScore: 5, accumulateScore: 30,},
    { level: 13, requireScore: 5, accumulateScore: 35,},
    { level: 14, requireScore: 5, accumulateScore: 40,},
    { level: 15, requireScore: 5, accumulateScore: 45,},
    { level: 16, requireScore: 5, accumulateScore: 50,},
    { level: 17, requireScore: 8, accumulateScore: 58,},
    { level: 18, requireScore: 8, accumulateScore: 66,},
    { level: 19, requireScore: 8, accumulateScore: 74,},
    { level: 20, requireScore: 8, accumulateScore: 82,},
    { level: 21, requireScore: 8, accumulateScore: 90,},
    { level: 22, requireScore: 16, accumulateScore: 106,},
    { level: 23, requireScore: 16, accumulateScore: 122,},
    { level: 24, requireScore: 16, accumulateScore: 138,},
    { level: 25, requireScore: 16, accumulateScore: 155,},
]

export interface TrainCountData{
    count: number,
    requireScore: number,
    accumulateScore: number,
}

export const TrainCountTable: TrainCountData[] = [
    { count: 2, requireScore: 10, accumulateScore: 10,},
    { count: 3, requireScore: 15, accumulateScore: 25,},
    { count: 4, requireScore: 25, accumulateScore: 50,},
    { count: 5, requireScore: 40, accumulateScore: 90,},
]
