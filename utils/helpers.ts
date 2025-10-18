// Utility function to get easter day
export function getEaster(year: number) {
    const f = Math.floor,
        // Golden Number - 1
        G = year % 19,
        C = f(year / 100),
        // related to Epact
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        // number of days from 21 March to the Paschal full moon
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        // weekday for the Paschal full moon
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        // number of days from 21 March to the Sunday on or before the Paschal full moon
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    return new Date(year, month - 1, day);
}

export function getSemlaDay(year: number) {
    const easterDate = getEaster(year);
    const semlaDate = new Date(easterDate);
    // Semmeldagen is 46 days before easter (which somehow means subtract 47 days)
    semlaDate.setDate(easterDate.getDate() - 47);
    return semlaDate;
}

export function shuffle<T>(arr: T[]): T[] {
    const newArr = arr.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr;
}

// Get random element from a list
export function getRandomElement<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function getRandomNumberBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
