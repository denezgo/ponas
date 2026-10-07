const FS = require("fs")
const Path = require("path")

const Express = require("express")
const Xml2Js = require('xml2js')

const Xml = new Xml2Js.Builder({
    xmldec: { version: '1.0', encoding: 'utf-8', },
    renderOpts: { pretty: true, indent: '  ', },
    rootName: "ClientManifest",
})

// services
const Services = JSON.parse(FS.readFileSync(Path.join(__dirname, "List.json")))

const Endpoints = { Endpoint: [] }
const TimeToLive = "P1D" // ...

Services.forEach(Service => {
  if (Service.monikers != undefined)
    Service.monikers.forEach(Moniker => 
      Endpoints.Endpoint.push({ $: {Moniker: Moniker.name, BaseUri: Moniker.baseuri ?? `http${Moniker.isSecure ? "s" : ""}://${Service.domains[0]}/`, TimeToLive} }))
})

const ManifestRaw = {
  $: {Timestamp: (new Date()).toISOString(), xmlns: "http://schemas.microsoft.com/Wps/2011/Nexus/ClientManifest", "xmlns:xsd": "http://www.w3.org/2001/XMLSchema", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"},
  Endpoints,
}

const Manifest = Xml.buildObject(ManifestRaw)

const App = Express()
App.all('/manifest', (Req, Res) => {
    Res
        .type("xml")
        .setHeader('Cache-Control', 'public, max-age=86400')
        .send(Manifest)
})

module.exports = App