const http = require('http');
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'admin@skillswap.com', password: 'password'})
}).then(res => res.text()).then(console.log);