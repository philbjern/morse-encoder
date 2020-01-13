// code, 1 == dot, 2 == dash
const codeTable = [];

// signals duration
const tick = 100;

const dot = '1';
const dash = '111';

const padding = '0';
const paddingChar = '000';
const paddingWord = '0000000';

const output = document.querySelector(".blink");
let interval = null;

let message = '1filip biernat jest super';

function getCharCode(char) {
	if (char === ' ') {
		return paddingWord;
	}
	char = char.toUpperCase();
	const charCode = codeTable.filter((e) => e.char == char);
	let outputStream = [];

	if (charCode && charCode[0]) {
		code = charCode[0].code;
		code.split('').map(elem => {
			if (elem === '1') {
				outputStream.push(dot);
			} else if (elem === '2') {
				outputStream.push(dash);
			}
			outputStream.push(padding);
		});
		outputStream.pop();
		outputStream.push(paddingChar);
		return outputStream.join('');
	} else {
		return '';
	}

}

function removeLastThreeCharactersInLastElement(array) {
	if (array == undefined || array.length == 0) {
		return;
	}
	let lastChar = array.pop();
	lastChar = lastChar.substring(0, lastChar.length - 3);
	array.push(lastChar);
}

function encode(msg) {
	if (msg == undefined) {
		return;
	}
	let stream = [];
	msg.split('').map((char) => {
		if (char === ' ') {
			// remove 3 zeros in last character in stream
			removeLastThreeCharactersInLastElement(stream);
		}
		stream.push(getCharCode(char));
	})
	removeLastThreeCharactersInLastElement(stream);
	console.log(stream);
	return stream.join('');
}

function startTransmission(stream) {
	if (stream == undefined) {
		return;
	}
	const msgLen = stream.length;
	let arr = stream.split('');
	let elem = arr[0];
	let i = 0;
	if (interval != null) {
		console.log('Reset');
		i = 0;
		clearInterval(interval);
	}

	interval = setInterval(function () {
		// console.log(elem);
		if (elem == 1) {
			output.classList.add('on');
			audio.play();
		} else if (elem == 0) {
			output.classList.remove('on');
			audio.pause();
			audio.currentTime = 0;
		}
		arr.shift();
		if (arr.length > 0) {
			elem = arr[0];
		} else {
			output.classList.remove('on');
			audio.pause();
			clearInterval(interval);
		}
		i += 1;

		// update message processed percent
		if (msgLen > 0) {
			let processed = i / msgLen * 100;
			// processed = Math.round(processed * 100) / 100;
			const progressBar = document.querySelector('#progressBar');
			progressBar.textContent = processed.toFixed(0) + '%';
			progressBar.style.width = `${processed}%`;
		}

	}, tick);
}

// parsing symbol table

function parseSymbolTable(htmlTable, symbolTable) {
	if (!symbolTable) {
		symbolTable = [];
	}
	const rows = htmlTable.querySelectorAll("tr");

	rows.forEach((row) => {
		let code = [];
		const cells = row.querySelectorAll('td');
		if (cells == undefined || cells.length == 0) {
			return;
		}
		let codeText = cells[1].textContent.trim();
		// or just store those symbols?
		codeText.split('').map(char => {
			if (char == '•') {
				code.push('1');
			} else if (char == '—') {
				code.push('2');
			}
		});

		let obj = {
			'char': cells[0].textContent.trim(),
			'code': code.join('')
		}

		symbolTable.push(obj);
	})

	return symbolTable;
}

const lettersTable = document.querySelector('#letters-table');
const polishLettersTable = document.querySelector('#letters-polish-table');
const numbersTable = document.querySelector('#numbers-table');

parseSymbolTable(lettersTable, codeTable);
parseSymbolTable(polishLettersTable, codeTable);
parseSymbolTable(numbersTable, codeTable);

// event listeners

const buttons = document.querySelectorAll(".btn");
const runButton = buttons[0];
const resetButton = buttons[1];
const audio = document.querySelector('#audio');

runButton.addEventListener('click', function (e) {
	e.preventDefault();
	let message = document.querySelector('#msg').value;
	startTransmission(encode(message));
});

resetButton.addEventListener('click', function (e) {
	e.preventDefault();
	clearInterval(interval);
	output.classList.remove('on');
})