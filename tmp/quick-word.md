---
layout: empty_html
title: QuickW
---
<html lang="en">
<head>
<title>Quick word</title>
  <script id="MathJax-script" src="{{ "/js/jquery-3.6.0.min.js" | prepend: site.baseurl }}"></script>
</head>
<body>
	<div>
	<textarea id="vocabulary" ></textarea>
	<input type="button" id="btn-load" value="Load vocabulary" />
	<input type="button" id="btn-start" value="Start session" />
	</div>

	<div>
	<input type="text" id="prompt" readonly/>
	<input type="text" id="answer" />
	<input type="button" id="btn-skip" value="Skip (Shift+Enter)" />
	</div>
	<div id="report" />
<script>
// IDEA answer timeout
const MS_IN_S = 1000;
const COUNTDOWN_S = 3;

let vocabulary = [];
let state = 'idle';
let current_idx;
let stats;

function doCountdown(n) {
	if (n == 0) {
		setState('prompt');
		return;
	}
	$('#prompt').val('Get ready in ' + n + ' s');
	setTimeout(doCountdown, 1000, n-1);
}

function doReport() {
	let report = [];
	for (w in stats) {
		let entry = stats[w];
		entry['w'] = w;
		let valid = entry['answer'].length;
		entry['t1'] = valid ? (entry['typing'] - entry['prompt']) / MS_IN_S : Infinity;
		entry['t2'] = (entry['submit'] - entry['typing']) / MS_IN_S;
		entry['rt2'] = valid ? (entry['t2'] / entry['answer'].length) : NaN;
		report.push(entry);
	}
	report.sort((a, b) => {
		if (a['t1'] == b['t1'])
			return a['w'] < b['w'] ? -1 : 1;
		return -(a['t1'] - b['t1']);
	});
	valids = report.filter(e => e['t1'] < Infinity);
	console.log(valids);
	report.push({
		w: 'Total',
		answer: '',
		t1: (valids.reduce((acc, e) => acc + e['t1'], 0) / valids.length) + '/word',
		t2: (100*valids.reduce((acc, e) => acc + e['t2'], 0) / valids.reduce((acc, e) => acc + e['t1']+e['t2'], 0)) + '%',
		rt2: valids.reduce((acc, e) => acc + e['t2'], 0) / valids.reduce((acc, e) => acc + e['answer'].length, 0),
	});
	let table = $('<table>');
	let tr = $('<tr>');
	tr.append($('<th>').text('Word'));
	tr.append($('<th>').text('Answer'));
	tr.append($('<th>').text('Thinking [s]'));
	tr.append($('<th>').text('Typing [s]'));
	tr.append($('<th>').text('Typing [s/char]'));
	table.append(tr);
	report.forEach((e) => {
		let tr = $('<tr>');
		tr.append($('<td>').text(e['w']));
		tr.append($('<td>').text(e['answer']));
		tr.append($('<td>').text(e['t1']));
		tr.append($('<td>').text(e['t2']));
		tr.append($('<td>').text(e['rt2']));
		table.append(tr);
	});
	$('#report').append(table);
}

function setState(ns) {
	let w;
	switch (ns) {
		case 'idle':
			$('#vocabulary').val('');
		break;
		case 'countdown':
			current_idx = 0;
			stats = new Object();
			$('#report').empty();
			$('#answer').focus();
			doCountdown(COUNTDOWN_S);
		break;
		case 'prompt':
			w = vocabulary[current_idx];
			$('#prompt').val(w);
			stats[w] = { prompt: performance.now() };
		break;
		case 'submit':
		case 'skip':
			w = vocabulary[current_idx];
			stats[w]['submit'] = performance.now();
			stats[w]['answer'] = (ns == 'submit') ? $('#answer').val() : '';
			$('#answer').val('');
			if (++current_idx < vocabulary.length) {
				setState('prompt');
			} else {
				setState('report');
			}
		break;
		case 'report':
			$('#prompt').val('');
			doReport();
		break;
	}
}

$('#btn-load').click(function() {
	let new_vocab = $('#vocabulary').val().split(/[,;\n\r]/);
	new_vocab = new_vocab.map(s => s.trim());
	new_vocab = new_vocab.filter(s => s.length);
	if (!new_vocab.length) {
		alert('No words loaded. Supply comma-, semicolon- or newline-separated list.');
		return;
	}
	for (let i = 0; i < new_vocab.length; ++i) {
		let j = Math.floor(Math.random() * (new_vocab.length - i));
		let tmp = new_vocab[i+j];
		new_vocab[i+j] = new_vocab[i];
		new_vocab[i] = tmp;
	}
	vocabulary = new_vocab;
	setState('idle');
	alert('Loaded and prepared ' + vocabulary.length + ' words to practice');
});

$('#btn-start').click(function() {
	if (!vocabulary.length) {
		alert('No vocabulary loaded.');
		return;
	}
	setState('countdown');
});
$('#answer').keydown(function(e) {
	let w = vocabulary[current_idx];
	if (!stats[w]['typing'])
		stats[w]['typing'] = performance.now();

	if (e.which == 13)
		if (e.originalEvent.shiftKey)
			setState('skip');
		else
			setState('submit');
});
</script>
</body>
</html>
