const { Wallet } = require("fuels");

const wallet = Wallet.generate();

console.log("address", wallet.address.toString());
console.log("private key", wallet.privateKey);
// address fuel1pwl832rwy76efzv0mvxf8xwtx5h86kevy6ky642s5l3ngmv6t6rqsjgkke

