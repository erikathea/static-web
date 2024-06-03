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
        const response = await fetch(`/api/httpTrigger1`);
        const data = await response.json();
        document.querySelector('#name').textContent = data.text;
    } catch (error) {
        console.error('Error:', error);
    }
})();