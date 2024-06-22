document.getElementById('migp-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const serializedData = serializeUsernamePassword(username, password);
    console.log(serializedData);
    // TODO
    // queryMIGP('http://your-go-server.com', username, password)
    //   .then(data => console.log(data))
    //  .catch(error => console.error('Error:', error));
  });

  function serializeUsernamePassword(username, password) {
    // Convert username and password to Uint8Array if they are not already
    if (!(username instanceof Uint8Array)) username = new Uint8Array(username);
    if (!(password instanceof Uint8Array)) password = new Uint8Array(password);

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
