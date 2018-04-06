---
layout: post
title: Cryptocurrencies anthology
tags: bitcoin cryptography
---

should I put this on Wikipedia?

## Principles of cryptocurrencies

  * digital signing + blockchain

## Parameters of cryptocurrencies

  * sorted by capitalization as of 2017-12-18

### Bitcoin (312e9)

  * signatures: 256b ECDSA
    * pubkey (condition) and signature (variables to condition) script
      * [ECDSA with 256b keys](https://bitcoin.org/en/developer-guide#transactions)
  * POW hash: double sha256
  * block rate: 10 min/block on average
    * each 2016 blocks should take 2 weeks (modifies difficulty)
  * new coins rate: halving every 210000 blocks (~4 years)
    * started with 50 BTC in 2009
  * divisibility
    * 1 satoshi = 10e-8 BTC
  * block size: 1MB ([commit](https://github.com/bitcoin/bitcoin/commit/a30b56ebe76ffff9f9cc8a6667186179413c6349),
        [commit](https://github.com/bitcoin/bitcoin/commit/172f006020965ae8763a0610845c051ed1e3b522))
    * BitcoinCash: 8MB

### Ethereum (67e9)

  * [source](http://www.abclinuxu.cz/blog/bystroushaak/2014/9/ethereum) (in Czech)
  * [source 2](https://github.com/ethereum/wiki/wiki/White-Paper)
  * provide scripting platform
  * each account has
    * a balance of ethers
    * a code (for CA only, not for EOA)
    * a storefy (for CA only, not for EOA)
  * CA are "compute nodes" of the Ethereum network
    * they burn ethers (converted to *gas*) and execute the code, possibly
      using the storage
  * miners execute the code
    * they don't mine new *ether*s but obtain your ethers you pay for execution
      of the code
    * TODO where does the original ethers come from?
      * blockchain-based mining as in Bitcoin
  * divisibility
    * 1 wei = 10e-18 ether

### Bitcoin Cash (31e9)

  * fork of Bitcoin, see blocksize above

### Ripple (27e9)

  * [explanation video](https://www.youtube.com/watch?v=pj1QVb1vlC0)
    * presents itself as a distributed consensus algorithm to keep a
      distributed ledger
  * rather an inter-bank protocol
  * but they have own currency(?), how is it backed?
  * "domains", pool of transactions, at least 80% of nodes in domain must approve the transactions from the pool (they land in the distributed ledger)
  * nodes are in multiple domains to ensure global consensus

### Litecoin (17e9)

  * signatures: 256b ECDSA (forked BTC)
  * POW hash: scrypt
  * block rate: 2.5 min/block on average
    * each 2016 blocks should take 2 weeks (modifies difficulty)
  * new coins rate: halving every 210000 blocks (~4 years)
    * started with 50 LTC in 2011
  * block size: 1MB (as of 2016?)

### Cardano (13e9)
  * WTF, too abstract and theoretic, proof of stake?

### IOTA (10e9)

### Dash (8e9)

### NEM (6e9)

### Monero (5e9)

## Random drawbacks

  * BTC transaction locktime
    * it limits no. of blocks to 500e6 (then it parses the value as a UNIX timestamp)

## Estimate of transaction confirmation time in ideal case

TODO ref https://lcamtuf.blogspot.cz/2017/12/the-deal-with-bitcoin.html
