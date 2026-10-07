const Express = require("express")
const Path = require("path")

const App = Express()
App.use(Express.static(Path.join(__dirname, "..", "Files", "Web")))

module.exports = App