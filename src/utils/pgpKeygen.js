const fs = require("fs");
const path = require("path");
const openpgp = require("openpgp");
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
let userId = {};
let numBits;
let passphrase;
let dir;
let key;

function ask (question) {
  return new Promise((res, rej) => {
    rl.question(question, answer => {
      res(answer);
    });
  });
}

function writeKey (filePath, fileKey, type) {
  return new Promise((res, rej) => {
    fs.writeFile(filePath, fileKey, err => {
      if (err) {
        rej(err);
      }
      console.log(`  Done writing ${type} to ${filePath}`);
      res();
    });
  });
}

console.log("======== PGP Key Pair Generator ========");
console.log("- Awaiting info...");
ask("  Name [Beat Saber Modding Group] : ").then(answer => {
  userId.name = answer || "Beat Saber Modding Group";
  return ask("  Email [bsmg@beatmods.com] : ");
}).then(answer => {
  userId.email = answer || "bsmg@beatmods.com";
  return ask("  Passphrase [q1w2e3r4t5y6] : ");
}).then(answer => {
  passphrase = answer || "q1w2e3r4t5y6";
  return ask("  4096 bits ? (More secure, slower) [yes] : ");
}).then(answer => {
  numBits = (answer.toLowerCase() === "n" || answer.toLowerCase() === "no") ? 2048 : 4096;
  return ask("  Output directory [./keys] : ");
}).then(answer => {
  dir = answer || path.join(__dirname, 'keys');
  rl.close();
  const genOptions = {
    userIds: [userId],
    numBits: numBits,
    passphrase: passphrase
  };
  console.log(`- Generating ${numBits} bits key pair with user ID ${userId.name} <${userId.email}>...`);
  return openpgp.generateKey(genOptions);
}).then(generated => {
  key = generated;
  console.log("- Writing keys...");
  return writeKey(path.join(dir, "privkey.asc"), key.privateKeyArmored, "private key");
}).then(() => {
  return writeKey(path.join(dir, "pubkey.asc"), key.publicKeyArmored, "public key");
}).then(() => {
  return writeKey(path.join(dir, "revcert.asc"), key.revocationCertificate, "revocation certificate");
}).then(() => {
  console.log("========================================");
}).catch(err => {
  console.error(err);
});
