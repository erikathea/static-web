document.getElementById('migp-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // TODO
    // queryMIGP('http://your-go-server.com', username, password)
    //   .then(data => console.log(data))
    //  .catch(error => console.error('Error:', error));
  });


(async function() {
    try {
        const cs_get_response = await fetch('https://cs-az-func.azurewebsites.net/api/HttpTrigger1');
        const get_resp = await cs_get_response.json();
        document.querySelector('#cs-func-get').textContent = get_resp.text;

        const cs_post_response = await fetch('https://cs-az-func.azurewebsites.net/api/HttpTrigger1', {
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