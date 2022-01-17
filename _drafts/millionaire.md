---
layout: post
title: YMP
tags: cryptography
---

See also https://blog.goodaudience.com/understanding-zero-knowledge-proofs-through-simple-examples-df673f796d99

<script src="/resources/2022-ymp/nacl.js"></script>
<script>
// TODO isea: use promises where user input matters?

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
// beware its just a toy (bugs, side-channels, post-quantum crypto)
// TODO note: why JS? available, interactive

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

/*
 * a, b		ArrayBuffer
 * result	Uint8Array
 */
function xorArray(a, b) {
	// not working with 64b,
	// not ideal but avoid endianess issues when converting typed arrays
	// and easier alignment
	let va = new Uint16Array(a);
	let vb = new Uint16Array(b);
	console.assert(va.length == vb.length, va.length, vb.length);
	let res = new Uint16Array(va.length);
	for (let i = 0; i < res.length; ++i) {
		res[i] = va[i] ^ vb[i];
	}
	return new Uint8Array(res.buffer);
}

function hexArray(a) {
	if (typeof(a) == 'number' || typeof(a) == 'bigint')
		return a.toString(16).padStart(k/4, '0');
	let res = new Array();
	for (let i in a) {
		res[i] = hexArray(a[i]);
	}
	return res;
}

/*
 * E	group element, Uint8Array
 * 	returns a random group element
 */
function g2gHash(E) {
	let num = nacl.hash(E);
	return nacl.scalarMult.base(num.slice(0, SCALAR_LEN));
}

/*
 * n	number
 *	returns LE 2-complement encoded number as byte-array
 */
function num2bytes(n) {
	let result = new Array(32);
	let neg = (n < 0);
	n = neg ? -n-1 : n;
	n = BigInt(n);
	for (let i = 0; i < 32; ++i) {
		result[i] = Number(n % 256n);
		if (neg)
			result[i] = ~result[i];
		n = n / 256n;
	}
	//return new Uint8Array(result.reverse());
	return new Uint8Array(result);
}

function idx2Scalar(i) {
	i = BigInt(i);
	return num2bytes(8n*i);
}

/*
 * S		group elem sender (pub)
 * R		group elem receiver (pub)
 * K		group elem based on message + pk/sk exchange
 */
function keyGen(S, R, K) {
	let concat = new Uint8Array(S.length + R.length + K.length);
	concat.set(S, 0);
	concat.set(R, S.length);
	concat.set(K, S.length + R.length);
	// nacl's public box uses ECDH + salsa or? 1305
	return nacl.hash(concat);
}

var a = 0x17n;
var b = 0x0n;

// a,b,r,s 8,8,14,55 gives wrong result

// key len in OT
// must hold: k > d*d (even more, see below)
// k must be compatible with RSA message len
const k = 512;
// var d = 20;

// var k = 64;
var d = 6;
var d = 1;

// var k = 132;
// var d = 10;

function ioanis() {
console.log(
	"a:\t", a.toString(16),
	"b:\t", b.toString(16)
);

// Alice
let A = new Array(d);
for (let i = 0; i < d; ++i)
	A[i] = [0n, 0n];

// XXX paper states 2*k but makes no sense for rotations of k-bit numbers
// actually, there have to be at least d options (equal to guessing the
// position of highest decisive bit) but we use 2 bit encoding,
// so the rotation has to cover 2*d bits
// we could use even k bit rotation but:
//   a) that would inflict more contraints on the length of zero-zone to
//      avoid encountering zone of zeroes generated randomly
//   b) rotation boundary can be in the middle of the 2 encoding bits making 
//      result detection harder
let r = getRandInt(2*d);

// paper says "large enough" without clear specification
// paper specifies zone of zeroes to be from [d, d*d+d] interval
//   that gives s \in (3*d, d*d+3*d]
// k must be designed k >= d*d+3*d
let minZone = d;
console.assert(k >= d*d + 2*d + minZone);
let s = (2*d + minZone) + getRandInt(d*d);

console.log(
	"r = ", r,
	"s = ", s
);

// TODO refactor the A generation into more reusable code
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

	// top 2 bit must be bitwise equal not to corrupt '11' mark
	// XXX paper had this wrong
	A[i][0] = setBit(A[i][0], k-1, getBit(A[i][1], k-1));
	A[i][0] = setBit(A[i][0], k-2, getBit(A[i][1], k-2));
}

let S = new Array(d);
for (let i = 0; i < d; ++i) {
	S[i] = setBit(0n, [0, k-1], randBit);
	// debug: disable xor encryption
	// S[i] = setBit(0n, [0, k-1], 0);
}

// XXX paper botched this: only sendS must xor the mark, not S[d-1]
// mark is xor-sum of all As ^ the real mark (only top 2b)
// this way As would xor away, the result would me the real mark only then
let as = A.slice(0, d).map(x => getBit(x[0], [k-2, k-1]));
let xorval = as.reduce((acc, x) => acc ^= x, 0x3n);
let mark = 0n;
mark = setBit(mark, k-1, (xorval >> 1n));
mark = setBit(mark, k-2, xorval & 0x1n);

let A2 = new Array(d);
for (let i = 0; i < d; ++i) {
	A2[i] = Array(2);
	A2[i][0] = leftrot(A[i][0] ^ S[i], r, k);
	A2[i][1] = leftrot(A[i][1] ^ S[i], r, k);
	if (i == d-1){
		console.log(hexArray(A[i]), "^", hexArray(S[i]), "=", hexArray([A[i][0] ^ S[i], A[i][1] ^ S[i]]));
	}
}
console.log("A2\n", hexArray(A2));

sendS = leftrot(S.reduce((acc, x) => acc ^= x, mark), r, k);
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
let codeword = R.reduce((acc, x) => acc ^= x, sendS);
console.log("cw:\t", codeword.toString(16));


streak = 0;
let reply = undefined;
for (let j = k-1; j >= 0; --j) {
	if (getBit(codeword, j)) {
		if (streak >= minZone) {
			let r;
			// rotation in the middle 2b encoding
			if (j == 0)
				r = k-1;
			else
				r = j-1;
			reply = getBit(codeword, r);
		}
		streak = 0;
	} else
		++streak;
}
if (typeof(reply) == "undefined" && streak >= minZone) {
	reply = getBit(codeword, k-2);
}
console.assert(typeof(reply) != "undefined");

console.log(a, reply ? ">=" : "<",  b);
}

// Nevšímavý přenos
// https://dspace.cuni.cz/handle/20.500.11956/81963?show=full

// use the simplest OT with fix
// https://eprint.iacr.org/2015/267.pdf
// fix https://eprint.iacr.org/2017/1011.pdf

console.log("New algo");

const SCALAR_LEN = 32; // B
const ELEMENT_LEN = 32; // B

// Alice challenge

let y = new Array(d);
let S = new Array(d);
let aliceT = new Array(d);
for (let i = 0; i < d; ++i) {
	y[i] = nacl.randomBytes(SCALAR_LEN); // TODO group cofactor
	S[i] = nacl.scalarMult.base(y[i]);
	aliceT[i] = g2gHash(S[i]);
}

// TODO send S to Bob

// Bob's response
// XXX S should be checked on group membership
let rcvS = S;

let x = new Array(d);
let R = new Array(d);
let bobT = new Array(d);
for (let i = 0; i < d; ++i) {
	x[i] = nacl.randomBytes(SCALAR_LEN);
	bobT[i] = g2gHash(rcvS[i]);

	let gf = nacl.lowlevel.gf;
	let a_ = [gf(), gf(), gf(), gf()];
	let b_ = [gf(), gf(), gf(), gf()];
	let s_ = new Uint8Array(ELEMENT_LEN);

	// XXX if b[i] == 0, we drop bobT[i], is it secure?
	console.log("Bob:", getBit(b, i));
	nacl.lowlevel.unpackneg(a_, nacl.scalarMult(idx2Scalar(getBit(b, i)), bobT[i]));
	nacl.lowlevel.unpackneg(b_, nacl.scalarMult.base(x[i]));
	nacl.lowlevel.add(a_, b_);
	nacl.lowlevel.pack(s_, a_);

	R[i] = s_;
}

// TODO send R to Alice
// Alice's response 2 (transferring her messages)

let A2 = new Array(d);
for (let i = 0; i < d; ++i) {
	A2[i] = [42, 11];
}

// XXX R should be checked on group membership
let rcvR = R;

// it'd be nice to use nacl's (public) box but it does salsa authentication which would interfere with OT paper assumptions
// - think about it more, I could use nonce=0 because I'd add variability in per-message computed "pubkey"
// - does Salsa bring robustness, i.e. ciphertext only decrypts with the correct key, other return failure (instead of noise)
//   - but is that a problem? could I enumerate possible keys to retrieve unselected messages?
//   - XXX I don't generate key via oracle but just encode salsa(R'^y)
//       TODO check simple-OT paper why hash functions are from R'xS

// convert from 8b limbs to 16b limbs
let L_1 = new Float64Array(new Uint16Array(new Uint8Array(nacl.lowlevel.L).buffer))
L_1[0] -= 1; // assume LE, L[0] != 0
let sL_1 = new Uint8Array(32);
nacl.lowlevel.pack25519(sL_1, L_1); // this is not divisible by 8, so it'll fail to produce good iverse

// this negative-one is a mess and it doesn't seem to work, furthermore I had
// to add 8*-hacks to bypass cofactor clamping
// - it seems the easiest would be to use ristretto group, implemented by ristretto-js for simplicity
// - or noble-ed25519 (not sure if it supports ristretto points arithmetics, undocumented feature)

let eMessages = new Array(d);
for (let i = 0; i < d; ++i) {
	// TODO replace with constant
	eMessages[i] = new Array(2);
	for (let j = 0; j < 2; ++j) {
		let gf = nacl.lowlevel.gf;
		let a_ = [gf(), gf(), gf(), gf()];
		let b_ = [gf(), gf(), gf(), gf()];
		let s_ = new Uint8Array(32);
		let t_ = [gf(), gf(), gf(), gf()];
		let negt_ = [gf(), gf(), gf(), gf()];
		let negT = new Uint8Array(32);

		nacl.lowlevel.unpackneg(t_, aliceT[i]); // XXX distortion point?
		nacl.lowlevel.scalarmult(negt_, t_, L_1); // XXX distortion point?
		nacl.lowlevel.pack(negT, negt_);
		/* T^-j = (T^-1)^j = (T^(L-1))^j */
		// nacl.lowlevel.unpackneg(a_, nacl.scalarMult(idx2Scalar(j), nacl.scalarMult(sL_1, aliceT[i])));
		nacl.lowlevel.unpackneg(a_, nacl.scalarMult(idx2Scalar(j), negT));
		//nacl.lowlevel.unpackneg(a_, nacl.scalarMult(idx2Scalar(j), aliceT[i]));
		console.log("a_, negT", a_, negT);
		nacl.lowlevel.unpackneg(b_, rcvR[i]);
		console.log("b_", b_);
		nacl.lowlevel.add(a_, b_); // XXX can s_ be distortion point?
		console.log("a_+", a_);
		nacl.lowlevel.pack(s_, a_); 
		console.log("s_", s_);

		let Rm = s_;

		let key = nacl.box.before(Rm, y[i])
		// XXX S,R should seed key generation, not nonce
		let nonce = keyGen(S[i], rcvR[i], new Uint8Array()).slice(0, nacl.box.nonceLength);

		console.log("Ae:", num2bytes(A2[i][j]), nonce, key);
		let msg = nacl.box.after(num2bytes(A2[i][j]), nonce, key);
		eMessages[i][j] = msg;
	}

}

// TODO send eMessages

// Bob's evaluation

let oblA = new Array(d);
for (let i = 0; i < d; ++i) {
	let key = nacl.box.before(rcvS[i], x[i])
	let nonce = keyGen(rcvS[i], R[i], new Uint8Array()).slice(0, nacl.box.nonceLength);
	console.log("Bd:", eMessages[i][getBit(b, i)], nonce, key);
	let msg = nacl.box.open.after(eMessages[i][getBit(b, i)], nonce, key);
	oblA[i] = msg;
}

console.log(oblA);





//  let kpA = nacl.box.keyPair();
//  let kpB = nacl.box.keyPair();
//  
//  shared = nacl.box.before(kpB.publicKey, kpA.secretKey);
//  nonce = new Uint8Array(24);
//  msg = new Uint8Array([1,2,3,4,5,6]);
//  box = nacl.box.after(msg, nonce, shared);
//  
//  outmsg = nacl.box.open.after(box, nonce, shared);

// TODO how original paper encodes b==0 into response
// TODO why original paper hashes group element for symmetric key?

// nacl.lowlevel works with all scalars (whole group?)
// whereas public API crypto_scalarmult et al works with scalars/8
/* References
https://github.com/archit-p/simplest-oblivious-transfer
- use cyclic group Z_p of random prime p

https://github.com/danzipie/simplest-ot/blob/master/src/main.rs
- rust impl, relies on operator overload for RistrettoPoint (i.e. inversion for free)
  - maybe use Ristretto js (https://github.com/novifinancial/ristretto255-js)
*/
</script>

