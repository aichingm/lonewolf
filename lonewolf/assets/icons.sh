#!/bin/bash

ICONS=$(grep -RiP --no-filename --only-matching "fluent:[0-9a-zA-Z-_]*" ../components ../views | sort -u)

OUT=icons.ts

echo "const icons: { [key: string]: string; } = {" > $OUT

for I in $ICONS; do
    echo -n '  "'$I'":' "'" >> $OUT
    curl https://api.iconify.design/$(echo $I| sed -e 's#:#/#').svg | xmllint --xpath "/*/*" - | tr -d "\n" >> $OUT
    echo "'," >> $OUT
done;
echo "};" >> $OUT
echo "export default icons" >> $OUT
