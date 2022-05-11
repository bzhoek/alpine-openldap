#!/usr/bin/env python3
import sys
from passlib.utils.binary import b64decode
from passlib.utils.binary import ab64_encode

credential = sys.argv[1]   # {PKCS5S2}U48fu6LonjKCk0VmHPsgLrKf1/i1o/wxLXblOTa6P8eXvvJTU4iRb0fpRlO3xA0J
credential = credential[9:]         # U48fu6LonjKCk0VmHPsgLrKf1/i1o/wxLXblOTa6P8eXvvJTU4iRb0fpRlO3xA0J
b64decode(credential)
salt = ab64_encode( b64decode(credential)[0:16] ).decode('ascii')
hash = ab64_encode( b64decode(credential)[16:48] ).decode('ascii')
final=f"{{PBKDF2}}10000${salt}${hash}"
print(final[:64])