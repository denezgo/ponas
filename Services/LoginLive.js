const Express = require("express")

const App = Express()
// TODO: FIND
App.get("/ppsecure/InlineConnect.srf", (Req, Res, Next) => {
    if (!(Req.query.id == 80601 && Req.query.Platform == "Phone8.1")) { Req.error = { error: 405, message: `Not supported client.`, code: `NOT_SUPPORTED` }; Next(); }
    else Res.send(`helpmepls`)
})
App.get("/ppsecure/post.srf", (Req, Res, Next) => Res.send(`great`))

module.exports = App