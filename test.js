const FS = require("fs")
const Path = require("path")

const Express = require("express")
const HTTPS = require("https")

const VHost = require("vhost")
const BodyParser = require("body-parser")

const CA_CERT = Path.join(__dirname, 'Security', 'fake_ca.crt')

const App = Express()
App.use(BodyParser.urlencoded())
App.use(BodyParser.text())
App.use(BodyParser.text({ type: 'application/soap+xml' }))
App.use(BodyParser.raw({ verify: () => true, }))
App.use(Express.raw({ type: 'application/pkcs10', limit: '4mb' }))

App.use((Req, Res, Next) => {
    console.log(">>>", Req.method, Req.protocol + "://" + Req.hostname + Req.url)
    Object.entries(Req.headers).forEach(([name, value]) => console.log(`${name}: ${value}`))

    if ((Req.body ?? Req.rawBody) !== undefined) {
        console.log("")
        console.log(Req.body ?? Req.rawBody)
    }

    Res.setHeader("Server", "ReWP/1.0")
    
    Next()
})

// services
const Services = JSON.parse(FS.readFileSync(Path.join(__dirname, "Services", "List.json")))
Services.forEach(Service => {
    try {
        const ServiceApp = require(Path.join(__dirname, "Services", Service.name))
        Service.domains.forEach(Domain => App.use(VHost(Domain, ServiceApp)))
    } catch (E) {
        console.warn(`Unable to load ${Service.name}:`, E.message)
    }
})

// error
App.use((Req, Res) => {
    if (!Req.error) Req.error = { error: 404, message: `Cannot ${Req.method.toUpperCase()} ${Req.path} in ${Req.hostname}.`, code: `NO_URL_IN_DOMAIN` };
    
    Res.status(Req.error.error)

    if (Req.accepts("text/html")) Res.send(Req.error.message)
    else Res.send(Req.error)
})

App.listen(80, "0.0.0.0")

const SecureApp = HTTPS.createServer({
    key: FS.readFileSync(Path.join(__dirname, "Security", "leaf.key")),
    cert: FS.readFileSync(Path.join(__dirname, "Security", "leaf.crt")),
    ca: FS.readFileSync(Path.join(CA_CERT)),
}, App)

SecureApp.listen(443, "0.0.0.0")