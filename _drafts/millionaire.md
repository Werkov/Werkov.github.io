---
layout: post
title: YMP
tags: cryptography
---

See also https://blog.goodaudience.com/understanding-zero-knowledge-proofs-through-simple-examples-df673f796d99

<script>
// Protocol implementation as per
// https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.110.8816
// - paper indexing:
//   <-->  0..k-1
//   ^v    1..d
// - my indexing:
//   <-->  0..k-1
//   ^v    0..d-1
// and
// https://en.wikipedia.org/wiki/Yao%27s_Millionaires%27_problem

function getRandInt(n) {
	return Math.floor(Math.random() * n);
	if (typeof(getRandInt.seed) == 'undefined')
		getRandInt.seed = 42;
	// TODO replace with crypto API
	ret = (getRandInt.seed * 16807) % ((1 << 31) - 1);
	getRandInt.seed = ret;
	return ret % n;
}

function randBit() {
	return getRandInt(2);
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

// TODO consider high-boundary exclusive
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

/*
 * n	input value
 * r	how many bits to rotate
 * w	wraparound width in bit
 */
function leftrot(n, r, w) {
	r = BigInt(r);
	w = BigInt(w);
	let full_mask = (0x1n << w) - 1n;
	let mask = ((0x1n << r) - 1n) << (w-r);

	// < r <  w-r <
	// ....|.......

	return	((n << r) & full_mask)
		|
		((n & mask) >> (w-r));
}

function hexArray(a) {
	if (typeof(a) == 'number' || typeof(a) == 'bigint')
		return a.toString(16);
	let res = new Array();
	for (let i in a) {
		res[i] = hexArray(a[i]);
	}
	return res;
}

var a = 49n;
var b = 51n;

// key len in OT
// must hold: k > d*d
var k = 512;
var d = 20;

var k = 64;
var d = 6;

console.log(
	"a:\t", a.toString(16),
	"b:\t", b.toString(16)
);

// Alice
let A = new Array(d);
for (let i = 0; i < d; ++i)
	A[i] = [0n, 0n];

// XXX paper states 2*k but makes no sense for rotations of k-bit numbers
let r = getRandInt(k);
// debug rot: while ((r = getRandInt(k)) % 4);

// paper says "large enough" without specification
// generate in [2*d, (k-1)] (inclusive)
let s = 2*d + getRandInt(k-2*d);

console.log(
	"r = ", r,
	"s = ", s
);

for (let i = 0; i < d; ++i) {
	// set parts based on a[i]
	let l = 1 - Number(getBit(a, i));
	let m = 2*i; 

	// random triangle
	A[i][l] = setBit(A[i][l], [0, m-1], randBit);
	// decisive "diagonal"
	A[i][l] = setBit(A[i][l], m, getBit(a, i));
	A[i][l] = setBit(A[i][l], m+1, 1);

	// randomize others
	A[i][0] = setBit(A[i][0], [s, k-1], randBit);
	A[i][1] = setBit(A[i][1], [s, k-1], randBit);
}

let S = new Array(d);
for (let i = 0; i < d; ++i)
	// S[i] = setBit(0n, [0, k-1], randBit);
	S[i] = setBit(0n, [0, k-1], 0);

// two most significat bits
ss = S.slice(0, d-1).map(x => getBit(x, [k-2, k-1]));
as = A.slice(0, d).map(x => getBit(x[0], [k-2, k-1]));
xorval = ss.reduce((acc, x) => acc ^= x, 0x3n);
xorval = as.reduce((acc, x) => acc ^= x, xorval);
S[d-1] = setBit(S[d-1], k-2, xorval & 0x1n);
S[d-1] = setBit(S[d-1], k-1, (xorval >> 1n));

let A2 = new Array(d);
for (let i = 0; i < d; ++i) {
	A2[i] = Array(2);
	A2[i][0] = leftrot(A[i][0] ^ S[i], r, k);
	A2[i][1] = leftrot(A[i][1] ^ S[i], r, k);
	if (i == d-1){
		console.log(hexArray(A[i]), "^", hexArray(S[i]), "=", hexArray([A[i][0] ^ S[i], A[i][1] ^ S[i]]));
	}
}

sendS = leftrot(S.reduce((acc, x) => acc ^= x, 0n), r, k);
console.log("sendS:\t", sendS.toString(16));

// Alice does OT of A2[i][0] and A2[i][1]
// Bob receives A2[i][b[i]]


// Bob's _R_eceipt as array
let R = new Array(d);

// TODO oblivious transfer here
for (let i = 0; i < d; ++i) {
	R[i] = A2[i][getBit(b, i)];
}

console.log("R:\t", hexArray(R));
res = R.reduce((acc, x) => acc ^= x, sendS);
console.log("res:\t", (res + (0xbeefn << BigInt(k))).toString(16));

streak = 0;
streakThr = 10; // TODO understand better this value
for (let j = k; j >= 0; --j) {
	if (getBit(res, j))
		streak = 0;
	else
		++streak;
}


console.log(a+b);
console.log(a, b);
console.log(k);
</script>
