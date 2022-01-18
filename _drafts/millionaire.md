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
	let alice = new window.Alice(5684, 14);
	let bob = new window.Bob(9543, 14);

	let c = alice.produceChallenge();
	bob.consumeChallenge(c);

	let r = bob.produceResponse();
	alice.consumeResponse(r);

	let a = alice.produceAcknowledgement();
	console.log(a);
	bob.consumeAcknowledgement(a);

	console.log(alice.secret, bob.secret, bob.result);
});


</script>

