# OpenLDAP

Alpine [based](https://pkgs.org/search/?q=openldap) OpenLDAP image with MDB backend and [PKCS#5V2 PBKDF2 support](https://git.openldap.org/openldap/openldap/-/tree/master/contrib/slapd-modules/passwd/pbkdf2)

Installs to
* `/usr/sbin` slap* tools
* `/etc/openldap` configuration
* `/usr/lib/openldap` custom modules

```shell
docker build -t openldap .
docker run -p 1389:389 openldap
```

## Import LDIF

```shell
ldapadd -x -H "ldap://localhost:1389" -D "cn=Manager,dc=ripe,dc=net" -W -f import.ldif
ldapsearch -x -H "ldap://localhost:1389" -b "dc=ripe,dc=net" "+"
# Manager, ripe.net
dn: cn=Manager,dc=ripe,dc=net
structuralObjectClass: organizationalRole
entryUUID: 41635933-d904-4e59-b812-9606d85a0481
creatorsName: cn=Manager,dc=ripe,dc=net
createTimestamp: 20220516091357Z
entryCSN: 20220516091357.950189Z#000000#000#000000
modifiersName: cn=Manager,dc=ripe,dc=net
modifyTimestamp: 20220516091357Z
entryDN: cn=Manager,dc=ripe,dc=net
subschemaSubentry: cn=Subschema
hasSubordinates: FALSE
```

### UUID

Can only be imported directly with [`slapadd`](https://linux.die.net/man/8/slapadd); `ldapadd` returns ` entryUUID: no user modification allowed`. This could be circumvented with the 'Relax Rules Control' that OpenLDAP supports.

```
slapadd -v -l import.ldif

dn: cn=user,dc=ripe,dc=net
objectClass: organizationalRole
cn: user
entryUUID: 19cb4a6f-d04e-43a3-929c-a851bc216378
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
          {SSHA}fm0etP9j2tej3FjmFpyK7ZeYuVCMsOo2YUwgtQ==
OpenLDAP: {PBKDF2}10000$MW.VUen5ZKtw2xxOljoZKQ$LYDZc7w9MgD1tUxWaMd/Llsbylc

* https://kaosktrl.wordpress.com/2014/04/28/export-crowd-users-and-groups-to-ldap/
* https://www.redradishtech.com/display/KB/Migrating+JIRA+users+to+LDAP%2C+preserving+passwords
* https://web.archive.org/web/20081024045702/http://www.rsa.com/rsalabs/node.asp?id=2127

## Directory Studio

```shell
brew install openjdk@11
brew install apache-directory-studio
```

1. File, New, LDAP Connection, Hostname: localhost, Port: 1389, Check Network Parameters, Next
2. Bind DN or user: cn=Manager,dc=my-domain,dc=com, Bind password: secret, Check Authentication, Finish.

## Helpers
`insert-in-file.sh` circumvents an Alpine's Ash shell limitation that doesn't allow multiple environment variables to be passed on the command-line. In Bash, the following would work:

```
RUN FILE="/etc/openldap/slapd.conf" LINE="moduleload\tpasswd-pbkdf2" AFTER="# Load dynamic backend modules:" grep -qxF $LINE $FILE || sed -E 's|($AFTER)|\1\n$LINE|g' $FILE
```