import sys

class Trie:
    EDGES = 0
    N_DESCENDANTS = 1

    def _new_node(self):
        return [dict(), 0]

    def __init__(self):
        self._root = self._new_node()
        self._set = set()

    def insert(self, word):
        if word in self._set:
            return
        self._set.add(word)

        node = self._root
        for c in word:
            # print(node, c)
            node[Trie.N_DESCENDANTS] += 1
            if not c in node[Trie.EDGES]:
                node[Trie.EDGES][c] = self._new_node()
            node = node[Trie.EDGES][c]

    def get_node(self, prefix):
        node = self._root
        for c in prefix:
            if not c in node[Trie.EDGES]:
                return None
            node = node[Trie.EDGES][c]
        return node

    def _get_extreme(self, prefix, keyfunc):
        node = self.get_node(prefix)
        if not node or len(node[Trie.EDGES]) == 0:
            return None
        s = sorted(node[Trie.EDGES].items(), key=keyfunc)
        # for k,v in s:
        #     print(k, len(v[Trie.EDGES]))
        c, v = s[0]
        print(c, keyfunc(s[0]))
        return c

    def get_widest(self, prefix):
        return self._get_extreme(prefix, lambda kv: -len(kv[1][Trie.EDGES]))

    def get_largest(self, prefix):
        return self._get_extreme(prefix, lambda kv: -kv[1][Trie.N_DESCENDANTS])

    def get_score_size(self, word):
        node = self._root
        score = 0
        for i, c in enumerate(word):
            if len(node[Trie.EDGES]) > 1 or i+1 == len(word):
                score += node[Trie.N_DESCENDANTS]
            node = node[Trie.EDGES][c]
        return score

    def get_score_width(self, word):
        node = self._root
        score = 0
        for i, c in enumerate(word):
            if len(node[Trie.EDGES]) > 1 or i+1 == len(word):
                score += len(node[Trie.EDGES])
            node = node[Trie.EDGES][c]
        return score




trie = Trie()
for line in sys.stdin.readlines():
    word = line.strip()
    word = word.split('/')[0].lower()
    if word[-1] in ['ý', 'á', 't', 'í', 'ě']:
        continue

    trie.insert(word)

# print("Trie done")
START = 0
LIMIT = 1

# print("Size-based")
l = [w for w in sorted(trie._set, key=lambda w: trie.get_score_size(w), reverse=True)]
for w in l[START:START+LIMIT]:
    print(w, trie.get_score_size(w))

# print()
# print("Width-based")
# l = [w for w in sorted(trie._set, key=lambda w: trie.get_score_width(w), reverse=True)]
# for w in l[START:START+LIMIT]:
#     print(w)

