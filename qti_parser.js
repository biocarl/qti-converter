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
        output += `Question Text: ${questionText}\n`;
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
                const correctMark = (answerId === correctAnswerId) ? 'x' : '';
                output += `[${correctMark}] ${answerText}\n`;
            }
        } else if(questionType.includes('essay')){
            output +="Upload code/response as text here.";
        } else if (questionType.includes('cc.fib.v0p1')){
            const correctAnswers = item.querySelectorAll('respcondition conditionvar varequal');
            output += 'Enter a value, with the following correct answers:\n';
            correctAnswers.forEach((answer) => {
                output += `- ${answer.textContent}\n`;
            });
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

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const fileOutput = `File: ${file.name}\n${parseQTIContent(content)}\n`;
            document.getElementById('output').innerHTML += fileOutput;
        };
        reader.readAsText(file);
    }
}