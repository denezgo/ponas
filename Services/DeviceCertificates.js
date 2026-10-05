const Express = require("express")

const FS = require("fs")
const Path = require("path")
const Forge = require('node-forge')

const SIGN_CA_CERT = Path.join(__dirname, '..', 'Security', 'sign_ca.crt')
const SIGN_CA_KEY = Path.join(__dirname, '..', 'Security', 'sign_ca.key')

const rootCertPem = FS.readFileSync(SIGN_CA_CERT, 'utf8');
const rootKeyPem = FS.readFileSync(SIGN_CA_KEY, 'utf8');

const rootCert = Forge.pki.certificateFromPem(rootCertPem);
const rootPrivateKey = Forge.pki.privateKeyFromPem(rootKeyPem);

const App = Express()
App.post('/certificaterequest', (req, res) => {
    try {
        const rawBuffer = req.body;
        
        if (!rawBuffer || rawBuffer.length === 0) {
            return res.status(400).send("Empty CSR body");
        }

        console.log(`\n=== Получен запрос на сертификат от Lumia ===`);

        let base64Text = rawBuffer.toString('utf8');
        
        base64Text = base64Text.replace(/[\r\n\s]/g, '');

        const derString = Forge.util.decode64(base64Text);
        
        const forgeBuffer = Forge.util.createBuffer(derString);
        const asn1Obj = Forge.asn1.fromDer(forgeBuffer);
        
        const csr = Forge.pki.certificationRequestFromAsn1(asn1Obj);

        if (!csr.verify()) {
            throw new Error('CSR signature validation failed');
        }

        const deviceCert = Forge.pki.createCertificate();
        deviceCert.serialNumber = Math.floor(Math.random() * 1000000000).toString(16);
        
        const notBefore = new Date();
        notBefore.setDate(notBefore.getDate() - 7);
        const notAfter = new Date();
        notAfter.setFullYear(notAfter.getFullYear() + 1);

        deviceCert.validity.notBefore = notBefore;
        deviceCert.validity.notAfter = notAfter;

        deviceCert.publicKey = csr.publicKey;
        deviceCert.setSubject(csr.subject.attributes);
        deviceCert.setIssuer(rootCert.subject.attributes);

        deviceCert.setExtensions([
            {
                name: 'keyUsage',
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true,
                critical: true
            },
            {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true,
                '1.3.6.1.4.1.311.71.1.1': true,
                '1.3.6.1.4.1.311.71.1.2': true,
                '1.3.6.1.4.1.311.71.1.6': true,
                '1.3.6.1.4.1.311.10.3.3': true,
                '2.16.840.1.113730.4.1': true,
                critical: true
            }
        ]);

        deviceCert.sign(rootPrivateKey, Forge.md.sha1.create());

        const p7 = Forge.pkcs7.createSignedData();
        p7.addCertificate(deviceCert);
        p7.addCertificate(rootCert);

        const p7Asn1 = p7.toAsn1();
        const p7DerBytes = Forge.asn1.toDer(p7Asn1).getBytes();
        const p7Base64 = Forge.util.encode64(p7DerBytes);

        FS.writeFileSync(Path.join(__dirname, "Certs", `${Date.now()}.ans1`), p7DerBytes)

        res.set({
            'Content-Type': 'application/x-pkcs7-certificates',
            'Content-Transfer-Encoding': 'base64',
            'Connection': 'Keep-Alive'
        });

        res.status(200).send(p7Base64);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
})

module.exports = App