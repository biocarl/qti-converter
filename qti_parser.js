function parseQTIContent(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    let output = '';

    // Iterate through each question item
    const items = xmlDoc.getElementsByTagName('item');
    for (let item of items) {
        const title = item.getAttribute('title');
        let questionText = item.querySelector('material mattext').textContent;
        const points = item.querySelector('outcomes decvar')?.getAttribute('maxvalue') || 'Unknown';

        output += "<div class='question'>\n";
        output += `Question Title: ${title}\n`;
        // output += `Points: <strong>${points}</strong>\n`;
        output += `Question Text: <span class="copy">${questionText}</span>\n`;
        output += "</div>\n";



        output += "<div class='answer'>\n";
        const questionType = item.querySelector('qtimetadatafield fieldentry').textContent;
        if (questionType.includes('multiple_choice')) {
            const correctAnswerId = item.querySelector('respcondition conditionvar varequal').textContent;

            // Iterate through the answers
            const responseLabels = item.getElementsByTagName('response_label');
            for (let label of responseLabels) {
                const answerId = label.getAttribute('ident');
                let answerText = label.querySelector('mattext').textContent;
                const correctMark = (answerId === correctAnswerId) ? 'x' : ' ';
                output += `[${correctMark}] <span class="copy">${answerText}</span>\n`;
            }
        } else if(questionType.includes('essay')){
            output +="Upload code/response as text here.";
        } else if (questionType.includes('cc.fib.v0p1')){
            const correctAnswers = item.querySelectorAll('respcondition conditionvar varequal');
            output += 'Enter a value, with the following correct answers:\n';
            correctAnswers.forEach((answer) => {
                output += `- ${answer.textContent}\n`;
            });
        } else if (questionType.includes('true_false')) {
            const correctAnswerId = item.querySelector('respcondition conditionvar varequal').textContent;
            const responseLabels = item.getElementsByTagName('response_label');
            for (let label of responseLabels) {
                const answerId = label.getAttribute('ident');
                let answerText = label.querySelector('mattext').textContent;
                const correctMark = (answerId === correctAnswerId) ? 'x' : ' ';
                output += `[${correctMark}] <span class="copy">${answerText}</span>\n`;
            }
        } else if (questionType.includes('multiple_answers')) {
            const responseLabels = item.getElementsByTagName('response_label');
            console.log(responseLabels);
            for (let label of responseLabels) {
                const answerId = label.getAttribute('ident');
                let answerText = label.querySelector('mattext').textContent;
                // Check if this answerId is listed in the correct answers
                const correctAnswers = item.querySelectorAll('respcondition conditionvar and > varequal ');
                const isCorrect = Array.from(correctAnswers).some(answer => answer.textContent === answerId);
                const correctMark = isCorrect ? 'x' : ' ';
                output += `[${correctMark}] <span class="copy">${answerText}</span>\n`;
            }
        }else{
            output +="Not covered: " + questionType + "\n";
        }
        output += "</div>\n";

        output += '\n';
    }

    return output;
}

function parseUploadedFiles() {
    const files = document.getElementById('fileInput').files;
    if (files.length === 0) {
        alert('No files selected!');
        return;
    }

    document.getElementById('output').textContent = ''; // Clear previous output

    // Sparking fun
        document.getElementById('output').addEventListener('click', function(e) {
            const spark = document.createElement('div');
            spark.classList.add('spark');
            spark.innerHTML = "";
            spark.style.height = "60px";
            spark.style.width = "60px";
            spark.style.left = e.pageX + 'px';
            spark.style.top = e.pageY + 'px';
            document.body.appendChild(spark);

            setTimeout(() => {
                spark.remove();
            }, 1000);
        });

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const fileOutput = `File: ${file.name}\n${parseQTIContent(content)}\n`;
            document.getElementById('output').innerHTML += fileOutput;

            // Select all elements with the class 'copy'
            const copyElements = document.querySelectorAll('.copy');
            copyElements.forEach(element => {
                element.addEventListener('click', () => {
                    navigator.clipboard.writeText(element.textContent).then(() => {
                        element.style.color = "hotpink";
                        console.log('clip: ' + element.textContent);
                    }).catch(err => {
                        console.error('Error in copying text: ', err);
                    });
                });
            });
        };
        reader.readAsText(file);
    }
}

