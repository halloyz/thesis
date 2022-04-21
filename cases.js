const A = { imageId: '1552132681648763', targetLat: 55.678210776097494, targetLng: 12.556136444185778 } //Route A
const B = { imageId: '973113553478933', targetLat: 55.68171833505691, targetLng: 12.551868533141779 } //Route B
const C = { imageId: '138782904971107', targetLat: 55.683848833687, targetLng: 12.546144297237} //Route C
//55.683848833687
//12.546144297237

const coords = {
    case1:
    {
        task1: A,
        task2: B,
        task3: C,
    },
    case2:
    {
        task1: A,
        task2: C,
        task3: B,
    },
    case3:
    {
        task1: B,
        task2: A,
        task3: C,
    },
    case4:
    {
        task1: B,
        task2: C,
        task3: A,
    },
    case5:
    {
        task1: C,
        task2: A,
        task3: B,
    },
    case6:
    {
        task1: C,
        task2: B,
        task3: A,
    },
    
}
window.cases = coords;