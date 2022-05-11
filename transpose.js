let crowd = "{PKCS5S2}MW+VUen5ZKtw2xxOljoZKS2A2XO8PTIA9bVMVmjHfy5bG8pXF41muDjOwjp4UBA1" // bvanderhoek
// {PBKDF2}10000$MW.VUen5ZKtw2xxOljoZKQ$LYDZc7w9MgD1tUxWaMd/Llsbylc

// let crowd = "{PKCS5S2}z8PmkI4YdDLzuCYpZhPNzJJFz3LmlSk4Vmvi44edGQ+eIhA5yF9Itl6DJM4cJiHc" // bad

let match = crowd.match(/{PKCS5S2}(.+)/)

const abase64 = (str) => str.toString('base64')
  .replaceAll('=', '')
  .replaceAll('+', '.')

if (match) {
  let buffer = Buffer.from(match[1], 'base64')
  let salt = buffer.slice(0, 16)
  let hash = buffer.slice(16)
  let hash20 = buffer.slice(16, 36) // only 20 bytes, https://github.com/hamano/openldap-pbkdf2/blob/master/pw-pbkdf2.c

  console.log(abase64(salt), salt.length, abase64(hash), hash.length)
  console.log(`$pbkdf2-sha1$i=10000,l=32$${abase64(salt)}$${abase64(hash)}`)
  console.log(`{PBKDF2}10000$${abase64(salt)}$${abase64(hash20)}`)
}
