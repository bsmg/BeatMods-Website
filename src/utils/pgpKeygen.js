const fs = require("fs");
const path = require("path");
const openpgp = require("openpgp");
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

gen().catch(err => {throw err;});

function ask (question) {
  return new Promise(res => {
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

async function gen () {
  console.log("======== PGP Key Pair Generator ========");

  console.log("- Awaiting info...");
  let userId = {};
  userId.name = await ask("  Name [Beat Saber Modding Group] : ") || "Beat Saber Modding Group";
  userId.email = await ask("  Email [bsmg@beatmods.com] : ") || "bsmg@beatmods.com";
  const passphrase = await ask("  Passphrase [q1w2e3r4t5y6] : ") || "q1w2e3r4t5y6";
  let numBits = await ask("  4096 bits ? (More secure, slower) [yes] : ");
  numBits = numBits && (numBits.toLowerCase() === "n" || numBits.toLowerCase() === "no") ? 2048 : 4096;
  const dir = await ask("  Output directory [./keys] : ") || path.join(process.cwd(), "keys");
  rl.close();

  const genOptions = {
    userIds: [userId],
    numBits: numBits,
    passphrase: passphrase
  };
  console.log(`- Generating ${numBits} bits key pair with user ID ${userId.name} <${userId.email}>...`);
  const key = await openpgp.generateKey(genOptions);

  console.log("- Writing keys...");
  await writeKey(path.join(dir, "privkey.asc"), key.privateKeyArmored, "private key");
  await writeKey(path.join(dir, "pubkey.asc"), key.publicKeyArmored, "public key");
  await writeKey(path.join(dir, "revcert.asc"), key.revocationCertificate, "revocation certificate");

  console.log("========================================");
}
