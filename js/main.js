const codeTable = [];

const tick = 100;

const dot = '1';
const dash = '111';

const padding = '0';
const paddingChar = '000';
const paddingWord = '0000000';

const output = document.querySelector(".blink");
let interval = null;

let message = 'test message';

function getCharCode(letter) {
	let result = {
		'displayText': '',
		'stream': ''
	}

	if (letter === ' ') {
		result.displayText = ' ';
		result.stream = paddingWord;
		return result;
	}

	letter = letter.toUpperCase();
	const charObj = codeTable.filter((e) => e.letter == letter);
	
	let outputStream = [];
	
	if (charObj && charObj[0]) {
		result.displayText = charObj[0].letter + ' ' + charObj[0].morseCode;
		code = charObj[0].morseCode;
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
		result.stream = outputStream.join('');
	}
	return result;
}

// function removeLastThreeCharactersInLastElement(array) {
// 	if (array == undefined || array.length == 0) {
// 		return;
// 	}
// 	let lastChar = array.pop();
// 	lastChar = lastChar.substring(0, lastChar.length - 3);
// 	array.push(lastChar);
// }

function removeLastThreeChars(arr) {
	string = arr[arr.length - 1].stream
	string = string.substring(0, string.length - 3);
	arr[arr.length - 1].stream = string;
	console.log(string);	
	return string;
}

function encode(msg) {
	if (msg == undefined) {
		return;
	}
	let result = [];
	msg.split('').map((char) => {
		if (char === ' ') {
			// remove 3 zeros in last character in stream
			removeLastThreeChars(result);
		}
		result.push(getCharCode(char));
	})
	removeLastThreeChars(result);
	// return stream.join('');
	return result;
}

const progressBar = document.querySelector('#progressBar');
const progressBarText = document.querySelector('#outputText');
const letterDisplay = document.querySelector('#character-display');

function transmit(message) {
	if (message == undefined) {
		return;
	}
	const streamArr = encode(message);
	const msgLen = streamArr.length;
	let i = 0;
	let bits = streamArr[i].stream.split('');
	let elem = bits[0];
	letterDisplay.textContent = streamArr[i].displayText;
	audio.currentTime = 0;
	if (interval != null) {
		console.log('Reset');
		i = 0;
		progressBar.classList.remove('complete');
		clearInterval(interval);
	}

	interval = setInterval(function () {
		if (i == streamArr.length) {
			// end
			output.classList.remove('on');
			audio.pause();
			clearInterval(interval);
			return;
		}

		if (bits.length > 0) {
			elem = bits.shift();
		} else {
			i++;
			// display currently transmitted letter
			if (i < streamArr.length) {
				// move to next character
				letterDisplay.textContent = streamArr[i].displayText;
				bits = streamArr[i].stream.split('');
				elem = bits[0];
			}
		}

		if (elem == 1) {
			output.classList.add('on');
			audio.play();
		} else if (elem == 0) {
			output.classList.remove('on');
			audio.pause();
			audio.currentTime = 0;
		}
		
		// update message processed percent
		if (msgLen > 0) {
			let processed = i / msgLen * 100;
			// processed = Math.round(processed * 100) / 100;
			progressBarText.textContent = processed.toFixed(0) + '%';
			progressBar.style.flexGrow = `${processed / 100}`;
			if (processed >= 99) {
				progressBar.classList.add('complete');
			}
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
			'letter': cells[0].textContent.trim(),
			'morseCode': code.join('')
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

function hideProgressBar() {
	progressBar.classList.remove('complete');
	progressBar.style.opacity = '0';
	progressBar.style.width = '0px';
	outputText.style.opacity = '0';
}

function showProgressBar() {
	progressBar.style.opacity = '1';
	outputText.style.opacity = '1';
}

// event listeners

const buttons = document.querySelectorAll(".btn");
const runButton = buttons[0];
const resetButton = buttons[1];
const audio = document.querySelector('#audio');
const messageTextarea = document.querySelector('#msg');

runButton.addEventListener('click', function (e) {
	e.preventDefault();
	let message = messageTextarea.value;
	if (message != '') {
		showProgressBar();
		transmit(message);
	}
});

resetButton.addEventListener('click', function (e) {
	e.preventDefault();
	clearInterval(interval);
	output.classList.remove('on');
	messageTextarea.value = '';
	letterDisplay.textContent = '';
	hideProgressBar();
});