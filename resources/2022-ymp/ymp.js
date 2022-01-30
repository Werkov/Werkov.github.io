/*
 * Copyright (c) 2022 Michal Koutný
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The implementation is based on the YMP algorithm from [1].
 *
 * - paper indexing:
 *   <-->  0..k-1
 *   ^v    1..d
 * - my indexing:
 *   <-->  0..k-1
 *   ^v    0..d-1
 *
 * [1] https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.110.8816
 */
import ot from './ot.js';

function getRandInt(n) {
	return Math.floor(Math.random() * n);
	if (typeof(getRandInt.seed) == 'undefined')
		getRandInt.seed = 42;
	// TODO replace with crypto API
	ret = (getRandInt.seed * 16807) % ((1 << 31) - 1);
	getRandInt.seed = ret;
	return ret % n;
}

function getBit(a, n) {
	return (a[n / 8 | 0] >> (n % 8)) & 1;
}

function setBit(a, n, v) {
	if (v)
		a[n / 8 | 0] |= 1 << (n % 8);
	else
		a[n / 8 | 0] &= ~(1 << (n % 8));
}

function leftrot(a, r) {
	let res = new Uint8Array(a.length);
	let full = r / 8 | 0;
	let part = r % 8;

	for (let i = 0; i < res.length; ++i) {
		res[i] = a[(i + res.length - full) % res.length] << part;
		res[i] |= a[(i + res.length - full - 1) % res.length] >> (8-part);
	}

	return res;
}

function xor(a, b) {
	console.assert(a.length == b.length, a.length, b.length);
	let res = new Uint8Array(a.length);
	for (let i = 0; i < res.length; ++i)
		res[i] = a[i] ^ b[i];
	return res;
}

function fillRandom(a, begin, end) {
	let sub = a.subarray((begin + 7) / 8 | 0, end / 8 | 0)
	crypto.getRandomValues(sub);

	let padding = new Uint8Array(2);
	crypto.getRandomValues(padding);

	let bmask = (begin % 8) ? (0xff << (begin % 8)) & 0xff : 0;
	a[begin / 8 | 0] &= ~bmask;
	a[begin / 8 | 0] |= padding[0] & bmask;

	let emask = (1 << (end % 8)) - 1;
	a[end / 8 | 0] &= ~emask;
	a[end / 8 | 0] |= padding[1] & emask;
	console.log("b,e:", begin, end,
		"sub:", (begin + 7) / 8 | 0, end / 8 | 0, 
		"bmask:", bmask,
		"emask:", emask);
}

function hexDump(a) {
	if (a instanceof Uint8Array)
		return bytes2num(a).toString(16).padStart(24/4, '0');
	let res = new Array();
	for (let i in a) {
		res[i] = hexDump(a[i]);
	}
	return res;
}

function bytes2num(bytes) {
	let result = 0n;
	for (let i = bytes.length - 1; i >= 0; --i) {
		result *= 256n;
		result += BigInt(bytes[i]);
	}

	return result;
}

function num(n, v) {
	let res = new Uint8Array(Math.ceil(n / 8));

	/* support 0..255 initializer */
	if (typeof(v) != "undefined")
		res[0] = v;
	return res;
}

/*
 * paper says "large enough" without clear specification
 * paper specifies zone of zeroes to be from [d, d*d+d] interval
 *   that gives s \in (3*d, d*d+3*d]
 * k must be designed k >= d*d+3*d
 */
const Ioannis = {
	minZone: d => d,
	/* align k to bytes */
	// TODO also account for 2b mark?
	minK: d => 8*Math.ceil((d*d + 2*d + Ioannis.minZone(d)) / 8),

};

/*
 *  secret min..max
 * binSecret 0..2^d-1
 *
 */
const Domain = function(min, max, step) {
	if (min > max)
		throw "Empty domain";
	if (min == max)
		throw "Singular domain " + min + ", " + max + ".";
	if (step <= 0)
		throw "Invalid step";

	this.min = min;
	this.max = max;
	this.step = step;
	this.bits = Math.ceil(Math.log2((max - min) / step));
};

Domain.prototype.transformSecret = function(secret) {
	if (typeof(secret) != "number" || secret < this.min || secret > this.max)
		throw "Secret out of domain";

	return num(this.bits, Math.floor((secret - this.min) / this.step));
};

Domain.prototype.toMessage = function() {
	return [this.min, this.max, this.step];
};

Domain.fromMessage = function(m) {
	return new Domain(m[0], m[1], m[2]);
};

Domain.prototype.match = function(other) {
	return this.min == other.min &&
	       this.max == other.max &&
	       this.step == other.step;
};


const Alice = function(domain, secret) {
	this.ot = new ot.VecSender(domain.bits, 2);
	this.domain = domain;
	this.binSecret = domain.transformSecret(secret);
};

Alice.prototype.produceChallenge = function() {
	return {
		d: this.domain.toMessage(), /* domain definition */
		c: this.ot.produceS(), /* OT Sender "keys" */
	};
};

Alice.prototype.consumeResponse = function(r) {
	// TODO check r matches this.domain (not only bits), or just rely on bits?
	if (!this.ot.consumeR(r))
		throw "Wront OT response";
};

Alice.prototype.produceAcknowledgement = function() {
	/* This is where we start processing secret */
	let d = this.domain.bits;

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
	
	let minZone = Ioannis.minZone(d);
	let k = Ioannis.minK(d);
	let s = (2*d + minZone) + getRandInt(d*d);

	console.log(
		"r = ", r,
		"s = ", s,
		"k = ", k
	);
	
	let A = new Array(d);
	for (let i = 0; i < d; ++i)
		A[i] = [num(k), num(k)];
	
	for (let i = 0; i < d; ++i) {
		// set parts based on a[i]
		let l = 1 - getBit(this.binSecret, i);
		let m = 2*i; 
	
		// random triangle
		fillRandom(A[i][l], 0, m);
		// decisive "diagonal"
		setBit(A[i][l], m, getBit(this.binSecret, i));
		setBit(A[i][l], m+1, 1);

		// randomize others
		fillRandom(A[i][0], s, k);
		fillRandom(A[i][1], s, k);
	
		// top 2 bit must be bitwise equal not to corrupt '11' mark
		// XXX paper had this wrong
		setBit(A[i][0], k-1, getBit(A[i][1], k-1));
		setBit(A[i][0], k-2, getBit(A[i][1], k-2));
	}
	console.log("A", A, hexDump(A));
	
	let S = new Array(d);
	for (let i = 0; i < d; ++i) {
		S[i] = num(k);
		fillRandom(S[i], 0, k);
	}
	console.log("S", S, hexDump(S));
	
	// XXX paper botched this: only sendS must xor the mark, not S[d-1]
	// mark is xor-sum of all As ^ the real mark (only top 2b)
	// this way As would xor away, the result would me the real mark only then
	let as = A.slice(0, d).map(x => (getBit(x[0], k-1) << 1) | getBit(x[0], k-2));
	let xorval = as.reduce((acc, x) => acc ^ x, 0x3);
	let mark = num(k);
	setBit(mark, k-1, (xorval >> 1));
	setBit(mark, k-2, xorval & 0x1);
	
	let A2 = new Array(d);
	for (let i = 0; i < d; ++i) {
		A2[i] = Array(2);
		A2[i][0] = leftrot(xor(A[i][0], S[i]), r);
		A2[i][1] = leftrot(xor(A[i][1], S[i]), r);
	}
	
	let red = S.reduce((acc, x) => xor(acc, x), mark)
	let sendS = leftrot(red, r);
	console.log("sendS, mark", hexDump(sendS), hexDump(mark));

	console.log("A2", A2, hexDump(A2));
	return {
		s: sendS,
		a: this.ot.produceEs(A2),
	};
};

const Bob = function(domain, secret) {
	let binSecret = domain.transformSecret(secret)
	let cs = [...Array(domain.bits).keys()].map(i => getBit(binSecret, i));
	this.ot = new ot.VecReceiver(domain.bits, 2, cs);
	this.domain = domain;
};

// TODO idea
// Bob.fromChallenge = function(c, secret) {
// 	let cDomain = Domain.fromMessage(c.d);
// 	return new Bob(cDomain, secret);
// };

Bob.prototype.consumeChallenge = function(c) {
	let cDomain = Domain.fromMessage(c.d);

	if (!this.domain.match(cDomain))
		throw "Unexpected domain in challenge";

	if (!this.ot.consumeS(c.c))
		throw "Wrong OT challenge";
};

Bob.prototype.produceResponse = function() {
	return this.ot.produceR(); /* OT Receiver keys */
};

Bob.prototype.consumeAcknowledgement = function(a) {
	if (!this.ot.consumeEs(a.a))
		throw "Wrong OT acknowledgement";

	let R = this.ot.getMessage();
	console.log("OT R:", R, hexDump(R));
	let codeword = R.reduce((acc, x) => xor(acc, x), a.s);
	console.log("cw", codeword, hexDump(codeword));

	let streak = 0;
	let reply = undefined;
	let minZone = Ioannis.minZone(this.domain.bits);
	let k = Ioannis.minK(this.domain.bits);

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

	/* reply ? "A>=B" : "A<B" */
	this.isGreater = !reply;
};

function selftest() {
	function test(a, b) {
		let alice = new Alice(new Domain(0, Math.max(a, b), 1), a);
		let bob = new Bob(new Domain(0, Math.max(a, b), 1), b);

		let ch = alice.produceChallenge();
		bob.consumeChallenge(ch);

		let re = bob.produceResponse();
		alice.consumeResponse(re);

		let ac = alice.produceAcknowledgement();
		bob.consumeAcknowledgement(ac);

		console.log("test:", a, b, bob.isGreater, (b>a));
		return bob.isGreater;
	}

	let cases = [
		[2, 2],
		[200, 200],
		[1, 2],
		[2, 1],
		[100, 200],
		[200, 100],
		[1e6, 1e6+1],
		[1e6+1, 1e6],
	];
	for (let c in cases) {
		let a = cases[c][0];
		let b = cases[c][1];
		console.assert(test(a, b) === b > a, a + ", " + b);
	}
}



// debug export
window.Alice = Alice;
window.Bob = Bob;
window.Domain = Domain;
window.ympSelftest = selftest;

export default {
	Alice	: Alice,
	Bob	: Bob,
	Domain  : Domain,
};

// TODO remove debug prints exposing secrets
// TODO idea: session id (prevent replay, derive from A's secret)
