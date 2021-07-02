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
	return Math.floow(Math.random() * n);
}

function getBit(a, range) {
	// TODO range
	return (a >> n) & 0x1n;
}

function setBit(a, range, val) {
	// TODO implement
}

function leftrot(n, r) {
	// TODO implement
}

var a = 10;
var b = 30;

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
	l = 1 - getBit(a, i);
	A[i][l] = setBit(A[i][l], [0, 2*i + 1], rand);
	m = 2*i+2; // TODO check off by one
	A[i][l] = setBit(A[i][l], m+1, 1);
	A[i][l] = setBit(A[i][l], m+1, getBit(a, i));

	// randomize others
	A[i][0] = randomizeBits(A[i][0], [s, k], rand);
	A[i][1] = randomizeBits(A[i][1], [s, k], rand);
}

let S = new Array(d);
for (let i = 0; i < d; ++i)
	S[i] = setBit(0n, [0, k], rand);

ss = S.slice(0, d-1).map(x => getBit(x, [k-2, k-1]));
as = A.slice(0, d).map(x => getBit(x, [k-2, k-1]));
xorval = ss.reduce((acc, x) => acc ^= x, 0x11n);
xorval = as.reduce((acc, x) => acc ^= x, xorval);
S[d-1] = setBit(S[d-1], k-1, xorval & 0x1n);
S[d-1] = setBit(S[d-1], k-2, (xorval >> 1)); // TODO check bit order

for (let i = 0; i < d; ++i) {
	A2[i][0] = leftrot(A[i][0] ^ S[i], r);
	A2[i][1] = leftrot(A[i][1] ^ S[i], r);
}

// Alice does OT of A2[i][0] and A2[i][1]
// Bob receives A2[i][b[i]]

sendS = leftrot(S.reduce((acc, x) => acc ^= x, 0), r);

// TODO Bob's evaluation


console.log(a+b);
console.log(a, b);
console.log(K);
</script>
