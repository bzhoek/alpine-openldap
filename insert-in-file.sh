# $1=FILE, $2=LINE, $3=AFTER
grep -qxF $2 $1 || sed -i -E "s|($3)|\1\n$2|g" $1