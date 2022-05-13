# OpenLDAP

Alpine [based](https://pkgs.org/search/?q=openldap) OpenLDAP image with MDB backend and [PKCS#5V2 PBKDF2 support](https://git.openldap.org/openldap/openldap/-/tree/master/contrib/slapd-modules/passwd/pbkdf2)

Installs to
* `/usr/sbin` slap* tools
* `/etc/openldap` configuration
* `/usr/lib/openldap` custom modules

```shell
brew install openjdk@11
brew install apache-directory-studio

docker build -t openldap .
docker run -p 1389:389 openldap
```

## PBKDF2
https://dev.to/demg_dev/pbkdf2-hash-a-secure-password-5f8l

```shell
docker exec -it openldap /bin/sh
slappasswd -o module-load=pw-pbkdf2 -h {PBKDF2} -s secret
{PBKDF2}10000$a1jDWxDAO/trBpldzroSJg$eSAC8TRnG5adrwHHKHscek0445w
  
vi /etc/openldap/slapd.conf
slapd -d 32767 -u ldap -g ldap
```

https://github.com/hamano/openldap-pbkdf2/blob/master/pw-pbkdf2.c
https://git.openldap.org/openldap/openldap/-/blob/master/contrib/slapd-modules/passwd/pbkdf2/pw-pbkdf2.c
Salt size is always 16 bytes, but DK? size varies from 20 for SHA-128 to 64 for SHA-512.

## Crowd

`credential` in `cwd_user` contains the salt and hash concatenated as a base64 string. The first 16 bytes are the salt, the remaining 32 the hash.

Password: CALYX-zippy-whiten-pinhead
   Crowd: {PKCS5S2}MW+VUen5ZKtw2xxOljoZKS2A2XO8PTIA9bVMVmjHfy5bG8pXF41muDjOwjp4UBA1
OpenLDAP: {PBKDF2}10000$MW.VUen5ZKtw2xxOljoZKQ$LYDZc7w9MgD1tUxWaMd/Llsbylc

https://kaosktrl.wordpress.com/2014/04/28/export-crowd-users-and-groups-to-ldap/
https://www.redradishtech.com/display/KB/Migrating+JIRA+users+to+LDAP%2C+preserving+passwords
https://web.archive.org/web/20081024045702/http://www.rsa.com/rsalabs/node.asp?id=2127

## Helpers
`insert-in-file.sh` circumvents an Ash shell limitation that doesn't allow multiple environment variables to be passed on the command-line. In Bash, the following would work:

```
RUN FILE="/etc/openldap/slapd.conf" LINE="moduleload\tpasswd-pbkdf2" AFTER="# Load dynamic backend modules:" grep -qxF $LINE $FILE || sed -E 's|($AFTER)|\1\n$LINE|g' $FILE
```