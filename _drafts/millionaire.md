---
layout: post
title: YMP
tags: cryptography
---

<script>
// Protocol implementation as per
// https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.110.8816
// and
// https://en.wikipedia.org/wiki/Yao%27s_Millionaires%27_problem

function getRandInt(n) {
	return Math.floor(Math.random() * n);
}

function rand() {
	return BigInt(Math.floor(Math.random() * 2));
}

/*
 * range
 * n	gets n-th least significant bit (0-based)
 * [low, high] low..high (incl.), (little endian: high..low)
 */
function getBit(a, range) {
	if (typeof(range) == 'number')
		range = BigInt(range);

	if (typeof(range) == 'bigint')
		return (a >> range) & 0x1n;

	let low = BigInt(range[0]);
	let high = BigInt(range[1]);
	let mask = (0x1n << (high - low + 1n)) - 1n;
	return (a >> low) & mask;
}

function setBit(a, range, val) {
	if (typeof(range) == 'number')
		range = BigInt(range);

	if (typeof(range) == 'bigint') {
		a = a & ~(0x1n << range);
		x = typeof(val) == 'function' ? val() : val
		a = a | (BigInt(x) << range);
		return a;
	}

	let low = range[0];
	let high = range[1];
	for (let i = low; i <= high; ++i)
		a = setBit(a, i, val);
	return a;
}

function leftrot(n, r, w) {
	r = BigInt(r);
	w = BigInt(w);
	let full_mask = (0x1n << w) - 1n;
	let mask = ((0x1n << r) - 1n) << (w-r);

        // < r <  w-r <
	// ....|.......

	return
		((n << r) & full_mask)
		|
		((n & mask) >> (w-r));
}

var a = 10n;
var b = 30n;

// key len in OT
var k = 512;
var d = 20;


// Alice
let A = new Array(d);
for (let i = 0; i < d; ++i)
	A[i] = [0n, 0n];

let r = getRandInt(2*k);
let s = getRandInt(k);

for (let i = 0; i < d; ++i) {
	// set parts based on a[i]
	l = 1 - Number(getBit(a, i));
	A[i][l] = setBit(A[i][l], [0, 2*i + 1], rand);
	m = 2*i+2; // TODO check off by one
	A[i][l] = setBit(A[i][l], m+1, 1);
	A[i][l] = setBit(A[i][l], m+1, getBit(a, i));

	// randomize others
	A[i][0] = setBit(A[i][0], [s, k], rand);
	A[i][1] = setBit(A[i][1], [s, k], rand);
}

let S = new Array(d);
for (let i = 0; i < d; ++i)
	S[i] = setBit(0n, [0, k], rand);

ss = S.slice(0, d-1).map(x => getBit(x, [k-2, k-1]));
as = A.slice(0, d).map(x => getBit(x[0], [k-2, k-1]));
xorval = ss.reduce((acc, x) => acc ^= x, 0x11n);
xorval = as.reduce((acc, x) => acc ^= x, xorval);
S[d-1] = setBit(S[d-1], k-1, xorval & 0x1n);
S[d-1] = setBit(S[d-1], k-2, (xorval >> 1n)); // TODO check bit order

let A2 = new Array(d);
for (let i = 0; i < d; ++i) {
	A2[i] = Array(2);
	A2[i][0] = leftrot(A[i][0] ^ S[i], r, k);
	A2[i][1] = leftrot(A[i][1] ^ S[i], r, k);
}

// Alice does OT of A2[i][0] and A2[i][1]
// Bob receives A2[i][b[i]]

sendS = leftrot(S.reduce((acc, x) => acc ^= x, 0n), r, k);

// TODO Bob's evaluation

let R = new Array(d);
// Bob's _R_eceipt as array

res = R.reduce((acc, x) => acc ^= x, sendS);
console.log(res);

streak = 0;
for (let j = k; j >= 0; --j) {
	if (getBit(res, j))
		streak = 0;
	else
		++streak;
	if (streak > TODO_thr)
		console.log(j);
}


console.log(a+b);
console.log(a, b);
console.log(K);
</script>
