document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting normally

        const usernameField = form.querySelector('.username');
        const username = usernameField ? usernameField.value : null;
        const password = form.querySelector('.password').value;
        const serializedData = serializeUsernamePassword(username, password);
        const base64Data = arrayBufferToBase64(serializedData);
        const statusElement = form.querySelector('.status');
        const loglikelihoodElement = form.querySelector('.log-likelihood');
        
        if (form.classList.contains('migp-form')) {
            sendSerializedData(base64Data, 'https://cs-az-func-migp.azurewebsites.net/api/migpQuery', statusElement);
        } else if (form.classList.contains('migp2-form')) {
            sendSerializedData(base64Data, 'https://cs-az-func-migp.azurewebsites.net/api/migpQuery2', statusElement);
            callPagPassGPT(password, loglikelihoodElement);
        } else if (form.classList.contains('pagpassgpt')) {
            callPagPassGPT(password, loglikelihoodElement);
        }
        
        testSerializeFunction(serializedData);
    });
});

function callPagPassGPT(password, statusElement) {
    fetch(`https://ml-az-func.azurewebsites.net/hello?password=${encodeURIComponent(password)}`)
        .then(response => response.json())
        .then(data => {
            if (statusElement) {
                console.log(data)
                let similarityStatus;
                const logLikelihood = parseFloat(data.log_likelihood); 
                if (logLikelihood < 2.0) {
                    similarityStatus = 'very similar';
                } else if (logLikelihood >= 2.0 && logLikelihood < 3.25) {
                    similarityStatus = 'similar';
                } else if (logLikelihood >= 3.25 && logLikelihood <= 4.0) {
                    similarityStatus = 'fairly similar';
                } else {
                    similarityStatus = 'outliers';
                }
                statusElement.textContent = `${similarityStatus} (${logLikelihood})`;

                const pw_variants = data.variants;
                const variantsElement = document.querySelector('.password-variants');
                
                if (variantsElement) {
                    variantsElement.innerHTML = '';

                    const variantsList = document.createElement('ul');
                    pw_variants.forEach(variant => {
                        const listItem = document.createElement('li');
                        listItem.textContent = variant; 
                        variantsList.appendChild(listItem); 
                    });

                    variantsElement.appendChild(variantsList);
                }
            }
        })
        .catch(error => {
            console.error('Error calling PagPassGPT:', error);
            if (statusElement) {
                statusElement.textContent = 'Error calling PagPassGPT';
            }
        });
}

function serializeUsernamePassword(username, password) {
    // Convert username and password to Uint8Array using TextEncoder
    if (!(username instanceof Uint8Array)) username = new TextEncoder().encode(username);
    if (!(password instanceof Uint8Array)) password = new TextEncoder().encode(password);

    if (username.length > (1 << 16) || password.length > (1 << 16)) {
        throw new Error("Length overflow");
    }

    let buf = new Uint8Array(4 + username.length + password.length);
    let view = new DataView(buf.buffer);

    // Write the length of username and password in big endian format
    view.setUint16(0, username.length, false); // false for big endian
    buf.set(username, 2);
    view.setUint16(2 + username.length, password.length, false);
    buf.set(password, 4 + username.length);

    return buf;
}

function sendSerializedData(serializedData, url, statusElement) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream' // Set the content type as binary data
        },
        body: serializedData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        statusElement.innerText = data.status;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function testSerializeFunction(serializedData) {
    // Verify the result by inspecting the buffer contents
    const view = new DataView(serializedData.buffer);
    const usernameLength = view.getUint16(0, false); // false for big endian
    const passwordLength = view.getUint16(2 + usernameLength, false);

    console.log(serializedData);
    console.log("Username Length:", usernameLength);
    console.log("Password Length:", passwordLength);

    const usernameArray = serializedData.slice(2, 2 + usernameLength);
    const passwordArray = serializedData.slice(4 + usernameLength);

    console.log("Username Array:", new TextDecoder().decode(usernameArray));
    console.log("Password Array:", new TextDecoder().decode(passwordArray));
}

document.querySelectorAll('.password').forEach(passwordInput => {
    const charCount = passwordInput.nextElementSibling;
    passwordInput.addEventListener('input', function() {
        const remainingChars = 32 - this.value.length;
        charCount.textContent = `${this.value.length} / 32`;
        
        if (remainingChars < 0) {
            this.value = this.value.slice(0, 32);
            charCount.textContent = '32 / 32';
        }
    });
});

(async function() {
    try {
        // Perform a GET request
        const cs_get_response = await fetch('https://cs-az-func-migp.azurewebsites.net/api/HttpTrigger1');
        if (!cs_get_response.ok) {
            throw new Error(`HTTP error! Status: ${cs_get_response.status}`);
        }
        const get_resp = await cs_get_response.json();
        document.querySelector('#cs-func-get').textContent = get_resp.text;

        // Perform a POST request
        const cs_post_response = await fetch('https://cs-az-func-migp.azurewebsites.net/api/HttpTrigger1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'world' })
        });

        if (!cs_post_response.ok) {
            throw new Error(`HTTP error! Status: ${cs_post_response.status}`);
        }
        const post_resp = await cs_post_response.json();
        document.querySelector('#cs-func-post').textContent = post_resp.text;
    } catch (error) {
        console.error('Error:', error);
    }
})();
