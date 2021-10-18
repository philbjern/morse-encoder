const CODE_TABLE = [];

const TICK = 50;

const DOT = "1";
const DASH = "111";

const PADDING = "0";
const PADDING_CHAR = "000";
const PADDING_WORD = "0000000";

const output = document.querySelector(".blink");
let interval = null;

let message = "test message";

function getCharCode(letter) {
  let result = {
    morse: "",
    letter: "",
    displayText: "",
    stream: "",
  };

  if (letter === " ") {
    result.displayText = " ";
    result.morse = " ";
    result.letter = " ";
    result.stream = PADDING_WORD;
    return result;
  }

  letter = letter.toUpperCase();
  const charObj = CODE_TABLE.filter((e) => e.letter == letter);

  let outputStream = [];

  if (charObj && charObj[0]) {
    result.displayText = charObj[0].letter + " " + charObj[0].morseCode;
    result.morse = charObj[0].morseCode;
    result.letter = charObj[0].letter;

    code = charObj[0].morseCode;
    code.split("").map((elem) => {
      if (elem === "•") {
        outputStream.push(DOT);
      } else if (elem === "—") {
        outputStream.push(DASH);
      }
      outputStream.push(PADDING);
    });
    outputStream.pop();
    outputStream.push(PADDING_CHAR);
    result.stream = outputStream.join("");
  }
  return result;
}

function removeLastThreeChars(arr) {
  string = arr[arr.length - 1].stream;
  string = string.substring(0, string.length - 3);
  arr[arr.length - 1].stream = string;
  return string;
}

function encode(msg) {
  if (msg == undefined) {
    return;
  }
  let result = [];
  msg.split("").map((char) => {
    if (char === " ") {
      // remove 3 zeros in last character in stream
      removeLastThreeChars(result);
    }
    result.push(getCharCode(char));
  });
  removeLastThreeChars(result);
  // return stream.join('');
  return result;
}

const progressBar = document.querySelector("#progressBar");
const progressBarText = document.querySelector("#outputText");
const letterDisplay = document.querySelector("#character-display");

function transmit(message) {
  if (message == undefined) {
    return;
  }
  const streamArr = encode(message);
  console.log(streamArr);

  const msgLen = streamArr.length;
  let i = 0;
  let bits = streamArr[i].stream.split("");
  let elem = bits[0];
  letterDisplay.classList.remove("hide");
  letterDisplay.value = streamArr[i].displayText;
  audio.load();
  audio.play();
  if (interval != null) {
    console.log("Reset");
    i = 0;
    progressBar.classList.remove("complete");
    clearInterval(interval);
  }

  interval = setInterval(function () {
    if (i == streamArr.length) {
      // end
      output.classList.remove("on");
      audio.muted = true;
      letterDisplay.classList.add("hide");
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
        letterDisplay.value = streamArr[i].displayText;
        bits = streamArr[i].stream.split("");
        elem = bits[0];
      }
    }

    if (elem == 1) {
      output.classList.add("on");
      // audio.play();
      audio.muted = false;
    } else if (elem == 0) {
      output.classList.remove("on");
      audio.muted = true;
    }

    // update message processed percent
    if (msgLen > 0) {
      let processed = (i / msgLen) * 100;
      progressBarText.textContent = processed.toFixed(0) + "%";
      progressBar.style.flexGrow = `${processed / 100}`;
      progressBar.style.width = `${processed}%`;
      if (processed >= 99) {
        progressBar.classList.add("complete");
      }
    }
  }, TICK);
}

// parsing symbol table

function parseSymbolTable(htmlTable, symbolTable) {
  if (!symbolTable) {
    symbolTable = [];
  }
  const rows = htmlTable.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells == undefined || cells.length == 0) {
      return;
    }

    let obj = {
      letter: cells[0].textContent.trim().toUpperCase(),
      morseCode: cells[1].textContent.trim(),
    };

    symbolTable.push(obj);
  });

  return symbolTable;
}

const lettersTable = document.querySelector("#letters-table");
const polishLettersTable = document.querySelector("#letters-polish-table");
const numbersTable = document.querySelector("#numbers-table");

parseSymbolTable(lettersTable, CODE_TABLE);
parseSymbolTable(polishLettersTable, CODE_TABLE);
parseSymbolTable(numbersTable, CODE_TABLE);

const progressBarWrapper = document.querySelector(".progress-bar-wrapper");

function hideProgressBar() {
  progressBar.classList.remove("complete");
  progressBarWrapper.style.opacity = "0";
  progressBar.style.opacity = "0";
  progressBar.style.flexGrow = "0";
  progressBar.style.width = "0px";
  outputText.style.opacity = "0";
}

function showProgressBar() {
  progressBarWrapper.style.opacity = "1";
  progressBar.style.opacity = "1";
  outputText.style.opacity = "1";
}

// event listeners

const buttons = document.querySelectorAll(".btn");
const runButton = buttons[0];
const resetButton = buttons[1];
const downloadButton = buttons[2];

const audio = document.querySelector("#audio");
const messageTextarea = document.querySelector("#msg");

runButton.addEventListener("click", function (e) {
  e.preventDefault();
  let message = messageTextarea.value;
  if (message != "") {
    showProgressBar();
    transmit(message);
  }
});

resetButton.addEventListener("click", function (e) {
  e.preventDefault();
  clearInterval(interval);
  output.classList.remove("on");
  messageTextarea.value = "";
  letterDisplay.classList.add("hide");
  hideProgressBar();
});

downloadButton.addEventListener("click", (event) => {
  download(getFileName(), getFileContent());
});

function getFileContent() {
  let message = messageTextarea.value;
  // encode message, and convert to string
  const encodedMessageArr = encode(message);
  console.log(encodedMessageArr);

  let text = "";
  for (let character in encodedMessageArr) {
    let morseChar = encodedMessageArr[character].morse;
    // if space between words
    if (morseChar == " ") {
      // add two more spaces
      text += "  ";
    } else {
      // remove spaces between characters
      morseChar = morseChar.replace(/\s/g, "");
      text += morseChar;
      // add space at the end of a character code
      text += " ";
    }
  }

  return text;
}

function getFileName() {
  // filename format: morse-1-2-3--10-10-2021
  const date = new Date();
  let filename = "morse-";
  filename += date.getHours() + "-";
  filename += date.getMinutes() + "-";
  filename +=
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  filename += "--" + date.getDate() + "-";
  filename += date.getMonth() + 1;
  filename += "-" + date.getFullYear();
  filename += ".txt";

  return filename;
}

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

const navLinks = document.querySelectorAll(".nav a");

// navLinks.forEach((element) => {
// 	element.addEventListener('click', (e) => {
// 		e.preventDefault();
// 		if (e.target.hash !== '') {
// 			const target = document.querySelector(e.target.hash);
// 			target.scrollIntoView({
// 				behavior: 'smooth',
// 				block: 'start'
// 			});
// 		}
// 	});
// })

document.addEventListener("DOMContentLoaded", (e) => {
  hideProgressBar();
});
