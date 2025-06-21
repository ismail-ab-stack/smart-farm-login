document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
	const response = await fetch('http://backend:5000/login', {
  	method: 'POST',
  	headers: {
    	'Content-Type': 'application/json'
  	},
  	body: JSON.stringify({ username, password })
	});

	const result = await response.json();
	alert(result.message);
  } catch (error) {
	alert('Error connecting to backend');
	console.error(error);
  }
});
