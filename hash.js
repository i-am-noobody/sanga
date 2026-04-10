// hash.js
import bcrypt from "bcrypt";

const hash = await bcrypt.hash("admin", 10);
console.log(hash);