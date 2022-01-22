---
layout: post
title: YMP
tags: cryptography
---

See also https://blog.goodaudience.com/understanding-zero-knowledge-proofs-through-simple-examples-df673f796d99

<script src="/resources/2022-ymp/ot.js" type="module"></script>
<script src="/resources/2022-ymp/ymp.js" type="module"></script>
<script>
// TODO idea: use promises where user input matters?
// beware its just a toy (bugs, side-channels, post-quantum crypto)
// TODO note: why JS? available, interactive

document.addEventListener('DOMContentLoaded', () => {
	let a, b;
	let alice = new window.Alice(new window.Domain(0, 1000, 1), a = 684);
	let bob = new window.Bob(new window.Domain(0, 1000, 1), b = 954);

	let ch = alice.produceChallenge();
	bob.consumeChallenge(ch);

	let re = bob.produceResponse();
	alice.consumeResponse(re);

	let ac = alice.produceAcknowledgement();
	console.log(ac);
	bob.consumeAcknowledgement(ac);

	console.log(a, b, bob.result);
});


</script>

