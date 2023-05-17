const { server } = require('./index');

const port = process.env.PORT || "8080";

server.listen(port, () => console.log(`app listening on port ${port}!`));