FROM alpine:3.14
EXPOSE 389

RUN apk add --no-cache openldap openldap-back-mdb openldap-passwd-pbkdf2
RUN sed -i -E 's|# (moduleload\s+back_mdb).+|\1|g' /etc/openldap/slapd.conf

RUN mkdir -p /var/lib/openldap/run/
RUN chown ldap:ldap /var/lib/openldap/run/

COPY insert-in-file.sh /insert-in-file.sh
RUN sh /insert-in-file.sh "/etc/openldap/slapd.conf" "moduleload\tpw-pbkdf2" "# Load dynamic backend modules:"
RUN sh /insert-in-file.sh "/etc/openldap/slapd.conf" "include\t/etc/openldap/schema/cosine.schema" "include.+/etc/openldap/schema/core.schema"
RUN sh /insert-in-file.sh "/etc/openldap/slapd.conf" "include\t/etc/openldap/schema/inetorgperson.schema" "include.+/etc/openldap/schema/cosine.schema"

CMD slapd -d 32767 -u ldap -g ldap
