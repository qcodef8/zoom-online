// ? find2
Array.prototype.find2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = 0; i < length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return this[i];
        }
    }
    return undefined;
};

console.log("--- find2 ---");
console.log([, , 3, 4].find2((v) => v > 2)); // 3
console.log([1, 2, 3, 4].find2((v) => v === 2)); // 2
console.log([, , ,].find2((v) => v > 0)); // undefined

// ? filter2
Array.prototype.filter2 = function (callback, thisArg) {
    const length = this.length;
    const result = [];
    for (let i = 0; i < length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            result.push(this[i]);
        }
    }
    return result;
};

console.log("--- filter2 ---");
console.log([1, 2, 3, 4].filter2((v) => v % 2 === 0)); // [2, 4]
console.log([, 2, , 4].filter2((v) => v)); // [2, 4]
console.log([, , ,].filter2((v) => true)); // []

// ? includes2
Array.prototype.includes2 = function (searchElement, fromIndex = 0) {
    const length = this.length;
    if (fromIndex < 0) fromIndex = Math.max(length + fromIndex, 0);
    for (let i = fromIndex; i < length; i++) {
        const current = this[i];
        if (
            current === searchElement ||
            (Number.isNaN(current) && Number.isNaN(searchElement))
        ) {
            return true;
        }
    }
    return false;
};

console.log("--- includes2 ---");
console.log([1, 2, 3].includes2(2)); // true
console.log([1, 2, NaN].includes2(NaN)); // true
console.log([1, 2, 3].includes2(4)); // false

// ? findIndex2
Array.prototype.findIndex2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = 0; i < length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return i;
        }
    }
    return -1;
};

console.log("--- findIndex2 ---");
console.log([10, 20, 30].findIndex2((v) => v === 20)); // 1
console.log([, , 5, 6].findIndex2((v) => v > 4)); // 2
console.log([, , ,].findIndex2((v) => true)); // -1

// ? findLast2
Array.prototype.findLast2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = length - 1; i >= 0; i--) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return this[i];
        }
    }
    return undefined;
};

console.log("--- findLast2 ---");
console.log([1, 2, 3, 4].findLast2((v) => v % 2 === 0)); // 4
console.log([, , 5, 6].findLast2((v) => v > 4)); // 6
console.log([, , ,].findLast2((v) => true)); // undefined

// ? findLastIndex2
Array.prototype.findLastIndex2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = length - 1; i >= 0; i--) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return i;
        }
    }
    return -1;
};

console.log("--- findLastIndex2 ---");
console.log([1, 2, 3, 4].findLastIndex2((v) => v % 2 === 0)); // 3
console.log([, , 5, 6].findLastIndex2((v) => v > 4)); // 3
console.log([, , ,].findLastIndex2((v) => true)); // -1

// ? every2
Array.prototype.every2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = 0; i < length; i++) {
        if (i in this && !callback.call(thisArg, this[i], i, this)) {
            return false;
        }
    }
    return true;
};

console.log("--- every2 ---");
console.log([2, 4, 6].every2((v) => v % 2 === 0)); // true
console.log([2, 4, 5].every2((v) => v % 2 === 0)); // false
console.log([, , ,].every2((v) => false)); // true

// ? some2
Array.prototype.some2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = 0; i < length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            return true;
        }
    }
    return false;
};

console.log("--- some2 ---");
console.log([1, 3, 5].some2((v) => v % 2 === 0)); // false
console.log([1, 3, 4].some2((v) => v % 2 === 0)); // true
console.log([, , ,].some2((v) => true)); // false

// ? forEach2
Array.prototype.forEach2 = function (callback, thisArg) {
    const length = this.length;
    for (let i = 0; i < length; i++) {
        if (i in this) {
            callback.call(thisArg, this[i], i, this);
        }
    }
};

console.log("--- forEach2 ---");
[1, 2, 3].forEach2((v, i) => console.log(`Index ${i}:`, v));
[, , 5].forEach2((v, i) => console.log(`Sparse ${i}:`, v));
["a", , "c"].forEach2(console.log);

// ? map2
Array.prototype.map2 = function (callback, thisArg) {
    const length = this.length;
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        if (i in this) {
            result[i] = callback.call(thisArg, this[i], i, this);
        }
    }
    return result;
};

console.log("--- map2 ---");
console.log([1, 2, 3].map2((v) => v * 2)); // [2, 4, 6]
console.log([, 2, , 4].map2((v) => v * 2)); // [empty, 4, empty, 8]
console.log([, , ,].map2((v) => v)); // [empty × 3]

// ? reduce2
Array.prototype.reduce2 = function (callback, initialValue) {
    const length = this.length;
    let i = 0;
    let accumulator;

    if (arguments.length >= 2) {
        accumulator = initialValue;
    } else {
        while (i < length && !(i in this)) i++;
        if (i >= length)
            throw new TypeError("Reduce of empty array with no initial value");
        accumulator = this[i++];
    }

    for (; i < length; i++) {
        if (i in this) {
            accumulator = callback(accumulator, this[i], i, this);
        }
    }

    return accumulator;
};

console.log("--- reduce2 ---");
console.log([1, 2, 3].reduce2((acc, v) => acc + v, 0)); // 6
console.log([, , 3, 4].reduce2((acc, v) => acc + v, 1)); // 8
console.log([1, 2, 3].reduce2((acc, v) => acc + v)); // 6
