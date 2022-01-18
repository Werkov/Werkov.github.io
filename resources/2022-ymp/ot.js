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
 * The implementation is based on the Simplest OT [1] with modifications from
 * [2]. The underlying group is Ristretto255.
 *
 * [1] https://eprint.iacr.org/2015/267.pdf
 * [2] https://eprint.iacr.org/2017/1011.pdf
 */

import ristretto255 from './ristretto255.js';
import nacl from './nacl.js';

function g(P) {
	let h = nacl.hash(P);
	return ristretto255.fromHash(h);
}

function keyGen(S, R, P) {
	let concat = new Uint8Array(S.length + R.length + P.length);
	concat.set(S, 0);
	concat.set(R, S.length);
	concat.set(P, S.length + R.length);
	return nacl.hash(concat).slice(0, nacl.secretbox.keyLength);
}

function num2bytes(n) {
	let result = new Array(32);
	for (let i = 0; i < 32; ++i) {
		result[i] = Number(n % 256);
		n = n / 256;
	}
	let res = new Uint8Array(result);
	return res;
}

const Sender = function(n) {
	this.y = ristretto255.scalar.getRandom();
	this.S = ristretto255.scalarMultBase(this.y);
	this.T = g(this.S);
	this.n = n;
};

Sender.prototype.produceS = function() {
	return this.S;
};

Sender.prototype.consumeR = function(R) {
	if (!ristretto255.isValid(R))
		return false;

	this.R = R;

	return true;
};

Sender.prototype.produceEs = function(ms, nonce) {
	if (!this.R)
		return null;
	if (this.n != ms.length)
		return null;

	let es = new Array(this.n);

	for (let j = 0; j < this.n; ++j) {
		let tmp = ristretto255.sub(
			this.R,
			ristretto255.scalarMult(num2bytes(j), this.T)
		);
		let P = ristretto255.scalarMult(this.y, tmp);
		let k = keyGen(this.S, this.R, P);
		es[j] = nacl.secretbox(ms[j], nonce, k);
	}

	return es;
};

const Receiver = function(n, c) {
	this.x = ristretto255.scalar.getRandom();
	this.n = n;
	// TODO check 0 <= c < n;
	this.c = c;
};

Receiver.prototype.consumeS = function(S) {
	if (!ristretto255.isValid(S))
		return false;

	this.S = S;
	this.T = g(S);

	return true;
};

Receiver.prototype.produceR = function(c) {
	if (!this.T)
		return null;

	this.R = ristretto255.add(
		ristretto255.scalarMultBase(this.x),
		ristretto255.scalarMult(num2bytes(this.c), this.T)
	);
	return this.R;
};

Receiver.prototype.consumeEs = function(es, nonce) {
	if (!this.T)
		return false;

	if (es.length != this.n)
		return false;

	let P = ristretto255.scalarMult(this.x, this.S);
	let k = keyGen(this.S, this.R, P);

	let e = es[this.c];
	this.m = nacl.secretbox.open(e, nonce, k);
	return this.m !== null;
};

const VecSender = function(d, n) {
	this.senders = new Array(d);
	for (let i = 0; i < d; ++i)
		this.senders[i] = new Sender(n);
	this.d = d;
}

VecSender.prototype.produceS = function() {
	return this.senders.map(s => s.produceS());
};

VecSender.prototype.consumeR = function(R) {
	let r = this.senders.map((s, i) => s.consumeR(R[i]));
	return r.reduce((acc, x) => acc && x);
};

VecSender.prototype.produceEs = function(mss) {
	let nonce = new Uint8Array(nacl.secretbox.nonceLength);
	let r = this.senders.map((s, i) => s.produceEs(mss[i], nonce));
	return {n:nonce, es:r};
}

const VecReceiver = function(d, n, c) {
	this.receivers = new Array(d);
	for (let i = 0; i < d; ++i)
		this.receivers[i] = new Receiver(n, c[i]);
	this.d = d;
}

VecReceiver.prototype.consumeS = function(S) {
	let r = this.receivers.map((r, i) => r.consumeS(S[i]));
	return r.reduce((acc, x) => acc && x);
};

VecReceiver.prototype.produceR = function() {
	return this.receivers.map(r => r.produceR());
};

VecReceiver.prototype.consumeEs = function(es) {
	let r = this.receivers.map((r, i) => r.consumeEs(es.es[i], es.n));
	return r.reduce((acc, x) => acc && x);
};

VecReceiver.prototype.getMessage = function() {
	return this.receivers.map(r => r.m);
};


export default {
	Sender		: Sender,
	Receiver	: Receiver,
	VecSender	: VecSender,
	VecReceiver	: VecReceiver,
};

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
