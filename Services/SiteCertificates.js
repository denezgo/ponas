const Express = require("express")
const Path = require("path")

const App = Express()
App.get("/certs/ca", (Req, Res) => {
    Res.sendFile(Path.join(__dirname, "..", "Security", "fake_ca.crt"))
})
App.get("/certs/sign", (Req, Res) => {
    Res.sendFile(Path.join(__dirname, "..", "Security", "sign_ca.crt"))
})

module.exports = App